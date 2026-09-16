/**
 * /api/conciliar
 *
 * Herramienta de reconciliación entre Shopify y UTMify.
 *
 * El webhook manda cada venta a UTMify en el momento. Si una se pierde
 * —Shopify no reintentó, UTMify devolvió error, la función se cayó— no
 * queda rastro: los logs de Vercel en el plan Hobby duran una hora.
 * Este endpoint va a la fuente de verdad (la Admin API de Shopify),
 * lista lo que realmente se vendió, y si se lo pide vuelve a mandarlo.
 *
 * Reenviar es seguro: UTMify identifica el pedido por "orderId", así que
 * un pedido que ya estaba se actualiza, no se duplica.
 *
 * Uso:
 *   /api/conciliar?k=CLAVE                 → lista de hoy (no manda nada)
 *   /api/conciliar?k=CLAVE&dias=3          → últimos 3 días
 *   /api/conciliar?k=CLAVE&enviar=1        → además reenvía todo a UTMify
 *   /api/conciliar?k=CLAVE&orden=1234&enviar=1 → reenvía una sola
 *
 * CLAVE es la variable de entorno CONCILIAR_KEY. Sin ella el endpoint no
 * responde nada: es la única barrera entre esta lista y cualquiera.
 *
 * El email sale ofuscado a propósito. Alcanza para identificar el pedido
 * y no deja la lista de clientes colgada de una URL.
 */

import { tokenAdmin } from './acceso.js';
import { sendUtmify } from './shopify-webhook.js';

export const config = { runtime: 'edge' };

const TIENDA = (process.env.SHOPIFY_SHOP || 'noctralmagemela.myshopify.com').trim();
const API = process.env.SHOPIFY_API_VERSION || '2024-10';

/* Comparación de longitud constante: no le regala el largo ni el prefijo
   de la clave a quien la esté probando a mano. */
function mismaClave(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function ofuscar(email) {
  const e = String(email || '');
  const at = e.indexOf('@');
  if (at < 1) return e ? '(sin email)' : '(vacío)';
  return e.slice(0, 2) + '***' + e.slice(at);
}

/* El estado que espera UTMify, deducido del estado financiero de Shopify. */
function estadoUtmify(o) {
  const f = String(o.financial_status || '').toLowerCase();
  if (f === 'refunded') return 'refunded';
  if (f === 'paid' || f === 'partially_refunded') return 'paid';
  return 'waiting_payment';
}

function atributo(o, nombre) {
  const l = o.note_attributes || [];
  const f = l.find((a) => a && typeof a.name === 'string' && a.name.toLowerCase() === nombre);
  return f && f.value ? String(f.value) : '';
}

/* Los mismos campos que usa el webhook, para que el reenvío salga idéntico
   a lo que se hubiera mandado en vivo. */
const CAMPOS = [
  'id', 'name', 'email', 'contact_email', 'phone', 'customer',
  'financial_status', 'created_at', 'processed_at', 'updated_at',
  'total_price', 'currency', 'line_items', 'note_attributes',
  'landing_site', 'referring_site', 'gateway', 'payment_gateway_names',
  'billing_address', 'shipping_address', 'client_details', 'browser_ip', 'test',
].join(',');

async function traer(token, dias) {
  const desde = new Date(Date.now() - dias * 86400000).toISOString();
  const url = 'https://' + TIENDA + '/admin/api/' + API + '/orders.json'
    + '?status=any&limit=250&created_at_min=' + encodeURIComponent(desde)
    + '&fields=' + CAMPOS;
  const res = await fetch(url, {
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const t = (await res.text()).slice(0, 200);
    return { error: 'shopify_' + res.status, detalle: t };
  }
  const j = await res.json();
  return { lista: Array.isArray(j.orders) ? j.orders : [] };
}

export default async function handler(request) {
  const u = new URL(request.url);

  const esperada = String(process.env.CONCILIAR_KEY || '').trim();
  if (!esperada) {
    return Response.json({ ok: false, error: 'sin_clave',
      ayuda: 'Falta la variable CONCILIAR_KEY en Vercel.' }, { status: 503 });
  }
  if (!mismaClave((u.searchParams.get('k') || '').trim(), esperada)) {
    return Response.json({ ok: false, error: 'clave_invalida' }, { status: 401 });
  }

  const dias = Math.min(Math.max(parseInt(u.searchParams.get('dias') || '1', 10) || 1, 1), 60);
  const enviar = u.searchParams.get('enviar') === '1';
  const filtro = (u.searchParams.get('orden') || '').replace(/[^0-9]/g, '');

  const t = await tokenAdmin();
  if (t.error) return Response.json({ ok: false, error: t.error, detalle: t.detalle }, { status: 502 });

  const r = await traer(t.token, dias);
  if (r.error) return Response.json({ ok: false, ...r }, { status: 502 });

  let lista = r.lista;
  if (filtro) lista = lista.filter((o) => String(o.id).indexOf(filtro) >= 0
    || String(o.name || '').replace(/[^0-9]/g, '') === filtro);

  const filas = [];
  for (const o of lista) {
    const estado = estadoUtmify(o);
    const fila = {
      id: String(o.id),
      nombre: o.name || '',
      fecha: o.created_at,
      estado_shopify: o.financial_status || '',
      estado_utmify: estado,
      total: o.total_price,
      email: ofuscar(o.email || o.contact_email || (o.customer && o.customer.email)),
      upsell: atributo(o, 'origen') === 'upsell_app',
      utm_campaign: atributo(o, 'utm_campaign') || null,
      utm_content: atributo(o, 'utm_content') || null,
      test: !!o.test,
    };
    /* Un pedido sin email es el único que el webhook descarta en silencio:
       vale la pena verlo marcado en la lista aunque no se reenvíe nada. */
    fila.sin_email = fila.email === '(sin email)' || fila.email === '(vacío)';
    if (enviar) {
      try { fila.reenvio = await sendUtmify(o, estado); }
      catch (e) { fila.reenvio = { utmify: 'error', detalle: (e && e.message) || 'excepción' }; }
    }
    filas.push(fila);
  }

  return Response.json({
    ok: true,
    dias,
    enviado: enviar,
    total: filas.length,
    pagadas: filas.filter((f) => f.estado_utmify === 'paid').length,
    upsells: filas.filter((f) => f.upsell).length,
    sin_email: filas.filter((f) => f.sin_email).length,
    ordenes: filas,
  });
}
