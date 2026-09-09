/* Noctra — app. Cinco pestañas, revelado, lectura, encuentro, diario, Maia. */
(function(){
const AS=window.NOCTRA_ASTRO, DT=window.NOCTRA_DATOS, LEC=window.NOCTRA_LECTURA,
      U=window.NOCTRA_UI, MAIA=window.NOCTRA_MAIA;
const I=U.I, esc=U.esc, MESES=U.MESES;
const P=DT.P; let D=DT.D;
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.prototype.slice.call((r||document).querySelectorAll(s));
const g=(f,m)=>P.genero==="m"?m:f;
const low=s=>(s||"").charAt(0).toLowerCase()+(s||"").slice(1);
const nom=()=>D.nombre||"";

/* Ajuste de género del texto de la lectura (está escrito en femenino por defecto) */
const GEN=[["acostumbrada","acostumbrado"],["agotada","agotado"],["distinta","distinto"],["nerviosa","nervioso"],
 ["desbordás","desbordás"],["sola","solo"],["querida","querido"],["cansada","cansado"],["segura","seguro"],
 ["obligada","obligado"],["dispuesta","dispuesto"],["disponible","disponible"],["misma","mismo"]];
function gtxt(t){ if(P.genero!=="m") return t;
  GEN.forEach(([f,m])=>{ if(f!==m) t=t.replace(new RegExp("\\b"+f+"\\b","g"),m); });
  return t; }

const LECT=LEC.generar(P);
const SIGNO=LECT.signo, EL=LECT.elemento;
const RETRATO="assets/retrato-"+(P.generoRetrato==="f"?"f":"m")+"-full.webp";

/* ---------- utilidades ---------- */
const hoy=()=>new Date();
function faseHoy(){ return AS.faseLunar(hoy()); }
function guardar(){ DT.guardar(); }
const VIB=({carinosa:"Afectuosa",calma:"Calma",juguetona:"Juguetona",aventurera:"Aventurera",equilibrada:"Equilibrada",apasionada:"Apasionada",otra:"Propia"})[P.energia]||"Propia";
const EDADTXT=({"20":"20 a 30","30":"30 a 40","40":"40 a 50","50":"50 o más"})[P.edad]||"";

/* ================= estructura ================= */
let tab="retrato";
const $app=$("#app");

function cabecera(){
  const f=faseHoy();
  return `<header class="head">
    <button class="logo" data-act="perfil" aria-label="Perfil"><span>N</span>${U.lunaSVG(f.frac,16)}<span>ctra</span></button>
    <button class="fase" data-act="lunas" aria-label="Calendario lunar">${U.lunaSVG(f.frac,20)}<span>${esc(f.nombre)}</span></button>
  </header>`;
}
function barra(){
  const t=[["retrato","Retrato",I.retrato],["lectura","Lectura",I.lectura],["encuentro","Encuentro",I.encuentro],["diario","Diario",I.diario],["maia","Maia",I.maia]];
  return `<nav class="tabs">${t.map(([k,n,ic])=>`<button class="tab ${tab===k?"on":""}" data-tab="${k}">${ic}<b>${n}</b></button>`).join("")}</nav>`;
}
function pintar(){
  const V={retrato:vRetrato,lectura:vLectura,encuentro:vEncuentro,diario:vDiario,maia:vMaia}[tab];
  $app.innerHTML=cabecera()+`<main class="vista">${V()}</main>`+barra();
  $$("[data-tab]").forEach(b=>b.onclick=()=>{ if(tab===b.dataset.tab){scrollTo({top:0,behavior:"smooth"});return;} tab=b.dataset.tab; pintar(); scrollTo({top:0,behavior:"instant"}); });
  $$("[data-act]").forEach(b=>b.onclick=e=>acciones(b.dataset.act,b,e));
  const post={retrato:postRetrato,lectura:postLectura,encuentro:postEncuentro,diario:postDiario,maia:postMaia}[tab];
  if(post)post();
}
function ir(t){ tab=t; pintar(); scrollTo({top:0,behavior:"instant"}); }

/* ================= 1. RETRATO ================= */
function tarjetasDato(){
  const c=[
    ["La vibra",VIB,`Elegiste que te trajera una energía ${P.energia==="calma"?"calma y con los pies en la tierra":VIB.toLowerCase()}, y eso se ve en la mirada.`],
    P.cualidades[0]?["El rasgo especial",P.cualidades[0],`Lo pusiste primero de todo. Es la columna de esta persona.`]:null,
    ["Tu elemento",EL.charAt(0).toUpperCase()+EL.slice(1),`Sol en ${SIGNO}. ${EL==="fuego"?"Arrancás con todo.":EL==="tierra"?"Vas despacio y desconfiás de lo fácil.":EL==="aire"?"Necesitás conversación antes que intensidad.":"Leés lo que no se dice."}`],
    ["La edad",EDADTXT,`Se la imaginaste así, y el rostro está dibujado en ese punto de la vida.`],
    ["Su lenguaje",({palabras:"Palabras",regalos:"Detalles",actividades:"Tiempo juntos",contacto:"Contacto",gestos:"Gestos de ayuda"})[P.lenguaje]||"",`Es el tuyo. Lo va a aprender, y eso vale más que si le saliera solo.`]
  ].filter(Boolean);
  return `<div class="scroll-x">${c.map(([t,v,d])=>`<div class="card" style="width:230px;margin:0"><div class="lab">${esc(t)}</div><h3 style="margin:6px 0 8px;color:var(--oro)">${esc(v)}</h3><p class="small muted" style="margin:0">${esc(d)}</p></div>`).join("")}</div>`;
}
function bocetos(){
  const d=DT.dias();
  const items=[
    {dia:3,id:"perfil",t:"Boceto de perfil",d:"El mismo rostro, de tres cuartos."},
    {dia:7,id:"sonrisa",t:"Boceto sonriendo",d:"Cómo se le arma la cara cuando algo le causa gracia."},
    {dia:30,id:"acuarela",t:"Versión acuarela",d:"El retrato en color, como regalo del primer mes."}
  ];
  return `<div class="card"><div class="lab">Incluido, sin costo</div>
   <h3 style="margin:6px 0 12px">Bocetos que se van sumando</h3>
   ${items.map(x=>{const ok=d>=x.dia;return `<div style="display:flex;gap:12px;align-items:center;padding:11px 0;border-top:1px solid var(--linea)">
     <div style="width:38px;height:38px;flex:0 0 38px;border-radius:12px;border:1px solid var(--linea);display:flex;align-items:center;justify-content:center;color:${ok?"var(--oro)":"var(--tx2)"}">${ok?I.check:I.reloj}</div>
     <div style="flex:1"><b style="font-size:15px">${esc(x.t)}</b><div class="small muted">${ok?esc(x.d):"Se desbloquea a los "+x.dia+" días"}</div></div>
     ${ok?`<button class="pill" data-act="verBoceto" data-id="${x.id}">Ver</button>`:`<span class="tag">día ${x.dia}</span>`}
   </div>`;}).join("")}
   <p class="small muted" style="margin:12px 0 0">Van apareciendo solos. Si activaste los avisos, te llega uno cuando se suma cada uno.</p></div>`;
}
function vRetrato(){
  const dia=DT.diaria(P);
  return `
  <div class="enter">
    <div class="lab" style="margin:0 0 8px">${esc(U.fechaLarga(hoy()))}</div>
    <h1 style="margin:0 0 16px">${nom()?"Tu retrato, "+esc(nom()):"Tu Retrato del Alma Gemela"}</h1>
    <div class="marco" id="marcoRetrato"><img src="${RETRATO}" alt="Retrato del alma gemela" id="imgRetrato"><span class="firma">${esc(nom()||"Noctra")} · ${esc(U.fechaCorta(new Date(D.creado||Date.now())))}</span></div>
    <div class="fila" style="margin:14px 0 0">
      <button class="pill" data-act="ampliar">${I.ojo} Ampliar</button>
      <button class="pill" data-act="revivir">${I.estrella} Ver el revelado</button>
    </div>
  </div>
  <div class="sep"></div>
  <div class="lab" style="margin:0 0 10px">De dónde salió cada rasgo</div>
  ${tarjetasDato()}
  <div class="sep"></div>
  <div class="card enter d1" style="border-color:rgba(143,211,255,.22);background:linear-gradient(180deg,rgba(143,211,255,.07),rgba(255,255,255,.035))">
    <div style="display:flex;align-items:center;gap:9px;margin:0 0 8px"><span style="color:var(--azul);display:flex">${U.lunaSVG(dia.fase.frac,18)}</span><span class="lab" style="color:var(--azul)">Lectura de hoy</span></div>
    <p style="margin:0 0 12px">${esc(dia.texto)}</p>
    <div class="fila"><button class="pill" data-act="archivar">${I.papel} Guardar</button>${D.archivo&&D.archivo.length?`<button class="pill" data-act="verArchivo">${I.cal} Archivo (${D.archivo.length})</button>`:""}</div>
  </div>
  <button class="btn" data-act="descargar" style="margin:0 0 10px">${I.descarga} Descargar en alta resolución</button>
  <button class="btn ghost" data-act="compartir" style="margin:0 0 10px">${I.compartir} Compartir</button>
  <button class="btn ghost" data-act="comohice" style="margin:0 0 18px">${I.info} Cómo se hizo este retrato</button>
  ${bocetos()}
  <button class="btn ghost" data-act="fondo" style="margin:0 0 10px">${I.estrella} Crear fondo de pantalla</button>
  <div class="sep"></div>
  <button class="btn ghost" data-act="perfil" style="margin:0 0 14px">${I.usuario} Perfil y ajustes</button>
  <p class="small muted center" style="margin:0 0 4px">Contenido interpretativo, con fines de entretenimiento.</p>`;
}
function postRetrato(){}

/* ================= 2. LECTURA ================= */
let hablando=false;
function audioLectura(){
  if(!("speechSynthesis" in window)){U.toast("Este navegador no puede leer en voz alta");return;}
  if(hablando){speechSynthesis.cancel();hablando=false;pintar();return;}
  const partes=[];
  partes.push((D.nombre?D.nombre+". ":"")+"Tu Retrato del Alma Gemela. Lectura personalizada de Noctra.");
  LECT.secciones.forEach(s=>{partes.push(s.titulo+".");s.texto.forEach(t=>partes.push(gtxt(t).replace(/\*\*/g,"")));});
  partes.push("Contenido interpretativo, con fines de entretenimiento.");
  const voces=speechSynthesis.getVoices().filter(v=>/es/i.test(v.lang));
  const voz=voces.find(v=>/AR|MX|US/i.test(v.lang))||voces[0];
  speechSynthesis.cancel();
  partes.forEach((t,i)=>{
    const u=new SpeechSynthesisUtterance(t);
    u.lang="es-AR";if(voz)u.voice=voz;u.rate=.94;u.pitch=1;
    if(i===partes.length-1)u.onend=()=>{hablando=false;pintar();};
    speechSynthesis.speak(u);
  });
  hablando=true;pintar();U.toast("Reproduciendo la lectura");
}
function vLectura(){
  const S=LECT.secciones;
  const leidas=Object.keys(D.leidas).length;
  const natal=D.nacimiento.hora&&D.nacimiento.ciudad;
  return `
  <h1 style="margin:0 0 6px">Tu lectura</h1>
  <p class="muted small" style="margin:0 0 4px">${esc(nom()?nom()+" · ":"")}Sol en ${SIGNO} · ${EL} · ${LECT.modo} · regente ${LECT.regente}</p>
  <p class="muted small">${leidas} de ${S.length} secciones leídas</p>
  <div class="indice"><div class="scroll-x">${S.map(s=>`<button class="pill ${D.leidas[s.id]?"on":""}" data-act="saltar" data-id="${s.id}">${esc(s.titulo)}</button>`).join("")}</div></div>
  ${S.map((s,i)=>`
    <section class="sec" id="sec-${s.id}" style="margin:0 0 26px">
      <div class="lab">Sección ${i+1} de ${S.length}</div>
      <h2 style="margin:6px 0 12px">${esc(s.titulo)}</h2>
      <div class="txt">${s.texto.map(p=>p.indexOf("**")===0?`<p class="lab" style="margin:20px 0 10px;color:var(--oro)">${esc(gtxt(p).replace(/\*\*/g,""))}</p>`:`<p>${esc(gtxt(p))}</p>`).join("")}</div>
      <div class="acts">
        <button class="pill ${D.leidas[s.id]?"on":""}" data-act="leida" data-id="${s.id}">${I.check} ${D.leidas[s.id]?"Leída":"Marcar leída"}</button>
        <button class="pill ${D.favoritas[s.id]?"on":""}" data-act="fav" data-id="${s.id}">${I.corazon} ${D.favoritas[s.id]?"Guardada":"Guardar"}</button>
        <button class="pill" data-act="compartirSec" data-id="${s.id}">${I.compartir}</button>
      </div>
    </section>`).join("")}
  <div class="sep"></div>
  <div class="card">
    <div class="lab">Extra</div><h3 style="margin:6px 0 10px">Tu carta natal</h3>
    ${natal?`<p class="small muted" style="margin:0 0 12px">Calculada con la hora y la ciudad que cargaste.</p><button class="btn ghost" data-act="natal">${I.estrella} Ver la rueda y la casa siete</button>`
      :`<p class="small muted" style="margin:0 0 12px">Necesito la hora y la ciudad de tu nacimiento. Con eso sumo el ascendente, la rueda dibujada y una lectura de la casa siete, que es la de los vínculos.</p><button class="btn ghost" data-act="perfil">${I.mas} Cargar hora y ciudad</button>`}
  </div>
  <div class="card">
    <div class="lab">Guía aparte</div><h3 style="margin:6px 0 10px">Las cinco señales de que es ${P.generoRetrato==="f"?"ella":"él"}</h3>
    <p class="small muted" style="margin:0 0 12px">Las cinco señales de tu lectura, sueltas, para tener a mano cuando aparezca alguien.</p>
    <button class="btn ghost" data-act="senales">${I.papel} Abrir la guía</button>
  </div>
  <div class="card"><div class="lab">Extra</div><h3 style="margin:6px 0 10px">Escuchar la lectura</h3>
    <p class="small muted" style="margin:0 0 12px">La lectura completa leída en voz alta, para escuchar en vez de leer. Son entre cinco y siete minutos.</p>
    <button class="btn ghost" data-act="audio">${hablando?I.check+" Detener":I.maia+" Reproducir"}</button></div>
  <button class="btn" data-act="pdf" style="margin:6px 0 12px">${I.pdf} Descargar la lectura en PDF</button>
  <p class="small muted center">Contenido interpretativo, con fines de entretenimiento. No sustituye asesoramiento profesional.</p>`;
}
function postLectura(){}

/* ================= 3. ENCUENTRO ================= */
let segEnc="ventanas";
function vEncuentro(){
  return `<h1 style="margin:0 0 14px">Encuentro</h1>
  <div class="scroll-x" style="margin-bottom:16px">
    ${[["ventanas","Ventanas"],["compat","Compatibilidad"],["rituales","Rituales"]].map(([k,n])=>`<button class="pill ${segEnc===k?"on":""}" data-act="seg" data-id="${k}">${n}</button>`).join("")}
  </div>
  ${segEnc==="ventanas"?encVentanas():segEnc==="compat"?encCompat():encRituales()}`;
}
function encVentanas(){
  const vs=AS.ventanas(SIGNO), base=hoy();
  const mapa={}; vs.forEach(v=>{mapa[v.inicio.getFullYear()+"-"+v.inicio.getMonth()]=v;});
  let out=`<p class="muted small" style="margin:0 0 16px">Los próximos doce meses según tu carta. Una ventana no promete a nadie: marca los tramos en que es más probable que estés disponible y en circulación.</p>`;
  for(let k=0;k<12;k++){
    const m=new Date(base.getFullYear(),base.getMonth()+k,1);
    const v=mapa[m.getFullYear()+"-"+m.getMonth()];
    out+=`<div class="mes ${v?"tiene":"vacio-mes"}" ${v?`data-act="ventana" data-id="${k}"`:""}>
      <div class="mh"><b>${MESES[m.getMonth()]} ${m.getFullYear()}</b>${v?`<span class="tag oro">${v.fuerza===3?"ventana fuerte":"ventana"}</span>`:`<span class="small muted">sin ventana</span>`}</div>
      ${v?`<div class="small muted" style="margin:8px 0 0">${v.inicio.getDate()} al ${v.fin.getDate()} · Sol en ${v.signo}</div><div class="barra"><i style="width:${v.fuerza===3?100:66}%"></i></div>`:""}
    </div>`;
  }
  return out;
}
function encCompat(){
  const gente=D.personas||[];
  return `<p class="muted small" style="margin:0 0 16px">Cargá a alguien que te interesa y te hago la sinastría entre las dos cartas, cruzada con lo que contestaste. Sin porcentajes vacíos.</p>
  ${gente.length?gente.map((x,i)=>`<div class="card" data-act="verPersona" data-id="${i}">
     <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
       <div><b style="font-size:17px">${esc(x.nombre)}</b><div class="small muted">${esc(x.signo)} · ${esc(x.res.aspecto)}</div></div>
       <span class="tag oro">${x.res.puntaje}</span></div></div>`).join(""):`<div class="vacio">${I.corazon}<p class="small">Todavía no cargaste a nadie.</p></div>`}
  ${gente.length<5?`<button class="btn" data-act="nuevaPersona" style="margin:6px 0 12px">${I.mas} Cargar una persona</button>`:`<p class="small muted center">Llegaste a cinco personas guardadas. Borrá una para cargar otra.</p>`}
  <div class="sep"></div>
  <div class="card"><div class="lab">Juego de observación</div><h3 style="margin:6px 0 10px">Comparar con el retrato</h3>
   <p class="small muted" style="margin:0 0 12px">Poné una foto al lado del retrato y mirá qué coincide. Esto no es una prueba de nada: es un juego de observación, y lo decimos en serio.</p>
   <button class="btn ghost" data-act="comparar">${I.ojo} Comparar una foto</button></div>`;
}
function encRituales(){
  const mesActual=hoy().getMonth();
  return `<p class="muted small" style="margin:0 0 16px">Doce prácticas, una por mes, atadas a la fase lunar. Son ejercicios de escritura, atención y límites. No tienen nada de mágico y funcionan igual.</p>
  ${DT.RITUALES.map(r=>{const hecho=D.rituales[r.id];const act=r.mes===mesActual;
    return `<div class="card" data-act="ritual" data-id="${r.id}" style="${act?"border-color:rgba(245,214,123,.3)":""}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div style="flex:1"><div class="lab">${MESES[r.mes]} · luna ${r.fase}${act?" · este mes":""}</div>
          <b style="font-size:17px;display:block;margin:5px 0 3px">${esc(r.titulo)}</b>
          <span class="small muted">${r.min} min · ${esc(r.mat)}</span></div>
        <span style="color:${hecho?"var(--ok)":"var(--tx2)"};display:flex">${hecho?I.check:I.atras.replace('d="M14.6 5.4 8 12l6.6 6.6"','d="M9.4 5.4 16 12l-6.6 6.6"')}</span>
      </div></div>`;}).join("")}`;
}
function postEncuentro(){}

/* ================= 4. DIARIO ================= */
const TIPOS={encuentro:["Conocí a alguien",I.corazon],senal:["Vi una señal",I.estrella],sueno:["Soñé algo",I.luna],nota:["Nota suelta",I.papel]};
let filtro="";
function cruces(e){
  const out=[]; const f=new Date(e.t);
  const vs=AS.ventanas(SIGNO,new Date(f.getFullYear(),f.getMonth()-6,1));
  const dentro=vs.find(v=>f>=v.inicio&&f<=v.fin);
  if(dentro) out.push(`Escribiste esto durante tu ventana de ${MESES[dentro.inicio.getMonth()]}.`);
  const tx=(e.texto||"").toLowerCase();
  const SEN=[["no me apur","no te apura: primera señal de tu lectura"],["se acord","se acuerda de cosas chicas: segunda señal de tu lectura"],["no me juzg","no te trata como un problema: tercera señal de tu lectura"],["confi","te da razones para confiar: cuarta señal de tu lectura"],["cansad","después de verlo no quedás agotad"+g("a","o")+": quinta señal de tu lectura"]];
  SEN.forEach(([k,d])=>{ if(tx.indexOf(k)>=0) out.push("Coincide con una señal: "+d+"."); });
  if(e.persona){
    const m=D.diario.filter(x=>x.persona&&x.persona.toLowerCase()===e.persona.toLowerCase());
    const ultima=m.reduce((a,b)=>b.t>a.t?b:a,m[0]);
    if(m.length>=3&&ultima&&ultima.t===e.t) out.push(`Es la ${m.length}ª vez que mencionás a ${e.persona}. Fijate qué se repite.`);
  }
  return out;
}
function vDiario(){
  const ents=(D.diario||[]).slice().sort((a,b)=>b.t-a.t)
    .filter(e=>!filtro||((e.texto||"")+(e.persona||"")).toLowerCase().indexOf(filtro.toLowerCase())>=0);
  const mesActual=hoy().getMonth();
  const delMes=(D.diario||[]).filter(e=>new Date(e.t).getMonth()===mesActual);
  return `<h1 style="margin:0 0 6px">Diario</h1>
  <p class="muted small" style="margin:0 0 16px">Lo que anotás acá se cruza solo con tus ventanas y con las cinco señales de tu lectura.</p>
  <div class="scroll-x" style="margin-bottom:14px">${Object.keys(TIPOS).map(k=>`<button class="pill" data-act="nueva" data-id="${k}">${TIPOS[k][1]} ${TIPOS[k][0]}</button>`).join("")}</div>
  ${(D.diario||[]).length?`<div style="position:relative;margin:0 0 16px"><input id="buscar" placeholder="Buscar en el diario" value="${esc(filtro)}" style="padding-left:44px"><span style="position:absolute;left:15px;top:15px;color:var(--tx2);display:flex">${I.buscar}</span></div>`:""}
  ${delMes.length>=3?`<div class="card" style="border-color:rgba(245,214,123,.24)"><div class="lab">Resumen de ${MESES[mesActual]}</div><p style="margin:8px 0 0">${esc(resumenMes(delMes))}</p></div>`:""}
  ${ents.length?`<div class="linea">${ents.map(e=>{const cs=cruces(e);const f=new Date(e.t);
    return `<div class="ent ${e.tipo==="senal"?"sena":""}">
      <div class="lab">${U.fechaCorta(f)} · ${esc(TIPOS[e.tipo]?TIPOS[e.tipo][0]:"Nota")}</div>
      <p style="margin:6px 0 0;white-space:pre-wrap">${esc(e.texto)}</p>
      ${e.persona?`<div class="small muted" style="margin:4px 0 0">Sobre ${esc(e.persona)}</div>`:""}
      ${cs.map(c=>`<div class="cruce">${esc(c)}</div>`).join("")}
      <button class="pill" data-act="borrarEnt" data-id="${e.t}" style="margin:9px 0 0;font-size:12px;min-height:34px;padding:6px 12px">Borrar</button>
    </div>`;}).join("")}</div>`
   :`<div class="vacio">${I.diario}<p class="small">${filtro?"Nada con esa búsqueda.":"Todavía no hay entradas. Empezá por algo mínimo: una señal, alguien que apareció, un sueño."}</p></div>`}`;
}
function resumenMes(es){
  const t={};es.forEach(e=>t[e.tipo]=(t[e.tipo]||0)+1);
  const per={};es.forEach(e=>{if(e.persona)per[e.persona]=(per[e.persona]||0)+1;});
  const top=Object.keys(per).sort((a,b)=>per[b]-per[a])[0];
  const vs=AS.ventanas(SIGNO,new Date(hoy().getFullYear(),hoy().getMonth()-6,1));
  const enV=es.filter(e=>vs.some(v=>{const f=new Date(e.t);return f>=v.inicio&&f<=v.fin;})).length;
  let s=`Este mes escribiste ${es.length} entradas`;
  if(t.encuentro)s+=`, ${t.encuentro} sobre alguien que conociste`;
  if(t.senal)s+=` y ${t.senal} sobre señales`;
  s+=". ";
  if(enV)s+=`${enV} de ellas cayeron dentro de una ventana de encuentro. `;
  if(top&&per[top]>=2)s+=`${top} aparece ${per[top]} veces: es lo más repetido del mes. `;
  s+=`Lo que más te cuesta sigue siendo ${DT.DIF_CORTO[P.dificultad]}; fijate si algo de esto lo toca.`;
  return s;
}
function postDiario(){
  const b=$("#buscar"); if(b){ b.oninput=()=>{ filtro=b.value; const p=b.selectionStart; pintar(); const n=$("#buscar"); if(n){n.focus();n.setSelectionRange(p,p);} }; }
}

/* ================= 5. MAIA ================= */
function vMaia(){
  const ch=D.chat||[];
  return `<div style="padding-bottom:78px">
    <h1 style="margin:0 0 6px">Maia</h1>
    <button class="pill" data-act="quienEsMaia" style="margin:0 0 16px">${I.info} Quién es Maia</button>
    ${!ch.length?`<div class="card" style="border-color:rgba(143,211,255,.22)"><div class="lab" style="color:var(--azul)">Antes de empezar</div><p style="margin:8px 0 0">${esc(MAIA.PRESENTACION)}</p></div>`:""}
    <div class="chat" id="chat">${ch.map(m=>`<div class="msg ${m.q==="y"?"y":"m"}">${esc(m.t)}</div>`).join("")}</div>
    ${ch.length<2?`<div class="scroll-x" style="margin-top:14px">${MAIA.PILDORAS.map(p=>`<button class="pill" data-act="pildora" data-id="${esc(p)}">${esc(p)}</button>`).join("")}</div>`:""}
  </div>
  <div class="compose"><textarea id="msg" rows="1" placeholder="Escribile a Maia"></textarea><button class="env" data-act="enviar" aria-label="Enviar">${I.enviar}</button></div>`;
}
function postMaia(){
  const t=$("#msg"); if(!t)return;
  t.oninput=()=>{t.style.height="auto";t.style.height=Math.min(t.scrollHeight,120)+"px";};
  t.onkeydown=e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();enviar();} };
  const c=$("#chat"); if(c&&D.chat.length)scrollTo({top:document.body.scrollHeight,behavior:"instant"});
}
function enviar(){
  const t=$("#msg"); if(!t)return; const v=t.value.trim(); if(!v)return;
  D.chat.push({q:"y",t:v}); t.value=""; t.style.height="auto"; guardar();
  const r=MAIA.responder(v);
  D.chat.push({q:"m",t:r.texto}); guardar();
  pintar(); setTimeout(()=>scrollTo({top:document.body.scrollHeight,behavior:"smooth"}),40);
}

