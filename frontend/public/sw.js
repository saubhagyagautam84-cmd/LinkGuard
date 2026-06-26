const CACHE = 'linkguard-v1'
const SHELL = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/icons/icon192.png',
  '/icons/icon512.png',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  // Don't cache API calls — always go network
  if (request.url.includes('/api/')) return

  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        // Cache successful GET requests for static assets
        if (request.method === 'GET' && res.status === 200) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(request, clone))
        }
        return res
      }).catch(() => {
        // Offline fallback — serve app shell for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html')
        }
      })
    })
  )
})
