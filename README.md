# Noctra — funnel "El retrato de tu alma gemela"

Sitio estático (HTML + CSS + JS, sin build). Carpetas:
- `index.html` — página única; el flujo se maneja por JS.
- `css/styles.css` — sistema de diseño "Galaxia" (tokens, botones, lienzo, chat, venta).
- `js/content.js` — TODO el copy editable: textos, precios, testimonios, FAQ, frases por signo y energía.
- `js/sketch.js` — motor del retrato (versión procedural). Se reemplaza por capas PNG en `art/`.
- `js/app.js` — pantallas, lógica, persistencia, chat, venta, exit-intent.

## Publicar en Vercel (gratis)
1. Crear cuenta en vercel.com y elegir "Add New → Project → Upload" (o conectar un repo de GitHub con esta carpeta).
2. Framework: "Other". Sin comando de build. Output: raíz.
3. Deploy. Después "Settings → Domains" para conectar tu dominio.

## Conectar leads (Supabase o cualquier webhook)
En `index.html`, antes de `js/app.js`, agregar:
```html
<script>window.NOCTRA_LEAD_WEBHOOK="https://TU-PROYECTO.supabase.co/functions/v1/lead";</script>
```
El funnel hace POST con `{email, wa, nombre, signo, city, respuestas}` al capturar el email.

## Pagos
El botón de pago hoy es de prueba (no cobra). Para producción: Mercado Pago Checkout Bricks o Stripe Elements
en la función `renderSales()` de `js/app.js`, reemplazando el bloque `[data-act="pay"]`.

## Ciudad por IP
Usa `get.geojs.io` (gratis). Si la red lo bloquea, el chat dice "más cerca de lo que pensás".

## Versión
v2 — secuencia 1:1 de Nebula (15 preguntas + 3 refuerzos), nombre dentro de la pantalla de email, transición a pantalla completa, venta con estructura Nebula adaptada a pago único. La v1 (chat con Maia, resumen, agitación) queda en `js/app.v1-noctra-original.js.bak` y `js/content.v1.bak`.

## Reiniciar el flujo para probar
Abrir `/?reset=1`.

## Assets pendientes (ver prompt maestro, Bloque D)
Bases y capas del retrato, avatar de Maia, foto hero, avatares de testimonios. Se guardan en `art/` y se conectan en `js/sketch.js`.
