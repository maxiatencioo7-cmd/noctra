/* Noctra — Cuándo, Dónde y Cómo.

   El upsell. Aparece después del revelado y en ningún otro momento antes:
   antes de ver la cara, cobrar de nuevo se siente como cobrar dos veces lo
   mismo; después, es extender algo que ya le gustó.

   Por qué este producto y no otro: el retrato le contesta QUIÉN, y al
   contestarlo le deja abierta la pregunta que sigue —cuándo—. No hay que
   crear el deseo, ya está ahí. Sólo hay que ponerle nombre y precio.

   Lo que NO promete, a propósito: nada sobre cómo conseguir que otra
   persona sienta algo. Las predicciones sobre el futuro nunca se
   desmienten del todo; una instrucción sobre un tercero se pone a prueba,
   falla, y la persona concluye que el problema es ella. Eso además vuelve
   como reembolso. La quinta sección habla de ella, no de manipularlo a él.

   La ventana se redacta siempre como una invitación a moverse, nunca como
   una profecía para esperar sentada: cumple igual, vende igual, y no deja
   a nadie esperando un día que no llega. */
(function(){
var U=window.NOCTRA_UI, I=U.I, esc=U.esc;

/* Los tres productos. Cada uno abre distintas secciones del plan, y cada
   uno tiene su propia variante de Shopify.

     fecha  → sección 1 (La fecha)
     lugar  → secciones 2 y 3 (El lugar, En tu ciudad)
     pack   → las cinco. Incluye La señal y Por qué vos, que no se venden
              sueltas: por eso el pack no es sólo un descuento sino otra
              cosa, y puede costar menos que la suma sin que el número
              quede raro.

   El ancla de 20.000 es la suma real de dos productos que cualquiera puede
   ir a comprar por separado. No es un número puesto a dedo: el que hace la
   cuenta ve que el pack le sale 6.503 menos y encima trae dos secciones
   que sueltas no existen.

   Los checkout de fecha y lugar van vacíos hasta que existan los productos
   en Shopify: con la variante en blanco el botón avisa en vez de mandar a
   una página rota. */
var TIENDA="https://noctralmagemela.myshopify.com/cart/";
var MONEDA="ARS";

var PROD={
  fecha:{
    id:"fecha", nombre:"Fecha Exacta", precio:10000, variante:"50411348000982",
    titulo:"La fecha exacta del encuentro",
    sub:"El momento preciso en el que sus caminos se cruzan",
    boton:"Fecha Exacta"
  },
  lugar:{
    id:"lugar", nombre:"Dónde y Cómo", precio:10000, variante:"50411352817878",
    titulo:"Dónde y cómo vas a conocerlo",
    sub:"El contexto exacto, lugar y situación del primer encuentro",
    boton:"Dónde y Cómo"
  },
  /* El downsell. Es la sección 4 del pack vendida sola, y la única de las
     tres "chicas" que se puede sacar afuera sin romper nada: contesta cómo
     reconocerlo, que es la pregunta que queda viva cuando ya vio la cara.

     "Por qué vos" NO se vende suelta y sigue siendo sólo del pack: si todo
     se puede comprar por separado, el pack deja de ser otra cosa y pasa a
     ser un descuento, que es mucho más fácil de no comprar.

     Si alguna vez se despublica el producto, vaciar la variante alcanza
     para que el downsell deje de aparecer: sin variante no se dibuja, que
     es preferible a un botón que lleva a una página rota justo cuando la
     persona estaba por pagar. */
  senal:{
    id:"senal", nombre:"La señal", precio:4500, variante:"50520637472982",
    titulo:"Cómo vas a reconocerlo",
    sub:"Los dos rasgos y los dos gestos que vas a notar primero — y lo que NO es él",
    boton:"La señal"
  },
  pack:{
    id:"pack", nombre:"Cuándo, Dónde y Cómo", precio:13497, ancla:20000,
    variante:"50408908652758",
    boton:"Desbloquear todo"
  }
};

/* El crédito. Quien compró La señal a 4.500 y después quiere el pack paga
   la diferencia: 8.997. Sumado a lo que ya puso da exactamente 13.497, el
   mismo precio que si lo hubiera comprado de una. Eso es lo que evita el
   reclamo: nadie pagó de más por haber empezado de a poco, y el que ya
   tiene el pack nunca ve este número.

   El descuento lo aplica Shopify —un código de monto fijo limitado al
   producto del pack—, no la app: acá sólo se muestra el precio final y se
   agrega el código al enlace del carrito. Con CUPON en blanco no se
   descuenta nada y el pack sigue costando lo de siempre. */
var CREDITO={ cupon:"CREDITOSENAL", monto:4500 };
/* El resto de la app lee PACK para la tarjeta del retrato y la pestaña
   cerrada: se deja con el nombre de siempre. */
var PACK=PROD.pack;
PACK.moneda=MONEDA;

/* Un lacre. No está entre los íconos de la app porque no se usa en otro
   lado: la idea de "esto está cerrado y lo abrís vos" es de esta pantalla. */
var SELLO='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9"/><path d="M12 14v2.6"/></svg>';

function miles(n){ return "$" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g,"."); }
function plata(n){ return miles(n) + " " + MONEDA; }

/* Lo que ya compró, para no volver a ofrecérselo. */
function tiene(x){
  try{ return !!(window.NOCTRA_ACCESO && window.NOCTRA_ACCESO.tiene(x)); }catch(e){ return false; }
}

/* Sólo cuando tiene las tres partes se deja de ofrecer. Con segundoTrazo
   alcanzaba cuando el pack era el único producto; ahora alguien puede haber
   comprado la fecha y seguir siendo cliente de las otras dos. */
function comprada(){
  return tiene("fecha") && tiene("lugar") && tiene("senal") && tiene("vos");
}

/* Cuánto le sale hoy. Es el precio de lista, menos el crédito de La señal
   cuando lo que está mirando es el pack y ya la compró. */
function precioDe(p){
  if(!p) return 0;
  if(p.id==="pack" && CREDITO.cupon && tiene("senal")) return p.precio - CREDITO.monto;
  return p.precio;
}

/* Qué ofrecerle según lo que ya tenga. Nunca se le vuelve a mostrar algo
   que ya pagó, y al que compró sólo La señal se le ofrece el pack con el
   crédito puesto —no las sueltas—, porque el pack con crédito le sale
   menos que las dos sueltas juntas. */
function falta(){
  if(!tiene("fecha") && !tiene("lugar")) return PROD.pack;
  if(!tiene("fecha")) return PROD.fecha;
  if(!tiene("lugar")) return PROD.lugar;
  return PROD.pack;
}
function algoComprado(){
  return tiene("fecha") || tiene("lugar") || tiene("senal");
}

/* La atribución del anuncio que trajo a la persona. El quiz la guardó en
   este mismo dominio cuando entró, así que la app la puede leer: las utm y
   el fbclid de localStorage, y las cookies del píxel.

   Sin esto la venta del upsell llega a UTMify y a Meta sin origen, y la
   campaña que trajo a esa persona no se lleva el crédito de la plata que
   generó. El ROAS quedaría más bajo de lo que es. */
function atribucion(){
  var extra=[];
  function add(k,v){ if(v) extra.push("attributes["+k+"]="+encodeURIComponent(v)); }
  function cookie(n){
    var m=document.cookie.match("(^|;)\\s*"+n+"\\s*=\\s*([^;]+)");
    return m?m.pop():"";
  }
  try{
    var g={};
    try{ g=JSON.parse(localStorage.getItem("noctra_atrib"))||{}; }catch(e){}
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]
      .forEach(function(k){ add(k,g[k]); });
    add("fbclid",g.fbclid);
    var fbp=cookie("_fbp"), fbc=cookie("_fbc");
    /* mismo armado que usa el quiz: si no vino la cookie pero sí el click id,
       se reconstruye con el formato que documenta Meta */
    if(!fbc && g.fbclid) fbc="fb.1."+(g.t||Date.now())+"."+g.fbclid;
    add("fbp",fbp); add("fbc",fbc);
    add("src_host",location.host);
    add("origen","upsell_app");   /* para distinguirlo de la compra del quiz */
  }catch(e){}
  return extra;
}

