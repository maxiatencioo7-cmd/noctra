/* Noctra — codifica y decodifica el perfil del quiz en un código corto.
   Lo usan el quiz (para mandarlo a Shopify) y la app (para reconstruirlo).
   Un solo archivo compartido: si se toca una tabla, se toca en los dos lados a la vez. */
(function(){
const T={
  genero:      ["f","m"],
  interes:     ["f","m","x"],
  edad:        ["20","30","40","50"],
  etnia:       ["afro","europeo","latino","asiatico","libre"],
  apariencia:  ["mucho","algo","personalidad"],
  decision:    ["emociones","logica","depende"],
  motivo:      ["confianza","comunicacion","distancia","objetivos","infidelidad","egoismo","otro"],
  dificultad:  ["correcta","pasado","chispa","dudas","abrirme","limites"],
  lenguaje:    ["palabras","regalos","actividades","contacto","gestos"],
  energia:     ["carinosa","calma","juguetona","aventurera","equilibrada","apasionada","otra"],
  experiencias:["viajar","tranquilos","logros","crear","familia"],
  pelo:        ["a","b","c"]
};
const ORDEN=["genero","interes","edad","etnia","apariencia","decision","motivo","dificultad","lenguaje","energia","experiencias","pelo"];
const CUAL=["Amable","Comprensivo/a","Honesto/a","Optimista","Leal","Cariñoso/a","Seguro/a","Apasionado/a","Divertido/a","Protector/a"];
const FUT=["Comprar una casa","Vivir aventuras","Formar una familia","Crear lindos recuerdos","Tener un negocio","Atravesar desafíos juntos","Otro"];

const C36="0123456789abcdefghijklmnopqrstuvwxyz";
const ch=i=>(i<0||i>35)?"z":C36[i];
const ix=c=>C36.indexOf(String(c||"").toLowerCase());
const dos=n=>String(n).length<2?"0"+n:String(n);

function codificar(a){
  if(!a||!a.fecha||!a.experiencias) return "";
  let s="1";
  ORDEN.forEach(k=>{ s+=ch(T[k].indexOf(String(a[k]==null?"":a[k]))); });
  const f=a.fecha;
  s+="."+dos(f.d)+dos(f.m)+f.y;
  s+="."+(a.cualidades||[]).map(x=>ch(CUAL.indexOf(x))).filter(c=>c!=="z").join("");
  s+="."+(a.futuro||[]).map(x=>ch(FUT.indexOf(x))).filter(c=>c!=="z").join("");
  s+="."+ch(Math.max(1,Math.min(5,+a.opuestos||3)));
  return s;
}

function decodificar(s){
  try{
    const p=String(s||"").trim().split(".");
    if(p.length<5||p[0].charAt(0)!=="1") return null;
    const campos=p[0].slice(1);
    if(campos.length<ORDEN.length) return null;
    const a={};
    ORDEN.forEach((k,i)=>{ const v=T[k][ix(campos.charAt(i))]; if(v!=null) a[k]=v; });
    const f=p[1];
    if(!/^\d{8}$/.test(f)) return null;
    const d=+f.slice(0,2), m=+f.slice(2,4), y=+f.slice(4);
    if(d<1||d>31||m<1||m>12||y<1900||y>2100) return null;
    a.fecha={d:d,m:m,y:y};
    a.cualidades=p[2].split("").map(c=>CUAL[ix(c)]).filter(Boolean);
    a.futuro=p[3].split("").map(c=>FUT[ix(c)]).filter(Boolean);
    const op=ix(p[4]); a.opuestos=(op>=1&&op<=5)?op:3;
    if(!a.genero||!a.experiencias) return null;
    a.generoRetrato = a.interes==="x" ? (a.genero==="m"?"f":"m") : (a.interes||(a.genero==="m"?"f":"m"));
    if(!a.pelo) a.pelo="a";
    return a;
  }catch(e){ return null; }
}

/* ── puente del quiz nuevo ───────────────────────────────────────────
   El quiz nuevo (v2) y este código nacieron separados: preguntan cosas
   distintas y guardan en claves distintas. Resultado: el comprador llegaba
   a la app y ésta no encontraba nada suyo, así que le hacía el test corto
   OTRA VEZ. Todos. No era un caso raro.

   Esto traduce lo que el quiz nuevo sí preguntó. Lo que no preguntó se
   completa con los mismos valores neutros que usa el test corto de la app,
   y el perfil queda marcado como "corto" para poder ofrecerle después
   completar la lectura. Es mejor una lectura general que una pantalla de
   preguntas a alguien que acaba de pagar. */

/* El lenguaje del amor se pregunta en los dos, con nombres distintos.
   "actos" (actos de servicio) es lo que acá se llama "gestos"; "tiempo"
   (tiempo de calidad) es "actividades". */
const LENG_V2={ palabras:"palabras", actos:"gestos", regalos:"regalos",
                tiempo:"activid" + "ades", contacto:"contacto" };

/* Valores neutros, los MISMOS que usa el test corto de adentro de la app:
   si divergieran, la misma persona leería dos lecturas distintas según por
   dónde entró. */
const NEUTRO_V2={
  etnia:"libre", apariencia:"algo", decision:"emociones",
  motivo:"comunicacion", dificultad:"abrirme", energia:"calma",
  experiencias:"tranquilos", pelo:"a",
  cualidades:["Leal"], futuro:["Crear lindos recuerdos"], opuestos:3
};

function tramoEdad(f){
  try{
    const hoy=new Date();
    let e=hoy.getFullYear()-f.y;
    const cumplio=(hoy.getMonth()+1>f.m)||(hoy.getMonth()+1===f.m&&hoy.getDate()>=f.d);
    if(!cumplio) e--;
    if(e<26) return "20";
    if(e<36) return "30";
    if(e<46) return "40";
    return "50";
  }catch(e){ return "30"; }
}

function desdeV2(a){
  try{
    if(!a) return null;
    const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(a.fecha_nac||""));
    if(!iso) return null;                       /* sin fecha no hay lectura */
    const fecha={ d:+iso[3], m:+iso[2], y:+iso[1] };
    const genero = a.genero==="hombre" ? "m" : "f";
    /* "Me atraen". El quiz no la preguntaba y se asumía el sexo opuesto, con
       lo cual a quien no es heterosexual le llegaba el retrato equivocado.
       El fallback sigue siendo el opuesto, para los perfiles guardados antes
       de que la pregunta existiera. */
    const interes = a.interes==="hombres" ? "m"
                  : a.interes==="mujeres" ? "f"
                  : a.interes==="ambos"   ? "x"
                  : (genero==="m" ? "f" : "m");
    const out=Object.assign({}, NEUTRO_V2, {
      genero:genero,
      interes: interes,
      edad: tramoEdad(fecha),
      fecha: fecha,
      corto: true
    });
    const l=LENG_V2[a.lenguaje];
    if(l) out.lenguaje=l; else out.lenguaje="palabras";
    out.generoRetrato = interes==="x" ? (genero==="m"?"f":"m") : interes;
    return out;
  }catch(e){ return null; }
}

window.NOCTRA_CODIGO={codificar:codificar,decodificar:decodificar,desdeV2:desdeV2};
})();