/* ================= acciones ================= */
function acciones(act,b,e){
  const id=b.dataset.id;
  switch(act){
    case "perfil": return hojaPerfil();
    case "lunas": return hojaLunas();
    case "seg": segEnc=id; return pintar();
    case "saltar": { const el=$("#sec-"+id); if(el)el.scrollIntoView({behavior:"smooth",block:"start"}); return; }
    case "leida": D.leidas[id]=!D.leidas[id]; guardar(); return pintar();
    case "fav": D.favoritas[id]=!D.favoritas[id]; guardar(); return pintar();
    case "compartirSec": return compartirSeccion(id);
    case "audio": return audioLectura();
    case "pdf": return armarPDF();
    case "senales": return hojaSenales();
    case "natal": return hojaNatal();
    case "ampliar": return hojaImagen(RETRATO);
    case "revivir": return revelado(true);
    case "descargar": return descargarRetrato();
    case "compartir": return compartirRetrato();
    case "fondo": return fondoPantalla();
    case "comohice": return hojaComoSeHizo();
    case "verBoceto": return hojaBoceto(id);
    case "archivar": { const d=DT.diaria(P); D.archivo.unshift({t:Date.now(),texto:d.texto}); guardar(); return U.toast("Guardada en el archivo"); }
    case "verArchivo": return U.hoja(`<h2 style="margin:0 0 4px">Archivo</h2><p class="small muted">Las lecturas diarias que guardaste.</p>
      ${(D.archivo||[]).map(a=>`<div class="card"><div class="lab">${esc(U.fechaLarga(new Date(a.t)))}</div><p style="margin:8px 0 0">${esc(a.texto)}</p></div>`).join("")}
      <button class="btn ghost" data-cerrar>Cerrar</button>`);
    case "ventana": return hojaVentana(+id);
    case "ritual": return hojaRitual(+id);
    case "nuevaPersona": return hojaPersona();
    case "verPersona": return hojaVerPersona(+id);
    case "comparar": return hojaComparar();
    case "nueva": return hojaNuevaEntrada(id);
    case "borrarEnt": D.diario=D.diario.filter(x=>x.t!==+id); guardar(); return pintar();
    case "quienEsMaia": return U.hoja(`<h2 style="margin:0 0 12px">Quién es Maia</h2><p>${esc(MAIA.PRESENTACION)}</p><p class="small muted">Maia no da consejo médico, legal ni financiero, no diagnostica y no habla de terceros como si los conociera. Si escribís algo que sugiere angustia seria, deja de interpretar y te pasa contactos de ayuda real.</p><button class="btn ghost" data-cerrar>Cerrar</button>`);
    case "pildora": { const t=$("#msg"); if(t){t.value=id;enviar();} return; }
    case "enviar": return enviar();
  }
}

