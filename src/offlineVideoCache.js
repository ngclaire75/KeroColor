// Asks the service worker (public/sw.js) to download and permanently store
// a full copy of a video in Cache Storage for offline/instant-load use on
// future visits. Safe to call repeatedly — the worker itself no-ops if a
// full copy is already cached, and silently does nothing if service
// workers aren't supported or one hasn't taken control yet.
export function cacheVideoOffline(path) {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.ready
    .then((reg) => reg.active?.postMessage({ type: 'CACHE_VIDEO', url: path }))
    .catch(() => {})
}
