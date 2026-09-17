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
  /* Género. El copy se escribe en femenino —que es a quien apuntan los
     anuncios— y lleva la variante masculina al lado: {sola|solo}. Hasta que
     conteste, y si nunca contesta, sale la primera. La expansión vive acá
     adentro de esc() a propósito: por esc() pasa todo el texto que se
     dibuja, así que no hay pantalla que se pueda olvidar de hacerlo. */
  var GENERO = /\{([^{}|]*)\|([^{}|]*)\}/g;
  function genero(t){
    var h = S.a.genero === "hombre";
    return t.replace(GENERO, function(_, f, m){ return h ? m : f; });
  }
  function esc(s){ return genero(String(s==null?"":s)).replace(/[&<>"]/g,function(c){
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
  /* La flecha vuelve un paso SIEMPRE, sin depender del historial: en la
     primera pantalla después del link pelado no hay entrada anterior con
     hash y history.back() se iba del quiz o no hacía nada. */
  function atras(){ if(S.paso>0) ir(S.paso-1); }

  function desdeHash(){
    var m = /^#\/(\d+)$/.exec(location.hash);
    return m ? parseInt(m[1],10) : null;
  }

  /* ---- pantallas ---- */

  function barra(){
    if(S.paso===0) return "";
    /* La espera va a pantalla completa: una barra de progreso arriba
       contradice el "esto está calculando algo". */
    if((Q.pasos[S.paso]||{}).sinBarra) return "";
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
      /* El glifo sostiene la tarjeta mientras la ilustracion baja y se apaga
         cuando llega; el nombre en texto solo aparece si la imagen falla,
         porque la carta ya lo trae impreso abajo. */
      return '<button class="sg'+(sel?" sel":"")+'" data-val="'+esc(s.id)+'" '
        + 'aria-label="'+esc(s.nombre)+'">'
        + '<span class="sgart">'
          + '<img src="/v2/assets/'+esc(s.id)+'.webp" alt="" loading="lazy" decoding="async" '
          + 'onload="this.closest(\'.sg\').classList.add(\'con-img\')" '
          + 'onerror="this.closest(\'.sg\').classList.add(\'sin-img\'); this.remove()">'
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
        + '<img src="/v2/assets/'+esc(id)+'.webp" alt="" loading="lazy" '
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

  /* La nota. Va en marca propia, no imitando a un medio: Meta da de baja
     cuentas por usar marcas de diarios sin permiso y ahi se pierde el pixel
     con todo el aprendizaje que se viene pagando.

     El boton va al FINAL del cuerpo, no flotando arriba: para continuar hay
     que bajar, que es justamente lo que hace que la nota se lea. */
  function nota(p){
    /* Título y aviso arriba; abajo, la pieza que Maxi carga a mano en
       assets/<archivo>.webp (o .jpg/.png). Mientras no esté, el hueco guarda un alto
       parecido al de la pieza y dice qué archivo falta: el botón queda
       donde va a quedar y no salta cuando la imagen llegue. */
    var f = (p.nota && p.nota.foto) || "nota";
    return '<section class="pant">'
      + (p.titulo ? '<h2 class="ntit">'+esc(p.titulo)+'</h2>' : '')
      + (p.badge  ? '<p class="nbadge">'+esc(p.badge)+'</p>' : '')
      + '<span class="nimg">'
        + '<img src="/v2/assets/'+esc(f)+'.webp" alt="" loading="lazy" decoding="async" '
        /* Si no hay .webp prueba .jpg, .png y .jpeg antes de darse por vencida,
           así Maxi sube la foto con el formato que tenga. */
        + 'data-alt="jpg,png,jpeg" '
        + 'onerror="var a=(this.dataset.alt||\'\').split(\',\').filter(Boolean);'
        + 'if(a.length){this.dataset.alt=a.slice(1).join(\',\');this.src=this.src.replace(/\\.\\w+$/,\'.\'+a[0])}'
        + 'else{this.closest(\'.nimg\').classList.add(\'falta\')}">'
        + '<i class="ph">v2/assets/'+esc(f)+'.webp / .jpg / .png</i>'
      + '</span>'
      + '<button class="cta" data-seguir-nota>'+esc(p.boton||"Continuar")+'</button>'
      + '</section>';
  }

  /* La espera. La animación es CSS pura y gira sobre transform: el
     navegador la manda a la GPU y sigue fluida aunque el hilo principal
     esté ocupado. Con requestAnimationFrame se traba en teléfonos modestos
     justo cuando la persona la está mirando fijo. */
  function carga(p){
    return '<section class="pant carga">'
      + '<div class="orbita">'
        + '<i class="aro a1"></i><i class="aro a2"></i>'
        + '<i class="aro a3"></i><i class="nucleo"></i>'
      + '</div>'
      + '<h2 class="ctit">'+esc(p.titulo)+'</h2>'
      + (p.sub ? '<p class="csub">'+esc(p.sub)+'</p>' : '')
      + '</section>';
  }

  function resultado(p){
    return '<section class="pant centro res">'
      + '<h1 class="brilla">'+esc(p.titulo)+'</h1>'
      + '<div class="rcard">'+esc(p.tarjeta)+'</div>'
      + '<input class="txt" type="text" autocomplete="given-name" '
        + 'value="'+esc(S.a[p.campo]||"")+'" placeholder="'+esc(p.placeholder||"")+'" '
        + 'data-campo="'+esc(p.campo)+'">'
      + '<p class="msgmal" hidden>Escribí tu nombre para continuar.</p>'
      + '<button class="cta verde" data-enviar>'+esc(p.boton||"Continuar")+'</button>'
      + '</section>';
  }

  function conectado(p){
    var q = p.persona || {};
    return '<section class="pant centro">'
      + '<div class="aviso"><b>'+esc(p.aviso)+'</b>'
        + '<span class="cupo">'+esc(p.cupo)+'</span></div>'
      + '<h2 class="multi">'+esc(p.titulo).replace(/\n/g,"<br>")+'</h2>'
      + '<div class="persona">'
        + '<span class="pav">'
          + '<img src="/v2/assets/'+esc(q.foto||"elian-avatar_3")+'.webp" alt="" '
          + 'loading="lazy" decoding="async" onerror="this.closest(\'.pav\').classList.add(\'falta\')">'
          + '<i class="ph">'+esc(q.foto||"")+'</i>'
        + '</span>'
        + '<span class="pinfo"><b>'+esc(q.nombre)+'</b>'
          + '<i class="pest">'+esc(q.estado)+'</i>'
          + (q.sobre ? '<i class="psobre">'+esc(q.sobre)+'</i>' : '')
        + '</span>'
        + '<span class="ppunto"></span>'
      + '</div>'
      + '<button class="cta verde" data-seguir-nota>'+esc(p.boton||"Continuar")+'</button>'
      + '</section>';
  }

  /* ── el chat ──────────────────────────────────────────────────────

     Lo que vende no es el texto, es el RITMO: nueve mensajes que caen de a
     uno, con el "escribiendo…" en el medio, no se leen como una carta de
     ventas aunque digan exactamente lo mismo.

     Tres decisiones que sostienen eso:

     1. La demora es proporcional al largo del mensaje. Un "Sí" que tarda lo
        mismo que un párrafo delata que es un guion.
     2. Al volver a entrar, lo ya visto se pinta de golpe y sin demoras. Que
        le hagan ver de nuevo toda la conversación es la forma más rápida de
        perder a alguien que ya estaba adentro.
     3. La conversación NO se puede saltear con el botón atrás a mitad de un
        mensaje: cada respuesta suya queda guardada, así que si vuelve,
        vuelve al mismo lugar. */

  var LUGAR = null;   /* la provincia, cacheada por visita */

  function pedirLugar(){
    if(LUGAR !== null) return Promise.resolve(LUGAR);
    return fetch("/api/lugar").then(function(r){ return r.json(); })
      .then(function(j){ LUGAR = (j && j.lugar) || ""; return LUGAR; })
      .catch(function(){ LUGAR = ""; return LUGAR; });
  }

  /* "1994-08-04" (lo que da el calendario) → "04/08/1994", que es como la
     persona la escribiría. Sin fecha, queda un guion para que se note. */
  function fechaLinda(iso){
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||"");
    return m ? (m[3]+"/"+m[2]+"/"+m[1]) : "—";
  }

  function variables(t){
    var nom = S.a.nombre || "";
    var fec = fechaLinda(S.a.fecha_nac);
    /* El nombre del signo sale de la lista, no de capitalizar el id: el id
       va sin acento para que sirva de nombre de archivo, y "Cancer" sin
       tilde en medio de la conversación se lee como un descuido. */
    var sig = "";
    if(S.a.signo){
      var f = (Q.signos||[]).find(function(x){ return x.id===S.a.signo; });
      sig = f ? f.nombre : (S.a.signo.charAt(0).toUpperCase()+S.a.signo.slice(1));
    }
    return String(t)
      .replace(/\{nombre\}/g, nom)
      .replace(/\{signo\}/g, sig)
      /* {lugar} ya viene con la preposición adentro: con provincia queda
         "está EN Córdoba" y sin ella "está MUY CERCA TUYO", que son dos
         frases distintas. Si el reemplazo fuera sólo el nombre, el respaldo
         daría "está en muy cerca tuyo".

         Sin provincia confiable no se inventa: "muy cerca tuyo" dice lo
         mismo y no se puede desmentir. Una provincia equivocada rompe el
         efecto justo en el mensaje que más caro cuesta. */
      .replace(/\{fecha\}/g, fec)
      .replace(/\{lugar\}/g, LUGAR ? ("en "+LUGAR) : "cerca tuyo");
  }

  var ICONO_PLAY  = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M8 5.2v13.6L19 12z"/></svg>';
  var ICONO_MIC   = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-6a3.5 3.5 0 0 0-7 0v6A3.5 3.5 0 0 0 12 15zm6-3.5a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.94V22h2v-2.56A8 8 0 0 0 20 11.5h-2z"/></svg>';
  var ICONO_PAUSA = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><rect x="7" y="5" width="3.6" height="14" rx="1"/><rect x="13.4" y="5" width="3.6" height="14" rx="1"/></svg>';

  function mmss(s){
    s = Math.max(0, Math.floor(s||0));
    return Math.floor(s/60)+":"+("0"+(s%60)).slice(-2);
  }

  function hora(){
    var d = new Date();
    return ("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);
  }

  /* El tiempo del chat.

     Nadie empieza a escribir en el mismo instante en que mandó el mensaje
     anterior: hay un respiro antes de que aparezcan los tres puntos. Sin
     ese hueco, el "escribiendo…" arranca pegado al mensaje de arriba y se
     nota que es una cola de mensajes disparándose sola.

     Y todo lleva algo de azar. Una cadencia exacta es lo que más delata a
     un guion: un humano no tarda siempre lo mismo. Con ±10% deja de sentirse
     un metrónomo sin que nadie pueda decir por qué. */
  function azar(a, b){ return a + Math.random()*(b-a); }

  /* La pausa entre que termina un mensaje y aparecen los tres puntos del
     siguiente. Es lo que hace que se lea "de a uno" y no como una cola. */
  function respiro(){ return azar(900, 1300); }

  /* Cuánto "tarda en escribir" un mensaje. Piso para que no parezca un bot
     y techo para que nadie se vaya esperando. */
  function demora(paso){
    if(paso.audio) return azar(2300, 2900);   /* grabar lleva más que teclear */
    if(paso.img)   return azar(1800, 2300);
    var n = (paso.txt||"").length;
    var t = Math.min(3800, Math.max(1100, 800 + n*40));
    return t * azar(0.9, 1.1);
  }

  /* Un paso con "solo" aparece únicamente si ella contestó eso. Es lo que
     hace que las bifurcaciones converjan sin un mapa de saltos. */
  function corresponde(paso){
    if(!paso.solo) return true;
    for(var k in paso.solo){ if(S.a[k] !== paso.solo[k]) return false; }
    return true;
  }

  /* **así** → negrita. Se aplica DESPUÉS de esc(), sobre texto ya seguro,
     y sólo reconoce los asteriscos dobles: ningún otro HTML pasa. */
  function negrita(t){ return t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }

  function burbuja(paso){
    var h = '<span class="h">'+hora()+'</span>';
    if(paso.audio){
      return '<div class="msg el audio">'
        + '<button class="play" aria-label="Reproducir">'+ICONO_PLAY+'</button>'
        + '<span class="onda"><i></i><b></b></span>'
        + '<span class="dur">'+esc(paso.dur||"0:07")+'</span>'
        /* preload="none": cinco audios bajándose al abrir el chat compiten
           con las fotos y con el resto. Se baja el que toca. */
        + '<audio preload="none" src="/v2/assets/chat/'+esc(paso.audio)+'.mp3"></audio>'
        + h + '</div>';
    }
    if(paso.img){
      return '<div class="msg el foto">'
        + '<span class="fi"><img src="/v2/assets/'+esc(paso.img)+'.webp" alt="" '
        + 'onload="var h=this.closest(\'.hilo\'); if(h) h.scrollTop=h.scrollHeight" '
        + 'loading="lazy" decoding="async" onerror="this.closest(\'.fi\').classList.add(\'falta\')">'
        + '<i class="ph">'+esc(paso.img)+'</i></span>' + h + '</div>';
    }
    return '<div class="msg el">'+negrita(esc(variables(paso.txt))).replace(/\n/g,"<br>")+h+'</div>';
  }

  function chat(p){
    var c = p.contacto || {};
    return '<section class="pant chat">'
      + '<header class="chead">'
        + '<span class="cav">'
          + '<img src="/v2/assets/'+esc(c.foto||"elian-avatar_3")+'.webp" alt="" '
          + 'onerror="this.closest(\'.cav\').classList.add(\'falta\')">'
          + '<i class="ph">'+esc(c.foto||"")+'</i></span>'
        + '<span class="cinfo"><b>'+esc(c.nombre)+'</b><i>'+esc(c.estado)+'</i></span>'
      + '</header>'
      + '<div class="hilo" data-hilo></div>'
      + '<div class="pie">'
        + '<div class="sugs" data-sugs></div>'
        /* La barra de escribir no es un campo de verdad: si fuera un input,
           al tocarlo se abre el teclado, tapa media pantalla y no pasa nada.
           Es decorativa y lo dice —"Elegí una respuesta"— cuando hay
           opciones. Sostiene la sensación de chat sin prometer algo que no
           se puede hacer. */
        + '<div class="entrada" data-entrada>'
          + '<span class="mas">+</span>'
          + '<span class="campo" data-campo-txt>Escribí acá…</span>'
          + '<span class="enviar">➤</span>'
        + '</div>'
      + '</div>'
      + '</section>';
  }

  function montarChat(p){
    var guion = p.guion || [];
    var hilo     = app.querySelector("[data-hilo]");
    var sugs     = app.querySelector("[data-sugs]");
    var entrada  = app.querySelector("[data-entrada]");
    var campoTxt = app.querySelector("[data-campo-txt]");
    var vivo     = true;
    var foto     = (p.contacto && p.contacto.foto) || "elian-avatar_3";
    /* Si la foto del encabezado ya falló, el mini arranca en modo hueco y
       no se ve el parpadeo de la imagen rota en cada mensaje. */
    var fotoRota = !!app.querySelector(".cav.falta");

    S.chat = S.chat || 0;

    addEventListener("hashchange", function corta(){
      vivo = false; removeEventListener("hashchange", corta);
    });

    /* Cuando algo aparece abajo de la conversación (opciones, la fecha), el
       pie crece y el hilo se achica: si no se vuelve a bajar DESPUÉS de que
       el navegador acomodó todo, el último mensaje queda tapado justo
       detrás de los botones. Por eso se baja ahora y otra vez en el
       siguiente cuadro. */
    function abajo(){
      function ir(){
        try{ hilo.scrollTo({ top: hilo.scrollHeight, behavior: "smooth" }); }
        catch(e){ hilo.scrollTop = hilo.scrollHeight; }
      }
      ir();
      requestAnimationFrame(function(){ requestAnimationFrame(ir); });
    }

    /* ── los audios ──────────────────────────────────────────────
       La onda se llena con el audio real, no con un temporizador: si el
       archivo tarda en bajar o el teléfono se traba, la barra se queda
       donde está la voz en vez de correr sola y terminar antes. */
    var sonando = null;

    function pintarAudio(box, a){
      var pct = a.duration ? (a.currentTime / a.duration) * 100 : 0;
      var onda = box.querySelector(".onda");
      onda.querySelector("i").style.clipPath = "inset(0 "+(100-pct)+"% 0 0)";
      onda.querySelector("b").style.left = pct+"%";
      /* Mientras suena muestra lo transcurrido; parado, la duración total.
         Es lo que espera cualquiera que haya usado un chat. */
      box.querySelector(".dur").textContent =
        (a.paused && !a.currentTime) ? box.getAttribute("data-total") : mmss(a.currentTime);
    }

    hilo.addEventListener("click", function(ev){
      var box = ev.target.closest ? ev.target.closest(".msg.audio") : null;
      if(!box) return;
      var a = box.querySelector("audio");
      if(!a) return;
      if(!box.hasAttribute("data-total"))
        box.setAttribute("data-total", box.querySelector(".dur").textContent);

      /* Tocar la onda salta a ese punto. */
      var onda = ev.target.closest ? ev.target.closest(".onda") : null;
      if(onda && a.duration){
        var r = onda.getBoundingClientRect();
        a.currentTime = Math.min(a.duration, Math.max(0, (ev.clientX - r.left) / r.width) * a.duration);
        pintarAudio(box, a);
        if(a.paused) box.querySelector(".play").click();
        return;
      }

      if(!ev.target.closest(".play")) return;

      if(!a.paused){ a.pause(); return; }

      /* Uno por vez. Dos audios encimados no se entiende ninguno. */
      if(sonando && sonando !== a){ sonando.pause(); }
      sonando = a;

      if(!a.__listo){
        a.__listo = true;
        /* Mientras suena, la onda y el contador se redibujan en cada
           cuadro (60 veces por segundo). "timeupdate" llega 4 veces por
           segundo y la barra avanza a saltos. */
        var cuadro = null;
        function animar(){
          if(a.paused || a.ended){ cuadro = null; return; }
          pintarAudio(box, a);
          cuadro = requestAnimationFrame(animar);
        }
        a.addEventListener("play",  function(){
          box.classList.add("suena"); box.querySelector(".play").innerHTML = ICONO_PAUSA;
          if(!cuadro) cuadro = requestAnimationFrame(animar);
        });
        a.addEventListener("pause", function(){
          box.classList.remove("suena"); box.querySelector(".play").innerHTML = ICONO_PLAY;
          pintarAudio(box, a);
        });
        a.addEventListener("ended", function(){
          a.currentTime = 0; pintarAudio(box, a);
          box.querySelector(".dur").textContent = box.getAttribute("data-total");
        });
        /* Si el archivo no existe todavía, el botón lo dice en vez de no
           hacer nada: un play que no responde se lee como sitio roto. */
        a.addEventListener("error", function(){
          box.classList.add("falta");
          box.querySelector(".dur").textContent = "—";
        });
      }
      a.play().catch(function(){ box.classList.add("falta"); });
    });

    function ponerElla(txt){
      hilo.insertAdjacentHTML("beforeend",
        '<div class="msg ella">'+esc(txt)+'<span class="h">'+hora()+'</span></div>');
      abajo();
    }

    /* El "escribiendo…" lleva la foto al lado. Es un detalle chico y hace
       toda la diferencia: sin la cara, los tres puntos son un spinner; con
       la cara, es alguien del otro lado escribiendo. */
    function escribiendo(on, paso){
      var t = hilo.querySelector(".fescr");
      if(on && !t){
        /* Si lo que viene es un audio, en vez de los tres puntos se ve el
           micrófono grabando: es lo que muestra WhatsApp del otro lado. */
        var cuerpo = (paso && paso.audio)
          ? '<div class="msg el escr grab"><span class="mic">'+ICONO_MIC+'</span><span class="rec"></span>Grabando audio…</div>'
          : '<div class="msg el escr"><i></i><i></i><i></i></div>';
        hilo.insertAdjacentHTML("beforeend",
          '<div class="fescr">'
          + '<span class="mini'+(fotoRota?" falta":"")+'">'
            + '<img src="/v2/assets/'+esc(foto)+'.webp" alt="" '
            + 'onerror="this.closest(\'.mini\').classList.add(\'falta\')">'
          + '</span>'
          + cuerpo
          + '</div>');
        abajo();
      }else if(!on && t){ t.remove(); }
    }

    /* Todo lo anterior al punto donde quedó, de golpe y sin demoras. */
    function repintar(){
      var html = "";
      for(var i=0;i<S.chat && i<guion.length;i++){
        var paso = guion[i];
        if(!corresponde(paso)) continue;
        if(paso.cta) continue;
        if(paso.espera){
          var v = S.a[paso.espera.campo];
          if(paso.espera.pregunta)
            html += '<div class="msg el">'+esc(variables(paso.espera.pregunta))+'<span class="h">'+hora()+'</span></div>';
          if(paso.espera.pista)
            html += '<div class="msg el pista">'+esc(variables(paso.espera.pista))+'<span class="h">'+hora()+'</span></div>';
          var dicho = paso.espera.fecha ? (v ? fechaLinda(v) : "")
                    : (function(){ var op=(paso.espera.opciones||[]).find(function(o){ return o.val===v; }); return op?op.txt:""; })();
          if(dicho) html += '<div class="msg ella">'+esc(dicho)+'<span class="h">'+hora()+'</span></div>';
          continue;
        }
        html += burbuja(paso);
      }
      hilo.innerHTML = html;
      abajo();
    }

    /* Un mensaje de él con su respiro y sus tres puntos, y después sigue
       con lo que venga. Es lo que hace que nunca salgan dos de golpe. */
    function decir(html, paso, luego){
      setTimeout(function(){
        if(!vivo) return;
        escribiendo(true, paso);
        setTimeout(function(){
          if(!vivo) return;
          escribiendo(false);
          hilo.insertAdjacentHTML("beforeend", html);
          abajo();
          luego();
        }, demora(paso));
      }, respiro());
    }

    function preguntar(paso){
      var e = paso.espera;
      function pedir(){ if(e.fecha) pedirFecha(e); else mostrarOpciones(e); }
      /* La pista ("Escribí SI para continuar") es un mensaje chico de él,
         como en la referencia. Sale después de la pregunta, con su demora. */
      function conPista(){
        if(!e.pista) return pedir();
        decir('<div class="msg el pista">'+esc(variables(e.pista))+'<span class="h">'+hora()+'</span></div>',
              {txt:e.pista}, pedir);
      }
      if(e.pregunta){
        decir('<div class="msg el">'+esc(variables(e.pregunta))+'<span class="h">'+hora()+'</span></div>',
              {txt:e.pregunta}, conPista);
      }else conPista();
    }

    /* La fecha se pide con el calendario del teléfono, dentro de la barra
       de escribir: es el único momento en que la barra es un campo real.
       Al enviar, la fecha aparece como mensaje de ella y la barra vuelve a
       ser decorativa. */
    function pedirFecha(e){
      /* Nada de <input type=date>: en iPhone abre un calendario parado en
         el mes de hoy y para llegar a 1995 hay que descubrir que el título
         se toca. Tres ruedas —día, mes, año— se entienden solas, y el año
         arranca en el más nuevo que puede tener una persona de 14. La barra
         de abajo muestra la fecha elegida y el botón de enviar se enciende
         cuando está completa. */
      var hoy = new Date();
      var maxAnio = hoy.getFullYear()-14, minAnio = 1930;
      var MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio",
                   "Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
      var AVISO = "Elegí día, mes y año ☝️";
      function opts(label, arr){
        return '<option value="">'+label+'</option>' + arr.map(function(o){
          return '<option value="'+o[0]+'">'+o[1]+'</option>'; }).join("");
      }
      var dias=[], meses=[], anios=[];
      for(var d=1; d<=31; d++) dias.push([d, d]);
      for(var m=0; m<12; m++) meses.push([m+1, MESES[m]]);
      for(var a=maxAnio; a>=minAnio; a--) anios.push([a, a]);

      entrada.classList.add("pide");
      campoTxt.innerHTML = '<span class="fechtxt">'+AVISO+'</span>';
      var txt = campoTxt.querySelector(".fechtxt");
      var env = entrada.querySelector(".enviar");
      sugs.innerHTML = '<div class="fecha">'
        + '<p class="fechalab">📅 Tu fecha de nacimiento</p>'
        + '<div class="fechasel">'
          + '<select class="fsel" data-f="d" aria-label="Día">'+opts("Día", dias)+'</select>'
          + '<select class="fsel" data-f="m" aria-label="Mes">'+opts("Mes", meses)+'</select>'
          + '<select class="fsel" data-f="a" aria-label="Año">'+opts("Año", anios)+'</select>'
        + '</div></div>';
      sugs.classList.add("con");
      var sel = { d: sugs.querySelector('[data-f="d"]'),
                  m: sugs.querySelector('[data-f="m"]'),
                  a: sugs.querySelector('[data-f="a"]') };
      abajo();

      /* null = incompleta, false = no existe (30 de febrero), texto = ISO */
      function leer(){
        var d=+sel.d.value, m=+sel.m.value, a=+sel.a.value;
        if(!d||!m||!a) return null;
        var dt = new Date(a, m-1, d);
        if(dt.getFullYear()!==a || dt.getMonth()!==m-1 || dt.getDate()!==d) return false;
        return a+"-"+("0"+m).slice(-2)+"-"+("0"+d).slice(-2);
      }
      function falta(){
        return !sel.d.value ? "Falta elegir el día" : !sel.m.value ? "Falta elegir el mes" : "Falta elegir el año";
      }
      function mostrar(){
        var v = leer();
        txt.classList.remove("mal","con"); entrada.classList.remove("lista");
        if(v){ txt.textContent = fechaLinda(v); txt.classList.add("con"); entrada.classList.add("lista"); }
        else if(v===false){ txt.textContent = "Esa fecha no existe, revisala"; txt.classList.add("mal"); }
        else txt.textContent = AVISO;
      }
      function mandar(){
        var v = leer();
        if(!v){
          txt.textContent = (v===false) ? "Esa fecha no existe, revisala" : falta();
          txt.classList.add("mal");
          return;
        }
        env.onclick = null;
        sel.d.onchange = sel.m.onchange = sel.a.onchange = null;
        entrada.classList.remove("pide","lista");
        sugs.innerHTML = ""; sugs.classList.remove("con");
        campoTxt.textContent = "Escribí acá…";
        S.a[e.campo] = v; guardar();
        ponerElla(fechaLinda(v));
        evento({ event:"noctra_chat_"+e.campo });
        S.chat++; guardar();
        setTimeout(seguirChat, azar(1000, 1500));
      }
      env.onclick = mandar;
      sel.d.onchange = sel.m.onchange = sel.a.onchange = mostrar;
    }

    function mostrarOpciones(e){
      /* Las opciones entran escalonadas, 55 ms una de otra. Que aparezcan
         las tres de golpe se ve como un formulario; de a una se ve como
         algo que el chat te va ofreciendo. */
      sugs.innerHTML = (e.opciones||[]).map(function(o,i){
        return '<button class="sug" data-val="'+esc(o.val)+'" '
          + 'style="animation-delay:'+(i*55)+'ms">'+esc(o.txt)+'</button>';
      }).join("");
      sugs.classList.add("con");
      campoTxt.textContent = "Elegí una respuesta…";
      abajo();
      sugs.onclick = function(ev){
        var b = ev.target.closest ? ev.target.closest(".sug") : null;
        if(!b) return;
        var val = b.getAttribute("data-val");
        var op = (e.opciones||[]).find(function(o){ return o.val===val; });
        S.a[e.campo] = val; guardar();
        sugs.innerHTML = ""; sugs.classList.remove("con"); sugs.onclick = null;
        campoTxt.textContent = "Escribí acá…";
        ponerElla(op ? op.txt : val);
        evento({ event:"noctra_chat_"+e.campo, valor:val });
        S.chat++; guardar();
        /* Leer lo que ella contestó también lleva un momento. */
        setTimeout(seguirChat, azar(1000, 1500));
      };
    }

    function ponerCTA(paso){
      /* Acá ya no hay nada que responder: la barra de escribir se va y el
         botón se queda solo. Dejarla puesta invita a escribir en vez de
         tocar, justo en el único momento donde queremos una sola acción. */
      entrada.remove();
      sugs.innerHTML = '<button class="cta verde" data-checkout>'+esc(paso.cta)+'</button>';
      sugs.classList.add("con","solo-cta");
      /* Acá aparece la oferta: es el ViewContent del embudo, el momento
         equivalente a la página de precio del quiz viejo. */
      evento({ event:"noctra_oferta" });
      /* pointerdown en vez de click: sale al checkout apenas toca, sin los
         ~100 ms que el teléfono espera para confirmar un click. */
      var cta = sugs.querySelector("[data-checkout]");
      var yendo = false;
      /* La URL se arma ahora, no al tocar: al tocar sólo queda el salto. */
      var urlCheckout = window.NOCTRA_V2_CHECKOUT();
      function ir(ev){
        if(yendo) return; yendo = true;
        if(ev && ev.preventDefault) ev.preventDefault();
        cta.classList.add("yendo");
        evento({ event:"noctra_inicio_checkout" });
        location.href = urlCheckout;
      }
      cta.addEventListener("touchstart", ir, {passive:false});
      cta.addEventListener("pointerdown", ir);
      cta.addEventListener("click", ir);
      abajo();
    }

    function seguirChat(){
      if(!vivo) return;
      if(S.chat >= guion.length) return;
      var paso = guion[S.chat];

      if(!corresponde(paso)){ S.chat++; guardar(); return seguirChat(); }
      if(paso.espera) return preguntar(paso);
      /* El botón de compra espera 2 s después del último mensaje, para que
         el último audio y la lista se terminen de leer antes de que aparezca. */
      if(paso.cta)    return setTimeout(function(){ if(vivo) ponerCTA(paso); }, 2000);

      /* Primero el respiro, después los tres puntos (o el micrófono),
         después el mensaje. Entre un audio y el siguiente el respiro es
         más largo: nadie graba dos seguidos sin soltar el botón. */
      var previo = guion[S.chat-1];
      var r = respiro();
      /* Entre un audio y el siguiente, más pausa: nadie graba dos seguidos
         sin soltar el botón. */
      if(paso.audio && previo && previo.audio) r = azar(1500, 2100);
      /* Antes de la primera foto de clientes, un respiro largo: el mensaje
         que las anuncia hay que alcanzar a leerlo antes de que aparezcan. */
      else if(paso.img && previo && !previo.img) r = azar(2600, 3200);
      setTimeout(function(){
        if(!vivo) return;
        escribiendo(true, paso);
        setTimeout(function(){
          if(!vivo) return;
          escribiendo(false);
          hilo.insertAdjacentHTML("beforeend", burbuja(paso));
          abajo();
          S.chat++; guardar();
          seguirChat();
        }, demora(paso));
      }, r);
    }

    /* La provincia se pide una sola vez y antes de arrancar, para que el
       mensaje que la usa no salga con el texto de respaldo por llegar
       tarde. Si el pedido falla, arranca igual. */
    pedirLugar().then(function(){
      if(!vivo) return;
      repintar();
      seguirChat();
    });
  }

  var DIBUJA = { opciones:opciones, signos:signos, prueba:prueba, nota:nota,
                 carga:carga, resultado:resultado, conectado:conectado, chat:chat };

  /* ---- pintado ---- */

  /* Primer paso con respuesta obligatoria que todavía no tiene respuesta,
     mirando sólo los anteriores a `hasta`. Un link directo a la mitad del
     embudo, un estado viejo guardado en el teléfono o un "atrás" raro
     pueden dejar a alguien en el chat sin signo ni nombre, y ahí Elian
     diría "sos del signo de , correcto?". Antes de dibujar cualquier
     pantalla se vuelve a la primera pregunta que falta. */
  function faltante(hasta){
    for(var i=0;i<hasta;i++){
      var q = Q.pasos[i];
      if(q && q.campo && !S.a[q.campo]) return i;
    }
    return null;
  }

  function pintar(){
    var h = desdeHash();
    if(h!==null && h!==S.paso){ S.paso = Math.max(0,Math.min(h, TOTAL-1)); guardar(); }
    /* Sin hash (el "atrás" del teléfono llegó al link pelado): portada. */
    if(h===null && S.paso!==0 && S.paso!==TOTAL-1){ S.paso = 0; guardar(); }

    var falta = faltante(S.paso);
    if(falta!==null){
      S.paso = falta; guardar();
      var antes = location.hash;
      location.replace("#/"+falta);
      /* Si el hash cambió, hashchange vuelve a llamar a pintar() con el
         paso correcto; si ya era ese, hay que dibujar ahora. */
      if(location.hash!==antes) return;
    }

    var p = Q.pasos[S.paso];
    if(!p) return;
    var dibujar = DIBUJA[p.tipo];
    if(!dibujar){ console.error("[v2] tipo desconocido:", p.tipo); return; }

    app.innerHTML = barra() + dibujar(p);
    /* En el chat la página no se desplaza: sólo la conversación. */
    document.body.classList.toggle("en-chat", p.tipo==="chat");
    /* Arriba de todo sin animar el scroll: un scroll suave acá se superpone
       con la entrada de la pantalla y se ve como un tirón. */
    window.scrollTo(0,0);
    navegando = false;
    if(p.tipo==="prueba") montarCarrusel();
    if(p.tipo==="chat") montarChat(p);

    var seguir = app.querySelector("[data-seguir-nota]");
    if(seguir) seguir.addEventListener("click", siguiente);

    if(p.tipo==="carga"){
      var t = setTimeout(siguiente, (p.segundos||4.5)*1000);
      /* Si se va de la pantalla antes (botón atrás), el salto no tiene que
         dispararse igual media pantalla después. */
      addEventListener("hashchange", function limpiar(){
        clearTimeout(t); removeEventListener("hashchange", limpiar);
      });
    }

    if(p.tipo==="resultado"){
      var inp = app.querySelector(".txt");
      var mal = app.querySelector(".msgmal");
      var env = app.querySelector("[data-enviar]");
      function validar(){
        var v = (inp.value||"").trim();
        if(v.length < 2){
          mal.hidden = false; inp.classList.add("mal"); inp.focus();
          return;
        }
        S.a[inp.getAttribute("data-campo")] = v; guardar();
        evento({ event:"noctra_lead" });
        siguiente();
      }
      env.addEventListener("click", validar);
      /* El "listo" del teclado del teléfono tiene que enviar. Si no, la
         persona lo aprieta, no pasa nada, y cree que el sitio se colgó. */
      inp.addEventListener("keydown", function(e){ if(e.key==="Enter") validar(); });
      inp.addEventListener("input", function(){
        mal.hidden = true; inp.classList.remove("mal");
      });
    }

    evento({ event:"noctra_step_"+S.paso, step:S.paso });
    if(S.paso===0) evento({ event:"noctra_start" });
    if(S.paso===TOTAL-1) evento({ event:"noctra_resultado" });
  }

  /* ---- interacción ---- */

  /* pointerdown y no click: en teléfono, "click" llega hasta 80 ms después
     de levantar el dedo. Esos 80 ms por pantalla, nueve veces, son casi un
     segundo de sensación de lentitud sobre un embudo que se paga por clic. */
  app.addEventListener("click", function(e){
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
    t.click();
  });

  addEventListener("hashchange", pintar);

  /* ?reset=1 limpia todo. Sirve para probar el embudo entero de nuevo sin
     tener que borrar el storage a mano desde el inspector. */
  if(new URLSearchParams(location.search).get("reset")==="1"){
    try{ localStorage.removeItem(KEY); }catch(e){}
    S = { paso:0, a:{}, chat:0 };
    history.replaceState(null,"",location.pathname);
    location.hash = "";
  }

  /* Entrar por el link pelado (sin #/N) muestra SIEMPRE los signos, aunque
     haya un estado guardado de otra visita: la portada es el gancho del
     anuncio y arrancar en "Mujer / Hombre" desconcierta. Las respuestas
     anteriores quedan marcadas, así que rehacer el camino es tocar de
     corrido. La única excepción es quien ya estaba en el chat: ahí sí se
     retoma donde estaba, porque volver a empezar le rompe la conversación. */
  if(desdeHash()===null){
    if(S.paso===TOTAL-1) location.hash = "#/"+S.paso;
    else { S.paso = 0; guardar(); pintar(); }
  }
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
