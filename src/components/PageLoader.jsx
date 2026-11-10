import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import colorImg from '../../images/page-loader/center.webp'
import { runTearExit } from './tearExit'
import './PageLoader.css'

// ms the progress bar takes to fill at minimum before the loader tears away:
// the full intro on the homepage's first load; a quick ≈1s pass for reloads
// and page switches everywhere else
const MIN_DURATION = { full: 2800, fast: 450 }
const DOT_COUNT = 24      // dots in the p5 progress indicator
const LOADER_BG = '#3d110f' // keep in sync with .plx in PageLoader.css
const DOT_PITCH = 4 / 900 // halftone grid spacing, in figure heights (see index.html)

const TRAIL = 6   // smoky puffs per trail (lead puff + fading followers)
const PUFFS = TRAIL * 2 // two trails: the cursor's, and one that drifts on its own

// Shared reveal mask (world space, figure is 1 unit tall, centred), drawn
// like smoke: a domain-warped fractal noise field, drifting upward, eats
// into the edge so the colour seeps through in soft wisps. The figure stays
// dotted; colour shows where a smoky puff (with its trail of smaller fading
// puffs) passes over it — one drifts across the figure on its own, and on
// desktop another follows the cursor.
const MASK = /* glsl */ `
  uniform vec2 uTrail[${PUFFS}];
  uniform float uTrailR[${PUFFS}];
  uniform float uTime;
  uniform float uReady; // 1 once the colour photo has loaded
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return v;
  }
  // smoke field in 0..1, swirling and rising over time
  float smoke(vec2 p) {
    vec2 q = p * 4.0 + vec2(0.0, -uTime * 0.35);
    vec2 w = vec2(fbm(q + uTime * 0.12), fbm(q + vec2(5.2, 1.3) - uTime * 0.1));
    return fbm(q + w * 1.6);
  }
  float plume(float d, float r, float s, float soft) {
    return smoothstep(r + soft, r - soft * 0.4, d + (s - 0.5) * soft * 2.6);
  }
  float revealMask(vec2 p) {
    float s = smoke(p);
    float m = 0.0;
    for (int i = 0; i < ${PUFFS}; i++) {
      m = max(m, plume(length(p - uTrail[i]), uTrailR[i], s, 0.07));
    }
    return clamp(m, 0.0, 1.0) * uReady;
  }
`

// Dots: a neat halftone on an even honeycomb grid — each dot's size and
// brightness follow the photo's grey tone (light dots on the dark red),
// and it fades out where the colour is revealed.
const DOTS_VERT = /* glsl */ `
  attribute float gray;
  uniform float uSize;
  varying float vGray;
  varying vec2 vPos;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.25 + 0.75 * gray);
    gl_Position = projectionMatrix * mv;
    vGray = gray;
    vPos = position.xy;
  }
`
const DOTS_FRAG = /* glsl */ `
  ${MASK}
  varying float vGray;
  varying vec2 vPos;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.4, d);
    float m = revealMask(vPos);
    vec3 col = vec3(0.6 + 0.4 * vGray);
    float a = edge * (1.0 - m);
    gl_FragColor = vec4(col * a, a); // premultiplied
  }
`

