// Offline video cache. The hero/studio videos are large (200-330MB each,
// full original quality, deliberately never compressed) — the first visit
// has to actually transfer those bytes once, no way around that. But once
// a full copy has been saved here, every visit after that (this device,
// this browser, even a fresh page load days later) is served straight from
// local storage — zero network wait, works offline.
//
// Only intercepts a request once a COMPLETE copy already exists in the
// cache; until then it doesn't touch the request at all, so the existing
// network/proxy path (api/media.js) behaves exactly as it does today. The
// actual background download-and-store happens from the page side (see
// HeroVideoContext.jsx / InspirationPage.jsx), not here — this file only
// serves what's already been cached and answers Range requests for it.
const CACHE_NAME = 'kerocolor-video-cache-v1'
const VIDEO_PATTERN = /^\/api\/media\/(blush|video2|video4|video5)\.mp4$/

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('kerocolor-video-cache') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || !VIDEO_PATTERN.test(url.pathname)) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(url.pathname)
      if (!cached) return fetch(event.request) // not cached yet — normal path, untouched

      return serveFromCache(cached, event.request.headers.get('range'))
    })()
  )
})

async function serveFromCache(cachedResponse, rangeHeader) {
  const blob = await cachedResponse.clone().blob()
  const size = blob.size
  const contentType = cachedResponse.headers.get('content-type') || 'video/mp4'

  if (!rangeHeader) {
    return new Response(blob, {
      status: 200,
      headers: { 'Content-Type': contentType, 'Content-Length': String(size), 'Accept-Ranges': 'bytes' },
    })
  }

  const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader)
  if (!match) return new Response(blob, { status: 200, headers: { 'Content-Type': contentType } })

  const start = parseInt(match[1], 10)
  const end = match[2] ? parseInt(match[2], 10) : size - 1
  const slice = blob.slice(start, end + 1)

  return new Response(slice, {
    status: 206,
    headers: {
      'Content-Type': contentType,
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  })
}

// The page side asks this worker to fetch-and-store a full copy of a video
// in the background (see cacheVideoOffline() in HeroVideoContext.jsx). Done
// here rather than purely on the page so the download keeps going via the
// service worker's own lifecycle rather than tying it to one page's fetch.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_VIDEO' || !event.data.url) return
  event.waitUntil(cacheFullVideo(event.data.url))
})

async function cacheFullVideo(path) {
  try {
    const cache = await caches.open(CACHE_NAME)
    if (await cache.match(path)) return // already have it
    const response = await fetch(path) // no Range header -> full 200 body
    if (!response.ok) return
    await cache.put(path, response)
  } catch {
    // Offline, storage quota hit, or the tab closed mid-download — fine,
    // it just stays uncached and falls back to the normal network path.
  }
}
