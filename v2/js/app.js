/* Noctra v2 — el motor del quiz.

   No sabe qué pregunta el quiz. Recorre NOCTRA_V2.pasos, dibuja la pantalla
   que corresponde al "tipo", guarda lo que la persona elige y avanza.

   Cuatro cosas que parecen detalles y no lo son:

   1. VELOCIDAD. El toque tiene que sentirse instantáneo. La pantalla nueva
      se dibuja en el mismo frame del toque y la animación de salida no
      bloquea: si la persona toca rápido, el quiz va rápido. Un quiz que se
      siente lento se abandona en la pregunta 3, cuando todavía no invirtió
      nada.

   2. El estado se guarda en cada paso. Alguien que abre el quiz en el
      colectivo, pierde señal y vuelve media hora después no empieza de cero.
      En un embudo pago, cada persona que reempieza es plata tirada.

   3. La navegación es por hash (#/3). Así el botón "atrás" del teléfono
      vuelve una pregunta en vez de salirse del sitio — que es el error que
      más gente pierde en los quizzes hechos a mano.

   4. Cada pantalla empuja un evento a dataLayer. js/pixel.js los traduce a
      eventos de Meta, y eso es lo que después deja abrir el embudo por
      campaña y ver en qué pregunta exacta se cae la gente. Sin esto el quiz
      es una caja negra: sabés que no convierte pero no dónde. */
