/* Cielo de fondo: estrellas que titilan y dos nebulosas que respiran.
   Es canvas y no imagen para que pese nada y se adapte a cualquier pantalla. */
(function(){
  "use strict";
  var c = document.getElementById("cielo");
  if (!c) return;
  var x = c.getContext("2d");
  var lento = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  var est = [], an = 0, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function medir(){
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    /* densidad pareja en cualquier tamaño de pantalla */
    var n = Math.round((W * H) / 5200);
    est = [];
    for (var i = 0; i < n; i++){
      est.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.15 + .25,
        b: Math.random() * .55 + .25,
        v: Math.random() * .013 + .004,
        f: Math.random() * Math.PI * 2,
        o: Math.random() < .14
      });
    }
  }

  function pintar(){
    x.clearRect(0, 0, W, H);
    for (var i = 0; i < est.length; i++){
      var e = est[i];
      var b = lento ? e.b : e.b + Math.sin(an * e.v * 60 + e.f) * .3;
      if (b < .05) b = .05;
      x.beginPath();
      x.arc(e.x, e.y, e.r, 0, 6.2832);
      x.fillStyle = e.o ? "rgba(245,214,123," + b + ")" : "rgba(224,232,255," + b + ")";
      x.fill();
      if (e.r > 1.05){
        x.beginPath();
        x.arc(e.x, e.y, e.r * 3.4, 0, 6.2832);
        x.fillStyle = (e.o ? "rgba(245,214,123," : "rgba(190,210,255,") + (b * .11) + ")";
        x.fill();
      }
    }
    an++;
    if (!lento) requestAnimationFrame(pintar);
  }

  var t;
  addEventListener("resize", function(){
    clearTimeout(t);
    t = setTimeout(function(){ medir(); if (lento) pintar(); }, 180);
  });

  medir();
  pintar();
})();
