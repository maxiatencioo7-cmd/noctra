/**
 * /api/acceso
 *
 * Contesta dos preguntas que la app no puede contestar sola:
 *
 *   1. ¿Esta persona compró el pack "Cuándo, Dónde y Cómo"?
 *   2. ¿Desde qué ciudad está entrando?
 *
 * Por qué del lado del servidor y no en localStorage:
 *   Si el desbloqueo viviera en el teléfono, alcanzaría con abrir la consola
 *   y escribir una línea para tener el pack gratis. Y al revés —lo que pasa
 *   mucho más seguido— quien lo compró y después borró los datos del sitio,
 *   o entró desde otro teléfono, se quedaría sin lo que pagó. La respuesta
 *   la da Shopify, que es el único que sabe de verdad quién pagó.
 *
 * Sin base de datos a propósito: se le pregunta a Shopify por las órdenes
 * recientes y se busca el código de perfil entre sus note_attributes. A este
 * volumen (decenas de órdenes por día) una sola llamada alcanza, y se cachea
 * un minuto para que abrir la app diez veces no sean diez llamadas.
 *
 * Tres formas de identificarse, en orden de preferencia:
 *   p=<código de perfil>  — automática, viaja con el checkout y con el mail
 *   e=<email>&o=<#orden>  — manual, para el que perdió los datos del sitio
 *   c=<código>            — manual de Maxi, para regalos y soporte
 *
 * Nunca devuelve datos del comprador: sólo ok/no, y la ciudad de la IP.
 * Sin credenciales de Shopify cargadas devuelve acceso:false y motivo
 * "sin_token", nunca true: si algo se rompe, el pack queda cerrado, no
 * abierto.
 *
 * Credenciales (ver tokenAdmin): SHOPIFY_API_KEY + SHOPIFY_API_SECRET de la
 * app del Dev Dashboard, o un SHOPIFY_ADMIN_TOKEN suelto si alguna vez hay
 * uno.
 */

export const config = { runtime: 'edge' };

const TIENDA  = (process.env.SHOPIFY_SHOP || 'noctralmagemela.myshopify.com').trim();
const API     = process.env.SHOPIFY_API_VERSION || '2024-10';
/* Qué abre cada producto. Son tres, y cada uno abre distintas secciones
   del plan:

     fecha  -> seccion 1 (La fecha)
     lugar  -> secciones 2 y 3 (El lugar, En tu ciudad)
     senal  -> secciones 4 y 5 (La senal, Por que vos) — solo en el pack

   El pack abre las tres. Cada variante se configura por separado para que
   agregar un producto manana no obligue a tocar el codigo. Varias variantes
   por producto van separadas por coma (sirve para cuando se cambia el precio
   creando una variante nueva y hay compradores viejos con la anterior). */
function ids(v) { return String(v || '').split(',').map(s => s.trim()).filter(Boolean); }

const VARIANTES = {
  /* Los tres llevan el ID escrito como respaldo. La variable de entorno
     sigue mandando si esta cargada —sirve para agregar una variante nueva
     sin tocar el codigo— pero si falta, el producto igual se reconoce.
     Antes fecha y lugar dependian SOLO de la variable: si no estaba puesta
     en Vercel, alguien pagaba y no recibia nada, sin ningun error visible.
     Un cobro que no entrega es el peor modo de fallar que puede tener esto. */
  fecha: ids(process.env.VARIANTE_FECHA || '50411348000982'),
  lugar: ids(process.env.VARIANTE_LUGAR || '50411352817878'),
  /* PACK_VARIANT_IDS se sigue leyendo con el nombre viejo para no romper lo
     que ya esta cargado en Vercel. */
  pack:  ids(process.env.VARIANTE_PACK || process.env.PACK_VARIANT_IDS || '50408908652758'),
  /* La senal suelta, el downsell. Sin ID cargado no reconoce nada: no hay
     respaldo escrito a proposito, porque una variante inventada abriria
     una seccion a quien no pago. Se carga VARIANTE_SENAL en Vercel con el
     ID real y desde ahi funciona. */
  senal: ids(process.env.VARIANTE_SENAL || '50520637472982'),
};

/* Que partes abre cada producto.

   'senal' y 'vos' son dos llaves distintas a proposito. Hasta el
   22/09/2026 una sola llave abria las dos secciones, asi que vender La
   senal suelta habria regalado tambien Por que vos, que es una de las dos
   que sostienen el precio del pack. */
const ABRE = {
  fecha: ['fecha'],
  lugar: ['lugar'],
  senal: ['senal'],
  pack:  ['fecha', 'lugar', 'senal', 'vos'],
};
/* Códigos que Maxi puede repartir a mano (regalos, soporte, reposiciones). */
const MANUALES = (process.env.ACCESO_CODIGOS || '')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
/* Cuántos días hacia atrás mirar. Shopify devuelve 250 por página; a este
   volumen 90 días entran de sobra en una sola. */
const DIAS = parseInt(process.env.ACCESO_DIAS || '120', 10);