function irAlCheckout(prod){
  var P0 = (typeof prod==="string") ? PROD[prod] : (prod||PACK);
  if(!P0 || !P0.variante){
    U.toast("En un momento lo habilitamos. Escribinos si lo querés ya.");
    return;
  }
  var url=TIENDA+P0.variante+":1";
  /* El crédito viaja como código de descuento en el propio enlace del
     carrito: Shopify lo aplica solo y la persona ve el total ya corregido
     antes de poner un dato. Que lo valide Shopify y no la app es lo que
     impide que alguien se lo aplique escribiéndolo en la consola. */
  if(P0.id==="pack" && CREDITO.cupon && tiene("senal")){
    url+="?discount="+encodeURIComponent(CREDITO.cupon);
  }
  /* el perfil viaja con la compra, igual que en el quiz: así la app puede
     reconocer a la persona aunque abra el mail en otro teléfono */
  try{
    var P=window.NOCTRA_DATOS&&window.NOCTRA_DATOS.P;
    var cod=window.NOCTRA_CODIGO&&P&&window.NOCTRA_CODIGO.codificar(P);
    if(cod) url+=(url.indexOf("?")<0?"?":"&")+"attributes[perfil]="+encodeURIComponent(cod);
  }catch(e){}
  try{
    var extra=atribucion();
    if(extra.length) url+=(url.indexOf("?")<0?"?":"&")+extra.join("&");
  }catch(e){}
  try{ var w=window.open(url,"_blank"); if(w){w.opener=null; return;} }catch(e){}
  location.href=url;
}

