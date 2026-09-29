// Conti in tasca: funziona anche offline. Cambia VERSIONE a ogni aggiornamento dei file.
const VERSIONE = 'cit-v1';
const FILE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSIONE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // la pagina: prima la versione online (così ricevi gli aggiornamenti), altrimenti quella salvata
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copia = r.clone(); caches.open(VERSIONE).then(c => c.put('./index.html', copia)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // il resto (icone, caratteri): prima la copia salvata
  e.respondWith(caches.match(req).then(salvato => salvato || fetch(req).then(r => {
    const u = new URL(req.url);
    if (r.ok && (u.origin === location.origin || u.hostname.endsWith('gstatic.com') || u.hostname.endsWith('googleapis.com'))) {
      const copia = r.clone(); caches.open(VERSIONE).then(c => c.put(req, copia));
    }
    return r;
  })));
});
