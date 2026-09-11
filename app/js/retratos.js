/* Noctra — catálogo de retratos y elección.
   El retrato no se sortea. Se decide en dos capas:

   1) Lo que vino del test: género de la pareja buscada (filtro duro),
      franja de edad y origen. Eso arma un grupo de candidatos válidos.
   2) Lo que se pregunta dentro de la app (js/rasgos.js): pelo, tono,
      barba o largo, y mirada. Eso elige uno dentro de ese grupo.

   El orden importa. La edad y el origen no se negocian: si alguien pidió
   una persona de cincuenta, no le puede llegar una de veinte porque eligió
   "pelo oscuro". Los rasgos deciden adentro de lo que ya es correcto.

   Es determinístico a propósito: las mismas respuestas dan el mismo retrato
   en cualquier teléfono y en cualquier momento. Si cambiara entre una visita
   y otra, el producto se caería solo. */
(function(){

/* edad  = la edad aparente del retrato, no la franja: permite ordenar fino.
   etnia = el origen que representa.
   pelo  = lacio | ondulado | enrulado
   tono  = claro | castano | oscuro
   barba = si | apenas | no          (sólo hombres)
   largo = corto | hombros | largo   (sólo mujeres)
   mirada= calida | serena | picara
   Las etiquetas salen de mirar los trece dibujos, uno por uno. */
var CAT=[
  /* --- hombres --- */
  {f:"m-20-a",  g:"m", edad:22, etnia:"latino",   pelo:"enrulado", tono:"oscuro",  barba:"no",     mirada:"calida"},
  {f:"m-30-a",  g:"m", edad:32, etnia:"latino",   pelo:"ondulado", tono:"castano", barba:"si",     mirada:"picara"},
  {f:"m-30-b",  g:"m", edad:36, etnia:"latino",   pelo:"ondulado", tono:"castano", barba:"apenas", mirada:"calida"},
  {f:"m-40-a",  g:"m", edad:44, etnia:"europeo",  pelo:"ondulado", tono:"castano", barba:"apenas", mirada:"calida"},
  {f:"m-40-b",  g:"m", edad:46, etnia:"latino",   pelo:"ondulado", tono:"oscuro",  barba:"si",     mirada:"serena"},
  {f:"m-40-as", g:"m", edad:48, etnia:"asiatico", pelo:"lacio",    tono:"oscuro",  barba:"apenas", mirada:"serena"},
  {f:"m-50-a",  g:"m", edad:56, etnia:"europeo",  pelo:"ondulado", tono:"castano", barba:"si",     mirada:"calida"},
  {f:"m-50-b",  g:"m", edad:66, etnia:"europeo",  pelo:"lacio",    tono:"claro",   barba:"no",     mirada:"serena"},
  /* --- mujeres --- */
  {f:"f-20-a",  g:"f", edad:28, etnia:"europeo",  pelo:"lacio",    tono:"castano", largo:"hombros", mirada:"calida"},
  {f:"f-30-a",  g:"f", edad:31, etnia:"europeo",  pelo:"ondulado", tono:"castano", largo:"corto",   mirada:"calida"},
  {f:"f-30-b",  g:"f", edad:34, etnia:"latino",   pelo:"ondulado", tono:"oscuro",  largo:"largo",   mirada:"picara"},
  {f:"f-40-a",  g:"f", edad:40, etnia:"latino",   pelo:"enrulado", tono:"castano", largo:"largo",   mirada:"picara"},
  {f:"f-50-a",  g:"f", edad:52, etnia:"europeo",  pelo:"ondulado", tono:"claro",   largo:"hombros", mirada:"serena"}
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

/* Escalas ordenadas: equivocarse por un escalón cuesta menos que por dos.
   Quien pidió pelo lacio tolera mejor uno ondulado que uno enrulado. */
var ESCALAS={
  pelo:  ["lacio","ondulado","enrulado"],
  tono:  ["claro","castano","oscuro"],
  barba: ["no","apenas","si"],
  largo: ["corto","hombros","largo"]
};
/* Cuánto pesa fallar en cada rasgo, por escalón de distancia. La barba y el
   largo van primero porque son lo que más cambia una cara dibujada; la
   mirada va última porque el gesto se percibe, no se mide. */
var PESO={ barba:1.30, largo:1.10, pelo:0.95, tono:0.80, mirada:0.55 };

function penalRasgo(k, pedido, tiene){
  if(!pedido || pedido==="sorpresa" || !tiene) return 0;   /* "que decida el trazo" no penaliza */
  if(pedido===tiene) return 0;
  var esc=ESCALAS[k];
  if(!esc) return PESO[k];                                  /* mirada: no es escala, falla entera */
  var a=esc.indexOf(pedido), b=esc.indexOf(tiene);
  if(a<0||b<0) return PESO[k];
  return PESO[k]*Math.abs(a-b);
}

/* Número estable a partir del resto de las respuestas: sólo desempata entre
   retratos que quedaron exactamente igual de buenos. */
function semilla(p){
  var s=[p.energia,p.apariencia,p.decision,p.motivo,p.dificultad,p.lenguaje,
         p.experiencias,p.opuestos,p.fecha&&p.fecha.d,p.fecha&&p.fecha.m].join("|");
  var h=2166136261;
  for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=(h*16777619)>>>0; }
  return h;
}

/* Margen dentro del cual dos retratos se consideran igual de buenos en la
   primera capa. Calibrado para que entren los de la misma franja de edad y
   no los de la franja siguiente. */
var MARGEN=2.2;

/* Los rasgos que pidió la persona, vengan del perfil o de un objeto aparte. */
function rasgosDe(p){
  var r=(p&&p.rasgos)||{};
  return { pelo:r.pelo, tono:r.tono, barba:r.barba, largo:r.largo, mirada:r.mirada };
}

function elegir(p){
  p=p||{};
  var g=(p.generoRetrato==="f"||p.generoRetrato==="m") ? p.generoRetrato
        : (p.genero==="m" ? "f" : "m");
  var objetivo=EDAD[p.edad]||35;

  var cand=CAT.filter(function(r){ return r.g===g; });
  if(!cand.length) cand=CAT.slice();

  /* --- capa 1: lo que vino del test --- */
  var puntuados=cand.map(function(r){
    return { r:r, s: Math.abs(r.edad-objetivo)*0.6 + penalEtnia(p.etnia, r.etnia) };
  }).sort(function(a,b){ return a.s-b.s || (a.r.f<b.r.f?-1:1); });

  var mejor=puntuados[0];
  var distMejor=Math.abs(mejor.r.edad-objetivo);
  /* Dos condiciones para entrar al grupo: puntaje parecido Y una edad que no
     se aleje mucho más que la del mejor. Sin la segunda, un origen poco
     representado empujaba caras demasiado grandes para la franja pedida. */
  var grupo=puntuados.filter(function(x){
    return x.s<=mejor.s+MARGEN && Math.abs(x.r.edad-objetivo)<=distMejor+5;
  });

  /* --- capa 2: los rasgos que pidió en la app --- */
  var R=rasgosDe(p);
  var finos=grupo.map(function(x){
    var extra=0;
    extra+=penalRasgo("pelo",  R.pelo,  x.r.pelo);
    extra+=penalRasgo("tono",  R.tono,  x.r.tono);
    extra+=penalRasgo("mirada",R.mirada,x.r.mirada);
    if(g==="m") extra+=penalRasgo("barba", R.barba, x.r.barba);
    else        extra+=penalRasgo("largo", R.largo, x.r.largo);
    /* la capa 1 sigue contando: entre dos que empatan en rasgos, gana el que
       está más cerca de la edad pedida */
    return { r:x.r, s:extra + x.s*0.35 };
  }).sort(function(a,b){ return a.s-b.s || (a.r.f<b.r.f?-1:1); });

  var top=finos[0].s;
  var empate=finos.filter(function(x){ return x.s<=top+0.001; });

  return empate[ semilla(p) % empate.length ].r.f;
}

window.NOCTRA_RETRATOS={
  elegir: elegir,
  ruta: function(p){ return "assets/retratos/"+elegir(p)+".webp"; },
  catalogo: CAT
};
})();
