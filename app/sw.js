/* Noctra — service worker. Todo lo descargado funciona sin señal. */
const CACHE="noctra-app-v1";
const ARCHIVOS=["./","./index.html","./css/app.css","./js/astro.js","./js/datos.js","./js/lectura.js","./js/ui.js","./js/maia.js","./js/app.js","./manifest.webmanifest","./icons/icon.svg","./icons/icon-192.png","./icons/icon-512.png","./assets/retrato-m-full.webp","./assets/retrato-f-full.webp"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin!==location.origin){ // fuentes: red primero, cache de respaldo
    e.respondWith(fetch(r).then(res=>{const cl=res.clone();caches.open(CACHE).then(c=>c.put(r,cl));return res;}).catch(()=>caches.match(r)));
    return;
  }
  e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{
    if(res.ok){const cl=res.clone();caches.open(CACHE).then(x=>x.put(r,cl));}
    return res;
  }).catch(()=>caches.match("./index.html"))));
});
