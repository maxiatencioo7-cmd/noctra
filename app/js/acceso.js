/* Noctra — quién compró el pack, y desde qué ciudad entra.

   Todo lo que decide si el pack está abierto o cerrado pasa por acá. La
   app nunca lo decide sola: pregunta a /api/acceso, que le pregunta a
   Shopify. Si el desbloqueo viviera en el teléfono alcanzaría con una
   línea en la consola para tenerlo gratis, y —lo que pasa mucho más
   seguido— quien lo compró y después borró los datos del sitio se
   quedaría sin lo que pagó.

   D.segundoTrazo queda como espejo local de esa respuesta: sirve para
   pintar la pantalla sin esperar la red, nunca como prueba. Cada vez que
   la app vuelve al frente se revalida.

   La ciudad se pide siempre, comprado o no: se usa para nombrarla en la
   oferta ("En Rosario") y para la tercera sección del plan. */
(function(){
var DT=window.NOCTRA_DATOS, P=DT&&DT.P, D=DT&&DT.D;
var RUTA="/api/acceso";
var ultimo=0, pidiendo=false, hubo=false;
var oyentes=[];

function codigo(){
  try{
    if(!window.NOCTRA_CODIGO||!P) return "";
    return window.NOCTRA_CODIGO.codificar(P)||"";
  }catch(e){ return ""; }
}
function avisar(cambio){
  if(cambio) hubo=true;
  for(var i=0;i<oyentes.length;i++){ try{ oyentes[i](cambio); }catch(e){} }
}

/* La ciudad que vale: primero la que cargó a mano en el perfil (siempre
   gana sobre la IP: si viaja, su vida sigue donde ella dice), después la
   del quiz, y al final la de la conexión. */
function ciudad(){
  return (D&&D.ciudadManual) || (P&&P.ciudad) || (D&&D.ciudadIP) || "";
}

function aplicar(j){
  var cambio=false;
  if(j && typeof j.ciudad==="string" && j.ciudad && j.ciudad!==D.ciudadIP){
    D.ciudadIP=j.ciudad; cambio=true;
  }
  /* Las partes que compró. El servidor manda un array: ["fecha"], o
     ["fecha","lugar","senal"] si compró el pack. Se van sumando, nunca se
     restan de a una: quien compró la fecha y después el lugar acumula las
     dos, y una respuesta incompleta por un error de red no le saca nada. */
  if(j && j.acceso===true){
    var lista = Array.isArray(j.partes) && j.partes.length
      ? j.partes
      /* respuesta de una versión anterior del servidor, sin partes: era el
         pack entero, que es lo único que existía */
      : ["fecha","lugar","senal"];
    var P0 = D.partes || {};
    for(var i=0;i<lista.length;i++){
      if(!P0[lista[i]]){ P0[lista[i]]=true; cambio=true; }
    }
    /* Misma regla que el servidor, por si la respuesta viene de una version
       anterior: con la fecha y el lugar, la senal va de arriba. */
    if(P0.fecha && P0.lugar && !P0.senal){ P0.senal=true; cambio=true; }
    D.partes = P0;
    if(!D.segundoTrazo){
      D.segundoTrazo=true;
      D.compraPack={ via:j.via||"", orden:j.orden||"", t:Date.now() };
      cambio=true;
    }
  }
  /* No se cierra por una respuesta negativa: un error de red o un token
     caído dejarían a un comprador afuera. Sólo se abre. Lo que sí cierra
     es que el servidor conteste que no, dos veces seguidas, con el mismo
     código de perfil y sin error —eso es que la orden fue anulada—. */
  if(j && j.acceso===false && j.via==="perfil" && D.segundoTrazo){
    D.negativos=(D.negativos||0)+1;
    if(D.negativos>=2){ D.segundoTrazo=false; D.partes=null; D.negativos=0; cambio=true; }
  }else if(j && j.acceso===true){ D.negativos=0; }
  if(cambio) DT.guardar();
  return cambio;
}

function comprobar(forzar, cb){
  if(pidiendo){ if(cb)cb(false); return; }
  /* un minuto de gracia: abrir y cerrar la app diez veces no son diez
     llamadas */
  if(!forzar && Date.now()-ultimo<60000){ if(cb)cb(false); return; }
  pidiendo=true; ultimo=Date.now();
  var q=[], c=codigo();
  if(c) q.push("p="+encodeURIComponent(c));
  fetch(RUTA+(q.length?"?"+q.join("&"):""),{cache:"no-store",credentials:"omit"})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(j){
      pidiendo=false;
      var cambio=aplicar(j);
      if(cambio) avisar(true);
      if(cb) cb(cambio, j);
    })
    .catch(function(){ pidiendo=false; if(cb)cb(false); });
}

/* La vía manual: para quien compró desde otro teléfono, o borró los datos
   del sitio. Pide mail Y número de orden —el mail solo lo sabe cualquiera
   que lo haya visto alguna vez—. */
function manual(email, orden, cb){
  var q=["e="+encodeURIComponent(String(email||"").trim()),
         "o="+encodeURIComponent(String(orden||"").trim())];
  fetch(RUTA+"?"+q.join("&"),{cache:"no-store",credentials:"omit"})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(j){
      var ok=!!(j&&j.acceso);
      if(ok){ aplicar(j); avisar(true); }
      if(cb) cb(ok, j);
    })
    .catch(function(){ if(cb)cb(false); });
}