/* ─── ciudad por IP ────────────────────────────────────────────────── */
/* Vercel resuelve la geolocalización en el borde y la mete en headers. Es
   gratis, no agrega latencia y no manda la IP a ningún tercero.
   Los valores vienen percent-encoded cuando tienen acentos ("Rosario" bien,
   "Córdoba" como "C%C3%B3rdoba"). */
function geo(request) {
  const h = (n) => {
    const v = request.headers.get(n);
    if (!v) return '';
    try { return decodeURIComponent(v).trim(); } catch (e) { return v.trim(); }
  };
  const ciudad = h('x-vercel-ip-city');
  return {
    ciudad,
    region: h('x-vercel-ip-country-region'),
    pais: h('x-vercel-ip-country'),
    /* En celular con CGNAT muchas veces no hay ciudad, sólo país. Se avisa
       para que la app pueda pedirla en el perfil en vez de mentir. */
    exacta: !!ciudad,
  };
}

/* ─── Shopify ──────────────────────────────────────────────────────── */
let cache = { t: 0, ordenes: null };
let tk = { valor: '', vence: 0 };

/* El token de la Admin API.
 *
 * Dos caminos, y el primero que esté configurado gana:
 *
 *   1. SHOPIFY_ADMIN_TOKEN — un "shpat_" pegado a mano. Es lo que daban las
 *      apps personalizadas del admin viejo. Shopify las discontinuó, así que
 *      queda sólo por compatibilidad.
 *
 *   2. SHOPIFY_API_KEY + SHOPIFY_API_SECRET — las credenciales de la app del
 *      Dev Dashboard. Con ellas se pide un token con el "client credentials
 *      grant", que Shopify habilita para apps que actúan sobre tiendas de la
 *      propia organización. No hay que copiar ningún token a mano y, cuando
 *      vence, se renueva solo.
 *
 * El token vive en memoria de la función, no en disco: si Vercel recicla la
 * instancia se vuelve a pedir, que cuesta una llamada. */
/* Copiar una credencial de un panel a otro arrastra espacios y tabuladores
   con una facilidad asombrosa, y Shopify los manda tal cual: un tabulador
   invisible adelante del ID devuelve "application_cannot_be_found", que
   parece un problema de permisos y no lo es. Se limpian acá y listo. */
function limpio(v) { return String(v || '').trim(); }

export async function tokenAdmin() {
  const directo = limpio(process.env.SHOPIFY_ADMIN_TOKEN);
  if (directo) return { token: directo };

  const id = limpio(process.env.SHOPIFY_API_KEY);
  const secreto = limpio(process.env.SHOPIFY_API_SECRET);
  if (!id || !secreto) return { error: 'sin_token' };

  /* un minuto de margen antes del vencimiento real */
  if (tk.valor && Date.now() < tk.vence - 60000) return { token: tk.valor };

  /* Shopify acepta el cuerpo como JSON o como formulario según el endpoint y
     la versión; se prueban los dos antes de darlo por perdido. */
  const cuerpos = [
    { tipo: 'application/json',
      body: JSON.stringify({ client_id: id, client_secret: secreto, grant_type: 'client_credentials' }) },
    { tipo: 'application/x-www-form-urlencoded',
      body: 'grant_type=client_credentials&client_id=' + encodeURIComponent(id)
            + '&client_secret=' + encodeURIComponent(secreto) },
  ];

  let ultimo = '';
  for (let i = 0; i < cuerpos.length; i++) {
    try {
      const res = await fetch('https://' + TIENDA + '/admin/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': cuerpos[i].tipo, Accept: 'application/json' },
        body: cuerpos[i].body,
      });
      const texto = await res.text();
      if (!res.ok) {
        /* El cuerpo del error de Shopify no trae credenciales: dice cosas como
           "invalid_client" o "application_cannot_be_found". Se guarda para
           poder diagnosticar sin tener que mirar los logs de Vercel. */
        ultimo = res.status + ' ' + texto.replace(/\s+/g, ' ').slice(0, 160);
        console.warn('[acceso] client_credentials ' + ultimo);
        continue;
      }
      let j = {};
      try { j = JSON.parse(texto); } catch (e) {}
      if (!j.access_token) { ultimo = 'ok pero sin access_token'; continue; }
      /* Shopify devuelve expires_in en segundos; si no viene, se asume una hora */
      const dura = (parseInt(j.expires_in, 10) || 3600) * 1000;
      tk = { valor: j.access_token, vence: Date.now() + dura };
      return { token: tk.valor };
    } catch (e) {
      ultimo = 'fetch: ' + (e && e.message);
      console.warn('[acceso] client_credentials falló ' + ultimo);
    }
  }
  return { error: 'credenciales', detalle: ultimo,
           largoId: id.length, largoSecreto: secreto.length };
}

