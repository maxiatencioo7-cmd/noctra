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

/* Checkout directo a la variante, igual que el del quiz: el /cart/<variante>:1
   arma el carrito y manda al pago en un paso, sin página de producto en el
   medio. Producto: "Pack: Cuándo, Dónde y Cómo", variante 50408908652758. */
var CHECKOUT="https://noctralmagemela.myshopify.com/cart/50408908652758:1";

/* Un lacre. No está entre los íconos de la app porque no se usa en otro
   lado: la idea de "esto está cerrado y lo abrís vos" es de esta pantalla. */
var SELLO='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9"/><path d="M12 14v2.6"/></svg>';

var PACK={
  nombre:"Cuándo, Dónde y Cómo",
  bajada:"Todo lo que falta después de saber quién."
};

/* Las cinco. El orden no es decorativo: arranca por lo que más se quiere
   saber y cierra por lo que mejor se comparte. */
function partes(nom, ciudad){
  var el=nom?nom:"esa persona";
  return [
    {i:I.cal,      t:"La fecha",
     d:"La ventana en la que se cruzan, con día de apertura y de cierre. No “pronto”: fechas."},
    {i:I.encuentro,t:"El lugar",
     d:"En qué clase de sitio y en qué situación va a pasar. Lo que tenés que estar haciendo ese día."},
    {i:I.buscar,   t:"En "+(ciudad?esc(ciudad):"tu ciudad"),
     d:"Leído sobre el mapa donde hacés tu vida, no sobre un mapa cualquiera."},
    {i:I.ojo,      t:"La señal",
     d:"Un detalle de "+esc(el)+" para reconocerlo cuando lo tengas enfrente y no dejarlo pasar."},
    {i:I.corazon,  t:"Por qué vos",
     d:"Lo que ya tenés y te vuelve inconfundible para "+esc(el)+". Sale de lo que contestaste, no de un molde."}
  ];
}

function comprada(){
  try{ return !!(window.NOCTRA_DATOS && window.NOCTRA_DATOS.D && window.NOCTRA_DATOS.D.segundoTrazo); }
  catch(e){ return false; }
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

function irAlCheckout(){
  if(!CHECKOUT){ U.toast("En un momento lo habilitamos. Escribinos si lo querés ya."); return; }
  var url=CHECKOUT;
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
   pestaña Retrato para el que quiera volver. */
function abrir(nom, ciudad){
  if(document.getElementById("oferta")) return;
  var P=partes(nom, ciudad);
  var d=document.createElement("div");
  d.id="oferta";
  d.innerHTML='<div class="ow">'
    +'<div class="olab">'+I.estrella+' Hay algo más</div>'
    +'<h1>'+esc(PACK.nombre)+'</h1>'
    +'<p class="osub">'+esc(PACK.bajada)+'</p>'
    +'<div class="olista">'
    + P.map(function(x){ return '<div class="oit"><span class="oic">'+x.i+'</span>'
        +'<div><b>'+x.t+'</b><small>'+x.d+'</small></div></div>'; }).join("")
    +'</div>'
    +'<div class="osobre"><div class="osel">'+SELLO+'</div>'
    +'<p>'+(nom?("La fecha de "+esc(nom)+" ya está escrita."):"La fecha ya está escrita.")
    +' Se abre cuando vos quieras.</p></div>'
    +'<button class="btn" id="oyes">'+I.estrella+' '
    + (nom?("Quiero saber cuándo llega "+esc(nom)):"Quiero saber cuándo")+'</button>'
    +'<button class="olink" id="ono">Ahora no, me quedo con el retrato</button>'
    +'<p class="onota">Noctra es contenido interpretativo, con fines de entretenimiento.</p>'
    +'</div>';
  document.body.appendChild(d);
  requestAnimationFrame(function(){ d.classList.add("on"); });
  var it=d.querySelectorAll(".oit");
  for(var k=0;k<it.length;k++) (function(e,i){ setTimeout(function(){ e.classList.add("on"); }, 260+i*110); })(it[k],k);

  d.querySelector("#oyes").onclick=irAlCheckout;
  d.querySelector("#ono").onclick=function(){
    d.classList.remove("on");
    setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); },320);
  };
}

/* La tarjeta que queda para siempre en la pestaña Retrato. Que la vea cada
   vez que entra vende más que cualquier recordatorio. */
function tarjeta(nom){
  if(comprada()) return "";
  return '<div class="card otar">'
    +'<div class="lab" style="color:var(--oro)">'+PACK.nombre+'</div>'
    +'<p style="margin:8px 0 12px">'+(nom?("Ya sabés quién es y cómo se llama. Falta cuándo, dónde, y cómo vas a reconocer a "+esc(nom)+" el día que pase."):"Ya sabés quién es. Falta cuándo, dónde y cómo vas a reconocerlo.")+'</p>'
    +'<button class="btn" data-act="oferta" style="margin:0">'+I.estrella+' Ver qué incluye</button></div>';
}

window.NOCTRA_OFERTA={ abrir:abrir, tarjeta:tarjeta, pack:PACK, checkout:function(u){ CHECKOUT=u||CHECKOUT; return CHECKOUT; } };
})();