/* Código a mano, para regalos y soporte. */
function porCodigo(cod, cb){
  fetch(RUTA+"?c="+encodeURIComponent(String(cod||"").trim()),{cache:"no-store",credentials:"omit"})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(j){
      var ok=!!(j&&j.acceso);
      if(ok){ aplicar(j); avisar(true); }
      if(cb) cb(ok, j);
    })
    .catch(function(){ if(cb)cb(false); });
}

function abierto(){ return !!(D&&D.segundoTrazo); }
/* Qué secciones puede ver. El comprador viejo, de cuando el pack era el
   único producto, tiene segundoTrazo pero no partes: se le dan las tres. */
function partes(){
  if(!D||!D.segundoTrazo) return {};
  if(D.partes && (D.partes.fecha||D.partes.lugar||D.partes.senal)) return D.partes;
  return { fecha:true, lugar:true, senal:true };
}
function tiene(x){ return !!partes()[x]; }
/* Si la respuesta llegó antes de que app.js alcanzara a registrarse —pasa
   con la caché del service worker— el oyente se dispara igual al entrar. */
function alCambiar(fn){
  if(typeof fn!=="function") return;
  oyentes.push(fn);
  if(hubo) try{ fn(true); }catch(e){}
}

/* El código puede venir en el enlace: /app/?c=XXXX. Es la vía para quien
   pagó por fuera del checkout —una transferencia, un regalo, una reposición—
   y no tiene número de pedido que poner en la hoja de desbloquear.

   El código no abre nada por sí solo: el servidor lo compara contra
   ACCESO_CODIGOS y contesta. Acá sólo se pasa. Si entra, se saca de la URL
   para que no quede en el historial ni en una captura de pantalla. */
function desdeEnlace(){
  try{
    var c=new URLSearchParams(location.search).get("c");
    if(!c) return;
    porCodigo(c,function(ok){
      if(!ok) return;
      try{ history.replaceState(null,"",location.pathname); }catch(e){}
      try{ window.NOCTRA_UI&&window.NOCTRA_UI.toast&&window.NOCTRA_UI.toast("Listo, ya tenés todo abierto"); }catch(e){}
    });
  }catch(e){}
}
desdeEnlace();

/* Al abrir, y cada vez que la app vuelve al frente. Lo segundo es lo que
   hace que el que vuelve del checkout de Shopify se encuentre el pack ya
   abierto, sin tener que tocar nada. */
comprobar(true);
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="visible") comprobar(false);
});
window.addEventListener("focus",function(){ comprobar(false); });

window.NOCTRA_ACCESO={
  comprobar:comprobar, manual:manual, porCodigo:porCodigo,
  abierto:abierto, partes:partes, tiene:tiene,
  ciudad:ciudad, alCambiar:alCambiar, codigo:codigo
};
})();
