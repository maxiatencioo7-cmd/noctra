/* Noctra — las últimas compras, para el aviso flotante de la app.
 *
 * Devuelve compras REALES, leídas de Shopify. No hay nombres inventados ni
 * ciudades de relleno: si no hubo ventas, esto devuelve una lista vacía y
 * la app no muestra nada. Un "Sofía de Rosario compró hace 3 minutos"
 * escrito a mano es una venta que no existió, y el producto entero se
 * apoya en que la persona crea lo que le contamos.
 *
 * Qué sale y qué no. Sale la ciudad (o la provincia, si no hay ciudad), el
 * producto y hace cuánto. NO sale el nombre, ni el mail, ni el número de
 * orden, ni nada que permita reconocer a alguien: quien compró un retrato
 * de su alma gemela no firmó para aparecer en la pantalla de un
 * desconocido. La ciudad sola no identifica a nadie.
 *
 * Es un endpoint público, así que todo lo que devuelve tiene que poder
 * leerlo cualquiera sin que le importe a quien compró. Por eso no hay
 * ningún campo más que estos tres.
 */
import { tokenAdmin } from './acceso.js';

export const config = { runtime: 'edge' };

const TIENDA = (process.env.SHOPIFY_SHOP || 'noctralmagemela.myshopify.com').trim();
const API = process.env.SHOPIFY_API_VERSION || '2024-10';

/* Siete días. Más atrás que eso, "hace seis días" vende menos que no
   mostrar nada y encima deja ver que no hay movimiento. */
const DIAS = parseInt(process.env.ULTIMAS_DIAS || '7', 10);
const MAX = 12;

function ids(v) {
  return String(v || '').split(/[,\s]+/).map((x) => x.trim()).filter(Boolean);
}
const VARIANTES = {
  'Fecha Exacta': ids(process.env.VARIANTE_FECHA || '50411348000982'),
  'Dónde y Cómo': ids(process.env.VARIANTE_LUGAR || '50411352817878'),
  'La señal': ids(process.env.VARIANTE_SENAL || '50520637472982'),
  'el pack completo': ids(process.env.VARIANTE_PACK || process.env.PACK_VARIANT_IDS || '50408908652758'),
};

/* Caché de cinco minutos. La app pide esto en cada visita y las compras no
   cambian tan rápido; sin esto, cada persona que abre la app gasta una
   llamada a la API de Shopify, que tiene límite. */
let cache = { t: 0, lista: null };

/* El producto de la orden. Si trae varios renglones gana el pack, que es
   lo que mejor suena; si no reconoce ninguno, la orden se descarta en vez
   de inventarle un nombre. */
function productoDe(o) {
  const nombres = [];
  (o.line_items || []).forEach((li) => {
    const v = String(li.variant_id);
    Object.keys(VARIANTES).forEach((p) => {
      if (VARIANTES[p].indexOf(v) >= 0 && nombres.indexOf(p) < 0) nombres.push(p);
    });
  });
  if (!nombres.length) return '';
  if (nombres.indexOf('el pack completo') >= 0) return 'el pack completo';
  return nombres[0];
}

/* La ciudad del comprador. Los productos son digitales, así que no hay
   dirección de envío: la que vale es la de facturación, que es la que pide
   el checkout. Sin ciudad se usa la provincia, y sin provincia se descarta
   la orden: "alguien compró" sin lugar no dice nada. */
function lugarDe(o) {
  const d = o.billing_address || o.shipping_address || o.customer_address || {};
  const c = String(d.city || '').trim();
  const p = String(d.province || '').trim();
  return titulo(c || p || '');
}

/* La ciudad la escribe cada comprador a mano en el checkout, así que llega
   como "san francisco", "RIO GRANDE" o "Mar del Plata", las tres en la
   misma lista. Se normaliza acá: leer "Alguien de san francisco" hace que
   todo el aviso parezca un error del sistema. Las partículas quedan en
   minúscula, que es como se escriben en castellano. */
const CHICAS = ['de', 'del', 'la', 'las', 'los', 'y', 'el'];
function titulo(s) {
  return String(s || '').toLowerCase().split(/\s+/).filter(Boolean)
    .map((w, i) => (i > 0 && CHICAS.indexOf(w) >= 0)
      ? w
      : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function hace(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (!(ms >= 0)) return '';
  const min = Math.floor(ms / 60000);
  if (min < 2) return 'recién';
  if (min < 60) return 'hace ' + min + ' min';
  const h = Math.floor(min / 60);
  if (h < 24) return 'hace ' + h + (h === 1 ? ' hora' : ' horas');
  const d = Math.floor(h / 24);
  return 'hace ' + d + (d === 1 ? ' día' : ' días');
}

export default async function handler(request) {
  const responder = (cuerpo) => Response.json(cuerpo, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      /* la respuesta es la misma para todos: se puede cachear en el borde */
      'Cache-Control': 'public, max-age=120, s-maxage=300',
    },
  });

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
    } });
  }

  /* El "hace cuánto" se calcula al responder, nunca al guardar: si se
     guardara hecho, durante los cinco minutos de caché diría "hace 2 min"
     cuando ya pasaron siete. */
  const vestir = (l) => l
    .map((x) => ({ lugar: x.lugar, producto: x.producto, cuando: hace(x.t) }))
    .filter((x) => x.cuando);

  if (cache.lista && Date.now() - cache.t < 300000) {
    return responder({ ok: true, compras: vestir(cache.lista) });
  }

  const t = await tokenAdmin();
  /* Sin token no se inventa nada: lista vacía y la app sigue su camino. */
  if (t.error) return responder({ ok: false, compras: [] });

  const desde = new Date(Date.now() - DIAS * 86400000).toISOString();
  const url = 'https://' + TIENDA + '/admin/api/' + API + '/orders.json'
    + '?status=any&limit=250&created_at_min=' + encodeURIComponent(desde)
    + '&fields=id,financial_status,line_items,created_at,test,billing_address,shipping_address';

  let lista = [];
  try {
    const r = await fetch(url, {
      headers: { 'X-Shopify-Access-Token': t.token, 'Content-Type': 'application/json' },
    });
    if (!r.ok) {
      console.warn('[ultimas] shopify ' + r.status);
      return responder({ ok: false, compras: [] });
    }
    const j = await r.json();
    const ordenes = Array.isArray(j.orders) ? j.orders : [];
    lista = ordenes
      .filter((o) => !o.test)
      .filter((o) => o.financial_status === 'paid' || o.financial_status === 'partially_refunded')
      .map((o) => ({ lugar: lugarDe(o), producto: productoDe(o), t: o.created_at }))
      .filter((x) => x.lugar && x.producto)
      .sort((a, b) => new Date(b.t) - new Date(a.t))
      .slice(0, MAX);
  } catch (e) {
    console.warn('[ultimas] fetch falló ' + (e && e.message));
    return responder({ ok: false, compras: [] });
  }

  cache = { t: Date.now(), lista };
  /* el timestamp crudo no sale de acá: ya está contado en "cuando", y una
     fecha exacta acerca la orden a una persona concreta */
  return responder({ ok: true, compras: vestir(lista) });
}
