/**
 * /api/shopify-webhook
 *
 * Webhook de compras de Shopify para Noctra.
 * Es la ÚNICA fuente del evento Purchase de Meta: el navegador nunca lo
 * dispara (la compra ocurre en el checkout de Shopify, fuera de nuestro
 * dominio) y la integración nativa "Facebook e Instagram" de Shopify debe
 * quedar SIN compartir datos, o se duplican las ventas.
 *
 * Topics manejados (header "x-shopify-topic"):
 *   - orders/paid   → Purchase a la API de Conversiones
 *   - orders/create → idem, SOLO si financial_status === 'paid' (respaldo)
 *   - el resto      → 200 para que Shopify no reintente
 *
 * Seguridad (HMAC):
 *   Shopify firma cada request con HMAC-SHA256 (base64) del RAW body usando
 *   el "webhook signing secret". Viene en "X-Shopify-Hmac-Sha256". Se valida
 *   ANTES de procesar nada. "SHOPIFY_WEBHOOK_SECRETS" admite varios secrets
 *   separados por coma (por si mañana hay una segunda tienda).
 *
 * Idempotencia:
 *   "event_id = shopify_<order.id>". Si Shopify reintenta, o si llegan
 *   orders/create y orders/paid de la misma orden, Meta deduplica y cuenta
 *   UNA sola compra.
 *
 * Atribución:
 *   "fbc"/"fbp" viajan como cart attributes desde el quiz (ver js/pixel.js).
 *   Sin ellos Meta recibe la compra pero no la puede atar al click del
 *   anuncio, y la campaña muestra 0 ventas. Si no vino "fbc" pero sí
 *   "fbclid", se reconstruye con el formato que documenta Meta:
 *   "fb.1.<ms>.<fbclid>".
 *
 * Runtime edge: necesitamos el body crudo byte a byte para el HMAC, y el
 * helper de Node en Vercel lo parsea antes de que lo veamos.
 *
 * GET: 200 con un resumen de qué variables de entorno faltan.
 */

export const config = { runtime: 'edge' };

const GRAPH_VERSION = 'v21.0';

/* ─── utilidades ───────────────────────────────────────────────────── */

const enc = new TextEncoder();

function b64(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function hex(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0');
  return s;
}

/** SHA-256 en hex. Meta pide así los datos personales (email, nombre, país). */
async function sha256(value) {
  if (!value) return undefined;
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(value));
  return hex(buf);
}