/* La pantalla grande. Se muestra una sola vez sola, después queda en la
   pestaña Encuentro para el que quiera volver.

   Tres opciones, no una. La razón es de oferta, no de diseño: alguien que
   no paga 9.997 igual paga 6.497 por la fecha, y el que iba a pagar
   6.497 muchas veces sube al pack al ver que por 3.500 más se lleva todo.
   Una sola opción convierte a los que dicen que sí; tres capturan también
   a los que dicen "eso no, esto sí".

   El orden importa: primero las dos sueltas con su candado, y recién
   después el pack. Al revés, el pack se lee como "lo caro" en lugar de
   como "lo conveniente" — necesita los dos precios de arriba para que los
   9.997 parezcan poco.

   Lo que ya compró no se le ofrece de nuevo: la tarjeta aparece abierta y
   sin botón. */
function teaser(){
  /* Las líneas borroneadas de la referencia. Son puro dibujo, no texto
     real tapado: nada que se pueda leer con el inspector. */
  return '<div class="otea" aria-hidden="true">'
    +'<span style="width:82%"></span><span style="width:64%"></span>'
    +'<span style="width:74%"></span>'
    +'<b class="ocand">'+I.candado+'</b></div>';
}

function tarjetaProd(k){
  var p=PROD[k], ya=tiene(k);
  return '<div class="ocard'+(ya?" ya":"")+'">'
    +'<div class="octit">'+esc(p.titulo)+'</div>'
    +'<p class="ocsub">'+esc(p.sub)+'</p>'
    + (ya
        ? '<div class="ocya">'+I.check+' Ya es tuyo — está abierto en Encuentro</div>'
        : teaser()
          +'<button class="ocbtn" data-prod="'+k+'">'
            +'<span class="ocb1">Tocar para ver<br><b>'+esc(p.boton)+'</b></span>'
            +'<i class="ocpre">'+miles(p.precio)+'</i></button>')
    +'</div>';
}


/* ─── el downsell ───────────────────────────────────────────────────
   Aparece cuando dice que no al upsell, y sólo entonces. Nunca antes: si
   la opción de 4.500 estuviera en la misma pantalla que el pack, una parte
   de los que iban a pagar 13.497 elegiría la barata y perderíamos plata en
   vez de ganarla. El downsell sólo puede sumar porque llega después de un
   no; lo único que puede hacer es convertir un cero en 4.500.

   Se muestra una sola vez y sólo a quien no compró absolutamente nada:
   ofrecerle "una sección suelta" al que ya puso plata es ruido, y al que
   tiene el pack sería directamente venderle lo que ya es suyo.

   Y no aparece si el producto todavía no existe en Shopify (variante en
   blanco): antes que un botón roto justo después de un no, nada. */
function hayDownsell(){
  var DT=window.NOCTRA_DATOS, D=DT&&DT.D;
  if(!PROD.senal.variante) return false;
  if(algoComprado()) return false;
  if(D && D.downsellVisto) return false;
  return true;
}

function puntoD(t){
  return '<div class="oit on"><span class="oic">'+I.check+'</span><b>'+esc(t)+'</b></div>';
}

