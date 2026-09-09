/* Noctra — Maia. Guía conversacional local: interpreta el perfil, la carta y el diario.
   No es una persona. No predice. Nunca inventa datos que la persona no dio. */
(function(){
const AS=window.NOCTRA_ASTRO, DT=window.NOCTRA_DATOS;
const norm=s=>(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const low=s=>(s||"").charAt(0).toLowerCase()+(s||"").slice(1);
function lista(a,m){a=(a||[]).slice(0,m||3);return a.length<2?(a[0]||""):a.slice(0,-1).join(", ")+" y "+a[a.length-1];}

const PRESENTACION="Soy Maia, una guía de inteligencia artificial de Noctra. No predigo el futuro: interpreto tu carta y las respuestas que me diste. Tomalo como una herramienta para pensar, no como una profecía.";

/* --- señales de angustia seria: se cambia de registro, se deja de interpretar --- */
const CRISIS=/\b(me quiero morir|quiero morirme|matarme|suicid|no quiero vivir|no vale la pena vivir|hacerme dano|hacerme dano|lastimarme|cortarme|autolesion|desaparecer para siempre|no doy mas y quiero terminar)\w*/;
const RIESGO_TERCEROS=/\b(me pega|me golpea|me amenaza|abuso|me obliga|violencia|me tiene miedo|no me deja salir|me controla el telefono)\w*/;
const MEDICO=/\b(medicamento|antidepresiv|ansiolitic|diagnostic|tengo (ansiedad|depresion)|dosis|psiquiatr|receta|sintoma|enfermedad|tratamiento)\w*/;
const LEGAL=/\b(abogad|juicio|demanda|divorcio legal|tenencia|denuncia penal|contrato|herencia)\w*/;
const PLATA=/\b(invertir|inversion|acciones|cripto|prestamo|deuda|plazo fijo|dolar|comprar dolares)\w*/;

function crisis(){
  return "Voy a parar de interpretar acá, porque lo que escribiste importa más que cualquier lectura.\n\nNo soy una persona ni un profesional de salud mental, y esto necesita a alguien que sí lo sea. En Argentina podés llamar gratis a la línea 135 (CABA y GBA) o al 0800 345 1435 desde todo el país, las 24 horas. Si estás en riesgo ahora mismo, 911.\n\nSi preferís no llamar, escribile a alguien de confianza hoy, aunque sea una línea. No hace falta que expliques todo.\n\nAcá sigo cuando quieras volver, pero no quiero que esto reemplace lo otro.";
}
function riesgo(){
  return "Eso que contás no es un tema de compatibilidad ni de carta astral, y no te lo voy a leer así.\n\nSi hay alguien que te lastima, te amenaza o te controla, en Argentina existe la línea 144, gratuita, las 24 horas, desde todo el país. Si es una urgencia, 911.\n\nNo tengo forma de saber tu situación completa y no quiero opinar de más. Sólo quiero que sepas que eso tiene un lugar donde consultarse en serio.";
}

const P=()=>DT.P, D=()=>DT.D;

function ctx(){
  const p=P(), f=p.fecha;
  const signo=AS.signoDe(f.d,f.m), el=AS.elementoDe(signo), modo=AS.modoDe(signo), reg=AS.regenteDe(signo);
  const luna=AS.signoLunar(new Date(Date.UTC(f.y,f.m-1,f.d,12)));
  const asc=D().nacimiento.hora?AS.ascendenteAprox(signo,D().nacimiento.hora):"";
  return {p,signo,el,modo,reg,luna,asc,fase:AS.faseLunar(new Date()),vent:AS.ventanas(signo)};
}

/* ---------- intenciones ---------- */
const INT=[
 {id:"reconocer",k:["como lo voy a reconocer","como la voy a reconocer","como lo reconozco","reconocer","como se si es","como saber si es","es la persona","sera el","sera ella"],
  r(c){const p=c.p,g=p.generoRetrato==="f"?"ella":"él";
   return `No por la cara. Eso es lo primero que te tengo que decir, aunque el retrato sea lo que compraste.\n\nSe reconoce por tres cosas que vos misma dejaste escritas.\n\nUna: pusiste ${p.cualidades[0]?low(p.cualidades[0]):"lo que pusiste"} primero entre las cualidades. Fijate si esta persona lo tiene cuando le cuesta, no cuando le sale fácil.\n\nDos: tu lenguaje del amor es ${DT.LEN_CORTO[p.lenguaje]}. ${g==="él"?"Él":"Ella"} no tiene que adivinarlo, pero sí tiene que ajustarse cuando se lo decís. La diferencia entre alguien que te quiere y alguien que te sirve está ahí.\n\nTres: después de verlo no quedás agotada. Esa es la más aburrida y la más confiable.\n\nY una advertencia honesta: si te pasás midiendo, no vas a conocer a nadie. Usá esto para descartar, no para elegir.`}},

 {id:"luna",k:["mi luna","contame de mi luna","luna","signo lunar","carta natal","mi carta","ascendente","mi signo"],
  r(c){const p=c.p;
   let t=`Sol en ${c.signo}: ${c.el}, modalidad ${c.modo}, regido por ${c.reg}. Eso es lo que mostrás.\n\nLuna en ${c.luna}: es lo que necesitás cuando nadie mira. ${LUNA_TXT[c.luna]||""}\n\n`;
   t+=c.asc?`Con la hora que cargaste, tu ascendente aproximado es ${c.asc}. Es la puerta: lo primero que registra alguien que te acaba de conocer.\n\n`
           :`No cargaste la hora de nacimiento, así que el ascendente no lo calculo. Si la sabés, agregala en Perfil y te lo sumo a la lectura.\n\n`;
   t+=`Lo que hago con esto en la práctica: de tu ${c.signo} salen las ventanas de encuentro del calendario, y de tu elemento sale cómo está escrita la sección de personalidad. No es decoración.`;
   return t;}},

 {id:"abrirme",k:["me cuesta abrirme","abrirme","no me abro","confiar","desconfio","me cierro","no me animo a mostrar"],
  r(c){const p=c.p;
   if(p.dificultad==="abrirme") return `Me lo dijiste vos en el quiz: lo que más te cuesta hoy es abrirte con la gente. Así que no te voy a explicar que te pasa, te voy a decir de dónde viene según lo demás que contestaste.\n\nTambién dijiste que tus relaciones anteriores no funcionaron por ${DT.MOT_CORTO[p.motivo]}. Abrirse después de eso no es un problema de personalidad: es una conclusión que sacaste y que en su momento te sirvió.\n\nLo que veo: no te cuesta hablar, te cuesta hablar primero. Esperás una señal que confirme que es seguro, y la señal casi nunca llega antes, llega después.\n\nAlgo concreto: esta semana contale a alguien una cosa de nivel medio. No lo más profundo. Algo que te dé un poco de vergüenza y nada más. Anotalo en el diario. Eso se entrena.`;
   return `No me dijiste que abrirte fuera lo que más te cuesta —pusiste ${DT.DIF_CORTO[p.dificultad]}—, así que te contesto sin asumir.\n\nSi hoy te está costando mostrarte, fijate si es con todos o con alguien en particular. Si es con alguien en particular, no es un rasgo tuyo: es información sobre esa persona.\n\nY guardá esto en el diario, aunque sea corto. Lo que se repite ahí después se ve.`}},

 {id:"pasado",k:["mi ex","olvidar a mi ex","superar","no lo puedo olvidar","sigo pensando en","relacion anterior","me dejo","volver con"],
  r(c){const p=c.p;
   return `Dijiste que tus relaciones anteriores se cayeron por ${DT.MOT_CORTO[p.motivo]}. Eso no se supera entendiéndolo: ya lo entendés. Se supera cuando deja de organizarte las decisiones nuevas.\n\nUna pregunta para vos, no para mí: ¿qué cosas dejaste de hacer por lo que pasó? Esa lista es el costo real, y suele ser más larga de lo que uno cree.\n\nSi querés, escribila en el Diario como nota. Dentro de un mes la app te va a mostrar si algo de eso volvió.\n\nY algo que sí te puedo decir con datos tuyos: pusiste ${p.cualidades[0]?low(p.cualidades[0]):"esa cualidad"} primero. Eso no lo elegiste al azar, lo elegiste por ausencia. Ahí está lo que te falta cerrar.`}},

 {id:"conociendo",k:["estoy conociendo a alguien","conoci a alguien","me gusta alguien","salgo con","estoy saliendo","hay alguien"],
  r(c){const p=c.p;
   return `Bien. Antes de interpretar nada: cargalo en Encuentro → Compatibilidad con el nombre y la fecha de nacimiento, y te hago la sinastría de verdad, no un porcentaje.\n\nMientras tanto, tres preguntas que valen más que la carta:\n\n¿Te contesta o te sigue el ritmo? No es lo mismo.\n\n¿Aparece cuando no hay nada divertido para hacer?\n\n¿Te acordás de algo que te haya preguntado sobre vos, y no sobre la situación?\n\nY guardá una entrada en el Diario hoy con el tipo "conocí a alguien". Si esto sigue, dentro de dos meses vas a querer leer lo que pensabas ahora.`}},

 {id:"cuando",k:["cuando lo voy a conocer","cuando la voy a conocer","cuando","fecha","va a pasar","ventana","cuanto falta"],
  r(c){const v=c.vent[0], M=window.NOCTRA_UI.MESES;
   if(!v) return "Las ventanas se calculan desde tu signo solar. Abrí la pestaña Encuentro y vas a ver los próximos doce meses marcados.";
   return `Te voy a contestar con cuidado, porque acá es donde este tipo de apps miente.\n\nNo sé cuándo vas a conocer a alguien. Nadie lo sabe. Lo que sí puedo calcular es cuándo tu carta indica períodos más favorables para vincularte, y el próximo empieza alrededor del ${v.inicio.getDate()} de ${M[v.inicio.getMonth()]} y va hasta el ${v.fin.getDate()} de ${M[v.fin.getMonth()]}.\n\n${v.motivo}\n\nLo que eso significa en la práctica: es un buen tramo para aceptar invitaciones, no para quedarte esperando. Una ventana sin salir de casa es una ventana cerrada.`}},

 {id:"retrato",k:["el retrato","el dibujo","se parece","de donde salio","como lo hiciste","es real el retrato","la cara"],
  r(c){const p=c.p;
   return `El retrato es una interpretación de tus respuestas, dibujada a lápiz. No es una foto de nadie que exista, y no te voy a decir que lo sea.\n\nDe dónde salió cada cosa: el género y la franja de edad, de las preguntas 2 y 3. Los rasgos generales, del origen que elegiste. La mirada y la boca, de la energía que pediste (${p.energia}) y de las cualidades que pusiste primero. La expresión, de lo que dijiste sobre cuánto te importa el físico.\n\nPara qué sirve entonces: para tener una imagen concreta de lo que estás buscando. Suena poco y no lo es. La gente que sabe lo que busca lo reconoce más rápido, y sobre todo descarta más rápido.\n\nLo que no hace: no es una predicción y no es una foto. Está en el pie de la lectura y te lo digo también acá.`}},

 {id:"segura",k:["no estoy segura","no estoy seguro","esto es real","es verdad","creer","estafa","funciona esto","es magia"],
  r(c){
   return `Me parece bien que dudes, y prefiero contestarte esto que venderte.\n\nLo que Noctra es: una interpretación construida con las quince respuestas que diste y con tu carta. Todo lo que leés está armado con tus datos; si hubieras contestado otra cosa, diría otra cosa.\n\nLo que Noctra no es: una predicción. Nadie puede decirte cuándo ni con quién. Cualquiera que te lo diga con seguridad te está mintiendo, cobre lo que cobre.\n\nPara qué sirve entonces, en serio: para ordenar lo que buscás, ver los patrones que repetís y tener algo que consultar cuando aparezca alguien. Eso lo hace, y lo hace bien.\n\nSi con eso te parece que no vale, decilo sin culpa. Prefiero eso a que te quedes esperando algo que no va a pasar.`}},

 {id:"desafios",k:["que va a fallar","desafios","problemas","va a durar","miedo a que","se repita"],
  r(c){const p=c.p;
   return `El patrón que se arma con lo que contestaste es este: ${p.motivo==="confianza"||p.motivo==="infidelidad"?"llegás con el sistema de alarma encendido antes de que pase nada":p.motivo==="comunicacion"?"das por obvio lo que no dijiste, y leés como desinterés lo que es falta de información":p.motivo==="distancia"?"dejás enfriar sin señalar, porque señalar se te parece a exigir":p.motivo==="objetivos"?"postergás las conversaciones grandes para no arruinar el momento":p.motivo==="egoismo"?"das de más al principio y te resentís después por un desequilibrio que empezaste vos":"repetís la forma de vincularte que conocés, aunque ya sepas que no te sirve"}.\n\nY lo que más te cuesta hoy —${DT.DIF_CORTO[p.dificultad]}— es exactamente lo que ese patrón necesita para seguir funcionando.\n\nEsto no lo digo para asustarte. Lo digo porque la sección "Desafíos" de tu lectura lo desarrolla entero, y es la que más te conviene releer. Está en la pestaña Lectura.`}},

 {id:"lenguaje",k:["lenguaje del amor","como demuestro","como me quieren","que necesito","me siento querida"],
  r(c){const p=c.p;
   return `Tu lenguaje del amor es ${DT.LEN_CORTO[p.lenguaje]}. Lo elegiste vos en la pregunta 11.\n\nLo que suele pasar con eso: uno da en el idioma que quiere recibir. Fijate si estás dando ${DT.LEN_CORTO[p.lenguaje]} y esperando que el otro entienda que eso significa algo.\n\nLa parte útil: se puede pedir. "Necesito que me lo digas", "necesito que estés", "necesito que me acompañes a esto". No es exigir. Es ahorrarle a la otra persona un año de adivinar.\n\nY una cosa más: elegiste ${DT.EXP_CORTO[p.experiencias]} como la experiencia que más valorás. Ahí es donde tu lenguaje se nota más. Ese es el terreno donde te conviene invitar a alguien.`}},

 {id:"diario",k:["diario","que anote","escribi","mis entradas","que vi"],
  r(c){const n=D().diario.length;
   if(!n) return "Todavía no escribiste nada en el diario. Empezá por algo mínimo: una señal que viste, alguien que apareció, un sueño. Lo que sirve no es la entrada de hoy: es leer diez entradas dentro de tres meses y ver lo que se repite.";
   return `Tenés ${n} entrada${n>1?"s":""} en el diario. La app las cruza sola con tus ventanas de encuentro y con las cinco señales de tu lectura; cuando hay coincidencia te lo marca ahí mismo.\n\nSi querés que mire algo puntual, contámelo acá y lo pensamos, pero el cruce lo hace la pestaña Diario mejor que yo.`}},

 {id:"quien",k:["quien sos","sos real","sos humana","sos una persona","sos un bot","inteligencia artificial","chatgpt"],
  r(){return PRESENTACION+"\n\nNo hay nadie del otro lado escribiendo. Lo que tengo cargado son tus quince respuestas del quiz, tu carta, tu lectura, tus entradas del diario y las personas que hayas guardado en compatibilidad. Por eso puedo contestarte cosas que un chat genérico no, y por eso no puedo contestarte cosas que dependan de saber el futuro."}},

 {id:"ritual",k:["ritual","practica","ejercicio","que hago hoy","luna llena","luna nueva"],
  r(c){const R=DT.RITUALES[new Date().getMonth()];
   return `La práctica de este mes es "${R.titulo}", de ${R.min} minutos, para luna ${R.fase}. Hoy la luna está ${c.fase.nombre.toLowerCase()}.\n\n${R.pasos[0]}\n\nEstá completa en Encuentro → Rituales. Son ejercicios de escritura y de atención con envoltorio lunar; no tienen nada de mágico y funcionan igual.`}}
];

const LUNA_TXT={
 Aries:"Necesitás reaccionar rápido y que no te frenen mientras lo hacés.",
 Tauro:"Necesitás constancia y cosas que no cambien de lugar.",
 Géminis:"Necesitás hablarlo para saber qué sentís. Antes de decirlo, no lo sabés.",
 Cáncer:"Necesitás sentirte en casa antes de mostrarte, y la casa la construís vos.",
 Leo:"Necesitás que te vean, y te da vergüenza necesitarlo.",
 Virgo:"Necesitás entender el mecanismo antes de entregarte al resultado.",
 Libra:"Necesitás que haya acuerdo, y a veces cedés antes de saber qué querías.",
 Escorpio:"Necesitás profundidad o nada. El punto medio te aburre y te ofende un poco.",
 Sagitario:"Necesitás que quede aire. La promesa sin margen te asfixia.",
 Capricornio:"Necesitás pruebas antes que declaraciones. Y tardás en pedirlas.",
 Acuario:"Necesitás distancia para acercarte. No es contradicción, es tu ritmo.",
 Piscis:"Necesitás que te lean sin explicar, y después te frustra que no lo hagan."
};

const PILDORAS=["¿Cómo lo voy a reconocer?","Contame de mi luna","Estoy conociendo a alguien","No estoy segura de esto"];

function responder(txt){
  const t=norm(txt);
  if(CRISIS.test(t)) return {tipo:"crisis",texto:crisis()};
  if(RIESGO_TERCEROS.test(t)) return {tipo:"riesgo",texto:riesgo()};
  if(MEDICO.test(t)) return {tipo:"limite",texto:"Eso es salud, y no lo toco: no diagnostico, no opino de medicación y no reemplazo a un profesional. Es un límite mío y no lo voy a cruzar aunque me insistas.\n\nLo que sí puedo hacer es hablar de cómo te vinculás y de lo que contestaste en el quiz. Si querés seguimos por ahí."};
  if(LEGAL.test(t)) return {tipo:"limite",texto:"De temas legales no opino: no sé de leyes y una respuesta mía podría costarte caro. Eso lo tiene que ver alguien con matrícula.\n\nSi hay algo del vínculo detrás de eso, de eso sí podemos hablar."};
  if(PLATA.test(t)) return {tipo:"limite",texto:"De plata e inversiones no doy consejo. No soy asesora financiera y no tengo forma de saber tu situación.\n\nSi lo que pesa es cómo afecta a una relación, hablemos de eso."};

  let mejor=null,pts=0;
  for(const i of INT){
    let p=0;
    for(const k of i.k){ if(t.includes(norm(k))) p+=norm(k).split(" ").length*2; }
    if(p>pts){pts=p;mejor=i;}
  }
  const c=ctx();
  if(mejor&&pts>=2) return {tipo:"int",id:mejor.id,texto:mejor.r(c)};

  /* sin coincidencia: se responde con lo que hay, sin inventar */
  const p=c.p;
  const preg=/\?$/.test(txt.trim());
  return {tipo:"abierto",texto:`No tengo una lectura hecha para eso, y prefiero decirlo antes que improvisar algo que suene bien.\n\nLo que sí tengo cargado de vos: sos de ${c.signo}, elemento ${c.el}; buscás ${lista((p.cualidades||[]).map(low),3)}; tu lenguaje del amor es ${DT.LEN_CORTO[p.lenguaje]}; lo que más te cuesta es ${DT.DIF_CORTO[p.dificultad]}; y valorás ${DT.EXP_CORTO[p.experiencias]}.\n\n${preg?"Volvé a preguntármelo apuntando a una de esas cosas y te contesto en serio.":"Si querés, contame un poco más y lo miramos desde ahí."}`};
}

window.NOCTRA_MAIA={responder,PRESENTACION,PILDORAS};
})();
