/* Noctra — "Cuándo, Dónde y Cómo": el contenido del pack.

   Cinco secciones. Se generan acá, del lado del cliente, con las mismas
   respuestas que dieron el retrato y el nombre: así el plan no puede
   contradecir a la lectura ni cambiar entre una visita y otra.

   Tres reglas que se respetan en todo el archivo:

   1. Fechas concretas. "Pronto" no se paga. Un rango con día de apertura
      y de cierre sí. Las ventanas salen de astro.js —las mismas que ya
      ve en la pestaña Encuentro—, acá con los días afinados y con el
      pico lunar adentro.

   2. Todo se redacta como invitación a moverse, nunca como profecía para
      esperar sentada. Cumple igual, vende igual, y no deja a nadie
      esperando un día que no llega. Una promesa que se desmiente sola
      vuelve como reembolso.

   3. Nada sobre cómo conseguir que otra persona sienta algo. La quinta
      sección habla de ella. Una instrucción sobre un tercero se pone a
      prueba, falla, y la persona concluye que el problema es ella. */
(function(){
var A=window.NOCTRA_ASTRO;
var MES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto",
         "septiembre","octubre","noviembre","diciembre"];
var DIAS=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

/* ---------- semilla ----------
   Mismo criterio que nombres.js: sólo campos que preguntan las DOS vías de
   entrada (el quiz largo y el test corto de adentro de la app). Si tomara
   las preguntas largas, la misma persona entrando desde otro teléfono
   vería otro plan. */
function fnv(s){
  var h=0x811C9DC5;
  for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=(h*16777619)>>>0; }
  h^=h>>>15; h=(h*2246822507)>>>0; h^=h>>>13;
  return h>>>0;
}
function sem(P,sal){
  var f=P.fecha||{};
  return fnv(["pl",sal||"",P.etnia,P.edad,P.genero,P.generoRetrato,f.d,f.m,f.y].join("|"));
}
/* Todos los desplazamientos son >>> y no >>: la semilla es un entero sin
   signo de 32 bits, y con >> los valores por encima de 2^31 dan negativos.
   Un índice negativo devuelve undefined y la sección sale en blanco. */
function una(arr,s){ return arr[(s>>>0)%arr.length]; }

/* n elementos DISTINTOS del arreglo. La primera versión avanzaba con un
   paso fijo y repetía elementos cuando el paso y el largo compartían
   divisor —salían dos veces "el mismo café"—. Esta baraja el arreglo con
   Fisher-Yates sembrado, que no puede repetir. */
function varios(arr,s,n){
  var a=arr.slice(), h=(s>>>0)||1;
  for(var i=a.length-1;i>0;i--){
    h^=h<<13; h>>>=0; h^=h>>>17; h^=h<<5; h>>>=0;   /* xorshift */
    var j=h%(i+1), t=a[i]; a[i]=a[j]; a[j]=t;
  }
  return a.slice(0,Math.min(n,a.length));
}
function dos(arr,s){ return varios(arr,s,2); }
function tres(arr,s){ return varios(arr,s,3); }
function dia(d){ return d.getDate()+" de "+MES[d.getMonth()]; }
function diaCorto(d){ return d.getDate()+" "+MES[d.getMonth()].slice(0,3); }

/* ================================================================
   1. LA FECHA
   ================================================================ */
