/* Réplica 1:1 del quiz "Soulmate Sketch" de Nebula, traducida al español rioplatense. Editá acá los textos. */
window.NOCTRA = {
  tema: "nebula", estricto: true,

  /* Imágenes (rutas relativas a index-nebula.html). Cambiá el archivo y listo. */
  img: {
    principal: "assets/principal.webp",
    ref1: "assets/ref1.webp",
    ref2: { emociones: "assets/ref2-emociones.webp", logica: "assets/ref2-logica.webp", depende: "assets/ref2-depende.webp" },
    ref3: { correcta: "assets/ref3-correcta.webp", pasado: "assets/ref3-pasado.webp", chispa: "assets/ref3-chispa.webp", dudas: "assets/ref3-dudas.webp", abrirme: "assets/ref3-abrirme.webp", limites: "assets/ref3-limites.webp" },
    lenguaje: { palabras: "assets/leng-palabras.webp", regalos: "assets/leng-regalos.webp", actividades: "assets/leng-actividades.webp", contacto: "assets/leng-contacto.webp", gestos: "assets/leng-gestos.webp" },
    retrato: { m: "assets/retrato-m.webp", f: "assets/retrato-f.webp", mFull: "assets/retrato-m-full.webp", fFull: "assets/retrato-f-full.webp" },
    mas: ["assets/mas-1.webp","assets/mas-2.webp","assets/mas-3.webp","assets/mas-4.webp","assets/mas-5.webp","assets/mas-6.webp"]
  },
  marca: "Noctra", guia: "", seccion: "Sobre vos",
  checkoutUrl: "https://noctralmagemela.myshopify.com/cart/50392314314966:1",
  precioHoy: 9799, precioMes: 9799, moneda: "ARS", diasPrueba: 7, precio: 9799, precioAncla: 9799,
  totalPreguntas: 15, timerMin: 15, garantiaDias: 7, diasApp: 7,
  btn: { continuar: "Continuar" },

  meses: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
  signos: ["Capricornio","Acuario","Piscis","Aries","Tauro","Géminis","Cáncer","Leo","Virgo","Libra","Escorpio","Sagitario"],
  elemento: {Aries:"fuego",Leo:"fuego",Sagitario:"fuego",Tauro:"tierra",Virgo:"tierra",Capricornio:"tierra",Géminis:"aire",Libra:"aire",Acuario:"aire",Cáncer:"agua",Escorpio:"agua",Piscis:"agua"},
  miradaRasgo: {serena:"Mirada serena",intensa:"Mirada intensa",calida:"Mirada cálida",curiosa:"Mirada curiosa"},

  /* Prelanding */
  landing: {
    badge1: ["LA GENTE DICE", "Sorprendentemente certero"],
    badge2: ["ELEGIDO POR 133 MIL", "4,1 de satisfacción"],
    rotativas: ["Descubrí con quién estás destinada/o", "Revelá a tu pareja ideal", "Recibí el dibujo de tu match", "Descubrí quién es para vos", "Conocé tu destino"],
    titulo: "con tu Retrato del Alma Gemela",
    sub: "Hacé este test para personalizar tu Retrato del Alma Gemela",
    chips: ["Test de 1 min", "Insights", "Guía personalizada"],
    cta: "Hacer el test",
    legal: "<b>Solo con fines de entretenimiento</b>"
  },

  social: { titulo: "Sumate a las miles de personas que ya recibieron su guía con Noctra", cta: "Continuar" },

  /* 15 preguntas, mismo orden, mismas opciones y mismos emojis que Nebula */
  preguntas: {
    genero:      { titulo: "Yo soy…", opts: [["f","Mujer","👩"],["m","Hombre","🧑"]] },
    interes:     { titulo: "¿De qué género es tu pareja ideal?", opts: [["f","Mujer","👩"],["m","Hombre","🧑"],["x","No importa","🔄"]] },
    edad:        { titulo: "¿Qué edad creés que debería tener tu alma gemela?", opts: [["20","20-30","🧑"],["30","30-40","👨‍🦱"],["40","40-50","👨‍🦰"],["50","50+","👨‍🦳"]] },
    etnia:       { titulo: "¿Qué origen étnico debería tener tu pareja ideal?", opts: [["afro","Africano / afrodescendiente","👨🏾‍🦱"],["europeo","Caucásico / blanco","👨"],["latino","Hispano / latino","👨🏼‍🦰"],["asiatico","Asiático","🧑🏻"],["libre","No importa","🔄"]] },
    fecha:       { titulo: "¿Cuál es tu fecha de nacimiento?", sub: "" },
    cualidades:  { titulo: "¿Qué cualidades buscás en tu pareja ideal?", sub: "Elegí todas las que correspondan", opts: [["Amable","🤗"],["Comprensivo/a","👐"],["Honesto/a","🤝"],["Optimista","🙂"],["Leal","🫂"],["Cariñoso/a","😘"],["Seguro/a","🤩"],["Apasionado/a","🔥"],["Divertido/a","😁"],["Protector/a","💪"]] },
    apariencia:  { titulo: "¿Qué tan importante es el físico en una pareja para vos?", opts: [["mucho","El físico importa mucho","😍"],["algo","Está bueno, pero no es esencial","🙂"],["personalidad","La personalidad importa más","🧠"]] },
    decision:    { titulo: "¿Te manejás más por las emociones o por la lógica?", opts: [["emociones","Emociones","❤️"],["logica","Lógica","🔍"],["depende","Depende","🤔"]] },
    motivo:      { titulo: "¿Cuál es la razón principal por la que no funcionaron tus relaciones anteriores?", opts: [["confianza","Falta de confianza","😢"],["comunicacion","Mala comunicación","🗣️"],["distancia","Nos fuimos alejando","🌵"],["objetivos","Objetivos de vida distintos","🎯"],["infidelidad","Infidelidad","💔"],["egoismo","Egoísmo","😔"],["otro","Otro","❓"]] },
    dificultad:  { titulo: "¿Qué es lo que más te cuesta?", opts: [["correcta","Conocer a la persona correcta","✨"],["pasado","Superar relaciones pasadas","💔"],["chispa","Mantener viva la chispa","🔥"],["dudas","Manejar las dudas","⚖️"],["abrirme","Abrirme con la gente","🤝"],["limites","Poner límites sanos","💭"]] },
    lenguaje:    { titulo: "¿Cuál es tu lenguaje del amor?", opts: [["palabras","Palabras de afirmación","linear-gradient(135deg,#E9D5E8,#C8B6D9)"],["regalos","Regalos","linear-gradient(135deg,#D9D3E6,#B9B3CC)"],["actividades","Actividades compartidas","linear-gradient(135deg,#E4DED2,#C7BFB0)"],["contacto","Contacto físico","linear-gradient(135deg,#EDE9E3,#D4CEC4)"],["gestos","Gestos de ayuda","linear-gradient(135deg,#E8DCC6,#CDB894)"]] },
    futuro:      { titulo: "¿Qué futuro imaginás con tu pareja ideal?", sub: "Elegí todas las que correspondan", opts: [["Comprar una casa","🏡"],["Vivir aventuras","🌍"],["Formar una familia","💍"],["Crear lindos recuerdos","📸"],["Tener un negocio","📈"],["Atravesar desafíos juntos","💪"],["Otro","❓"]] },
    energia:     { titulo: "¿Qué energía trae tu pareja ideal a tu vida?", opts: [["carinosa","Afectuosa y amorosa","💖"],["calma","Calma y con los pies en la tierra","🌿"],["juguetona","Juguetona y liviana","🎈"],["aventurera","Divertida y aventurera","🌍"],["equilibrada","Equilibrada y contenedora","🪢"],["apasionada","Apasionada e inspiradora","🔥"],["otra","Otra","❓"]] },
    opuestos:    { titulo: "Creo que los opuestos se atraen", sub: "¿Qué tan de acuerdo estás con la frase?", min: "Nada de acuerdo", max: "Totalmente de acuerdo" },
    experiencias:{ titulo: "¿Qué experiencias compartidas valorás más?", opts: [["viajar","Viajar","✈️"],["tranquilos","Momentos tranquilos juntos","☕"],["logros","Festejar logros","🏆"],["crear","Crear cosas juntos","🎨"],["familia","Pasar tiempo en familia","👨‍👩‍👧‍👦"]] }
  },

  refuerzos: {
    ref1: { titulo: "¡Anotado!", literal: "Saber las cualidades clave de tu futura pareja nos ayuda a entender mejor tu situación", texto: "" },
    ref2: { titulo: "Escuchar a tu corazón abre nuevas posibilidades", literal: "Muchas personas encuentran a su pareja ideal antes cuando confían en sus emociones", por: "decision", textos: {} },
    ref3: { titulo: "Tu lucha es real", literal: "Te ayudamos a descubrir el camino para conocer a alguien de verdad compatible con vos", texto: "" }
  },

  emailScr: {
    titulo: "¿Estás lista/o para ver cómo es tu alma gemela?",
    sub: "Dejanos tu email para recibir tu lectura personalizada. También podemos mandarte novedades, promociones y consejos sobre nuestros servicios.",
    nombrePh: "Tu nombre", emailPh: "Tu email", cta: "Continuar",
    chips: [], error: "Email inválido",
    legal: "Al continuar aceptás los <a href='#'>Términos de uso</a> y la <a href='#'>Política de privacidad</a>. Mirá el <a href='#'>aviso completo</a> sobre el servicio."
  },

  transicion: ["Bienvenida/o a", "{logo}", "Según tus respuestas y tus objetivos", "Creamos tu Retrato del Alma Gemela", "Para ayudarte a conocer a la persona correcta", "Descubrí hoy cómo es tu alma gemela"],

  venta: {
    cta: "Quiero mi retrato",
    h1: "Revelá el dibujo de tu alma gemela con Noctra",
    beneficios: [["Mirá a tu alma gemela","con un dibujo hecho a partir de tus respuestas"],["Encontrá insights más profundos","en un chat privado uno a uno con nuestros psíquicos"]],
    accesoTitulo: "Acceso inmediato a tu Retrato del Alma Gemela + Lectura personalizada",
    plan: "Retrato del Alma Gemela y Lectura personalizada",
    filas: [["Pago único, acceso inmediato:","precioHoy"]],
    notaMoneda: "Precio final en pesos argentinos (ARS). Servicio disponible únicamente en Argentina.",
    legalCorto: "Al hacer clic en \"QUIERO MI RETRATO\" hacés un <b>único pago de {precioHoy}</b>. No es una suscripción: no hay renovación automática ni cobros posteriores. El precio está expresado en pesos argentinos y el servicio se ofrece únicamente en Argentina. Ante cualquier duda podés escribir a <a href='#'>soporte@noctra.app</a>.",
    sketchTitulo: "Así es tu verdadera alma gemela",
    rasgosLbl: ["La vibra de tu alma gemela","Rasgo especial"],
    previewLbl: "Vista previa de tu alma gemela", previewTxt: "Este dibujo se basa en tus respuestas y te da un primer vistazo de tu alma gemela.",
    revelaTitulo: "Lo que revela este dibujo", revelaTexto: "Detrás de estos rasgos hay una historia de amor, de pertenencia y de la conexión profunda que venías esperando. El dibujo trae pistas sobre el vínculo que podría cambiarte la vida.",
    masTitulo: "Más que una cara", masSub: "Tu Retrato del Alma Gemela viene con insights sobre sus rasgos, su forma de amar y cómo pueden crecer juntos.",
    masItems: [["Detalles físicos:","mirá los rasgos que más van a destacar en esa persona."],["Rasgos de personalidad:","entendé los temas que podrían aparecer y cómo manejarlos."],["Forma de amar:","aprendé cómo demuestra afecto, cómo se compromete y cómo actúa en pareja."],["Señales del encuentro:","descubrí cuándo, dónde y en qué circunstancias se pueden cruzar."],["Desafíos de la relación:","surgen de ver las fortalezas y los límites de la unión."]],
    masCierre: "Descubrí cómo puede profundizarse el vínculo y convertirse en un amor duradero.",
    testiTitulo: "Algunas historias de usuarios de Noctra",
    yaPague: "Ya completé el pago · Abrir mi retrato",
    footer: "Noctra S.A., Buenos Aires, Argentina"
  },

  gracias: { titulo: "Acá está{nombre}.", sub: "Tu retrato y tu lectura ya están en tu mail.", pregunta: "¿Te resulta familiar?", cta: "Abrir la app",
    respuestas: { si: "Guardalo: la lectura te dice cómo reconocer a esa persona.", algo: "Es normal: el reconocimiento suele llegar en los días siguientes.", no: "Gracias por decirlo. Escribinos a soporte@noctra.app y lo vemos." },
    appPendiente: "La app se conecta acá (pendiente de integrar)." },
  exit: { titulo: "Antes de irte{nombre}:", texto: "te guardamos el retrato 24 horas.", cta: "Guardar mi retrato" },

  testimonios: [
    { q: "Fue una sorpresa muy linda y emocionante saber más sobre mi situación de vida actual. ¡Una experiencia increíble!", mark: "sorpresa muy linda y emocionante", who: "Anastasia", since: "con Noctra desde 2023", when: "05/02/2023" },
    { q: "La app me ayudó a orientar mi vida y a encontrar soluciones a problemas de todos los días. Se volvió parte de mi rutina.", mark: "parte de mi rutina", who: "Daniel F.", since: "con Noctra desde 2024", when: "03/07/2024" },
    { q: "La lectura fue increíblemente precisa y profunda. Me dio una confirmación clara y me ayudó a entender mucho mejor una situación personal complicada.", mark: "increíblemente precisa y profunda", who: "Marcos A.", since: "con Noctra desde 2025", when: "10/11/2025" }
  ],
  faq: []
};
