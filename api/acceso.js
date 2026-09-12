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
 * Sin token de Shopify cargado devuelve acceso:false y motivo "sin_token",
 * nunca true: si algo se rompe, el pack queda cerrado, no abierto.
 */

export const config = { runtime: 'edge' };

const TIENDA  = process.env.SHOPIFY_SHOP || 'noctralmagemela.myshopify.com';
const API     = process.env.SHOPIFY_API_VERSION || '2024-10';
/* La variante del pack. Si mañana hay más de un producto que da acceso,
   se agregan separados por coma en la variable de entorno. */
const PACK = (process.env.PACK_VARIANT_IDS || '50408908652758')
  .split(',').map(s => s.trim()).filter(Boolean);
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

async function ordenes() {
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token) return { error: 'sin_token' };
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
function tienePack(o) {
  return (o.line_items || []).some((li) => PACK.indexOf(String(li.variant_id)) >= 0);
}
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
    return responder({ acceso: true, via: 'codigo_manual' });
  }

  const r = await ordenes();
  if (r.error) return responder({ acceso: false, via: 'error', motivo: r.error });

  const match = r.lista.find((o) => {
    if (o.test) return false;
    if (!pagada(o) || !tienePack(o)) return false;
    if (perfil && atributo(o, 'perfil') === perfil) return true;
    /* la vía manual pide las dos cosas: el mail solo lo sabe cualquiera que
       lo haya visto, el número de orden solo no identifica a nadie */
    if (email && orden) {
      return String(o.email || '').toLowerCase() === email
        && limpiarOrden(o.name) === orden;
    }
    return false;
  });

  if (!match) return responder({ acceso: false, via: perfil ? 'perfil' : 'manual' });
  return responder({
    acceso: true,
    via: perfil && atributo(match, 'perfil') === perfil ? 'perfil' : 'manual',
    orden: match.name,
    desde: match.created_at,
  });
}
