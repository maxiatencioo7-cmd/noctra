# Noctra — Quiz "Retrato del Alma Gemela"

Sitio estático. No necesita build ni servidor: se sube tal cual.

## Estructura
- `index.html` — página única (el quiz entero)
- `css/nebula.css` — estilos
- `js/content.nebula.js` — **todos los textos, precios e imágenes** (editar acá)
- `js/app.js` — motor del quiz
- `js/sketch.js` — generador del retrato
- `assets/` — imágenes

## Cómo cambiar cosas
- **Textos y precios**: `js/content.nebula.js`
- **Imágenes**: reemplazar el archivo en `assets/` con el mismo nombre
- **Reiniciar el test** (para probar): agregar `?reset=1` al final de la URL

## Pendiente de conectar en producción
- Captura de leads: definir `window.NOCTRA_LEAD_WEBHOOK = "https://..."` antes de `app.js`
- Cobro real: el checkout de ahora es una vista previa (no procesa pagos)
- Píxel de Meta / analítica
