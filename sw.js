// Guarda los archivos de la app para que abra sin internet.
// Solo maneja archivos de esta misma página: Firebase se conecta directo a la nube.
const CACHE = 'ventas-nube-v1';
const FILES = ['./', './index.html', './firebase.js', './exceljs.min.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(e.request, {ignoreSearch:true});
    const net = fetch(e.request).then(res => { if(res && res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || cache.match('./index.html');
  }));
});
