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
 {id:"reconocer",cat:"Sobre el retrato",t:"¿Cómo lo voy a reconocer?",k:["como lo voy a reconocer","como la voy a reconocer","como lo reconozco","reconocer","como se si es","como saber si es","es la persona","sera el","sera ella"],
  r(c){const p=c.p,g=p.generoRetrato==="f"?"ella":"él";
   return `No por la cara. Eso es lo primero que te tengo que decir, aunque el retrato sea lo que compraste.\n\nSe reconoce por tres cosas que vos misma dejaste escritas.\n\nUna: pusiste ${p.cualidades[0]?low(p.cualidades[0]):"lo que pusiste"} primero entre las cualidades. Fijate si esta persona lo tiene cuando le cuesta, no cuando le sale fácil.\n\nDos: tu lenguaje del amor es ${DT.LEN_CORTO[p.lenguaje]}. ${g==="él"?"Él":"Ella"} no tiene que adivinarlo, pero sí tiene que ajustarse cuando se lo decís. La diferencia entre alguien que te quiere y alguien que te sirve está ahí.\n\nTres: después de verlo no quedás agotada. Esa es la más aburrida y la más confiable.\n\nY una advertencia honesta: si te pasás midiendo, no vas a conocer a nadie. Usá esto para descartar, no para elegir.`}},

 {id:"luna",cat:"Tu carta",t:"Contame de mi luna",k:["mi luna","contame de mi luna","luna","signo lunar","carta natal","mi carta","ascendente","mi signo"],
  r(c){const p=c.p;
   let t=`Sol en ${c.signo}: ${c.el}, modalidad ${c.modo}, regido por ${c.reg}. Eso es lo que mostrás.\n\nLuna en ${c.luna}: es lo que necesitás cuando nadie mira. ${LUNA_TXT[c.luna]||""}\n\n`;
   t+=c.asc?`Con la hora que cargaste, tu ascendente aproximado es ${c.asc}. Es la puerta: lo primero que registra alguien que te acaba de conocer.\n\n`
           :`No cargaste la hora de nacimiento, así que el ascendente no lo calculo. Si la sabés, agregala en Perfil y te lo sumo a la lectura.\n\n`;
   t+=`Lo que hago con esto en la práctica: de tu ${c.signo} salen las ventanas de encuentro del calendario, y de tu elemento sale cómo está escrita la sección de personalidad. No es decoración.`;
   return t;}},

 {id:"abrirme",cat:"Lo que te está pasando",t:"Me cuesta abrirme",k:["me cuesta abrirme","abrirme","no me abro","confiar","desconfio","me cierro","no me animo a mostrar"],
  r(c){const p=c.p;
   if(p.dificultad==="abrirme") return `Me lo dijiste vos en el quiz: lo que más te cuesta hoy es abrirte con la gente. Así que no te voy a explicar que te pasa, te voy a decir de dónde viene según lo demás que contestaste.\n\nTambién dijiste que tus relaciones anteriores no funcionaron por ${DT.MOT_CORTO[p.motivo]}. Abrirse después de eso no es un problema de personalidad: es una conclusión que sacaste y que en su momento te sirvió.\n\nLo que veo: no te cuesta hablar, te cuesta hablar primero. Esperás una señal que confirme que es seguro, y la señal casi nunca llega antes, llega después.\n\nAlgo concreto: esta semana contale a alguien una cosa de nivel medio. No lo más profundo. Algo que te dé un poco de vergüenza y nada más. Anotalo en el diario. Eso se entrena.`;
   return `No me dijiste que abrirte fuera lo que más te cuesta —pusiste ${DT.DIF_CORTO[p.dificultad]}—, así que te contesto sin asumir.\n\nSi hoy te está costando mostrarte, fijate si es con todos o con alguien en particular. Si es con alguien en particular, no es un rasgo tuyo: es información sobre esa persona.\n\nY guardá esto en el diario, aunque sea corto. Lo que se repite ahí después se ve.`}},

 {id:"pasado",cat:"Lo que te está pasando",t:"Superar lo anterior",k:["mi ex","olvidar a mi ex","superar","no lo puedo olvidar","sigo pensando en","relacion anterior","me dejo","volver con"],
  r(c){const p=c.p;
   return `Dijiste que tus relaciones anteriores se cayeron por ${DT.MOT_CORTO[p.motivo]}. Eso no se supera entendiéndolo: ya lo entendés. Se supera cuando deja de organizarte las decisiones nuevas.\n\nUna pregunta para vos, no para mí: ¿qué cosas dejaste de hacer por lo que pasó? Esa lista es el costo real, y suele ser más larga de lo que uno cree.\n\nSi querés, escribila en el Diario como nota. Dentro de un mes la app te va a mostrar si algo de eso volvió.\n\nY algo que sí te puedo decir con datos tuyos: pusiste ${p.cualidades[0]?low(p.cualidades[0]):"esa cualidad"} primero. Eso no lo elegiste al azar, lo elegiste por ausencia. Ahí está lo que te falta cerrar.`}},

 {id:"conociendo",cat:"Alguien que estás conociendo",t:"Estoy conociendo a alguien",k:["estoy conociendo a alguien","conoci a alguien","me gusta alguien","salgo con","estoy saliendo","hay alguien"],
  r(c){const p=c.p;
   return `Bien. Antes de interpretar nada: cargalo en Encuentro → Compatibilidad con el nombre y la fecha de nacimiento, y te hago la sinastría de verdad, no un porcentaje.\n\nMientras tanto, tres preguntas que valen más que la carta:\n\n¿Te contesta o te sigue el ritmo? No es lo mismo.\n\n¿Aparece cuando no hay nada divertido para hacer?\n\n¿Te acordás de algo que te haya preguntado sobre vos, y no sobre la situación?\n\nY guardá una entrada en el Diario hoy con el tipo "conocí a alguien". Si esto sigue, dentro de dos meses vas a querer leer lo que pensabas ahora.`}},

 {id:"cuando",cat:"Tu carta",t:"¿Cuándo lo voy a conocer?",k:["cuando lo voy a conocer","cuando la voy a conocer","cuando","fecha","va a pasar","ventana","cuanto falta","por que enero","por que ese mes","por que tan lejos","no puede ser antes"],
  r(c){const v=c.vent[0], M=window.NOCTRA_UI.MESES;
   if(!v) return "Las ventanas se calculan desde tu signo solar. Abrí la pestaña Encuentro y vas a ver los próximos doce meses marcados.";
   return `Te voy a contestar con cuidado, porque acá es donde este tipo de apps miente.\n\nNo sé cuándo vas a conocer a alguien. Nadie lo sabe. Lo que sí puedo calcular es cuándo tu carta indica períodos más favorables para vincularte, y el próximo empieza alrededor del ${v.inicio.getDate()} de ${M[v.inicio.getMonth()]} y va hasta el ${v.fin.getDate()} de ${M[v.fin.getMonth()]}.\n\n${v.motivo}\n\nLo que eso significa en la práctica: es un buen tramo para aceptar invitaciones, no para quedarte esperando. Una ventana sin salir de casa es una ventana cerrada.`}},

 {id:"retrato",cat:"Sobre el retrato",t:"¿De dónde salió el retrato?",k:["el retrato","el dibujo","se parece","de donde salio","como lo hiciste","es real el retrato","la cara"],
  r(c){const p=c.p;
   return `El retrato es una interpretación de tus respuestas, dibujada a lápiz. No es una foto de nadie que exista, y no te voy a decir que lo sea.\n\nDe dónde salió cada cosa: el género y la franja de edad, de las preguntas 2 y 3. Los rasgos generales, del origen que elegiste. La mirada y la boca, de la energía que pediste (${p.energia}) y de las cualidades que pusiste primero. La expresión, de lo que dijiste sobre cuánto te importa el físico.\n\nPara qué sirve entonces: para tener una imagen concreta de lo que estás buscando. Suena poco y no lo es. La gente que sabe lo que busca lo reconoce más rápido, y sobre todo descarta más rápido.\n\nLo que no hace: no es una predicción y no es una foto. Está en el pie de la lectura y te lo digo también acá.`}},

 {id:"segura",cat:"Sobre Maia",t:"¿Esto es real?",k:["no estoy segura","no estoy seguro","esto es real","es verdad","creer","estafa","funciona esto","es magia","puedo preguntarte cualquier cosa","que te puedo preguntar","de que podemos hablar","que sabes"],
  r(c){
   return `Me parece bien que dudes, y prefiero contestarte esto que venderte.\n\nLo que Noctra es: una interpretación construida con las quince respuestas que diste y con tu carta. Todo lo que leés está armado con tus datos; si hubieras contestado otra cosa, diría otra cosa.\n\nLo que Noctra no es: una predicción. Nadie puede decirte cuándo ni con quién. Cualquiera que te lo diga con seguridad te está mintiendo, cobre lo que cobre.\n\nPara qué sirve entonces, en serio: para ordenar lo que buscás, ver los patrones que repetís y tener algo que consultar cuando aparezca alguien. Eso lo hace, y lo hace bien.\n\nSi con eso te parece que no vale, decilo sin culpa. Prefiero eso a que te quedes esperando algo que no va a pasar.`}},

 {id:"desafios",cat:"Lo que te está pasando",t:"¿Qué va a fallar?",k:["que va a fallar","desafios","problemas","va a durar","miedo a que","se repita"],
  r(c){const p=c.p;
   return `El patrón que se arma con lo que contestaste es este: ${p.motivo==="confianza"||p.motivo==="infidelidad"?"llegás con el sistema de alarma encendido antes de que pase nada":p.motivo==="comunicacion"?"das por obvio lo que no dijiste, y leés como desinterés lo que es falta de información":p.motivo==="distancia"?"dejás enfriar sin señalar, porque señalar se te parece a exigir":p.motivo==="objetivos"?"postergás las conversaciones grandes para no arruinar el momento":p.motivo==="egoismo"?"das de más al principio y te resentís después por un desequilibrio que empezaste vos":"repetís la forma de vincularte que conocés, aunque ya sepas que no te sirve"}.\n\nY lo que más te cuesta hoy —${DT.DIF_CORTO[p.dificultad]}— es exactamente lo que ese patrón necesita para seguir funcionando.\n\nEsto no lo digo para asustarte. Lo digo porque la sección "Desafíos" de tu lectura lo desarrolla entero, y es la que más te conviene releer. Está en la pestaña Lectura.`}},

 {id:"lenguaje",cat:"Tu carta",t:"Mi lenguaje del amor",k:["lenguaje del amor","como demuestro","como me quieren","que necesito","me siento querida"],
  r(c){const p=c.p;
   return `Tu lenguaje del amor es ${DT.LEN_CORTO[p.lenguaje]}. Lo elegiste vos en la pregunta 11.\n\nLo que suele pasar con eso: uno da en el idioma que quiere recibir. Fijate si estás dando ${DT.LEN_CORTO[p.lenguaje]} y esperando que el otro entienda que eso significa algo.\n\nLa parte útil: se puede pedir. "Necesito que me lo digas", "necesito que estés", "necesito que me acompañes a esto". No es exigir. Es ahorrarle a la otra persona un año de adivinar.\n\nY una cosa más: elegiste ${DT.EXP_CORTO[p.experiencias]} como la experiencia que más valorás. Ahí es donde tu lenguaje se nota más. Ese es el terreno donde te conviene invitar a alguien.`}},

 {id:"diario",cat:"Usar la app",t:"Mis entradas del diario",k:["diario","que anote","escribi","mis entradas","que vi"],
  r(c){const n=D().diario.length;
   if(!n) return "Todavía no escribiste nada en el diario. Empezá por algo mínimo: una señal que viste, alguien que apareció, un sueño. Lo que sirve no es la entrada de hoy: es leer diez entradas dentro de tres meses y ver lo que se repite.";
   return `Tenés ${n} entrada${n>1?"s":""} en el diario. La app las cruza sola con tus ventanas de encuentro y con las cinco señales de tu lectura; cuando hay coincidencia te lo marca ahí mismo.\n\nSi querés que mire algo puntual, contámelo acá y lo pensamos, pero el cruce lo hace la pestaña Diario mejor que yo.`}},

 {id:"quien",cat:"Sobre Maia",t:"¿Quién sos?",k:["quien sos","sos real","sos humana","sos una persona","sos un bot","inteligencia artificial","chatgpt","lo hizo una persona","una persona o una maquina","sos un programa","quien te escribio"],
  r(){return PRESENTACION+"\n\nNo hay nadie del otro lado escribiendo. Lo que tengo cargado son tus quince respuestas del quiz, tu carta, tu lectura, tus entradas del diario y las personas que hayas guardado en compatibilidad. Por eso puedo contestarte cosas que un chat genérico no, y por eso no puedo contestarte cosas que dependan de saber el futuro."}},

 {id:"ritual",cat:"Usar la app",t:"La práctica de este mes",k:["ritual","practica","ejercicio","que hago hoy","luna llena","luna nueva"],
  r(c){const R=DT.RITUALES[new Date().getMonth()];
   return `La práctica de este mes es "${R.titulo}", de ${R.min} minutos, para luna ${R.fase}. Hoy la luna está ${c.fase.nombre.toLowerCase()}.\n\n${R.pasos[0]}\n\nEstá completa en Encuentro → Rituales. Son ejercicios de escritura y de atención con envoltorio lunar; no tienen nada de mágico y funcionan igual.`}}
