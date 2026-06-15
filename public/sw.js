// Service worker: cache-first para funcionamiento offline tras la 1ª visita.
const CACHE = 'rentab-ovina-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || !req.url.startsWith('http')) return
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((hit) =>
        hit ||
        fetch(req).then((res) => {
          try { if (res && res.status === 200) cache.put(req, res.clone()) } catch (_) {}
          return res
        }).catch(() => hit)
      )
    )
  )
})
