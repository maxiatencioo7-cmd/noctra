/* Noctra app — si el perfil no llegó, se piden las respuestas acá adentro.
   Las preguntas y las opciones se leen del mismo archivo que usa el quiz
   (../js/content.nebula.js), así nunca se desincronizan los textos. */
(function(){
const U=window.NOCTRA_UI, I=U.I, esc=U.esc;
const KEY="noctra_v2";
const MULTI=["cualidades","futuro"];
const PASOS=[
  {k:"genero"},{k:"interes"},{k:"edad"},{k:"etnia"},{k:"fecha"},
  {k:"cualidades"},{k:"apariencia"},{k:"decision"},{k:"motivo"},{k:"dificultad"},
  {k:"lenguaje"},{k:"futuro"},{k:"energia"},{k:"opuestos"},{k:"experiencias"}
];

function cargarContenido(){
  return new Promise((ok,err)=>{
    if(window.NOCTRA&&window.NOCTRA.preguntas) return ok(window.NOCTRA);
    const s=document.createElement("script");
    s.src="../js/content.nebula.js";
    s.onload=()=>window.NOCTRA&&window.NOCTRA.preguntas?ok(window.NOCTRA):err();
    s.onerror=err;
    document.head.appendChild(s);
  });
}

function abrir(){
  cargarContenido().then(pintar).catch(()=>{
    U.toast("No se pudieron cargar las preguntas. Probá de nuevo en un momento.");
  });
}

function pintar(C){
  const Q=C.preguntas, MESES=C.meses;
  const R={};                       // respuestas
  let i=0;

  const caja=document.createElement("div");
  caja.id="preg";
  caja.style.cssText="position:fixed;inset:0;z-index:95;background:radial-gradient(120% 80% at 50% 10%,#131C3E 0%,#080B18 55%,#04060D 100%);overflow:auto;-webkit-overflow-scrolling:touch";
  document.body.appendChild(caja);

  const barra=n=>`<div style="display:flex;gap:5px;justify-content:center;margin:0 0 26px">${
    PASOS.map((_,k)=>`<i style="display:block;width:${k===n?18:6}px;height:6px;border-radius:99px;background:${k<n?"rgba(245,214,123,.55)":k===n?"var(--oro)":"rgba(255,255,255,.14)"};transition:all .25s"></i>`).join("")}</div>`;

  function paso(){
    const p=PASOS[i], q=Q[p.k]||{};
    let cuerpo="";

    if(p.k==="fecha"){
      const hoy=new Date().getFullYear();
      const sel=(id,desde,hasta,val,fmt)=>{let o="";for(let v=desde;v<=hasta;v++)o+=`<option value="${v}" ${v===val?"selected":""}>${fmt?fmt(v):v}</option>`;
        return `<select id="${id}" style="flex:1">${o}</select>`;};
      cuerpo=`<div class="fila" style="gap:8px">
        ${sel("fd",1,31,15)}
        ${sel("fm",1,12,6,v=>MESES[v-1])}
        ${sel("fy",1940,hoy-16,1995)}
      </div>`;
    }
    else if(p.k==="opuestos"){
      cuerpo=`<div style="display:flex;gap:8px;justify-content:space-between;margin:0 0 12px">
        ${[1,2,3,4,5].map(v=>`<button class="pill" data-v="${v}" style="flex:1;justify-content:center;font-size:17px;font-weight:700">${v}</button>`).join("")}
      </div>
      <div style="display:flex;justify-content:space-between"><span class="small muted">${esc(q.min||"")}</span><span class="small muted">${esc(q.max||"")}</span></div>`;
    }
    else{
      const multi=MULTI.indexOf(p.k)>=0;
      cuerpo=(q.opts||[]).map(o=>{
        const val=o[0];
        const lab=multi?o[0]:(o[1]!=null?o[1]:o[0]);
        const em=multi?o[1]:o[2];
        const emoji=(typeof em==="string"&&em.indexOf("gradient")<0)?em:"";
        return `<button class="pill" data-v="${esc(val)}" style="width:100%;justify-content:flex-start;margin:0 0 9px;padding:15px 16px;font-size:15px;text-align:left;white-space:normal">
          <span style="width:22px;display:inline-block">${emoji}</span><span>${esc(lab)}</span></button>`;
      }).join("");
    }

    caja.innerHTML=`<div style="max-width:520px;margin:0 auto;padding:calc(34px + env(safe-area-inset-top)) 22px 40px">
      ${barra(i)}
      <h2 style="margin:0 0 6px;font-size:23px;line-height:30px">${esc(q.titulo||"")}</h2>
      ${q.sub?`<p class="muted small" style="margin:0 0 18px">${esc(q.sub)}</p>`:`<div style="height:18px"></div>`}
      ${cuerpo}
      <div id="pie" style="margin:22px 0 0"></div>
      ${i>0?`<button class="pill" id="atras" style="margin:16px auto 0;display:flex">${I.atras} Volver</button>`:""}
    </div>`;
    caja.scrollTop=0;

    const multi=MULTI.indexOf(p.k)>=0;
    const pie=caja.querySelector("#pie");

    if(p.k==="fecha"){
      pie.innerHTML=`<button class="btn" id="seguir">Continuar</button>`;
      pie.querySelector("#seguir").onclick=()=>{
        R.fecha={d:+caja.querySelector("#fd").value,m:+caja.querySelector("#fm").value,y:+caja.querySelector("#fy").value};
        avanzar();
      };
    }
    else if(multi){
      R[p.k]=R[p.k]||[];
      pie.innerHTML=`<button class="btn" id="seguir" ${R[p.k].length?"":"disabled"}>Continuar</button>`;
      const btn=pie.querySelector("#seguir");
      caja.querySelectorAll("[data-v]").forEach(b=>{
        if(R[p.k].indexOf(b.dataset.v)>=0) b.classList.add("on");
        b.onclick=()=>{
          const k=R[p.k], j=k.indexOf(b.dataset.v);
          if(j>=0)k.splice(j,1); else k.push(b.dataset.v);
          b.classList.toggle("on");
          btn.disabled=!k.length;
        };
      });
      btn.onclick=avanzar;
    }
    else{
      caja.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{
        R[p.k]=p.k==="opuestos"?+b.dataset.v:b.dataset.v;
        b.classList.add("on");
        setTimeout(avanzar,150);
      });
    }

    const atras=caja.querySelector("#atras");
    if(atras) atras.onclick=()=>{ i=Math.max(0,i-1); paso(); };
  }

  function avanzar(){
    i++;
    if(i<PASOS.length) return paso();
    guardar();
  }

  function guardar(){
    const a=Object.assign({},R);
    a.generoRetrato = a.interes==="x" ? (a.genero==="m"?"f":"m") : (a.interes||(a.genero==="m"?"f":"m"));
    a.pelo="a";
    let s={}; try{ s=JSON.parse(localStorage.getItem(KEY))||{}; }catch(e){}
    s.a=Object.assign({},s.a||{},a);
    try{ localStorage.setItem(KEY,JSON.stringify(s)); }catch(e){}
    caja.innerHTML=`<div style="max-width:420px;margin:0 auto;padding:120px 24px;text-align:center">
      <div style="color:var(--oro);display:flex;justify-content:center;margin:0 0 18px">${I.estrella}</div>
      <h2 style="margin:0 0 10px">Listo</h2>
      <p class="muted">Ya tengo tus respuestas.</p></div>`;
    setTimeout(()=>location.reload(),1100);
  }

  paso();
}

window.NOCTRA_PREGUNTAS={abrir:abrir};
})();