,

 /* ═══ saludos y trato ═══ */
 {id:"saludo",cat:"Sobre Maia",t:"Hola",k:["hola","buenas","buen dia","buenas tardes","buenas noches","que tal","como estas","como andas","holis","ey"],
  r(c){const n=D().nombre?(", "+D().nombre):"";
   return `Hola${n}. Estoy acá.\n\nPuedo hablarte de tu carta, de lo que contestaste en el test, de la persona del retrato, de alguien que estés conociendo, o de lo que te esté pasando a vos. Tocá "Ver todos los temas" acá abajo y elegís, o escribime directo.\n\n¿Por dónde querés empezar?`}},

 {id:"gracias",cat:"Sobre Maia",t:"Gracias",k:["gracias","genial","buenisimo","me sirvio","me ayudo","perfecto","copado","excelente","te quiero"],
  r(){return `De nada. Me alegra que te haya servido.\n\nSi querés seguir, hay temas que quizás no se te ocurrieron: por qué elegís lo que elegís, qué hacer en la antesala de tu ventana, cómo se lee la compatibilidad con alguien concreto.\n\nY si algo de lo que te dije no te cerró, decímelo. Prefiero corregir que quedar bien.`}},

 {id:"ahi",cat:"Sobre Maia",t:"¿Estás ahí?",k:["estas ahi","hola?","seguis","me escuchas","respondes","alguien ahi"],
  r(){return `Estoy. No soy una persona esperando del otro lado: soy un programa que corre adentro de tu teléfono, así que siempre estoy disponible y nunca vas a esperar.\n\nEscribime lo que quieras preguntar.`}},

 /* ═══ el vínculo actual ═══ */
 {id:"visto",cat:"Alguien que estás conociendo",t:"Me dejó en visto",k:["me dejo en visto","no me contesta","no responde","me ignora","visto","no me escribe","tarda en contestar","me deja en visto"],
  r(c){const p=c.p;
   return `Antes de interpretarlo: no sé por qué no contestó, y nadie que te diga que sí lo sabe te está diciendo la verdad.\n\nLo que sí puedo decirte es qué hacer con la espera, que es lo que te está costando.\n\nUna sola cosa en concreto: no mandes el segundo mensaje para chequear. Si ya escribiste, ya está dicho. El segundo mensaje no trae la respuesta, y cambia la posición desde la que estás parada.\n\nY algo tuyo: pusiste que tu lenguaje del amor es ${DT.LEN_CORTO[p.lenguaje]}. Si esta persona no habla ese idioma, el silencio te va a doler más que a otra gente. No es que seas exagerada: es que te toca justo donde medís.\n\nDos días. Si en dos días no apareció, no fue el mensaje, fue el interés. Y eso es información, no rechazo.`}},

 {id:"desatendida",cat:"Alguien que estás conociendo",t:"No me presta atención",k:["no me presta atencion","no me da bola","me tiene de lado","ya no es como antes","se enfrio","esta distante","no me mira","me siento invisible","no me valora"],
  r(c){const p=c.p;
   return `Eso duele, y antes que interpretarlo te digo lo único que se puede hacer: **decirlo**. No insinuarlo, decirlo.\n\nLa versión que funciona no es "no me prestás atención" —eso se contesta con "sí te presto"— sino algo concreto: "necesito que un día de la semana sea nuestro", "necesito que me contestes aunque sea corto".\n\nTu lenguaje del amor es ${DT.LEN_CORTO[p.lenguaje]}. Es muy posible que te esté dando atención en otro idioma y que ninguno de los dos lo esté viendo. Pasa más de lo que parece y se arregla hablando, no midiendo.\n\nAhora, si ya lo pediste claro más de una vez y no cambió nada: eso ya no es un malentendido de idiomas. Es una respuesta.`}},

 {id:"escribo",cat:"Alguien que estás conociendo",t:"¿Le escribo yo?",k:["le escribo yo","escribo primero","lo escribo","le hablo","doy el primer paso","me hago la dificil","cuanto espero para responder","espero que me escriba","cuanto tiempo espero","cuanto espero","tardo en contestar"],
  r(c){
   return `Sí, escribile.\n\nLa idea de esperar para no mostrarse interesada funciona en las películas y arruina cosas reales. Lo único que consigue es que dos personas interesadas se queden calladas hasta que se enfría.\n\nLo que sí importa no es quién escribe primero: es qué pasa después de tres o cuatro veces. Fijate si estás escribiendo vos siempre. Eso no se mide en un mensaje, se mide en un mes.\n\nY cuando escribas, que sea algo concreto —una invitación, algo que viste y le va a gustar—, no un "hola" suelto. El "hola" suelto le pasa el trabajo al otro, y ahí sí se apaga.`}},

 {id:"legusto",cat:"Alguien que estás conociendo",t:"¿Le gusto?",k:["le gusto","le intereso","siente lo mismo","me quiere","piensa en mi","que siente por mi","si le gusto"],
  r(c){
   return `No lo sé, y te lo digo así porque cualquier otra respuesta sería inventada.\n\nPero hay una diferencia que sirve más que adivinar: la gente que está interesada **aparece**. No siempre bien, no siempre a tiempo, pero aparece. La que no está interesada tiene explicaciones.\n\nTres cosas para mirar esta semana, sin preguntarle nada:\n\n¿Propone, o sólo acepta lo que proponés vos?\n\n¿Te escribe cuando no hay nada que resolver?\n\n¿Se acuerda de algo que dijiste hace diez días?\n\nSi las tres dan que no, ya tenés la respuesta y no hace falta que te la dé yo. Si dan que sí, dejá de medir y andá.`}},

 {id:"decirle",cat:"Alguien que estás conociendo",t:"¿Le digo lo que siento?",k:["le digo lo que siento","me declaro","confesarle","decirle que me gusta","hablar de lo que somos","definir la relacion","preguntarle que somos","deberia decirle","le digo que me gusta","digo lo que siento","me conviene decirle"],
  r(c){const p=c.p;
   return `Sí, pero no como confesión: como información.\n\nLa diferencia es grande. "Estoy enamorada de vos" pone al otro a decidir sobre tu vida. "Me gustás y quiero ver esto en serio" te deja a vos parada en tu lugar, y le da algo concreto que contestar.\n\nDijiste que lo que más te cuesta es ${DT.DIF_CORTO[p.dificultad]}. Esto va a activarte exactamente eso, así que no esperes sentirte lista: no vas a sentirte lista.\n\nUna cosa práctica: decilo en persona o por llamada, no por escrito. Por escrito, cada minuto sin respuesta lo vas a leer como un no.`}},

 {id:"tiempo",cat:"Alguien que estás conociendo",t:"Me pidió tiempo",k:["me pidio tiempo","necesita tiempo","esta confundido","no sabe lo que quiere","quiere ir despacio","no quiere nada serio"],
  r(c){
   return `"Necesito tiempo" a veces es verdad y a veces es una forma amable de no decir que no. No tengo manera de saber cuál es acá, y el que te diga que sí te está mintiendo.\n\nLo que sí sé: **el tiempo que se pide no se espera con el cronómetro en la mano.** Si vas a dar tiempo, dalo de verdad, y seguí con tu vida mientras tanto. Esperar quieta no acelera nada y te desgasta.\n\nPonete un plazo vos, para vos, y no se lo digas. Cuando se cumpla, mirá si algo cambió. Si no cambió nada, ya sabés lo que era.`}},

 {id:"ex_volvio",cat:"Alguien que estás conociendo",t:"Volvió mi ex",k:["volvio mi ex","me escribio mi ex","reapareci","volver con mi ex","me busca de nuevo","esta con otra"],
  r(c){const p=c.p;
   return `No te voy a decir ni que sí ni que no. Pero sí te voy a hacer la pregunta que importa, que no es "¿lo querés todavía?".\n\nEs esta: **¿cambió algo de lo que hizo que no funcionara?** No si te extraña. No si está distinto. Si cambió lo concreto.\n\nDijiste que lo anterior se cayó por ${DT.MOT_CORTO[p.motivo]}. Si eso sigue igual, volver es repetir con más información, no empezar de nuevo.\n\nY una cosa honesta: que haya vuelto no dice casi nada sobre él. Volver es fácil. Sostener es lo difícil, y es lo que no pasó la primera vez.`}},

 /* ═══ lo que te pasa a vos ═══ */
 {id:"sola",cat:"Lo que te está pasando",t:"Me siento sola",k:["me siento sola","me siento solo","estoy sola","soledad","nadie me quiere","no tengo a nadie","me siento vacia"],
  r(c){const p=c.p;
   return `Gracias por decirlo. Eso cuesta más de lo que parece.\n\nNo te voy a contestar con la carta, porque la carta no sirve para esto.\n\nLa soledad de no tener pareja y la soledad de no tener a nadie cerca son dos cosas distintas, y se arreglan distinto. La primera espera. La segunda no conviene que espere.\n\nAlgo chico para esta semana, y de verdad chico: contactá a una persona que ya está en tu vida y que hace rato no ves. No para contarle esto. Para verla. El vínculo que te falta casi nunca es el que estás buscando.\n\nY si esto viene hace mucho y te pesa todos los días, hablarlo con alguien que sepa escuchar en serio —un profesional, no una app— no es un fracaso. Es lo mismo que ir al médico.`}},

 {id:"miedo_sola",cat:"Lo que te está pasando",t:"Tengo miedo de quedarme sola",k:["miedo de quedarme sola","y si no aparece","y si nunca","me voy a quedar sola","se me pasa el tiempo","reloj biologico","todas menos yo"],
  r(c){
   return `Ese miedo es común y es honesto, así que no te lo voy a despintar.\n\nLo que sí te digo: el miedo a quedarte sola es el peor consejero que existe para elegir con quién estar. Es exactamente lo que hace que alguien se quede donde no le hace bien, porque es mejor que nada.\n\nY no es mejor que nada. Es peor.\n\nLo que hace tu lectura, en concreto, es darte con qué comparar. Cuando sabés qué buscás, el miedo pierde la parte más fea: la de no poder distinguir.\n\nUna cosa: no estás atrasada. No hay un cronograma, aunque tu entorno actúe como si lo hubiera.`}},

 {id:"elijo_mal",cat:"Lo que te está pasando",t:"¿Por qué elijo mal?",k:["por que elijo mal","siempre me pasa lo mismo","atraigo lo mismo","siempre el mismo tipo","repito el patron","me pasa siempre","mala suerte en el amor","siempre elijo mal","elijo mal","por que me pasa","siempre me equivoco"],
  r(c){const p=c.p;
   return `No elegís mal. Elegís lo conocido, que se siente parecido a elegir bien.\n\nTu patrón, armado con lo que contestaste: ${p.motivo==="confianza"||p.motivo==="infidelidad"?"llegás con la alarma encendida antes de que pase nada, y eso termina provocando lo que querías evitar":p.motivo==="comunicacion"?"das por dicho lo que no dijiste, y leés como desinterés lo que es falta de información":p.motivo==="distancia"?"dejás enfriar sin señalar, porque señalar se te parece a exigir":p.motivo==="objetivos"?"postergás las conversaciones grandes para no arruinar el momento, y después llegan tarde":p.motivo==="egoismo"?"das de más al principio y te resentís después por un desequilibrio que empezaste vos":"repetís la forma de vincularte que conocés, aunque ya sepas que no te sirve"}.\n\nY lo que más te cuesta hoy —${DT.DIF_CORTO[p.dificultad]}— es justo lo que ese patrón necesita para seguir andando.\n\nDónde se corta: no en elegir distinto, que es muy difícil. En **notar antes**. La sección Desafíos de tu lectura tiene esto desarrollado; es la que menos gusta y la que más sirve.`}},

 {id:"autoestima",cat:"Lo que te está pasando",t:"No me siento suficiente",k:["autoestima","no soy suficiente","no valgo","me siento fea","no me quiero","me odio","no valgo nada","inseguridad","me siento poca cosa","amor propio","quererme a mi misma","quererme primero"],
  r(c){const p=c.p;
   return `Voy a ser directa: yo no puedo arreglarte eso, y una app que te diga que sí te está vendiendo humo.\n\nLo que sí puedo hacer es sacarte de la cabeza una idea que aparece mucho acá: **no hace falta quererse entero para merecer que te quieran.** Esa idea deja a mucha gente esperando un permiso que nunca llega.\n\nDe lo que contestaste: pusiste ${p.cualidades[0]?low(p.cualidades[0]):"esa cualidad"} primero entre lo que buscás. La gente suele poner primero lo que sabe dar. Fijate si no estás pidiendo afuera algo que ya tenés y no te estás contando.\n\nY si esto es constante, no de un día malo, hablarlo con un profesional cambia cosas que ninguna lectura cambia. Lo digo en serio, no como frase de cierre.`}},

 {id:"cansada",cat:"Lo que te está pasando",t:"Estoy cansada de intentar",k:["estoy cansada","cansada de intentar","ya no quiero","me rindo","no vale la pena","para que","estoy harta","agotada de esto"],
  r(c){
   return `Entonces pará un poco. En serio.\n\nHay una idea instalada de que hay que estar siempre disponible, siempre abierta, siempre buscando. No es cierto y además no funciona: el cansancio se nota, y aleja.\n\nDescansar de buscar no es rendirse. Es sacar el tema del centro de la mesa por un tiempo.\n\nLo único que te pediría que no sueltes mientras tanto: seguí viendo gente, aunque sea sin ninguna intención romántica. La diferencia entre tomarse un descanso y encerrarse es esa, y es grande.`}},

 {id:"olvidar",cat:"Lo que te está pasando",t:"No lo puedo olvidar",k:["como dejo de pensar en el","no lo puedo olvidar","lo extraño","sigo enganchada","no lo supero","me cuesta soltar","pienso todo el dia en"],
  r(c){
   return `No se olvida a voluntad. Eso primero, porque la mayoría del sufrimiento acá no viene de extrañar: viene de retarse por extrañar.\n\nLo que sí se puede: sacarle lugar. No pensarlo menos, tener más cosas ocupando el día.\n\nDos cosas concretas:\n\nUna. Sacá los recordatorios pasivos —el chat arriba de todo, las fotos que aparecen solas, el perfil que mirás sin decidirlo—. No es dramático, es higiene.\n\nDos. Cuando te venga, anotalo en el Diario en vez de darle vueltas. Dentro de un mes vas a ver que la frecuencia bajó, y eso no lo vas a notar de otra forma.\n\nEl tiempo hace la mayor parte del trabajo. Es una respuesta mala y es la verdadera.`}},

 /* ═══ práctico ═══ */
 {id:"donde_conocer",cat:"Qué hacer",t:"¿Dónde conozco gente?",k:["donde puedo conocer gente","donde conozco","salir a conocer","como conozco gente","no conozco a nadie nuevo","donde se conoce gente"],
  r(c){const p=c.p, d=DT.DONDE[p.experiencias]||DT.DONDE.tranquilos;
   return `Con lo que contestaste, tu terreno es ${DT.EXP_CORTO[p.experiencias]}. No es un detalle: es donde vos funcionás bien, y donde alguien te va a ver como sos y no como la versión incómoda.\n\nTres lugares concretos para vos:\n\n${d.slice(0,3).map((x,i)=>(i+1)+". "+x).join("\n")}\n\nLa regla que vale más que la lista: **volvé al mismo lugar.** Lo que hace que alguien se acerque no es el lugar, es la repetición. La tercera vez que te ven, dejás de ser una desconocida.\n\nY una de frecuencia: una salida por semana hace más que cinco en un mes y después nada.`}},

 {id:"apps",cat:"Qué hacer",t:"¿Sirven las apps de citas?",k:["apps de citas","tinder","bumble","aplicaciones de citas","sirven las apps","conocer por internet","online"],
  r(c){
   return `Sirven para conocer gente que no ibas a cruzar. No sirven para evaluarla, y ahí es donde se rompe.\n\nTu lectura dice que vos necesitás contexto para leer a alguien —ver cómo trata al mozo, cómo cuenta algo cuando nadie lo mira—. Eso en una app no existe.\n\nEntonces, si las usás: pasá a verse en persona rápido. Dos o tres días de chat, no dos semanas. El chat largo construye un personaje que después no aparece, y perdés semanas con alguien que nunca existió.\n\nY no las uses como único canal. Lo que traen es volumen, y el volumen sin contexto cansa.`}},

 {id:"conversacion",cat:"Qué hacer",t:"¿Cómo empiezo una conversación?",k:["como empiezo una conversacion","de que hablo","que le digo","como rompo el hielo","no se que decir","primera cita","de que hablar en la primera cita"],
  r(c){const p=c.p;
   return `Lo que mejor funciona no es una frase ingeniosa: es una pregunta que no se conteste con sí o no.\n\nTres que sirven de verdad, y que además te dan información útil:\n\n"¿Qué te tiene entusiasmado últimamente?" — mucho mejor que "¿a qué te dedicás?".\n\n"¿Qué harías un domingo sin planes?" — te dice cómo es su vida real.\n\n"¿Qué es algo que te gusta y te da un poco de vergüenza?" — la respuesta a esto vale más que media hora de charla.\n\nY si la cita es en persona: valorás ${DT.EXP_CORTO[p.experiencias]}, así que proponé algo de ahí en vez de un café genérico. Una actividad compartida saca conversación sola y te ahorra el silencio incómodo.`}},

 {id:"rojas",cat:"Qué hacer",t:"Banderas rojas",k:["banderas rojas","red flags","es toxico","señales de alerta","de que me cuido","como se si es toxico","relacion toxica","manipulador"],
  r(c){
   return `Las que importan de verdad no son las escandalosas. Son estas:\n\n**Te deja confundida seguido.** Salís de una charla sin saber qué pasó. Si es repetido, no sos vos.\n\n**Trata distinto a la gente que no le sirve.** Mirá cómo habla del mozo, de su ex, de un compañero. Ahí está cómo te va a tratar a vos cuando dejes de ser nueva.\n\n**Tus límites se negocian.** Uno bueno se respeta cuando incomoda; si siempre hay una razón para correrlo un poco, no se está respetando.\n\n**Te fuiste alejando de tu gente.** Casi nunca es una orden. Es que siempre hay un motivo.\n\nY una cosa que no es bandera roja aunque lo digan: que le cueste hablar de sentimientos al principio.\n\nSi algo de esto pasó de la incomodidad al miedo, eso ya no es un tema de vínculos y hay una línea gratuita, la 144, las 24 horas.`}},

 /* ═══ astro ═══ */
 {id:"ascendente",cat:"Tu carta",t:"¿Qué es el ascendente?",k:["que es el ascendente","mi ascendente","para que sirve el ascendente","hora de nacimiento"],
  r(c){
   return `El ascendente es el signo que estaba subiendo en el horizonte cuando naciste. Se lee como la puerta: lo primero que registra alguien que te acaba de conocer, antes de tratarte.\n\nPor eso necesita la hora exacta: cambia cada dos horas más o menos.\n\n${c.asc?`Con la hora que cargaste, el tuyo aproximado es ${c.asc}.`:`No cargaste la hora de nacimiento, así que no lo calculo. Si la sabés —está en la partida de nacimiento—, cargala en Perfil y te lo sumo.`}\n\nY una aclaración honesta: mi cálculo es aproximado. Para el ascendente exacto hace falta la latitud y la longitud del lugar; yo trabajo con la hora. Sirve para leerte, no para una carta profesional.`}},

 {id:"sinastria",cat:"Tu carta",t:"¿Qué es la compatibilidad?",k:["que es la sinastria","compatibilidad","soy compatible con","que signo me conviene","compatible con un","me llevo bien con"],
  r(c){
   return `La sinastría compara dos cartas y mira el ángulo entre ellas. No da un porcentaje, y desconfiá de cualquiera que te dé uno: "82% compatible" es un número inventado para que compartas la captura.\n\nLo que sí dice algo: qué se les va a dar solo y qué les va a costar. Dos personas de elementos que fluyen la tienen fácil al principio y se aburren si nadie propone; dos en tensión discuten más y crecen más, si discuten bien.\n\nPara hacerla de verdad necesito una persona concreta: andá a **Encuentro → Compatibilidad** y cargá nombre y fecha de nacimiento. Con eso te digo qué funciona solo, qué va a costar y una pregunta para hacerle.\n\nY lo más importante: **ningún signo está descartado.** La carta explica dinámicas, no dicta finales.`}},

 {id:"retro",cat:"Tu carta",t:"¿Mercurio retrógrado?",k:["mercurio retrogrado","retrogrado","me afecta el retrogrado","esta retrogrado"],
  r(c){
   return `Te voy a dar la respuesta aburrida: no tengo forma de decirte que Mercurio retrógrado te esté afectando, y no voy a actuar como si la tuviera.\n\nLo que sí veo, y lo digo porque es más útil: los períodos que la gente le atribuye funcionan como permiso para revisar cosas. Si eso te ordena, usalo. Si te sirve de excusa para no mandar un mensaje que querés mandar, ahí ya te está costando algo.\n\nLo que Noctra sí calcula son tus ventanas de encuentro, que salen de tu signo solar y de dónde está el Sol. Eso está en Encuentro → Ventanas.`}},

 /* ═══ la app ═══ */
 {id:"como_diario",cat:"Usar la app",t:"¿Para qué sirve el diario?",k:["como uso el diario","para que sirve el diario","que anoto","el diario"],
  r(c){const n=D().diario.length;
   return `El diario no es para escribir bonito. Es para tener con qué comparar dentro de tres meses.\n\nAnotás cuatro cosas: alguien que conociste, una señal que viste, un sueño, o una nota suelta. Y la app lo cruza sola con tus ventanas de encuentro y con las cinco señales de tu lectura; cuando coincide algo, te lo marca en la entrada.\n\n${n?`Tenés ${n} entrada${n>1?"s":""} cargada${n>1?"s":""}.`:`Todavía no cargaste ninguna. Empezá por algo mínimo hoy: una línea alcanza.`}\n\nLo que hace valioso esto es la cantidad, no la calidad. Diez entradas de una línea sirven más que una entrada larga.`}},

 {id:"donde_lectura",cat:"Usar la app",t:"¿Dónde veo mi lectura?",k:["donde veo mi lectura","donde esta la lectura","mi lectura","como veo","donde encuentro","no encuentro"],
  r(c){
   return `Abajo de todo tenés cinco pestañas:\n\n**Retrato** — el dibujo y de dónde salió cada rasgo.\n**Lectura** — las secciones largas sobre vos y sobre quien buscás.\n**Encuentro** — cuándo y dónde, tus ventanas del año, compatibilidad y rituales.\n**Diario** — lo que vas anotando.\n**Maia** — acá.\n\nSi buscás algo puntual y no lo encontrás, decime qué y te digo en qué pestaña está.`}},

 {id:"otro_telefono",cat:"Usar la app",t:"Perdí el acceso",k:["perdi mi acceso","otro telefono","cambie de telefono","se borro","no me aparece lo que compre","perdi todo","no puedo entrar","se me fue"],
  r(c){
   return `No perdiste nada: lo que compraste está atado a tu compra, no al teléfono.\n\nEn la pestaña Encuentro, donde aparece cerrado, hay un botón para desbloquear. Te pide el mail con el que pagaste y el número de pedido —el que empieza con # y está arriba de todo en el mail de confirmación—. Con eso se abre de nuevo.\n\nSi no encontrás el mail o no funciona, escribí a soporte@noctrastral.online contando con qué mail pagaste y lo resolvemos a mano. No hace falta que vuelvas a pagar nada.`}},

 {id:"ciudad_app",cat:"Usar la app",t:"Cambiar mi ciudad",k:["cambiar mi ciudad","mi ciudad esta mal","no es mi ciudad","cambiar ciudad","esta mal la ciudad","como cambio mi ciudad","cambio mi ciudad","corregir la ciudad"],
  r(c){
   return `La leo de tu conexión, y en datos móviles falla seguido: a veces marca la ciudad de la antena y no la tuya.\n\nSe corrige a mano. Andá a **Encuentro → Cuándo y dónde** y tocá donde dice la ciudad; ahí la cargás y el rumbo y el radio se recalculan sobre tu mapa.\n\nPonelas donde hacés tu vida, no donde naciste. La tercera sección del plan habla de dónde circulás.`}},

 /* ═══ sobre el producto ═══ */
 {id:"futuro",cat:"Sobre Maia",t:"¿Qué ves en mi futuro?",k:["que ves en mi futuro","me va a ir bien","que me depara","adivina","predice","que va a pasar conmigo","tengo esperanza","voy a ser feliz"],
  r(c){
   return `No veo el futuro. Nadie lo ve, y la parte más honesta de esta app es que te lo dice en vez de cobrarte por no decírtelo.\n\nLo que sí hago: leo lo que contestaste y lo que dice tu carta, y de ahí salen tramos del año más propicios, un tipo de persona que encaja con lo que buscás, y los patrones que venís repitiendo.\n\nEso no es poco. Saber qué buscás te hace reconocerlo más rápido, y sobre todo descartar más rápido.\n\nPero si lo que querés es que te diga que va a pasar, no te lo voy a decir. Lo que pase depende bastante de vos, y esa es mejor noticia que la otra.`}},

 {id:"precio",cat:"Sobre Maia",t:"Precios y reembolsos",k:["cuanto sale","cuanto cuesta","es gratis","sos gratis","precio","reembolso","devolucion","quiero que me devuelvan","cancelar"],
  r(c){
   return `De precios y pagos no manejo información, así que no te voy a improvisar un número.\n\nEscribí a **soporte@noctrastral.online** con el mail que usaste y te contestan ellos. Si es un reembolso, pedilo ahí mismo: es el canal que resuelve, yo no.\n\nLo único que sí te digo: lo que compraste es un pago único. No hay suscripción ni renovación.`}},

 {id:"barba",cat:"Sobre el retrato",t:"¿Por qué salió así?",k:["por que tiene barba","por que es asi","no me gusta el retrato","puedo cambiarlo","cambiar el retrato","otro retrato","no se parece","por que ese pelo"],
  r(c){const p=c.p;
   return `El retrato se arma con lo que contestaste: el género, la franja de edad, el origen que elegiste, la energía que pediste (${p.energia}) y las cualidades que pusiste primero. Cada rasgo sale de ahí, no de un azar.\n\nNo se puede cambiar a mano, y es a propósito: si lo pudieras editar hasta que te guste, dejaría de ser una interpretación de tus respuestas y sería un dibujo tuyo.\n\nLo que sí podés: en la pestaña Retrato hay bocetos que se van sumando con los días —uno de perfil, uno sonriendo, una versión en acuarela—. Son variantes de la misma cara.\n\nY algo importante: no es una foto de nadie. Es una imagen para saber qué estás buscando, no para salir a buscar esa cara.`}}
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

