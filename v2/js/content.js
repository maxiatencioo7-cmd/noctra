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

   Nota sobre el género: todo el copy está en femenino. Los anuncios tienen
   que ir segmentados a mujeres, porque un hombre choca contra la pared en la
   primera línea. Si algún día se abre a varones, hay que duplicar el copy,
   no sólo agregar una pregunta. */
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
      titulo: "¿ESTÁS LISTA PARA CONOCER TU ALMA GEMELA?",
      badge: "👇 HACÉ EL TEST A CONTINUACIÓN PARA DESCUBRIR QUIÉN ES. 👇",
      paso: "Paso 1: ¿Cuál es tu signo?"
    },

    /* 2 y 3 — Fáciles, sobre ella, sin costo emocional. Sirven para que
       conteste tres veces antes de que le pidamos algo difícil. */
    {
      tipo: "opciones",
      campo: "situacion",
      titulo: "¿Cuál es tu situación sentimental actual?",
      opciones: [
        { emoji: "❤️", txt: "Soltera",     val: "soltera" },
        { emoji: "💕", txt: "De novia",    val: "novia" },
        { emoji: "💍", txt: "Casada",      val: "casada" },
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

       El "*Sé sincera" no es decorativo: sube la tasa de "Sí" en la pregunta
       incómoda, que es la que sostiene todo lo que viene después. */
    {
      tipo: "opciones",
      campo: "miedo_sola",
      titulo: "¿Alguna vez sentiste que tu destino es quedarte sola y nunca encontrar a alguien que realmente te entienda y te ame por quien sos?",
      nota: "*Sé sincera",
      opciones: [
        { emoji: "✅", txt: "Sí", val: "si" },
        { emoji: "❌", txt: "No", val: "no" }
      ]
    },
    {
      tipo: "opciones",
      campo: "decepcion",
      titulo: "¿Alguna vez te sentiste decepcionada con relaciones que al primer momento parecían prometedoras?",
      nota: "*Sé sincera",
      opciones: [
        { emoji: "✅", txt: "Sí", val: "si" },
        { emoji: "❌", txt: "No", val: "no" }
      ]
    },
    {
      tipo: "opciones",
      campo: "cree_astro",
      titulo: "¿Creés que la astrología puede revelar el rostro de tu alma gemela?",
      nota: "*Sé sincera",
      opciones: [
        { emoji: "✅", txt: "Sí", val: "si" },
        { emoji: "❌", txt: "No", val: "no" }
      ]
    },
    {
      tipo: "opciones",
      campo: "quiere_rostro",
      titulo: "¿Te gustaría ver el rostro de tu alma gemela hoy a través de la astrología?",
      nota: "*Sé sincera",
      opciones: [
        { emoji: "✅", txt: "Sí", val: "si" },
        { emoji: "❌", txt: "No", val: "no" }
      ]
    },
    {
      tipo: "opciones",
      campo: "quiere_cuando",
      titulo: "¿Y te gustaría saber exactamente cuándo y dónde vas a encontrar a tu alma gemela?",
      nota: "*Sé sincera",
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
    }

    /* Acá sigue: nombre, ciudad, fecha de nacimiento, carga y resultado.
       Se arma en la próxima tanda. */
  ],

  /* Los 12 signos. La ilustración va en assets/signos/<id>.webp; hasta que
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
