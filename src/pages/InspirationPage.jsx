import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeroVideo } from '../HeroVideoContext'
import SearchLoader from '../components/SearchLoader'
import Footer from '../components/Footer'
import heroPoster from '../../images/inspiration-hero-poster.jpg'
import trail1 from '../../images/trail1.jpg'
import trail2 from '../../images/trail2.jpg'
import trail3 from '../../images/trail3.jpg'
import trail4 from '../../images/trail4.jpg'
import trail5 from '../../images/trail5.jpg'
import figure1 from '../../images/figure1.jpg'
import figure2 from '../../images/figure2.jpg'
import figure3 from '../../images/figure3.jpg'
import figure4 from '../../images/figure4.jpg'
import figure5 from '../../images/figure5.jpg'
import figure6 from '../../images/figure6.jpg'
import figure7 from '../../images/figure7.jpg'
import figure8 from '../../images/figure8.jpg'
import studioPoster2 from '../../images/video2-poster.jpg'
import studioPoster4 from '../../images/video4-poster.jpg'
import studioPoster5 from '../../images/video5-poster.jpg'
import './InspirationPage.css'

// Source files live on Cloudflare R2 (full original quality, well over
// GitHub's/Vercel's 100MB per-file limits for normal repo/deploy assets),
// but are served through /api/media/* — a same-origin Vercel proxy —
// rather than the browser hitting the R2 pub-*.r2.dev subdomain directly.
// That auto-generated subdomain showed real DNS resolution failures on
// multiple independent networks ("hostname could not be found," even on a
// zero-JS <link rel="preconnect">). Since the browser has already
// resolved kerocolor.vercel.app to load the page, routing videos through
// that same origin needs no new DNS lookup at all — see api/media.js.
//
// Tried adaptive-bitrate HLS for the hero video first (multiple quality
// renditions, low-quality fast-start segment ramping up to full quality)
// but it measured slower in testing (~1.7s to first frame, and never
// ramped past the lowest tier in 8s) than this plain MP4 + preload="auto"
// approach (~470ms) — reverted rather than ship a regression.
//
// The hero video element itself (HERO_VIDEO_URL) doesn't live in this
// component — it's owned by HeroVideoContext at the app root, so it starts
// buffering the moment the site opens (any page), not just once someone
// navigates here. This component just claims a spot for it to render into
// while this page is active. See HeroVideoContext.jsx.

const FIGURE_IMAGES = [figure1, figure2, figure3, figure4, figure5, figure6, figure7, figure8]

const WORD_LIST = [
  'undertone', 'contrast', 'radiance', 'texture', 'pigment', 'blend', 'glow', 'harmony',
  'expression', 'blush', 'contour', 'highlight', 'palette', 'shade', 'tone', 'saturation',
  'shimmer', 'matte', 'complexion', 'artistry', 'luminosity', 'warmth', 'depth', 'finish',
  'coverage', 'dimension', 'balance',
]
const CURSOR_IMAGES = [trail1, trail2, trail3, trail4, trail5]

// Rows are chunked in fixed-size groups — an explicit line break per
// chunk, not width-based wrapping, so the words-per-row cap holds
// regardless of how long any given word is. 4 per row on desktop, 2 on
// mobile (see WORDS_PER_ROW_MOBILE / the wordsPerRow state below) — the
// mobile breakpoint matches the CSS one (max-width: 640px).
const WORDS_PER_ROW_DESKTOP = 4
const WORDS_PER_ROW_MOBILE = 2

const STUDIO_VIDEOS = [
  { src: '/api/media/video5.mp4', poster: studioPoster5, credit: '@iirixle on YouTube' },
  { src: '/api/media/video4.mp4', poster: studioPoster4, credit: '@minjuddie on YouTube' },
  { src: '/api/media/video2.mp4', poster: studioPoster2, credit: '@heesunrise on YouTube' },
]

