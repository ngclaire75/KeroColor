// Proxies video requests through kerocolor.vercel.app itself instead of the
// browser hitting the Cloudflare R2 origin (pub-*.r2.dev) directly. The R2
// auto-subdomain has shown unreliable DNS resolution on some networks
// (confirmed failing on at least two independent networks, including a
// user's real browser — "hostname could not be found" even on a pure
// <link rel="preconnect"> with zero JS involvement). Since the browser has
// already successfully resolved kerocolor.vercel.app to load the page,
// routing the video through the same origin needs no new DNS lookup at
// all. The actual R2 fetch happens on Vercel's servers, which have no
// trouble reaching R2 (verified directly via curl).
export const config = { runtime: 'edge' }

const R2_BASE = 'https://pub-638c4a59407449fea49102cbe427741f.r2.dev'
const ALLOWED = new Set(['blush.mp4', 'video2.mp4', 'video4.mp4', 'video5.mp4'])

export default async function handler(request) {
  const url = new URL(request.url)
  const file = url.pathname.split('/').pop()

  if (!ALLOWED.has(file)) {
    return new Response('Not found', { status: 404 })
  }

  const upstreamHeaders = {}
  const range = request.headers.get('range')
  if (range) upstreamHeaders['Range'] = range

  const upstreamRes = await fetch(`${R2_BASE}/${file}`, { headers: upstreamHeaders })

  const headers = new Headers()
  headers.set('Content-Type', upstreamRes.headers.get('content-type') || 'video/mp4')
  headers.set('Accept-Ranges', 'bytes')
  const contentLength = upstreamRes.headers.get('content-length')
  if (contentLength) headers.set('Content-Length', contentLength)
  const contentRange = upstreamRes.headers.get('content-range')
  if (contentRange) headers.set('Content-Range', contentRange)
  // Vercel's edge CDN cache keys on the URL alone — it does not vary by
  // the Range header. Whichever response (full 200 or a specific 206
  // byte-range) happens to be cached first for a given URL then gets
  // served to every subsequent request regardless of what was actually
  // asked for, silently corrupting playback/seeking. Never cache any
  // response from this proxy at the edge to avoid that entirely.
  headers.set('Cache-Control', 'no-store')

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers,
  })
}