function abrirDownsell(nom, alSeguir){
  if(document.getElementById("oferta")) return;
  try{
    var DT=window.NOCTRA_DATOS;
    if(DT&&DT.D){ DT.D.downsellVisto=true; DT.guardar(); }
  }catch(e){}
  var quien=nom?esc(nom):null;
  var d=document.createElement("div");
  d.id="oferta"; d.className="ods";

  d.innerHTML='<div class="ow">'
    +'<div class="olab">'+I.estrella+' Si te llevás una sola cosa</div>'
    +'<h1>Que sea saber<br><em>cómo reconocerlo.</em></h1>'
    +'<p class="osub">Ya sabés qué cara tiene'+(quien?(", "+quien):"")+'. La pregunta que más vuelve después es siempre la misma: ¿y si lo tengo enfrente y no me doy cuenta?</p>'

    +'<div class="opack2 on">'
      +'<div class="op2lab">'+I.estrella+' La señal · 1 de las 5 secciones</div>'
      +'<div class="olista">'
        + puntoD("Dos rasgos físicos que vas a notar antes que el resto")
        + puntoD("Dos gestos suyos, de los que no salen en ningún manual")
        + puntoD("Cómo va a ser el primer cruce, en concreto")
      +'</div>'
      +'<p class="op2mas" style="margin:0 0 14px">Y <b>lo que NO es él</b>: la contraseña para no ilusionarte con la persona equivocada.</p>'
      /* El comparativo. No lleva precio tachado: La señal nunca costó otra
         cosa, y tacharle un número inventado es la clase de mentira que
         después vuelve como reembolso. Lo que se compara es real —lo que
         cuesta cualquiera de las otras dos sueltas— y la razón de la
         diferencia se dice en voz alta abajo: es la sección más chica. */
      +'<div class="op2pre odsc"><span>Cada sección suelta: '+miles(PROD.fecha.precio)+'</span>'
        +'<b>Ésta: '+miles(PROD.senal.precio)+'</b></div>'
      +'<button class="btn obig op2btn" data-prod="senal">'
        +'<span>Abrir La señal</span><i>'+miles(PROD.senal.precio)+'<u>'+MONEDA+'</u></i></button>'
      +'<p class="op2mas">Es la sección más chica del pack — y la única que se puede llevar sola.'
        + (CREDITO.cupon
            ? ' Si más adelante querés las cinco, estos '+miles(CREDITO.monto)+' se te descuentan del pack.'
            : '')
      +'</p>'
    +'</div>'

    +'<button class="olink" id="ono">No, gracias — llevame a mi lectura</button>'
    +'<p class="onota">Pago único, en pesos argentinos. No es suscripción.<br>'
    +'Noctra es contenido interpretativo, con fines de entretenimiento.</p>'
    +'</div>';

  document.body.appendChild(d);
  requestAnimationFrame(function(){ d.classList.add("on"); });

  var bs=d.querySelectorAll("[data-prod]");
  for(var j=0;j<bs.length;j++) (function(b){
    b.onclick=function(){ irAlCheckout(b.getAttribute("data-prod")); };
  })(bs[j]);

  d.querySelector("#ono").onclick=function(){
    d.classList.remove("on");
    setTimeout(function(){
      if(d.parentNode) d.parentNode.removeChild(d);
      if(typeof alSeguir==="function") alSeguir();
    },320);
  };
}

/* alSeguir: adónde va la persona si dice que no. Cuando la oferta sale en
   el camino a la lectura, el botón de salida la lleva ahí —no la deja
   parada donde estaba—. */
