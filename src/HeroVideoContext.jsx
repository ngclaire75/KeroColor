import { createContext, useContext, useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

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
  // Tracks whether the user has pressed play yet (vs. the silent muted
  // warm-up autoplay) — lives here, not in InspirationPage, so it survives
  // navigating away and back.
  const startedRef = useRef(false)
  const [portalTarget, setPortalTarget] = useState(null)

  useEffect(() => {
    setPortalTarget(offscreenRef.current)
  }, [])

  return (
    <HeroVideoContext.Provider value={{ videoRef, startedRef, setPortalTarget, offscreenRef }}>
      {children}
      {/* Default home for the video whenever no page has claimed it. */}
      <div ref={offscreenRef} style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, overflow: 'hidden' }} />
      {portalTarget && createPortal(
        <video
          ref={videoRef}
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