const NAV_ITEMS = ['All', 'Seasonal Edition', 'Editorial', 'Inspiration']

// Splits text into one <span> per letter so each can be scaled
// individually on hover (see .in-studio-letter) — nbsp for spaces so
// they keep their width as a standalone span instead of collapsing.
const splitLetters = (text) =>
  text.split('').map((ch, i) => (
    <span className="in-studio-letter" key={i}>
      {ch === ' ' ? ' ' : ch}
    </span>
  ))

export default function InspirationPage() {
  const navigate = useNavigate()
  const [overlayFading, setOverlayFading] = useState(false)
  const [overlayGone, setOverlayGone] = useState(false)
  const [contentReady, setContentReady] = useState(false)

  // ── Word hero (first section) ──
  // Fills the viewport below the navbar exactly (measured, not assumed —
  // the navbar's real height can vary, e.g. wrapping to two lines on
  // narrow screens). Scroll-jacked: while this section is filling the
  // screen and not all words are revealed yet, wheel/touch input
  // advances one word at a time instead of moving the page — the page
  // only actually scrolls past this section once every word has turned
  // black (or back up past it once every word is grey again). The
  // cursor-following hover image is being reworked separately — text
  // layout/scroll behavior comes first.
  const wordSectionRef = useRef(null)
  const [navHeight, setNavHeight] = useState(48)
  // Starts at 1, not 0 — the first word ("undertone") is white by default
  // even before any scroll input, rather than starting fully grey like
  // the rest. 1 is also the floor it un-reveals back down to (see the
  // drain/queue logic below), so it never goes dark again either.
  const [revealedWordCount, setRevealedWordCount] = useState(1)
  const [isWordSectionLocked, setIsWordSectionLocked] = useState(false)

  // Flips to a white background with plain default text (instead of the
  // black/grey/white scroll-jacked look) the instant the section releases
  // scroll control after every word has been shown — that's the only way
  // to end up below it at all, since scroll-jacking blocks getting past
  // it any other way. Flips back to black only once the section is
  // actually locked (stuck) again, not just from scrolling back into
  // view, so it stays white while merely passing through on the way up.
  const [isPastWordSection, setIsPastWordSection] = useState(false)
  useEffect(() => {
    if (isWordSectionLocked) {
      setIsPastWordSection(false)
    } else if (revealedWordCount >= WORD_LIST.length) {
      setIsPastWordSection(true)
    }
  }, [isWordSectionLocked, revealedWordCount])

  // 4 words/row on desktop, 2 on mobile — tracks the same breakpoint as
  // the CSS (max-width: 640px) via matchMedia so it flips live on resize
  // (e.g. rotating a device, or resizing a desktop window across it),
  // not just on first render.
  const [wordsPerRow, setWordsPerRow] = useState(WORDS_PER_ROW_DESKTOP)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setWordsPerRow(mq.matches ? WORDS_PER_ROW_MOBILE : WORDS_PER_ROW_DESKTOP)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const wordRows = useMemo(() => {
    const rows = []
    for (let i = 0; i < WORD_LIST.length; i += wordsPerRow) {
      rows.push(WORD_LIST.slice(i, i + wordsPerRow))
    }
    return rows
  }, [wordsPerRow])

  // Cursor-following image trail. Each mousemove far enough from the last
  // spawn point drops one more short-lived image at that position, cycling
  // through the 9 red-grid images in order — several on screen at once is
  // what reads as a "trail" following the cursor rather than one image
  // teleporting around. Positions/lifetime tracked in refs (not state) so
  // spawning doesn't itself trigger extra re-renders; only the actual list
  // of currently-visible trail images is state.
  const [imageTrail, setImageTrail] = useState([])
  const trailLastPosRef = useRef(null)
  const trailNextIdRef = useRef(0)
  const trailNextImgRef = useRef(0)
  const TRAIL_MIN_DIST = 130 // px of cursor movement before spawning the next image
  const TRAIL_LIFETIME_MS = 1200 // matches the in-word-trail-pulse animation duration

  // Shared by both mouse (desktop hover) and touch (mobile swipe/glide) —
  // takes a point already local to the section and decides whether it's
  // far enough from the last spawn to drop another trail image. No cap
  // on how many can be alive at once — each spawn always plays out its
  // own full, fixed-length fade via its own setTimeout below, so it
  // never gets truncated early, and new ones never get skipped/delayed
  // waiting for room either — both would show up as an unwanted stall or
  // cutoff in the trail depending on how fast the cursor/finger moves.
  const spawnTrailPoint = (x, y) => {
    const last = trailLastPosRef.current
    const dist = last ? Math.hypot(x - last.x, y - last.y) : Infinity
    if (dist < TRAIL_MIN_DIST) return
    trailLastPosRef.current = { x, y }

    const id = trailNextIdRef.current++
    const img = CURSOR_IMAGES[trailNextImgRef.current % CURSOR_IMAGES.length]
    trailNextImgRef.current += 1
    setImageTrail((t) => [...t, { id, x, y, img }])
    setTimeout(() => {
      setImageTrail((t) => t.filter((p) => p.id !== id))
    }, TRAIL_LIFETIME_MS)
  }

  const handleWordTrailMouseMove = (e) => {
    const rect = wordSectionRef.current?.getBoundingClientRect()
    if (!rect) return
    spawnTrailPoint(e.clientX - rect.left, e.clientY - rect.top)
  }

  // Fires alongside the window-level touchmove listener that intercepts
  // scroll (see the rate-limiting effect below) — that one is imperative
  // and scoped to scroll-jacking only; this one is a plain React handler
  // on the section itself, just for spawning trail images as a finger
  // glides across it, same "far enough from last point" rule as mouse.
  const handleWordTrailTouchMove = (e) => {
    const rect = wordSectionRef.current?.getBoundingClientRect()
    const touch = e.touches[0]
    if (!rect || !touch) return
    spawnTrailPoint(touch.clientX - rect.left, touch.clientY - rect.top)
  }

  useEffect(() => {
    const nav = document.querySelector('.in-nav')
    if (!nav) return
    const measure = () => setNavHeight(nav.getBoundingClientRect().height)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Only intercept scroll input while the section is substantially
  // filling the viewport — otherwise a normal scroll from elsewhere on
  // the page could get unexpectedly hijacked the moment this section
  // enters view. The moment it locks (entering from above OR scrolling
  // back up into it from below), snap it to sit exactly flush against
  // the navbar — otherwise it could lock while only partially scrolled
  // into place and just stay stuck at that odd offset for the whole
  // reveal sequence.
  const wordLockPendingRef = useRef(0)
  const wasWordSectionLockedRef = useRef(false)
  useEffect(() => {
    const section = wordSectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const locked = entry.intersectionRatio > 0.6
        setIsWordSectionLocked(locked)
        // Only snap on the actual false->true transition into "locked" —
        // not every time this callback fires while already locked. The
        // observer keeps firing near the 0.6 boundary, and calling
        // scrollTo() on every one of those was fighting the user's own
        // scroll input, producing a visible jitter right around that
        // threshold instead of a single clean snap.
        if (locked && !wasWordSectionLockedRef.current) {
          const target = section.getBoundingClientRect().top + window.scrollY - navHeight
          window.scrollTo({ top: target, behavior: 'smooth' })
        }
        wasWordSectionLockedRef.current = locked
      },
      { threshold: [0, 0.6, 1] }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [navHeight])

  // Kept in sync so the effect below can read the current count without
  // needing it as a dependency — it used to, and that was a real bug:
  // revealedWordCount changes on every drained step, which re-ran the
  // whole effect (tearing down the interval/listeners and, worse, its
  // cleanup zeroed the pending queue) after just one step of a big
  // burst, discarding the rest of it instead of draining it over time.
  const revealedWordCountRef = useRef(0)
  useEffect(() => { revealedWordCountRef.current = revealedWordCount }, [revealedWordCount])

  // Rate-limited: a fast/hard scroll burst queues up intent
  // (wordLockPendingRef) rather than jumping several words at once — a
  // fixed interval drains at most one word every ADVANCE_INTERVAL_MS
  // regardless of how much input arrived.
  useEffect(() => {
    if (!isWordSectionLocked) return
    const ADVANCE_INTERVAL_MS = 80
    let wheelAccum = 0
    const STEP = 60 // wheel/touch distance "worth" one queued word

    const queue = (delta) => {
      const goingDown = delta > 0
      // Already fully revealed and still going down, or already back to
      // the start (word 1 — the floor, see revealedWordCount's initial
      // value) and still going up — release control, let the page's
      // normal scroll carry on past this section instead of trapping it.
      if (goingDown && revealedWordCountRef.current >= WORD_LIST.length && wordLockPendingRef.current <= 0) return false
      if (!goingDown && revealedWordCountRef.current <= 1 && wordLockPendingRef.current >= 0) return false
      wheelAccum += delta
      while (wheelAccum >= STEP) {
        wheelAccum -= STEP
        wordLockPendingRef.current += 1
      }
      while (wheelAccum <= -STEP) {
        wheelAccum += STEP
        wordLockPendingRef.current -= 1
      }
      // Clamp queued intent to what's actually needed to reach either end
      // of the list. Without this, one big fling queues far more steps
      // than the list has words, and even once every word is revealed the
      // section stays "locked" (scroll still trapped) until all that
      // excess finishes draining at one step per tick — a long, pointless
      // wait after the content is already done animating.
      const maxForward = WORD_LIST.length - revealedWordCountRef.current
      const maxBackward = -(revealedWordCountRef.current - 1)
      wordLockPendingRef.current = Math.max(maxBackward, Math.min(maxForward, wordLockPendingRef.current))
      return true
    }

    const onWheel = (e) => {
      if (queue(e.deltaY)) e.preventDefault()
    }
    let touchStartY = null
    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY }
    const onTouchMove = (e) => {
      if (touchStartY === null) return
      const currentY = e.touches[0].clientY
      const delta = touchStartY - currentY // finger moving up = scrolling down
      if (queue(delta)) e.preventDefault()
      touchStartY = currentY
    }

    const drain = setInterval(() => {
      if (wordLockPendingRef.current > 0) {
        wordLockPendingRef.current -= 1
        setRevealedWordCount((c) => Math.min(WORD_LIST.length, c + 1))
      } else if (wordLockPendingRef.current < 0) {
        wordLockPendingRef.current += 1
        setRevealedWordCount((c) => Math.max(1, c - 1))
      }
    }, ADVANCE_INTERVAL_MS)

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      clearInterval(drain)
      wordLockPendingRef.current = 0
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [isWordSectionLocked])

  const [isPlaying, setIsPlaying] = useState(false)
  const [btnHidden, setBtnHidden] = useState(false)
  const [heroFrameReady, setHeroFrameReady] = useState(false)
  const hideBtnTimeoutRef = useRef(null)
  // The actual hero <video> element (and whether the user has pressed play
  // yet) lives in HeroVideoContext, at the app root, so it keeps buffering
  // across page navigation instead of starting over each time this page
  // mounts. This page just claims a spot for it via a portal target div.
  const { videoRef: heroVideoRef, videoEl: heroVideoEl, startedRef: heroStartedRef, setPortalTarget, offscreenRef } = useHeroVideo()
  const heroContainerRef = useRef(null)

  useEffect(() => {
    setPortalTarget(heroContainerRef.current)
    return () => setPortalTarget(offscreenRef.current)
  }, [setPortalTarget, offscreenRef])

  // heroFrameReady mirrors the video's real "loadeddata" event. Keyed on
  // heroVideoEl (reactive state), not heroVideoRef (a ref object, whose
  // identity never changes) — the video element doesn't exist yet on
  // mount (it's created up to ~2s later, once HeroVideoProvider's
  // idle-triggered warm-up kicks in), so an effect keyed on the ref would
  // find it empty once and never re-run once the video actually appeared.
  useEffect(() => {
    const video = heroVideoEl
    if (!video) return
    if (video.readyState >= 2) setHeroFrameReady(true)
    const onLoadedData = () => setHeroFrameReady(true)
    video.addEventListener('loadeddata', onLoadedData)
    return () => video.removeEventListener('loadeddata', onLoadedData)
  }, [heroVideoEl])

  const [isStudioPlaying, setIsStudioPlaying] = useState(false)
  const [studioBtnHidden, setStudioBtnHidden] = useState(false)
  const [studioIndex, setStudioIndex] = useState(0)
  const [studioFrameReady, setStudioFrameReady] = useState(false)
  const studioVideoRef = useRef(null)
  const hideStudioBtnTimeoutRef = useRef(null)
  const studioStartedRef = useRef(false)
  // The studio carousel only starts its own silent muted-autoplay warm-up
  // once its section is actually scrolled near — starting it eagerly at
  // page load alongside the hero video would recreate the real bandwidth-
  // contention timeout bug from earlier (two ~300MB videos competing for
  // the same connection).
  const [studioWarm, setStudioWarm] = useState(false)
  const studioSectionRef = useRef(null)

  useEffect(() => {
    const el = studioSectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStudioWarm(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px' } // start warming up well before it's on screen
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Once warmed up, re-trigger the silent muted autoplay whenever the
  // carousel slide changes — changing a <video>'s src doesn't reliably
  // resume autoplay on its own across browsers.
  useEffect(() => {
    const video = studioVideoRef.current
    if (!video || !studioWarm) return
    video.muted = true
    video.play()?.catch(() => {})
  }, [studioIndex, studioWarm])

  // Kept mounted (as a static poster layered underneath) for the
  // duration of the slide-down animation, so the incoming slide visibly
  // covers the outgoing one instead of sliding down over empty space —
  // key={studioIndex} remounting .in-studio-slide below means the OLD
  // one is gone from the DOM the instant studioIndex changes, so without
  // this there'd be nothing left for the new slide to appear to cover.
  const [prevStudioIndex, setPrevStudioIndex] = useState(null)
  const prevStudioTimeoutRef = useRef(null)

  const goToStudioVideo = (index) => {
    if (index < 0 || index >= STUDIO_VIDEOS.length) return
    // Ignore clicks while a transition is already playing — the current
    // one always finishes before another can start, rather than being
    // interrupted/remounted mid-slide by a fast follow-up click.
    if (prevStudioIndex !== null) return
    setStudioFrameReady(false)
    studioVideoRef.current?.pause()
    setIsStudioPlaying(false)
    studioStartedRef.current = false
    setPrevStudioIndex(studioIndex)
    clearTimeout(prevStudioTimeoutRef.current)
    prevStudioTimeoutRef.current = setTimeout(() => setPrevStudioIndex(null), 1050) // matches .in-studio-slide's 1s animation
    setStudioIndex(index)
  }

  // Retry a stalled/failed load a few times with backoff — covers
  // transient DNS/connection hiccups on first contact with the R2 origin
  // that a plain reload would otherwise be needed to recover from.
  const retryLoad = (video, attempt = 1) => {
    if (!video || attempt > 3) return
    video.load()
    const onCanPlay = () => {
      video.removeEventListener('canplay', onCanPlay)
      video.play()?.catch(() => {})
    }
    const onErr = () => {
      video.removeEventListener('error', onErr)
      setTimeout(() => retryLoad(video, attempt + 1), attempt * 1000)
    }
    video.addEventListener('canplay', onCanPlay, { once: true })
    video.addEventListener('error', onErr, { once: true })
  }

  // Just flips the user-facing intent — the button's icon/visibility must
  // respond instantly to a click even if the actual <video> doesn't exist
  // yet (it's created asynchronously, up to ~2s after mount; see
  // HeroVideoContext). Unlike the studio video below, whose <video> is
  // always present immediately, gating this on heroVideoRef.current being
  // non-null meant a click in that window silently did nothing at all —
  // no icon flip, nothing — which is exactly what "no pause button shows
  // up for blush.mp4" looked like. The actual play/pause mechanics run in
  // the effect below instead, whenever isPlaying or the video's own
  // availability changes.
  const togglePlay = () => setIsPlaying((prev) => !prev)

  useEffect(() => {
    const video = heroVideoEl
    if (!video) return
    if (isPlaying) {
      studioVideoRef.current?.pause()
      if (!heroStartedRef.current) {
        // First real press: the video has already been playing silently
        // (muted) in the background since page load to warm up its
        // buffer, so jump back to the actual start and unmute — no
        // cold-start network wait, because the data was already fetched.
        video.currentTime = 0
        heroStartedRef.current = true
      }
      video.muted = false
      // If it's somehow not already playing (autoplay blocked, or an
      // earlier load attempt failed/timed out), fall back to a normal
      // play()/retry — same safety net as before.
      if (video.paused) {
        if (video.error) retryLoad(video)
        else video.play()?.catch(() => retryLoad(video))
      }
    } else if (heroStartedRef.current) {
      // Only pause if the user actually pressed play before — otherwise
      // this is just the silent background warm-up autoplay, which should
      // keep running untouched until the user's first real press.
      video.pause()
    }
  }, [isPlaying, heroVideoEl])

  const toggleStudioPlay = () => {
    const video = studioVideoRef.current
    if (!video) return
    if (!isStudioPlaying) {
      heroVideoRef.current?.pause()
      if (!studioStartedRef.current) {
        video.currentTime = 0
        studioStartedRef.current = true
      }
      video.muted = false
      if (video.paused) {
        if (video.error) retryLoad(video)
        else video.play()?.catch(() => retryLoad(video))
      }
      setIsStudioPlaying(true)
    } else {
      video.pause()
      setIsStudioPlaying(false)
    }
  }

  // Let the icon flip to "pause" and sit visible for a beat before the
  // button fades away — pausing again brings it back immediately.
  useEffect(() => {
    clearTimeout(hideBtnTimeoutRef.current)
    if (isPlaying) {
      hideBtnTimeoutRef.current = setTimeout(() => setBtnHidden(true), 400)
    } else {
      setBtnHidden(false)
    }
    return () => clearTimeout(hideBtnTimeoutRef.current)
  }, [isPlaying])

  useEffect(() => {
    clearTimeout(hideStudioBtnTimeoutRef.current)
    if (isStudioPlaying) {
      hideStudioBtnTimeoutRef.current = setTimeout(() => setStudioBtnHidden(true), 400)
    } else {
      setStudioBtnHidden(false)
    }
    return () => clearTimeout(hideStudioBtnTimeoutRef.current)
  }, [isStudioPlaying])

  // Land on this page at the top, regardless of scroll position on the
  // tab navigated from (browsers preserve scroll across client-side route
  // changes by default).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const t1 = setTimeout(() => { setOverlayFading(true); setContentReady(true) }, 1700)
    const t2 = setTimeout(() => setOverlayGone(true), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleNavClick = (item) => {
    if (item === 'Inspiration') return
    if (item === 'Editorial') { navigate('/editorial'); return }
    navigate('/palette', { state: { tab: item } })
  }

  return (
    <>
    {!overlayGone && <SearchLoader fading={overlayFading} />}
    <div className={`in-page${contentReady ? ' in-page--revealed' : ' in-page--hidden'}`}>
      <nav className="in-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item}
            className={`in-nav-item${item === 'Inspiration' ? ' in-nav-item--active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <span>{item}</span>
          </button>
        ))}
      </nav>

      {/* ── Word hero — fills the viewport below the navbar exactly (no
          gap, no overlap). Words darken grey->black, scroll-jacked one
          word at a time (see the wheel/touch effect above), releasing
          to a normal page scroll once fully revealed (or back to 0). ── */}
      <section
        className={`in-word-hero${isPastWordSection ? ' in-word-hero--past' : ''}`}
        ref={wordSectionRef}
        style={{ height: `calc(100vh - ${navHeight}px)` }}
        onMouseMove={handleWordTrailMouseMove}
        onTouchMove={handleWordTrailTouchMove}
      >
        <div className="in-word-text">
          {wordRows.map((row, rowIdx) => (
            <p className="in-word-row" key={rowIdx}>
              {row.map((word, i) => {
                const globalIndex = rowIdx * wordsPerRow + i
                const active = globalIndex === revealedWordCount - 1
                return (
                  <span key={word} className={`in-word${active ? ' in-word--active' : ''}`}>
                    {word}
                    {globalIndex < WORD_LIST.length - 1 ? ', ' : ''}
                  </span>
                )
              })}
            </p>
          ))}
        </div>

        <div className="in-word-trail">
          {imageTrail.map((p) => (
            <img
              key={p.id}
              src={p.img}
              alt=""
              className="in-word-trail-img"
              style={{ left: p.x, top: p.y }}
            />
          ))}
        </div>
      </section>

      {/* ── Hero rectangle ── */}
      <section className="in-hero">
        <div className="in-hero-video-wrap" onClick={togglePlay}>
          {/* The actual <video> is portaled in here from HeroVideoContext —
              it's been silently playing muted since the site opened, on
              whichever page the user landed on, not just since this page
              mounted. See the comment near the top of this file. */}
          <div ref={heroContainerRef} className="in-hero-video" />
          {/* Stays on screen until the user has actually pressed play AND a
              real frame is ready — heroFrameReady alone would go true as
              soon as the silent background autoplay above produces its
              first frame, well before the user has clicked anything. */}
          <img
            src={heroPoster}
            alt=""
            className={`in-hero-poster-overlay${heroFrameReady && isPlaying ? ' in-hero-poster-overlay--hidden' : ''}`}
          />
          <div className={`in-hero-tint${isPlaying ? ' in-hero-tint--hidden' : ''}`} />
        </div>
        <button
          type="button"
          className={`in-hero-play-btn${btnHidden ? ' in-hero-play-btn--hidden' : ''}`}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          tabIndex={btnHidden ? -1 : 0}
        >
          <span className="in-hero-play-btn-inner">
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="#fff" width="16" height="16">
                <rect x="5" y="4" width="5" height="16" rx="1" />
                <rect x="14" y="4" width="5" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="#fff" width="16" height="16" style={{ marginLeft: '2px' }}>
                <path d="M6 4l15 8-15 8z" />
              </svg>
            )}
          </span>
        </button>
      </section>

      <p className="in-hero-credit">@_arinkim on YouTube</p>

      {/* ── Intro copy ── */}
      <section className="in-intro">
        <p className="in-intro-text">
          A curated beauty video collection featuring GRWM, makeup transformations, and color-focused looks.{' '}
          <span className="in-intro-highlight">
            Discover how undertones, contrast, and seasonal palettes can guide blush, lip, eye, and overall makeup
            choices, helping turn everyday beauty into a more personalized color experience.
          </span>
        </p>
      </section>

      {/* ── Figure ticker — one continuously auto-scrolling row, 16:9
          frames with a thin black border. The image list is rendered
          twice back-to-back so the CSS animation can scroll exactly one
          set's width and loop seamlessly. ── */}
      <section className="in-figures">
        <div className="in-figures-track">
          {[...FIGURE_IMAGES, ...FIGURE_IMAGES].map((src, i) => (
            <div className="in-figure-cell" key={i}>
              <img src={src} alt="" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Video production studio ── */}
      <section className="in-studio" ref={studioSectionRef}>
        <div className="in-studio-header">
          <h2 className="in-studio-heading">
            {splitLetters('Experimenting')}
            <br />
            {splitLetters('Different Makeup')}
            {' '}
            <br className="in-studio-mobile-break" />
            {splitLetters('Styles')}
          </h2>
          <div className="in-studio-arrows">
            <button
              type="button"
              className="in-studio-arrow"
              aria-label="Previous video"
              disabled={studioIndex === 0}
              onClick={() => goToStudioVideo(studioIndex - 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="in-studio-arrow"
              aria-label="Next video"
              disabled={studioIndex === STUDIO_VIDEOS.length - 1}
              onClick={() => goToStudioVideo(studioIndex + 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="in-hero in-studio-hero">
          {prevStudioIndex !== null && (
            <>
              <img
                src={STUDIO_VIDEOS[prevStudioIndex].poster}
                alt=""
                className="in-studio-slide-under"
              />
              <div className="in-studio-slide-under-tint" />
            </>
          )}
          {/* key={studioIndex} — remounting this on every slide change is
              what makes the slide-in animation below replay each time
              (a CSS animation only plays on a fresh mount, not on a prop
              update), giving the "next video sliding down over the
              previous one" effect on prev/next. */}
          <div className="in-hero-video-wrap in-studio-slide" onClick={toggleStudioPlay} key={studioIndex}>
            <video
              ref={studioVideoRef}
              className="in-hero-video"
              src={STUDIO_VIDEOS[studioIndex].src}
              poster={STUDIO_VIDEOS[studioIndex].poster}
              // Stays lazy (no eager fetch) until studioWarm flips true via
              // the IntersectionObserver above; from then on it silently
              // autoplays muted the same way the hero video does, so the
              // first real press on any slide is instant too.
              preload={studioWarm ? 'auto' : 'metadata'}
              autoPlay={studioWarm}
              muted
              loop
              playsInline
              onLoadedData={() => setStudioFrameReady(true)}
              // Click-through — same fix as the hero video (see
              // HeroVideoContext.jsx): a real trusted click landing
              // directly on a <video> can be swallowed by the browser's
              // own native handling before it bubbles to the wrapper's
              // onClick. Routing every click through the plain wrapper
              // div avoids that entirely.
              style={{ pointerEvents: 'none' }}
            />
            <img
              src={STUDIO_VIDEOS[studioIndex].poster}
              alt=""
              className={`in-hero-poster-overlay${studioFrameReady && isStudioPlaying ? ' in-hero-poster-overlay--hidden' : ''}`}
            />
            <div className={`in-hero-tint${isStudioPlaying ? ' in-hero-tint--hidden' : ''}`} />
          </div>
          <button
            type="button"
            className={`in-hero-play-btn${studioBtnHidden ? ' in-hero-play-btn--hidden' : ''}`}
            onClick={toggleStudioPlay}
            aria-label={isStudioPlaying ? 'Pause video' : 'Play video'}
            tabIndex={studioBtnHidden ? -1 : 0}
          >
            <span className="in-hero-play-btn-inner">
              {isStudioPlaying ? (
                <svg viewBox="0 0 24 24" fill="#fff" width="16" height="16">
                  <rect x="5" y="4" width="5" height="16" rx="1" />
                  <rect x="14" y="4" width="5" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="#fff" width="16" height="16" style={{ marginLeft: '2px' }}>
                  <path d="M6 4l15 8-15 8z" />
                </svg>
              )}
            </span>
          </button>
        </div>

        {STUDIO_VIDEOS[studioIndex].credit && (
          <p className="in-hero-credit">{STUDIO_VIDEOS[studioIndex].credit}</p>
        )}
      </section>

      {/* Content coming later */}

      <Footer />
    </div>
    </>
  )
}
