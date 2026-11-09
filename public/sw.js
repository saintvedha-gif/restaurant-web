// Service worker de Mucha Mazorca: permite instalar la app y abrirla rapido.
const CACHE = 'mm-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Paginas: primero internet, si no hay, la ultima copia guardada
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Archivos de la app (con hash) y fotos de Cloudinary: copia guardada primero
  const isAsset = url.origin === self.location.origin && url.pathname.startsWith('/assets/');
  const isPhoto = url.hostname === 'res.cloudinary.com';
  if (isAsset || isPhoto) {
    event.respondWith(
      caches.match(req).then(
        hit =>
          hit ||
          fetch(req).then(res => {
            if (res.ok || res.type === 'opaque') {
              const copy = res.clone();
              caches.open(CACHE).then(c => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
  // El resto de solicitudes va directo a internet, sin guardar.
});

// ---- Notificaciones push ----
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Mucha Mazorca', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Mucha Mazorca 🌽';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  let url = (event.notification.data && event.notification.data.url) || '/';
  if (typeof url !== 'string' || url.charAt(0) !== '/') url = '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) {
          return client
            .focus()
            .then(c => (c && 'navigate' in c ? c.navigate(url) : undefined))
            .catch(() => undefined);
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