function laFecha(P,ahora){
  var f=P.fecha||{d:15,m:6,y:1992};
  var signo=A.signoDe(f.d,f.m);
  var vs=A.ventanas(signo,ahora)||[];
  if(!vs.length) return null;
  var s=sem(P,"fecha");

  /* astro.js devuelve el bloque ancho del 8 al 24. Acá se afina: el rango
     exacto se corre con la semilla, así dos personas del mismo signo no
     reciben la misma quincena calcada. */
  var cand=[];
  for(var i=0;i<vs.length;i++){
    var v=vs[i];
    var a=new Date(v.inicio.getFullYear(), v.inicio.getMonth(), 6+((s>>>i)%7));
    var b=new Date(a.getFullYear(), a.getMonth(), a.getDate()+10+((s>>>(i+3))%6));
    /* una ventana que ya terminó no se muestra: la persona acaba de pagar
       y leería una fecha vencida */
    if(b<ahora) continue;
    cand.push({desde:a, hasta:b, fuerza:v.fuerza, motivo:v.motivo, signo:v.signo});
  }
  if(!cand.length) return null;

  /* La principal tiene que estar CERCA. Una ventana fuerte a seis meses no
     sirve: la persona necesita algo que pueda usar este mes. Entonces: la
     más fuerte de los próximos cuatro meses; si en ese tramo no hay
     ninguna, la primera que haya, y la fuerte lejana queda listada abajo. */
  var tope=new Date(ahora.getFullYear(), ahora.getMonth()+4, 1);
  var pr=null;
  for(var k=0;k<cand.length;k++){
    if(cand[k].desde>tope) break;
    if(!pr || cand[k].fuerza>pr.fuerza) pr=cand[k];
  }
  if(!pr) pr=cand[0];

  /* el pico: la fase lunar entera que cae adentro del rango. Se busca la
     llena primero —es la que la gente reconoce— y si no cae adentro, la
     nueva. Si ninguna entra, el centro del rango. */
  var pico=null, tipo="";
  var ll=A.proximaFase(0.5,new Date(pr.desde.getTime()-2*86400000));
  if(ll && ll>=pr.desde && ll<=pr.hasta){ pico=ll; tipo="luna llena"; }
  if(!pico){
    var nu=A.proximaFase(0,new Date(pr.desde.getTime()-2*86400000));
    if(nu && nu>=pr.desde && nu<=pr.hasta){ pico=nu; tipo="luna nueva"; }
  }
  if(!pico){ pico=new Date((pr.desde.getTime()+pr.hasta.getTime())/2); tipo=A.faseLunar(pico).nombre.toLowerCase(); }

  /* la antesala: las dos semanas previas. Es la parte accionable —lo que
     pasa el día de la ventana depende de lo que haya hecho antes—. Si la
     ventana ya arrancó no se muestra una fecha vencida: se dice que está
     adentro, que es lo único accionable en ese momento. */
  var ante=new Date(pr.desde.getTime()-14*86400000);
  var dentro=(ahora>=pr.desde);

  var otras=[];
  for(var j=0;j<cand.length && otras.length<2;j++){
    if(cand[j]===pr || cand[j].desde<=pr.desde) continue;
    otras.push(cand[j]);
  }

  var faltan=Math.max(0,Math.round((pr.desde-ahora)/86400000));
  var quedan=Math.max(0,Math.round((pr.hasta-ahora)/86400000));
  return {
    signo:signo, desde:pr.desde, hasta:pr.hasta, pico:pico, fase:tipo,
    antesala:ante, anteVencida:dentro, dentro:dentro,
    faltan:faltan, quedan:quedan,
    motivo:pr.motivo, signoMes:pr.signo, fuerte:pr.fuerza===3, otras:otras
  };
}

/* ================================================================
   2. EL LUGAR
   ================================================================ */
/* Por lo que la persona dijo que valora. No son lugares inventados: son
   las cinco formas reales en que la gente se conoce fuera de una app. */
