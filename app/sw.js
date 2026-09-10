/* Noctra — service worker.
   Imágenes e íconos: primero la caché (no cambian).
   Código y páginas: primero la red, con la caché como respaldo sin señal. */
const CACHE="noctra-app-v3";
const ARCHIVOS=["./","./index.html","./css/app.css","../js/perfil-codigo.js","./js/astro.js","./js/datos.js","./js/lectura.js","./js/ui.js","./js/maia.js","./js/app.js","./manifest.webmanifest","./icons/icon.svg","./icons/icon-192.png","./icons/icon-512.png","./assets/retrato-m-full.webp","./assets/retrato-f-full.webp"];
const inmutable=u=>/\/(assets|icons)\//.test(u.pathname);

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
  const guardar=res=>{ if(res&&res.ok){const cl=res.clone();caches.open(CACHE).then(c=>c.put(r,cl));} return res; };

  if(u.origin===location.origin && inmutable(u)){
    e.respondWith(caches.match(r).then(c=>c||fetch(r).then(guardar)));
    return;
  }
  // red primero: así una actualización se ve enseguida
  e.respondWith(
    fetch(r).then(guardar).catch(()=>caches.match(r).then(c=>c||(r.mode==="navigate"?caches.match("./index.html"):undefined)))
  );
});
