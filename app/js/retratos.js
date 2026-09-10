/* Noctra — catálogo de retratos y elección.
   El retrato no se sortea: sale de las respuestas del test. Pesan tres cosas,
   en este orden: el género de la pareja buscada (filtro duro), la franja de
   edad elegida y el origen. Cuando quedan varios candidatos igual de buenos,
   desempata un número derivado del resto del perfil, así dos personas con la
   misma edad y el mismo origen no reciben siempre la misma cara.

   Es determinístico a propósito: las mismas respuestas dan el mismo retrato
   en cualquier teléfono y en cualquier momento. Si cambiara entre una visita
   y otra, el producto se caería solo. */
(function(){

/* edad = la edad aparente del retrato, no la franja: permite ordenar fino.
   etnia = el origen que representa. */
var CAT=[
  /* --- hombres --- */
  {f:"m-20-a",  g:"m", edad:22, etnia:"latino"},
  {f:"m-30-a",  g:"m", edad:32, etnia:"latino"},
  {f:"m-30-b",  g:"m", edad:36, etnia:"latino"},
  {f:"m-40-a",  g:"m", edad:44, etnia:"europeo"},
  {f:"m-40-b",  g:"m", edad:46, etnia:"latino"},
  {f:"m-40-as", g:"m", edad:48, etnia:"asiatico"},
  {f:"m-50-a",  g:"m", edad:56, etnia:"europeo"},
  {f:"m-50-b",  g:"m", edad:66, etnia:"europeo"},
  /* --- mujeres --- */
  {f:"f-20-a",  g:"f", edad:28, etnia:"europeo"},
  {f:"f-30-a",  g:"f", edad:31, etnia:"europeo"},
  {f:"f-30-b",  g:"f", edad:34, etnia:"latino"},
  {f:"f-40-a",  g:"f", edad:40, etnia:"latino"},
  {f:"f-50-a",  g:"f", edad:52, etnia:"europeo"}
];

/* La franja del test apunta a una edad concreta: "30-40" no es 30 ni 40.
   "50 o más" es abierta, así que apunta más arriba que el borde. */
var EDAD={"20":25,"30":35,"40":45,"50":60};

/* Cercanía entre orígenes. Europeo y latino se leen parecido en un dibujo a
   lápiz, así que uno cubre al otro con poco costo; el resto, no. */
function penalEtnia(pedida, tiene){
  if(!pedida || pedida==="libre") return 0;
  if(pedida===tiene) return 0;
  var cerca=(pedida==="europeo"&&tiene==="latino")||(pedida==="latino"&&tiene==="europeo");
  return cerca ? 1.5 : 4;
}

/* Número estable a partir del resto de las respuestas: sólo elige dentro de
   los que ya empataron. */
function semilla(p){
  var s=[p.energia,p.apariencia,p.decision,p.motivo,p.dificultad,p.lenguaje,
         p.experiencias,p.opuestos,p.fecha&&p.fecha.d,p.fecha&&p.fecha.m].join("|");
  var h=2166136261;
  for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=(h*16777619)>>>0; }
  return h;
}

/* Margen dentro del cual dos retratos se consideran igual de buenos. Está
   calibrado para que entren los de la misma franja de edad y no los de la
   franja siguiente. */
var MARGEN=2.2;

/* Devuelve el nombre de archivo del retrato que le corresponde al perfil. */
function elegir(p){
  p=p||{};
  var g=(p.generoRetrato==="f"||p.generoRetrato==="m") ? p.generoRetrato
        : (p.genero==="m" ? "f" : "m");
  var objetivo=EDAD[p.edad]||35;

  var cand=CAT.filter(function(r){ return r.g===g; });
  if(!cand.length) cand=CAT.slice();

  var puntuados=cand.map(function(r){
    return { r:r, s: Math.abs(r.edad-objetivo)*0.6 + penalEtnia(p.etnia, r.etnia) };
  }).sort(function(a,b){ return a.s-b.s || (a.r.f<b.r.f?-1:1); });

  var mejor=puntuados[0];
  var distMejor=Math.abs(mejor.r.edad-objetivo);
  /* Dos condiciones para entrar al empate: puntaje parecido Y una edad que no
     se aleje mucho más que la del mejor. Sin la segunda, un origen poco
     representado empujaba caras demasiado grandes para la franja pedida. */
  var empate=puntuados.filter(function(x){
    return x.s<=mejor.s+MARGEN && Math.abs(x.r.edad-objetivo)<=distMejor+5;
  });

  return empate[ semilla(p) % empate.length ].r.f;
}

window.NOCTRA_RETRATOS={
  elegir: elegir,
  ruta: function(p){ return "assets/retratos/"+elegir(p)+".webp"; },
  catalogo: CAT
};
})();
