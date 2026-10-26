/* Noctra LatAm — secuencia de upsells en formato TSL largo.

   Orden: primero el pack Cuándo/Cómo/Dónde (el que más vende), después el
   Código (la letra), y al final la cola barata.

   Cada "no" recibe un tipo de respuesta distinto, a propósito:
     ruleta      -> descuento con forma de juego
     partir      -> el mismo producto, recortado y más barato
     otro        -> un producto distinto y más chico
     ultima      -> precio simbólico y se cierra

   Los links de cobro NO viven acá abajo: viven en CHECKOUT. */
(function(){
  "use strict";

  var CHECKOUT = { u1:"", u1b:"", d1:"", u2:"", u2b:"", d2:"", d3:"" };
  var DESTINO  = "/app/";
  var LEGAL = "Pago único. No es suscripción: no hay renovación ni cobros posteriores.";
  var VENTANA = [["Hoy","Ya viste su cara",""],["Antes","Empiezan tus señales","med"],["Tu ventana","El centro de tus 9 días","on"]];

  var PASOS = [

  /* ============ 1. PACK CUÁNDO, CÓMO Y DÓNDE ============ */
  {
    id:"u1",
    sello:"rueda",
    revelado:[
      "El retrato está terminado.",
      "Pero hay algo que un dibujo no puede mostrarte.",
      "Tu carta tiene una <span class='o'>ventana abierta</span>.",
      "Y no va a quedarse abierta para siempre."
    ],
    kicker:"ESPERA — NO CIERRES TODAVÍA",
    titulo:"Viste su cara. <span class='o'>Falta el día en que la vas a tener delante.</span>",
    sub:"Y ese día ya tiene fecha.",
    partes:[
      {t:"ficha",
        cab:["TU VENTANA","Alrededor de la próxima luna llena"],
        linea:VENTANA,
        campos:[
          ["CUÁNDO EXACTAMENTE","texto","entre el <i class='tapa'></i> y el <i class='tapa'></i> de <i class='tapa'></i>"],
          ["DÓNDE SE CRUZAN","borr",[94,61]],
          ["CÓMO EMPIEZA","borr",[82]],
          ["CÓMO LO VAS A RECONOCER","borr",[71]]
        ],
        pie:"Ya está escrito. Solo falta que lo abras."},

      {t:"p1",x:"Conozco de memoria el momento que viene ahora. Cierras el retrato, te quedás unos segundos mirando la pantalla apagada, y aparece esa sensación rara en el pecho, mezcla de «qué fuerte» y de <mark>«¿y ahora qué hago con esto?»</mark>."},
      {t:"p",x:"Eso que sentís ahí no es duda. Es una pregunta que todavía no sabés formular. Dejame que te la formule yo:"},
      {t:"cita",x:"«Bueno. Ya sé cómo es. ¿Y cuándo?»"},
      {t:"p",x:"Porque una cara, sola, no hace nada. Una cara sola es un dibujo bonito que guardás en el teléfono, que le mostrás a una amiga, y que dentro de seis meses encontrás revolviendo la galería y te hace sonreír un segundo antes de seguir con lo tuyo."},
      {t:"p",x:"Y mientras tanto pasa otro año. <mark>Y vos ya hiciste la cuenta de cuántos van.</mark>"},

      {t:"sep"},
      {t:"h",x:"Lo que realmente pasa"},
      {t:"p",x:"La persona aparece. Aparece de verdad. Pero aparece un martes cualquiera, a una hora en la que vas apurada, con el teléfono en la mano, pensando en otra cosa. Aparece sin cartel, sin música de fondo, sin que nada se ponga en cámara lenta."},
      {t:"p",x:"<b>Y pasa de largo.</b> No porque no fuera él. Porque vos no estabas mirando."},
      {t:"nota",x:"Tu ventana dura nueve días, no todo el año. Y tus señales empiezan antes: falta menos de lo que parece."},
      {t:"p",x:"O peor: aparece, hablan, y queda en nada. Y tres meses después te seguís preguntando «¿sería ese?», mientras le das tiempo y energía a alguien que nunca fue."},

      {t:"sep"},
      {t:"h",x:"Por qué justo ahora"},
      {t:"p",x:"Entre los cuarenta y los cincuenta pasa algo que en astrología tiene nombre: <mark class='v'>la oposición de Urano</mark>. Urano llega enfrente del lugar donde estaba cuando naciste, y lo que hace es simple y brutal: deja de dejarte fingir."},
      {t:"p",x:"Por eso a esta edad las mujeres no aguantan lo que aguantaban a los treinta. Se terminan matrimonios que parecían de cemento. Se dejan trabajos de quince años. Y se empieza a mirar el teléfono a las once de la noche preguntándose si esto es todo."},
      {t:"marco",x:"No estás en crisis.<br>Estás en el tránsito que te saca de donde ya no entras."},
      {t:"p",x:"Y hay una parte que casi nadie te dice: <b>esta apertura no dura toda la vida.</b> Urano se queda enfrente unos tres años y después se corre. Lo que se abre en este tramo se abre ahora."},
      {t:"p",x:"Vos ya diste años a quien no era. Eso no se discute: ya pasó. <mark>La pregunta es cuántos más estás dispuesta a dar a ciegas.</mark>"},

      {t:"sep"},
      {t:"h",x:"Lo que Maia vio en tus respuestas"},
      {t:"p",x:"Cuando contestaste el test no estabas eligiendo una cara. Estabas dejando un rastro: cómo te enamorás, qué te desarma, dónde te sentís cómoda, qué evitás, qué te da vergüenza admitir que buscás."},
      {t:"p",x:"Ese rastro no solo dibuja a una persona. Dibuja <b>una escena</b>: un tipo de lugar, un tipo de día, una forma específica en la que dos personas como ustedes se terminan cruzando."},
      {t:"marco",x:"Un día exacto se te escapa.<br>Nueve días sabiendo dónde mirar, no."},

      {t:"sep"},
      {t:"h",x:"Qué se abre cuando lo pides"},
      {t:"lista",items:[
        ["DÓNDE SE CRUZAN","El tipo de lugar y la situación concreta del primer cruce. No «en un café»: el contexto real."],
        ["CUÁNDO","Los días exactos de tu ventana y la luna que la marca, con la fecha delante."],
        ["CÓMO EMPIEZA","El primer contacto y quién da el primer paso, para que no lo confundas con una charla más."],
        ["CÓMO LO VAS A RECONOCER","Los dos rasgos que vas a notar antes que nada, y el error que más veces hace que alguien lo deje pasar."],
        ["LAS SEÑALES DE ANTES","Las tres cosas que vas a empezar a notar semanas antes. Cuando aparezcan, vas a saber que falta poco."],
        ["QUÉ HACER MIENTRAS TANTO","Lo que te conviene tener resuelto para no llegar a tu ventana agotada y distraída."]
      ],cierre:"Todo sale de tus propias respuestas. No hay que contestar nada más: ya está calculado."},

      {t:"sep"},
      {t:"h",x:"Lo que seguramente estás pensando"},
      {t:"p",x:"<b>«¿Y si no pasa nada en esos días?»</b> Entonces ya sabés algo que antes no sabías, y la siguiente ventana la vas a reconocer sola. Esto no te promete un hombre en la puerta: te da el mapa para dejar de mirar al azar."},
      {t:"p",x:"<b>«¿No es mucha guita?»</b> Sale menos que una salida de las que hacés igual. Y las salidas las vas a hacer igual: la diferencia es si vas sabiendo cuál es la que importa o si vas a ver qué pasa, otra vez."},
      {t:"p",x:"<b>«Lo pienso y vuelvo.»</b> Podés. El retrato queda. Pero seamos honestas: <mark>«lo pienso» casi siempre quiere decir «no».</mark> Y los cielos no se mueven según lo que vos decidas hoy."},

      {t:"sep"},
      {t:"p",x:"Ya hiciste la parte difícil: el test, la espera y mirar la cara de frente."},
      {t:"p",x:"<b>No te quedes a mitad de camino con la mitad de la historia.</b>"},
      {t:"p",x:"Hiciste el test porque algo adentro tuyo todavía cree. <mark>No lo dejes solo con una cara.</mark>"}
    ],
    precio:"$26.197", antes:"$39.600",
    cta:"Sí — quiero saber cuándo y dónde", ctaSub:LEGAL,
    rechazo:"No, gracias",
    pd:"<b>P. D.</b> — Si cerrás esta pantalla, el retrato sigue siendo tuyo y la app también. Lo único que se queda afuera es el cuándo, que es la única parte que no se puede deducir mirando el dibujo.",
    va:"r1"
  },

  /* ============ 2. DOWNSELL: RULETA DORADA ============ */
  { id:"r1", tipo:"ruleta", tono:"oro", premio:"30% OFF", va:"u1b",
    kicker:"ESPERA — MAIA NO QUIERE QUE TE LO PIERDAS",
    titulo:"Gira la ruleta",
    sub:"Te deja un descuento para abrir el pack completo. Una sola vez.",
    casillas:["10% OFF","30% OFF","5% OFF","Sin premio","20% OFF","Otra vez"] },

  /* ============ 3. EL PACK, CON EL DESCUENTO ============ */
  {
    id:"u1b",
    sello:"rueda",
    revelado:[
      "Listo. <span class='o'>Tu 30% ya está aplicado.</span>",
      "Es el mismo pack completo, al precio de una sola sección."
    ],
    kicker:"TU DESCUENTO, APLICADO",
    titulo:"El pack entero, <span class='o'>por menos de lo que vale la mitad.</span>",
    sub:"Mismo contenido. Solo en esta pantalla.",
    partes:[
      {t:"p1",x:"No cambié nada del pack: están las seis secciones, completas, iguales que hace un minuto. Lo único distinto es el número."},
      {t:"nota",x:"Si salís de esta pantalla, el descuento no vuelve a aparecer. No es una táctica: es que el precio normal es el otro."},
      {t:"lista",items:[
        ["DÓNDE, CUÁNDO Y CÓMO","Las tres partes del encuentro, completas."],
        ["LAS SEÑALES DE ANTES","Las tres que aparecen semanas antes."],
        ["QUÉ HACER MIENTRAS TANTO","Para llegar a tu ventana sin estar en otra cosa."]
      ],cierre:"Las seis secciones, sin recortes."},
      {t:"p",x:"Si dijiste que no por el precio, este es el precio. Si dijiste que no por otra cosa, no pasa nada: abajo sigue habiendo una puerta."}
    ],
    precio:"$18.337", antes:"$26.197",
    cta:"Usar mi descuento", ctaSub:"Pago único, solo en esta pantalla.",
    rechazo:"No, gracias", pd:"",
    va:"d1"
  },

  /* ======= 4. DOWNSELL: PARTIR EL PACK, SOLO LA FECHA ======= */
  {
    id:"d1",
    sello:"lunas",
    revelado:["Está bien.","Entonces dejame separar <span class='o'>una sola cosa.</span>"],
    kicker:"ENTONCES QUE SEA UNA SOLA",
    titulo:"Si te llevás algo, <span class='o'>que sea la fecha.</span>",
    sub:"Es la única parte que no se puede adivinar con el tiempo.",
    partes:[
      {t:"ficha",
        cab:["TU VENTANA","Nueve días, una vez"],
        linea:VENTANA,
        campos:[["CUÁNDO EXACTAMENTE","texto","entre el <i class='tapa'></i> y el <i class='tapa'></i> de <i class='tapa'></i>"]],
        pie:"Es lo único que falta para que la tengas anotada."},
      {t:"p1",x:"A lo mejor no es que no te interese. A lo mejor es que seis cosas juntas son demasiado para decidir en una pantalla. Así que divido el pack y te dejo la mitad que importa."},
      {t:"p",x:"El lugar, con el tiempo, lo podrías intuir sola: conocés tus lugares. Cómo empieza, también. <b>La ventana no.</b> Son unos días marcados por una luna concreta, y si pasan, pasan."},
      {t:"cita",x:"El resto lo podés descubrir viviendo.<br>La fecha es la única que se escapa entera."},
      {t:"lista",items:[
        ["LOS DÍAS EXACTOS","El rango completo de tu ventana y la luna que la abre."],
        ["QUÉ HACER ESOS DÍAS","Para que no se te pasen como un fin de semana más."]
      ],cierre:"La mitad del pack, al precio de llevarla sola."},
      {t:"p",x:"<b>Anotar una fecha cuesta treinta segundos. Reconstruirla después de que pasó no se puede.</b>"}
    ],
    precio:"$11.906", antes:"$26.197",
    cta:"Quiero la fecha", ctaSub:"Pago único, solo en esta pantalla.",
    rechazo:"Ahora no",
    pd:"<b>P. D.</b> — Queda guardada en tu app y te aviso cuando la ventana se acerque. No te tenés que acordar vos.",
    va:"u2"
  },

  /* ============ 5. EL CÓDIGO — LA LETRA ============ */
  {
    id:"u2",
    sello:"letras",
    revelado:[
      "Espera.",
      "Hay algo más en el dibujo.",
      "Una <span class='o'>letra</span>, marcada sobre el papel.",
      "La primera de su nombre."
    ],
    kicker:"UNA COSA MÁS",
    titulo:"Maia también vio <span class='o'>cómo se llama.</span>",
    sub:"Ya sabés cómo es su cara. Te falta lo que hace que, en el momento, no tengas ninguna duda.",
    partes:[
      {t:"ficha",
        letra:"SU NOMBRE EMPIEZA CON",
        campos:[
          ["SU SIGNO","borr",[44]],
          ["SU ELEMENTO","borr",[90,54]],
          ["COMPATIBILIDAD CON VOS","texto","<i class='tapa'></i> %"],
          ["PARA QUE SE QUEDE","borr",[82,58]],
          ["¿ES ESTA PERSONA?","borr",[74]],
          ["RITUAL DE 21 DÍAS","borr",[88,46]]
        ],
        pie:"Sale de tu retrato y de tu signo. Ya está calculado."},

      {t:"p1",x:"Una cara la podés confundir. Luz mala, barba de tres días, un gorro, diez años más que en el dibujo. Hay días en que no estás atenta y hay caras parecidas."},
      {t:"p",x:"Y a esta altura ya sabés cómo termina eso: <mark>le das tres meses a alguien para confirmar lo que la primera semana ya te decía que no.</mark> Tres meses no son nada a los veinticinco. A los cuarenta y cinco son tres meses."},
      {t:"marco",x:"Una cara se confunde.<br>Una cara, una inicial y un signo, no."},

      {t:"sep"},
      {t:"h",x:"Imaginate el momento"},
      {t:"p",x:"Estás en algún lado. Alguien te dice su nombre. La conversación sigue como si nada, porque así siguen las conversaciones."},
      {t:"p",x:"<b>Si ese nombre empieza con la letra de tu Código, lo vas a sentir antes de pensarlo.</b> Se te va a mover algo en el estómago y vas a prestar atención de otra manera. Y esa atención distinta es, literalmente, la diferencia entre una charla más y <mark>la charla.</mark>"},
      {t:"p",x:"Y si no la sabés, es un nombre más y una charla más. Y lo dejás pasar sin enterarte de que pasó."},
      {t:"nota",x:"No te estoy pidiendo que contestes nada más. Tu Código sale de tu retrato y de tu signo: ya está calculado."},

      {t:"sep"},
      {t:"h",x:"Y el signo descarta más de lo que creés"},
      {t:"p",x:"Hay doce signos. Con el tuyo, la mayoría quedan descartados desde el principio: no porque sean mala gente, sino por la forma de querer. Hay elementos que se demuestran con hechos y otros que se demuestran con palabras, y cuando no coinciden los dos se cansan."},
      {t:"p",x:"Saber el suyo no es un dato de adorno. Es saber <b>qué necesita sentir para quedarse</b>, y cuál es el error que más rápido lo aleja."},

      {t:"sep"},
      {t:"h",x:"Qué se abre"},
      {t:"lista",items:[
        ["LA INICIAL DE SU NOMBRE","La letra que apareció en el dibujo, en claro."],
        ["SU SIGNO","Cuál es, y por qué ese y no otro."],
        ["SU ELEMENTO","Qué forma de querer trae: no todos se demuestran igual."],
        ["COMPATIBILIDAD CON EL TUYO","El número y, sobre todo, el porqué."],
        ["PARA QUE SE QUEDE","Qué necesita sentir alguien de su elemento, y el error que más rápido lo aleja."],
        ["«¿ES ESTA PERSONA?»","Ponés su nombre y su signo en tu app y te digo si coincide con tu Código."],
        ["RITUAL DE 21 DÍAS","Uno por día, dentro de la app. El primero se abre hoy."]
      ],cierre:"Todo junto, y queda guardado en tu app."},

      {t:"sep"},
      {t:"h",x:"«¿Y si conozco a alguien y no estoy segura?»"},
      {t:"p",x:"Para eso está «¿Es esta persona?» adentro de tu app. No es para que desconfíes de todo el mundo: es al revés. <b>Es para que tengas con qué confirmarlo</b> el día que dudes, en vez de darle tres meses a la duda."},
      {t:"p",x:"Porque el tiempo que se pierde casi nunca se va esperando al indicado. Se va averiguando que alguien no lo era."},

      {t:"sep"},
      {t:"p",x:"La cara ya la tenés."},
      {t:"p",x:"<b>Sería una pena cerrar tu lectura sabiendo cómo es su cara y no cómo se llama.</b>"},
      {t:"p",x:"Ya esperaste bastante como para además <mark>llegar y no reconocerlo.</mark>"}
    ],
    precio:"$14.790", antes:"$29.600",
    cta:"Sí — quiero saber cómo se llama", ctaSub:LEGAL,
    rechazo:"Ahora no",
    pd:"<b>P. D.</b> — El ritual de 21 días vive dentro de tu app y el día 1 se abre hoy. No es un PDF que se te pierde en el correo.",
    va:"r2"
  },

  /* ============ 6. DOWNSELL: RULETA VIOLETA ============ */
  { id:"r2", tipo:"ruleta", tono:"violeta", premio:"50% OFF", va:"u2b",
    kicker:"UNA ÚLTIMA VUELTA",
    titulo:"Esta gira distinto",
    sub:"La primera era de oro. Esta es la otra, y paga más.",
    casillas:["15% OFF","50% OFF","25% OFF","Sin premio","35% OFF","Otra vez"] },

  /* ============ 7. EL CÓDIGO, A MITAD DE PRECIO ============ */
  {
    id:"u2b",
    sello:"letras",
    revelado:["Cincuenta. <span class='o'>La mitad.</span>","Es lo más abajo que puede ir el Código."],
    kicker:"TU DESCUENTO, APLICADO",
    titulo:"La inicial de su nombre, <span class='o'>a mitad de precio.</span>",
    sub:"Mismo contenido, el número partido al medio.",
    partes:[
      {t:"ficha",
        letra:"SU NOMBRE EMPIEZA CON",
        campos:[["SU SIGNO","borr",[44]],["COMPATIBILIDAD CON VOS","texto","<i class='tapa'></i> %"]],
        pie:"Lo mismo de hace un minuto, con la mitad del precio."},
      {t:"p1",x:"No saqué nada. Están la inicial, el signo, el elemento, la compatibilidad, el «¿es esta persona?» y los 21 días del ritual. Lo único que cambió es el número de abajo."},
      {t:"nota",x:"Es el último precio que te puedo dar por el Código. Si salís de acá, vuelve a su valor y esta pantalla no se repite."},
      {t:"p",x:"Y si igual no es para vos, está bien: abajo hay dos puertas más y después te dejo tranquila de verdad."}
    ],
    precio:"$7.395", antes:"$11.906",
    cta:"Usar mi 50%", ctaSub:"Pago único, solo en esta pantalla.",
    rechazo:"No, gracias", pd:"",
    va:"d2"
  },

  /* ============ 8. DOWNSELL: OTRO PRODUCTO, MÁS CHICO ============ */
  {
    id:"d2",
    sello:"mapa",
    revelado:["Última cosa.","Y es la que más me piden <span class='o'>cuando ya es tarde.</span>"],
    kicker:"SI TE LLEVÁS UNA SOLA COSA",
    titulo:"Que sea saber <span class='o'>cómo reconocerlo.</span>",
    sub:"Lo que no cambia aunque cambie la cara.",
    partes:[
      {t:"ficha",
        campos:[
          ["DOS RASGOS FÍSICOS","borr",[90,55]],
          ["DOS GESTOS SUYOS","borr",[76]],
          ["Y LO QUE NO ES ÉL","borr",[84,48]]
        ],
        pie:"La sección más chica del pack, y la única que se lleva sola."},
      {t:"p1",x:"Hay una pregunta que vuelve siempre, semanas después del retrato, y nunca es «¿existe?». Siempre es la misma, y llega de noche:"},
      {t:"cita",x:"«¿Y si lo tengo delante y no me doy cuenta?»"},
      {t:"p",x:"Por eso esta parte no habla de la cara. Habla de lo que <b>no cambia</b>: cómo se mueve, qué hace con las manos cuando escucha, cómo se ríe cuando algo le causa gracia de verdad."},
      {t:"p",x:"Y el reverso, que suena a detalle y es la mitad del valor: <b>cómo darte cuenta rápido de que alguien no es</b>, para no regalarle meses."}
    ],
    precio:"$7.197", antes:"$17.770",
    cta:"Abrir La señal", ctaSub:"Pago único. Se abre acá mismo y queda en tu app.",
    rechazo:"No, gracias", pd:"",
    va:"d3"
  },

  /* ============ 9. DOWNSELL: ÚLTIMA LLAMADA ============ */
  {
    id:"d3",
    sello:"mapa",
    revelado:["Listo. <span class='o'>Última pantalla.</span>","Después te dejo tranquila, de verdad."],
    kicker:"LO DEJO ACÁ",
    titulo:"No voy a insistir más.",
    sub:"Pero prefiero que te lleves algo útil antes que nada.",
    partes:[
      {t:"p1",x:"Te hice varias ofertas y dijiste que no a todas. Lo respeto: es tu plata y es tu decisión, y el retrato ya es tuyo igual."},
      {t:"p",x:"Pero hay algo que me quedó dando vueltas: la parte más barata de todo esto es también la que más se usa el día que de verdad pasa algo. Así que te la dejo al precio de un café y cerramos."},
      {t:"lista",items:[
        ["LA SEÑAL, COMPLETA","Los dos rasgos, los dos gestos y lo que no es él. Igual que arriba, sin recortes."]
      ],cierre:"Si decís que no, se cierra y entrás directo a tu lectura."},
      {t:"sep"},
      {t:"p",x:"Y si igual decís que no: está bien. <b>Nos vemos adentro.</b>"}
    ],
    precio:"$3.997", antes:"$7.197",
    cta:"Está bien, lo quiero", ctaSub:"Pago único. Esta pantalla no vuelve a aparecer.",
    rechazo:"No, gracias. Llévame a mi lectura", pd:"",
    va:null
  }
  ];

  window.NOCTRA_PASOS = { PASOS:PASOS, CHECKOUT:CHECKOUT, DESTINO:DESTINO };
})();
