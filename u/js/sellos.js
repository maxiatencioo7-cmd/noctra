/* Sellos: el gráfico que acompaña la revelación de cada paso.
   Todo es SVG y CSS, no hay imágenes: pesa nada y se ve nítido en cualquier
   pantalla. Cada paso pide el suyo con la propiedad "sello". */
(function(){
  "use strict";

  /* ---------- rueda zodiacal: para el pack cuándo/dónde/cómo ---------- */
  function rueda(){
    var s = '', i, a, x1, y1, x2, y2;
    for (i = 0; i < 12; i++){
      a = (i * 30 - 90) * Math.PI / 180;
      x1 = 100 + 58 * Math.cos(a); y1 = 100 + 58 * Math.sin(a);
      x2 = 100 + 88 * Math.cos(a); y2 = 100 + 88 * Math.sin(a);
      s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' +
           x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="sl"/>';
    }
    for (i = 0; i < 60; i++){              // las marcas finas del borde
      a = (i * 6 - 90) * Math.PI / 180;
      x1 = 100 + 90 * Math.cos(a); y1 = 100 + 90 * Math.sin(a);
      x2 = 100 + 95 * Math.cos(a); y2 = 100 + 95 * Math.sin(a);
      s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' +
           x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="st"/>';
    }
    return '<div class="sello"><svg viewBox="0 0 200 200">' +
      '<g class="gira-lento">' + s +
        '<circle cx="100" cy="100" r="95" class="sa"/>' +
        '<circle cx="100" cy="100" r="88" class="sa"/>' +
        '<circle cx="100" cy="100" r="58" class="sa"/>' +
        '<path d="M100 5 A95 95 0 0 1 182 52" class="sv"/>' +
      '</g>' +
      '<g class="gira-rapido">' +
        '<circle cx="100" cy="28" r="3.4" class="sp"/>' +
        '<circle cx="163" cy="136" r="2.4" class="sp2"/>' +
      '</g>' +
      '<circle cx="100" cy="100" r="26" class="snucleo"/>' +
      '<text x="100" y="109" class="schispa">&#10022;</text>' +
    '</svg></div>';
  }

  /* ---------- lunas en órbita: para la fecha ---------- */
  function lunas(){
    var s = '', i, a, x, y, f;
    for (i = 0; i < 8; i++){
      a = (i * 45 - 90) * Math.PI / 180;
      x = 100 + 72 * Math.cos(a); y = 100 + 72 * Math.sin(a);
      f = i === 4;                          // la llena, la que importa
      s += '<g class="luna' + (f ? ' llena' : '') + '">' +
             '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' +
             (f ? 13 : 9) + '" class="lcuerpo"/>' +
             (f ? '' : '<circle cx="' + (x + (i < 4 ? 5 : -5)).toFixed(1) + '" cy="' +
                  y.toFixed(1) + '" r="' + (9 - i % 4) + '" class="lsombra"/>') +
           '</g>';
    }
    return '<div class="sello"><svg viewBox="0 0 200 200">' +
      '<circle cx="100" cy="100" r="72" class="sorbita"/>' +
      '<g class="gira-lento">' + s + '</g>' +
      '<circle cx="100" cy="100" r="22" class="snucleo"/>' +
      '<text x="100" y="108" class="schispa">&#9790;</text>' +
    '</svg></div>';
  }

  /* ---------- anillo 3D de letras: para el Código ---------- */
  function letras(){
    var A = "ABCDEFGHIJKLMNOPQRSTUVWX".split(""), s = "", i;
    for (i = 0; i < A.length; i++){
      s += '<span style="transform:rotateY(' + (i * 15) + 'deg) translateZ(96px)">' +
           A[i] + '</span>';
    }
    return '<div class="sello sello3d"><div class="anillo">' + s + '</div>' +
           '<i class="chispa3d">&#10022;</i></div>';
  }

  /* ---------- constelación: para la señal ---------- */
  function mapa(){
    var P = [[38,52],[72,30],[104,58],[86,96],[128,88],[56,112],[150,46],[112,140],[72,152]];
    var L = [[0,1],[1,2],[2,3],[3,5],[2,4],[4,6],[3,7],[7,8],[5,8]];
    var s = L.map(function(l,i){
      return '<line x1="' + P[l[0]][0] + '" y1="' + P[l[0]][1] + '" x2="' + P[l[1]][0] +
             '" y2="' + P[l[1]][1] + '" class="ml" style="animation-delay:' + (i * .28) + 's"/>';
    }).join('');
    s += P.map(function(p,i){
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === 3 ? 5 : 2.6) +
             '" class="mp' + (i === 3 ? ' clave' : '') + '" style="animation-delay:' + (i * .2) + 's"/>';
    }).join('');
    return '<div class="sello"><svg viewBox="0 0 200 200">' + s + '</svg></div>';
  }

  var MAPA = { rueda:rueda, lunas:lunas, letras:letras, mapa:mapa };

  window.NOCTRA_SELLO = function(tipo){
    return MAPA[tipo] ? MAPA[tipo]() : "";
  };
})();
