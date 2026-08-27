import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeroVideo } from '../HeroVideoContext'
import SearchLoader from '../components/SearchLoader'
import Footer from '../components/Footer'
import EntryConsentModal from '../components/EntryConsentModal'
import heroPoster from '../../images/inspiration-hero-poster.jpg'
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
  // No persistence (no localStorage/sessionStorage flag) — shows on every
  // visit to this page, by design.
  const [consentOpen, setConsentOpen] = useState(true)

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

  const goToStudioVideo = (index) => {
    if (index < 0 || index >= STUDIO_VIDEOS.length) return
    setStudioFrameReady(false)
    studioVideoRef.current?.pause()
    setIsStudioPlaying(false)
    studioStartedRef.current = false
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

  // Figure ticker — back to a pure CSS animation (see @keyframes
  // in-figures-scroll), not JS-driven. A JS requestAnimationFrame loop
  // that sets track.style.transform every frame runs on the MAIN
  // thread, competing with everything else happening there (React
  // renders, other components' effects/intervals) — any main-thread
  // congestion shows up as visible stutter. A CSS animation instead runs
  // on the compositor thread, immune to that.
  //
  // The image list still renders twice back-to-back so it can loop
  // seamlessly, but a plain translateX(-50%) keyframe assumes the
  // halfway point of the track's total width IS the exact repeat
  // distance — it isn't, once `gap` is involved: the track's total width
  // includes a gap after all 15 cell-boundaries, while the true repeat
  // distance (start of cell 1 to the start of cell 9, its duplicate)
  // only spans 8 of those gaps, so -50% was off by half a gap and every
  // loop restart visibly snapped. This measures the real distance once
  // (and again on resize) and exposes it as a CSS custom property that
  // the keyframes read — self-corrects at any viewport/breakpoint
  // without needing separate hardcoded desktop/mobile values, while the
  // actual animation stays 100% CSS.
  const figuresTrackRef = useRef(null)
  useEffect(() => {
    const track = figuresTrackRef.current
    if (!track) return
    const measure = () => {
      const cells = track.querySelectorAll('.in-figure-cell')
      if (cells.length < FIGURE_IMAGES.length + 1) return
      const d = cells[FIGURE_IMAGES.length].getBoundingClientRect().left - cells[0].getBoundingClientRect().left
      if (d > 0) track.style.setProperty('--figures-repeat', `${d}px`)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <>
    {!overlayGone && <SearchLoader fading={overlayFading} />}
    <EntryConsentModal open={consentOpen} onAgree={() => setConsentOpen(false)} />
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
        <div className="in-figures-track" ref={figuresTrackRef}>
          {[...FIGURE_IMAGES, ...FIGURE_IMAGES].map((src, i) => (
            <div className="in-figure-cell" key={i}>
              <img src={src} alt="" loading="lazy" decoding="async" />
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
          <div className="in-hero-video-wrap" onClick={toggleStudioPlay} key={studioIndex}>
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
              loading="lazy"
              decoding="async"
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
