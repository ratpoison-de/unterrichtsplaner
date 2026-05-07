const CACHE = 'unterrichtsplaner-v1';
const CORE  = ['./index.html','./manifest.json','./pags_logo.png',
                './icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.allSettled(CORE.map(u => c.add(u).catch(()=>{})))
  ).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(url.hostname.includes('googleapis.com')||
     url.hostname.includes('accounts.google.com')||
     url.hostname.includes('gstatic.com')) return;
  if(url.hostname.includes('fonts.googleapis.com')||url.hostname.includes('fonts.gstatic.com')){
    e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
      caches.open(CACHE).then(c=>c.put(e.request,r.clone())); return r;
    }).catch(()=>c)));
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>{
    if(c) return c;
    return fetch(e.request).then(r=>{
      if(r&&r.status===200) caches.open(CACHE).then(c=>c.put(e.request,r.clone()));
      return r;
    });
  }));
});
