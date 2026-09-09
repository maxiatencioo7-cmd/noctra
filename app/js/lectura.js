/* Noctra App — generador de la lectura personalizada */
(function(){
const A=window.NOCTRA_ASTRO;

const EDAD={ "20":["entre 20 y 30","recién asentada, todavía con filo"],
  "30":["entre 30 y 40","en el momento en que ya sabe lo que no quiere"],
  "40":["entre 40 y 50","con la calma de quien ya se equivocó lo suficiente"],
  "50":["de 50 para arriba","con una serenidad que no se improvisa"] };
const ETNIA={ afro:"de rasgos africanos", europeo:"de piel clara y rasgos europeos",
  latino:"de rasgos latinos", asiatico:"de rasgos asiáticos", libre:"sin un origen definido: lo que aparece es la expresión, no la procedencia" };
const ENERGIA={ carinosa:["afectuosa y amorosa","el gesto antes que la palabra","alguien que toca el hombro al pasar"],
  calma:["calma y con los pies en la tierra","la voz baja que ordena una habitación","alguien que no se apura ni cuando debería"],
  juguetona:["juguetona y liviana","el chiste que desarma una discusión","alguien que se ríe primero"],
  aventurera:["divertida y aventurera","el plan que aparece un jueves","alguien que ya tiene el bolso armado"],
  equilibrada:["equilibrada y contenedora","la estabilidad que no aburre","alguien que sostiene sin asfixiar"],
  apasionada:["apasionada e inspiradora","la intensidad que empuja","alguien que te hace querer más"],
  otra:["difícil de encasillar","algo que todavía no tiene nombre","alguien que no entra en las categorías de siempre"] };
const LENG={ palabras:["Palabras de afirmación","que te lo digan","el mensaje a las once de la noche que no pedía nada"],
  regalos:["Regalos","el objeto que prueba que te pensaron","lo que trae de un viaje sin que se lo pidas"],
  actividades:["Actividades compartidas","el tiempo puesto en el mismo lugar","la costumbre de hacer las cosas juntos"],
  contacto:["Contacto físico","la mano en la espalda","la cercanía que no necesita explicación"],
  gestos:["Gestos de ayuda","lo que hacen por vos sin anunciarlo","el auto con nafta y la cena resuelta"] };
const MOTIVO={ confianza:["la falta de confianza","vivir midiendo si te están diciendo la verdad"],
  comunicacion:["la mala comunicación","discutir por lo que no se dijo más que por lo que pasó"],
  distancia:["que se fueron alejando","mirar un día al costado y no reconocer a la persona"],
  objetivos:["tener objetivos de vida distintos","querer cosas incompatibles y descubrirlo tarde"],
  infidelidad:["la infidelidad","que te rompan algo que no se arregla del todo"],
  egoismo:["el egoísmo","dar más de lo que recibís hasta quedar vacía"],
  otro:["lo que pasó la última vez","algo que todavía te cuesta poner en una sola palabra"] };
const DIFI={ correcta:["conocer a la persona correcta","conocés gente, pero nunca a la persona"],
  pasado:["superar relaciones pasadas","hay alguien que todavía ocupa lugar"],
  chispa:["mantener viva la chispa","empieza bien y en algún punto se apaga"],
  dudas:["manejar las dudas","cuando aparece algo bueno, empezás a buscarle la falla"],
  abrirme:["abrirte con la gente","mostrás la versión editada y guardás el resto"],
  limites:["poner límites sanos","decís que sí cuando querías decir que no"] };
const EXP={ viajar:["viajar","el movimiento"], tranquilos:["los momentos tranquilos juntos","el silencio compartido"],
  logros:["festejar logros","celebrar de a dos"], crear:["crear cosas juntos","construir algo con las manos"],
  familia:["pasar tiempo en familia","la mesa larga"] };
const FUT={ "Comprar una casa":"un lugar propio","Vivir aventuras":"un mapa lleno de marcas",
  "Formar una familia":"una familia","Crear lindos recuerdos":"una colección de días buenos",
  "Tener un negocio":"algo construido entre los dos","Atravesar desafíos juntos":"una sociedad que aguante",
  "Otro":"algo que todavía estás definiendo" };

function low(s){return (s||"").charAt(0).toLowerCase()+(s||"").slice(1);}
function lista(arr,max){arr=(arr||[]).slice(0,max||3);if(!arr.length)return"";if(arr.length===1)return arr[0];
  return arr.slice(0,-1).join(", ")+" y "+arr[arr.length-1];}
function elDeLa(g){return g==="f"?"ella":"él";}
function unaUno(g){return g==="f"?"una":"un";}
function laEl(g){return g==="f"?"la":"el";}

function generar(P){
  const g=P.generoRetrato||"m", f=P.fecha||{d:15,m:6,y:1992};
  const signo=A.signoDe(f.d,f.m), el=A.elementoDe(signo), modo=A.modoDe(signo), reg=A.regenteDe(signo);
  const edad=EDAD[P.edad]||EDAD["30"], etnia=ETNIA[P.etnia]||ETNIA.libre;
  const en=ENERGIA[P.energia]||ENERGIA.carinosa, len=LENG[P.lenguaje]||LENG.palabras;
  const mot=MOTIVO[P.motivo]||MOTIVO.otro, dif=DIFI[P.dificultad]||DIFI.correcta;
  const cual=P.cualidades||[], exps=(P.experiencias&&[P.experiencias])||[];
  const exp=EXP[P.experiencias]||EXP.tranquilos;
  const futs=(P.futuro||[]).map(x=>FUT[x]||low(x));
  const p=elDeLa(g), un=unaUno(g), la=laEl(g);
  const opuestos=+P.opuestos||3;
  const S=[];

  /* 1 — DETALLES FÍSICOS */
  S.push({id:"fisicos",titulo:"Detalles físicos",texto:[
    `Cuando dibujé este rostro no partí de una idea de belleza. Partí de lo que me dijiste que necesitás sentir cuando ${p} entra a una habitación.`,
    `Es una persona ${edad[0]} años, ${edad[1]}, ${etnia}. Pero eso es la ficha, y la ficha nunca es lo que se reconoce.`,
    `Lo primero que vas a notar es la mirada. Elegiste que ${p} te trajera una energía ${en[0]}, y una energía así no se guarda: se le nota en los ojos antes de que hable. ${en[2].charAt(0).toUpperCase()+en[2].slice(1)}. Los ojos quedaron entrecerrados apenas, no por cansancio sino por esa costumbre de mirar de verdad a quien tiene enfrente.`,
    P.apariencia==="mucho"
      ? `Me dijiste que el físico te importa mucho, y no lo escondiste. Eso está bien: la atracción también es información. En el retrato eso aparece como una simetría cómoda, un rostro que sostiene la mirada sin esfuerzo. No es una cara de revista. Es una cara que envejece bien.`
      : P.apariencia==="personalidad"
      ? `Me dijiste que la personalidad te importa más que el físico, y el retrato lo respeta: el rostro no está armado para impresionar en una foto, está armado para mejorar cada vez que lo mirás. Es de esas caras que se vuelven lindas recién cuando la persona habla.`
      : `Me dijiste que el físico está bueno pero no es lo esencial, y así quedó: un rostro atractivo sin ser una demostración. La clase de cara que te gusta más el tercer día que el primero.`,
    `La boca es lo que más trabajé. ${cual.length?`Pusiste ${lista(cual.map(low),2)} entre las cualidades que buscás, y eso vive en la boca`:`Las cualidades que elegiste viven en la boca`}: en cómo se arma antes de decir algo importante, y en que no sonríe por compromiso.`,
    `El pelo y la contextura los dejé sin exagerar a propósito. Si el retrato fuera demasiado específico dejaría de servirte: te haría descartar a la persona correcta por un detalle. Lo que tenés que reconocer acá es el conjunto y la expresión, no el color exacto de nada.`
  ]});

  /* 2 — RASGOS DE PERSONALIDAD */
  const dec=P.decision;
  S.push({id:"personalidad",titulo:"Rasgos de personalidad",texto:[
    cual.length?`Pediste, en este orden: ${lista(cual.map(low),4)}. El orden importa más de lo que creés, porque lo primero que se elige suele ser lo que más falta hizo.`
      :`Elegiste cualidades que hablan de estabilidad más que de brillo.`,
    cual[0]?`${cual[0]} quedó primero. Esa es la columna de esta persona: lo que va a sostener cuando todo lo demás se ponga difícil.`:``,
    dec==="emociones"
      ? `Vos decidís desde la emoción. Eso significa que necesitás a alguien que no te haga sentir irracional por eso. En el retrato puse a alguien que también siente rápido, pero que aprendió a esperar un día antes de contestar. Esa combinación funciona: dos personas que sienten fuerte, una de las dos con freno.`
      : dec==="logica"
      ? `Vos decidís desde la lógica, y eso te protegió muchas veces. El riesgo es que la lógica también sirve para justificar la distancia. Esta persona no viene a discutirte los argumentos: viene a hacerte preguntas que los argumentos no contestan.`
      : `Dijiste que depende, y esa es probablemente la respuesta más honesta de las tres. Sos alguien que lee la situación antes de elegir el método. Esta persona hace lo mismo, y por eso no van a chocar por la forma de decidir sino, si chocan, por el fondo.`,
    opuestos>=4
      ? `Creés bastante que los opuestos se atraen. El retrato lo tuvo en cuenta: esta persona no es tu espejo. Hay cosas suyas que te van a resultar ajenas y algunas te van a irritar. Eso no es un error del dibujo, es lo que pediste.`
      : opuestos<=2
      ? `No creés demasiado en eso de que los opuestos se atraen, y el retrato te hizo caso: hay más parecido que contraste. Comparten forma de ver el mundo. El riesgo de esa comodidad es que a los dos les cueste señalarse las cosas.`
      : `Sobre si los opuestos se atraen quedaste en el medio, y ahí quedó el retrato: alguien parecido en lo esencial y distinto en lo cotidiano. Es la proporción que más suele durar.`,
    `Astrológicamente sos de ${el} y de modalidad ${modo}, regido por ${reg}. En vínculos eso se traduce en algo concreto: ${el==="fuego"?"arrancás con todo y necesitás que te sigan el ritmo sin apagarte":el==="tierra"?"vas despacio y desconfiás de lo que llega demasiado fácil":el==="aire"?"necesitás conversación antes que intensidad, y te aburrís antes de lo que admitís":"leés lo que no se dice y te herís con lo que a otros les resbala"}. Esta persona está construida para no chocar de frente con eso.`,
    `Lo que puede aparecer como problema: ${cual.some(c=>/^(protector|segur)/i.test(c))?"la seguridad que buscás a veces viene con una necesidad de tener razón":"la calidez que buscás a veces viene con dificultad para poner límites"}. No es motivo para descartar a nadie. Es motivo para nombrarlo temprano, cuando todavía es un detalle y no una costumbre.`
  ].filter(Boolean)});

  /* 3 — FORMA DE AMAR */
  S.push({id:"amar",titulo:"Forma de amar",texto:[
    `Tu lenguaje del amor es ${len[0].toLowerCase()}. Traducido: vos te sentís querida cuando ${len[1]}. ${len[2].charAt(0).toUpperCase()+len[2].slice(1)}.`,
    `Esta persona lo tiene, pero no de fábrica. Lo aprende. Y hay una diferencia enorme entre alguien a quien le sale naturalmente y alguien que presta atención a cómo funcionás y se acomoda. Lo segundo dura más, porque es una decisión y no un temperamento.`,
    `En el día a día se ve así: ${P.lenguaje==="palabras"?"te va a decir las cosas, incluso las incómodas, incluso cuando sería más fácil callarse":P.lenguaje==="regalos"?"va a aparecer con cosas chicas que prueban que estuvo pensando en vos cuando no estabas":P.lenguaje==="actividades"?"va a defender el tiempo juntos como si fuera un compromiso laboral, porque para esta persona lo es":P.lenguaje==="contacto"?"va a buscar la cercanía física sin convertirla siempre en otra cosa":"va a resolverte problemas antes de que los menciones, y a veces vas a tener que pedirle que no lo haga"}.`,
    `Sobre el compromiso: no es de los que prometen rápido. ${en[1].charAt(0).toUpperCase()+en[1].slice(1)} no se declara, se sostiene. Vas a notar que se compromete cuando cambie sus planes por vos sin hacerlo un tema.`,
    `Lo que tenés que pedirle: ${dif[0]==="abrirte con la gente"?"paciencia, y que no confunda tu reserva con desinterés":dif[0]==="manejar las dudas"?"que te diga las cosas dos veces, porque la primera vez no las vas a creer":dif[0]==="poner límites sanos"?"que no se aproveche de tu facilidad para decir que sí":"constancia, que es lo único que desarma lo que te cuesta"}.`,
    `Lo que le tenés que ofrecer: ${exp[1]}. Elegiste ${low(exp[0])} como la experiencia compartida que más valorás, y esa va a ser la moneda del vínculo. No lo delegues.`,
    futs.length?`En el futuro que imaginaste aparece ${lista(futs,3)}. Esta persona quiere eso también, pero no en el mismo orden que vos. Ahí van a tener la primera conversación seria.`:``
  ].filter(Boolean)});

  /* 4 — SEÑALES DEL ENCUENTRO */
  const vs=A.ventanas(signo);
  const v0=vs[0];
  const MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  S.push({id:"senales",titulo:"Señales del encuentro",texto:[
    v0?`Tu próxima ventana fuerte empieza alrededor del ${v0.inicio.getDate()} de ${MESES[v0.inicio.getMonth()]}. ${v0.motivo}`
      :`Las ventanas de este año se concentran en la segunda mitad.`,
    `Eso no significa que vayas a conocer a alguien ese día. Significa que en ese tramo tenés más probabilidad de estar disponible, que es distinto y es lo único que se puede calcular.`,
    `El escenario más probable tiene que ver con ${low(exp[0])}. ${P.experiencias==="viajar"?"No necesariamente un viaje largo: un traslado, una escapada, un lugar donde nadie te conoce y por eso te mostrás distinta.":P.experiencias==="tranquilos"?"Un lugar sin música fuerte. Una librería, un café, la casa de alguien. Vos funcionás mal donde hay que gritar.":P.experiencias==="logros"?"Un festejo ajeno. Un brindis, una presentación, algo donde la gente está contenta y con la guardia baja.":P.experiencias==="crear"?"Un taller, un curso, un proyecto. Algo donde las manos estén ocupadas y por eso la conversación salga sola.":"Una reunión familiar, propia o prestada. Un asado, un cumpleaños. Alguien que llega con otro."}`,
    `No va a ser en una aplicación de citas. No porque no sirvan, sino porque el modo en que vos evaluás gente necesita contexto, y ahí no hay contexto.`,
    `**Las cinco señales de que es ${p}**`,
    `Primero: no te apura. Vas a notar que no hay presión por definir nada en las primeras semanas, y eso te va a poner nerviosa porque no estás acostumbrada.`,
    `Segundo: se acuerda de cosas chicas que dijiste al pasar. No las anota, las escucha.`,
    `Tercero: ${dec==="emociones"?"cuando te desbordás, no te trata como un problema a resolver":"cuando te cerrás, no lo toma como algo personal"}.`,
    `Cuarto: te da razones para confiar antes de pedirte confianza. ${P.motivo==="confianza"||P.motivo==="infidelidad"?"Después de lo que pasó, esto es lo único que te va a permitir avanzar.":"Esto es lo que lo diferencia de las veces anteriores."}`,
    `Quinto: después de verlo, no quedás agotada. Esa es la señal más confiable de todas y la más fácil de comprobar.`
  ]});

  /* 5 — DESAFÍOS DE LA RELACIÓN */
  S.push({id:"desafios",titulo:"Desafíos de la relación",texto:[
    `Esta es la parte que nadie quiere leer y la única que sirve de verdad, así que la escribo sin adornos.`,
    `Me dijiste que tus relaciones anteriores no funcionaron por ${mot[0]}. Es decir: ${mot[1]}. Eso deja marca, y la marca no desaparece porque aparezca alguien mejor.`,
    `Y me dijiste que lo que más te cuesta hoy es ${dif[0]}: ${dif[1]}.`,
    `Las dos cosas juntas arman un patrón, y el patrón es este: ${P.motivo==="confianza"||P.motivo==="infidelidad"?"llegás a lo nuevo con un sistema de alarma que se activa antes de que pase nada. Lo que la otra persona vive como desconfianza, para vos es prevención. Ninguno de los dos está mintiendo.":P.motivo==="comunicacion"?"asumís que lo que es obvio para vos es obvio para el otro, y cuando no lo es, lo leés como falta de interés en vez de falta de información.":P.motivo==="distancia"?"dejás que las cosas se enfríen sin señalarlo, porque señalarlo se siente como exigir. Cuando finalmente hablás, ya pasó demasiado tiempo.":P.motivo==="objetivos"?"posponés las conversaciones grandes para no arruinar el momento, y las conversaciones grandes no se vuelven más fáciles con el tiempo.":P.motivo==="egoismo"?"das de más al principio para asegurarte un lugar, y después te resentís por un desequilibrio que empezaste vos.":"repetís una forma de vincularte que ya sabés que no te sirve, porque es la que conocés."}`,
    `Con esta persona eso va a aparecer, probablemente entre el tercero y el sexto mes, cuando se termine la parte fácil.`,
    `La buena noticia concreta: ${cual[0]?low(cual[0]):"la cualidad"} que pusiste primero es exactamente la herramienta que desarma ese patrón. No es casualidad que la hayas elegido.`,
    `Los límites de esta unión, dichos claro: ${el==="fuego"?"a vos te va a costar la paciencia y a esta persona le va a costar tu intensidad cuando no tenga dónde ir.":el==="tierra"?"a vos te va a costar el cambio de planes y a esta persona le va a costar tu resistencia a moverte.":el==="aire"?"a vos te va a costar la rutina y a esta persona le va a costar que analices en vez de sentir.":"a vos te va a costar no absorber el estado de ánimo del otro, y a esta persona le va a costar tu forma de callar cuando algo te duele."}`,
    `Nada de esto es una advertencia para que salgas corriendo. Es el mapa de lo que hay que trabajar, y toda relación que dura tiene uno. La diferencia entre las que aguantan y las que no es que en unas el mapa se habla y en otras se descubre tarde.`
  ]});

  return {signo:signo,elemento:el,modo:modo,regente:reg,secciones:S};
}
window.NOCTRA_LECTURA={generar};
})();