const PILDORAS=["¿Cómo lo voy a reconocer?","¿Cuándo lo voy a conocer?","Estoy conociendo a alguien","Me dejó en visto","¿Dónde conozco gente?","Contame de mi luna"];

/* Puntúa cada tema contra lo que escribió la persona.
   Una coincidencia larga pesa más que una corta: "me dejo en visto" tiene
   que ganarle a "visto" suelto. Devuelve todo ordenado, no sólo el mejor,
   porque cuando no alcanza para contestar igual sirve para sugerir. */
function puntuar(t){
  const out=[];
  for(const i of INT){
    let p=0;
    for(const k of i.k){
      const kk=norm(k);
      if(t.indexOf(kk)>=0) p+=kk.split(" ").length*2+Math.min(4,kk.length/6);
    }
    if(p>0) out.push({i:i,p:p});
  }
  out.sort((a,b)=>b.p-a.p);
  return out;
}

/* Los temas agrupados, para que la persona vea qué se puede preguntar en vez
   de tipear a ciegas. Es lo que más sube la sensación de que Maia sabe. */
function catalogo(){
  const g=[], por={};
  for(const i of INT){
    if(!i.cat||!i.t) continue;
    if(!por[i.cat]){ por[i.cat]=[]; g.push(i.cat); }
    por[i.cat].push(i.t);
  }
  return g.map(c=>({categoria:c, temas:por[c]}));
}

