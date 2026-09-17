/* Noctra v2 — el quiz, declarado.

   Todo lo que se decide "de negocio" vive acá: qué se pregunta, en qué orden,
   con qué palabras. El motor (js/app.js) no sabe nada del contenido: recorre
   esta lista y dibuja. Cambiar el embudo es editar este archivo.

   Está separado así por una razón concreta: el quiz que está andando hoy
   tiene la misma división, y esa división es lo que permitió cambiarle el
   copy decenas de veces sin tocar nunca el motor ni romper el checkout.

   PANTALLAS DISPONIBLES (campo "tipo"):

     portada   titulo, sub, boton, [imagen]
     opciones  titulo, [sub], opciones:[{txt, val, [emoji]}], [multi:true]
     texto     titulo, [sub], placeholder, campo  (guarda en S.a[campo])
     carga     titulo, [sub], segundos           (barra de progreso)

   Agregar un tipo nuevo es agregar un case en app.js. */
window.NOCTRA_V2 = {

  /* La clave del localStorage. DISTINTA a la del quiz viejo ("noctra_v2"):
     si fueran la misma, alguien que pase por los dos embudos arrastra
     respuestas cruzadas y termina viendo un resultado que no es suyo. */
  key: "noctra_q2",

  /* El checkout. Es el mismo producto y la misma variante que la portada:
     lo que estamos probando es el embudo, no la oferta. Si cambiás las dos
     cosas a la vez no vas a saber cuál movió la aguja. */
  checkoutUrl: "https://noctralmagemela.myshopify.com/cart/50392314314966:1",

  pasos: [
    {
      tipo: "portada",
      titulo: "Acá va el gancho del quiz nuevo",
      sub: "Este es el esqueleto. El contenido real lo armamos juntos.",
      boton: "Empezar"
    },
    {
      tipo: "opciones",
      titulo: "Primera pregunta de ejemplo",
      sub: "Para ver que el motor navega y guarda.",
      campo: "ejemplo",
      opciones: [
        { txt: "Opción A", val: "a" },
        { txt: "Opción B", val: "b" }
      ]
    },
    {
      tipo: "carga",
      titulo: "Analizando tus respuestas",
      segundos: 3
    },
    {
      tipo: "portada",
      titulo: "Final de ejemplo",
      sub: "Acá iría el resultado y la oferta.",
      boton: "Ver mi resultado"
    }
  ]
};
