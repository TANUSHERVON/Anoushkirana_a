// Basic offline cache for Muslim Lite
const CACHE = 'muslim-lite-v1';
const ASSETS = [
  './', './index.html', './app.js', './styles.css',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './data/quran-pack.json', './data/quran.json', './data/quran-tg-starter.json'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
      const copy = resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
      return resp;
    }).catch(()=>caches.match('./index.html')))
  );
});
