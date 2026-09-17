/* Noctra v2 — el quiz, declarado.

   Todo lo que se decide "de negocio" vive acá: qué se pregunta, en qué orden,
   con qué palabras. El motor (js/app.js) no sabe nada del contenido: recorre
   esta lista y dibuja. Cambiar el embudo es editar este archivo.

   El copy está tal cual lo definimos, palabra por palabra. Si algo se
   reescribe, que sea por una decisión tomada, no por una corrección de paso.

   TIPOS DE PANTALLA

     signos    portada + la grilla de los 12 signos, todo junto
     opciones  pregunta + botones. Con "nota" aparece la aclaración chica.
     prueba    carrusel de social proof. El botón avanza el carrusel y
               recién en la última imagen pasa a la pantalla siguiente.
     nota      nota editorial larga. El botón vive al final del texto, así
               que para seguir hay que bajar y leer.
     carga     pantalla de espera animada. Avanza sola a los "segundos".
     resultado título + tarjeta + un campo + botón.
     conectado aviso de cupo + tarjeta de persona + botón.
     chat      la conversación con Elian. Ver el guion más abajo.

   GÉNERO. El copy se escribe en femenino —que es a quien apuntan los
   anuncios— y lleva la variante masculina pegada al lado, entre llaves y
   separadas por una barra: {sola|solo}, {BIENVENIDA|BIENVENIDO}, {él|ella}.
   El motor elige según lo que haya contestado en la pantalla "Yo soy:".
   Hasta que conteste, y si nunca contesta, sale la primera. Para agregar
   copy nuevo no hay que tocar código: alcanza con escribir el par. */