/* ================= hojas ================= */
function hojaImagen(src){
  const p=U.hoja(`<div class="marco"><img src="${src}" alt="Retrato"></div><button class="btn ghost" data-cerrar style="margin:16px 0 0">Cerrar</button>`);
  return p;
}
function hojaComoSeHizo(){
  U.hoja(`<h2 style="margin:0 0 14px">Cómo se hizo este retrato</h2>
  <p>El rostro no salió de una foto ni de una base de datos de caras. Salió de tus quince respuestas, y te digo exactamente de cuáles, porque un producto que no puede explicarse no vale lo que cobró.</p>
  <p>La estructura —género, franja de edad, rasgos generales— viene de las preguntas 2, 3 y 4: dijiste ${esc(P.generoRetrato==="f"?"mujer":"hombre")}, entre ${esc(EDADTXT)} años, ${esc(({afro:"de origen africano",europeo:"de origen europeo",latino:"latino",asiatico:"asiático",libre:"sin preferencia de origen"})[P.etnia]||"")}. Eso define el andamio y nada más: el andamio no es lo que se reconoce.</p>
  <p>La expresión viene de tres lugares. De la energía que pediste (${esc(P.energia)}), que es lo que trabajé en la mirada. De las cualidades que elegiste —${esc(P.cualidades.slice(0,3).map(low).join(", "))}—, que están en la boca y en cómo se arma antes de hablar. Y de lo que contestaste sobre cuánto te importa el físico, que definió si este rostro impresiona de entrada o mejora con el tiempo.</p>
  <p class="small muted">Lo que el retrato no es: una foto de alguien que existe, ni una predicción. Es una imagen concreta de lo que buscás, y sirve sobre todo para descartar más rápido.</p>
  <button class="btn ghost" data-cerrar>Cerrar</button>`);
}
function hojaSenales(){
  const p=P.generoRetrato==="f"?"ella":"él";
  const sec=LECT.secciones.find(s=>s.id==="senales");
  const cinco=sec.texto.filter(t=>/^(Primero|Segundo|Tercero|Cuarto|Quinto):/.test(t));
  U.hoja(`<h2 style="margin:0 0 6px">Las cinco señales</h2><p class="small muted">De que es ${p}. Guardalas para cuando aparezca alguien.</p>
  ${cinco.map((t,i)=>`<div class="card" style="margin:0 0 10px"><div class="lab" style="color:var(--oro)">Señal ${i+1}</div><p style="margin:8px 0 0">${esc(gtxt(t).replace(/^\w+:\s*/,""))}</p></div>`).join("")}
  <p class="small muted">Ninguna de las cinco requiere interpretar nada místico. Todas se pueden observar.</p>
  <button class="btn ghost" data-cerrar>Cerrar</button>`);
}
function hojaNatal(){
  const f=P.fecha, luna=AS.signoLunar(new Date(Date.UTC(f.y,f.m-1,f.d,12)));
  const asc=AS.ascendenteAprox(SIGNO,D.nacimiento.hora)||"—";
  const casa7=AS.SIGNOS[(AS.SIGNOS.indexOf(asc)+6)%12];
  U.hoja(`<h2 style="margin:0 0 10px">Tu carta natal</h2>
  <div style="display:flex;justify-content:center;margin:0 0 16px">${ruedaSVG(SIGNO,luna,asc)}</div>
  <div class="card"><div class="lab">Sol en ${SIGNO}</div><p style="margin:8px 0 0">Lo que mostrás y hacia dónde empujás. Elemento ${EL}, modalidad ${LECT.modo}, regido por ${LECT.regente}.</p></div>
  <div class="card"><div class="lab">Luna en ${luna}</div><p style="margin:8px 0 0">Lo que necesitás cuando nadie mira. Es la parte que se nota recién a los tres meses de conocerte.</p></div>
  <div class="card"><div class="lab">Ascendente ${asc}</div><p style="margin:8px 0 0">La puerta: lo primero que registra alguien que te acaba de conocer. Calculado con la hora que cargaste, de forma aproximada.</p></div>
  <div class="card" style="border-color:rgba(245,214,123,.24)"><div class="lab" style="color:var(--oro)">Casa siete · los vínculos</div>
   <p style="margin:8px 0 0">Con ascendente en ${asc}, tu casa siete cae en ${casa7}. Eso describe lo que buscás en el otro sin darte cuenta: ${({Aries:"alguien que decida rápido y te saque de la duda",Tauro:"alguien estable, que no cambie de opinión cada semana",Géminis:"alguien con quien la conversación no se termine",Cáncer:"alguien que construya casa, en el sentido literal y en el otro",Leo:"alguien que no se esconda y que te elija en público",Virgo:"alguien útil, que resuelva y que se ocupe",Libra:"alguien que busque el acuerdo antes que tener razón",Escorpio:"alguien intenso, que no se conforme con la superficie",Sagitario:"alguien que te abra el mundo y no te achique",Capricornio:"alguien serio, que sostenga lo que promete",Acuario:"alguien libre, que no te pida cuentas",Piscis:"alguien sensible, que entienda lo que no decís"})[casa7]}.</p>
   <p class="small muted" style="margin:12px 0 0">Y ahí está la tensión: eso puede chocar con ${DT.DIF_CORTO[P.dificultad]}, que es lo que dijiste que más te cuesta.</p></div>
  <button class="btn ghost" data-cerrar>Cerrar</button>`);
}
function ruedaSVG(sol,luna,asc){
  const R=118,cx=130,cy=130;
  const off=AS.SIGNOS.indexOf("Aries");
  const pos=i=>((i-off)%12+12)%12;
  let g="";
  for(let i=0;i<12;i++){
    const a=(180-pos(i)*30)*Math.PI/180, a2=(180-(pos(i)+1)*30)*Math.PI/180;
    g+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*R}" y2="${cy+Math.sin(a)*R}" stroke="rgba(255,255,255,.12)" stroke-width="1"/>`;
    const am=(a+a2)/2;
    g+=`<text x="${cx+Math.cos(am)*(R-16)}" y="${cy+Math.sin(am)*(R-16)+4}" fill="rgba(154,163,190,.85)" font-size="10" text-anchor="middle" font-family="Manrope,sans-serif">${AS.SIGNOS[i].slice(0,3)}</text>`;
  }
  const punto=(s,col,r,txt)=>{const i=AS.SIGNOS.indexOf(s);if(i<0)return"";const a=(180-(pos(i)*30+15))*Math.PI/180;
    return `<circle cx="${cx+Math.cos(a)*r}" cy="${cy+Math.sin(a)*r}" r="6.5" fill="${col}"/><text x="${cx+Math.cos(a)*r}" y="${cy+Math.sin(a)*r+3.4}" font-size="8" fill="#05070F" text-anchor="middle" font-weight="700" font-family="Manrope,sans-serif">${txt}</text>`;};
  return `<svg viewBox="0 0 260 260" style="width:260px;max-width:100%">
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.14)"/>
    <circle cx="${cx}" cy="${cy}" r="${R-30}" fill="none" stroke="rgba(255,255,255,.09)"/>
    ${g}
    ${punto(sol,"#F5D67B",R-34,"S")}${punto(luna,"#8FD3FF",R-56,"L")}${punto(asc,"#7BD8A4",R-78,"A")}
  </svg>`;
}
function hojaBoceto(id){
  const t={perfil:["Boceto de perfil","El mismo rostro, girado. Sirve para reconocer el perfil, que es lo que más se ve cuando alguien camina al lado tuyo."],
           sonrisa:["Boceto sonriendo","Cómo se le arma la cara cuando algo le causa gracia de verdad. Es el gesto que menos se puede fingir."],
           acuarela:["Versión acuarela","El mismo retrato en color, más suelto. Regalo del primer mes."]}[id];
  const filtro=id==="acuarela"?"saturate(1.25) sepia(.35) contrast(.94) brightness(1.06)":id==="perfil"?"contrast(1.06)":"brightness(1.04) contrast(1.02)";
  const trans=id==="perfil"?"scaleX(-1) scale(1.08)":"scale(1.03)";
  U.hoja(`<h2 style="margin:0 0 4px">${t[0]}</h2><p class="small muted">${t[1]}</p>
   <div class="marco" style="margin:12px 0 0"><img src="${RETRATO}" style="filter:${filtro};transform:${trans}" alt="${t[0]}"></div>
   <p class="small muted" style="margin:12px 0 0">Es una variante del mismo rostro, no otra persona.</p>
   <button class="btn ghost" data-cerrar style="margin:14px 0 0">Cerrar</button>`);
}
function hojaLunas(){
  const f=faseHoy();
  const nueva=AS.proximaFase(0,hoy()), llena=AS.proximaFase(0.5,hoy());
  let cal="";
  for(let k=0;k<28;k++){
    const d=new Date(hoy().getTime()+k*86400000), fa=AS.faseLunar(d);
    cal+=`<div style="text-align:center;flex:0 0 46px"><div style="color:var(--oro);display:flex;justify-content:center">${U.lunaSVG(fa.frac,22)}</div><div class="small muted" style="font-size:11px;margin-top:3px">${d.getDate()}</div></div>`;
  }
  U.hoja(`<h2 style="margin:0 0 4px">Calendario lunar</h2><p class="small muted">Hoy: ${esc(f.nombre)} · ${f.iluminacion}% iluminada</p>
   <div class="scroll-x" style="margin:14px 0 18px;gap:6px">${cal}</div>
   <div class="card"><div class="lab">Próxima luna nueva</div><p style="margin:8px 0 0">${esc(U.fechaLarga(nueva))}. Es el momento del mes para nombrar lo que empieza. La práctica de luna nueva está en Encuentro → Rituales.</p></div>
   <div class="card"><div class="lab">Próxima luna llena</div><p style="margin:8px 0 0">${esc(U.fechaLarga(llena))}. Es el momento para soltar algo, no para empezarlo.</p></div>
   <button class="btn ghost" data-cerrar>Cerrar</button>`);
}
function hojaVentana(k){
  const base=hoy(), m=new Date(base.getFullYear(),base.getMonth()+k,1);
  const v=AS.ventanas(SIGNO).find(x=>x.inicio.getMonth()===m.getMonth()&&x.inicio.getFullYear()===m.getFullYear());
  if(!v)return;
  const d=DT.DONDE[P.experiencias]||DT.DONDE.tranquilos;
  U.hoja(`<div class="lab" style="color:var(--oro)">${v.fuerza===3?"Ventana fuerte":"Ventana"}</div>
   <h2 style="margin:6px 0 4px">${v.inicio.getDate()} al ${v.fin.getDate()} de ${MESES[v.inicio.getMonth()]}</h2>
   <p class="small muted">Sol en ${v.signo}</p>
   <div class="card" style="margin:14px 0"><div class="lab">Por qué</div><p style="margin:8px 0 0">${esc(v.motivo)}</p>
    <p class="small muted" style="margin:10px 0 0">Esto no dice que vayas a conocer a alguien esos días. Dice que en ese tramo es más probable que estés disponible, que es lo único calculable.</p></div>
   <div class="card"><div class="lab">Dónde ponerte en circulación</div>
    <p class="small muted" style="margin:8px 0 12px">Elegiste ${esc(DT.EXP_CORTO[P.experiencias])} como lo que más valorás, así que las sugerencias van por ahí.</p>
    ${d.map(x=>`<div style="display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--linea)"><span style="color:var(--oro);flex:0 0 auto;display:flex;margin-top:2px">${I.estrella}</span><span>${esc(x)}</span></div>`).join("")}</div>
   <button class="btn ghost" data-cerrar>Cerrar</button>`);
}
function hojaRitual(id){
  const r=DT.RITUALES.find(x=>x.id===id); if(!r)return;
  const hecho=!!D.rituales[r.id];
  const p=U.hoja(`<div class="lab" style="color:var(--oro)">${MESES[r.mes]} · luna ${r.fase} · ${r.min} minutos</div>
   <h2 style="margin:6px 0 4px">${esc(r.titulo)}</h2><p class="small muted">Materiales: ${esc(r.mat)}</p>
   <div class="card" style="margin:14px 0">${r.pasos.map((s,i)=>`<div style="display:flex;gap:12px;padding:10px 0;${i?"border-top:1px solid var(--linea)":""}">
      <span style="flex:0 0 26px;height:26px;border-radius:99px;border:1px solid rgba(245,214,123,.4);color:var(--oro);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700">${i+1}</span>
      <span>${esc(s)}</span></div>`).join("")}</div>
   <p class="muted" style="font-family:Fraunces,serif;font-size:17px;line-height:26px">${esc(r.cierre)}</p>
   <p class="small muted">Está atada a lo que dijiste que más te cuesta: ${esc(DT.DIF_CORTO[P.dificultad])}.</p>
   <button class="btn" id="hecho" style="margin:12px 0 0">${hecho?"Hecha":"Marcar como hecha"}</button>
   <button class="btn ghost" data-cerrar style="margin:10px 0 0">Cerrar</button>`);
  $("#hecho",p).onclick=()=>{D.rituales[r.id]=!D.rituales[r.id];guardar();U.cerrarHoja();pintar();U.toast(D.rituales[r.id]?"Marcada como hecha":"Desmarcada");};
}

