import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeroVideo } from '../HeroVideoContext'
import SearchLoader from '../components/SearchLoader'
import Footer from '../components/Footer'
import EntryConsentModal from '../components/EntryConsentModal'
import { getLenis } from '../lenis'
import heroPoster from '../../images/inspiration-hero-poster.webp'
import figure1 from '../../images/figure1.webp'
import figure2 from '../../images/figure2.webp'
import figure3 from '../../images/figure3.webp'
import figure4 from '../../images/figure4.webp'
import figure5 from '../../images/figure5.webp'
import figure6 from '../../images/figure6.webp'
import figure7 from '../../images/figure7.webp'
import figure8 from '../../images/figure8.webp'
import studioPoster2 from '../../images/video2-poster.webp'
import studioPoster4 from '../../images/video4-poster.webp'
import studioPoster5 from '../../images/video5-poster.webp'
import lookTrail1 from '../../images/trail1.webp'
import lookTrail3 from '../../images/trail3.webp'
import lookTrail4 from '../../images/trail4.webp'
import lookTrail5 from '../../images/trail5.webp'
import lookSquare1 from '../../images/square1.webp'
import lookSquare2 from '../../images/square2.webp'
import lookModel3 from '../../images/model3.webp'
import lookModel4 from '../../images/model4.webp'
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

// Shade chips are sampled from each photo's own dominant skin/cheek/lip
// color clusters (not hand-picked), so they genuinely match the look.
const LOOKS = [
  { img: lookTrail1, name: 'Porcelain Veil', undertone: 'cool', note: 'Sheer rosy wash on the lid, lip blotted to a stain.', shades: ['#e1d0c9', '#bb9c92', '#a57e76'] },
  { img: lookTrail3, name: 'Petal Stain', undertone: 'neutral', note: 'Tinted balm dabbed on the centre of the lip, edges diffused.', shades: ['#e1c1b7', '#d2a597', '#9c6957'] },
  { img: lookTrail4, name: 'Mauve Hush', undertone: 'cool', note: 'Mauve-brown lip matched to a barely-there contour.', shades: ['#dfc6bc', '#b69287', '#956461'] },
  { img: lookTrail5, name: 'Glass Glow', undertone: 'warm', note: 'Blush swept up toward the temple over a dewy base.', shades: ['#e6cac1', '#c7a08c', '#af836d'] },
  { img: lookSquare1, name: 'Bare Linen', undertone: 'neutral', note: 'Skin-first finish with concealer only where needed.', shades: ['#ebcec5', '#d4b0a4', '#bd9787'] },
  { img: lookSquare2, name: 'Honey Dew', undertone: 'warm', note: 'Warm nude lip and a sheen of highlighter on the cheekbone.', shades: ['#ead0bc', '#debaa2', '#ab816a'] },
  { img: lookModel3, name: 'Strawberry Flush', undertone: 'warm', note: 'Cream blush on the apples, glossy berry-red lip.', shades: ['#edccbf', '#e6b7aa', '#904638'] },
  { img: lookModel4, name: 'Tomato Glaze', undertone: 'warm', note: 'Blush carried across the nose for a sun-kissed flush.', shades: ['#e3b6ad', '#cf9188', '#d63a39'] },
]

const UNDERTONES = [
  {
    name: 'Warm',
    tell: 'Veins read green, and gold jewelry glows against your skin.',
    shades: ['#e0b07b', '#d98e5f', '#c65d3b', '#b5651d', '#8a3324'],
    reach: [['Blush', 'peach, apricot, terracotta'], ['Lip', 'brick, coral, warm nude'], ['Eye', 'bronze, copper, olive']],
  },
  {
    name: 'Cool',
    tell: 'Veins read blue or purple, and silver flatters more than gold.',
    shades: ['#b9c3e0', '#e3a6c0', '#c94f7c', '#a3325c', '#7b4a8c'],
    reach: [['Blush', 'rose, berry, pink'], ['Lip', 'raspberry, plum, blue-red'], ['Eye', 'taupe, mauve, slate']],
  },
  {
    name: 'Neutral',
    tell: 'Veins read blue-green, and gold and silver both work.',
    shades: ['#d4a996', '#c98f7f', '#b8988a', '#a8736a', '#8c5a52'],
    reach: [['Blush', 'dusty rose, muted coral'], ['Lip', 'mauve nude, rosewood'], ['Eye', 'champagne, taupe, brown']],
  },
]

// "In this issue" index on the cover — each entry scrolls to its section.
const ISSUE_INDEX = [
  { id: 'in-featured', label: 'Featured Film' },
  { id: 'in-studio', label: 'Makeup Studio' },
  { id: 'in-looks', label: 'The Lookbook' },
  { id: 'in-undertone', label: 'Know Your Undertone' },
  { id: 'in-steps', label: 'Four Steps, One Palette' },
]

