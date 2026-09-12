/* Noctra — la pantalla del dibujo.
   No se pregunta nada: el test ya definió a quién buscás (género, franja de
   edad, origen) y con eso alcanza para elegir la cara. Se entra directo al
   dibujo y de ahí al botón de revelar. */
(function(){
const U=window.NOCTRA_UI, I=U.I, esc=U.esc;

/* ---------- la pantalla del dibujo ---------- */
/* Un cielo propio (no el del fondo de la app) con nebulosa, polvo de
   estrellas y una constelación que se va trazando. Debajo, el retrato
   revelándose en negativo mientras se dibuja. Al terminar, el botón. */
const FRASES=[
  "Leyendo lo que dejaste escrito",
  "Buscando la forma del rostro",
  "Marcando los ojos y la mirada",
  "Trabajando el trazo del pelo",
  "Ajustando la luz sobre la cara",
  "Firmando el papel"
];
const DURACION=10200;

function dibujar(retrato, alRevelar){
  const d=document.createElement("div");
  d.id="dibujo";
  d.innerHTML=`
    <canvas class="dcielo"></canvas>
    <div class="dneb n1"></div><div class="dneb n2"></div><div class="dneb n3"></div>
    <div class="dwrap">
      <div class="dmarco">
        <img src="${esc(retrato)}" alt="" aria-hidden="true">
        <span class="dbarrido"></span>
      </div>
      <div class="danillo">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle class="pista" cx="60" cy="60" r="54"/>
          <circle class="arco"  cx="60" cy="60" r="54"/>
        </svg>
        <b class="dpct">0<i>%</i></b>
      </div>
      <p class="dfrase">${esc(FRASES[0])}</p>
      <p class="dnota muted small">No cierres esta pantalla. Tarda unos segundos.</p>
      <button class="btn drevelar" hidden>${I.estrella} Revelar retrato</button>
    </div>`;
  document.body.appendChild(d);

  const quieto=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paraCielo=quieto?function(){}:cielo(d.querySelector(".dcielo"));

  const arco=d.querySelector(".arco");
  const largo=2*Math.PI*54;
  arco.style.strokeDasharray=largo;
  arco.style.strokeDashoffset=largo;

  const pct=d.querySelector(".dpct"), frase=d.querySelector(".dfrase"),
        img=d.querySelector(".dmarco img"), btn=d.querySelector(".drevelar"),
        nota=d.querySelector(".dnota");

  const t0=performance.now();
  let ultima=-1, corriendo=true;

  function suave(x){ return x<.5 ? 2*x*x : 1-Math.pow(-2*x+2,2)/2; }

  function tic(t){
    if(!corriendo) return;
    const p=Math.min(1,(t-t0)/DURACION);
    const e=suave(p);
    arco.style.strokeDashoffset=largo*(1-e);
    pct.firstChild.nodeValue=String(Math.round(e*100));
    /* nunca baja de 14px de desenfoque: el revelado tiene que seguir siendo un revelado */
    img.style.filter="blur("+(34-18*e).toFixed(1)+"px) sepia(.3) contrast("+(1+(1-e)*.35).toFixed(2)+")";
    img.style.opacity=(0.12+0.50*e).toFixed(3);

    const idx=Math.min(FRASES.length-1,Math.floor(p*FRASES.length));
    if(idx!==ultima){
      ultima=idx;
      frase.classList.remove("on");
      setTimeout(()=>{ frase.textContent=FRASES[idx]; frase.classList.add("on"); },160);
    }
    if(p<1) requestAnimationFrame(tic); else listo();
  }

  function listo(){
    corriendo=false;
    d.classList.add("listo");
    frase.textContent="Tu retrato está terminado";
    frase.classList.add("on");
    nota.textContent="Tocá para verlo.";
    btn.hidden=false;
    if(navigator.vibrate) try{ navigator.vibrate([14,60,14]); }catch(e){}
    U.chispas && U.chispas(1800);
  }

  btn.onclick=()=>{
    btn.disabled=true;
    d.classList.add("salir");
    setTimeout(()=>{ paraCielo(); d.remove(); alRevelar(); },420);
  };

  if(quieto){ DURACION_corto(); } else requestAnimationFrame(tic);
  function DURACION_corto(){ setTimeout(()=>{ arco.style.strokeDashoffset=0; pct.firstChild.nodeValue="100"; img.style.filter="blur(16px) sepia(.3)"; img.style.opacity=".62"; listo(); },1200); }
}

/* Cielo del momento del dibujo: estrellas a la deriva y una constelación
   que se traza sola. Devuelve la función para frenarlo. */
function cielo(cv){
  const cx=cv.getContext("2d");
  let w=0,h=0,dpr=Math.min(2,devicePixelRatio||1),raf=0,vivo=true;
  let est=[], lin=[], t0=performance.now();

  function medir(){
    w=cv.clientWidth; h=cv.clientHeight;
    cv.width=w*dpr; cv.height=h*dpr; cx.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.min(190,Math.round(w*h/7000));
    est=[];
    for(let i=0;i<n;i++) est.push({
      x:Math.random()*w, y:Math.random()*h,
      r:Math.random()*1.5+.25, a:Math.random()*.65+.15,
      v:Math.random()*.9+.12, f:Math.random()*6.28, d:Math.random()*.035+.006
    });
    /* constelación: puntos sueltos que después se unen en orden */
    lin=[];
    const cxm=w/2, cym=h*0.17, rad=Math.min(w,h)*0.30;
    for(let i=0;i<7;i++){
      const ang=-1.5+i*0.78+Math.sin(i*2.1)*0.22;
      const rr=rad*(0.62+((i*37)%53)/53*0.5);
      lin.push({x:cxm+Math.cos(ang)*rr, y:cym+Math.abs(Math.sin(ang))*rr*0.42});
    }
  }

  function paso(t){
    if(!vivo) return;
    const dt=(t-t0)/1000;
    cx.clearRect(0,0,w,h);

    /* polvo */
    for(const s of est){
      s.y-=s.v*0.16; if(s.y<-4){ s.y=h+4; s.x=Math.random()*w; }
      const br=s.a*(0.55+0.45*Math.sin(t*s.d*0.06+s.f));
      cx.globalAlpha=br;
      cx.fillStyle= s.r>1.15 ? "#F5D67B" : "#EAF0FF";
      cx.beginPath(); cx.arc(s.x,s.y,s.r,0,6.2832); cx.fill();
    }

    /* constelación trazándose, en bucle lento */
    const ciclo=(dt%14)/14;
    const avance=Math.max(0,Math.min(1,(ciclo-0.08)/0.55));
    const total=lin.length-1;
    cx.globalAlpha=0.5*(ciclo>0.85?(1-(ciclo-0.85)/0.15):1);
    cx.strokeStyle="rgba(245,214,123,.55)"; cx.lineWidth=1; cx.lineCap="round";
    cx.beginPath();
    for(let i=0;i<total;i++){
      const f=Math.max(0,Math.min(1,avance*total-i));
      if(f<=0) break;
      const a=lin[i], b=lin[i+1];
      cx.moveTo(a.x,a.y);
      cx.lineTo(a.x+(b.x-a.x)*f, a.y+(b.y-a.y)*f);
    }
    cx.stroke();
    lin.forEach((p,i)=>{
      const vis=avance*total>=i-0.2;
      if(!vis) return;
      cx.globalAlpha=0.85*(ciclo>0.85?(1-(ciclo-0.85)/0.15):1);
      cx.fillStyle="#F5D67B";
      cx.beginPath(); cx.arc(p.x,p.y,1.7,0,6.2832); cx.fill();
    });

    cx.globalAlpha=1;
    raf=requestAnimationFrame(paso);
  }

  medir(); addEventListener("resize",medir);
  raf=requestAnimationFrame(paso);
  return function(){ vivo=false; cancelAnimationFrame(raf); removeEventListener("resize",medir); };
}

window.NOCTRA_RASGOS={ dibujar:dibujar };
})();
