// Proxies media requests through kerocolor.vercel.app itself instead of the
// browser hitting the Cloudflare R2 origin (pub-*.r2.dev) directly. The R2
// auto-subdomain has shown unreliable DNS resolution on some networks
// (confirmed failing on at least two independent networks, including a
// user's real browser — "hostname could not be found" even on a pure
// <link rel="preconnect"> with zero JS involvement). Since the browser has
// already resolved kerocolor.vercel.app to load the page, routing media
// through that same origin needs no new DNS lookup at all. The actual R2
// fetch happens on Vercel's servers, which have no trouble reaching R2.
//
// A single fixed-name function (not a filesystem [...catch-all], which
// doesn't reliably route nested paths outside Next.js) — vercel.json
// rewrites /api/media/<key> to /api/media?path=<key>, and this function
// reads the R2 object key from that query param. Handles both plain MP4
// files and HLS output (playlists + many small segment files per video).
export const config = { runtime: 'edge' }

const R2_BASE = 'https://pub-638c4a59407449fea49102cbe427741f.r2.dev'

const EXT_TYPES = {
  mp4: 'video/mp4',
  m3u8: 'application/vnd.apple.mpegurl',
  ts: 'video/mp2t',
}

export default async function handler(request) {
  const url = new URL(request.url)
  const key = url.searchParams.get('path') || ''
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
  // Vercel's edge CDN cache keys on the URL alone — it does not vary by
  // the Range header. A specific byte-range (206) response cached under
  // the plain URL would then get served for every other range request
  // too, silently corrupting playback/seeking — so those must never be
  // cached. Only an actual 206 stays uncached.
  //
  // Full (200) responses used to be marked `immutable, max-age=31536000`
  // (cache forever, never revalidate) — wrong for these specific URLs,
  // since their content has genuinely changed multiple times at the same
  // path this session (re-trims, faststart remux). A browser that ever
  // cached a full response under the old policy would keep serving that
  // stale copy for up to a year regardless of what's actually on R2 now —
  // a private window (empty cache) would look fine while a normal browser
  // session (holding the old cached copy) would look broken, which
  // matches exactly what was reported. Kept short instead: real caching
  // benefit within a session, but it self-heals soon if the file changes
  // again, rather than staying wrong for a year.
  headers.set(
    'Cache-Control',
    upstreamRes.status === 206 ? 'no-store' : 'public, max-age=300, must-revalidate'
  )

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers,
  })
}