function abrir(nom, ciudad, alSeguir){
  if(document.getElementById("oferta")) return;
  var d=document.createElement("div");
  d.id="oferta";
  var quien=nom?esc(nom):null;
  var faltaTodo = !algoComprado();

  d.innerHTML='<div class="ow">'
    +'<div class="olab">'+I.estrella+' Hay algo más</div>'
    +'<h1>Ahora que ya viste quién es'+(quien?(", "+quien):"")+'…<br>'
      +'<em>hay algo que todavía no sabés.</em></h1>'
    +'<p class="osub">El momento y la forma en la que esta persona va a entrar en tu vida ya están definidos. Lo que falta es que los veas.</p>'

    +'<div class="ocards">'
      + tarjetaProd("lugar")
      + tarjetaProd("fecha")
    +'</div>'

    + (faltaTodo
      ? '<div class="opack2">'
        +'<div class="op2lab">'+I.estrella+' Desbloquear ambos con descuento</div>'
        +'<div class="op2pre"><s>Valor total: '+miles(PROD.pack.ancla)+'</s>'
          +'<b>Hoy: '+miles(PROD.pack.precio)+'</b></div>'
        +'<button class="btn obig op2btn" data-prod="pack">'
          /* El número grande y "ARS" chiquito al lado: lo que la persona
             está buscando es la cifra, la moneda es una aclaración. */
          +'<span>Desbloquear todo</span><i>'+miles(PROD.pack.precio)+'<u>'+MONEDA+'</u></i></button>'
        +'<p class="op2mas">Incluye además <b>La señal</b> —cómo reconocerlo cuando lo tengas enfrente— y <b>Por qué vos</b>. Esas dos no se venden por separado.</p>'
        +'</div>'
      : '')

    +'<div class="osobre"><div class="osel">'+SELLO+'</div>'
    +'<p>'+(quien?("La fecha de "+quien+" ya está escrita."):"La fecha ya está escrita.")
    +' Se abre cuando vos quieras.</p></div>'

    +'<button class="olink" id="oya">Ya lo compré — desbloquear</button>'
    +'<button class="olink" id="ono">'+(alSeguir?"Ahora no, llevame a mi lectura":"Ahora no, me quedo con el retrato")+'</button>'
    +'<p class="onota">Pago único, en pesos argentinos. No es suscripción: no hay renovación ni cobros después.<br>'
    +'Noctra es contenido interpretativo, con fines de entretenimiento.</p>'
    +'</div>';

  document.body.appendChild(d);
  requestAnimationFrame(function(){ d.classList.add("on"); });
  var cs=d.querySelectorAll(".ocard, .opack2");
  for(var k=0;k<cs.length;k++) (function(e,i){ setTimeout(function(){ e.classList.add("on"); }, 240+i*130); })(cs[k],k);

  var bs=d.querySelectorAll("[data-prod]");
  for(var j=0;j<bs.length;j++) (function(b){
    b.onclick=function(){ irAlCheckout(b.getAttribute("data-prod")); };
  })(bs[j]);

  /* "Ya lo compré". Esta pantalla aparece justo después de revelar el
     retrato, que es donde más se confunde el que ya pagó: ve un precio y
     entiende que le están cobrando otra vez. Tiene que haber una salida
     visible que no sea volver a pagar. */
  var ya = d.querySelector("#oya");
  if(ya) ya.onclick=function(){
    d.classList.remove("on");
    setTimeout(function(){
      if(d.parentNode) d.parentNode.removeChild(d);
      if(typeof window.NOCTRA_DESBLOQUEAR==="function") window.NOCTRA_DESBLOQUEAR();
      else if(typeof alSeguir==="function") alSeguir();
    },320);
  };

  /* El no del upsell no termina la conversación: abre el downsell, si
     corresponde. Si no corresponde —ya compró algo, ya lo vio, o el
     producto todavía no existe— sigue derecho a donde iba, como siempre. */
  d.querySelector("#ono").onclick=function(){
    d.classList.remove("on");
    setTimeout(function(){
      if(d.parentNode) d.parentNode.removeChild(d);
      if(hayDownsell()) return abrirDownsell(nom, alSeguir);
      if(typeof alSeguir==="function") alSeguir();
    },320);
  };
}

/* La tarjeta que queda para siempre en la pestaña Retrato. Que la vea cada
   vez que entra vende más que cualquier recordatorio. */
function tarjeta(nom){
  if(comprada()) return "";
  var quien=nom?esc(nom):null;
  /* Si ya compró una parte, el precio que se muestra es el de lo que le
     falta, no el del pack entero: ofrecerle de nuevo los 9.997 al que ya
     puso 6.497 se lee como que le quieren cobrar dos veces. */
  var algo = algoComprado();
  var of = algo ? falta() : PACK;
  var pr = precioDe(of);
  return '<div class="card otar">'
    +'<div class="otag">'+I.candado+' '+(algo?"Te falta una parte":"Falta una cosa")+'</div>'
    +'<div class="oth">'+(quien?("¿Cuándo llega "+quien+"?"):"¿Cuándo llega?")+'</div>'
    +'<p class="otp">'+(algo
        ? ("Ya desbloqueaste una parte. Falta "+esc(of.nombre)+".")
        : (quien?("Tenés su cara y su nombre. Falta el día, el lugar, y cómo vas a reconocer a "+quien+" cuando lo tengas enfrente."):"Tenés su cara y su nombre. Falta el día, el lugar y cómo vas a reconocerlo."))+'</p>'
    +'<div class="otf"><span class="otpre">'+miles(pr)+'</span><span class="otu">'+MONEDA+' · pago único</span></div>'
    +'<button class="btn obig" '+(algo?('data-act="comprar" data-id="'+of.id+'"'):'data-act="oferta"')+' style="margin:12px 0 0">'
      +'<span>'+(algo?("Ver "+esc(of.nombre)):("Ver "+esc(PACK.nombre)))+'</span><i>'+plata(pr)+'</i></button></div>';
}