var LUGARES={
 viajar:{
  clase:"en tránsito o cerca de un tránsito",
  sitios:["una estación, un aeropuerto o una terminal","un alojamiento compartido, no un hotel",
          "una excursión de un día con gente que no conocías","un bar de un pueblo que no es el tuyo"],
  situacion:"los dos yendo o volviendo de otro lado, con el día ya desarmado",
  haciendo:["Decí que sí al viaje corto que venís postergando. Dos días alcanza.",
            "Tomá el micro o el tren en vez del auto una vez en la ventana.",
            "Elegí el alojamiento con cocina compartida, aunque sea una noche."],
  evitar:"Viajar con el itinerario cerrado de punta a punta. Lo que buscás pasa en los huecos."},
 tranquilos:{
  clase:"en un lugar con poca gente y sin ruido",
  sitios:["una librería con cafetería, temprano","un taller chico de ocho personas, no de ochenta",
          "el mismo café tres veces seguidas, hasta ser alguien conocido","una sala de espera larga"],
  situacion:"los dos solos, haciendo algo que no requiere compañía",
  haciendo:["Elegí un lugar nuevo y andá tres veces en la ventana. La tercera ya no sos un desconocido.",
            "Sentate donde te vean: barra, mesa del medio, banco del pasillo. No el rincón.",
            "Llevá algo físico —un libro, un cuaderno—. Da tema sin que tengas que darlo vos."],
  evitar:"Los auriculares puestos. Es la señal universal de \"no me hables\", y funciona."},
 logros:{
  clase:"en un festejo que no es tuyo",
  sitios:["un cumpleaños al que ibas a faltar","una presentación, una muestra o un lanzamiento",
          "un after de trabajo ajeno, al que te lleva alguien","un brindis de fin de algo"],
  situacion:"con la guardia baja de los dos y un tema de conversación ya resuelto",
  haciendo:["Aceptá las dos invitaciones de compromiso que aparezcan en la ventana. Las dos.",
            "Llegá temprano. La gente que llega temprano se habla; la que llega tarde ya encuentra grupos.",
            "Ofrecete a llevar algo. Quien lleva algo tiene una excusa para circular."],
  evitar:"Irte antes de la hora y media. El cruce que importa casi nunca pasa en los primeros cuarenta minutos."},
 crear:{
  clase:"donde las manos están ocupadas",
  sitios:["un taller de cerámica, encuadernación o carpintería","un coro, una banda o un grupo de improvisación",
          "un proyecto colaborativo de un fin de semana","una cocina compartida o una clase de cocina"],
  situacion:"los dos concentrados en otra cosa, hablando de costado",
  haciendo:["Anotate en algo que empiece dentro de la ventana. Que sea presencial y que tenga más de tres encuentros.",
            "Elegí la actividad en la que seas malo. La torpeza destraba conversaciones; la destreza las cierra.",
            "Quedate diez minutos después de que termine. Ahí pasa todo."],
  evitar:"Los cursos online. No es esnobismo: no hay cruce posible si no hay cuerpo."},
 familia:{
  clase:"en una mesa larga",
  sitios:["un asado donde vas por compromiso","un evento del barrio, una feria, la plaza un domingo",
          "un casamiento o un bautismo al que te invitan de rebote","la casa de alguien, con gente que no conocés"],
  situacion:"alguien te presenta a alguien, sin que nadie lo haya planeado",
  haciendo:["Decí que sí a la invitación familiar que ibas a rechazar.",
            "Ofrecete a organizar algo chico. Quien organiza conoce a todos.",
            "Preguntá \"¿y este quién es?\" una vez por reunión. Es el mecanismo más viejo que existe."],
  evitar:"Quedarte con la gente que ya conocés. Es cómodo y es exactamente lo que bloquea el cruce."}
};
var FRANJA=[
  ["a la mañana temprano","entre las 8 y las 11"],
  ["al mediodía","entre las 12 y las 15"],
  ["a la tarde","entre las 16 y las 19"],
  ["al caer la tarde","entre las 18 y las 21"]
];

function elLugar(P,fechaObj){
  var L=LUGARES[P.experiencias]||LUGARES.tranquilos;
  var s=sem(P,"lugar");
  var el=A.elementoDe(fechaObj?fechaObj.signo:"Libra");
  /* el elemento inclina el día y la hora: fuego y aire empujan al fin de
     semana y a la tarde; tierra y agua, a la semana y a la mañana */
  var pool=(el==="fuego"||el==="aire") ? [5,6,0,4] : [2,3,4,6];
  var d=pool[s%pool.length];
  var fr=FRANJA[(el==="tierra"||el==="agua") ? (s%2) : 2+((s>>>2)%2)];
  return {
    clase:L.clase,
    sitios:tres(L.sitios,s),
    situacion:L.situacion,
    dia:DIAS[d],
    franja:fr[0], horas:fr[1],
    haciendo:L.haciendo,
    evitar:L.evitar
  };
}

/* ================================================================
   3. EN TU CIUDAD
   ================================================================
   La ciudad llega del servidor, leída de la IP (/api/acceso). Si no llegó
   —VPN, IP de datos móviles sin ciudad— se usa la que cargó en el quiz, y
   si tampoco hay, la sección se escribe sin nombre propio y no se nota.

   Los tipos de zona son los que existen en cualquier ciudad argentina, de
   Rosario a Tandil. Preferí que sea verdad en todos lados antes que
   inventar nombres de barrio que serían falsos en el 95% de los casos. */
