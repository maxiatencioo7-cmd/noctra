/* Noctra — eventos de Meta.
   No toca el motor del quiz: escucha lo que el funnel ya empuja a dataLayer
   y lo traduce a eventos estándar del pixel. Si el pixel no cargó, no rompe nada. */
(function(){
  var V={content_name:"Retrato Noctra",value:9799,currency:"ARS"};
  var hecho={};
  function fb(ev,p){try{if(window.fbq)window.fbq("track",ev,p||{})}catch(e){}}
  function unaVez(ev,p){if(hecho[ev])return;hecho[ev]=1;fb(ev,p)}

  var dl=window.dataLayer=window.dataLayer||[];
  var push=dl.push.bind(dl);
  dl.push=function(o){
    try{
      var e=o&&o.event;
      if(e==="noctra_lead")unaVez("Lead");
      else if(e==="noctra_inicio_checkout")fb("InitiateCheckout",V);
    }catch(err){}
    return push.apply(dl,arguments);
  };

  function mirar(){if(location.hash==="#/resultado")unaVez("ViewContent",V)}
  mirar();
  addEventListener("hashchange",mirar);
})();
