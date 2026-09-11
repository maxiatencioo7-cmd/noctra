/* Noctra — píxel de Meta y atribución del checkout.
   No toca el motor del quiz: escucha lo que el funnel ya empuja a dataLayer
   y lo traduce a eventos estándar. Si el píxel no cargó, nada de esto rompe.

   Además arma los cart attributes que viajan al checkout de Shopify. Sin eso
   la venta le llega a Meta sin con qué atarla al click del anuncio, y la
   campaña muestra 0 compras aunque el evento se haya recibido.
   El Purchase NO se dispara acá: sale del webhook (api/shopify-webhook.js),
   que es la única fuente, para que no se duplique. */
(function(){
  var KEY="noctra_atrib";
  var V={content_name:"Retrato Noctra",value:9799,currency:"ARS"};
  var UTM=["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
  var hecho={};

  function fb(ev,p){try{if(window.fbq)window.fbq("track",ev,p||{})}catch(e){}}
  function unaVez(ev,p){if(hecho[ev])return;hecho[ev]=1;fb(ev,p)}

  /* ---- eventos del navegador ---- */
  var dl=window.dataLayer=window.dataLayer||[];
  var push=dl.push.bind(dl);
  dl.push=function(o){
    try{
      var e=o&&o.event;
      if(e==="noctra_lead")unaVez("Lead");
      else if(e==="noctra_inicio_checkout")fb("InitiateCheckout",V);
      else if(e==="noctra_start")unaVez("QuizInicio");
      else if(e==="noctra_resultado")unaVez("QuizResultado");
      else if(e&&e.indexOf("noctra_step_")===0)paso(o.step);
    }catch(err){}
    return push.apply(dl,arguments);
  };
  /* Un evento propio por pantalla, una sola vez por visita. Con esto el
     embudo se ve en el Administrador de Eventos y, mejor todavía, se puede
     abrir por campaña en el Administrador de Anuncios: ahí se ve si la
     gente se cae por el anuncio o por una pregunta puntual.
     El nombre lleva el número con dos dígitos para que ordene solo. */
  var ETAPA={0:"Portada",1:"Prueba social",2:"Genero",3:"Interes",4:"Edad",
    5:"Origen",6:"Fecha",7:"Cualidades",8:"Referencia 1",9:"Apariencia",
    10:"Decision",11:"Referencia 2",12:"Motivo",13:"Dificultad",
    14:"Referencia 3",15:"Lenguaje",16:"Futuro",17:"Energia",18:"Opuestos",
    19:"Experiencias",20:"Transicion"};
  function paso(i){
    if(typeof i!=="number"||i<0) return;
    var dosDigitos=(i<10?"0":"")+i;
    unaVez("QuizPaso"+dosDigitos,{paso:i,etapa:ETAPA[i]||("Paso "+i)});
  }

  function mirar(){if(location.hash==="#/resultado")unaVez("ViewContent",V)}
  mirar();
  addEventListener("hashchange",mirar);

  /* ---- atribución ----
     Los utm_* y el fbclid vienen en la URL del anuncio y hay que guardarlos:
     el quiz navega por hash y la persona puede recargar, así que si no los
     capturamos al entrar se pierden antes de llegar al checkout. */
  function guardado(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
  function capturar(){
    var g=guardado(), nuevo=false;
    try{
      var p=new URLSearchParams(location.search);
      UTM.concat(["fbclid","gclid","ttclid"]).forEach(function(k){
        var v=p.get(k);
        if(v&&v.length<300&&g[k]!==v){g[k]=v;nuevo=true;}
      });
      if(nuevo){g.t=Date.now();localStorage.setItem(KEY,JSON.stringify(g));}
    }catch(e){}
    return g;
  }
  capturar();

  function cookie(n){
    try{
      var m=document.cookie.match("(^|;)\\s*"+n+"\\s*=\\s*([^;]+)");
      return m?decodeURIComponent(m[2]):"";
    }catch(e){return ""}
  }

  /* fbc = identificador del click; fbp = identificador del navegador.
     La cookie la escribe el píxel; si todavía no está pero tenemos el fbclid,
     armamos el fbc con el formato que documenta Meta. */
  function ids(){
    var g=guardado();
    var fbp=cookie("_fbp");
    var fbc=cookie("_fbc");
    if(!fbc&&g.fbclid) fbc="fb.1."+(g.t||Date.now())+"."+g.fbclid;
    return {fbp:fbp,fbc:fbc};
  }

  /* Devuelve el link del checkout con la atribución pegada como cart
     attributes: Shopify los guarda en la orden (note_attributes) y el webhook
     los lee de ahí. */
  window.NOCTRA_ATRIB=function(url){
    try{
      var g=guardado(), i=ids(), extra=[];
      function add(k,v){ if(v) extra.push("attributes["+k+"]="+encodeURIComponent(v)); }
      UTM.forEach(function(k){ add(k,g[k]); });
      add("fbclid",g.fbclid);
      add("fbp",i.fbp);
      add("fbc",i.fbc);
      add("src_host",location.host);
      if(!extra.length) return url;
      return url+(url.indexOf("?")<0?"?":"&")+extra.join("&");
    }catch(e){ return url; }
  };
})();