function responder(txt){
  const t=norm(txt);
  if(CRISIS.test(t)) return {tipo:"crisis",texto:crisis()};
  if(RIESGO_TERCEROS.test(t)) return {tipo:"riesgo",texto:riesgo()};
  if(MEDICO.test(t)) return {tipo:"limite",texto:"Eso es salud, y no lo toco: no diagnostico, no opino de medicación y no reemplazo a un profesional. Es un límite mío y no lo voy a cruzar aunque me insistas.\n\nLo que sí puedo hacer es hablar de cómo te vinculás y de lo que contestaste en el quiz. Si querés seguimos por ahí."};
  if(LEGAL.test(t)) return {tipo:"limite",texto:"De temas legales no opino: no sé de leyes y una respuesta mía podría costarte caro. Eso lo tiene que ver alguien con matrícula.\n\nSi hay algo del vínculo detrás de eso, de eso sí podemos hablar."};
  if(PLATA.test(t)) return {tipo:"limite",texto:"De plata e inversiones no doy consejo. No soy asesora financiera y no tengo forma de saber tu situación.\n\nSi lo que pesa es cómo afecta a una relación, hablemos de eso."};

  const rank=puntuar(t);
  const mejor=rank[0]&&rank[0].p>=2?rank[0].i:null;
  const c=ctx();
  if(mejor) return {tipo:"int",id:mejor.id,texto:mejor.r(c)};

  /* Sin coincidencia. Antes esto era un callejon sin salida: "no tengo una
     lectura para eso" y la persona se quedaba sin saber que SI se puede
     preguntar. Ahora se ofrecen los temas mas cercanos a lo que escribio, y
     si no hay ninguno cerca, los de arranque. */
  const cerca=rank.filter(x=>x.p>0).slice(0,3).map(x=>x.i);
  const sug=(cerca.length?cerca:INT.filter(x=>["reconocer","cuando","conociendo"].indexOf(x.id)>=0))
    .map(x=>x.t).filter(Boolean);
  return {tipo:"abierto", sugerencias:sug,
    texto:`Eso no lo tengo escrito, y prefiero decirlo antes que improvisar algo que suene bien.\n\n${cerca.length?"Por lo que me escribiste, quizás alguno de estos te sirva:":"Estos son buenos para empezar:"}\n\n${sug.map(x=>"· "+x).join("\n")}\n\nTocá el que te interese, o mirá todos los temas con el botón de acá abajo.`};
}

window.NOCTRA_MAIA={responder,PRESENTACION,PILDORAS,catalogo,temas:()=>INT.filter(x=>x.cat&&x.t).length};
})();