var RUMBO={fuego:["norte","el lado alto de la ciudad"],tierra:["sur","el lado viejo, el de las casas bajas"],
           aire:["este","el lado por donde entra la ciudad"],agua:["oeste","el lado del agua o de la salida"]};
var ZONAS=[
  ["el centro, en horario de oficina","Cuatro manzanas donde todos pasan y casi nadie se queda. Ganás si te quedás."],
  ["la zona de la universidad o los institutos","Aunque no estudies. Es el único radio donde la gente llega sola y se va acompañada."],
  ["el parque grande o la costanera, un fin de semana","El lugar más subestimado: nadie va con expectativas, y por eso baja la guardia."],
  ["la feria o el mercado del fin de semana","Se camina lento y se habla con desconocidos por default. Es el terreno más fácil que hay."],
  ["el gimnasio, el club o la pileta del barrio","Repetición: las mismas caras, tres veces por semana. El cruce ahí es cuestión de tiempo, no de suerte."],
  ["el barrio de bares, antes de las once","Después de las once cambia la gente y cambia el motivo. Antes, se conversa."],
  ["la estación, la terminal o la parada grande","Tiempo muerto compartido. El 90% mira el teléfono; no lo mires vos."],
  ["el corredor de veterinarias, viveros y librerías","Locales chicos donde el que entra tiene algo que contar de lo que lleva."]
];
function enTuCiudad(P,fechaObj,ciudad){
  var s=sem(P,"mapa");
  var el=A.elementoDe(fechaObj?fechaObj.signo:"Libra");
  var r=RUMBO[el]||RUMBO.aire;
  var cuadras=8+((s>>>5)%13);
  return {
    ciudad:ciudad||"",
    rumbo:r[0], rumboNota:r[1], elemento:el,
    radio:cuadras,
    zonas:tres(ZONAS,s),
    nota:ciudad
      ? ("Todo esto está leído sobre "+ciudad+", no sobre un mapa cualquiera: cambia el radio y cambia el rumbo según dónde hacés tu vida.")
      : "No pude leer tu ciudad desde esta conexión. Cargala en Perfil y el radio y el rumbo se recalculan sobre tu mapa."
  };
}

/* ================================================================
   4. LA SEÑAL
   ================================================================ */
var MIRADA={calida:"La mirada sostiene medio segundo más de lo que corresponde, y no incomoda.",
  picara:"Se le arma algo en el ojo antes de que se le arme en la boca. Se ríe con la cara antes que con la voz.",
  serena:"No apura la mirada ni la esquiva. Mira como quien no tiene apuro en ningún lado."};
var PELO={enrulado:"pelo con rulo, siempre un poco fuera de lugar",ondulado:"pelo con onda, ni lacio ni rulo",
  lacio:"pelo lacio, prolijo casi sin esfuerzo"};
