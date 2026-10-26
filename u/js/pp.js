/* pp.js — adapta nuestras pantallas al post-compra de Impultienda.

   En Impultienda cada oferta es una página sola: el encadenado lo maneja la
   plataforma. Por eso acá NO hay router. Se dibuja un paso y listo.

   La plataforma nos da:
     data-pp-accept   cobra la tarjeta guardada y sigue a la oferta siguiente
     data-pp-decline  el "No, gracias"
   y reemplaza {price}, {compare}, {first-name}, etc. antes de que esto corra.

   En la oferta de Impultienda se pega solo un cargador de seis líneas; el
   contenido vive acá, así que para cambiar el copy se hace un push y no hay
   que volver a pegar nada en las siete ofertas. */
(function(){
  "use strict";

  var CFG  = window.PP || {};
  var S    = window.NOCTRA_PASOS;
  var host = document.getElementById("u");
  if (!S || !host) return;

  function paso(id){
    for (var i = 0; i < S.PASOS.length; i++) if (S.PASOS[i].id === id) return S.PASOS[i];
    return null;
  }

  /* Si el precio viene de la plataforma mandamos ese, no el del archivo:
     el que cobra es Impultienda y los dos tienen que decir lo mismo. */
  function limpio(v){
    v = (v == null ? "" : String(v)).trim();
    return (v && v.indexOf("{") < 0) ? v : "";
  }

  function nombre(){
    var n = limpio(CFG.name);
    /* "Laura" sí; "laura@mail.com" o algo larguísimo, no. */
    return (n && n.indexOf("@") < 0 && n.length < 24) ? n : "";
  }

  function parte(p){
    if (p.t === "p1")   return '<p class="par primero">' + p.x + '</p>';
    if (p.t === "p")    return '<p class="par">' + p.x + '</p>';
    if (p.t === "h")    return '<h2>' + p.x + '</h2>';
    if (p.t === "cita") return '<p class="cita">' + p.x + '</p>';
    if (p.t === "marco")return '<p class="marco">' + p.x + '</p>';
    if (p.t === "nota") return '<p class="nota">' + p.x + '</p>';
    if (p.t === "sep")  return '<hr class="sep">';
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
    return "";
  }

  function barajar(){
    var b = document.getElementById("fl");
    if (!b) return;
    var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches){
      b.textContent = "\u2726"; b.className = "quieta"; return;
    }
    var i = 0, espera = 34;
    (function vuelta(){
      b.textContent = A[Math.floor(Math.random() * A.length)];
      i++;
      if (i > 46){ b.textContent = "\u2726"; b.className = "quieta"; return; }
      if (i > 30) espera += 34;
      setTimeout(vuelta, espera);
    })();
  }

  function pintar(p){
    var precio = limpio(CFG.price)   || p.precio;
    var antes  = limpio(CFG.compare) || p.antes;
    var pausa  = 1.15;

    var partes = p.partes.map(parte).join('');
    var n = nombre();
    if (n) partes = partes.replace('<p class="par primero">',
                                   '<p class="par primero"><span class="hola">' + n + ', </span>');

    host.innerHTML =
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
        partes +
        '<div class="precio">' + (antes ? '<s>' + antes + '</s>' : '') + '<b>' + precio + '</b></div>' +
        '<button class="cta" id="ppSi">' + p.cta + '</button>' +
        '<p class="fino">' + p.ctaSub + '</p>' +
        '<button class="no" id="ppNo">' + p.rechazo + '</button>' +
        (p.pd ? '<p class="pd">' + p.pd + '</p>' : '') +
        '<p class="legal">Al tocar el botón aceptás nuestros Términos y Condiciones, ' +
          'incluido el cobro del monto indicado en esta pantalla para esta oferta adicional. ' +
          'Precio final en pesos argentinos (ARS). Noctra es contenido interpretativo, ' +
          'con fines de entretenimiento.</p>' +
      '</article>';

    puente("ppSi", "[data-pp-accept]");
    puente("ppNo", "[data-pp-decline]");

    setTimeout(function(){
      var c = document.getElementById("cuerpo");
      if (c) c.classList.add("ver");
      setTimeout(barajar, 450);
    }, (p.revelado.length * pausa + 1.1) * 1000);
  }

  /* Los botones reales son los que van pegados en el HTML de la oferta:
     Impultienda los engancha al cargar y no vuelve a mirar. Los nuestros,
     que se dibujan despues, solo los disparan. */
  function puente(id, sel){
    var mio  = document.getElementById(id);
    var real = document.querySelector(sel);
    if (!mio) return;
    mio.addEventListener("click", function(){
      if (real) real.click();
      else console.warn("[noctra] falta el boton", sel);
    });
  }

  /* La ruleta va arriba del paso con descuento: no gasta una oferta aparte. */
  function arranque(){
    var p = paso(CFG.paso);
    if (!p) return;
    if (CFG.ruleta && window.NOCTRA_RULETA){
      window.NOCTRA_RULETA(host, CFG.ruleta, function(){ pintar(p); });
    } else {
      pintar(p);
    }
  }

  if (document.readyState === "loading") addEventListener("DOMContentLoaded", arranque);
  else arranque();
})();


/* El anfitrion (Impultienda) pinta su propio fondo claro por encima del nuestro.
   Metemos el cielo adentro de #u y oscurecemos la cadena de contenedores. */
(function(){
  function fondo(){
    var u=document.getElementById('u'); if(!u) return;
    var c=document.getElementById('cielo'), n=document.querySelector('.neb');
    if(n && n.parentNode!==u) u.insertBefore(n,u.firstChild);
    if(c && c.parentNode!==u) u.insertBefore(c,u.firstChild);
    var p=u.parentNode;
    while(p && p.nodeType===1){
      p.style.setProperty('background','#04060D','important');
      p.style.setProperty('background-image','none','important');
      p=p.parentNode;
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fondo); else fondo();
  setTimeout(fondo,300); setTimeout(fondo,1500);
})();
