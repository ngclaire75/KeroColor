import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeroVideo } from '../HeroVideoContext'
import SearchLoader from '../components/SearchLoader'
import Footer from '../components/Footer'
import heroPoster from '../../images/inspiration-hero-poster.jpg'
import square1 from '../../images/square1.jpeg'
import square2 from '../../images/square2.jpeg'
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

const STUDIO_VIDEOS = [
  { src: '/api/media/video2.mp4', poster: studioPoster2, credit: '@heesunrise on YouTube' },
  { src: '/api/media/video4.mp4', poster: studioPoster4, credit: '@minjuddie on YouTube' },
  { src: '/api/media/video5.mp4', poster: studioPoster5, credit: '@iirixle on YouTube' },
]

const NAV_ITEMS = ['All', 'Seasonal Edition', 'Editorial', 'Inspiration']

export default function InspirationPage() {
  const navigate = useNavigate()
  const [overlayFading, setOverlayFading] = useState(false)
  const [overlayGone, setOverlayGone] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  // Everything autoplays by default now — isPlaying/isStudioPlaying start
  // true, and the small bottom-right button pauses rather than starts
  // playback. Muted by default too (autoplay-with-sound isn't allowed
  // without a user gesture); the separate mute/unmute button is that
  // gesture.
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [heroFrameReady, setHeroFrameReady] = useState(false)
  // The actual hero <video> element (and whether it's been snapped back to
  // the true start yet) lives in HeroVideoContext, at the app root, so it
  // keeps buffering across page navigation instead of starting over each
  // time this page mounts. This page just claims a spot for it via a
  // portal target div.
  const { videoEl: heroVideoEl, startedRef: heroStartedRef, setPortalTarget, offscreenRef } = useHeroVideo()
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

  // The silent muted warm-up autoplay (see HeroVideoContext) may have
  // already drifted forward while buffering in the background before this
  // page even mounted. The first time it actually has a real frame ready
  // to show here, snap back to the true start once, so what the user sees
  // genuinely begins at 0 rather than wherever the warm-up had gotten to.
  useEffect(() => {
    const video = heroVideoEl
    if (!video || !heroFrameReady || heroStartedRef.current) return
    video.currentTime = 0
    heroStartedRef.current = true
  }, [heroFrameReady, heroVideoEl, heroStartedRef])

  const [isStudioPlaying, setIsStudioPlaying] = useState(true)
  const [isStudioMuted, setIsStudioMuted] = useState(true)
  const [studioIndex, setStudioIndex] = useState(0)
  const [studioFrameReady, setStudioFrameReady] = useState(false)
  const studioVideoRef = useRef(null)
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

  // Once warmed up, (re)start autoplay whenever the carousel slide changes
  // — changing a <video>'s src doesn't reliably resume autoplay on its own
  // across browsers. Applies the current mute/play intent at that moment;
  // the dedicated effects below handle ongoing changes to either.
  useEffect(() => {
    const video = studioVideoRef.current
    if (!video || !studioWarm) return
    video.muted = isStudioMuted
    if (isStudioPlaying) video.play()?.catch(() => {})
  }, [studioIndex, studioWarm])

  // Same "snap back to the true start once a real frame exists" logic as
  // the hero video, re-armed on every slide change (studioStartedRef and
  // studioFrameReady both get reset in goToStudioVideo below).
  useEffect(() => {
    const video = studioVideoRef.current
    if (!video || !studioFrameReady || studioStartedRef.current) return
    video.currentTime = 0
    studioStartedRef.current = true
  }, [studioFrameReady])

  // Ongoing play/pause, independent of the video's own availability.
  useEffect(() => {
    const video = studioVideoRef.current
    if (!video) return
    if (isStudioPlaying) {
      if (video.paused) {
        if (video.error) retryLoad(video)
        else video.play()?.catch(() => retryLoad(video))
      }
    } else {
      video.pause()
    }
  }, [isStudioPlaying])

  useEffect(() => {
    const video = studioVideoRef.current
    if (video) video.muted = isStudioMuted
  }, [isStudioMuted])

  const goToStudioVideo = (index) => {
    if (index < 0 || index >= STUDIO_VIDEOS.length) return
    setStudioFrameReady(false)
    setIsStudioPlaying(true) // the new slide autoplays too
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

  // Both videos autoplay by default now, so these buttons just flip the
  // user-facing intent — instantly, regardless of whether the hero <video>
  // element exists yet (it's created asynchronously, up to ~2s after
  // mount; see HeroVideoContext). The actual play/pause mechanics run in
  // the effects below, whenever isPlaying/isStudioPlaying or the video's
  // own availability changes.
  const togglePlay = () => setIsPlaying((prev) => !prev)
  const toggleStudioPlay = () => setIsStudioPlaying((prev) => !prev)

  // Unmuting one mutes the other, so a viewer never gets two overlapping
  // audio sources — but both videos keep playing regardless (autoplay
  // muted has no audio to conflict over in the first place).
  const toggleHeroMute = () => {
    setIsMuted((prev) => {
      const next = !prev
      if (!next) setIsStudioMuted(true)
      return next
    })
  }
  const toggleStudioMute = () => {
    setIsStudioMuted((prev) => {
      const next = !prev
      if (!next) setIsMuted(true)
      return next
    })
  }

  useEffect(() => {
    const video = heroVideoEl
    if (!video) return
    if (isPlaying) {
      if (video.paused) {
        if (video.error) retryLoad(video)
        else video.play()?.catch(() => retryLoad(video))
      }
    } else {
      video.pause()
    }
  }, [isPlaying, heroVideoEl])

  useEffect(() => {
    const video = heroVideoEl
    if (video) video.muted = isMuted
  }, [isMuted, heroVideoEl])

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

      {/* ── Hero rectangle ── */}
      <section className="in-hero">
        <div className="in-hero-video-wrap" onClick={togglePlay}>
          {/* The actual <video> is portaled in here from HeroVideoContext —
              it's been silently playing muted since the site opened, on
              whichever page the user landed on, not just since this page
              mounted. See the comment near the top of this file. */}
          <div ref={heroContainerRef} className="in-hero-video" />
          {/* Stays on screen until there's a real frame ready to show —
              everything autoplays now, so this just covers the brief
              window while the video is still buffering. */}
          <img
            src={heroPoster}
            alt=""
            className={`in-hero-poster-overlay${heroFrameReady ? ' in-hero-poster-overlay--hidden' : ''}`}
          />
          <div className={`in-hero-tint${isPlaying ? ' in-hero-tint--hidden' : ''}`} />
        </div>
        <div className="in-hero-controls">
          <button
            type="button"
            className="in-hero-icon-btn"
            onClick={(e) => { e.stopPropagation(); togglePlay() }}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="#fff" width="14" height="14">
                <rect x="5" y="4" width="5" height="16" rx="1" />
                <rect x="14" y="4" width="5" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="#fff" width="14" height="14" style={{ marginLeft: '2px' }}>
                <path d="M6 4l15 8-15 8z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="in-hero-icon-btn"
            onClick={(e) => { e.stopPropagation(); toggleHeroMute() }}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#fff" />
                <path d="M16 9l5 6M21 9l-5 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#fff" />
                <path d="M16 8.5a5 5 0 0 1 0 7" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
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

      {/* ── Square grid ── */}
      <section className="in-squares">
        <div className="in-square">
          <img src={square1} alt="" />
        </div>
        <div className="in-squares-text">
          <p className="in-squares-line">Figure out your favorite</p>
          <p className="in-squares-line in-squares-line--highlight">makeup palette now!</p>
        </div>
        <div className="in-square">
          <img src={square2} alt="" />
        </div>
      </section>

      {/* ── Video production studio ── */}
      <section className="in-studio" ref={studioSectionRef}>
        <div className="in-studio-header">
          <h2 className="in-studio-heading">Experimenting<br />Different Makeup Styles</h2>
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
          <div className="in-hero-video-wrap" onClick={toggleStudioPlay}>
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
              className={`in-hero-poster-overlay${studioFrameReady ? ' in-hero-poster-overlay--hidden' : ''}`}
            />
            <div className={`in-hero-tint${isStudioPlaying ? ' in-hero-tint--hidden' : ''}`} />
          </div>
          <div className="in-hero-controls">
            <button
              type="button"
              className="in-hero-icon-btn"
              onClick={(e) => { e.stopPropagation(); toggleStudioPlay() }}
              aria-label={isStudioPlaying ? 'Pause video' : 'Play video'}
            >
              {isStudioPlaying ? (
                <svg viewBox="0 0 24 24" fill="#fff" width="14" height="14">
                  <rect x="5" y="4" width="5" height="16" rx="1" />
                  <rect x="14" y="4" width="5" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="#fff" width="14" height="14" style={{ marginLeft: '2px' }}>
                  <path d="M6 4l15 8-15 8z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className="in-hero-icon-btn"
              onClick={(e) => { e.stopPropagation(); toggleStudioMute() }}
              aria-label={isStudioMuted ? 'Unmute video' : 'Mute video'}
            >
              {isStudioMuted ? (
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#fff" />
                  <path d="M16 9l5 6M21 9l-5 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#fff" />
                  <path d="M16 8.5a5 5 0 0 1 0 7" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  <path d="M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
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