/* ---- compatibilidad ---- */
function hojaPersona(){
  const p=U.hoja(`<h2 style="margin:0 0 4px">Cargar una persona</h2>
   <p class="small muted">Con el nombre y la fecha alcanza. La hora y la ciudad afinan el resultado.</p>
   <div style="margin:16px 0 0">
   <label class="f"><span class="lab">Nombre</span><input id="pn" placeholder="Cómo se llama"></label>
   <label class="f"><span class="lab">Fecha de nacimiento</span><input id="pf" type="date"></label>
   <label class="f"><span class="lab">Hora (opcional)</span><input id="ph" type="time"></label>
   <label class="f"><span class="lab">Ciudad (opcional)</span><input id="pc" placeholder="Dónde nació"></label>
   </div>
   <button class="btn" id="calc">${I.corazon} Ver la compatibilidad</button>
   <button class="btn ghost" data-cerrar style="margin:10px 0 0">Cancelar</button>`);
  $("#calc",p).onclick=()=>{
    const n=$("#pn",p).value.trim(), f=$("#pf",p).value;
    if(!n||!f){U.toast("Falta el nombre o la fecha");return;}
    const d=new Date(f+"T12:00:00");
    const signo=AS.signoDe(d.getDate(),d.getMonth()+1);
    const res=AS.sinastria(SIGNO,signo);
    D.personas.push({nombre:n,fecha:f,hora:$("#ph",p).value,ciudad:$("#pc",p).value.trim(),signo:signo,res:res,t:Date.now()});
    guardar(); U.cerrarHoja(); pintar(); setTimeout(()=>hojaVerPersona(D.personas.length-1),120);
  };
}
function hojaVerPersona(i){
  const x=D.personas[i]; if(!x)return;
  const r=x.res, el2=AS.elementoDe(x.signo);
  const luna2=AS.signoLunar(new Date(x.fecha+"T12:00:00"));
  const funciona=({"trígono":"Se entienden sin traducir. Los planes salen sin discutir la logística.","sextil":"Se estimulan: cada uno mueve al otro un poco fuera de su rutina.","oposición":"La atracción es real y no hace falta forzarla. Cada uno tiene lo que al otro le falta.","conjunción":"Se leen rápido. Hay una comodidad de entrada que otros pares tardan meses en tener.","cuadratura":"Hay tensión y eso no es sólo malo: si discuten bien, es motor.","semisextil":"Comparten más de lo que parece, pero hay que decirlo en voz alta.","quincuncio":"Cuando se encuentran de verdad, no hay medias tintas: ninguno de los dos está ahí por costumbre."})[r.aspecto];
  const cuesta=({"trígono":"Puede faltar fricción. Si nunca se incomodan, tampoco crecen.","sextil":"Es liviano, y lo liviano a veces no se sostiene solo. Alguien tiene que proponer profundidad.","oposición":"Lo que atrae al principio irrita al año. Vas a tener que decidir qué diferencias son negociables.","conjunción":"Repiten el mismo error, y ninguno de los dos lo ve porque lo comparten.","cuadratura":"El desgaste es un riesgo real. Si discuten para ganar, esto no dura.","semisextil":"Se rozan sin encajar. Requiere traducción constante, y eso cansa.","quincuncio":"Miran en direcciones distintas. Con ganas no alcanza: hace falta decisión."})[r.aspecto];
  const preg=({"trígono":"¿Qué te gustaría cambiar de tu vida y todavía no cambiaste?","sextil":"¿Qué buscás en serio, más allá de pasarla bien?","oposición":"¿Qué cosa tuya te cuesta más que te acepten?","conjunción":"¿Cuál fue el error que repetiste en tus últimas relaciones?","cuadratura":"Cuando discutís, ¿qué necesitás del otro?","semisextil":"¿Cómo te das cuenta de que algo te importa?","quincuncio":"¿Dónde te ves en dos años?"})[r.aspecto];
  const p=U.hoja(`<div class="lab">Compatibilidad</div>
   <h2 style="margin:6px 0 4px">${esc(x.nombre)}</h2>
   <p class="small muted">${esc(x.signo)} · ${esc(el2)} · luna en ${esc(luna2)}</p>
   <div class="card" style="margin:14px 0"><div class="lab" style="color:var(--oro)">${esc(r.aspecto)}</div>
     <p style="margin:8px 0 0">${esc(r.nota)}</p>
     <p class="small muted" style="margin:10px 0 0">Elementos: ${esc(r.elementos)} — ${esc(r.quimica)}.</p></div>
   <div class="card"><div class="lab">Qué funciona solo</div><p style="margin:8px 0 0">${esc(funciona)}</p></div>
   <div class="card"><div class="lab">Qué va a costar</div><p style="margin:8px 0 0">${esc(cuesta)}</p>
     <p class="small muted" style="margin:10px 0 0">Y algo tuyo: dijiste que tus relaciones anteriores se cayeron por ${esc(DT.MOT_CORTO[P.motivo])}. Con ${esc(x.nombre)} eso aparece ${r.aspecto==="cuadratura"||r.aspecto==="oposición"?"antes de lo que te gustaría":"tarde, cuando ya te acostumbraste"}.</p></div>
   <div class="card" style="border-color:rgba(143,211,255,.24)"><div class="lab" style="color:var(--azul)">Una pregunta para hacerle</div>
     <p style="margin:8px 0 0;font-family:Fraunces,serif;font-size:19px;line-height:28px">${esc(preg)}</p>
     <p class="small muted" style="margin:10px 0 0">No es un test. Es la conversación que te va a ahorrar tres meses.</p></div>
   <p class="small muted">Esto es sinastría entre signos solares cruzada con tus respuestas. No es un veredicto y no reemplaza conocer a alguien.</p>
   <button class="btn ghost" id="borrarP" style="margin:10px 0 0">Borrar a ${esc(x.nombre)}</button>
   <button class="btn ghost" data-cerrar style="margin:10px 0 0">Cerrar</button>`);
  $("#borrarP",p).onclick=()=>{D.personas.splice(i,1);guardar();U.cerrarHoja();pintar();};
}
function hojaComparar(){
  const p=U.hoja(`<h2 style="margin:0 0 4px">Comparar con el retrato</h2>
   <p class="small muted">Esto no es una prueba, es un juego de observación. Nadie se parece a un dibujo.</p>
   <input type="file" accept="image/*" id="foto" style="margin:16px 0 0">
   <div id="lado" style="display:none;margin:16px 0 0">
     <div style="display:flex;gap:10px"><div style="flex:1"><div class="marco"><img src="${RETRATO}" alt="Retrato"></div><div class="lab center" style="margin:8px 0 0">El retrato</div></div>
     <div style="flex:1"><div class="marco" style="background:#0A1128"><img id="fotoImg" alt="Foto"></div><div class="lab center" style="margin:8px 0 0">Tu foto</div></div></div>
     <div class="card" style="margin:16px 0 0"><div class="lab">Qué mirar</div>
       <p class="small" style="margin:8px 0 0">La mirada antes que la nariz. La distancia entre los ojos. Cómo cae la boca en reposo. El óvalo de la cara. El pelo es lo que menos importa: es lo más fácil de cambiar y lo que menos dice.</p></div>
   </div>
   <button class="btn ghost" data-cerrar style="margin:16px 0 0">Cerrar</button>`);
  $("#foto",p).onchange=ev=>{const f=ev.target.files[0];if(!f)return;const r=new FileReader();
    r.onload=()=>{$("#fotoImg",p).src=r.result;$("#lado",p).style.display="block";};r.readAsDataURL(f);};
}