// Colour photo: the same figure, exactly underlying the dots, visible only
// inside the reveal mask. Raw texture colours, premultiplied alpha.
const PHOTO_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vPos;
  void main() {
    vUv = uv;
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const PHOTO_FRAG = /* glsl */ `
  ${MASK}
  uniform sampler2D map;
  varying vec2 vUv;
  varying vec2 vPos;
  void main() {
    gl_FragColor = texture2D(map, vUv) * revealMask(vPos);
  }
`

// Loading screen for every page: a black-and-white figure made of dots
// (three.js / WebGL point cloud) whose colour photo is revealed through
// smoky puffs, with a dotted progress bar. On exit it tears diagonally like
// paper to reveal the page (three.js + p5.js + anime.js, see tearExit.js).
//
// Shows instantly regardless of network: the dot figure's data and a 2D
// drawing of it live inline in index.html (window.__kcLoader), which also
// paints a static copy of this screen (#kc-boot) before any JS or CSS has
// downloaded. This component draws the same still the moment it mounts,
// takes over from #kc-boot once its own styles are in, and swaps the still
// for the live WebGL figure when three.js arrives.
const BOOT = typeof window !== 'undefined' ? window.__kcLoader : null
export default function PageLoader({ onDone, fast = false }) {
  const rootRef = useRef(null)
  const centerRef = useRef(null)
  const stillRef = useRef(null)
  const barDotsRef = useRef([])
  const pctRef = useRef(null)
  const [gone, setGone] = useState(false)

  // Instant still of the dot figure, then retire the boot screen from
  // index.html once this loader's stylesheet has applied (on a slow network
  // the CSS can arrive after this mounts).
  useLayoutEffect(() => {
    let raf
    const takeOver = () => {
      const root = rootRef.current
      if (!root) return
      if (getComputedStyle(root).position !== 'fixed' || !stillRef.current?.clientHeight) {
        raf = requestAnimationFrame(takeOver)
        return
      }
      BOOT?.draw(stillRef.current)
      document.getElementById('kc-boot')?.remove()
    }
    takeOver()
    return () => cancelAnimationFrame(raf)
  }, [])

  // Lock scrolling while up, keeping the scrollbar's space reserved so the
  // page doesn't shift sideways when it's revealed.
  useEffect(() => {
    const html = document.documentElement
    const scrollbar = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`
    return () => {
      html.style.overflow = ''
      html.style.paddingRight = ''
    }
  }, [])

  useEffect(() => {
    let disposed = false
    let cleanup = () => {}
    let checkExit = () => {}
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()

    // Progress = the lower of elapsed time and real loading (libraries and
    // the colour photo), eased so it never jumps.
    let loaded = 0
    const totalSteps = 2
    let shown = 0
    let barRaf

    const photo = new Image()
    photo.src = colorImg
    let onPhoto = () => {}
    photo.decode().catch(() => {}).then(() => { loaded += 1; onPhoto() })

    Promise.all([import('three'), import('animejs'), import('p5')]).then(([THREE, anime, p5mod]) => {
      if (disposed) return
      loaded += 1
      const { animate } = anime
      const P5 = p5mod.default

      // ── three.js scene ──
      // Orthographic, 1 world unit = figure height, so the dots and the
      // colour photo line up exactly. The view sits the figure's base just
      // below the bottom edge of the canvas.
      const stage = centerRef.current
      // preserveDrawingBuffer so the torn-paper exit can snapshot the figure
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      stage.appendChild(renderer.domElement)
      const scene = new THREE.Scene()
      // The canvas is full screen height; VIEW_H is how many figure-heights
      // it shows. The screen's bottom edge sits at BOTTOM_Y (figure units,
      // centre = 0): just above y = -0.377, where the photo's straight crop
      // through the right shoulder begins, so that cut is never seen.
      const VIEW_H = BOOT?.cfg.VIEW_H ?? 0.91    // shared with the instant still
      const BOTTOM_Y = BOOT?.cfg.BOTTOM_Y ?? -0.36
      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10, 10)
      const camY = BOTTOM_Y + VIEW_H / 2

      const shared = {
        uTrail: { value: Array.from({ length: PUFFS }, () => new THREE.Vector2(0, -10)) },
        uTrailR: { value: new Array(PUFFS).fill(0) },
        uTime: { value: 0 },
        uReady: { value: 0 },
      }

      // colour photo
      const tex = new THREE.Texture(photo)
      tex.colorSpace = THREE.NoColorSpace
      tex.premultiplyAlpha = true
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      // the photo may still be downloading: upload it, and switch the colour
      // reveal on, as soon as it's decoded
      onPhoto = () => {
        if (!photo.naturalWidth) return
        tex.needsUpdate = true
        shared.uReady.value = 1
      }
      if (photo.complete) onPhoto()
      const aspect = BOOT?.cfg.ASPECT ?? 0.7733
      const photoGeo = new THREE.PlaneGeometry(aspect, 1)
      const photoMat = new THREE.ShaderMaterial({
        vertexShader: PHOTO_VERT, fragmentShader: PHOTO_FRAG,
        uniforms: { ...shared, map: { value: tex } },
        transparent: true, premultipliedAlpha: true, depthWrite: false,
      })
      const photoMesh = new THREE.Mesh(photoGeo, photoMat)
      photoMesh.renderOrder = 0
      scene.add(photoMesh)

      // dots, from the inline grid (flattened onto the photo plane so they
      // register exactly)
      const pts = BOOT.points() // x, y, grey per dot
      const n = pts.length / 3
      const pos = new Float32Array(n * 3)
      const gray = new Float32Array(n)
      for (let i = 0; i < n; i++) {
        pos[i * 3] = pts[i * 3]
        pos[i * 3 + 1] = pts[i * 3 + 1]
        gray[i] = pts[i * 3 + 2]
      }
      const dotsGeo = new THREE.BufferGeometry()
      dotsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      dotsGeo.setAttribute('gray', new THREE.BufferAttribute(gray, 1))
      const dotsMat = new THREE.ShaderMaterial({
        vertexShader: DOTS_VERT, fragmentShader: DOTS_FRAG,
        uniforms: { ...shared, uSize: { value: 2 } },
        transparent: true, premultipliedAlpha: true, depthWrite: false,
      })
      const dots = new THREE.Points(dotsGeo, dotsMat)
      dots.renderOrder = 1
      scene.add(dots)

      let W = 1, H = 1
      const resize = () => {
        W = stage.clientWidth
        H = stage.clientHeight
        renderer.setSize(W, H)
        const halfW = (VIEW_H * W / H) / 2
        Object.assign(camera, { left: -halfW, right: halfW, top: camY + VIEW_H / 2, bottom: camY - VIEW_H / 2 })
        camera.updateProjectionMatrix()
        // largest dot = 86% of the grid pitch, so neighbours never touch and
        // the halftone stays crisp
        const pxPerUnit = H / VIEW_H
        dotsMat.uniforms.uSize.value = Math.max(2.4, pxPerUnit * DOT_PITCH * 0.86) * renderer.getPixelRatio()
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(stage)

      // Cursor smoke (desktop): a puff eases toward the pointer and each
      // trail puff chases the one before it, smaller and fainter, so moving
      // leaves a smoky wake. Puffs grow while the cursor is present and
      // dissipate when it leaves.
      const mouse = { x: 0, y: -10, active: false }
      const auto = { x: 0, y: 0.1 }
      const autoPhase = Math.random() * 20 // start somewhere different each time
      // Mouse hovers; on phones/tablets a touch (tap or drag) does the same.
      const onMove = (e) => {
        if (e.pointerType !== 'mouse' && e.type === 'pointermove' && !touching) return
        const r = stage.getBoundingClientRect()
        mouse.x = ((e.clientX - r.left) / r.width - 0.5) * (VIEW_H * W / H)
        mouse.y = camY + (0.5 - (e.clientY - r.top) / r.height) * VIEW_H
        mouse.active = true
      }
      const onLeave = () => { mouse.active = false }
      let touching = false
      const onDown = (e) => {
        if (e.pointerType === 'mouse') return
        touching = true
        onMove(e)
      }
      const onUp = (e) => {
        if (e.pointerType === 'mouse') return
        touching = false
        mouse.active = false
      }
      if (!reduceMotion) {
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerdown', onDown)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onUp)
        document.addEventListener('pointerleave', onLeave)
      }

      let raf
      let last = performance.now()
      const t0 = last
      const trail = shared.uTrail.value
      const trailR = shared.uTrailR.value
      const tick = (now) => {
        raf = requestAnimationFrame(tick)
      // the live figure is up — the instant still underneath can go
      requestAnimationFrame(() => { if (stillRef.current) stillRef.current.style.visibility = 'hidden' })
        const dt = Math.min((now - last) / 1000, 0.05)
        last = now
        shared.uTime.value = (now - t0) / 1000
        // auto puff: wanders all around the figure — hair, face, hand and
        // shoulders — on a Lissajous path (mismatched frequencies, so it keeps
        // finding new routes). Paced so it sweeps across the figure even in
        // the quick ~1s loader, and slower on the full intro.
        const t = shared.uTime.value * (fast ? 3.2 : 1.6) + autoPhase
        auto.x = Math.sin(t * 1.1) * 0.27 + Math.sin(t * 0.43 + 1.3) * 0.08
        auto.y = 0.03 + Math.sin(t * 0.77 + 0.8) * 0.33 + Math.sin(t * 0.29 + 2.1) * 0.06
        const trails = [
          { lead: mouse, on: mouse.active, base: 0 },
          { lead: auto, on: !reduceMotion, base: TRAIL },
        ]
        for (const { lead: head, on, base } of trails) {
          for (let j = 0; j < TRAIL; j++) {
            const i = base + j
            const lead = j === 0 ? head : trail[i - 1]
            if (trail[i].y < -5) trail[i].set(lead.x, lead.y)
            const k = 1 - Math.exp(-dt * (j === 0 ? 9 : 7))
            trail[i].x += (lead.x - trail[i].x) * k
            trail[i].y += (lead.y - trail[i].y) * k
            const rTarget = on ? 0.15 * (1 - j / (TRAIL + 1)) : 0
            trailR[i] += (rTarget - trailR[i]) * (1 - Math.exp(-dt * (on ? 6 : 2.5)))
          }
        }
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(tick)
      // the live figure is up — the instant still underneath can go
      requestAnimationFrame(() => { if (stillRef.current) stillRef.current.style.visibility = 'hidden' })

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        document.removeEventListener('pointerleave', onLeave)
        tex.dispose()
        photoGeo.dispose()
        photoMat.dispose()
        dotsGeo.dispose()
        dotsMat.dispose()
        renderer.dispose()
        renderer.forceContextLoss()
        renderer.domElement.remove()
      }

      // ── exit: once loaded, the loader tears diagonally like paper ──
      let exiting = false
      checkExit = () => {
        if (exiting || shown < 0.999) return
        exiting = true
        const finish = () => { setGone(true); onDone?.() }
        if (reduceMotion) {
          animate(rootRef.current, { opacity: 0, duration: 200, onComplete: finish })
          return
        }
        renderer.render(scene, camera) // fresh frame for the snapshot
        runTearExit({
          THREE, animate, P5,
          root: rootRef.current,
          figureCanvas: renderer.domElement,
          background: LOADER_BG,
          fast,
          onDone: finish,
        }).catch((err) => {
          // never leave the loader stuck: fall back to a quick fade
          console.error('PageLoader: tear exit failed', err)
          animate(rootRef.current, { opacity: 0, duration: 250, onComplete: finish })
        })
      }
    })

    const barTick = () => {
      barRaf = requestAnimationFrame(barTick)
      const timeFrac = Math.min((performance.now() - start) / (fast ? MIN_DURATION.fast : MIN_DURATION.full), 1)
      const target = Math.min(timeFrac, loaded / totalSteps)
      shown += (target - shown) * 0.12
      if (target - shown < 0.001) shown = target
      if (pctRef.current) pctRef.current.textContent = `${Math.round(shown * 100)}%`
      const filled = shown * DOT_COUNT
      barDotsRef.current.forEach((el, i) => {
        if (!el) return
        const f = Math.min(Math.max(filled - i, 0), 1)
        el.style.opacity = 0.2 + 0.8 * f
        el.style.transform = `scale(${0.5 + 0.5 * f})`
      })
      checkExit()
    }
    barTick()

    return () => {
      disposed = true
      cancelAnimationFrame(barRaf)
      cleanup()
    }
  }, [onDone, fast])

  if (gone) return null

  return (
    <div ref={rootRef} className="plx" role="progressbar" aria-label="Loading">
      <div ref={centerRef} className="plx-center" aria-hidden="true">
        {/* instant 2D still of the figure until the WebGL one is drawing */}
        <canvas ref={stillRef} className="plx-still" />
      </div>
      <div className="plx-progress">
        <div className="plx-dots">
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <span key={i} ref={(el) => { barDotsRef.current[i] = el }} />
          ))}
        </div>
        <span ref={pctRef} className="plx-pct">0%</span>
      </div>
    </div>
  )
}
