/* Motor de la secuencia TSL. No sabe nada de pagos: arma la pantalla,
   manda al link de cobro que le pasen y, si la persona dice que no, avanza. */
(function(){
  "use strict";

  var S = window.NOCTRA_PASOS;
  var app = document.getElementById("u");

  function q(n){
    var m = new RegExp("[?&]" + n + "=([^&]*)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : "";
  }

  var pedido = q("id");
  var LLAVE  = "noctra_u_" + (pedido || "x");

  function visto(){
    try { return JSON.parse(localStorage.getItem(LLAVE) || "[]"); } catch(e){ return []; }
  }
  function marcar(id){
    try {
      var v = visto();
      if (v.indexOf(id) < 0){ v.push(id); localStorage.setItem(LLAVE, JSON.stringify(v)); }
    } catch(e){}
  }

  function buscar(id){
    for (var i = 0; i < S.PASOS.length; i++) if (S.PASOS[i].id === id) return S.PASOS[i];
    return null;
  }

  /* El primer paso que todavia no vio: si recarga, no vuelve a empezar. */
  function primero(){
    var v = visto();
    for (var i = 0; i < S.PASOS.length; i++) if (v.indexOf(S.PASOS[i].id) < 0) return S.PASOS[i];
    return null;
  }

  function salir(){ location.href = S.DESTINO; }

  /* El copy lo escribimos nosotros y lleva <b> y <br> a proposito. */
  function parte(p){
    if (p.t === "p1")   return '<p class="par primero">' + p.x + '</p>';
    if (p.t === "p")    return '<p class="par">' + p.x + '</p>';
    if (p.t === "h")    return '<h2>' + p.x + '</h2>';
    if (p.t === "cita") return '<p class="cita">' + p.x + '</p>';
    if (p.t === "marco") return '<p class="marco">' + p.x + '</p>';
    if (p.t === "sep")  return '<hr class="sep">';
    if (p.t === "nota") return '<p class="nota">' + p.x + '</p>';
    if (p.t === "ficha"){
      var h = '<div class="ficha">';
      if (p.cab) h += '<div class="fcab"><span class="fluna"></span><div>' +
                      '<p class="fcampo">' + p.cab[0] + '</p>' +
                      '<p class="ftit">' + p.cab[1] + '</p></div></div>';
      if (p.linea) h += '<div class="flin">' + p.linea.map(function(x){
        return '<div class="fhito ' + (x[2]||'') + '"><i></i><b>' + x[0] + '</b><span>' + x[1] + '</span></div>';
      }).join('') + '</div>';
      if (p.letra) h += '<div class="ffila"><p class="fcampo">' + p.letra + '</p>' +
                        '<div class="fletra"><b id="fl">A</b></div></div>';
      h += (p.campos||[]).map(function(c){
        var cuerpo = (c[1] === "texto")
          ? '<p class="ftexto">' + c[2] + '</p>'
          : c[2].map(function(w){ return '<span class="borr" style="width:' + w + '%"></span>'; }).join('');
        return '<div class="ffila"><p class="fcampo">' + c[0] + '</p>' + cuerpo + '</div>';
      }).join('');
      h += '<p class="fpie">&#128274;&nbsp; ' + p.pie + '</p></div>';
      return h;
    }
    if (p.t === "lista"){
      return '<div class="card">' +
        p.items.map(function(b){
          return '<div class="bl"><p class="lab">' + b[0] + '</p><p>' + b[1] + '</p></div>';
        }).join('') +
        (p.cierre ? '<p class="cierre">' + p.cierre + '</p>' : '') +
      '</div>';
    }
    return "";
  }

  /* El abecedario pasa cada vez mas lento y frena en la chispa.
     Nunca se detiene en una letra: la letra es lo que falta pagar. */
  function barajar(){
    var b = document.getElementById("fl");
    if (!b) return;
    var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches){
      b.textContent = "\u2726"; b.className = "quieta"; return;
    }
    var i = 0, espera = 34;
    (function paso(){
      b.textContent = A[Math.floor(Math.random() * A.length)];
      i++;
      if (i > 46){
        b.textContent = "\u2726";
        b.className = "quieta";
        return;
      }
      if (i > 30) espera += 34;
      setTimeout(paso, espera);
    })();
  }

  function pintar(p){
    if (!p) return salir();

    /* La ruleta no es una carta: es su propia pantalla. */
    if (p.tipo === "ruleta"){
      marcar(p.id);
      scrollTo({ top:0, behavior:"instant" });
      window.NOCTRA_RULETA(app, p, function(){
        pintar(p.va ? buscar(p.va) : null);
      });
      return;
    }

    var pausa = 1.15;  // segundos entre linea y linea: seco, sin esperas

    app.innerHTML =
      '<section class="rev">' +
        (p.sello && window.NOCTRA_SELLO ? window.NOCTRA_SELLO(p.sello) : '') +
        p.revelado.map(function(l,i){
          return '<p class="rl" style="animation-delay:' + (i * pausa + .4) + 's">' + l + '</p>';
        }).join('') +
        '<span class="baja" style="animation-delay:' + (p.revelado.length * pausa + .6) + 's">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="#F5D67B" stroke-width="1.6" ' +
          'stroke-linecap="round"><path d="M12 5v13M6 13l6 6 6-6"/></svg>' +
        '</span>' +
      '</section>' +
      '<article class="cuerpo" id="cuerpo">' +
        '<p class="kick">' + p.kicker + '</p>' +
        '<h1>' + p.titulo + '</h1>' +
        '<p class="sub">' + p.sub + '</p>' +
        p.partes.map(parte).join('') +
        '<div class="precio"><s>' + p.antes + '</s><b>' + p.precio + '</b></div>' +
        '<button class="cta" id="si">' + p.cta + '</button>' +
        '<p class="fino">' + p.ctaSub + '</p>' +
        '<button class="no" id="no">' + p.rechazo + '</button>' +
        (p.pd ? '<p class="pd">' + p.pd + '</p>' : '') +
        '<p class="legal">Al tocar el botón aceptas nuestros Términos y Condiciones, ' +
          'incluido el cobro del monto indicado en esta pantalla para esta oferta adicional. ' +
          'Precio en dólares estadounidenses (USD). Noctra es contenido interpretativo, ' +
          'con fines de entretenimiento.</p>' +
      '</article>';

    /* El cuerpo entra recien cuando termino de hablar la revelacion. */
    setTimeout(function(){
      var c = document.getElementById("cuerpo");
      if (c) c.classList.add("ver");
      /* El abecedario arranca cuando la tarjeta ya se ve, no antes. */
      setTimeout(barajar, 450);
    }, (p.revelado.length * pausa + 1.1) * 1000);

    document.getElementById("si").onclick = function(){
      var link = S.CHECKOUT[p.id];
      marcar(p.id);
      if (!link){ alert("Falta configurar el link de cobro de este paso."); return; }
      location.href = link + (link.indexOf("?") < 0 ? "?" : "&") +
                      "ref=" + encodeURIComponent(pedido || "");
    };

    document.getElementById("no").onclick = function(){
      marcar(p.id);
      scrollTo({ top:0, behavior:"instant" });
      pintar(p.va ? buscar(p.va) : null);
    };
  }

  /* ?paso=u1 abre una pantalla suelta para revisarla sin recorrer todo. */
  var forzado = q("paso");
  pintar(forzado ? buscar(forzado) : primero());
})();