/* ---- diario ---- */
function hojaNuevaEntrada(tipo){
  const t=TIPOS[tipo]||TIPOS.nota;
  const p=U.hoja(`<div class="lab" style="color:var(--oro)">Nueva entrada</div>
   <h2 style="margin:6px 0 14px">${esc(t[0])}</h2>
   <label class="f"><span class="lab">Qué pasó</span><textarea id="dt" placeholder="${tipo==="encuentro"?"Dónde fue, qué te llamó la atención":tipo==="senal"?"Qué viste y por qué te pareció una señal":tipo==="sueno"?"Lo que te acordás, aunque no tenga sentido":"Lo que quieras"}"></textarea></label>
   <label class="f"><span class="lab">A quién menciona (opcional)</span><input id="dp" placeholder="Un nombre"></label>
   <button class="btn" id="guardarE">Guardar</button>
   <button class="btn ghost" data-cerrar style="margin:10px 0 0">Cancelar</button>`);
  $("#guardarE",p).onclick=()=>{
    const v=$("#dt",p).value.trim(); if(!v){U.toast("Escribí algo primero");return;}
    D.diario.push({t:Date.now(),tipo:tipo,texto:v,persona:$("#dp",p).value.trim()});
    guardar();U.cerrarHoja();tab="diario";pintar();
  };
}

