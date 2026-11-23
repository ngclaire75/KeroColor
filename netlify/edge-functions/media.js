// Proxies /api/media/<key> to the Cloudflare R2 bucket from the site's own
// origin. The R2 auto-subdomain (pub-*.r2.dev) has shown unreliable DNS
// resolution on some networks ("hostname could not be found" even on a pure
// <link rel="preconnect">), and the browser has already resolved this site's
// hostname to load the page, so same-origin media needs no new DNS lookup.
// Handles plain MP4 files and HLS output (playlists + segment files).
const R2_BASE = 'https://pub-638c4a59407449fea49102cbe427741f.r2.dev'

const EXT_TYPES = {
  mp4: 'video/mp4',
  m3u8: 'application/vnd.apple.mpegurl',
  ts: 'video/mp2t',
}

export default async function handler(request) {
  const url = new URL(request.url)
  const key = decodeURIComponent(url.pathname.replace(/^\/api\/media\/?/, ''))
  const ext = key.split('.').pop()

  if (!key || !EXT_TYPES[ext]) {
    return new Response('Not found', { status: 404 })
  }

  const upstreamHeaders = {}
  const range = request.headers.get('range')
  if (range) upstreamHeaders['Range'] = range

  const upstreamRes = await fetch(`${R2_BASE}/${key}`, { headers: upstreamHeaders })

  const headers = new Headers()
  headers.set('Content-Type', upstreamRes.headers.get('content-type') || EXT_TYPES[ext])
  headers.set('Accept-Ranges', 'bytes')
  const contentLength = upstreamRes.headers.get('content-length')
  if (contentLength) headers.set('Content-Length', contentLength)
  const contentRange = upstreamRes.headers.get('content-range')
  if (contentRange) headers.set('Content-Range', contentRange)
  // A CDN cache keyed on the URL alone would serve one cached 206 byte-range
  // to every other range request, corrupting playback and seeking, so 206s
  // are never cached. Full responses get a short max-age, not immutable:
  // these files have changed at the same path before (re-trims, faststart
  // remux), and a year-long cache would keep a stale copy long after.
  headers.set(
    'Cache-Control',
    upstreamRes.status === 206 ? 'no-store' : 'public, max-age=300, must-revalidate'
  )

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers,
  })
}

export const config = { path: '/api/media/*' }
