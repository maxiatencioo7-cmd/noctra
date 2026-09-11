/* Noctra — el nombre del retrato.

   Un dibujo sin nombre es un dibujo. Con nombre es una persona. Por eso el
   nombre se revela junto con la cara.

   La regla que manda: el nombre tiene que ser creíble para la edad de ESA
   cara. En Argentina los nombres son un reloj bastante exacto — una mujer
   de sesenta y seis se llama Graciela o Norma, no Delfina; una de veintidós
   se llama Delfina o Zoe, no Graciela. Poner un nombre de la década
   equivocada rompe el hechizo en un segundo.

   Por eso el nombre NO sale de la franja de edad que pidió la persona en el
   test, sino de la edad concreta del retrato que le tocó. La franja "30 a
   40" puede terminar en una cara de 34 o de 36, y el reparto cambia.

   Determinístico como el retrato: las mismas respuestas dan el mismo nombre
   siempre, en cualquier teléfono. Si cambiara entre una visita y otra, la
   persona se daría cuenta de que es un sorteo. */
(function(){

/* Cinco camadas, por año de nacimiento aproximado. Los nombres de cada una
   son los que de verdad se pusieron en esos años en Argentina. */
var POOLS={
  /* nacidos hasta ~1966 — hoy 60 y pico */
  g1:{
    f:["Graciela","Norma","Susana","Mónica","Silvia","Beatriz","Cristina","Alicia",
       "Marta","Elsa","Mirta","Nélida","Estela","Ana María","Dora","Olga"],
    m:["Jorge","Carlos","Ricardo","Rubén","Héctor","Osvaldo","Roberto","Alberto",
       "Oscar","Raúl","Néstor","Eduardo","Horacio","Omar","Julio","Antonio"]
  },
  /* nacidos ~1967-1980 — hoy entre 46 y 59 */
  g2:{
    f:["Liliana","Claudia","Sandra","Patricia","Andrea","Adriana","Marcela","Karina",
       "Viviana","Alejandra","Silvina","Gabriela","Mariela","Fabiana","Laura","Verónica"],
    m:["Daniel","Sergio","Marcelo","Gustavo","Fernando","Claudio","Gabriel","Alejandro",
       "Pablo","Adrián","Walter","Darío","Guillermo","Mariano","Javier","Diego"]
  },
  /* nacidos ~1981-1993 — hoy entre 33 y 45 */
  g3:{
    f:["Natalia","Romina","Carolina","Mariana","Vanesa","Analía","Cecilia","Soledad",
       "Daniela","Noelia","Yamila","Jimena","Luciana","Eugenia","Paula","Lorena"],
    m:["Leandro","Matías","Nicolás","Emanuel","Cristian","Hernán","Maximiliano","Federico",
       "Lucas","Ezequiel","Rodrigo","Damián","Martín","Sebastián","Ariel","Esteban"]
  },
  /* nacidos ~1994-2003 — hoy entre 25 y 32 */
  g4:{
    f:["Camila","Micaela","Agustina","Florencia","Rocío","Ayelén","Julieta","Sofía",
       "Brenda","Milagros","Candela","Antonella","Macarena","Aldana","Belén","Malena"],
    m:["Facundo","Franco","Agustín","Iván","Nahuel","Joaquín","Tomás","Bruno",
       "Gonzalo","Santiago","Lucio","Ramiro","Gastón","Lisandro","Ignacio","Juan Cruz"]
  },
  /* nacidos ~2004 en adelante — hoy 24 o menos */
  g5:{
    f:["Valentina","Martina","Catalina","Delfina","Emma","Mía","Zoe","Abril",
       "Lara","Isabella","Renata","Alma","Olivia","Jazmín","Amanda","Guadalupe"],
    m:["Thiago","Benjamín","Bautista","Santino","Valentino","Mateo","Ciro","Dylan",
       "Lorenzo","Lautaro","Bastian","Gael","Simón","Dante","Baltazar","Elías"]
  }
};

/* La edad del retrato manda. Los cortes están donde de verdad cambia la moda
   de nombres, no en números redondos. */
function camada(edad){
  var e=Number(edad)||35;
  if(e>=60) return "g1";
  if(e>=46) return "g2";
  if(e>=33) return "g3";
  if(e>=25) return "g4";
  return "g5";
}

/* Semilla propia, distinta de la del retrato. Si usara la misma, el nombre
   quedaría atado al mismo número que ya eligió la cara y ciertos retratos
   caerían siempre en el mismo nombre. El archivo del retrato entra en la
   cuenta para que la cara y el nombre viajen juntos. */
function semilla(p, archivo){
  var f=p.fecha||{};
  var s=["n", archivo||"", p.energia,p.apariencia,p.decision,p.motivo,p.dificultad,
         p.lenguaje,p.experiencias,p.opuestos,p.pelo,p.etnia,
         f.d, f.m, f.y].join("|");
  var h=0x811C9DC5;
  for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=(h*16777619)>>>0; }
  /* un paso extra de mezcla: sin esto, semillas parecidas caen en el mismo
     índice cuando el pool es chico */
  h^=h>>>15; h=(h*2246822507)>>>0; h^=h>>>13;
  return h>>>0;
}

/* p  = el perfil del test
   fi = la ficha del retrato elegido {g, edad, f}. Si no viene, se cae a lo
        que se pueda deducir del perfil. */
function elegir(p, fi){
  p=p||{};
  var g, edad, archivo;

  if(fi && fi.g){ g=fi.g; edad=fi.edad; archivo=fi.f; }
  else{
    g=(p.generoRetrato==="f"||p.generoRetrato==="m") ? p.generoRetrato
      : (p.genero==="m" ? "f" : "m");
    edad=({"20":25,"30":35,"40":45,"50":60})[p.edad]||35;
    archivo="";
  }

  var pool=(POOLS[camada(edad)]||POOLS.g3)[g==="f"?"f":"m"];
  return pool[ semilla(p, archivo) % pool.length ];
}

window.NOCTRA_NOMBRES={
  elegir: elegir,
  camada: camada,
  pools:  POOLS
};
})();
