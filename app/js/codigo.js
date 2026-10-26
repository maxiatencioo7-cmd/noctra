/* Noctra — El Código.

   Lo que se vende como "El Código" y lo que acá se arma: quién es él más
   allá de la cara. Su nombre completo, su signo, su elemento, cómo se
   cruza con la carta de ella, qué necesita para quedarse, y veintiún días
   de práctica para llegar a la ventana sin estar en otra cosa.

   Tres reglas, las mismas que el resto de la app:

   1. Determinista. Las mismas respuestas dan el mismo signo y el mismo
      ritual siempre, en cualquier teléfono. Si cambiara entre una visita
      y otra se nota que es un sorteo.
   2. No contradice al retrato. El nombre y la edad salen de nombres.js y
      retratos.js; acá sólo se los usa.
   3. No decide quién lo ve. Eso lo resuelve js/acceso.js contra el
      servidor. Este archivo arma el contenido y nada más. */
(function(){
"use strict";

var AS = window.NOCTRA_ASTRO;
if (!AS) return;

/* Mismo hash que plan.js y nombres.js: FNV-1a de 32 bits. */
function fnv(s){
  var h = 2166136261;
  for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h >>> 0;
}
function semilla(P, sal){
  P = P || {};
  var f = P.fecha || {};
  return fnv(["cod", sal || "", P.etnia, P.edad, P.genero, P.generoRetrato,
              f.d, f.m, f.y, P.energia, P.lenguaje].join("|"));
}
function deLaLista(lista, h){ return lista[h % lista.length]; }

/* ---------- su signo ----------

   No sale de un sorteo entre doce. Sale de los signos que de verdad se
   llevan con el de ella: conjunción, sextil, trígono y oposición, que son
   los aspectos que la sinastría puntúa de 72 para arriba. Dentro de ese
   grupo elige el hash, así es estable.

   La razón no es decorativa. Si el signo saliera al azar, una de cada tres
   lecturas abriría con "cuadratura: hay fricción real" como primera frase
   de algo que acaba de pagar. Los aspectos difíciles existen y la app los
   dice cuando aparecen de verdad —en Compatibilidad, con personas reales—,
   pero el retrato no es una persona real: es hacia dónde mirar. */
function signoDeEl(P, signoElla){
  var i0 = AS.SIGNOS.indexOf(signoElla);
  if (i0 < 0) i0 = 0;
  var buenos = [];
  for (var i = 0; i < AS.SIGNOS.length; i++){
    var d = Math.abs(i - i0) % 12, dist = Math.min(d, 12 - d);
    if (dist === 0 || dist === 2 || dist === 4 || dist === 6) buenos.push(AS.SIGNOS[i]);
  }
  if (!buenos.length) buenos = AS.SIGNOS.slice();
  return deLaLista(buenos, semilla(P, "signo"));
}

/* ---------- qué necesita para quedarse ----------

   Por elemento. Lo importante no es el párrafo lindo: es el "error" que va
   abajo, porque es lo único de toda la sección que ella puede usar el
   mismo día que lo conoce. */
var PORELEMENTO = {
  fuego:{
    necesita:"Que lo mires cuando se entusiasma. Alguien de fuego cuenta lo que está haciendo antes de que esté terminado, y lo cuenta con más convicción de la que tiene. Si en ese momento encuentra una cara atenta, se queda. Si encuentra una ceja levantada, se guarda la próxima.",
    error:"Bajarle el entusiasmo con un dato realista. Tenés razón y lo perdés igual.",
    senal:"Te va a proponer algo con poco aviso. No es desprolijidad: es cómo mide si vas."
  },
  tierra:{
    necesita:"Constancia antes que intensidad. Alguien de tierra no cree en lo que le decís, cree en lo que se repite: que contestes, que llegues, que la semana que viene siga pasando lo mismo. Lo que para otro es aburrido, para él es la prueba.",
    error:"Cambiar de plan a último momento dos veces seguidas. La segunda ya la archivó.",
    senal:"Se va a acordar de algo chico que dijiste hace tres semanas. Así demuestra."
  },
  aire:{
    necesita:"Conversación que vaya a algún lado. Alguien de aire se engancha con la cabeza antes que con nada, y se desengancha igual de rápido si la charla se vuelve trámite. Necesita que le discutas algo, no que le des la razón.",
    error:"Contestarle con monosílabos cuando estás cansada, sin decirle que estás cansada. Lo lee como desinterés.",
    senal:"Te va a mandar algo que leyó. Eso es afecto, aunque parezca un link."
  },
  agua:{
    necesita:"Que no le pidas que explique todo. Alguien de agua registra el clima de una habitación antes que las palabras, y lo que le pasa casi nunca entra en una frase. Necesita tiempo y necesita que ese tiempo no se lea como que está escondiendo algo.",
    error:"Presionarlo para que diga qué le pasa en el momento en que le pasa. Se cierra, y después cuesta.",
    senal:"Va a hacer algo por vos antes de decirte nada. Mirá los gestos, no la conversación."
  }
};

/* ---------- el ritual de 21 días ----------

   Veintiún ejercicios de escritura, atención y límites. No tienen nada de
   mágico y funcionan igual, que es exactamente lo mismo que dicen los doce
   rituales mensuales de datos.js.

   Van en tres tramos de siete porque el orden importa: primero sacarse de
   encima lo viejo, después salir del molde de siempre, y recién al final
   la parte que mira hacia afuera. Al revés no sirve: practicar cómo
   presentarse mientras todavía se está esperando el mensaje de otro es
   perder siete días. */
var DIAS = [
  /* --- 1 a 7: sacarse de encima lo que ya no va --- */
  {t:"La lista de lo que ya probaste", m:10,
   x:"Escribí los nombres de las últimas tres personas con las que saliste y, al lado de cada uno, la razón por la que no siguió. Una línea cada una, sin adornos.",
   p:"Si las tres razones se parecen, ese es tu patrón y no su culpa."},
  {t:"Lo que no estás dispuesta a volver a aguantar", m:10,
   x:"Tres cosas. Concretas, no categorías: no «falta de respeto», sino qué hizo esa persona el martes que te hizo acordar de que valías menos.",
   p:"Esta lista es la que te va a salvar en el mes tres, no en la primera cita."},
  {t:"El mensaje que no mandaste", m:12,
   x:"Escribilo entero. A quien sea, de cuando sea. Después no lo mandes: cerrá la app.",
   p:"Lo que se escribe deja de dar vueltas. Lo que se manda, vuelve."},
  {t:"Una hora sin el teléfono", m:60,
   x:"Elegí una hora del día de mañana y dejá el teléfono en otra habitación. No en modo avión: en otra habitación.",
   p:"Vas a descubrir cuántas veces lo buscás sin motivo. Ese número es el dato."},
  {t:"El inventario honesto", m:15,
   x:"Escribí qué estás ofreciendo hoy: tiempo, atención, paciencia, plata, ganas. Y cuánto de cada cosa te queda de verdad.",
   p:"Nadie se enamora de alguien agotado. Si todo da cero, el ritual de hoy es dormir."},
  {t:"Perdonarte una", m:12,
   x:"Elegí una decisión tuya que todavía te da vergüenza y escribí por qué, en ese momento, tenía sentido.",
   p:"Tenía sentido. Por eso la tomaste."},
  {t:"Cerrar la primera semana", m:8,
   x:"Releé los seis días. Subrayá una sola frase, la que más te incomodó.",
   p:"Esa frase es el trabajo del mes. Anotala aparte."},

  /* --- 8 a 14: salir del molde --- */
  {t:"Cambiar un recorrido", m:0,
   x:"Mañana hacé un trayecto que hacés siempre, por otro lado. El del trabajo, el del super, el que sea.",
   p:"No es magia: es que las mismas cuadras te muestran siempre la misma gente."},
  {t:"Tres veces el mismo lugar nuevo", m:0,
   x:"Elegí un café, una librería o un club que no conocés. Hoy es la primera de tres.",
   p:"A la tercera ya sos alguien conocido. Antes de la tercera no pasa nada, y está bien."},
  {t:"Decir que no", m:5,
   x:"Hoy decí que no a algo que ibas a aceptar por inercia. Una sola cosa.",
   p:"Practicás el no con cosas chicas para tenerlo disponible cuando importe."},
  {t:"Una pregunta de más", m:0,
   x:"En la próxima conversación cualquiera, hacé una pregunta más de la que harías. Una sola.",
   p:"Casi todo lo interesante de una persona está una pregunta más adentro."},
  {t:"Volver al segundo", m:0,
   x:"Segunda vez al lugar del día 9. Sentate en otro lado.",
   p:"Nadie te está mirando. Eso también es un dato útil."},
  {t:"Lo que dejaste de hacer", m:12,
   x:"Escribí tres cosas que te gustaban y dejaste. Elegí una y ponele fecha esta semana.",
   p:"La gente se cruza haciendo cosas, no esperando."},
  {t:"Cerrar la segunda semana", m:8,
   x:"¿Qué cambió de la primera a la segunda? Escribilo aunque sea «nada».",
   p:"«Nada» también se escribe. Dentro de dos semanas lo vas a leer distinto."},

  /* --- 15 a 21: hacia afuera --- */
  {t:"Tu presentación en dos frases", m:12,
   x:"Escribí cómo contás quién sos, sin el trabajo y sin los hijos. Dos frases.",
   p:"Si no te sale, es porque hace mucho que no te lo preguntás."},
  {t:"Tercera vez", m:0,
   x:"Tercera y última visita al lugar del día 9. Hoy hablá con alguien, aunque sea del clima.",
   p:"El objetivo no es conocer a nadie. Es que hablar deje de costar."},
  {t:"Lo que no vas a explicar", m:10,
   x:"Hacé una lista corta de cosas tuyas que ya no vas a justificar ante nadie.",
   p:"Esto es lo que más rápido ahuyenta a quien no era."},
  {t:"Una foto honesta", m:15,
   x:"Buscá una foto tuya reciente en la que estés haciendo algo, no posando. Si no tenés, sacate una esta semana.",
   p:"Las fotos de perfil posadas atraen a gente que busca una foto."},
  {t:"Releer el retrato", m:10,
   x:"Volvé a mirar la cara y leé tu lectura entera, de nuevo, despacio.",
   p:"La segunda lectura siempre dice algo que la primera no."},
  {t:"La señal que vas a buscar", m:10,
   x:"Escribí los dos rasgos y los dos gestos que decidiste que vas a mirar. De memoria, sin volver a la app.",
   p:"Lo que te acordás de memoria es lo que vas a reconocer el día que pase."},
  {t:"Día veintiuno", m:12,
   x:"Releé el día 1. Escribí qué le dirías hoy a la persona que escribió eso.",
   p:"Ahí es donde se ve si sirvió. Y suele verse."}
];

/* Pequeña rotación determinista del tramo final, para que dos personas que
   comparan la app no vean exactamente la misma lista. El orden de los
   tramos no se toca: es lo único que hace que el ritual funcione. */
function dias(P){
  var copia = DIAS.slice();
  var h = semilla(P, "ritual");
  var a = 14 + (h % 6), b = 14 + ((h >>> 5) % 6);
  if (a !== b){ var t = copia[a]; copia[a] = copia[b]; copia[b] = t; }
  return copia;
}

/* ---------- ¿es esta persona? ----------

   Honesto a propósito. Compara la inicial y el signo, dice qué coincide y
   qué no, y no promete nada: dos coincidencias no son una persona. La
   alternativa —un "¡sí, es él!" entusiasta— es la clase de pantalla que
   hace que alguien le dé seis meses a quien no era. */
function probar(datos, codigo){
  var n = ((datos && datos.nombre) || "").trim();
  var s = (datos && datos.signo) || "";
  var ini = n ? n.charAt(0).toUpperCase() : "";
  var okN = !!ini && ini === codigo.inicial;
  var okS = !!s && s === codigo.signo;

  var veredicto, detalle;
  if (okN && okS){
    veredicto = "Coincide en las dos";
    detalle = "La inicial y el signo dan. No es poco: de cada cien personas que te cruzás, esto lo cumplen dos o tres. Tampoco es una prueba — mirá los gestos del día a día antes que este número.";
  } else if (okN || okS){
    veredicto = okN ? "Coincide la inicial" : "Coincide el signo";
    detalle = okN
      ? "El nombre empieza igual, el signo no. Pasa, y no lo descarta: el retrato marca hacia dónde mirar, no un documento."
      : "El signo da, la inicial no. De las dos, el signo pesa más, porque es el que explica cómo se comporta.";
  } else {
    veredicto = "No coincide en ninguna";
    detalle = "Ni la inicial ni el signo. Si igual te interesa, seguí: esto no es una autorización. Pero si estabas buscando una razón para darle seis meses más a alguien que no te está dando nada, no la busques acá.";
  }
  return { nombre:n, signo:s, inicial:ini, okNombre:okN, okSigno:okS,
           veredicto:veredicto, detalle:detalle };
}

/* ---------- lo que se pinta ---------- */
function generar(P, signoElla, nombre){
  nombre = (nombre || "").trim();
  var signo = signoDeEl(P, signoElla);
  var elem = AS.elementoDe(signo);
  var sin = AS.sinastria(signoElla, signo);
  var per = PORELEMENTO[elem] || PORELEMENTO.aire;

  return {
    nombre: nombre,
    inicial: nombre ? nombre.charAt(0).toUpperCase() : "",
    signo: signo,
    elemento: elem,
    modo: AS.modoDe(signo),
    regente: AS.regenteDe(signo),
    compat: sin,
    necesita: per.necesita,
    error: per.error,
    senal: per.senal,
    dias: dias(P)
  };
}

window.NOCTRA_ELCODIGO = { generar:generar, probar:probar, TOTAL:DIAS.length };
})();