async function ordenes() {
  const t = await tokenAdmin();
  if (t.error) return { error: t.error, detalle: t.detalle,
                        largoId: t.largoId, largoSecreto: t.largoSecreto };
  const token = t.token;
  if (cache.ordenes && Date.now() - cache.t < 60000) return { lista: cache.ordenes };

  const desde = new Date(Date.now() - DIAS * 86400000).toISOString();
  const url = 'https://' + TIENDA + '/admin/api/' + API + '/orders.json'
    + '?status=any&limit=250&created_at_min=' + encodeURIComponent(desde)
    + '&fields=id,name,email,financial_status,note_attributes,line_items,created_at,test';

  try {
    const res = await fetch(url, {
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      console.warn('[acceso] shopify ' + res.status + ' ' + (await res.text()).slice(0, 200));
      return { error: 'shopify_' + res.status };
    }
    const json = await res.json();
    const lista = Array.isArray(json.orders) ? json.orders : [];
    cache = { t: Date.now(), ordenes: lista };
    return { lista };
  } catch (e) {
    console.warn('[acceso] fetch falló ' + (e && e.message));
    return { error: 'fetch_failed' };
  }
}

function pagada(o) {
  return o.financial_status === 'paid' || o.financial_status === 'partially_refunded';
}
/* Las partes que abre UNA orden, mirando cada renglon contra los tres
   productos. Una orden puede traer mas de uno. */
function partesDe(o) {
  const out = {};
  (o.line_items || []).forEach((li) => {
    const v = String(li.variant_id);
    Object.keys(VARIANTES).forEach((prod) => {
      if (VARIANTES[prod].indexOf(v) >= 0) ABRE[prod].forEach((x) => { out[x] = true; });
    });
  });
  return Object.keys(out);
}
function tieneAlgo(o) { return partesDe(o).length > 0; }
function atributo(o, clave) {
  const a = (o.note_attributes || []).find((x) => x && x.name === clave);
  return a ? String(a.value || '') : '';
}
function limpiarOrden(s) {
  return String(s || '').replace(/[^0-9]/g, '');
}

/* ─── handler ──────────────────────────────────────────────────────── */

export default async function handler(request) {
  const u = new URL(request.url);
  const perfil = (u.searchParams.get('p') || '').trim();
  const email  = (u.searchParams.get('e') || '').trim().toLowerCase();
  const orden  = limpiarOrden(u.searchParams.get('o'));
  const codigo = (u.searchParams.get('c') || '').trim().toLowerCase();

  const g = geo(request);
  const base = {
    ok: true,
    ciudad: g.ciudad, region: g.region, pais: g.pais, ciudadExacta: g.exacta,
  };
  const responder = (extra) => Response.json(Object.assign({}, base, extra), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      /* la respuesta depende de quién pregunta: no se cachea en el borde */
      'Cache-Control': 'no-store',
    },
  });

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    } });
  }

  /* Sólo la ciudad: la app la pide siempre, aun antes de comprar, para
     poder nombrarla en la oferta. */
  if (!perfil && !email && !codigo) return responder({ acceso: false, via: 'solo_geo' });

  if (codigo && MANUALES.indexOf(codigo) >= 0) {
    return responder({ acceso: true, partes: ['fecha', 'lugar', 'senal', 'vos'], via: 'codigo_manual' });
  }

  const r = await ordenes();
  if (r.error) {
    /* El detalle sólo se muestra con ?debug=1 y nunca contiene credenciales:
       es el mensaje de error que devuelve Shopify, más el largo de las claves
       para detectar espacios pegados al copiar. */
    const extra = u.searchParams.get('debug') === '1'
      ? { detalle: r.detalle, largoId: r.largoId, largoSecreto: r.largoSecreto }
      : {};
    return responder(Object.assign({ acceso: false, via: 'error', motivo: r.error }, extra));
  }

  const mias = r.lista.filter((o) => {
    if (o.test) return false;
    if (!pagada(o) || !tieneAlgo(o)) return false;
    if (perfil && atributo(o, 'perfil') === perfil) return true;
    /* la vía manual pide las dos cosas: el mail solo lo sabe cualquiera que
       lo haya visto, el número de orden solo no identifica a nadie */
    if (email && orden) {
      return String(o.email || '').toLowerCase() === email
        && limpiarOrden(o.name) === orden;
    }
    return false;
  });

  if (!mias.length) return responder({ acceso: false, partes: [], via: perfil ? 'perfil' : 'manual' });

  /* Se suman TODAS las ordenes, no solo la primera: quien compro la fecha un
     dia y el lugar a la semana siguiente tiene dos ordenes distintas y las dos
     valen. Sin esto, la segunda compra no abriria nada. */
  const suma = {};
  mias.forEach((o) => partesDe(o).forEach((x) => { suma[x] = true; }));
  /* Quien compro los dos sueltos puso 20.000, que es mas que los 13.497 del
     pack. Seria injusto —y se leeria como una trampa— que encima le faltaran
     dos secciones que el pack si trae. Con los dos, se le da todo. */
  if (suma.fecha && suma.lugar) { suma.senal = true; suma.vos = true; }
  const partes = Object.keys(suma);
  const match = mias[0];

  return responder({
    acceso: partes.length > 0,
    partes,
    via: perfil && atributo(match, 'perfil') === perfil ? 'perfil' : 'manual',
    orden: match.name,
    ordenes: mias.length,
    desde: match.created_at,
  });
}