/* ---- perfil ---- */
function hojaPerfil(){
  const n=D.notif;
  const p=U.hoja(`<h2 style="margin:0 0 14px">Perfil</h2>
   <label class="f"><span class="lab">Nombre</span><input id="un" value="${esc(D.nombre)}" placeholder="Cómo querés que te llame"></label>
   <div class="card"><div class="lab">Datos de nacimiento</div>
     <p class="small muted" style="margin:8px 0 12px">${esc(P.fecha.d+" de "+MESES[P.fecha.m-1]+" de "+P.fecha.y)} · Sol en ${SIGNO}. Vinieron del quiz.</p>
     <label class="f"><span class="lab">Hora de nacimiento</span><input id="uh" type="time" value="${esc(D.nacimiento.hora)}"></label>
     <label class="f" style="margin:0"><span class="lab">Ciudad de nacimiento</span><input id="uc" value="${esc(D.nacimiento.ciudad)}" placeholder="Dónde naciste"></label>
     <p class="small muted" style="margin:10px 0 0">Con esto se calcula el ascendente y la casa siete, y se suma la sección de carta natal a tu lectura.</p></div>
   <div class="card"><div class="lab">Avisos</div>
     ${[["ventanas","Cuando empieza una ventana de encuentro"],["lunas","Luna nueva y luna llena"],["bocetos","Cuando se desbloquea un boceto nuevo"],["diaria","La lectura diaria"]].map(([k,t])=>`
       <label style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 0;border-top:1px solid var(--linea);min-height:44px">
         <span class="small">${t}</span><input type="checkbox" data-n="${k}" ${n[k]?"checked":""} style="width:22px;height:22px;min-height:0;flex:0 0 22px;accent-color:#F5D67B"></label>`).join("")}
     <label class="f" style="margin:14px 0 0"><span class="lab">Horario</span><input id="uho" type="time" value="${esc(n.hora)}"></label>
     <p class="small muted" style="margin:8px 0 0">Ninguno viene activado por defecto salvo los que elijas. Nada de madrugada, nada de "volvé a la app".</p></div>
   <button class="btn" id="guardarP">Guardar</button>
   <div class="sep"></div>
   <button class="btn ghost" id="exportar" style="margin:0 0 10px">${I.descarga} Exportar todo</button>
   <button class="btn ghost" id="borrar" style="margin:0 0 16px;color:var(--err);border-color:rgba(240,138,138,.35)">Borrar mi cuenta y todo el contenido</button>
   <div class="card"><div class="lab">Legales</div>
     <p class="small muted" style="margin:10px 0 0">Noctra es contenido interpretativo con fines de entretenimiento. No sustituye asesoramiento profesional.</p>
     <p class="small" style="margin:10px 0 0"><a href="legal/terminos.html">Términos</a> · <a href="legal/privacidad.html">Política de privacidad</a></p>
     <p class="small muted" style="margin:10px 0 0">Soporte: hola@noctrastral.online</p></div>
   <button class="btn ghost" data-cerrar style="margin:10px 0 0">Cerrar</button>`);
  $$("[data-n]",p).forEach(c=>c.onchange=()=>{
    D.notif[c.dataset.n]=c.checked; guardar();
    if(c.checked) pedirPermiso().then(ok=>{ if(!ok) U.toast("Activá los avisos del navegador para recibirlos"); else revisarAvisos(); });
  });
  $("#guardarP",p).onclick=()=>{
    D.nombre=$("#un",p).value.trim(); D.nacimiento.hora=$("#uh",p).value;
    D.nacimiento.ciudad=$("#uc",p).value.trim(); D.notif.hora=$("#uho",p).value||"09:00";
    guardar(); U.cerrarHoja(); pintar(); U.toast("Guardado");
  };
  $("#exportar",p).onclick=exportar;
  $("#borrar",p).onclick=()=>{
    const c=U.hoja(`<h2 style="margin:0 0 10px">¿Borrar todo?</h2>
     <p>Se borra tu nombre, los datos de nacimiento que cargaste, el diario, las personas guardadas y el chat con Maia. De este dispositivo, ahora, sin pasos intermedios y sin vuelta atrás.</p>
     <button class="btn" id="si" style="background:var(--err)">Sí, borrar todo</button>
     <button class="btn ghost" data-cerrar style="margin:10px 0 0">No</button>`);
    $("#si",c).onclick=()=>{DT.borrarTodo();D=window.NOCTRA_DATOS.D;U.cerrarHoja();location.reload();};
  };
}
function exportar(){
  const txt=[`NOCTRA — export de ${D.nombre||"tu cuenta"}`,`Generado el ${U.fechaLarga(hoy())}`,"",
   `Sol en ${SIGNO} · ${EL} · ${LECT.modo} · regente ${LECT.regente}`,"",
   "=== LECTURA ===",...LECT.secciones.flatMap(s=>["","## "+s.titulo,...s.texto.map(gtxt)]),"",
   "=== DIARIO ===",...(D.diario.length?D.diario.slice().sort((a,b)=>a.t-b.t).map(e=>`[${U.fechaLarga(new Date(e.t))}] ${(TIPOS[e.tipo]||["Nota"])[0]}${e.persona?" · "+e.persona:""}\n${e.texto}`):["(vacío)"]),"",
   "=== PERSONAS ===",...(D.personas.length?D.personas.map(x=>`${x.nombre} — ${x.signo} — ${x.res.aspecto} — ${x.res.nota}`):["(vacío)"]),"",
   "Contenido interpretativo, con fines de entretenimiento."].join("\n");
  const b=new Blob([txt],{type:"text/plain;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="noctra-export.txt";a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  U.toast("Descargando el retrato y la lectura");
  descargarRetrato(true);
}

/* ================= imágenes ================= */
function cargarImg(src){return new Promise((ok,no)=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>ok(i);i.onerror=no;i.src=src;});}
function grano(x,w,h,op){
  const d=x.getImageData(0,0,w,h), a=d.data;
  for(let i=0;i<a.length;i+=4){const n=(Math.random()-.5)*op;a[i]+=n;a[i+1]+=n;a[i+2]+=n;}
  x.putImageData(d,0,0);
}
async function componer(ancho){
  const img=await cargarImg(RETRATO);
  const W=ancho, H=Math.round(ancho*img.height/img.width);
  const c=document.createElement("canvas");c.width=W;c.height=H;
  const x=c.getContext("2d");
  x.fillStyle="#D9D6CF";x.fillRect(0,0,W,H);
  x.imageSmoothingQuality="high";x.drawImage(img,0,0,W,H);
  grano(x,W,H,W>1200?16:10);
  x.font=`${Math.round(W*0.028)}px Fraunces, Georgia, serif`;
  x.fillStyle="rgba(51,51,58,.72)";
  x.fillText(`${D.nombre||"Noctra"} · ${U.fechaCorta(new Date(D.creado||Date.now()))}`,W*0.05,H-W*0.045);
  return c;
}
async function descargarRetrato(silencio){
  try{
    const c=await componer(2048);
    c.toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="noctra-retrato.png";a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),4000); if(!silencio)U.toast("Retrato descargado en 2048 px");},"image/png");
  }catch(e){U.toast("No se pudo generar la imagen");}
}
async function compartirRetrato(){
  try{
    const img=await cargarImg(RETRATO);
    const S=1080, c=document.createElement("canvas");c.width=S;c.height=S;const x=c.getContext("2d");
    const gr=x.createLinearGradient(0,0,0,S);gr.addColorStop(0,"#0B1230");gr.addColorStop(1,"#05070F");
    x.fillStyle=gr;x.fillRect(0,0,S,S);
    for(let i=0;i<160;i++){x.fillStyle=`rgba(235,240,255,${Math.random()*.5+.15})`;x.beginPath();x.arc(Math.random()*S,Math.random()*S,Math.random()*1.5+.3,0,7);x.fill();}
    const h=Math.round(S*0.62), w=Math.round(h*img.width/img.height), px=(S-w)/2, py=Math.round(S*0.14);
    x.save();x.shadowColor="rgba(0,0,0,.5)";x.shadowBlur=48;x.shadowOffsetY=18;
    x.fillStyle="#D9D6CF";x.fillRect(px,py,w,h);x.restore();
    x.drawImage(img,px,py,w,h);
    x.textAlign="center";
    x.font="500 34px Fraunces, Georgia, serif";x.fillStyle="#F5D67B";
    x.fillText(D.nombre?`El retrato de ${D.nombre}`:"Mi Retrato del Alma Gemela",S/2,py+h+70);
    x.font="500 20px Manrope, sans-serif";x.fillStyle="rgba(154,163,190,.9)";
    x.fillText("noctra",S/2,S-52);
    c.toBlob(async b=>{
      const f=new File([b],"noctra.png",{type:"image/png"});
      if(navigator.canShare&&navigator.canShare({files:[f]})){
        try{await navigator.share({files:[f],title:"Noctra"});}catch(e){}
      }else{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="noctra-historia.png";a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href),4000);U.toast("Tarjeta descargada");}
    },"image/png");
  }catch(e){U.toast("No se pudo generar la tarjeta");}
}
async function fondoPantalla(){
  try{
    const img=await cargarImg(RETRATO);
    const W=Math.round((screen.width||1170)*(devicePixelRatio||2)), H=Math.round((screen.height||2532)*(devicePixelRatio||2));
    const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#0A1230");gr.addColorStop(.55,"#05070F");gr.addColorStop(1,"#04060D");
    x.fillStyle=gr;x.fillRect(0,0,W,H);
    for(let i=0;i<420;i++){x.fillStyle=`rgba(235,240,255,${Math.random()*.55+.1})`;x.beginPath();x.arc(Math.random()*W,Math.random()*H,Math.random()*(W/700)+.4,0,7);x.fill();}
    const h=Math.round(H*0.46), w=Math.round(h*img.width/img.height);
    x.globalAlpha=.94;x.drawImage(img,(W-w)/2,Math.round(H*0.22),w,h);x.globalAlpha=1;
    const vg=x.createRadialGradient(W/2,H*0.45,W*0.1,W/2,H*0.45,W*0.9);
    vg.addColorStop(0,"rgba(5,7,15,0)");vg.addColorStop(1,"rgba(5,7,15,.85)");
    x.fillStyle=vg;x.fillRect(0,0,W,H);
    c.toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="noctra-fondo.png";a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),4000);U.toast(`Fondo de ${W}×${H} descargado`);},"image/png");
  }catch(e){U.toast("No se pudo generar el fondo");}
}
function compartirSeccion(id){
  const s=LECT.secciones.find(x=>x.id===id); if(!s)return;
  const t=`${s.titulo} — mi lectura de Noctra\n\n${gtxt(s.texto[0])}\n\n${gtxt(s.texto[1]||"")}`;
  if(navigator.share){navigator.share({title:"Noctra — "+s.titulo,text:t}).catch(()=>{});}
  else{navigator.clipboard&&navigator.clipboard.writeText(t);U.toast("Copiado");}
}