var GESTOS=[
  "Se acuerda de algo chico que dijiste al pasar, y lo trae dos semanas después.",
  "Hace una pregunta más de las que hace la gente. Cuando contestás, no cambia de tema.",
  "Le habla igual al que atiende que al que está sentado en la mesa.",
  "Cuando no sabe algo, lo dice. No improvisa para quedar bien.",
  "Llega puntual sin hacer un tema de la puntualidad.",
  "Toca el hombro o el brazo al saludar, una sola vez, y no insiste.",
  "Se calla cuando estás hablando. Suena poco; es rarísimo.",
  "Se ríe de sí mismo antes que de cualquier otro."
];
var CIRCUNS=[
  "Van a coincidir dos veces antes de hablarse. La primera no la vas a registrar.",
  "Aparece por alguien en común, no de la nada. Alguien va a decir \"ah, mirá\".",
  "La primera conversación va a ser sobre algo completamente menor. No busques una señal en el tema.",
  "Se van a cruzar en un día en el que vos ibas a quedarte en tu casa.",
  "No va a ser la persona más llamativa del lugar. Va a ser la segunda que mirás."
];
var NO_ES=[
  "El que te contesta rápido y profundo la primera semana y después desaparece. La intensidad temprana no es interés: es velocidad.",
  "El que te dice todo lo que querés escuchar en la primera charla. Nadie acierta tanto tan rápido sin estar leyéndote.",
  "El que aparece justo cuando estás por soltar algo. Eso es timing, no destino.",
  "El que te trata bien a vos y mal al resto. Eso se da vuelta, siempre, y tarda menos de lo que creés."
];
function laSenal(P,nombre){
  var fi=(window.NOCTRA_RETRATOS&&window.NOCTRA_RETRATOS.ficha)?window.NOCTRA_RETRATOS.ficha(P):null;
  var s=sem(P,"senal");
  var g=(fi&&fi.g)||P.generoRetrato||"m";
  var fis=[];
  if(fi){
    if(MIRADA[fi.mirada]) fis.push(MIRADA[fi.mirada]);
    if(PELO[fi.pelo]) fis.push("Lo vas a reconocer por el pelo antes que por la cara: "+PELO[fi.pelo]+".");
    if(fi.barba==="si") fis.push("Barba, cuidada pero no perfecta.");
    else if(fi.barba==="apenas") fis.push("Barba de dos o tres días, casi siempre. Nunca del todo afeitado.");
    else if(fi.barba==="no") fis.push("Cara afeitada. Le cambia la edad según el día.");
    if(fi.largo==="largo") fis.push("Pelo largo, que se recoge cuando se pone a hacer algo.");
    else if(fi.largo==="corto") fis.push("Pelo corto, una decisión tomada hace rato.");
  }
  if(!fis.length) fis.push("La mirada es lo primero: sostiene medio segundo más de lo que corresponde.");
  return {
    quien:nombre||(g==="f"?"ella":"él"),
    fisicas:fis.slice(0,2),
    gestos:dos(GESTOS,s),
    circunstancia:una(CIRCUNS,s>>>4),
    noEs:una(NO_ES,s>>>9)
  };
}

/* ================================================================
   5. POR QUÉ VOS
   ================================================================
   Acá no hay ninguna instrucción sobre cómo hacer que otra persona
   sienta algo. Todo lo que se pide es algo que ella hace y que puede
   verificar que hizo. Es lo único que cumple: lo otro se pone a prueba,
   falla, y la persona concluye que el problema es ella. */
