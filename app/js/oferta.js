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
   ir a comprar por separado. No es un número puesto a dedo.

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
  pack:{
    id:"pack", nombre:"Cuándo, Dónde y Cómo", precio:15000, ancla:20000,
    variante:"50408908652758",
    boton:"Desbloquear todo"
  }
};
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
  return tiene("fecha") && tiene("lugar") && tiene("senal");
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
   no paga 15.000 igual paga 10.000 por la fecha, y el que iba a pagar
   10.000 muchas veces sube al pack al ver que por 5.000 más se lleva todo.
   Una sola opción convierte a los que dicen que sí; tres capturan también
   a los que dicen "eso no, esto sí".

   El orden importa: primero las dos sueltas con su candado, y recién
   después el pack. Al revés, el pack se lee como "lo caro" en lugar de
   como "lo conveniente" — necesita los dos precios de arriba para que los
   15.000 parezcan poco.

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

function abrir(nom, ciudad){
  if(document.getElementById("oferta")) return;
  var d=document.createElement("div");
  d.id="oferta";
  var quien=nom?esc(nom):null;
  var faltaTodo = !tiene("fecha") && !tiene("lugar") && !tiene("senal");

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
          +'<span>Desbloquear todo</span><i>'+plata(PROD.pack.precio)+'</i></button>'
        +'<p class="op2mas">Incluye además <b>La señal</b> —cómo reconocerlo cuando lo tengas enfrente— y <b>Por qué vos</b>. Esas dos no se venden por separado.</p>'
        +'</div>'
      : '')

    +'<div class="osobre"><div class="osel">'+SELLO+'</div>'
    +'<p>'+(quien?("La fecha de "+quien+" ya está escrita."):"La fecha ya está escrita.")
    +' Se abre cuando vos quieras.</p></div>'

    +'<button class="olink" id="ono">Ahora no, me quedo con el retrato</button>'
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

  d.querySelector("#ono").onclick=function(){
    d.classList.remove("on");
    setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); },320);
  };
}

/* La tarjeta que queda para siempre en la pestaña Retrato. Que la vea cada
   vez que entra vende más que cualquier recordatorio. */
function tarjeta(nom){
  if(comprada()) return "";
  var quien=nom?esc(nom):null;
  /* Si ya compró una parte, el precio que se muestra es el de lo que le
     falta, no el del pack entero: ofrecerle de nuevo los 15.000 al que ya
     puso 10.000 se lee como que le quieren cobrar dos veces. */
  var algo = tiene("fecha")||tiene("lugar")||tiene("senal");
  var falta = !tiene("fecha") ? PROD.fecha : (!tiene("lugar") ? PROD.lugar : PROD.pack);
  var of = algo ? falta : PACK;
  return '<div class="card otar">'
    +'<div class="otag">'+I.candado+' '+(algo?"Te falta una parte":"Falta una cosa")+'</div>'
    +'<div class="oth">'+(quien?("¿Cuándo llega "+quien+"?"):"¿Cuándo llega?")+'</div>'
    +'<p class="otp">'+(algo
        ? ("Ya desbloqueaste una parte. Falta "+esc(of.nombre)+".")
        : (quien?("Tenés su cara y su nombre. Falta el día, el lugar, y cómo vas a reconocer a "+quien+" cuando lo tengas enfrente."):"Tenés su cara y su nombre. Falta el día, el lugar y cómo vas a reconocerlo."))+'</p>'
    +'<div class="otf"><span class="otpre">'+miles(of.precio)+'</span><span class="otu">'+MONEDA+' · pago único</span></div>'
    +'<button class="btn obig" '+(algo?('data-act="comprar" data-id="'+of.id+'"'):'data-act="oferta"')+' style="margin:12px 0 0">'
      +'<span>'+(algo?("Ver "+esc(of.nombre)):("Ver "+esc(PACK.nombre)))+'</span><i>'+plata(of.precio)+'</i></button></div>';
}

window.NOCTRA_OFERTA={
  abrir:abrir, tarjeta:tarjeta, prod:PROD, pack:PACK,
  plata:plata, miles:miles, ir:irAlCheckout,
  /* Para cargar las variantes sin tocar el archivo:
     NOCTRA_OFERTA.variantes({fecha:"123", lugar:"456"}) */
  variantes:function(m){
    if(!m) return {fecha:PROD.fecha.variante, lugar:PROD.lugar.variante, pack:PROD.pack.variante};
    Object.keys(m).forEach(function(k){ if(PROD[k]) PROD[k].variante=String(m[k]||""); });
    return this.variantes();
  }
};
})();