/* ================= PDF ================= */
async function armarPDF(){
  U.toast("Preparando el documento…");
  let src=RETRATO;
  try{const c=await componer(900);src=c.toDataURL("image/jpeg",.9);}catch(e){}
  const cont=document.createElement("div");cont.id="pdfDoc";
  cont.innerHTML=`
   <div class="pdf-portada">
     <img src="${src}" alt="Retrato">
     <div style="font-family:Fraunces,serif;font-size:26pt;margin:0 0 3mm">Retrato del Alma Gemela</div>
     <div style="font-size:12pt;color:#6A6F7E">${esc(D.nombre||"")}</div>
     <div style="font-size:11pt;color:#6A6F7E;margin:2mm 0 0">${esc(U.fechaLarga(hoy()))} · Sol en ${SIGNO} · ${EL}</div>
     <div style="font-size:10pt;color:#8A8F9E;margin:14mm 0 0">noctra</div>
   </div>
   ${LECT.secciones.map(s=>`<div class="pdf-sec"><h2>${esc(s.titulo)}</h2>${s.texto.map(p=>`<p>${esc(gtxt(p).replace(/\*\*/g,""))}</p>`).join("")}</div>`).join("")}
   <div class="pdf-sec"><p style="font-size:9.5pt;color:#6A6F7E">Noctra es contenido interpretativo con fines de entretenimiento. No sustituye asesoramiento profesional.</p></div>`;
  document.body.appendChild(cont);
  $$("#app,#cielo").forEach(e=>e.classList.add("no-print"));
  setTimeout(()=>{ print();
    setTimeout(()=>{cont.remove();$$("#app,#cielo").forEach(e=>e.classList.remove("no-print"));},600);
  },350);
}

