// KILL SWITCH — not an active service worker.
//
// An earlier version of this file (offline video caching) was live for a
// while and got registered in some visitors' browsers. It was later
// removed from the deploy, but a browser doesn't necessarily notice a
// service worker's script disappeared (a 404 on update-check) for a long
// time — spec allows up to 24h, sometimes longer in practice. Until then,
// the OLD service worker keeps running and keeps serving whatever it had
// cached under /api/media/*.mp4 from back then — a stale copy predating
// later fixes (e.g. the faststart remux). That's a very plausible
// explanation for "works in a private window, not in my normal browser":
// a private window never had the old service worker registered at all.
//
// This file replaces it and immediately unregisters itself, clears
// everything the old one cached, and forces every open tab to reload once
// so they pick up real content from the network instead of the stale
// cache — a standard "kill switch" pattern for retiring a service worker
// rather than waiting for the browser's own update-check schedule.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.registration.unregister()
      const clientsList = await self.clients.matchAll({ type: 'window' })
      clientsList.forEach((client) => client.navigate(client.url))
    })()
  )
})
