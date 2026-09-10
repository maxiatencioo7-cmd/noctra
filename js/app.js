/* Noctra — motor del funnel (v2: secuencia Nebula, estética galaxia) */
(function(){
const C=window.NOCTRA, KEY="noctra_v2";
const CHECKOUT_URL=(C&&C.checkoutUrl)||"https://noctralmagemela.myshopify.com/cart/50392314314966:1";
function irACheckout(b,ev){
  if(b&&ev)burst(b,ev);
  track("inicio_checkout");
  S.fueAlCheckout=true;save();
  const y=$app.querySelector("#yapague");if(y)y.hidden=false;
  /* el perfil viaja con la compra: así la app lo puede reconstruir en
     cualquier teléfono, aunque el mail se abra en otro navegador */
  let destino=CHECKOUT_URL;
  try{
    const cod=window.NOCTRA_CODIGO&&window.NOCTRA_CODIGO.codificar(A());
    if(cod) destino+=(destino.indexOf("?")<0?"?":"&")+"attributes[perfil]="+encodeURIComponent(cod);
  }catch(e){}
  /* utm_*, fbclid y las cookies del pixel viajan igual que el perfil:
     el webhook las lee de la orden para atribuir la venta al anuncio */
  try{ if(window.NOCTRA_ATRIB) destino=window.NOCTRA_ATRIB(destino); }catch(e){}
  setTimeout(()=>{
    /* sin "noopener": con esa bandera window.open devuelve null siempre
       y disparaba el respaldo, llevándose también la pestaña del quiz */
    let w=null;
    try{ w=window.open(destino,"_blank"); if(w)w.opener=null; }catch(e){}
    if(!w) location.href=destino;
  },reduced?0:180);
}
const $app=document.getElementById("app"), $ov=document.getElementById("overlay");
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- estado ---------- */
let S=load()||{step:0,a:{},nombre:"",city:"",lead:null,timerStart:null,ev:[]};
function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function track(ev,extra){S.ev.push({ev,step:S.step,t:Date.now(),...(extra||{})});save();try{(window.dataLayer=window.dataLayer||[]).push({event:"noctra_"+ev,step:S.step})}catch(e){}}
const A=()=>S.a;
const g=(f,m,nb)=>S.a.genero==="m"?m:S.a.genero==="nb"?(nb||f):f;
const nombre=()=>S.nombre||"";
const NEB=C.tema==="nebula";
const IMG=C.img||{};const img=(k)=>IMG[k]||"";
const fmt=n=>C.moneda==="ARS"?("ARS "+n.toLocaleString("es-AR")):(NEB?("$"+n.toFixed(2)):(C.moneda+" "+n.toLocaleString("es-AR")));
function getSign(d,m){const s=C.signos;const lim=[19,18,20,19,20,20,22,22,22,22,21,21];return d>lim[m-1]?s[m%12]:s[(m-1)];}
function signo(){const a=A();return a.fecha?getSign(a.fecha.d,a.fecha.m):"";}
function pct(seedStr,min,max){let h=0;for(const ch of seedStr)h=(h*31+ch.charCodeAt(0))>>>0;return min+(h%(max-min+1));}

/* ---------- iconos ---------- */
const I={
  star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z"/></svg>',
  moon:'<svg class="mo" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2a10 10 0 1 0 0 20 8 8 0 1 1 0-20z"/></svg>',
  arrow:'<svg class="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  chev:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>',
  back:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 6-6 6 6 6"/></svg>',
  check:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>',
  circle:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="#E0A93A" stroke-width="1.6" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  img:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5"/></svg>',
  file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 11a3 3 0 1 0 0-6M22 20a6 6 0 0 0-5-6"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z"/></svg>',
  laurel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 20c-3-3-4-8-2-13 3 1 5 5 4 9M18 20c3-3 4-8 2-13-3 1-5 5-4 9"/><path d="M12 5l1.6 3.4 3.7.4-2.8 2.5.8 3.7L12 13.2 8.7 15l.8-3.7L6.7 8.8l3.7-.4z" fill="#F5D67B" stroke="none"/></svg>'
};
const avatarSVG='<svg viewBox="0 0 44 44"><circle cx="22" cy="17" r="8" fill="#F4F6FB" opacity=".9"/><path d="M8 40c2-9 8-13 14-13s12 4 14 13" fill="#F4F6FB" opacity=".9"/><circle cx="34" cy="9" r="1.5" fill="#F5D67B"/><circle cx="10" cy="12" r="1" fill="#8FD3FF"/></svg>';
const brand=`<span class="brand">N<svg class="o" viewBox="0 0 24 24" fill="#F5D67B"><path fill-rule="evenodd" d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zm4.5 2.2a7 7 0 1 0 0 13.6 7 7 0 1 0 0-13.6z"/></svg>ctra<span class="dot">${I.star}</span></span>`;

/* ---------- fondo de estrellas ---------- */
(function stars(){
  window.starsFast=()=>{};const cv=document.getElementById("stars");if(!cv)return;const ctx=cv.getContext("2d");let W,H,st=[],shoot=null,last=0,fast=false;
  function size(){W=cv.width=innerWidth*devicePixelRatio;H=cv.height=innerHeight*devicePixelRatio;cv.style.width=innerWidth+"px";cv.style.height=innerHeight+"px";st=Array.from({length:140},()=>({x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.5+.8)*devicePixelRatio,p:Math.random()*6.28,s:2+Math.random()*3,c:Math.random()<.35?"143,211,255":"255,255,255",v:(.02+Math.random()*.05)*devicePixelRatio}));}
  size();addEventListener("resize",size);
  window.starsFast=v=>fast=v;
  function frame(t){
    if(document.hidden){requestAnimationFrame(frame);return;}
    const dt=Math.min(.1,(t-last)/1000);last=t;ctx.clearRect(0,0,W,H);
    for(const s of st){s.p+=dt*(fast?9:1)*6.28/s.s;if(!reduced)s.y-=s.v;if(s.y<0)s.y=H;const a=.25+.75*(.5+.5*Math.sin(s.p));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);ctx.fillStyle=`rgba(${s.c},${reduced?.7:a})`;ctx.fill();}
    if(!reduced){
      if(!shoot&&Math.random()<dt/14){shoot={x:Math.random()*W*.8,y:Math.random()*H*.4,t:0};}
      if(shoot){shoot.t+=dt;const k=shoot.t/.7,x=shoot.x+k*W*.35,y=shoot.y+k*H*.22;const gr=ctx.createLinearGradient(x-60*devicePixelRatio,y-38*devicePixelRatio,x,y);gr.addColorStop(0,"rgba(255,255,255,0)");gr.addColorStop(1,"rgba(255,255,255,.9)");ctx.strokeStyle=gr;ctx.lineWidth=1.2*devicePixelRatio;ctx.beginPath();ctx.moveTo(x-60*devicePixelRatio,y-38*devicePixelRatio);ctx.lineTo(x,y);ctx.stroke();if(shoot.t>.7)shoot=null;}
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ---------- efectos ---------- */
function burst(el,ev,n){
  if(reduced)return;
  const r=el.getBoundingClientRect(),x=ev&&ev.clientX?ev.clientX:r.left+r.width/2,y=ev&&ev.clientY?ev.clientY:r.top+r.height/2;
  const rp=document.createElement("span");rp.className="ripple";const sz=Math.max(r.width,r.height)/2;rp.style.cssText=`width:${sz}px;height:${sz}px;left:${x-r.left-sz/2}px;top:${y-r.top-sz/2}px`;el.appendChild(rp);setTimeout(()=>rp.remove(),500);
  for(let i=0;i<(n||10);i++){const p=document.createElement("span");p.className="pt";const a=Math.random()*6.28,d=40+Math.random()*50;p.style.cssText=`left:${x}px;top:${y}px;background:${i%2?"#F5D67B":"#8FD3FF"};--tx:${Math.cos(a)*d}px;--ty:${Math.sin(a)*d}px`;document.body.appendChild(p);setTimeout(()=>p.remove(),600);}
}
function twinkles(){return [[18,30],[62,62],[85,25],[40,80]].map((p,i)=>`<i class="tw" style="left:${p[0]}%;top:${p[1]}%;animation-delay:${i*.7}s"></i>`).join("");}
function optBtn(label,extra,icon,val,emoji){return `<button class="opt ${extra||""}" type="button" ${val!==undefined?`data-v="${val}"`:""}>${NEB?"":twinkles()}${emoji?`<span class="em">${emoji}</span>`:""}<span class="lbl">${label}</span>${icon===undefined?I.chev:icon}</button>`;}
function cta(label,attrs){return `<button class="cta" type="button" ${attrs||""}>${NEB?"":I.moon}<span>${label}</span>${NEB?"":I.arrow}</button>`;}

/* ---------- lienzo ---------- */
function sketchParams(){
  const a=A();
  const mirada={carinosa:"calida",calma:"serena",juguetona:"curiosa",aventurera:"curiosa",equilibrada:"serena",apasionada:"intensa"}[a.energia];
  const c=a.cualidades||[];const sonrisa=c.includes("Divertido/a")?"franca":c.includes("Seguro/a")?"costado":(c.includes("Cariñoso/a")||c.includes("Amable"))?"insinuada":c.length?"tranquila":undefined;
  const escena={palabras:"amanecer",regalos:"ciudad",actividades:"ruta",contacto:"cocina",gestos:"cocina"}[a.lenguaje];
  return {genero:a.generoRetrato||"m",edad:a.edad||"30",etnia:a.etnia||"latino",mirada,sonrisa,escena,pelo:a.pelo||"a"};
}
function blurFor(p){return p<40?28-p*.25:Math.max(3,18-(p-40)*(15/45));}
function canvasHTML(progress,size,opts){
  opts=opts||{};const b=opts.noBlur?0:blurFor(progress);
  return `<div class="canvas ${size||""}" data-p="${progress}"><div style="width:100%;height:100%;filter:blur(${b}px) contrast(1.05)">${sketchSVG(sketchParams())}</div><span class="flash"></span>${opts.lock?`<div class="lock">${I.lock}</div>`:""}${opts.seal?`<span class="seal">${opts.seal}</span>`:""}${S.nombre&&progress>=25?`<span class="sign">${S.nombre}</span>`:""}</div>`;
}
function progressRow(n,extra){
  const p=Math.round(n/C.totalPreguntas*100);
  return `<div class="prog"><button class="pback" type="button" aria-label="Volver">${I.back}</button><span class="psec">${C.seccion}</span><span class="ppill">${n}/${C.totalPreguntas}${extra?` · ${extra}`:""}</span></div><div class="ptrack"><div class="pfill" style="width:${p}%"></div></div>`;
}
function canvasWrap(n,progress,extra){return (NEB?"":`<div class="canvas-wrap">${canvasHTML(progress)}</div>`)+progressRow(n,extra);}
function bubble(text,stat){return `<div class="bubble"><div class="avatar">${avatarSVG}</div><div class="bx"><div class="who">${C.guia.toUpperCase()}</div>${text}${stat?`<div class="stat">${stat}</div>`:""}</div></div>`;}

/* ---------- pantallas (secuencia Nebula, 1:1) ---------- */
const Q=C.preguntas;
const SCREENS=[
 {id:"landing"},{id:"social"},
 {id:"q",key:"genero",n:1},
 {id:"q",key:"interes",n:2},
 {id:"q",key:"edad",n:3},
 {id:"q",key:"etnia",n:4},
 {id:"fecha",n:5},
 {id:"multi",key:"cualidades",n:6},
 {id:"ref",key:"ref1"},
 {id:"q",key:"apariencia",n:7},
 {id:"q",key:"decision",n:8},
 {id:"ref",key:"ref2"},
 {id:"q",key:"motivo",n:9},
 {id:"q",key:"dificultad",n:10},
 {id:"ref",key:"ref3"},
 {id:"visual",key:"lenguaje",n:11},
 {id:"multi",key:"futuro",n:12},
 {id:"q",key:"energia",n:13},
 {id:"escala",key:"opuestos",n:14},
 {id:"q",key:"experiencias",n:15},
 {id:"transicion"}
];
const LABEL={};Object.entries(Q).forEach(([k,q])=>{if(q.opts)q.opts.forEach(o=>{if(Array.isArray(o))(LABEL[k]=LABEL[k]||{})[o[0]]=o[1];});});
const low=s=>s.charAt(0).toLowerCase()+s.slice(1);
const gl=s=>{s=s||"";if(!S.a.genero)return s;return s.replace(/(\w+?)a\/o\b/g,(m,w)=>g(w+"a",w+"o",w+"e")).replace(/(\w+?)o\/a\b/g,(m,w)=>g(w+"a",w+"o",w+"e"));};
const glp=s=>{s=s||"";const gp=S.a.generoRetrato;if(!gp)return s;const f=gp==="f";return s.replace(/(\w+?)a\/o\b/g,(m,w)=>f?w+"a":w+"o").replace(/(\w+?)o\/a\b/g,(m,w)=>f?w+"a":w+"o");};
const lbl=(k)=>gl(LABEL[k]&&LABEL[k][A()[k]]||"");
const progressFor=i=>{const s=SCREENS[i];if(s.n)return Math.round(s.n/C.totalPreguntas*80);return 0;};

/* ---------- navegación ---------- */
function go(i){
  const cur=$app.querySelector(".screen");
  const doIt=()=>{S.step=i;save();render();scrollTo({top:0,behavior:"instant"});};
  if(cur&&!reduced){cur.classList.add("leaving");setTimeout(doIt,NEB?40:50);}else doIt();
}
function next(){const i=S.step+1;if(i>=SCREENS.length){location.hash="#/resultado";return;}go(i);}
function back(){if(S.step>0)go(S.step-1);}
function pickBurst(btn,ev,cb){burst(btn,ev);btn.style.pointerEvents="none";setTimeout(cb,reduced?0:(NEB?60:80));}
function selectAndGo(btn,ev,cb){
  burst(btn,ev,14);btn.classList.add("sel","picked");
  const icon=btn.querySelector(".ic");if(icon)icon.outerHTML=I.check;
  btn.parentElement.querySelectorAll(".opt, .visual button").forEach(x=>{if(x!==btn)x.classList.add("dim");});
  $app.querySelectorAll("button").forEach(x=>x.style.pointerEvents="none");
  setTimeout(cb,reduced?0:(NEB?160:180));
}

/* ---------- render ---------- */
function shell(inner,opts){opts=opts||{};return `<section class="screen"><div class="topbar"><button class="back ${opts.noBack?"hidden":""}" aria-label="Volver">${I.back}</button>${brand}<span style="width:40px"></span></div>${inner}</section>`;}
function render(){
  if(location.hash==="#/resultado"){renderSales();return;}
  if(location.hash==="#/gracias"){renderThanks();return;}
  const s=SCREENS[S.step];$app.className="";
  const R={landing,social,q,fecha,multi,ref,visual,escala,email,transicion}[s.id];
  $app.innerHTML=R(s);
  $app.querySelectorAll(".back, .pback").forEach(b=>b.onclick=back);
  if($app.querySelector(".pback")){const tb=$app.querySelector(".topbar .back");if(tb)tb.classList.add("hidden");}
  track("step_"+S.step);
  if(s.id==="fecha")initWheels();
  if(s.id==="transicion")runTransicion();
  if(s.id==="landing")runRot();
}

function landing(){
  const L=C.landing;
  return shell(`<div class="card center" style="align-items:center">
    <div class="badges"><div class="badge">${I.laurel}<div><small>${L.badge1[0]}</small><b>${L.badge1[1]}</b></div></div><div class="badge">${I.users}<div><small>${L.badge2[0]}</small><b>${L.badge2[1]}</b></div></div></div>
    <div class="hero-photo">${NEB?(img("principal")?`<img class="hero-img" src="${img("principal")}" alt="Pareja con su Retrato del Alma Gemela" width="330" height="248">`:`<div class="photo-ph">Foto: pareja con su retrato (asset pendiente)</div>`):`<div class="canvas xl" style="margin:0 auto"><div style="width:100%;height:100%;filter:blur(20px)">${sketchSVG({genero:"m"})}</div><svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%" fill="none" stroke="#33333A" stroke-width="4" stroke-linecap="round"><path d="M36 34c2-12 14-16 22-12 8 4 8 14 0 20-6 4-8 8-8 14" filter="url(#pen)"/><circle cx="50" cy="70" r="2.5" fill="#33333A"/></svg></div><span class="photo-note">Foto: pareja con su retrato (asset pendiente)</span>`}</div>
    <div class="rot"><span class="gtitle rot-line" id="rot">${L.rotativas[0]}</span><h1>${L.titulo}</h1></div>
    <p class="muted">${L.sub}</p>
    <div class="chips">${L.chips.map((c,i)=>`<span class="chip">${[I.clock,I.star,I.img][i]||I.star}${c}</span>`).join("")}</div>
    ${cta(L.cta,'data-act="start"')}
    <p class="legal">${L.legal}</p>
  </div>`,{noBack:true});
}
function runRot(){const el=$app.querySelector("#rot");if(!el||reduced)return;let i=0;const L=C.landing.rotativas;const iv=setInterval(()=>{if(!document.contains(el)){clearInterval(iv);return;}el.classList.add("out");setTimeout(()=>{i=(i+1)%L.length;el.textContent=L[i];el.classList.remove("out");},350);},2800);}
function social(){
  const t=C.testimonios[0];const q=t.q.replace(t.mark,`<mark>${t.mark}</mark>`);
  return shell(`<div class="card">
    <h2>${C.social.titulo}</h2>
    <div class="testi"><div class="quote">“</div><q>${q}</q><div class="who"><i>${t.who[0]}</i><div><b>${t.who}</b><br><span>${t.since}</span></div><span class="date">${t.when}</span></div></div>
    ${cta(C.social.cta,'data-act="next"')}
  </div>`);
}
function qHead(s,extra){const q=Q[s.key]||{};return `${canvasWrap(s.n,progressFor(S.step),extra)}<h2>${gl(q.titulo)}</h2>${q.sub?`<p class="muted small">${q.sub}</p>`:""}`;}
function q(s){
  const q=Q[s.key];
  return shell(`<div class="card">${qHead(s)}<div class="stack">${q.opts.map(o=>optBtn(glp(o[1]),"",NEB?"":I.chev,o[0],o[2]&&!/gradient/.test(o[2])?o[2]:"")).join("")}</div></div>`);
}
function fecha(s){
  const f=A().fecha||{};
  return shell(`<div class="card">${canvasWrap(5,progressFor(S.step))}<h2>${Q.fecha.titulo}</h2><p class="muted small">${Q.fecha.sub}</p>
    <div class="sheet"><div class="wheels">
      <div class="wheel" data-w="d">${Array.from({length:31},(_,i)=>`<div class="wi" data-v="${i+1}">${String(i+1).padStart(2,"0")}</div>`).join("")}</div>
      <div class="wheel" data-w="m">${C.meses.map((m,i)=>`<div class="wi" data-v="${i+1}">${m}</div>`).join("")}</div>
      <div class="wheel" data-w="y">${(()=>{let s="";const y0=new Date().getFullYear()-18;for(let k=y0;k>=1940;k--)s+=`<div class="wi" data-v="${k}">${k}</div>`;return s;})()}</div>
      <div class="wsel"></div></div>
    ${cta(C.btn.continuar,'data-act="fecha"')}</div></div>`);
}
function initWheels(){
  const f=A().fecha||{d:15,m:6,y:1992};
  $app.querySelectorAll(".wheel").forEach(w=>{const k=w.dataset.w;const items=[...w.children];const target=items.find(i=>+i.dataset.v===f[k])||items[0];
    requestAnimationFrame(()=>{w.scrollTop=target.offsetTop-w.clientHeight/2+target.clientHeight/2;mark(w);});
    let raf=0;w.addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;mark(w);});},{passive:true});
    // rueda "corrediza" con el mouse (en touch ya desliza nativo): arrastre + inercia + snap
    let drag=null,moved=false,mom=0;
    const snapTo=(it,smooth=true)=>w.scrollTo({top:it.offsetTop-w.clientHeight/2+it.clientHeight/2,behavior:smooth?"smooth":"auto"});
    const nearest=()=>{const mid=w.scrollTop+w.clientHeight/2;let best=null,bd=1e9;for(const it of w.children){const d=Math.abs(it.offsetTop+it.clientHeight/2-mid);if(d<bd){bd=d;best=it;}}return best;};
    w.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse")return;cancelAnimationFrame(mom);drag={y:e.clientY,top:w.scrollTop,v:0,t:performance.now(),ly:e.clientY};moved=false;w.style.scrollSnapType="none";w.setPointerCapture(e.pointerId);e.preventDefault();});
    w.addEventListener("pointermove",e=>{if(!drag)return;const dy=e.clientY-drag.y;if(Math.abs(dy)>3)moved=true;const now=performance.now(),dt=Math.max(1,now-drag.t);drag.v=(e.clientY-drag.ly)/dt;drag.t=now;drag.ly=e.clientY;w.scrollTop=drag.top-dy;});
    const endDrag=()=>{if(!drag)return;let v=drag.v*16;drag=null;
      const step=()=>{if(Math.abs(v)<.6){w.style.scrollSnapType="";const it=nearest();if(it)snapTo(it);return;}w.scrollTop-=v;v*=.92;mom=requestAnimationFrame(step);};
      if(moved)step();else w.style.scrollSnapType="";};
    w.addEventListener("pointerup",endDrag);w.addEventListener("pointercancel",endDrag);
    w.addEventListener("click",e=>{if(moved){moved=false;return;}const it=e.target.closest(".wi");if(it)snapTo(it);});
  });
  function mark(w){const mid=w.scrollTop+w.clientHeight/2;let best=null,bd=1e9;for(const it of w.children){const c=it.offsetTop+it.clientHeight/2;const d=Math.abs(c-mid);if(d<bd){bd=d;best=it;}}[...w.children].forEach(i=>i.classList.toggle("on",i===best));}
}
function readWheels(){const o={};$app.querySelectorAll(".wheel").forEach(w=>{const on=w.querySelector(".wi.on");o[w.dataset.w]=on?+on.dataset.v:null;});return o;}
function multi(s){
  const q=Q[s.key];const cur=A()[s.key]||[];
  return shell(`<div class="card">${qHead(s,cur.length?cur.length+" elegidas":"")}<div class="stack" id="multi">${q.opts.map(o=>{const lab=Array.isArray(o)?o[0]:o,em=Array.isArray(o)?o[1]:"";return optBtn(glp(lab),cur.includes(lab)?"sel":"",cur.includes(lab)?I.check:I.circle,lab,em);}).join("")}</div>${cta(C.btn.continuar,'data-act="multi" '+(cur.length?"":"disabled"))}</div>`);
}
function ref(s){
  const r=C.refuerzos[s.key];const key=r.por?A()[r.por]:null;const txt=(r.textos&&r.textos[key])||r.texto;
  const vars={nombre:S.nombre,signo:signo(),cualidades:(A().cualidades||[]).slice(0,2).map(low).join(" y "),energia:low(lbl("energia")),dificultad:low(lbl("dificultad")),motivo:low(lbl("motivo"))};
  const fill=t=>gl(t.replace("{pct}",pct(signo()+(key||""),38,64)).replace(/\{(\w+)\}/g,(m,k)=>vars[k]||""));
  if(NEB){const ri=refImg(s.key);return shell(`<div class="card ref"><h1>${gl(r.titulo)}</h1><p class="muted">${gl(r.literal)}</p>${ri?`<div class="illus has-img"><img src="${ri}" alt="" width="243" height="243"></div>`:`<div class="illus">Ilustración (asset pendiente)</div>`}<div class="spacer"></div>${cta(C.btn.continuar,'data-act="next"')}</div>`);}
  if(C.estricto) return shell(`<div class="card center" style="align-items:center"><h2 style="text-align:left;width:100%">${gl(r.titulo)}</h2><p class="muted" style="text-align:left;width:100%">${gl(r.literal)}</p><div class="canvas-wrap">${canvasHTML(r.progreso,"lg")}<span class="trazo">${r.contador}</span></div>${cta(C.btn.continuar,'data-act="next"')}</div>`);
  return shell(`<div class="card center" style="align-items:center"><div class="canvas-wrap">${canvasHTML(r.progreso,"lg")}<span class="trazo">${r.contador}</span></div><h2>${fill(r.titulo)}</h2><div style="width:100%;text-align:left">${bubble(fill(txt),r.stat?fill(r.stat):"")}</div>${cta(C.btn.continuar,'data-act="next"')}</div>`);
}
function refImg(key){const a=A();if(key==="ref1")return img("ref1");if(key==="ref2")return (IMG.ref2||{})[a.decision]||"";if(key==="ref3")return (IMG.ref3||{})[a.dificultad]||"";return "";}
function visual(s){
  const q=Q[s.key];
  return shell(`<div class="card">${qHead(s)}<div class="visual">${q.opts.map(o=>`<button type="button" data-v="${o[0]}" class="${A()[s.key]===o[0]?"sel":""}">${(IMG.lenguaje||{})[o[0]]?`<div class="ph"><img src="${IMG.lenguaje[o[0]]}" alt="" loading="lazy" width="320" height="240"></div>`:`<div class="ph" style="background:${o[2]||"linear-gradient(135deg,#1B2A6B,#0A1128)"}"><span class="ph-ic">${I.img}</span></div>`}<span>${o[1]}</span></button>`).join("")}</div></div>`);
}
function escala(s){
  const q=Q[s.key];
  const starN=n=>`<svg viewBox="0 0 24 24" fill="currentColor" style="color:#F5D67B"><path d="${["M12 4l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z","M12 3l2.5 6.5H21l-5 4 2 6.5-6-4-6 4 2-6.5-5-4h6.5z","M12 2l3 7h7l-5.5 4.5L18.5 21 12 17l-6.5 4 2-7.5L2 9h7z","M12 2l3.2 7.3 7.8.7-6 5.2 1.8 7.8L12 19l-6.8 4 1.8-7.8-6-5.2 7.8-.7z","M12 1l3.5 7.6 8.5.9-6.5 5.7 2 8.3L12 19.2 4.5 23.5l2-8.3L0 9.5l8.5-.9z"][n-1]}"/></svg>`;
  const th=["👎","👎","🤔","👍","👍"];return shell(`<div class="card">${qHead(s)}<div class="scale">${[1,2,3,4,5].map(n=>`<button type="button" data-v="${n}" aria-label="${n}" class="${A()[s.key]===n?"sel":""}">${NEB?`<span class="em">${th[n-1]}</span>`:starN(n)}</button>`).join("")}</div><div class="scale-lbl"><span>${q.min}</span><span>${q.max}</span></div></div>`);
}
function email(){
  const E=C.emailScr;
  return shell(`<div class="card">${NEB?"":canvasHTML(85,"lg",{seal:E.sello})}<h2>${gl(E.titulo)}</h2><p class="muted">${E.sub}</p>
    <input class="field" id="nm" placeholder="${E.nombrePh}" value="${S.nombre||""}" autocomplete="given-name" maxlength="30">
    <input class="field" id="em" type="email" placeholder="${E.emailPh}" value="${S.lead&&S.lead.email||""}" autocomplete="email" inputmode="email"><p class="hint err" id="emErr"></p>
    ${C.estricto?"":`<div class="chips">${E.chips.map((c,i)=>`<span class="chip">${[I.img,I.file,I.pin][i]}${c}</span>`).join("")}</div>`}
    ${cta(E.cta,'data-act="email"')}<p class="legal">${E.legal}</p></div>`,{noBack:false});
}
function transicion(){
  return `<div class="trans" id="trans"><div class="trans-in"><div class="trans-txt" id="transTxt"></div></div></div>`;
}
function runTransicion(){
  const T=C.transicion;const el=$app.querySelector("#transTxt");let i=0;window.starsFast(true);
  const show=()=>{if(i>=T.length){window.starsFast(false);location.hash="#/resultado";return;}const t=gl(T[i].replace("{nombre}",S.nombre||"").replace("{signo}",signo()));el.innerHTML=t.includes("{logo}")?t.replace("{logo}",`<div class="trans-logo">${brand}</div>`):`<span>${t}</span>`;el.classList.remove("in");el.offsetHeight;el.classList.add("in");i++;setTimeout(show,reduced?300:2300);};
  setTimeout(show,300);
}

/* ---------- interacción ---------- */
$app.addEventListener("click",ev=>{
  const b=ev.target.closest("button");if(!b)return;
  const s=SCREENS[S.step]||{};const act=b.dataset.act;
  if(act==="start"){track("start");pickBurst(b,ev,next);return;}
  if(act==="next"){pickBurst(b,ev,next);return;}
  if(act==="fecha"){const v=readWheels();if(!v.d||!v.m||!v.y)return;A().fecha=v;save();pickBurst(b,ev,next);return;}
  if(act==="multi"){pickBurst(b,ev,next);return;}
  if(act==="email"){emailSubmit(b,ev);return;}
  if(b.dataset.v!==undefined){
    const v=b.dataset.v;
    if(s.id==="q"){A()[s.key]=v;if(s.key==="interes")A().generoRetrato=v==="x"?(A().genero==="m"?"f":"m"):v;if(s.key==="genero"&&!A().generoRetrato)A().generoRetrato=v==="m"?"f":"m";if(s.key==="etnia")A().pelo=["a","b","c"][pct(v+(S.nombre||"n"),0,2)];save();selectAndGo(b,ev,next);return;}
    if(s.id==="visual"){A()[s.key]=v;save();flashCanvas();selectAndGo(b,ev,next);return;}
    if(s.id==="multi"){const cur=A()[s.key]||[];const i=cur.indexOf(v);if(i>=0)cur.splice(i,1);else cur.push(v);A()[s.key]=cur;save();burst(b,ev,6);b.classList.toggle("sel",cur.includes(v));b.querySelector(".ic").outerHTML=cur.includes(v)?I.check:I.circle;$app.querySelector(".cta").disabled=!cur.length;const pill=$app.querySelector(".ppill");if(pill)pill.textContent=`${s.n}/${C.totalPreguntas}${cur.length?" · "+cur.length+" elegidas":""}`;flashCanvas();return;}
    if(s.id==="escala"){A()[s.key]=+v;save();$app.querySelectorAll(".scale button").forEach(x=>x.classList.toggle("sel",x===b));burst(b,ev);setTimeout(next,reduced?0:(NEB?160:180));return;}
  }
});
$app.addEventListener("keydown",ev=>{if(ev.key==="Enter"&&(ev.target.id==="em"||ev.target.id==="nm")){const c=$app.querySelector('[data-act="email"]');if(c)c.click();}});
function flashCanvas(){const c=$app.querySelector(".canvas");if(!c)return;const inner=c.firstElementChild;inner.innerHTML=sketchSVG(sketchParams());c.classList.remove("flash");c.offsetHeight;c.classList.add("flash");}

/* ---------- email ---------- */
function emailSubmit(b,ev){
  const em=$app.querySelector("#em"),nm=$app.querySelector("#nm"),err=$app.querySelector("#emErr");
  const v=em.value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){em.classList.add("err");err.textContent=C.emailScr.error;em.focus();return;}
  em.classList.remove("err");err.textContent="";
  const n=nm.value.trim();S.nombre=n?n.charAt(0).toUpperCase()+n.slice(1):"";
  S.lead={email:v,nombre:S.nombre,signo:signo(),city:S.city,respuestas:A(),t:Date.now()};save();track("lead");
  if(window.NOCTRA_LEAD_WEBHOOK){try{fetch(window.NOCTRA_LEAD_WEBHOOK,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(S.lead)}).catch(()=>{});}catch(e){}}
  pickBurst(b,ev,next);
}

/* ---------- venta ---------- */
function timerLeft(){if(!S.timerStart){S.timerStart=Date.now();save();}return Math.max(0,C.timerMin*60*1000-(Date.now()-S.timerStart));}
function mmss(ms){const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");}
function traits(){const a=A();const p=sketchParams();const en=lbl("energia").split(" ")[0]||"Cálida";const c=(a.cualidades||[])[0]||"Leal";return [C.miradaRasgo[p.mirada]||"Mirada serena",gl(c),`Signo de ${C.elemento[signo()]||"aire"}`];}
function renderSales(){
  if(NEB){renderSalesNebula();return;}
  $app.className="";const V=C.venta;const save_=Math.round((1-C.precio/C.precioAncla)*100);
  const who=S.nombre?`de ${S.nombre}`:"tuyo";const vars={nombre:S.nombre||"",signo:signo(),dificultad:low(lbl("dificultad"))||"conocer a la persona correcta",motivo:low(lbl("motivo"))||"la falta de confianza",g:g("dispuesta","dispuesto","dispueste")};
  const fill=t=>gl(t.replace(/\{(\w+)\}/g,(m,k)=>vars[k]||""));
  const strict=C.estricto;
  const priceCard=`<div class="pricecard"><div class="pc-top">${V.plan}</div>
        ${V.filas.map(f=>`<div class="pc-row"><span>${f[0]}</span><b>${f[1]==="precio"?fmt(C.precio):f[1]==="ancla"?`<s>${fmt(C.precioAncla)}</s>`:f[1]}</b></div>`).join("")}
        <div class="pc-row total"><span>${V.totalHoy}</span><b>${fmt(C.precio)}</b></div>
        ${strict?"":`<div class="pc-save">${V.ahorro.replace("{pct}",save_)}</div>`}</div>`;
  const testis=C.testimonios.map(t=>`<div class="testi"><div class="stars">★★★★★</div><q>${t.q.replace(t.mark,`<mark>${t.mark}</mark>`)}</q><div class="who"><i>${t.who[0]}</i><div><b>${t.who}</b><br><span>${t.since}</span></div><span class="date">${t.when}</span></div></div>`).join("");
  $app.innerHTML=`<div class="sticky"><div class="in"><span class="muted small">${strict?(S.lead&&S.lead.email||""):V.barra+" <b>"+fmt(C.precio)+"</b> · <b id='tm'>"+mmss(timerLeft())+"</b>"}</span><button class="cta sm" data-act="checkout" type="button">${V.cta}</button></div></div>
  <div class="sales">
    <div class="hero tint"><div class="hero-top">${brand}<span class="rating">${I.laurel}<b>${C.landing.badge2[1].split(" ")[0]}</b></span></div><h1>${fill(V.h1)}</h1>
      <div class="benefits">${V.beneficios.map((b,i)=>`<div><span class="bic">${[I.img,I.chat][i]}</span><b>${b[0]}</b><small>${b[1]}</small></div>`).join("")}</div></div>
    <div class="card sec" id="precio"><h2 class="center">${V.accesoTitulo}</h2>${priceCard}<p class="legal" style="text-align:center">${V.legalCorto}</p>${cta(V.cta,'data-act="checkout"')}
      <p class="legal center" id="yapague" style="margin-top:14px"${S.fueAlCheckout?"":" hidden"}><a href="#/gracias">${C.venta.yaPague||"Ya completé el pago · Abrir mi retrato"}</a></p></div>
    <div class="hero-canvas"><h2>${fill(V.sketchTitulo)}</h2>
      <div class="card tint sec" style="width:100%;align-items:center">${canvasHTML(85,"xl",{lock:true})}<div class="cap">${V.sketchCap.replace("{who}",who).replace("{signo}",signo())}</div>
      <div class="traits" style="grid-template-columns:1fr 1fr">${traits().slice(0,2).map((t,i)=>`<div><small>${V.rasgosLbl[i]}</small><b>${t}</b></div>`).join("")}</div>
      <div style="width:100%"><div class="eyebrow">${V.previewLbl}</div><p class="small">${V.previewTxt}</p></div>
      <div style="width:100%"><div class="eyebrow">${V.revelaTitulo}</div><p class="blurline">${V.revelaTexto}</p><div class="lockrow">${I.lock}<span>${V.revelaLock}</span></div></div></div></div>
    <div class="card sec"><h2>${V.masTitulo}</h2><p class="muted">${V.masSub}</p><ul class="list">${V.masItems.map(i=>`<li>${I.star}<span><b>${i[0]}</b> ${i[1]}</span></li>`).join("")}</ul><p class="muted">${V.masCierre}</p></div>
    ${strict?"":`<div class="card sec"><div class="eyebrow">${V.pasEyebrow1}</div><p>${fill(V.pasProblema)}</p><div class="eyebrow" style="margin-top:6px">${V.pasEyebrow2}</div><p>${fill(V.pasAgitacion)}</p><div class="eyebrow" style="margin-top:6px">${V.pasEyebrow3}</div><p>${fill(V.pasSolucion)}</p></div>
    <div class="card sec"><div class="guar"><div class="seal2">${C.garantiaDias}<br>días</div><div><b>${V.garantiaTitulo}</b><br><span class="muted small">${V.garantiaTexto}</span></div></div><div class="steps">${V.pasos.map((p,i)=>`<div><b>${i+1}</b>${p}</div>`).join("")}</div></div>`}
    <div class="card sec"><h2>${V.testiTitulo}</h2>${testis}</div>
    ${strict?"":`<div class="card sec faq"><h2>${V.faqTitulo}</h2>${C.faq.map(f=>`<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("")}</div>`}
    <p class="legal">${C.marca} © ${new Date().getFullYear()} · ${V.footer}</p><p class="legal"><a href="#" onclick="noctraReset();return false">Volver a empezar el test</a></p>
  </div>`;
  if(!strict){const tmEl=$app.querySelector("#tm");const iv=setInterval(()=>{if(!document.contains(tmEl)){clearInterval(iv);return;}const l=timerLeft();tmEl.textContent=l>0?mmss(l):V.timerFin;},1000);exitIntent();}
  $app.querySelectorAll('[data-act="checkout"]').forEach(b=>b.onclick=ev=>irACheckout(b,ev));
  track("resultado");
}
function retratoImg(full){const r=IMG.retrato;if(!r)return "";const g=A().generoRetrato||"m";return full?(r[g+"Full"]||r[g]):r[g];}
function renderSalesNebula(){
  $app.className="";const V=C.venta;const d=new Date(Date.now()+C.diasPrueba*864e5);const fecha=d.toISOString().slice(0,10);
  const rep=s=>s.replace(/\{precioHoy\}/g,fmt(C.precioHoy)).replace(/\{precioMes\}/g,fmt(C.precioMes)).replace(/\{dias\}/g,C.diasPrueba).replace(/\{fecha\}/g,fecha);
  const en=lbl("energia");const vibe={carinosa:"Cálida y cariñosa",calma:"Serena y estable",juguetona:"Alegre y liviana",aventurera:"Libre y aventurera",equilibrada:"Equilibrada y contenedora",apasionada:"Intensa e inspiradora"}[A().energia]||"Cálida y cariñosa";
  const trait=(A().cualidades||[])[0]||"Espíritu creativo";
  const testis=C.testimonios.map(t=>`<div class="testi"><div class="who"><i>${t.who.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</i><div><b>${t.who}</b><span class="date">${t.when}</span></div></div><q>${t.q}</q></div>`).join("");
  $app.innerHTML=`<div class="sticky"><div class="in">${brand}<button class="cta sm pulse" data-act="checkout" type="button">${V.cta}</button></div></div>
  <div class="sales">
    <div class="hero"><div class="hero-top">${brand}<span class="rating">${I.laurel}<b>${C.landing.badge2[1].split(" ")[0]}</b></span></div><h1>${V.h1}</h1>
      <div class="benefits">${V.beneficios.map((b,i)=>`<div><span class="bic">${[I.img,I.chat][i]}</span><b>${b[0]}</b><small>${b[1]}</small></div>`).join("")}</div></div>
    <div class="sec" id="precio"><h2 class="center">${V.accesoTitulo}</h2>
      <div class="pricecard"><div class="pc-top"></div><h3>${V.plan}</h3>
        ${V.filas.map(f=>`<div class="pc-row"><span>${rep(f[0])}</span><b>${f[1]==="precioHoy"?fmt(C.precioHoy):fmt(C.precioMes)}</b></div>`).join("")}${V.notaMoneda?`<div class="pc-nota">${V.notaMoneda}</div>`:""}</div>
      <div class="legalbox">${rep(V.legalCorto)}</div>
      ${cta(V.cta,'data-act="checkout" class="cta pulse"')}
      <p class="legal center" id="yapague" style="margin-top:14px"${S.fueAlCheckout?"":" hidden"}><a href="#/gracias">${C.venta.yaPague||"Ya completé el pago · Abrir mi retrato"}</a></p></div>
    <div class="sec"><h1>${V.sketchTitulo}</h1><div class="sketchcard"><div class="sk-img">${retratoImg()?`<img class="sk-photo" src="${retratoImg()}" alt="" width="478" height="399">`:`<div class="sk-blur">${sketchSVG(sketchParams())}</div>`}</div>
      <div class="sk-row"><div><small>${V.rasgosLbl[0]}</small><b>${vibe}</b></div><div><small>${V.rasgosLbl[1]}</small><b>${gl(trait)}</b></div></div>
      <small class="muted">${V.previewLbl}</small><p>${V.previewTxt}</p>
      <div class="sk-lock"><small class="muted">${V.revelaTitulo}</small><p class="blurtxt">${V.revelaTexto}</p><span class="lockic">${I.lock}</span></div></div></div>
    <div class="sec"><h2>${V.masTitulo}</h2><p class="muted">${V.masSub}</p><ul class="list ${IMG.mas?"with-ic":""}">${V.masItems.map((i,k)=>`<li>${IMG.mas&&IMG.mas[k]?`<span class="lic"><img src="${IMG.mas[k]}" alt="" width="40" height="40"></span>`:""}<span><b>${i[0]}</b> ${i[1]}</span></li>`).join("")}${IMG.mas&&IMG.mas[5]?`<li class="cierre"><span class="lic"><img src="${IMG.mas[5]}" alt="" width="40" height="40"></span><span>${V.masCierre}</span></li>`:""}</ul>${IMG.mas&&IMG.mas[5]?"":`<p>${V.masCierre}</p>`}</div>
    <div class="sec"><h2>${V.testiTitulo}</h2>${testis}</div>
    <p class="legal">${V.footer}</p>
  </div>`;
  $app.querySelectorAll('[data-act="checkout"]').forEach(b=>b.onclick=ev=>irACheckout(b,ev));
  track("resultado");
}
function renderThanks(){
  $app.className="";const G=C.gracias;
  $app.innerHTML=`<section class="screen"><div class="topbar" style="justify-content:center">${brand}</div><div class="card center" style="align-items:center">
    <div class="canvas xl reveal" style="border-width:2px"><div style="width:100%;height:100%">${NEB&&retratoImg(true)?`<img class="sk-photo" src="${retratoImg(true)}" alt="" style="width:100%;height:100%;object-fit:cover">`:sketchSVG(sketchParams())}</div>${S.nombre?`<span class="sign">${S.nombre}</span>`:""}</div>
    <h2 class="gtitle">${G.titulo.replace("{nombre}",S.nombre?", "+S.nombre:"")}</h2><p class="muted">${G.sub}</p>
    <p><b>${G.pregunta}</b></p><div class="feedback" style="width:100%"><button class="opt yes" data-f="si" type="button"><span class="lbl" style="text-align:center">Sí</span></button><button class="opt ghost no" data-f="algo" type="button"><span class="lbl" style="text-align:center">Algo</span></button><button class="opt ghost no" data-f="no" type="button"><span class="lbl" style="text-align:center">No</span></button></div>
    <p class="hint" id="fbHint"></p>
    ${cta(G.cta,'data-act="app"')}
    <p class="legal"><a href="#" onclick="noctraReset();return false">Volver a empezar el test</a></p>
  </div></section>`;
  setTimeout(()=>{for(let i=0;i<24;i++){const p=document.createElement("span");p.className="pt";const a=Math.random()*6.28,d=80+Math.random()*120;p.style.cssText=`left:50%;top:38%;background:${i%2?"#F5D67B":"#fff"};--tx:${Math.cos(a)*d}px;--ty:${Math.sin(a)*d}px;animation-duration:1.2s`;document.body.appendChild(p);setTimeout(()=>p.remove(),1300);}},reduced?0:2600);
  $app.querySelectorAll("[data-f]").forEach(b=>b.onclick=ev=>{burst(b,ev);track("familiar_"+b.dataset.f);$app.querySelector("#fbHint").textContent=G.respuestas[b.dataset.f];});
  $app.querySelector('[data-act="app"]').onclick=ev=>{burst(ev.currentTarget,ev);track("abrir_app");setTimeout(()=>{location.href="app/";},260);};
}
function modal(html,onPick){
  $ov.innerHTML=`<div class="card modal">${html}</div>`;$ov.classList.add("on");
  $ov.onclick=ev=>{const b=ev.target.closest("button");if(!b){if(ev.target===$ov){$ov.classList.remove("on");}return;}if(b.classList.contains("x")){$ov.classList.remove("on");onPick&&onPick(null);return;}if(b.dataset.m!==undefined){burst(b,ev);setTimeout(()=>{$ov.classList.remove("on");onPick&&onPick(b.dataset.m);},reduced?0:300);}};
}
function exitIntent(){
  if(S.exitShown)return;let idle;const X=C.exit;const show=()=>{if(S.exitShown||location.hash!=="#/resultado")return;S.exitShown=true;save();track("exit_intent");
    modal(`<button class="x" type="button">✕</button><h3 style="margin:6px 0 10px">${X.titulo.replace("{nombre}",S.nombre?", "+S.nombre:"")}</h3><p class="muted" style="margin-bottom:14px">${X.texto}</p>${cta(X.cta,'data-m="ok"')}`,()=>{});};
  document.addEventListener("mouseleave",e=>{if(e.clientY<=0)show();});
  const reset=()=>{clearTimeout(idle);idle=setTimeout(show,25000);};["scroll","touchstart","click","keydown"].forEach(e=>addEventListener(e,reset,{passive:true}));reset();
}

/* ---------- arranque ---------- */
addEventListener("hashchange",render);
try{fetch("https://get.geojs.io/v1/ip/geo.json").then(r=>r.json()).then(d=>{if(d&&d.city){S.city=d.city;save();}}).catch(()=>{});}catch(e){}
window.noctraReset=function(){localStorage.removeItem(KEY);location.hash="";location.reload();};
if(new URLSearchParams(location.search).get("reset")==="1"||location.hash==="#reset"){localStorage.removeItem(KEY);S={step:0,a:{},nombre:"",city:"",lead:null,timerStart:null,ev:[]};history.replaceState(null,"",location.pathname);}
if(location.hash&&!A().experiencias&&location.hash!=="#/gracias"){location.hash="";}
render();
})();