/* ─── el bloque de alerta que va suelto en las pestañas ──────────────
   La tarjeta de antes era demasiado discreta: se leía como una sección más
   de la app y la gente la pasaba de largo. Esta grita más —barra ámbar
   arriba con el punto latiendo, el precio tachado al lado del de hoy y el
   mismo botón dorado que respira— pero NO miente: no hay contador, no hay
   "quedan 3 lugares", no hay una oferta que venza a medianoche. La persona
   ya pagó una vez; inventarle urgencia acá es lo que después vuelve como
   reembolso. Lo llamativo es el diseño, no una mentira. */
var COPY = {
  retrato:{
    tag:"Te falta una parte",
    tit:function(q){ return q ? ("¿Cuándo llega "+q+"?") : "¿Cuándo llega?"; },
    txt:function(q){ return "Tenés su cara y su nombre. Falta el día, el lugar, y cómo vas a reconocer"
      +(q?(" a "+q):"lo")+" cuando lo tengas enfrente."; }
  },
  lectura:{
    tag:"Esto es la mitad",
    tit:function(q){ return q ? ("Ya sabés cómo es "+q+". Falta cuándo.") : "Ya sabés cómo es. Falta cuándo."; },
    txt:function(){ return "La lectura te dice quién es y cómo ama. La fecha exacta, el lugar del encuentro"
      +" y la señal para reconocerlo están del otro lado."; }
  },
  ventanas:{
    tag:"Una ventana no es una fecha",
    tit:function(){ return "Acá ves el tramo. Falta el día."; },
    txt:function(){ return "Las ventanas marcan los meses en que es más probable. La fecha exacta del"
      +" encuentro, el lugar y cómo reconocerlo se abren aparte."; }
  },
  diario:{
    tag:"¿Era él?",
    tit:function(){ return "Anotás encuentros. Falta saber cuál cuenta."; },
    txt:function(q){ return "Cada persona que anotás te deja la misma duda. La señal te da los dos rasgos"
      +" y los dos gestos que vas a notar primero"+(q?(" en "+q):"")+", y lo que NO es él."; }
  },
  maia:{
    tag:"Maia no puede contarte esto",
    tit:function(){ return "Hay cosas que no están en la charla."; },
    txt:function(){ return "Maia te acompaña con lo que ya tenés. El día, el lugar y la señal del"
      +" encuentro son otra cosa: están escritos, y se abren aparte."; }
  }
};

/* Qué producto se destaca en cada lugar de la app.

   Que no sea siempre el pack es a propósito. Quien dijo que no a 13.497 no
   vuelve a decir que sí al mismo número tres pantallas después; pero el
   mismo día puede decir que sí a 4.500. Y cada apartado tiene su propia
   pregunta abierta: en las ventanas falta el día, en el diario falta saber
   si la persona que anotó era él. Ofrecer ahí lo que contesta esa pregunta
   vende más que repetir el pack en los cinco lugares.

   Lo que ya compró nunca se le ofrece: si el destacado ya es suyo —o si
   ya compró algo y el destacado es el pack— cae en falta(), que siempre
   devuelve algo que no tiene. */
var DESTACADO = { retrato:"pack", lectura:"pack", ventanas:"fecha",
                  diario:"senal", maia:"lugar", plan:"pack",
                  /* el aviso flotante siempre tira por lo más barato */
                  nudge:"senal" };

function ofrecido(donde){
  var k = DESTACADO[donde];
  if(k==="pack") return algoComprado() ? falta() : PACK;
  var p = k && PROD[k];
  if(p && p.variante && !tiene(k)) return p;
  return falta();
}

/* ─── la cinta ──────────────────────────────────────────────────────
   Una barra fina, para los lugares donde una tarjeta entera sería una
   interrupción: el chat con Maia, por ejemplo, donde la persona está en
   medio de una conversación. Dice qué falta, cuánto sale, y se toca. */
