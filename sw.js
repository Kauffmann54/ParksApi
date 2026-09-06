const CACHE='filas-orlando-v1';
const ASSETS=['./','./index.html','./styles.css','./app.js','./parks.json','./aliases.json','./strategy_overlay.runtime.json','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname==='api.themeparks.wiki') return; // live API is always network-only
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});