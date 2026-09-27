/* Noctra — repaso de ventas contra Shopify, para que no falte ninguna.
 *
 * El webhook manda cada pedido a UTMify en el momento. Alcanza casi
 * siempre, pero "casi" no sirve para un tablero de plata: si Shopify no
 * entrega el webhook, si Vercel devuelve un error justo en ese segundo, si
 * UTMify rechaza el pedido por un campo raro, o si alguien crea una orden a
 * mano desde el admin —que no dispara nada—, esa venta no aparece nunca más
 * y no hay forma de enterarse salvo contando a ojo.
 *
 * Esto lee las órdenes directo de Shopify y las vuelve a mandar a UTMify.
 * Es idempotente: UTMify identifica cada pedido por orderId, así que
 * reenviar uno que ya tiene no lo duplica, lo pisa con el mismo dato. Por
 * eso se puede correr todas las veces que haga falta.
 *
 * Shopify es la única fuente de verdad. Si una venta está en Shopify, tiene
 * que estar en el tablero; lo que decida el webhook es secundario.
 *
 * Meta NO recibe nada desde acá, a propósito. Una conversión duplicada en
 * el píxel no se puede borrar y le enseña a la campaña a buscar mal. El
 * webhook ya deduplica por event_id; este repaso es sólo para el tablero.
 *
 * Cómo se usa:
 *   - solo:  /api/utmify-sync?k=<SYNC_SECRET>
 *   - días:  /api/utmify-sync?k=...&dias=7
 *   - prueba sin escribir: &seco=1
 *   - y cada hora, por el cron de vercel.json
 */
import { tokenAdmin } from './acceso.js';
import { sendUtmify } from './shopify-webhook.js';

export const config = { runtime: 'edge' };

const TIENDA = (process.env.SHOPIFY_SHOP || 'noctralmagemela.myshopify.com').trim();
const API = process.env.SHOPIFY_API_VERSION || '2024-10';

/* Tres días por defecto. Suficiente para tapar una caída larga sin pedirle
   a Shopify miles de órdenes en cada pasada. */
const DIAS = parseInt(process.env.SYNC_DIAS || '3', 10);

/* En qué estado está la orden para UTMify. El orden importa: una orden
   reembolsada también estuvo pagada, y lo último que pasó es lo que vale. */
function estadoDe(o) {
  const f = String(o.financial_status || '').toLowerCase();
  if (f === 'refunded' || f === 'partially_refunded') return 'refunded';
  if (f === 'paid') return 'paid';
  if (f === 'voided') return null;          /* anulada: no es una venta */
  return 'waiting_payment';
}

export default async function handler(request) {
  const u = new URL(request.url);
  const responder = (b, s) => Response.json(b, { status: s || 200,
    headers: { 'Cache-Control': 'no-store' } });

  /* Quién puede correrlo: el cron de Vercel, o alguien con la clave. Sin
     esto cualquiera podría golpear la URL y hacernos gastar la cuota de la
     API de Shopify. */
  const esCron = !!request.headers.get('x-vercel-cron');
  const clave = (process.env.SYNC_SECRET || '').trim();
  if (!esCron) {
    if (!clave) return responder({ ok: false, error: 'sin_SYNC_SECRET' }, 403);
    if ((u.searchParams.get('k') || '').trim() !== clave) {
      return responder({ ok: false, error: 'clave_incorrecta' }, 401);
    }
  }

  const seco = u.searchParams.get('seco') === '1';
  const dias = Math.min(30, Math.max(1, parseInt(u.searchParams.get('dias') || DIAS, 10) || DIAS));

  const t = await tokenAdmin();
  if (t.error) return responder({ ok: false, error: 'shopify_' + t.error }, 500);

  const desde = new Date(Date.now() - dias * 86400000).toISOString();
  const url = 'https://' + TIENDA + '/admin/api/' + API + '/orders.json'
    + '?status=any&limit=250&created_at_min=' + encodeURIComponent(desde);

  let ordenes = [];
  try {
    const r = await fetch(url, {
      headers: { 'X-Shopify-Access-Token': t.token, 'Content-Type': 'application/json' },
    });
    if (!r.ok) return responder({ ok: false, error: 'shopify_' + r.status }, 502);
    const j = await r.json();
    ordenes = Array.isArray(j.orders) ? j.orders : [];
  } catch (e) {
    return responder({ ok: false, error: 'shopify_fetch', detalle: e && e.message }, 502);
  }

  const cuenta = { total: ordenes.length, paid: 0, waiting_payment: 0, refunded: 0,
                   anuladas: 0, enviadas: 0, fallaron: 0 };
  const errores = [];

  for (const o of ordenes) {
    const estado = estadoDe(o);
    if (!estado) { cuenta.anuladas++; continue; }
    cuenta[estado]++;
    if (seco) continue;
    try {
      const r = await sendUtmify(o, estado);
      if (r && r.utmify === 'error') {
        cuenta.fallaron++;
        if (errores.length < 10) {
          errores.push({ orden: o.id, estado, status: r.utmify_status });
        }
      } else {
        cuenta.enviadas++;
      }
    } catch (e) {
      cuenta.fallaron++;
      if (errores.length < 10) errores.push({ orden: o.id, estado, error: e && e.message });
    }
  }

  console.log('[sync] ' + JSON.stringify(cuenta) + (errores.length ? ' errores=' + JSON.stringify(errores) : ''));
  return responder({ ok: true, dias, seco, ...cuenta, errores });
}