function cinta(nom, donde){
  if(comprada()) return "";
  var c = COPY[donde] || COPY.retrato;
  var of = ofrecido(donde), pr = precioDe(of);
  var abre = (of.id==="pack" && !algoComprado())
    ? 'data-act="oferta"' : ('data-act="comprar" data-id="'+of.id+'"');
  return '<button class="ocinta" '+abre+'>'
    +'<span class="ocic">'+I.candado+'</span>'
    +'<span class="ocitx"><b>'+esc(c.tag)+'</b><small>'+esc(of.nombre)+'</small></span>'
    +'<i class="ocipre">'+miles(pr)+'</i></button>';
}

/* ─── la prueba social, con compras de verdad ───────────────────────
   Una isla chiquita abajo a la izquierda: "Alguien de Córdoba se llevó el
   pack · hace 2 horas". Sale de /api/ultimas, que lee las órdenes pagadas
   de Shopify. Sin nombre y sin mail a propósito: quien compró un retrato
   de su alma gemela no firmó para aparecer en la pantalla de un
   desconocido, y la ciudad sola no identifica a nadie.

   Si no hubo ventas en la semana, la lista viene vacía y no se muestra
   nada. Ahí es donde se cae la tentación de escribirlas a mano, y es
   justo donde no hay que hacerlo: una compra inventada es una venta que
   no existió, y el producto entero se apoya en que la persona crea lo que
   le contamos sobre alguien que no conoce. */
var COMPRAS = null;   /* null = todavía no se pidió */

function traerCompras(cb){
  if(COMPRAS){ cb(COMPRAS); return; }
  try{
    fetch("/api/ultimas",{cache:"no-store",credentials:"omit"})
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(j){
        COMPRAS = (j && Array.isArray(j.compras)) ? j.compras : [];
        cb(COMPRAS);
      })
      .catch(function(){ COMPRAS=[]; cb(COMPRAS); });
  }catch(e){ COMPRAS=[]; cb(COMPRAS); }
}

function islaCompra(c){
  if(document.getElementById("oprueba")) return false;
  var d=document.createElement("div");
  d.id="oprueba"; d.className="oprueba";
  d.innerHTML='<span class="opunto"></span>'
    +'<span class="oprtx"><b>Alguien de '+esc(c.lugar)+'</b>'
      +'<small>se llevó '+esc(c.producto)+' · '+esc(c.cuando)+'</small></span>';
  document.body.appendChild(d);
  requestAnimationFrame(function(){ d.classList.add("on"); });
  setTimeout(function(){
    d.classList.remove("on");
    setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); },320);
  },6500);
  return true;
}

/* Se muestran de a una, en orden, sin repetir dentro de la misma visita.
   Devuelve false cuando no queda ninguna: ahí el que llama decide si tira
   la oferta en su lugar. */
var vistas=0;
function prueba(cb){
  traerCompras(function(l){
    if(!l.length || vistas>=l.length){ if(cb) cb(false); return; }
    var c=l[vistas++];
    if(cb) cb(islaCompra(c));
  });
}

/* ─── el aviso flotante ─────────────────────────────────────────────
   Aparece solo, una vez por visita, cuando la persona ya se movió un rato
   por la app. Ofrece lo más barato que le falta, que es lo único que tiene
   sentido tirar sin que lo hayan pedido.

   Lo que este aviso NO hace, y no va a hacer: decir que alguien acaba de
   comprar. Un "Sofía de Rosario compró el pack hace 3 minutos" con un
   nombre inventado es una venta que no existió, escrita para que la lea
   como real. Eso es igual que el contador que no pusimos y que los "quedan
   3 lugares" que tampoco: funciona una vez, y después vuelve como pedido
   de reembolso y como reseña. Si algún día queremos mostrar compras
   reales, se leen de Shopify y se muestran sin nombre. */
