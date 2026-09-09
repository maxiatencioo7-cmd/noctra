/* Noctra app — perfil, almacenamiento y contenidos. */
(function(){
const KEY_QUIZ="noctra_v2", KEY_APP="noctra_app_v1";
const A=window.NOCTRA_ASTRO;
/* "Honesto/a" -> "Honesta" o "Honesto", según el género de la persona del retrato */
function gener(txt,g){return String(txt||"").replace(/([A-Za-zÁÉÍÓÚÑáéíóúñ]+?)o\/a\b/g,(m,w)=>g==="f"?w+"a":w+"o").replace(/([A-Za-zÁÉÍÓÚÑáéíóúñ]+?)a\/o\b/g,(m,w)=>g==="f"?w+"a":w+"o").replace(/([A-Za-zÁÉÍÓÚÑáéíóúñ]+?)\/a\b/g,(m,w)=>g==="f"?w+"a":w);}

/* ---------- perfil: viene del quiz, en el mismo origen ---------- */
function leerQuiz(){
  try{
    const raw=localStorage.getItem(KEY_QUIZ); if(!raw) return null;
    const s=JSON.parse(raw); const a=s&&s.a; if(!a||!a.fecha||!a.experiencias) return null;
    return {
      nombre:s.nombre||"", email:(s.compra&&s.compra.email)||(s.lead&&s.lead.email)||"",
      genero:a.genero, generoRetrato:a.generoRetrato||(a.interes==="x"?(a.genero==="m"?"f":"m"):a.interes),
      interes:a.interes, edad:a.edad, etnia:a.etnia, fecha:a.fecha,
      cualidades:(a.cualidades||[]).map(x=>gener(x,a.generoRetrato||(a.interes==="x"?(a.genero==="m"?"f":"m"):a.interes))), apariencia:a.apariencia, decision:a.decision,
      motivo:a.motivo, dificultad:a.dificultad, lenguaje:a.lenguaje,
      futuro:a.futuro||[], energia:a.energia, opuestos:a.opuestos, experiencias:a.experiencias,
      pelo:a.pelo||"a", ciudad:s.city||""
    };
  }catch(e){ return null; }
}
/* Perfil de muestra: sólo si alguien abre la app sin haber hecho el quiz. */
const DEMO={nombre:"",email:"",genero:"f",generoRetrato:"m",interes:"m",edad:"30",etnia:"libre",
  fecha:{d:14,m:9,y:1994},cualidades:["Leal","Honesto","Divertido","Comprensivo"],apariencia:"algo",
  decision:"emociones",motivo:"comunicacion",dificultad:"abrirme",lenguaje:"palabras",
  futuro:["Vivir aventuras","Crear lindos recuerdos"],energia:"calma",opuestos:3,experiencias:"tranquilos",pelo:"a",ciudad:"",demo:true};

/* ---------- estado propio de la app ---------- */
const vacio={
  v:1, creado:0, nombre:"", nacimiento:{hora:"",ciudad:""},
  revelado:false, leidas:{}, favoritas:{}, diario:[], personas:[], chat:[],
  maiaVisto:false, notif:{ventanas:true,lunas:true,bocetos:true,diaria:false,hora:"09:00"},
  rituales:{}, archivo:[], ultimaDiaria:""
};
function cargar(){ try{const r=localStorage.getItem(KEY_APP); return r?Object.assign({},vacio,JSON.parse(r)):Object.assign({},vacio,{creado:Date.now()});}catch(e){return Object.assign({},vacio,{creado:Date.now()});} }
let D=cargar();
function guardar(){ try{localStorage.setItem(KEY_APP,JSON.stringify(D));}catch(e){} }
function borrarTodo(){ try{localStorage.removeItem(KEY_APP);}catch(e){} D=Object.assign({},vacio,{creado:Date.now()}); }

const P=leerQuiz()||DEMO;
if(!D.creado) { D.creado=Date.now(); guardar(); }
if(!D.nombre && P.nombre) D.nombre=P.nombre;

const dias=()=>Math.floor((Date.now()-(D.creado||Date.now()))/86400000);

/* ---------- rituales: doce prácticas, una por mes, atadas a la fase ---------- */
const RITUALES=[
 {id:1,mes:0,fase:"nueva",titulo:"La lista de lo que ya no",min:12,mat:"Papel y algo para romperlo",
  pasos:["Escribí en una hoja las tres cosas que hiciste en tu última relación y no querés repetir. Sin culpar a nadie: sólo lo tuyo.","Debajo de cada una, escribí qué la disparaba. No el hecho, el momento previo.","Rompé la hoja. Guardá los pedazos una semana. Si a la semana no te acordás de las tres, es porque ya no pesan tanto."],
  cierre:"La luna nueva no borra nada. Sirve para nombrar lo que se termina."},
 {id:2,mes:1,fase:"llena",titulo:"Soltar una conversación pendiente",min:15,mat:"Ninguno",
  pasos:["Elegí una conversación que estás postergando. Una sola.","Escribila entera como si la fueras a tener: lo que decís vos, lo que contesta el otro, lo que contestás vos.","Leela en voz alta una vez. Después decidí si la vas a tener de verdad o si ya la tuviste acá."],
  cierre:"La mitad de las conversaciones pendientes no eran con la otra persona."},
 {id:3,mes:2,fase:"nueva",titulo:"Una hora sin explicarte",min:60,mat:"Tu teléfono en otra habitación",
  pasos:["Una hora haciendo algo que te gusta, sin contarle a nadie que lo estás haciendo.","Sin fotos, sin mensajes, sin avisar.","Al terminar, anotá en el diario cómo te sentiste en el minuto veinte."],
  cierre:"Si te costó, ahí hay información sobre cuánto de lo que hacés es para ser vista."},
 {id:4,mes:3,fase:"llena",titulo:"El inventario de señales",min:10,mat:"El diario de la app",
  pasos:["Abrí tus entradas del último mes.","Marcá las que escribiste dentro de una ventana de encuentro.","Buscá si hay algo repetido: un lugar, una hora, un tipo de persona."],
  cierre:"Los patrones no se intuyen, se cuentan."},
 {id:5,mes:4,fase:"nueva",titulo:"Pedir algo chico",min:5,mat:"Ninguno",
  pasos:["Pedile algo concreto y menor a alguien de confianza hoy.","Que sea algo que normalmente resolverías sola.","Anotá cuánto tardaste en pedirlo desde que lo pensaste."],
  cierre:"Practicar pedir en lo chico es lo único que hace posible pedir en lo grande."},
 {id:6,mes:5,fase:"llena",titulo:"La carta que no se manda",min:20,mat:"Papel",
  pasos:["Escribile a la última persona que te importó todo lo que no dijiste.","Sin cuidar la forma. Nadie la va a leer.","Guardala cerrada. Volvé a leerla dentro de seis meses."],
  cierre:"No es para perdonar a nadie. Es para dejar de discutir con alguien que no está."},
 {id:7,mes:6,fase:"nueva",titulo:"Media hora en circulación",min:30,mat:"Ninguno",
  pasos:["Elegí un lugar de tu ciudad donde haya gente y puedas quedarte sin consumir nada.","Andá media hora, sin auriculares.","No tenés que hablar con nadie. Sólo estar disponible."],
  cierre:"Estar disponible es una práctica, no un estado de ánimo."},
 {id:8,mes:7,fase:"llena",titulo:"Revisar el estándar",min:15,mat:"El retrato",
  pasos:["Mirá tu retrato y escribí las tres cosas que más te importan de esa persona.","Ahora escribí las tres últimas personas con las que saliste.","Cruzá: ¿cuántas tenían esas tres cosas?"],
  cierre:"El estándar no es el problema. El problema es no aplicarlo."},
 {id:9,mes:8,fase:"nueva",titulo:"Un no completo",min:5,mat:"Ninguno",
  pasos:["Esta semana, decí que no a algo sin dar explicación.","No \"no puedo porque\". Sólo \"no puedo\" o \"prefiero que no\".","Anotá qué pasó después. Casi siempre: nada."],
  cierre:"Los límites que se explican demasiado se negocian."},
 {id:10,mes:9,fase:"llena",titulo:"Agradecer con precisión",min:10,mat:"Tu teléfono",
  pasos:["Elegí a alguien que hizo algo por vos este año.","Escribile un mensaje nombrando exactamente qué hizo y qué te cambió.","Mandalo. Sin cerrarlo con un pedido."],
  cierre:"Practicar el lenguaje del amor con quien ya está es entrenamiento para quien va a llegar."},
 {id:11,mes:10,fase:"nueva",titulo:"El plan de la primera cita",min:12,mat:"Ninguno",
  pasos:["Diseñá la primera cita que te gustaría tener, con detalle: lugar, hora, duración.","Que dure menos de dos horas y que se pueda estirar si va bien.","Guardala. La próxima vez que surja, no vas a tener que improvisar."],
  cierre:"Improvisar en el momento es lo que te hace decir que sí a lugares donde no funcionás."},
 {id:12,mes:11,fase:"llena",titulo:"El año en cinco líneas",min:20,mat:"El diario de la app",
  pasos:["Releé tus entradas del año.","Escribí cinco líneas: qué cambió, qué no, a quién conociste, qué dejaste de hacer, qué querés del año que viene.","Guardalo como entrada del diario con la etiqueta nota."],
  cierre:"Un año se entiende sólo cuando se escribe."}
];

/* ---------- lecturas diarias ---------- */
const TEMAS=["señal","cuerpo","límite","memoria","apertura","paciencia","atención"];
function diaria(P,f){
  f=f||new Date();
  const fase=A.faseLunar(f), signo=A.signoDe(P.fecha.d,P.fecha.m), el=A.elementoDe(signo);
  const idx=Math.floor(f.getTime()/86400000);
  const t=TEMAS[idx%TEMAS.length];
  const nom=fase.nombre;
  const base={
    "señal":`Hoy la luna está ${nom.toLowerCase()} y tu elemento es ${el}. No busques una señal grande: buscá si alguien te hizo una pregunta que nadie te hace. Anotala en el diario aunque no signifique nada todavía.`,
    "cuerpo":`${nom}. Elegiste una energía ${P.energia==="calma"?"calma":"que te mueva"} para tu vínculo, y eso se entrena en el cuerpo antes que en la cabeza. Hoy: caminá diez minutos sin destino y sin auriculares.`,
    "límite":`Con la luna ${nom.toLowerCase()}, hoy tenés margen para decir una cosa que venís postergando. Una sola, y corta. Lo que más te cuesta —${DIF_CORTO[P.dificultad]||"lo tuyo"}— se ablanda con repetición, no con una gran decisión.`,
    "memoria":`${nom}. Dijiste que tus relaciones anteriores se cayeron por ${MOT_CORTO[P.motivo]||"algo que ya nombraste"}. Hoy no lo revises: sólo fijate si hoy hiciste algo de eso vos.`,
    "apertura":`Luna ${nom.toLowerCase()}. Tu lenguaje del amor es ${LEN_CORTO[P.lenguaje]||"el que elegiste"}. Hoy usalo con alguien que ya está en tu vida. Es la única forma de tenerlo aceitado cuando aparezca quien buscás.`,
    "paciencia":`${nom}. En ${el} la prisa se disfraza de intuición. Si hoy querés apurar algo, esperá hasta mañana a esta hora. Si mañana lo seguís queriendo, hacelo.`,
    "atención":`Luna ${nom.toLowerCase()}. Valorás ${EXP_CORTO[P.experiencias]||"lo compartido"}. Hoy prestá atención a quién de tu entorno busca eso mismo. Las coincidencias empiezan siendo aburridas.`
  };
  return {tema:t, fase:fase, texto:base[t]};
}
const DIF_CORTO={correcta:"conocer a la persona correcta",pasado:"soltar lo anterior",chispa:"sostener la chispa",dudas:"manejar las dudas",abrirme:"abrirte",limites:"poner límites"};
const MOT_CORTO={confianza:"falta de confianza",comunicacion:"mala comunicación",distancia:"distancia",objetivos:"objetivos distintos",infidelidad:"una traición",egoismo:"egoísmo",otro:"algo que ya nombraste"};
const LEN_CORTO={palabras:"las palabras",regalos:"los detalles",actividades:"el tiempo compartido",contacto:"el contacto",gestos:"los gestos de ayuda"};
const EXP_CORTO={viajar:"viajar",tranquilos:"los momentos tranquilos",logros:"festejar logros",crear:"crear cosas juntos",familia:"el tiempo en familia"};

/* ---------- sugerencias de circulación según lo que valora ---------- */
const DONDE={
 viajar:["Una escapada de dos días a menos de trescientos kilómetros. Sola o con una amiga: las dos funcionan.","Tomate el tren o el micro en vez del auto una vez este mes. La gente se habla ahí.","Alojamiento compartido en vez de hotel, aunque sea una noche."],
 tranquilos:["Una librería con cafetería, un sábado a la mañana temprano. Es el horario con menos ruido y más gente sola.","Un club de lectura o un taller chico. Ocho personas, no ochenta.","Cambiá de café: andá tres veces al mismo lugar nuevo. La tercera vez ya sos alguien conocido."],
 logros:["Aceptá las invitaciones a festejos ajenos que venís esquivando. Ahí la gente tiene la guardia baja.","Presentaciones, muestras, lanzamientos. Copa en mano, tema de conversación resuelto.","Un after de trabajo que no sea el tuyo. Que te lleve alguien."],
 crear:["Un taller de algo manual: cerámica, encuadernación, carpintería. Las manos ocupadas destraban la conversación.","Un proyecto colaborativo corto, de esos de un fin de semana.","Un coro, una banda, un grupo de improvisación. Ridículo al principio, eficaz siempre."],
 familia:["Los cumpleaños y asados a los que te invitan por compromiso. Ahí siempre hay alguien que llega con otro.","Ofrecete a organizar algo. Quien organiza conoce a todos.","Actividades de barrio: ferias, eventos de la cuadra, la plaza un domingo."]
};

window.NOCTRA_DATOS={
  P, D, guardar, borrarTodo, dias, RITUALES, diaria, DONDE,
  DIF_CORTO, MOT_CORTO, LEN_CORTO, EXP_CORTO,
  esDemo:!!P.demo
};
})();