window.NOCTRA_V2 = {

  /* Clave propia. El quiz viejo usa "noctra_v2": con la misma, alguien que
     pase por los dos embudos arrastra respuestas cruzadas. */
  key: "noctra_q2",

  /* Mismo producto y misma variante que la portada vieja. Lo que se prueba
     es el embudo, no la oferta: cambiando las dos cosas a la vez no se sabe
     cuál movió la aguja. */
  checkoutUrl: "https://noctralmagemela.myshopify.com/cart/50392314314966:1",

  pasos: [

    /* 1 — Arranca con la pregunta, no con una portada muerta. Para cuando la
       persona decide si quiere hacer el test, ya lo empezó. */
    {
      tipo: "signos",
      campo: "signo",
      titulo: "¿ESTÁS {LISTA|LISTO} PARA CONOCER TU ALMA GEMELA?",
      badge: "👇 HACÉ EL TEST A CONTINUACIÓN PARA DESCUBRIR QUIÉN ES. 👇",
      paso: "Paso 1: ¿Cuál es tu signo?"
    },

    /* 2 — Quién es. Va acá y no antes: la portada tiene que seguir siendo
       el gancho, y para cuando llega a esta pantalla ya eligió su signo, o
       sea que ya empezó el test y contesta esto sin pensarlo.

       De esta respuesta cuelga todo el copy del embudo: cada texto de acá
       para abajo lleva su par {femenino|masculino} y el motor elige. */
    {
      tipo: "opciones",
      campo: "genero",
      titulo: "Yo soy:",
      opciones: [
        { emoji: "👩", txt: "Mujer",  val: "mujer" },
        { emoji: "👨", txt: "Hombre", val: "hombre" }
      ]
    },

    /* 3 y 4 — Fáciles, sobre ella, sin costo emocional. Sirven para que
       conteste tres veces antes de que le pidamos algo difícil. */
    {
      tipo: "opciones",
      campo: "situacion",
      titulo: "¿Cuál es tu situación sentimental actual?",
      opciones: [
        { emoji: "❤️", txt: "{Soltera|Soltero}",   val: "soltera" },
        { emoji: "💕", txt: "{De novia|De novio}", val: "novia" },
        { emoji: "💍", txt: "{Casada|Casado}",     val: "casada" },
        { emoji: "🤔", txt: "No sé/Otro",  val: "otro" }
      ]
    },
    {
      tipo: "opciones",
      campo: "importante",
      titulo: "¿Qué es lo más importante para vos?",
      opciones: [
        { emoji: "📊", txt: "Éxito",             val: "exito" },
        { emoji: "💕", txt: "Amor",              val: "amor" },
        { emoji: "✈️", txt: "Libertad",          val: "libertad" },
        { emoji: "💪", txt: "Salud",             val: "salud" },
        { emoji: "✅", txt: "Todas las opciones", val: "todas" }
      ]
    },

    /* 4 — Sin emojis, igual que en la referencia. Son seis opciones de texto
       largo: con emoji adelante el renglón se parte en dos en teléfonos
       angostos y la lista deja de leerse de un vistazo. */
    {
      tipo: "opciones",
      campo: "lenguaje",
      titulo: "¿Cuál es tu lenguaje del amor?",
      opciones: [
        { txt: "Palabras de afirmación", val: "palabras" },
        { txt: "Actos de servicio",      val: "actos" },
        { txt: "Regalos",                val: "regalos" },
        { txt: "Tiempo de calidad",      val: "tiempo" },
        { txt: "Contacto físico",        val: "contacto" },
        { txt: "Todavía no sé…",         val: "nose" }
      ]
    },

    /* 5 a 9 — Cinco sí/no seguidos. Parece repetitivo y es deliberado: las
       dos primeras nombran el dolor con sus palabras, las tres últimas la
       hacen decir en voz alta que quiere exactamente lo que vendemos. Para
       cuando llega la oferta, ya se la ofreció ella sola.

       El "*Sé {sincera|sincero}" no es decorativo: sube la tasa de "Sí" en la pregunta
       incómoda, que es la que sostiene todo lo que viene después. */
    {
      tipo: "opciones",
      campo: "miedo_sola",
      titulo: "¿Alguna vez sentiste que tu destino es quedarte {sola|solo} y nunca encontrar a alguien que realmente te entienda y te ame por quien sos?",
      nota: "*Sé {sincera|sincero}",
      opciones: [
        { emoji: "✅", txt: "Sí", val: "si" },
        { emoji: "❌", txt: "No", val: "no" }
      ]
    },
    {
      tipo: "opciones",
      campo: "decepcion",
      titulo: "¿Alguna vez te sentiste {decepcionada|decepcionado} con relaciones que al primer momento parecían prometedoras?",
      nota: "*Sé {sincera|sincero}",
      opciones: [
        { emoji: "✅", txt: "Sí", val: "si" },
        { emoji: "❌", txt: "No", val: "no" }
      ]
    },
    {
      tipo: "opciones",
      campo: "cree_astro",
      titulo: "¿Creés que la astrología puede revelar el rostro de tu alma gemela?",
      nota: "*Sé {sincera|sincero}",
      opciones: [
        { emoji: "✅", txt: "Sí", val: "si" },
        { emoji: "❌", txt: "No", val: "no" }
      ]
    },
    {
      tipo: "opciones",
      campo: "quiere_rostro",
      titulo: "¿Te gustaría ver el rostro de tu alma gemela hoy a través de la astrología?",
      nota: "*Sé {sincera|sincero}",
      opciones: [
        { emoji: "✅", txt: "Sí", val: "si" },
        { emoji: "❌", txt: "No", val: "no" }
      ]
    },
    {
      tipo: "opciones",
      campo: "quiere_cuando",
      titulo: "¿Y te gustaría saber exactamente cuándo y dónde vas a encontrar a tu alma gemela?",
      nota: "*Sé {sincera|sincero}",
      opciones: [
        { emoji: "✅", txt: "Sí", val: "si" },
        { emoji: "❌", txt: "No", val: "no" }
      ]
    },

    /* 10 — La prueba social, después de los cinco sí.

       El orden importa: si esto viniera antes, serían fotos de desconocidos.
       Acá llega justo después de que ella dijo que quiere ver el rostro y
       saber cuándo, así que cada foto contesta "esto es real y ya le pasó a
       alguien como yo".

       El botón avanza el carrusel en vez de saltear la pantalla. Cuatro
       toques en vez de uno: ve las cuatro pruebas sí o sí, y cada toque es
       un micro-compromiso más. Igual puede deslizar con el dedo si quiere
       ir más rápido. */
    {
      tipo: "prueba",
      titulo: "Mirá las personas a las que les revelé su alma gemela:",
      badge: "Deslizá para el costado y apretá el botón para continuar",
      boton: "Continuar",
      imagenes: ["prueba-1", "prueba-2", "prueba-3", "prueba-4"]
    },

    /* 11 — La autoridad, justo antes de pedir los datos.

       El título y el aviso son los de la referencia, con el nombre de él.
       La pieza de abajo la carga Maxi a mano en v2/assets/nota.webp y
       entra sola, sin tocar código. El hueco es alto a propósito: la pieza
       tiene que cruzar el borde de la pantalla, así la persona baja para
       verla entera y recién ahí encuentra el botón. */
    {
      tipo: "nota",
      titulo: "El Maestro Elian te va a guiar hasta tu alma gemela según tu carta astral! Es vidente hace más de 12 años.",
      badge: "👇 Mirá el reportaje sobre él: 👇",
      boton: "Continuar",
      nota: { foto: "nota" }
    },

    /* 12 — La espera.

       No es decorativa: separa el "contesté un test" del "me dieron un
       resultado". Sin esta pausa, el resultado se lee como una pantalla más
       del formulario y no como algo que se produjo para ella.

       Cuatro segundos y medio. Menos no alcanza para que se sienta un
       cálculo; más y la persona se va. */
    {
      tipo: "carga",
      sinBarra: true,
      titulo: "Analizando tus respuestas…",
      sub: "CONECTANDO CON LOS ASTROS…",
      segundos: 4.5
    },

    /* 13 — El resultado y el nombre.

       El nombre se pide DESPUÉS de decirle que el resultado ya existe. Es
       la diferencia entre pedir un dato para empezar y pedirlo para
       entregar algo que ya está hecho. */
    {
      tipo: "resultado",
      titulo: "¡RESULTADO ENCONTRADO!",
      /* Antes decía que la lectura llegaba por WhatsApp y después no llegaba
         nada: la persona se queda esperando un mensaje que no existe y eso
         vuelve como contracargo. Ahora dice lo que realmente pasa —se abre
         un chat con él— y encima engancha mejor con la pantalla siguiente. */
      tarjeta: "Tu lectura ya está lista. Elian te la entrega él mismo, en un chat privado. Decime cómo te llamás y te abro la conversación.",
      campo: "nombre",
      placeholder: "Ingresá tu primer nombre…",
      boton: "ABRIR MI CHAT CON ELIAN"
    },

    /* 14 — El paso al dibujo.

       "cupo" y "enLinea" salen de acá y no están escritos en el motor a
       propósito: si el cupo del día no es real, se cambia el número o se
       saca la línea desde este archivo, sin tocar código. Lo mismo con
       "En línea". Es más barato limitar de verdad las lecturas por día que
       sostener un cartel que no se puede probar. */
    {
      tipo: "conectado",
      aviso: "⚠️ ¡ATENCIÓN!",
      cupo: "Solo 2 lecturas más disponibles hoy",
      titulo: "¡Buenas noticias!\nEl Maestro Elian está conectado\ny listo para dibujar tu retrato!",
      persona: {
        nombre: "Maestro Elian",
        estado: "En línea",
        foto: "elian-avatar",
        sobre: "Artista y lector de carta astral. Hace más de 15 años que dibuja el rostro de quien todavía no conociste."
      },
      boton: "EMPEZAR MI DIBUJO"
    },

    /* 16 — El chat.

       Es el cierre del embudo. Todo lo que dice Elian está en "guion", de
       arriba hacia abajo, y el motor lo va soltando de a un mensaje con el
       "escribiendo…" en el medio. La estructura es la de la referencia,
       paso por paso, sin agregados.

       CÓMO SE ESCRIBE UN PASO DEL GUION

         {de:"el", txt:"..."}              un mensaje de él. **así** va en negrita.
         {de:"el", audio:"audio-1", dur:"0:07"}   un audio. "dur" es lo que
                                           muestra la burbuja antes de que
                                           lo toque; al reproducir corre solo.
         {de:"el", img:"pareja-1"}         una foto
         {espera:{campo:"x", pregunta:"…", pista:"Escribí SI para continuar",
                  opciones:[{txt:"SI", val:"si"}]}}
                                           pregunta + aviso chico + botones.
         {espera:{campo:"x", pregunta:"…", pista:"…", fecha:true}}
                                           pide una fecha con el calendario.
         {solo:{x:"si"}}                   ese paso aparece SÓLO si eligió eso
         {cta:"TEXTO DEL BOTÓN"}           el botón final, va al checkout

       {nombre}, {signo} y {fecha} se reemplazan con lo que contestó.
       {lugar} sale de /api/lugar: la provincia desde donde está escribiendo,
       con la preposición puesta ("en Córdoba"). Si no hay dato confiable
       queda "cerca tuyo".

       LA BIFURCACIÓN

       "¿Cómo vienen tus relaciones?" tiene tres respuestas y ninguna deja a
       nadie afuera: cada una recibe su eco y su línea, y las tres vuelven al
       mismo lugar. Está para que el mensaje siguiente hable de lo que acaba
       de decir, no para separar a nadie del embudo. */
    {
      tipo: "chat",
      sinBarra: true,
      contacto: { nombre:"Maestro Elian", estado:"En línea", foto:"elian-avatar" },
      guion: [

        { de:"el", txt:"⏳ Iniciando la lectura de {nombre}…" },
        { de:"el", txt:"{BIENVENIDA|BIENVENIDO} 🙏🍀" },
        { de:"el", txt:"Hola, soy el Maestro Elian…" },
        { de:"el", txt:"{nombre}, te voy a explicar cómo funciona…" },
        { de:"el", audio:"audio-1", dur:"0:07" },
        { de:"el", audio:"audio-2", dur:"0:07" },
        { de:"el", txt:"Mi retrato tiene una **precisión de hasta el 98%**… muchas personas se **emocionan** al recibir el dibujo…" },
        { de:"el", txt:"Así que preparate, porque ya voy a empezar el tuyo!" },
        { espera:{ campo:"chat_empezar", pregunta:"Podemos empezar?",
                   pista:"Escribí SI para continuar",
                   opciones:[{txt:"SI", val:"si"}] } },

        { de:"el", txt:"Vi que sos del signo de {signo}, correcto?" },
        { espera:{ campo:"fecha_nac", pregunta:"Cuál es tu fecha de nacimiento completa?",
                   pista:"Elegí día, mes y año acá abajo 👇", fecha:true } },

        { espera:{ campo:"chat_relacion", pregunta:"Y por último… cómo vienen tus relaciones?",
                   opciones:[
                     {txt:"No estoy con nadie", val:"sola"},
                     {txt:"Estoy en pareja",    val:"pareja"},
                     {txt:"Es complicado",      val:"complicado"} ] } },

        { de:"el", solo:{chat_relacion:"sola"},       txt:"Entonces no estás con nadie?" },
        { de:"el", solo:{chat_relacion:"sola"},
          txt:"Es muy raro encontrar a alguien del signo de {signo} {soltera|soltero}, siento que tenés un corazón muy bueno…" },
        { de:"el", solo:{chat_relacion:"pareja"},     txt:"Entonces estás con alguien…" },
        { de:"el", solo:{chat_relacion:"pareja"},
          txt:"Puedo sentir a alguien al lado tuyo… pero no es la persona que veo en tu carta." },
        { de:"el", solo:{chat_relacion:"complicado"}, txt:"Entonces hay alguien, pero no termina de cerrar…" },
        { de:"el", solo:{chat_relacion:"complicado"},
          txt:"Eso también lo veo acá. Y la persona que veo en tu carta no es esa." },

        { de:"el", audio:"audio-3", dur:"0:09" },
        { de:"el", txt:"Van a tener una conexión inmediata… va a parecer que se conocen hace tiempo!" },

        { de:"el", txt:"Un día {estas clientes|estos clientes} también estaban donde estás vos, hablando conmigo… Y después de un tiempo, me mandaron estas fotos 👇" },
        { de:"el", img:"pareja-1" },
        { de:"el", img:"pareja-2" },

        { espera:{ campo:"chat_dibujar", pregunta:"Puedo empezar a dibujar a Tu Alma Gemela?",
                   pista:"Escribí SI para confirmar.",
                   opciones:[{txt:"SI", val:"si"}] } },

        { de:"el", txt:"{nombre}, del signo de {signo}" },
        { de:"el", txt:"Naciste el {fecha}" },
        { de:"el", txt:"Tengo tu carta astral abierta…" },
        { de:"el", txt:"Estoy visualizando mucha información importante…" },
        { de:"el", txt:"Vi que tu alma gemela está {lugar}!" },
        { de:"el", audio:"audio-4", dur:"0:16" },
        { de:"el", txt:"{nombre}, prestá mucha atención!" },
        { de:"el", audio:"audio-5", dur:"0:09" },

        { de:"el", txt:"Y pensando todavía más en ayudarte, te voy a dar GRATIS una lectura completa en PDF…" },
        { de:"el", txt:"💝 Personalidad completa de {él|ella}…\n\n💝 Cuándo y dónde {lo|la} vas a encontrar?\n\n💝 Dónde vive?\n\n💝 Truco simple para que te quedes en su mente cuando {lo|la} encuentres!\n\n💝 Cómo hacer que {él|ella} te vea a VOS como {la mujer|el hombre} más importante de su vida!" },

        { cta:"DESBLOQUEAR EL ROSTRO DE MI ALMA GEMELA" }
      ]
    }
  ],

  /* Los 12 signos. La ilustración va en assets/<id>.webp; hasta que
     existan, se dibuja el símbolo unicode, que se ve intencional y no como
     una imagen rota. */
  signos: [
    { id:"aries",       nombre:"Aries",       glifo:"♈" },
    { id:"tauro",       nombre:"Tauro",       glifo:"♉" },
    { id:"geminis",     nombre:"Géminis",     glifo:"♊" },
    { id:"cancer",      nombre:"Cáncer",      glifo:"♋" },
    { id:"leo",         nombre:"Leo",         glifo:"♌" },
    { id:"virgo",       nombre:"Virgo",       glifo:"♍" },
    { id:"libra",       nombre:"Libra",       glifo:"♎" },
    { id:"escorpio",    nombre:"Escorpio",    glifo:"♏" },
    { id:"sagitario",   nombre:"Sagitario",   glifo:"♐" },
    { id:"capricornio", nombre:"Capricornio", glifo:"♑" },
    { id:"acuario",     nombre:"Acuario",     glifo:"♒" },
    { id:"piscis",      nombre:"Piscis",      glifo:"♓" }
  ]
};
