import { createContext, useContext, useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cacheVideoOffline } from './offlineVideoCache'

// The hero video (blush.mp4, ~330MB, full original quality) needs to start
// buffering the instant someone opens the site — not just once they
// navigate to /inspiration — so that by the time they actually get there
// and press play, it's already warmed up. A <video> mounted inside
// InspirationPage only starts fetching once that page mounts; unmounting
// it (e.g. navigating away) also throws away everything it had buffered.
//
// So the actual <video> element lives here, at the app root, outside the
// router — it mounts once when the site opens and is never unmounted while
// the app is alive. It portals its rendered output into whichever DOM node
// currently wants to display it: an invisible 0×0 div by default, or
// InspirationPage's hero container while that page is active. Moving a
// portal's target while the underlying React element/instance stays the
// same preserves the live <video> node (and everything it has buffered) —
// none of this counts as unmounting.
const HeroVideoContext = createContext(null)

export const HERO_VIDEO_URL = '/api/media/blush.mp4'

export function HeroVideoProvider({ children }) {
  const offscreenRef = useRef(null)
  const videoRef = useRef(null)
  // A reactive mirror of videoRef.current. The actual <video> only gets
  // created once shouldLoad flips true (up to ~2s after mount, see below);
  // a consumer (InspirationPage) landed on directly can mount before that
  // happens, and a plain ref object never changes identity, so an effect
  // keyed on it would find the ref empty once and never re-run once the
  // video actually appears. This state exists purely so consumers have
  // something that DOES change (and can be an effect dependency) at the
  // moment the video becomes real.
  const [videoEl, setVideoEl] = useState(null)
  // Tracks whether the user has pressed play yet (vs. the silent muted
  // warm-up autoplay) — lives here, not in InspirationPage, so it survives
  // navigating away and back.
  const startedRef = useRef(false)
  const [portalTarget, setPortalTarget] = useState(null)
  // The home page alone ships hundreds of MB of images (Hero.jsx has 10
  // full-bleed <img>s, several tens of MB each) that fire the instant the
  // page loads. Starting the ~330MB video fetch in that same instant, even
  // with fetchpriority="high", measured a 10s+ delay just for the first
  // response byte — badly bandwidth-starved despite the priority hint.
  // Waiting for the browser to go idle (or a capped fallback delay on
  // browsers without requestIdleCallback, e.g. Safari) lets the page's own
  // critical content get its shot at the connection first, so the video's
  // request actually gets real throughput once it starts — net faster to
  // a usable buffer than racing everything else from t=0.
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    setPortalTarget(offscreenRef.current)
  }, [])

  useEffect(() => {
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => setShouldLoad(true), { timeout: 2000 })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(() => setShouldLoad(true), 1500)
    return () => clearTimeout(id)
  }, [])

  // Once warm-up starts, also ask the service worker to save a full copy
  // to Cache Storage in the background — first visit still pays for the
  // download once, but every visit after that (this device/browser, even
  // offline) loads instantly with no network wait at all. See
  // public/sw.js and offlineVideoCache.js.
  useEffect(() => {
    if (shouldLoad) cacheVideoOffline(HERO_VIDEO_URL)
  }, [shouldLoad])

  return (
    <HeroVideoContext.Provider value={{ videoRef, videoEl, startedRef, setPortalTarget, offscreenRef }}>
      {children}
      {/* Default home for the video whenever no page has claimed it. */}
      <div ref={offscreenRef} style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, overflow: 'hidden' }} />
      {portalTarget && shouldLoad && createPortal(
        <video
          // A callback ref, not ref={videoRef} directly — empirically, a
          // plain object ref here let React's reconciler treat the portal's
          // container change (offscreen div <-> InspirationPage's slot) as
          // grounds to tear down and recreate the DOM node on navigation,
          // silently discarding everything it had buffered. A callback ref
          // avoided that; verified via repeated real navigations (buffered
          // seconds keep growing across the nav, never resetting to 0).
          ref={(el) => { videoRef.current = el; setVideoEl(el) }}
          src={HERO_VIDEO_URL}
          preload="auto"
          fetchpriority="high"
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />,
        portalTarget
      )}
    </HeroVideoContext.Provider>
  )
}

export function useHeroVideo() {
  return useContext(HeroVideoContext)
}