/* ================= revelado ================= */
function revelado(revisita){
  const et=[VIB, P.cualidades[0]||"", EL.charAt(0).toUpperCase()+EL.slice(1)].filter(Boolean);
  const d=document.createElement("div");d.id="revelado";
  d.innerHTML=`<div class="rw">
    <h1>Esto es lo que vi en tus respuestas${D.nombre?", "+esc(D.nombre):""}</h1>
    <div class="rimg"><div class="marco"><img src="${RETRATO}" alt="Tu retrato"></div>
      ${et.map((t,i)=>`<span class="etq e${i+1}">${esc(t)}</span>`).join("")}</div>
    <button class="btn" id="rev">${I.estrella} Revelar</button>
    <div id="racts" style="display:none">
      <button class="btn" id="rdesc" style="margin:0 0 10px">${I.descarga} Guardar en el teléfono</button>
      <button class="btn ghost" id="rcomp" style="margin:0 0 10px">${I.compartir} Compartir</button>
      <button class="btn ghost" id="rlec">${I.lectura} Ver mi lectura</button>
    </div></div>`;
  document.body.appendChild(d);
  const cerrar=()=>{d.remove();};
  $("#rev",d).onclick=()=>{
    d.classList.add("go");
    $("#rev",d).style.display="none";
    const es=$$(".etq",d);
    es.forEach((x,i)=>setTimeout(()=>x.classList.add("on"),700+i*700));
    setTimeout(()=>{
      U.chispas(2400);
      const a=$("#racts",d);a.style.display="block";a.classList.add("enter");
      if(!revisita){D.revelado=true;guardar();}
    },3100);
  };
  $("#rdesc",d).onclick=()=>descargarRetrato();
  $("#rcomp",d).onclick=()=>compartirRetrato();
  $("#rlec",d).onclick=()=>{cerrar();ir("lectura");};
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){
    $$(".etq",d).forEach(x=>x.classList.add("on"));
  }
}

/* ================= avisos ================= */
function pedirPermiso(){
  if(!("Notification" in window))return Promise.resolve(false);
  if(Notification.permission==="granted")return Promise.resolve(true);
  if(Notification.permission==="denied")return Promise.resolve(false);
  return Notification.requestPermission().then(p=>p==="granted");
}
function avisar(clave,titulo,cuerpo){
  D.avisados=D.avisados||{};
  const k=clave+"|"+new Date().toISOString().slice(0,10);
  if(D.avisados[k])return;
  if(!("Notification" in window)||Notification.permission!=="granted")return;
  try{ new Notification(titulo,{body:cuerpo,icon:"icons/icon-192.png",badge:"icons/icon-192.png",tag:clave}); D.avisados[k]=1; guardar(); }catch(e){}
}
function revisarAvisos(){
  const n=D.notif, h=hoy();
  if(n.ventanas){
    const v=AS.ventanas(SIGNO).find(x=>Math.abs(x.inicio-h)<36e5*30);
    if(v&&v.inicio.toDateString()===h.toDateString())
      avisar("ventana","Empieza tu ventana de "+MESES[v.inicio.getMonth()],"Del "+v.inicio.getDate()+" al "+v.fin.getDate()+". Abrí Encuentro para ver dónde ponerte en circulación.");
  }
  if(n.lunas){
    const f=faseHoy();
    if(f.nombre==="Luna nueva") avisar("nueva","Luna nueva","Es el momento del mes para nombrar lo que empieza. Tenés una práctica esperándote.");
    if(f.nombre==="Luna llena") avisar("llena","Luna llena","Momento de soltar algo, no de empezarlo. La práctica de este mes está en Encuentro.");
  }
  if(n.bocetos){
    const d=DT.dias();
    if(d===3) avisar("b3","Terminé un boceto nuevo","El mismo rostro, de perfil. Está en la pestaña Retrato.");
    if(d===7) avisar("b7","Terminé un boceto nuevo","Cómo se le arma la cara cuando algo le causa gracia.");
    if(d===30) avisar("b30","Tu retrato en acuarela","Regalo del primer mes. Está en la pestaña Retrato.");
  }
  if(n.diaria){
    const hh=(n.hora||"09:00").split(":");
    if(h.getHours()>=+hh[0]) avisar("diaria","Tu lectura de hoy",DT.diaria(P).texto.slice(0,110)+"…");
  }
}

/* ================= arranque ================= */
function arrancar(){
  U.cielo($("#cielo"));
  pintar();
  if(!D.revelado) setTimeout(()=>revelado(false),260);
  setTimeout(revisarAvisos,1200);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)revisarAvisos();});
  if(DT.esDemo){
    setTimeout(()=>{
      U.hoja(`<h2 style="margin:0 0 10px">Estás viendo una vista de ejemplo</h2>
       <p>No encontré tus respuestas del quiz en este dispositivo, así que estoy mostrando un perfil de muestra para que veas cómo funciona la app.</p>
       <p class="small muted">Si ya compraste, abrí la app desde el mismo navegador donde hiciste el quiz. Si preferís, podés hacer el quiz ahora y la app se arma con tus respuestas.</p>
       <a class="btn" href="../index.html?reset=1" style="text-decoration:none">Hacer el quiz</a>
       <button class="btn ghost" data-cerrar style="margin:10px 0 0">Seguir mirando el ejemplo</button>`);
    },900);
  }
}
if(document.readyState==="loading")addEventListener("DOMContentLoaded",arrancar);else arrancar();
})();