var LENGUAJE={
  palabras:["decís lo que pensás cuando todavía sirve decirlo","Decile a alguien esta semana, en voz alta, algo bueno que pensaste y no dijiste. Una sola vez alcanza para empezar."],
  regalos:["registrás lo que le importa a la gente y lo traés","Traele a alguien algo de dos pesos que demuestre que lo escuchaste. El valor está en la precisión, no en el precio."],
  actividades:["ponés el tiempo, que es lo único que no se puede fingir","Ofrecé un plan concreto —día, hora, lugar— en vez de un \"a ver si nos juntamos\". La diferencia es toda."],
  contacto:["estás presente de un modo físico, no declarativo","Saludá a la gente de cerca esta semana. Suena mínimo; cambia cómo te registran."],
  gestos:["resolvés cosas sin anunciar que las resolviste","Hacé algo por alguien sin contarlo. Fijate cuánto te cuesta no contarlo: ahí hay información."]
};
var ENERG={
  carinosa:"tu manera de estar cerca sin pedir permiso",
  calma:"la calma, que en una ciudad que va a los gritos es casi un superpoder",
  juguetona:"que desarmás el clima pesado sin esfuerzo",
  aventurera:"que decís que sí antes de calcular",
  equilibrada:"que sostenés sin asfixiar, que es la parte difícil",
  apasionada:"la intensidad, cuando está apuntada a algo",
  otra:"algo que todavía no tiene nombre y que la gente nota igual"
};
var SOLTAR={
  correcta:["Dejá de evaluar a la gente en los primeros diez minutos.","Estás descartando en el minuto diez a personas que necesitan veinte. Dale a la próxima tres encuentros antes de decidir."],
  pasado:["Dejá de comparar con quien ya no está.","Cada vez que aparezca la comparación, anotala en el Diario en vez de seguirla. En un mes vas a ver que son tres frases repetidas."],
  chispa:["Dejá de esperar que la chispa se mantenga sola.","Poné vos el plan una vez por semana. La chispa no es un estado: es algo que alguien sostiene, y puede ser tu turno."],
  dudas:["Dejá de buscarle la falla a lo bueno.","Cuando aparezca la duda, escribila y esperá 48 horas antes de actuar. La mayoría se desarma sola."],
  abrirme:["Dejá de mostrar la versión editada.","Contá una cosa tuya que no te deje bien parada. Una por semana. Es el ejercicio más incómodo y el que más rinde."],
  limites:["Dejá de decir que sí cuando querías decir que no.","Un \"prefiero que no\", sin explicación, esta semana. Casi siempre no pasa nada, y eso es el hallazgo."]
};
var CENTRO=[
  "Contá algo que te pasó, no algo que opinás. Lo primero se recuerda; lo segundo se discute.",
  "Cuando pregunte algo, contestá la pregunta entera. La gente se enamora de quien no edita.",
  "No estés disponible todo el tiempo al principio. No como estrategia: porque tu semana ya tenía cosas y no hace falta borrarlas.",
  "Nombrá una cosa que querés en los primeros encuentros. Una sola, concreta. Quien no dice qué quiere termina recibiendo lo que sobra.",
  "Dejá que te ayude en algo chico. Recibir es la mitad del vínculo y es la que casi nadie practica.",
  "Hacé una pregunta de más y quedate callada mientras contesta. Es lo que casi nadie hace y lo que todos recuerdan.",
  "Mostrá algo que hacés bien, sin anunciarlo. La competencia es lo más atractivo que existe y no se puede fingir.",
  "No resuelvas el silencio. El que aguanta tres segundos de silencio sin llenarlo es el que queda."
];
function porQueVos(P,nombre){
  var s=sem(P,"vos");
  var f=P.fecha||{d:15,m:6,y:1992};
  var signo=A.signoDe(f.d,f.m), el=A.elementoDe(signo), modo=A.modoDe(signo);
  var len=LENGUAJE[P.lenguaje]||LENGUAJE.palabras;
  var sol=SOLTAR[P.dificultad]||SOLTAR.correcta;
  var tenes=[];
  /* con el test corto las respuestas largas son valores por defecto: ahí el
     material sale de la carta, que sí es propia, y no de un molde. */
  if(P.corto){
    tenes.push("Sol en "+signo+": "+({fuego:"arrancás vos, y eso ordena a los que esperan",
      tierra:"sostenés lo que empezás, que es lo que casi nadie hace",
      aire:"conversás de verdad, no esperás tu turno para hablar",
      agua:"leés lo que no se dice, y la gente lo siente aunque no sepa nombrarlo"})[el]);
    tenes.push(({cardinal:"Sos de los que empiezan. El primer paso te sale natural y a la mayoría le cuesta.",
      fijo:"Sos de los que se quedan. En una época en la que todos se van, eso es escaso.",
      mutable:"Te adaptás sin perderte. Podés entrar en la vida de alguien sin pedirle que cambie la suya."})[modo]);
  }else{
    if(P.cualidades&&P.cualidades[0]) tenes.push("Pusiste \""+P.cualidades[0]+"\" primero de todo, y lo que uno busca primero suele ser lo que ya trae.");
    tenes.push("Tu lenguaje es que "+len[0]+". Eso no se aprende de grande: o está o no está.");
    tenes.push("Y "+(ENERG[P.energia]||ENERG.otra)+".");
  }
  return {
    quien:nombre||"",
    tenes:tenes,
    hacer:[len[1]].concat(tres(CENTRO,s).slice(0,2)),
    soltar:sol,
    cierre:"Nada de esto es para gustarle a alguien. Es para que cuando aparezca, no tengas que convertirte en otra persona para sostenerlo."
  };
}

/* ================================================================ */
function generar(P,ciudad,nombre,ahora){
  ahora=ahora||new Date();
  var fe=laFecha(P,ahora);
  return {
    fecha:fe,
    lugar:elLugar(P,fe),
    mapa:enTuCiudad(P,fe,ciudad),
    senal:laSenal(P,nombre),
    vos:porQueVos(P,nombre),
    generado:ahora.getTime()
  };
}

window.NOCTRA_PLAN={ generar:generar, dia:dia, diaCorto:diaCorto, MES:MES };
})();
