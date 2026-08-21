import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
const HERO_VIDEO_URL = '/api/media/blush.mp4'

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [btnHidden, setBtnHidden] = useState(false)
  const [heroFrameReady, setHeroFrameReady] = useState(false)
  const heroVideoRef = useRef(null)
  const hideBtnTimeoutRef = useRef(null)

  const [isStudioPlaying, setIsStudioPlaying] = useState(false)
  const [studioBtnHidden, setStudioBtnHidden] = useState(false)
  const [studioIndex, setStudioIndex] = useState(0)
  const [studioFrameReady, setStudioFrameReady] = useState(false)
  const studioVideoRef = useRef(null)
  const hideStudioBtnTimeoutRef = useRef(null)

  const goToStudioVideo = (index) => {
    if (index < 0 || index >= STUDIO_VIDEOS.length) return
    setStudioFrameReady(false)
    studioVideoRef.current?.pause()
    setIsStudioPlaying(false)
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

  const togglePlay = () => {
    const video = heroVideoRef.current
    if (!video) return
    if (video.paused) {
      studioVideoRef.current?.pause()
      // If an earlier load attempt failed/timed out (preload="metadata"
      // means the full video isn't fetched until now), reset the element
      // before retrying so a stale error state doesn't block playback.
      if (video.error) {
        retryLoad(video)
      } else {
        video.play()?.catch(() => retryLoad(video))
      }
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleStudioPlay = () => {
    const video = studioVideoRef.current
    if (!video) return
    if (video.paused) {
      heroVideoRef.current?.pause()
      if (video.error) {
        retryLoad(video)
      } else {
        video.play()?.catch(() => retryLoad(video))
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

      {/* ── Hero rectangle ── */}
      <section className="in-hero">
        <div className="in-hero-video-wrap" onClick={togglePlay}>
          <video
            ref={heroVideoRef}
            className="in-hero-video"
            src={HERO_VIDEO_URL}
            poster={heroPoster}
            // Only the hero video preloads eagerly — it's the sole video
            // visible on page load, so there's no bandwidth contention
            // risk (the earlier timeout bug came from hero + studio both
            // eagerly preloading ~550MB simultaneously). The studio
            // carousel stays on preload="metadata" since it's below the
            // fold and its active video changes.
            preload="auto"
            fetchpriority="high"
            loop
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedData={() => setHeroFrameReady(true)}
          />
          {/* Stays on screen until the video actually has a real frame ready
              to paint — otherwise the poster vanishes the instant play() is
              called (browser default) while the video is still buffering,
              leaving a blank gap before playback visibly starts. */}
          <img
            src={heroPoster}
            alt=""
            className={`in-hero-poster-overlay${heroFrameReady ? ' in-hero-poster-overlay--hidden' : ''}`}
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
      <section className="in-studio">
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
              preload="metadata"
              loop
              playsInline
              onPlay={() => setIsStudioPlaying(true)}
              onPause={() => setIsStudioPlaying(false)}
              onLoadedData={() => setStudioFrameReady(true)}
            />
            <img
              src={STUDIO_VIDEOS[studioIndex].poster}
              alt=""
              className={`in-hero-poster-overlay${studioFrameReady ? ' in-hero-poster-overlay--hidden' : ''}`}
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