function nudge(nom){
  if(comprada()) return false;
  if(document.getElementById("onudge")) return false;
  var of = ofrecido("nudge"), pr = precioDe(of);
  if(!of || !of.variante) return false;
  var abre = (of.id==="pack" && !algoComprado())
    ? 'data-act="oferta"' : ('data-act="comprar" data-id="'+of.id+'"');
  var d=document.createElement("div");
  d.id="onudge"; d.className="onudge";
  d.innerHTML='<button class="onx" id="onxb" aria-label="Cerrar">&times;</button>'
    +'<div class="onlab">'+I.candado+' Todavía cerrado</div>'
    +'<b>'+esc(of.titulo||of.nombre)+'</b>'
    +'<p>'+esc(of.sub||"")+'</p>'
    +'<button class="onbtn" '+abre+'><span>Ver '+esc(of.nombre)+'</span><i>'+miles(pr)+'</i></button>';
  document.body.appendChild(d);
  requestAnimationFrame(function(){ d.classList.add("on"); });
  function fuera(){
    d.classList.remove("on");
    setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); },300);
  }
  d.querySelector("#onxb").onclick=fuera;
  /* el botón de adentro lo maneja app.js con data-act, pero el aviso se
     tiene que ir igual cuando lo tocan */
  var b=d.querySelector(".onbtn");
  if(b) b.addEventListener("click",function(){ setTimeout(fuera,60); });
  setTimeout(function(){ if(d.parentNode) fuera(); },14000);
  return true;
}

function alerta(nom, donde){
  if(comprada()) return "";
  var c = COPY[donde] || COPY.retrato;
  var quien = nom ? esc(nom) : null;
  /* Si ya compró una parte, se le ofrece lo que le falta al precio de eso,
     no el pack entero: volver a mostrarle el precio completo al que ya puso
     plata se lee como que le quieren cobrar dos veces. */
  var algo = algoComprado();
  var of = ofrecido(donde);
  var pr = precioDe(of);
  var ahorro = (of.id==="pack" && !algo && PACK.ancla) ? (PACK.ancla - PACK.precio) : 0;
  /* Al que compró La señal se le muestra el crédito en vez del ahorro del
     ancla: es el número que le importa —lo que ya puso, descontado—. */
  var credito = (of.id==="pack" && pr<of.precio) ? (of.precio-pr) : 0;

  return '<div class="card oalerta">'
    +'<div class="oabarra"><span class="opunto"></span>'+esc(c.tag)+'</div>'
    +'<div class="oath">'+esc(c.tit(quien))+'</div>'
    +'<p class="oatp">'+esc(c.txt(quien))+'</p>'
    + (credito
        ? '<div class="oapre"><s>'+miles(of.precio)+'</s><b>'+miles(pr)+'</b>'
          +'<i class="oaoff">tu crédito de La señal</i></div>'
        : ahorro
        ? '<div class="oapre"><s>'+miles(PACK.ancla)+'</s><b>'+miles(PACK.precio)+'</b>'
          +'<i class="oaoff">ahorrás '+miles(ahorro)+'</i></div>'
        : '')
    +'<button class="btn obig op2btn" '
      + (of.id==="pack" && !algo ? 'data-act="oferta"' : ('data-act="comprar" data-id="'+of.id+'"'))+'>'
      +'<span>'+(of.id==="pack" && !algo ? "Desbloquear todo" : ("Desbloquear "+esc(of.nombre)))+'</span>'
      +'<i>'+miles(pr)+'<u>'+MONEDA+'</u></i></button>'
    +'<button class="olink" data-act="desbloquear">Ya lo compré — desbloquear</button>'
    +'<p class="oanota">Pago único. No es suscripción.</p>'
    +'</div>';
}

window.NOCTRA_OFERTA={
  abrir:abrir, downsell:abrirDownsell, tarjeta:tarjeta, alerta:alerta,
  cinta:cinta, nudge:nudge, prueba:prueba,
  prod:PROD, pack:PACK, precio:precioDe,
  plata:plata, miles:miles, ir:irAlCheckout,
  /* El cupón del crédito, para cargarlo sin tocar el archivo:
     NOCTRA_OFERTA.credito("SENAL4500") */
  credito:function(c){ if(typeof c==="string") CREDITO.cupon=c.trim(); return CREDITO.cupon; },
  /* Para cargar las variantes sin tocar el archivo:
     NOCTRA_OFERTA.variantes({fecha:"123", lugar:"456"}) */
  variantes:function(m){
    if(!m) return {fecha:PROD.fecha.variante, lugar:PROD.lugar.variante,
                   senal:PROD.senal.variante, pack:PROD.pack.variante};
    Object.keys(m).forEach(function(k){ if(PROD[k]) PROD[k].variante=String(m[k]||""); });
    return this.variantes();
  }
};
})();