/** Comparación en tiempo constante: no filtra por dónde difieren las firmas. */
function equalConstantTime(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function secrets() {
  const raw = process.env.SHOPIFY_WEBHOOK_SECRETS || process.env.SHOPIFY_WEBHOOK_SECRET || '';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * 'valid'        → alguna firma coincidió
 * 'invalid'      → hay secrets configurados pero ninguno coincidió
 * 'unconfigured' → no hay secrets (rechazamos igual: mejor perder un evento
 *                  que aceptar cualquier POST que golpee la URL)
 */
async function verifyHmac(rawBody, header) {
  const list = secrets();
  if (list.length === 0) return 'unconfigured';
  if (!header) return 'invalid';
  for (const secret of list) {
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
    if (equalConstantTime(b64(sig), header)) return 'valid';
  }
  return 'invalid';
}

/* ─── lectura de la orden ──────────────────────────────────────────── */

function buyerEmail(order) {
  return (order.email || order.contact_email || (order.customer && order.customer.email) || '')
    .trim().toLowerCase();
}

function isValidEmail(email) {
  return !!email && email.indexOf('@') > 0 && email.length > 3;
}

/** Valor de un cart attribute por nombre (case-insensitive). */
function attr(order, name) {
  const list = order.note_attributes || [];
  const found = list.find((a) => a && typeof a.name === 'string' && a.name.toLowerCase() === name);
  const v = found && found.value;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/** UTMs y fbclid: primero cart attributes, si no del landing_site de la orden. */
function orderUtms(order) {
  const out = {};
  for (const k of UTM_KEYS.concat(['fbclid'])) {
    const v = attr(order, k);
    if (v) out[k] = v;
  }
  if (Object.keys(out).length) return out;

  const ls = order.landing_site || '';
  const q = ls.indexOf('?');
  if (q === -1) return out;
  try {
    const p = new URLSearchParams(ls.slice(q + 1));
    for (const k of UTM_KEYS.concat(['fbclid'])) {
      const v = p.get(k);
      if (v) out[k] = v;
    }
  } catch (e) { /* landing_site raro: seguimos sin UTMs */ }
  return out;
}

/**
 * "fbc"/"fbp": el identificador del click y el del navegador.
 *  1. cart attribute → la cookie real del visitante (exacta)
 *  2. reconstrucción desde "fbclid" → "fb.1.<ms>.<fbclid>"
 * "fbp" no se puede reconstruir: si no vino, se omite.
 */
function metaIds(order, utms) {
  const fbp = attr(order, 'fbp');
  const fbc = attr(order, 'fbc');
  if (fbc) return { fbc, fbp };
  const fbclid = utms.fbclid;
  if (!fbclid) return { fbp };
  const created = order.created_at ? Date.parse(order.created_at) : NaN;
  const ts = Number.isFinite(created) ? created : Date.now();
  return { fbc: 'fb.1.' + ts + '.' + fbclid, fbp };
}

/** El host por el que pasó realmente la persona (lo deja el quiz). */
function sourceUrl(order) {
  const host = attr(order, 'src_host');
  if (host && /^[a-z0-9.-]+(:[0-9]+)?$/i.test(host)) return 'https://' + host;
  return process.env.SITE_URL || 'https://noctrastral.online';
}

/* ─── Purchase → Meta ──────────────────────────────────────────────── */

async function sendPurchase(order) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return { ok: false, error: 'meta_env_missing' };

  const email = buyerEmail(order);
  const utms = orderUtms(order);
  const ids = metaIds(order, utms);
  const c = order.customer || {};
  const addr = order.billing_address || order.shipping_address || {};

  const total = parseFloat(order.total_price || order.current_total_price || '0');
  const value = Number.isFinite(total) && total > 0 ? total : 9799;
  const currency = order.currency || 'ARS';

  const items = order.line_items || [];
  const contentIds = items
    .filter((li) => li && li.product_id != null)
    .map((li) => String(li.product_id));

  const user_data = {
    em: [await sha256(email)],
    fn: c.first_name ? [await sha256(String(c.first_name).trim().toLowerCase())] : undefined,
    ln: c.last_name ? [await sha256(String(c.last_name).trim().toLowerCase())] : undefined,
    country: addr.country_code ? [await sha256(String(addr.country_code).trim().toLowerCase())] : undefined,
    client_ip_address: order.client_details && order.client_details.browser_ip,
    client_user_agent: order.client_details && order.client_details.user_agent,
    fbc: ids.fbc,
    fbp: ids.fbp,
  };
  for (const k of Object.keys(user_data)) if (user_data[k] === undefined) delete user_data[k];

  const eventTime = Math.floor(
    (Date.parse(order.processed_at || order.created_at || '') || Date.now()) / 1000,
  );

  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: eventTime,
      event_id: 'shopify_' + order.id,
      action_source: 'website',
      event_source_url: sourceUrl(order),
      user_data,
      custom_data: {
        value,
        currency,
        content_name: 'Retrato Noctra',
        content_type: 'product',
        content_ids: contentIds.length ? contentIds : undefined,
        order_id: String(order.id),
      },
    }],
  };
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      'https://graph.facebook.com/' + GRAPH_VERSION + '/' + pixelId + '/events?access_token=' + encodeURIComponent(token),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[shopify] CAPI error', res.status, JSON.stringify(json));
      return { ok: false, error: 'capi_' + res.status };
    }
    return { ok: true, received: json.events_received, utm_source: utms.utm_source || null, has_fbc: !!ids.fbc, has_fbp: !!ids.fbp };
  } catch (err) {
    console.error('[shopify] CAPI exception', String(err));
    return { ok: false, error: 'capi_exception' };
  }
}

/* ─── handler ──────────────────────────────────────────────────────── */

export default async function handler(request) {
  if (request.method === 'GET') {
    return Response.json({
      ok: true,
      service: 'noctra-shopify-webhook',
      secret: secrets().length > 0,
      pixel: !!process.env.META_PIXEL_ID,
      token: !!process.env.META_CAPI_TOKEN,
    });
  }
  if (request.method !== 'POST') {
    return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
  }

  const rawBody = await request.text();
  const verdict = await verifyHmac(rawBody, request.headers.get('x-shopify-hmac-sha256'));
  if (verdict !== 'valid') {
    console.warn('[shopify] rechazado:', verdict, {
      shop: request.headers.get('x-shopify-shop-domain'),
      topic: request.headers.get('x-shopify-topic'),
    });
    return Response.json({ ok: false, error: verdict }, { status: 401 });
  }

  let order;
  try { order = JSON.parse(rawBody); }
  catch (e) { return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 }); }

  const topic = (request.headers.get('x-shopify-topic') || '').toLowerCase();

  if (topic !== 'orders/paid' && topic !== 'orders/create') {
    return Response.json({ ok: true, ignored: topic || 'no_topic' });
  }
  if (topic === 'orders/create' && String(order.financial_status || '').toLowerCase() !== 'paid') {
    return Response.json({ ok: true, topic, ignored: 'not_paid' });
  }
  if (order.id == null) {
    return Response.json({ ok: true, topic, ignored: 'no_order_id' });
  }
  if (!isValidEmail(buyerEmail(order))) {
    console.warn('[shopify] sin email válido, order_id=' + order.id);
    return Response.json({ ok: true, topic, ignored: 'no_email' });
  }

  const result = await sendPurchase(order);
  console.log('[shopify] ' + topic + ' order_id=' + order.id, JSON.stringify(result));
  return Response.json({ ok: true, topic, ...result });
}
