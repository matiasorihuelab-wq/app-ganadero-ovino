// Service worker.
//
// Estrategia (evita servir versiones viejas tras un deploy):
//  - Navegación / HTML: NETWORK-FIRST. Online siempre trae la última app (y el
//    index.html nuevo referencia los assets hasheados nuevos); offline cae al cache.
//  - Resto (assets hasheados, íconos, manifest): STALE-WHILE-REVALIDATE. Sirve del
//    cache al instante y actualiza en segundo plano, así la próxima carga es fresca.
//  - CACHE versionado: al subir la versión, `activate` borra los caches anteriores.
//
// Antes era cache-first puro: una URL cacheada no se actualizaba nunca y la app
// quedaba congelada en la primera versión vista. Esto lo corrige.
const CACHE = 'rentab-ovina-v2'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) =>
  e.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  ),
)

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || !req.url.startsWith('http')) return

  const esNavegacion =
    req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')

  if (esNavegacion) {
    // Network-first: la app más reciente cuando hay red; cache como fallback offline.
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {})
          return res
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./'))),
    )
    return
  }

  // Stale-while-revalidate para el resto.
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((hit) => {
        const fresca = fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone())
            return res
          })
          .catch(() => hit)
        return hit || fresca
      }),
    ),
  )
})
