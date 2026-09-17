/* Noctra v2 — el motor del quiz.

   No sabe qué pregunta el quiz. Recorre NOCTRA_V2.pasos, dibuja la pantalla
   que corresponde al "tipo", guarda lo que la persona elige y avanza.

   Tres cosas que parecen detalles y no lo son:

   1. El estado se guarda en cada paso. Alguien que abre el quiz en el
      colectivo, pierde señal y vuelve media hora después no empieza de cero.
      En un embudo pago, cada persona que reempieza es plata tirada.

   2. La navegación es por hash (#/3). Así el botón "atrás" del teléfono
      vuelve una pregunta en vez de salirse del sitio — que es el error que
      más gente pierde en los quizzes hechos a mano.

   3. Cada pantalla empuja un evento a dataLayer. js/pixel.js los traduce a
      eventos de Meta, y eso es lo que después deja abrir el embudo por
      campaña y ver en qué pregunta exacta se cae la gente. Sin esto el quiz
      es una caja negra: sabés que no convierte pero no dónde.  */
(function(){
  var Q = window.NOCTRA_V2;
  if(!Q){ console.error("[v2] falta content.js"); return; }

  var KEY  = Q.key || "noctra_q2";
  var app  = document.getElementById("app");
  var dl   = window.dataLayer = window.dataLayer || [];

  var S = cargar() || { paso:0, a:{} };

  function cargar(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
  function guardar(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function evento(o){ try{ dl.push(o); }catch(e){} }

  /* ---- navegación ---- */

  function ir(i){
    var n = Q.pasos.length;
    S.paso = Math.max(0, Math.min(i, n-1));
    guardar();
    location.hash = "#/" + S.paso;   /* dispara pintar() por hashchange */
  }
  function siguiente(){ ir(S.paso + 1); }

  function desdeHash(){
    var m = /^#\/(\d+)$/.exec(location.hash);
    return m ? parseInt(m[1],10) : null;
  }

  /* ---- pantallas ---- */

  function portada(p){
    return '<section class="pant centro">'
      + (p.imagen ? '<img class="hero" src="'+esc(p.imagen)+'" alt="">' : '')
      + '<h1>'+esc(p.titulo)+'</h1>'
      + (p.sub ? '<p class="sub">'+esc(p.sub)+'</p>' : '')
      + '<button class="cta" data-ir="1">'+esc(p.boton||"Continuar")+'</button>'
      + '</section>';
  }

  function opciones(p){
    var multi = !!p.multi;
    var ya = S.a[p.campo];
    var items = (p.opciones||[]).map(function(o){
      var sel = multi ? (Array.isArray(ya) && ya.indexOf(o.val)>=0) : (ya===o.val);
      return '<button class="op'+(sel?" sel":"")+'" data-val="'+esc(o.val)+'">'
        + (o.emoji ? '<span class="em">'+esc(o.emoji)+'</span>' : '')
        + '<span>'+esc(o.txt)+'</span></button>';
    }).join("");
    return '<section class="pant">'
      + '<h2>'+esc(p.titulo)+'</h2>'
      + (p.sub ? '<p class="sub">'+esc(p.sub)+'</p>' : '')
      + '<div class="ops" data-campo="'+esc(p.campo)+'" data-multi="'+(multi?1:0)+'">'+items+'</div>'
      /* En las de una sola respuesta el toque ya avanza: un botón
         "siguiente" de más por pantalla es una caída de más por pantalla. */
      + (multi ? '<button class="cta" data-ir="1">Continuar</button>' : '')
      + '</section>';
  }

  function texto(p){
    return '<section class="pant">'
      + '<h2>'+esc(p.titulo)+'</h2>'
      + (p.sub ? '<p class="sub">'+esc(p.sub)+'</p>' : '')
      + '<input class="txt" type="text" value="'+esc(S.a[p.campo]||"")+'" '
        + 'placeholder="'+esc(p.placeholder||"")+'" data-campo="'+esc(p.campo)+'">'
      + '<button class="cta" data-ir="1">Continuar</button>'
      + '</section>';
  }

  function carga(p){
    return '<section class="pant centro">'
      + '<h2>'+esc(p.titulo)+'</h2>'
      + (p.sub ? '<p class="sub">'+esc(p.sub)+'</p>' : '')
      + '<div class="barra"><i></i></div>'
      + '</section>';
  }

  var DIBUJA = { portada:portada, opciones:opciones, texto:texto, carga:carga };

  /* ---- pintado ---- */

  function pintar(){
    var h = desdeHash();
    if(h!==null && h!==S.paso){ S.paso = Math.max(0,Math.min(h, Q.pasos.length-1)); guardar(); }

    var p = Q.pasos[S.paso];
    if(!p) return;
    var dibujar = DIBUJA[p.tipo];
    if(!dibujar){ console.error("[v2] tipo desconocido:", p.tipo); return; }

    app.innerHTML = progreso() + dibujar(p);
    window.scrollTo(0,0);

    evento({ event:"noctra_step_"+S.paso, step:S.paso });
    if(S.paso===0) evento({ event:"noctra_start" });
    if(S.paso===Q.pasos.length-1) evento({ event:"noctra_resultado" });

    if(p.tipo==="carga"){
      var i = app.querySelector(".barra i");
      var seg = (p.segundos||3);
      if(i){ i.style.transition = "width "+seg+"s linear"; requestAnimationFrame(function(){ i.style.width="100%"; }); }
      setTimeout(siguiente, seg*1000);
    }
  }

  function progreso(){
    var pct = Math.round((S.paso/(Q.pasos.length-1))*100);
    return '<div class="prog"><i style="width:'+pct+'%"></i></div>';
  }

  /* ---- interacción ---- */

  app.addEventListener("click", function(e){
    var op = e.target.closest ? e.target.closest(".op") : null;
    if(op){
      var cont = op.parentElement;
      var campo = cont.getAttribute("data-campo");
      var multi = cont.getAttribute("data-multi")==="1";
      var val = op.getAttribute("data-val");
      if(multi){
        var l = Array.isArray(S.a[campo]) ? S.a[campo].slice() : [];
        var i = l.indexOf(val);
        if(i>=0) l.splice(i,1); else l.push(val);
        S.a[campo]=l; guardar(); op.classList.toggle("sel");
      }else{
        S.a[campo]=val; guardar();
        /* un respiro para que se vea qué tocó antes de cambiar de pantalla */
        op.classList.add("sel");
        setTimeout(siguiente, 180);
      }
      return;
    }
    var ir1 = e.target.closest ? e.target.closest("[data-ir]") : null;
    if(ir1){
      var t = app.querySelector(".txt");
      if(t) { S.a[t.getAttribute("data-campo")] = t.value.trim(); guardar(); }
      siguiente();
    }
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

  /* Al volver, se retoma donde quedó. */
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
