/**
 * /api/lugar
 *
 * De dónde está escribiendo la persona, para que el chat pueda decirle
 * "tu alma gemela está en <lugar>" sin pedirle nada.
 *
 * Devuelve PROVINCIA, no ciudad, y a propósito: en Argentina el tráfico
 * móvil sale casi siempre por Buenos Aires aunque la persona esté en Salta.
 * Decirle mal la ciudad rompe el efecto justo en el momento que más caro
 * cuesta. La provincia falla mucho menos, y cuando no hay dato confiable se
 * devuelve vacío para que el chat use "muy cerca tuyo".
 *
 * No guarda nada. La IP no se registra ni se devuelve: sólo sale de acá el
 * nombre de una provincia.
 */

export const config = { runtime: 'edge' };

/* ISO 3166-2:AR. Vercel manda la letra en x-vercel-ip-country-region. */
const AR = {
  A:'Salta', B:'Buenos Aires', C:'Buenos Aires', D:'San Luis', E:'Entre Ríos',
  F:'La Rioja', G:'Santiago del Estero', H:'Chaco', J:'San Juan', K:'Catamarca',
  L:'La Pampa', M:'Mendoza', N:'Misiones', P:'Formosa', Q:'Neuquén',
  R:'Río Negro', S:'Santa Fe', T:'Tucumán', U:'Chubut', V:'Tierra del Fuego',
  W:'Corrientes', X:'Córdoba', Y:'Jujuy', Z:'Santa Cruz',
};

export default async function handler(request) {
  const h = request.headers;
  const pais = (h.get('x-vercel-ip-country') || '').toUpperCase();
  const reg = (h.get('x-vercel-ip-country-region') || '').toUpperCase();

  let lugar = '';
  if (pais === 'AR' && AR[reg]) lugar = AR[reg];

  return new Response(JSON.stringify({ lugar }), {
    headers: {
      'Content-Type': 'application/json',
      /* Un minuto de caché en el borde alcanza: la provincia de una persona
         no cambia mientras hace el quiz, y evita una llamada por visita. */
      'Cache-Control': 'public, max-age=60',
    },
  });
}
