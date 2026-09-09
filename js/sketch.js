/* Noctra — SketchEngine (placeholder procedural). Se reemplaza por capas PNG cuando existan los assets. */
(function(){
  const INK="#33333A", INK_SOFT="#6B6B72", PAPER="#D9D6CF";
  function pencil(id){return `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6"/></filter>`;}
  function grain(id){return `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="3"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .18"/></feComponentTransfer></filter>`;}
  function hatch(x,y,w,h,ang,op){let s="";const step=4;for(let i=-h;i<w+h;i+=step){s+=`<line x1="${x+i}" y1="${y}" x2="${x+i+h*Math.tan(ang)}" y2="${y+h}"/>`;}return `<g stroke="${INK}" stroke-width=".7" opacity="${op}" clip-path="url(#face)">${s}</g>`;}

  // Cabeza según género y edad
  function head(p){
    const m=p.genero==="m";
    const jaw=m?1:0.86, chin=m?" 100 232":" 100 226";
    const path=`M100 22 C ${m?150:142} 22 ${m?162:154} 70 ${m?160:150} 118 C ${m?158:148} 160 ${m?140:132} 206 ${100} 228 C ${m?60:68} 206 ${m?42:52} 160 ${m?40:50} 118 C ${m?38:46} 70 ${m?50:58} 22 100 22 Z`;
    const ears=`<path d="M${m?38:47} 108 c-8 0-12 10-8 20 c2 6 6 10 10 10" /><path d="M${m?162:153} 108 c8 0 12 10 8 20 c-2 6-6 10-10 10"/>`;
    const neck=`<path d="M78 222 L76 250 M122 222 L124 250"/>`;
    let age="";
    if(p.edad==="40"||p.edad==="50"){age+=`<path d="M70 40 q30 -6 60 0" opacity=".35"/><path d="M72 48 q28 -5 56 0" opacity=".3"/>`;}
    if(p.edad==="50"){age+=`<path d="M78 150 q-6 18 -2 36" opacity=".35"/><path d="M122 150 q6 18 2 36" opacity=".35"/><path d="M62 96 q-6 8 -4 16" opacity=".3"/><path d="M138 96 q6 8 4 16" opacity=".3"/>`;}
    if(p.edad==="30"){age+=`<path d="M80 156 q-4 14 -1 26" opacity=".2"/><path d="M120 156 q4 14 1 26" opacity=".2"/>`;}
    return `<clipPath id="face"><path d="${path}"/></clipPath><g fill="none" stroke="${INK}" stroke-width="1.7" stroke-linecap="round" filter="url(#pen)"><path d="${path}"/>${ears}${neck}${age}</g>`;
  }
  // Pelo: variante por género y "estilo" (derivado estable de etnia)
  function hair(p){
    const m=p.genero==="m", st=p.pelo||"a";
    let d="";
    if(m){
      if(st==="a") d=`M46 92 C40 50 70 16 100 16 C130 16 160 50 154 92 C150 70 132 52 100 50 C68 52 50 70 46 92 Z`;
      else if(st==="b") d=`M44 100 C38 40 78 8 104 12 C140 16 166 48 156 100 C148 66 128 46 100 46 C72 46 52 66 44 100 Z M60 40 l-8 -10 M140 40 l8 -10`;
      else d=`M48 96 C44 56 66 22 100 22 C134 22 156 56 152 96 C150 78 136 60 100 58 C64 60 50 78 48 96 Z`;
    } else {
      if(st==="a") d=`M40 120 C30 50 70 10 100 12 C130 10 170 50 160 120 C158 90 150 60 132 48 C120 40 80 40 68 48 C50 60 42 90 40 120 Z M40 120 C36 160 40 200 46 226 M160 120 C164 160 160 200 154 226`;
      else if(st==="b") d=`M42 110 C36 46 74 12 100 12 C126 12 164 46 158 110 C152 74 140 52 100 50 C60 52 48 74 42 110 Z M42 110 C40 150 38 180 44 200 M158 110 C160 150 162 180 156 200`;
      else d=`M44 104 C40 44 80 12 100 14 C120 12 160 44 156 104 C150 72 138 54 100 52 C62 54 50 72 44 104 Z M62 34 c-10 -14 -6 -24 6 -26 M138 34 c10 -14 6 -24 -6 -26`;
    }
    return `<g fill="rgba(51,51,58,.10)" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" filter="url(#pen)"><path d="${d}"/></g>${hatch(46,14,110,60,0.9,.18)}`;
  }
  function eyes(p){
    const v=p.mirada; const faint=!v; const st=faint?INK_SOFT:INK, op=faint?.35:1;
    const L=72,R=128,Y=108;
    const one=(cx,flip)=>{
      const f=flip?-1:1;
      switch(v){
        case "intensa": return `<path d="M${cx-16} ${Y+2} q16 -14 32 0 q-16 8 -32 0z"/><circle cx="${cx}" cy="${Y}" r="4.6" fill="${INK}"/><path d="M${cx-20} ${Y-16} q20 -8 40 4" stroke-width="2.4"/>`;
        case "calida": return `<path d="M${cx-15} ${Y+1} q15 -12 30 0 q-15 10 -30 0z"/><circle cx="${cx}" cy="${Y-1}" r="4" fill="${INK}"/><path d="M${cx-18} ${Y-14} q18 -7 36 0" stroke-width="2"/><path d="M${cx+f*17} ${Y+2} q${f*6} 3 ${f*8} 8 M${cx+f*18} ${Y-2} q${f*7} 0 ${f*10} 3" opacity=".6"/>`;
        case "curiosa": return `<path d="M${cx-15} ${Y+2} q15 -18 30 0 q-15 12 -30 0z"/><circle cx="${cx}" cy="${Y-2}" r="4.4" fill="${INK}"/><circle cx="${cx-1.5}" cy="${Y-3.5}" r="1.2" fill="#fff"/><path d="M${cx-18} ${Y-20} q18 -10 36 -2" stroke-width="2"/>`;
        case "serena": return `<path d="M${cx-15} ${Y+1} q15 -10 30 0 q-15 9 -30 0z"/><path d="M${cx-13} ${Y-2} q13 -6 26 0" opacity=".5"/><circle cx="${cx}" cy="${Y+.5}" r="3.8" fill="${INK}"/><path d="M${cx-17} ${Y-13} q17 -5 34 0" stroke-width="2"/>`;
        default: return `<path d="M${cx-14} ${Y+1} q14 -9 28 0" /><path d="M${cx-16} ${Y-13} q16 -5 32 0" stroke-width="1.6"/>`;
      }
    };
    return `<g fill="none" stroke="${st}" stroke-width="1.5" stroke-linecap="round" opacity="${op}" filter="url(#pen)">${one(L,false)}${one(R,true)}</g><path d="M100 118 q-8 20 -2 34 q4 4 10 0" fill="none" stroke="${INK}" stroke-width="1.5" opacity=".8" filter="url(#pen)"/>`;
  }
  function mouth(p){
    const v=p.sonrisa; const faint=!v; const st=faint?INK_SOFT:INK, op=faint?.35:1; const Y=180;
    let d="";
    switch(v){
      case "franca": d=`<path d="M78 ${Y} q22 22 44 0"/><path d="M78 ${Y} q22 4 44 0"/><path d="M84 ${Y+4} q16 10 32 0" opacity=".5"/>`; break;
      case "costado": d=`<path d="M80 ${Y+2} q20 6 42 -6"/><path d="M118 ${Y-6} q6 4 4 10" opacity=".6"/>`; break;
      case "tranquila": d=`<path d="M82 ${Y} q18 3 36 0"/><path d="M84 ${Y+6} q16 4 32 0" opacity=".45"/>`; break;
      case "insinuada": d=`<path d="M80 ${Y} q20 8 40 0"/><path d="M78 ${Y-2} q3 2 4 4 M122 ${Y-2} q-3 2 -4 4" opacity=".6"/>`; break;
      default: d=`<path d="M84 ${Y} q16 3 32 0"/>`;
    }
    return `<g fill="none" stroke="${st}" stroke-width="1.6" stroke-linecap="round" opacity="${op}" filter="url(#pen)">${d}</g>`;
  }
  function light(p){
    const dir={amanecer:["0%","100%"],ciudad:["100%","0%"],ruta:["50%","0%"],cocina:["0%","0%"]}[p.escena];
    if(!dir) return "";
    return `<defs><linearGradient id="lg" x1="${dir[0]}" y1="${dir[1]}" x2="${dir[0]==="0%"?"100%":"0%"}" y2="${dir[1]==="0%"?"100%":"0%"}"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs><rect width="200" height="250" fill="url(#lg)" clip-path="url(#face)"/>`;
  }
  function shading(p){
    return hatch(44,120,112,110,0.7,.12)+`<ellipse cx="66" cy="150" rx="14" ry="8" fill="rgba(51,51,58,.06)"/><ellipse cx="134" cy="150" rx="14" ry="8" fill="rgba(51,51,58,.06)"/>`;
  }
  window.sketchSVG=function(p){
    p=p||{}; if(!p.genero) p.genero="m";
    return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs>${pencil("pen")}${grain("gr")}</defs><rect width="200" height="250" fill="${PAPER}"/><rect width="200" height="250" filter="url(#gr)" opacity=".9"/>${head(p)}${shading(p)}${hair(p)}${eyes(p)}${mouth(p)}${light(p)}</svg>`;
  };
  // Miniaturas para VisualPicker
  window.thumbEyes=function(v){const p={genero:"m",mirada:v};return `<svg viewBox="55 88 90 36" xmlns="http://www.w3.org/2000/svg"><defs>${pencil("pen"+v)}</defs><rect x="0" y="0" width="200" height="250" fill="${PAPER}"/>${eyes(p).replace(/url\(#pen\)/g,"url(#pen"+v+")")}</svg>`;};
  window.thumbMouth=function(v){const p={genero:"m",sonrisa:v};return `<svg viewBox="66 160 68 36" xmlns="http://www.w3.org/2000/svg"><defs>${pencil("penm"+v)}</defs><rect x="0" y="0" width="200" height="250" fill="${PAPER}"/>${mouth(p).replace(/url\(#pen\)/g,"url(#penm"+v+")")}</svg>`;};
  window.thumbScene=function(v){
    const sc={
      amanecer:`<path d="M0 70 h120" /><circle cx="60" cy="70" r="18"/><path d="M20 50 q40 -30 80 0" opacity=".4"/><path d="M0 84 q30 -8 60 0 t60 0" opacity=".5"/>`,
      ciudad:`<path d="M10 100 v-40 h14 v-16 h12 v56 M46 100 v-60 h18 v60 M74 100 v-30 h10 v-20 h14 v50 M108 100 v-46 h8 v46 M0 100 h120"/><g opacity=".7"><rect x="14" y="66" width="4" height="4"/><rect x="50" y="48" width="4" height="4"/><rect x="58" y="60" width="4" height="4"/><rect x="80" y="76" width="4" height="4"/></g><circle cx="98" cy="22" r="7" opacity=".6"/>`,
      ruta:`<path d="M52 100 L60 30 M68 100 L60 30" /><path d="M0 100 h120" /><path d="M60 40 v6 M60 52 v8 M60 66 v10 M60 82 v12" opacity=".6"/><path d="M0 44 q30 -14 60 -14 t60 14" opacity=".35"/>`,
      cocina:`<path d="M10 100 v-40 h100 v40"/><path d="M20 60 v-30 h30 v30 M60 60 v-20 h40 v20"/><path d="M70 30 q8 -14 16 0" opacity=".6"/><path d="M28 40 h14 M64 48 h30" opacity=".5"/><circle cx="96" cy="26" r="9" opacity=".5"/><path d="M90 46 q6 -10 12 0" opacity=".4"/>`
    }[v];
    return `<svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="110" fill="${PAPER}"/><g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round">${sc}</g></svg>`;
  };
})();