// Distinct shades across the lookbook, for the cover's stats.
const LOOK_SHADE_COUNT = new Set(LOOKS.flatMap((l) => l.shades)).size

const ROUTINE_STEPS = [
  { title: 'Prep', body: 'Start with a hydrated base. Color reads truer on skin that isn’t dry or patchy, so moisturize and let it settle for a minute before anything else.' },
  { title: 'Base', body: 'Match foundation to your undertone, not just your depth. Check along the jaw in daylight; the right shade disappears rather than sitting on top.' },
  { title: 'Color', body: 'Pick one hero area, whether cheeks, lips, or eyes, and pull its shade from your palette. Tie the rest back to it so the face reads as one story.' },
  { title: 'Set', body: 'Veil powder only where you need it, then mist. Too much powder mutes color, so keep it minimal over the cheeks.' },
]

// localStorage (not sessionStorage) so "once per device" survives across
// tabs/sessions, not just the current one.
const CONSENT_KEY = 'kerocolor-inspiration-consent'

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
  // Persisted in localStorage — shown once per device, not on every
  // visit. Starts false and only flips true (in the overlayGone timeout
  // below) once the loading overlay has fully cleared AND this device
  // hasn't agreed before — otherwise its fade-in would play silently
  // underneath SearchLoader and be already finished/invisible by the
  // time that overlay lifts.
  const [consentOpen, setConsentOpen] = useState(false)

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
    // Consent banner opens right as the loading overlay finishes clearing,
    // not before — so its own fade-in is the thing the user actually sees
    // happen, instead of playing out hidden underneath SearchLoader. Only
    // opens at all if this device hasn't already agreed.
    const t2 = setTimeout(() => {
      setOverlayGone(true)
      let alreadyAgreed = false
      try {
        alreadyAgreed = localStorage.getItem(CONSENT_KEY) === '1'
      } catch {
        // Private browsing / storage blocked — falls back to showing it.
      }
      if (!alreadyAgreed) setConsentOpen(true)
    }, 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Scroll-triggered fade-in for the sections below the studio carousel —
  // same eased rise as the Editorial page's sections, so the two pages
  // feel like one site. Toggled straight on the DOM (no state) since each
  // section only ever reveals once.
  const pageRef = useRef(null)
  useEffect(() => {
    const els = pageRef.current?.querySelectorAll('.in-reveal') ?? []
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('in-reveal--visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Any shade chip on this page opens that exact color's family on the
  // Discover Palettes page.
  const openShade = (hex) => navigate('/palette/discover', { state: { hex } })

  // Cover index: glide to the section through Lenis (it drives scrolling
  // site-wide, so a native scrollIntoView would fight it).
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el, { offset: -40, duration: 1.4 })
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleNavClick = (item) => {
    if (item === 'Inspiration') return
    if (item === 'Editorial') { navigate('/editorial'); return }
    navigate('/palette', { state: { tab: item } })
  }

  // Figure ticker — a pure CSS animation (see @keyframes in-figures-scroll
  // in InspirationPage.css), not JS-driven: a requestAnimationFrame loop
  // runs on the main thread and stutters under any other work there,
  // while a CSS animation runs on the compositor.
  //
  // Its loop distance used to be measured here at runtime and written to a
  // CSS custom property that the keyframes read, re-measured on every
  // window resize. Mobile browsers fire resize constantly while scrolling
  // (the address bar showing/hiding), and Safari restarts an animation
  // whenever a custom property its keyframes depend on is written — so the
  // ticker kept snapping back to its start. The distance is fixed by the
  // CSS itself (8 cells x (cell width + gap)), so it now lives there as a
  // plain constant per breakpoint and nothing touches it at runtime.

  return (
    <>
    {!overlayGone && <SearchLoader fading={overlayFading} />}
    <EntryConsentModal
      open={consentOpen}
      onAgree={() => {
        setConsentOpen(false)
        try {
          localStorage.setItem(CONSENT_KEY, '1')
        } catch {
          // Private browsing / storage blocked — nothing to persist to,
          // it'll just show again next visit.
        }
      }}
    />
    <div ref={pageRef} className={`in-page${contentReady ? ' in-page--revealed' : ' in-page--hidden'}`}>
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

      {/* ── Issue cover — reads like the opening spread of a magazine:
          title, issue line, lede, a clickable index of every section on
          the page, and live counts. ── */}
      <header className="in-cover">
        <div className="in-cover-meta">
          <span>Issue 03 · Autumn Winter 2026</span>
          <span>Color led beauty, curated by Kerocolor</span>
        </div>
        <h1 className="in-cover-title">Inspiration</h1>
        <div className="in-cover-body">
          <p className="in-cover-lede">
            Real routines from creators we love, broken down by the shades that make them work.
            Watch the looks, borrow the colors, and learn which ones belong on you.
          </p>
          <nav className="in-cover-index" aria-label="In this issue">
            <span className="in-cover-label">In this issue</span>
            <ol>
              {ISSUE_INDEX.map((item, i) => (
                <li key={item.id}>
                  <button type="button" onClick={() => scrollToSection(item.id)}>
                    <span className="in-cover-index-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="in-cover-index-label">{item.label}</span>
                    <span className="in-cover-index-arrow" aria-hidden="true">↓</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <dl className="in-cover-stats">
            <div><dt>{LOOKS.length}</dt><dd>looks</dd></div>
            <div><dt>{STUDIO_VIDEOS.length + 1}</dt><dd>creator films</dd></div>
            <div><dt>{UNDERTONES.length}</dt><dd>undertones</dd></div>
            <div><dt>{LOOK_SHADE_COUNT}</dt><dd>shades</dd></div>
          </dl>
        </div>
      </header>

      {/* ── Hero rectangle ── */}
      <section className="in-hero" id="in-featured">
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
          <img loading="lazy"
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
              {/* Eager, not lazy: in a looping strip the duplicate copy of
                  each photo slides in from off-screen, and lazy loading only
                  fetched it as it approached — so frames flashed in blank
                  and then popped in. */}
              <img src={src} alt="" loading="eager" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Video production studio ── */}
      <section className="in-studio" id="in-studio" ref={studioSectionRef}>
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

      {/* ── Lookbook — eight looks, each with shade chips sampled from the
          photo itself; any chip opens that color on Discover Palettes. ── */}
      <section className="in-looks in-reveal" id="in-looks">
        <div className="in-section-header">
          <h2 className="in-section-heading">The Lookbook</h2>
          <p className="in-section-meta">{String(LOOKS.length).padStart(2, '0')} looks · tap a shade to explore it</p>
        </div>
        <div className="in-looks-grid">
          {LOOKS.map((look, i) => (
            <article className="in-look" key={look.name}>
              <div className="in-look-img">
                <img src={look.img} alt={look.name} loading="lazy" decoding="async" />
                <span className="in-look-num">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="in-look-info">
                <div className="in-look-title-row">
                  <h3 className="in-look-name">{look.name}</h3>
                  <span className={`in-look-tag in-look-tag--${look.undertone}`}>{look.undertone}</span>
                </div>
                <p className="in-look-note">{look.note}</p>
                <div className="in-chips">
                  {look.shades.map((hex) => (
                    <button
                      type="button"
                      key={hex}
                      className="in-chip"
                      style={{ background: hex }}
                      title={hex}
                      aria-label={`Explore ${hex}`}
                      onClick={() => openShade(hex)}
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Undertone guide ── */}
      <section className="in-undertone in-reveal" id="in-undertone">
        <div className="in-section-header">
          <h2 className="in-section-heading">Know Your<br />Undertone</h2>
          <p className="in-section-meta">the quickest way to narrow down every shade below</p>
        </div>
        <div className="in-undertone-grid">
          {UNDERTONES.map((u) => (
            <div className="in-undertone-card" key={u.name}>
              <h3 className="in-undertone-name">{u.name}</h3>
              <p className="in-undertone-tell">{u.tell}</p>
              <div className="in-undertone-strip">
                {u.shades.map((hex) => (
                  <button
                    type="button"
                    key={hex}
                    className="in-undertone-swatch"
                    style={{ background: hex }}
                    title={hex}
                    aria-label={`Explore ${hex}`}
                    onClick={() => openShade(hex)}
                  />
                ))}
              </div>
              <dl className="in-undertone-reach">
                {u.reach.map(([area, picks]) => (
                  <div className="in-undertone-reach-row" key={area}>
                    <dt>{area}</dt>
                    <dd>{picks}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ── Routine ── */}
      <section className="in-steps in-reveal" id="in-steps">
        <div className="in-section-header">
          <h2 className="in-section-heading">Four Steps,<br />One Palette</h2>
        </div>
        <ol className="in-steps-grid">
          {ROUTINE_STEPS.map((step, i) => (
            <li className="in-step" key={step.title}>
              <span className="in-step-num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="in-step-title">{step.title}</h3>
              <p className="in-step-body">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Closing call to action — same burgundy-to-beige gradient as the
          footer, so it reads as the page's natural sign-off. ── */}
      <section className="in-cta in-reveal">
        <h2 className="in-cta-heading">Find the shades<br />made for you</h2>
        <p className="in-cta-text">Search any hex to see its full family of shades, or explore palettes by color.</p>
        <div className="in-cta-actions">
          <button type="button" className="in-cta-btn in-cta-btn--solid" onClick={() => navigate('/palette/discover')}>
            discover palettes
          </button>
          <button type="button" className="in-cta-btn" onClick={() => navigate('/explore')}>
            explore colors
          </button>
        </div>
      </section>

      <Footer />
    </div>
    </>
  )
}
