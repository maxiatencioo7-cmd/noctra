/* Noctra App — capa de datos y cálculos astrológicos */
(function(){
const SIGNOS=["Capricornio","Acuario","Piscis","Aries","Tauro","Géminis","Cáncer","Leo","Virgo","Libra","Escorpio","Sagitario"];
const LIM=[19,18,20,19,20,20,22,22,22,22,21,21];
const ELEMENTO={Aries:"fuego",Leo:"fuego",Sagitario:"fuego",Tauro:"tierra",Virgo:"tierra",Capricornio:"tierra",
  Géminis:"aire",Libra:"aire",Acuario:"aire",Cáncer:"agua",Escorpio:"agua",Piscis:"agua"};
const MODO={Aries:"cardinal",Cáncer:"cardinal",Libra:"cardinal",Capricornio:"cardinal",
  Tauro:"fijo",Leo:"fijo",Escorpio:"fijo",Acuario:"fijo",
  Géminis:"mutable",Virgo:"mutable",Sagitario:"mutable",Piscis:"mutable"};
const REGENTE={Aries:"Marte",Tauro:"Venus",Géminis:"Mercurio",Cáncer:"la Luna",Leo:"el Sol",Virgo:"Mercurio",
  Libra:"Venus",Escorpio:"Plutón",Sagitario:"Júpiter",Capricornio:"Saturno",Acuario:"Urano",Piscis:"Neptuno"};

function signoDe(d,m){return d>LIM[m-1]?SIGNOS[m%12]:SIGNOS[m-1];}
function elementoDe(s){return ELEMENTO[s]||"aire";}
function modoDe(s){return MODO[s]||"mutable";}
function regenteDe(s){return REGENTE[s]||"Venus";}

/* Luna: aproximación por ciclo sinódico desde una luna nueva conocida */
const LUNA_NUEVA=Date.UTC(2000,0,6,18,14);
const SIN=29.530588853*86400000;
function faseLunar(fecha){
  const t=(fecha.getTime()-LUNA_NUEVA)%SIN;
  const edad=(t<0?t+SIN:t)/86400000;
  const p=edad/29.530588853;
  let n,nom;
  if(p<0.033){n=0;nom="Luna nueva";}
  else if(p<0.216){n=1;nom="Creciente";}
  else if(p<0.283){n=2;nom="Cuarto creciente";}
  else if(p<0.466){n=3;nom="Gibosa creciente";}
  else if(p<0.533){n=4;nom="Luna llena";}
  else if(p<0.716){n=5;nom="Gibosa menguante";}
  else if(p<0.783){n=6;nom="Cuarto menguante";}
  else if(p<0.966){n=7;nom="Menguante";}
  else {n=0;nom="Luna nueva";}
  return {edad:edad,frac:p,indice:n,nombre:nom,iluminacion:Math.round((1-Math.cos(2*Math.PI*p))/2*100)};
}
function proximaFase(objetivo,desde){ // objetivo: 0 nueva, 0.5 llena
  const d=desde||new Date();
  for(let i=0;i<60;i++){
    const f=new Date(d.getTime()+i*86400000);
    const a=faseLunar(f).frac, b=faseLunar(new Date(f.getTime()+86400000)).frac;
    if(objetivo===0){ if(b<a) return f; }
    else { if(a<0.5&&b>=0.5) return f; }
  }
  return null;
}
/* Signo lunar aproximado: la Luna recorre ~13.176°/día */
function signoLunar(fecha){
  const dias=(fecha.getTime()-LUNA_NUEVA)/86400000;
  const grados=(((dias*13.176358+310)%360)+360)%360;
  return SIGNOS[((Math.floor(grados/30)+9)%12+12)%12];
}
/* Ascendente aproximado por hora de nacimiento (2h por signo desde el solar al amanecer) */
function ascendenteAprox(signoSolar,hora){
  if(hora===null||hora===undefined||hora==="")return null;
  const h=parseInt(String(hora).split(":")[0],10);
  if(isNaN(h))return null;
  const i=SIGNOS.indexOf(signoSolar);
  return SIGNOS[(i+Math.floor(((h+18)%24)/2))%12];
}

/* Ventanas de encuentro: períodos donde el regente de las relaciones favorece */
function ventanas(signoSolar,desde){
  const base=desde||new Date();
  const i=SIGNOS.indexOf(signoSolar);
  const opuesto=SIGNOS[(i+6)%12];
  const trigono1=SIGNOS[(i+4)%12], trigono2=SIGNOS[(i+8)%12];
  const out=[];
  for(let k=0;k<12;k++){
    const mes=new Date(base.getFullYear(),base.getMonth()+k,1);
    const signoMes=signoDe(15,mes.getMonth()+1);
    let fuerza=0,motivo="";
    if(signoMes===opuesto){fuerza=3;motivo="El Sol transita tu signo opuesto: es el tramo del año en que los vínculos se vuelven el tema central.";}
    else if(signoMes===trigono1||signoMes===trigono2){fuerza=2;motivo="El Sol transita un signo de tu mismo elemento: las cosas fluyen sin que tengas que forzarlas.";}
    else if(signoMes===signoSolar){fuerza=2;motivo="El Sol vuelve a tu signo: se te nota más, y eso atrae.";}
    if(fuerza){
      const ini=new Date(mes.getFullYear(),mes.getMonth(),8);
      const fin=new Date(mes.getFullYear(),mes.getMonth(),24);
      out.push({inicio:ini,fin:fin,fuerza:fuerza,motivo:motivo,signo:signoMes});
    }
  }
  return out.slice(0,6);
}

/* Sinastría simple entre dos signos */
function sinastria(a,b){
  const ia=SIGNOS.indexOf(a), ib=SIGNOS.indexOf(b);
  const d=Math.abs(ia-ib)%12, dist=Math.min(d,12-d);
  const ea=elementoDe(a), eb=elementoDe(b);
  const compat={fuego:{fuego:"se encienden",aire:"se alimentan",tierra:"se frenan",agua:"se apagan"},
    aire:{aire:"se entienden",fuego:"se alimentan",agua:"se confunden",tierra:"se aburren"},
    tierra:{tierra:"se sostienen",agua:"se nutren",fuego:"se frenan",aire:"se aburren"},
    agua:{agua:"se funden",tierra:"se nutren",fuego:"se apagan",aire:"se confunden"}};
  let aspecto,nota;
  if(dist===0){aspecto="conjunción";nota="Son el mismo signo. Se entienden sin explicarse, y también repiten el mismo error.";}
  else if(dist===1){aspecto="semisextil";nota="Signos vecinos: se rozan sin terminar de encajar. Hace falta traducción.";}
  else if(dist===2){aspecto="sextil";nota="Se estimulan. Es de las combinaciones más livianas de sostener.";}
  else if(dist===3){aspecto="cuadratura";nota="Hay fricción real. Puede ser motor o desgaste, según cómo discutan.";}
  else if(dist===4){aspecto="trígono";nota="Fluye casi solo. El riesgo es la comodidad: puede faltar chispa.";}
  else if(dist===5){aspecto="quincuncio";nota="Miran en direcciones distintas. Requiere decisión, no solo ganas.";}
  else {aspecto="oposición";nota="Polos opuestos. Máxima atracción y máximo espejo de lo que a cada uno le falta.";}
  const puntaje=({conjunción:72,semisextil:52,sextil:80,cuadratura:58,"trígono":86,quincuncio:50,"oposición":76})[aspecto];
  return {aspecto:aspecto,nota:nota,puntaje:puntaje,elementos:ea+" y "+eb,quimica:compat[ea][eb]};
}

window.NOCTRA_ASTRO={SIGNOS,signoDe,elementoDe,modoDe,regenteDe,faseLunar,proximaFase,signoLunar,ascendenteAprox,ventanas,sinastria};
})();