(function(){
  var Q = window.NOCTRA_V2;
  if(!Q){ console.error("[v2] falta content.js"); return; }

  var KEY  = Q.key || "noctra_q2";
  var app  = document.getElementById("app");
  var dl   = window.dataLayer = window.dataLayer || [];
  var TOTAL = Q.pasos.length;

  var S = cargar() || { paso:0, a:{} };

  function cargar(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
  function guardar(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function evento(o){ try{ dl.push(o); }catch(e){} }

  /* ---- navegación ---- */

  var navegando = false;

  function ir(i){
    var n = Math.max(0, Math.min(i, TOTAL-1));
    if(n===S.paso && document.querySelector(".pant")) return;
    S.paso = n; guardar();
    /* replaceState no sirve: queremos que el "atrás" del teléfono retroceda
       una pregunta, así que cada paso tiene que dejar su entrada. */
    location.hash = "#/" + S.paso;
  }
  function siguiente(){ ir(S.paso + 1); }
  function atras(){ history.back(); }

  function desdeHash(){
    var m = /^#\/(\d+)$/.exec(location.hash);
    return m ? parseInt(m[1],10) : null;
  }

  /* ---- pantallas ---- */

  function barra(){
    if(S.paso===0) return "";
    var pct = Math.round((S.paso/(TOTAL-1))*100);
    return '<header class="top">'
      + '<button class="volver" data-atras aria-label="Volver">'
        + '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" '
        + 'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>'
      + '</button>'
      + '<div class="prog"><i style="width:'+pct+'%"></i></div>'
      + '</header>';
  }

  function botones(p){
    return (p.opciones||[]).map(function(o){
      var sel = S.a[p.campo]===o.val;
      return '<button class="op'+(sel?" sel":"")+'" data-val="'+esc(o.val)+'">'
        + (o.emoji ? '<span class="em">'+esc(o.emoji)+'</span>' : '')
        + '<span class="tx">'+esc(o.txt)+'</span></button>';
    }).join("");
  }

  function opciones(p){
    /* Con textos largos el botón necesita respirar; con "Sí/No" queda
       ridículo de alto. El motor lo decide solo por el largo del texto. */
    var largo = (p.opciones||[]).some(function(o){ return o.txt.length>18; });
    return '<section class="pant tarjeta">'
      + '<h2>'+esc(p.titulo)+'</h2>'
      + (p.nota ? '<p class="nota">'+esc(p.nota)+'</p>' : '')
      + '<div class="ops'+(largo?" largo":"")+'" data-campo="'+esc(p.campo)+'">'
      + botones(p) + '</div>'
      + '</section>';
  }

  function signos(p){
    var grilla = (Q.signos||[]).map(function(s){
      var sel = S.a[p.campo]===s.id;
      return '<button class="sg'+(sel?" sel":"")+'" data-val="'+esc(s.id)+'">'
        + '<span class="sgart">'
          + '<img src="assets/signos/'+esc(s.id)+'.webp" alt="" loading="lazy" decoding="async" '
          + 'onerror="this.remove()">'
          + '<i class="glifo">'+s.glifo+'</i>'
        + '</span>'
        + '<span class="sgn">'+esc(s.nombre)+'</span></button>';
    }).join("");
    return '<section class="pant portada">'
      + '<h1>'+esc(p.titulo)+'</h1>'
      + '<p class="badge">'+esc(p.badge)+'</p>'
      + '<p class="paso">'+esc(p.paso)+'</p>'
      + '<div class="grilla" data-campo="'+esc(p.campo)+'">'+grilla+'</div>'
      + '</section>';
  }

  function prueba(p){
    var ims = p.imagenes || [];
    var slides = ims.map(function(id){
      return '<div class="slide">'
        + '<img src="assets/prueba/'+esc(id)+'.webp" alt="" loading="lazy" '
        + 'decoding="async" onerror="this.closest(\'.slide\').classList.add(\'falta\')">'
        + '<span class="ph">'+esc(id)+'</span></div>';
    }).join("");
    var puntos = ims.map(function(_,i){
      return '<i'+(i===0?' class="on"':'')+'></i>';
    }).join("");
    return '<section class="pant tarjeta prueba">'
      + '<h2>'+esc(p.titulo)+'</h2>'
      + '<p class="badge chico">'+esc(p.badge)+'</p>'
      + '<div class="carru" data-carru>'+slides+'</div>'
      + '<div class="puntos" data-puntos>'+puntos+'</div>'
      + '<button class="cta" data-seguir>'+esc(p.boton||"Continuar")+'</button>'
      + '</section>';
  }

  /* El carrusel usa scroll con scroll-snap, no una animación propia: así el
     deslizar con el dedo es el del sistema —con su inercia y su rebote— y no
     una imitación que se siente pegajosa. El botón mueve el mismo scroll. */
  function montarCarrusel(){
    var c = app.querySelector("[data-carru]");
    if(!c) return;
    var puntos = app.querySelectorAll("[data-puntos] i");
    var slides = c.querySelectorAll(".slide");

    function actual(){ return Math.round(c.scrollLeft / c.clientWidth); }
    function marcar(){
      var i = actual();
      for(var k=0;k<puntos.length;k++) puntos[k].className = (k===i ? "on" : "");
    }
    c.addEventListener("scroll", function(){
      /* Un frame de espera: el scroll dispara decenas de veces por segundo y
         no hace falta repintar los puntos en todos. */
      if(c.__t) return;
      c.__t = requestAnimationFrame(function(){ c.__t=0; marcar(); });
    }, {passive:true});

    app.querySelector("[data-seguir]").addEventListener("click", function(){
      var i = actual();
      if(i < slides.length-1){
        c.scrollTo({ left:(i+1)*c.clientWidth, behavior:"smooth" });
        /* La primera imagen que todavía no se vio se pide ahora, no cuando
           ya esté en pantalla: así no aparece el hueco blanco al deslizar. */
        var prox = slides[i+2] && slides[i+2].querySelector("img");
        if(prox) prox.loading = "eager";
      }else{
        siguiente();
      }
    });
  }

  var DIBUJA = { opciones:opciones, signos:signos, prueba:prueba };

  /* ---- pintado ---- */

  function pintar(){
    var h = desdeHash();
    if(h!==null && h!==S.paso){ S.paso = Math.max(0,Math.min(h, TOTAL-1)); guardar(); }

    var p = Q.pasos[S.paso];
    if(!p) return;
    var dibujar = DIBUJA[p.tipo];
    if(!dibujar){ console.error("[v2] tipo desconocido:", p.tipo); return; }

    app.innerHTML = barra() + dibujar(p);
    /* Arriba de todo sin animar el scroll: un scroll suave acá se superpone
       con la entrada de la pantalla y se ve como un tirón. */
    window.scrollTo(0,0);
    navegando = false;
    if(p.tipo==="prueba") montarCarrusel();

    evento({ event:"noctra_step_"+S.paso, step:S.paso });
    if(S.paso===0) evento({ event:"noctra_start" });
    if(S.paso===TOTAL-1) evento({ event:"noctra_resultado" });
  }

  /* ---- interacción ---- */

  /* pointerdown y no click: en teléfono, "click" llega hasta 80 ms después
     de levantar el dedo. Esos 80 ms por pantalla, nueve veces, son casi un
     segundo de sensación de lentitud sobre un embudo que se paga por clic. */
  app.addEventListener("pointerdown", function(e){
    var t = e.target.closest ? e.target.closest(".op,.sg,[data-atras]") : null;
    if(!t) return;

    if(t.hasAttribute("data-atras")){ atras(); return; }
    /* El de la prueba social tiene su propio listener: avanza el carrusel
       antes de avanzar de pantalla. */
    if(navegando) return;

    var cont = t.parentElement;
    var campo = cont.getAttribute("data-campo");
    if(!campo) return;

    S.a[campo] = t.getAttribute("data-val");
    guardar();
    navegando = true;
    t.classList.add("sel");

    /* Un respiro corto para que se vea qué tocó. Menos que esto y la
       pantalla cambia antes de que el ojo registre la selección; más, y se
       siente lento. */
    setTimeout(siguiente, 130);
  }, {passive:true});

  /* Teclado: el quiz tiene que poder recorrerse sin mouse ni dedo. */
  app.addEventListener("keydown", function(e){
    if(e.key!=="Enter" && e.key!==" ") return;
    var t = e.target.closest ? e.target.closest(".op,.sg,[data-atras]") : null;
    if(!t) return;
    e.preventDefault();
    t.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}));
  });

  addEventListener("hashchange", pintar);

  /* ?reset=1 limpia todo. Sirve para probar el embudo entero de nuevo sin
     tener que borrar el storage a mano desde el inspector. */
  if(new URLSearchParams(location.search).get("reset")==="1"){
    try{ localStorage.removeItem(KEY); }catch(e){}
    S = { paso:0, a:{} };
    history.replaceState(null,"",location.pathname);
    location.hash = "";
  }

  if(desdeHash()===null && S.paso>0) location.hash = "#/"+S.paso;
  else pintar();

  /* El link del checkout con la atribución pegada.

     La atribución (utm, fbclid, fbp, fbc) la arma pixel.js, que es el MISMO
     archivo que usa el embudo viejo: tiene que ser idéntica en los dos o el
     webhook deja de poder atar la venta al anuncio.

     Encima de eso le pegamos "quiz=v2". Va acá y no dentro de pixel.js a
     propósito: así el embudo viejo no se toca ni una línea. Shopify lo
     guarda en note_attributes y el webhook lo deja pasar, con lo cual cada
     venta queda marcada con el embudo que la trajo y se pueden comparar los
     dos con los pedidos reales, no sólo con lo que diga el panel. */
  window.NOCTRA_V2_CHECKOUT = function(){
    var u = Q.checkoutUrl;
    try{
      if(window.NOCTRA_ATRIB) u = window.NOCTRA_ATRIB(u);
      u += (u.indexOf("?")<0 ? "?" : "&") + "attributes[quiz]=v2";
    }catch(e){}
    return u;
  };
})();
