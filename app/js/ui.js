/* Noctra app — íconos de línea, cielo vivo y utilidades de interfaz. */
(function(){
const s=(d,extra)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"${extra||""}>${d}</svg>`;
const I={
  retrato:s('<rect x="4.2" y="3" width="15.6" height="18" rx="2.4"/><circle cx="12" cy="9.6" r="2.9"/><path d="M7.1 17.9a5.2 5.2 0 0 1 9.8 0"/>'),
  lectura:s('<path d="M4 5.2A2 2 0 0 1 6 3.2h4.6a1.4 1.4 0 0 1 1.4 1.4v14.8a1.2 1.2 0 0 0-1.2-1.2H6a2 2 0 0 1-2-2z"/><path d="M20 5.2a2 2 0 0 0-2-2h-4.6A1.4 1.4 0 0 0 12 4.6v14.8a1.2 1.2 0 0 1 1.2-1.2H18a2 2 0 0 0 2-2z"/>'),
  encuentro:s('<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4v2M12 18.6v2M3.4 12h2M18.6 12h2"/><path d="m9.2 14.8 1.6-4 4-1.6-1.6 4z"/>'),
  diario:s('<path d="M6.5 3.4h11a1.6 1.6 0 0 1 1.6 1.6v14a1.6 1.6 0 0 1-1.6 1.6h-11A1.6 1.6 0 0 1 4.9 19V5a1.6 1.6 0 0 1 1.6-1.6z"/><path d="M4.9 8h14.2M8.4 3.4v3.2"/><path d="M8.4 12.4h7M8.4 16h4.4"/>'),
  maia:s('<path d="M20 12.6a7.6 7.6 0 0 1-11.2 6.7L4.4 20.6l1.3-4.3A7.6 7.6 0 1 1 20 12.6z"/><path d="M12 8.4v.1M9.6 12.2c.6 1 1.4 1.5 2.4 1.5s1.8-.5 2.4-1.5"/>'),
  estrella:s('<path d="M12 3.2c.6 4.6 1.9 5.9 6.5 6.5-4.6.6-5.9 1.9-6.5 6.5-.6-4.6-1.9-5.9-6.5-6.5 4.6-.6 5.9-1.9 6.5-6.5z" fill="currentColor" stroke="none"/><path d="M18.4 16.2c.3 2.1.9 2.7 3 3-2.1.3-2.7.9-3 3-.3-2.1-.9-2.7-3-3 2.1-.3 2.7-.9 3-3z" fill="currentColor" stroke="none" opacity=".6"/>'),
  descarga:s('<path d="M12 3.6v11.2M8 11l4 4 4-4"/><path d="M4.4 17v1.8a2 2 0 0 0 2 2h11.2a2 2 0 0 0 2-2V17"/>'),
  compartir:s('<circle cx="17.6" cy="5.8" r="2.6"/><circle cx="6.4" cy="12" r="2.6"/><circle cx="17.6" cy="18.2" r="2.6"/><path d="m8.7 10.7 6.6-3.6M8.7 13.3l6.6 3.6"/>'),
  info:s('<circle cx="12" cy="12" r="8.6"/><path d="M12 11.2v5M12 8.2v.1"/>'),
  ojo:s('<path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12z"/><circle cx="12" cy="12" r="2.7"/>'),
  mano:s('<path d="M9 11V5.4a1.4 1.4 0 1 1 2.8 0V11M11.8 10.6V4.4a1.4 1.4 0 1 1 2.8 0v6.2M14.6 11V6.4a1.4 1.4 0 1 1 2.8 0v7.2c0 4-2.4 7-6.2 7-2.6 0-4-1.2-5.4-3.6l-2-3.5a1.4 1.4 0 0 1 2.3-1.6l1.7 2.1"/>'),
  luna:s('<path d="M20 14.4A8.4 8.4 0 0 1 9.6 4 8.4 8.4 0 1 0 20 14.4z"/>'),
  cal:s('<rect x="3.6" y="5" width="16.8" height="15.4" rx="2"/><path d="M3.6 9.6h16.8M8.2 3.4v3.2M15.8 3.4v3.2"/>'),
  corazon:s('<path d="M12 20s-7.4-4.6-7.4-9.4A4.2 4.2 0 0 1 12 8.2a4.2 4.2 0 0 1 7.4 2.4C19.4 15.4 12 20 12 20z"/>'),
  mas:s('<path d="M12 5.4v13.2M5.4 12h13.2"/>'),
  buscar:s('<circle cx="11" cy="11" r="6.6"/><path d="m16 16 4 4"/>'),
  cerrar:s('<path d="m6.4 6.4 11.2 11.2M17.6 6.4 6.4 17.6"/>'),
  atras:s('<path d="M14.6 5.4 8 12l6.6 6.6"/>'),
  enviar:s('<path d="M20.4 3.6 3.6 10.2l6.6 2.6 2.6 6.6z"/><path d="m10.2 12.8 4.6-4.6"/>'),
  check:s('<path d="M4.6 12.6 9.4 17.4 19.4 6.6"/>'),
  fuego:s('<path d="M12 3.4S7.4 7.6 7.4 12.4a4.6 4.6 0 0 0 9.2 0c0-2-1.2-3.6-1.2-3.6s-.8 1.6-1.8 1.6c-1.4 0-1.6-2-1.6-3.4 0-1.6 0-3.6 0-3.6z"/>'),
  reloj:s('<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3 1.8"/>'),
  pdf:s('<path d="M13.4 3.4H7a2 2 0 0 0-2 2v13.2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13.4 3.4V9H19"/><path d="M9 13.4h6M9 16.6h4"/>'),
  usuario:s('<circle cx="12" cy="8.4" r="3.8"/><path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0"/>'),
  campana:s('<path d="M18 9.4a6 6 0 1 0-12 0c0 5.2-2.2 6.6-2.2 6.6h16.4S18 14.6 18 9.4z"/><path d="M13.7 19.4a2 2 0 0 1-3.4 0"/>'),
  papel:s('<rect x="4" y="3.4" width="16" height="17.2" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>')
};

/* luna dibujada según fase (0..1): 0 nueva, .25 creciente, .5 llena, .75 menguante */
function lunaSVG(f,size){
  size=size||20;
  const r=9.4,cx=12,cy=12;
  f=((f%1)+1)%1;
  let d;
  if(f<0.02||f>0.98){
    d=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".5"/>`;
  }else if(Math.abs(f-0.5)<0.02){
    d=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor"/>`;
  }else{
    const crece=f<0.5;
    const e=Math.max(0.4,r*Math.abs(Math.cos(2*Math.PI*f)));
    const fuera=crece?1:0;
    const dentro=crece?(f<0.25?0:1):(f>0.75?1:0);
    d=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".24"/>`
     +`<path d="M ${cx} ${cy-r} A ${r} ${r} 0 0 ${fuera} ${cx} ${cy+r} A ${e} ${r} 0 0 ${dentro} ${cx} ${cy-r} Z" fill="currentColor"/>`;
  }
  return `<svg class="lm" viewBox="0 0 24 24" style="width:${size}px;height:${size}px" aria-hidden="true">${d}</svg>`;
}

/* ---------- cielo vivo ---------- */
function cielo(canvas){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx=canvas.getContext("2d");
  let W=0,H=0,dpr=Math.min(devicePixelRatio||1,2),estrellas=[],nebulosas=[],fugaz=null,raf=0,t0=performance.now(),vivo=true;
  function medir(){
    W=canvas.clientWidth;H=canvas.clientHeight;
    canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    estrellas=[];for(let i=0;i<140;i++)estrellas.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.25+.28,a:Math.random(),v:.0006+Math.random()*.0016,d:.004+Math.random()*.010});
    nebulosas=[{x:W*.18,y:H*.16,r:W*.62,c:"22,44,96",a:.30},{x:W*.86,y:H*.42,r:W*.55,c:"58,32,86",a:.20},{x:W*.42,y:H*.88,r:W*.7,c:"14,36,74",a:.24}];
  }
  function pinta(now){
    const dt=now-t0;t0=now;
    ctx.clearRect(0,0,W,H);
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"#080C1C");g.addColorStop(.55,"#05070F");g.addColorStop(1,"#04060D");
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    nebulosas.forEach((n,i)=>{
      if(!reduce){n.x+=Math.sin(now/26000+i)*0.02;n.y+=Math.cos(now/31000+i)*0.014;}
      const rg=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
      rg.addColorStop(0,`rgba(${n.c},${n.a})`);rg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=rg;ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,7);ctx.fill();
    });
    for(const e of estrellas){
      if(!reduce){e.a+=e.d;if(e.a>1||e.a<.12)e.d*=-1;e.y-=e.v*dt;if(e.y<-2)e.y=H+2;}
      const al=.28+e.a*.62;
      ctx.fillStyle=e.r>1.05?`rgba(214,232,255,${al})`:`rgba(245,240,225,${al*.85})`;
      ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,7);ctx.fill();
    }
    if(!reduce){
      if(!fugaz&&Math.random()<dt/40000) fugaz={x:Math.random()*W*.7,y:Math.random()*H*.4,l:0};
      if(fugaz){
        fugaz.l+=dt*.55;const L=Math.min(fugaz.l,130);
        const gg=ctx.createLinearGradient(fugaz.x,fugaz.y,fugaz.x+L,fugaz.y+L*.42);
        gg.addColorStop(0,"rgba(255,255,255,0)");gg.addColorStop(1,"rgba(230,242,255,.85)");
        ctx.strokeStyle=gg;ctx.lineWidth=1.5;ctx.beginPath();
        ctx.moveTo(fugaz.x,fugaz.y);ctx.lineTo(fugaz.x+L,fugaz.y+L*.42);ctx.stroke();
        fugaz.x+=dt*.30;fugaz.y+=dt*.126;
        if(fugaz.x>W+140)fugaz=null;
      }
    }
    if(vivo)raf=requestAnimationFrame(pinta);
  }
  function arranca(){if(!raf){t0=performance.now();vivo=true;raf=requestAnimationFrame(pinta);}}
  function para(){vivo=false;cancelAnimationFrame(raf);raf=0;}
  medir();arranca();
  addEventListener("resize",()=>{medir();},{passive:true});
  document.addEventListener("visibilitychange",()=>{document.hidden?para():arranca();});
  if(reduce){/* un solo cuadro */ setTimeout(para,60);}
}

/* ---------- hoja inferior ---------- */
let $hoja;
function hoja(html){
  if(!$hoja){
    $hoja=document.createElement("div");$hoja.className="hoja";
    $hoja.innerHTML='<div class="fondo"></div><div class="panel"></div>';
    document.body.appendChild($hoja);
    $hoja.querySelector(".fondo").onclick=cerrarHoja;
  }
  $hoja.querySelector(".panel").innerHTML='<div class="asa"></div>'+html;
  $hoja.classList.add("on");
  $hoja.querySelector(".panel").scrollTop=0;
  $hoja.querySelectorAll("[data-cerrar]").forEach(b=>b.onclick=cerrarHoja);
  return $hoja.querySelector(".panel");
}
function cerrarHoja(){ if($hoja) $hoja.classList.remove("on"); }

/* ---------- partículas del revelado ---------- */
function chispas(ms){
  const c=document.createElement("canvas");c.id="chispas";document.body.appendChild(c);
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=innerWidth*dpr;c.height=innerHeight*dpr;c.style.width=innerWidth+"px";c.style.height=innerHeight+"px";
  const x=c.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);
  const P=[];for(let i=0;i<90;i++)P.push({x:innerWidth/2+(Math.random()-.5)*innerWidth*.55,y:innerHeight*.42+(Math.random()-.5)*160,
    vx:(Math.random()-.5)*1.5,vy:-Math.random()*2.2-.4,g:.028+Math.random()*.02,r:Math.random()*2.1+.7,
    c:Math.random()<.62?"245,214,123":"143,211,255",a:1});
  const t0=performance.now();
  (function f(now){
    const e=now-t0;x.clearRect(0,0,innerWidth,innerHeight);
    P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.a=Math.max(0,1-e/(ms||2400));
      x.fillStyle=`rgba(${p.c},${p.a})`;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill();});
    if(e<(ms||2400))requestAnimationFrame(f);else c.remove();
  })(t0);
}

const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const fechaCorta=d=>`${d.getDate()} ${MESES[d.getMonth()].slice(0,3)}`;
const fechaLarga=d=>`${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;

function toast(txt){
  let t=document.querySelector(".toast");
  if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t);
    t.style.cssText="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--tabs) + 22px);z-index:95;background:#0A1128;border:1px solid var(--linea);color:#F4F6FB;padding:12px 18px;border-radius:999px;font-size:14px;box-shadow:var(--sombra);opacity:0;transition:opacity .2s";}
  t.textContent=txt;requestAnimationFrame(()=>t.style.opacity="1");
  clearTimeout(t._t);t._t=setTimeout(()=>{t.style.opacity="0";},2200);
}

window.NOCTRA_UI={I,lunaSVG,cielo,hoja,cerrarHoja,chispas,esc,MESES,DIAS,fechaCorta,fechaLarga,toast};
})();
