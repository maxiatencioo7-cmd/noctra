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

window.NOCTRA_CODIGO={codificar:codificar,decodificar:decodificar};
})();
