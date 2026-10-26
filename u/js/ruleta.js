/* Ruleta de descuento. Gira y cae en el premio que le digan: no es azar.
   Las casillas que nunca salen ("Sin premio", "Otra vez") están para que la
   rueda parezca una rueda. El descuento que entrega sí es real.
   opts: { premio, tono:"oro"|"violeta", casillas:[6], titulo, sub } */
(function(){
  "use strict";

  var GANA = 1;                 // la casilla de arriba a la derecha, siempre
  var N = 6, PASO = 60;

  function sector(i, r){
    var a0 = (i * PASO - 90 - PASO / 2) * Math.PI / 180;
    var a1 = ((i + 1) * PASO - 90 - PASO / 2) * Math.PI / 180;
    return "M100 100 L" + (100 + r * Math.cos(a0)).toFixed(2) + " " +
           (100 + r * Math.sin(a0)).toFixed(2) +
           " A" + r + " " + r + " 0 0 1 " +
           (100 + r * Math.cos(a1)).toFixed(2) + " " +
           (100 + r * Math.sin(a1)).toFixed(2) + " Z";
  }

  function svg(cas, tono){
    var g = "rgana " + (tono === "violeta" ? "vio" : "oro");
    var s = '<svg viewBox="0 0 200 200" class="rsvg"><g id="rgiro">';
    for (var i = 0; i < N; i++)
      s += '<path d="' + sector(i, 92) + '" class="rsec' + (i === GANA ? " " + g : "") + '"/>';
    /* Cada etiqueta va en su propio grupo rotado, y adentro se gira 90 grados
       sobre su propio punto para que se lea a lo largo del radio. */
    for (i = 0; i < N; i++)
      s += '<g transform="rotate(' + (i * PASO) + ' 100 100)">' +
             '<text class="rtxt' + (i === GANA ? " rtg" : "") + '" x="100" y="46" ' +
             'transform="rotate(90 100 46)">' + cas[i] + '</text>' +
           '</g>';
    s += '</g><circle cx="100" cy="100" r="92" class="raro ' + (tono === "violeta" ? "vio" : "") + '"/>' +
         '<circle cx="100" cy="100" r="17" class="rhub ' + (tono === "violeta" ? "vio" : "") + '"/>' +
         '<text x="100" y="105" class="rchispa">&#10022;</text></svg>';
    return s;
  }

  window.NOCTRA_RULETA = function(host, o, alSalir){
    var tono = o.tono || "oro";
    var cas  = o.casillas || ["10% OFF", o.premio, "5% OFF", "Sin premio", "20% OFF", "Otra vez"];

    host.innerHTML =
      '<div class="rwrap' + (tono === "violeta" ? " vio" : "") + '">' +
        '<p class="kick">' + (o.kicker || "ESPERA — MAIA NO QUIERE QUE TE LO PIERDAS") + '</p>' +
        '<h1 id="rtit">' + (o.titulo || "Gira la ruleta") + '</h1>' +
        '<p class="sub" id="rsub">' + (o.sub || "Te deja un descuento. Una sola vez.") + '</p>' +
        '<div class="rueda"><span class="raguja"></span>' + svg(cas, tono) + '</div>' +
        '<button class="cta" id="rbtn">Girar la ruleta</button>' +
      '</div>';

    var giro = document.getElementById("rgiro");
    var btn  = document.getElementById("rbtn");
    var listo = false;

    btn.onclick = function(){
      if (listo) return alSalir();
      btn.disabled = true;
      btn.textContent = "Girando…";

      giro.style.transition = "transform 4.2s cubic-bezier(.17,.67,.17,1)";
      giro.style.transform  = "rotate(" + (360 * 5 - GANA * PASO) + "deg)";

      setTimeout(function(){
        document.querySelector(".rueda").classList.add("rbrilla");
        document.getElementById("rtit").innerHTML =
          "¡Ganaste <span class='o'>" + o.premio + "</span>!";
        document.getElementById("rsub").textContent =
          "Tu descuento ya quedó aplicado. Se pierde si sales de esta pantalla.";
        btn.disabled = false;
        btn.textContent = "Usar mi descuento";
        listo = true;
      }, 4400);
    };
  };
})();
