import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { animate, createTimer, steps } from 'animejs'
import './VhsImage.css'

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform float uTime;
uniform float uGlitch;
uniform vec2 uCenter;
uniform float uZoom;
uniform float uVel;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// object-fit: cover, zoomed in by uZoom, looking at uCenter
// (0..1 across the spare picture on each axis; y: 0 = bottom, 1 = top)
vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = (rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0)) / uZoom;
  return clamp(uv, 0.0, 1.0) * s + (1.0 - s) * uCenter;
}

// Tape is soft sideways: a small horizontal smear
vec3 tape(vec2 uv) {
  vec2 dx = vec2(1.6 / uRes.x, 0.0);
  return (texture2D(uTex, cover(uv - dx)).rgb
        + 2.0 * texture2D(uTex, cover(uv)).rgb
        + texture2D(uTex, cover(uv + dx)).rgb) * 0.25;
}

void main() {
  vec2 uv = vUv;
  float frame = floor(uTime * 12.0);

  // Line wobble from a worn tape
  uv.x += (noise(vec2(uv.y * 38.0, uTime * 1.7)) - 0.5) * 0.003;

  // Tracking band rolling down the picture
  float bandY = 1.0 - fract(uTime * 0.065);
  float band = smoothstep(0.07, 0.0, abs(uv.y - bandY));
  uv.x += band * 0.012 * sin(uv.y * 260.0 + uTime * 24.0);

  // Glitch bursts: blocks of lines jump sideways
  float block = floor(uv.y * 22.0);
  float jump = step(0.62, hash(vec2(block, frame)));
  uv.x += (hash(vec2(block, frame + 3.0)) - 0.5) * 0.07 * uGlitch * jump;

  // Colour bleed: red and blue pull apart
  // ...and further while the picture is being dragged around
  float ca = 0.0022 + 0.005 * band + 0.012 * uGlitch + 0.01 * uVel;
  vec3 col = vec3(
    tape(uv + vec2(ca, 0.0)).r,
    tape(uv).g,
    tape(uv - vec2(ca, 0.0)).b
  );

  // Faded, warm, lifted-black grade
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, 0.82);
  col = col * 0.88 + 0.05;
  col *= vec3(1.05, 1.0, 0.9);

  // Scanlines
  col *= 0.9 + 0.1 * sin(vUv.y * uRes.y * 1.5708);

  // Static in the tracking band, and over everything during a glitch
  float stat = hash(vec2(vUv.y * 600.0, uTime * 60.0));
  col += band * 0.14 * stat;
  col = mix(col, vec3(stat), uGlitch * 0.12);

  // Grain
  col += (hash(vUv * uRes + fract(uTime * 7.0) * 113.0) - 0.5) * 0.09;

  // Dust: specks that change every few frames, some light, some dark
  float dustT = floor(uTime * 6.0);
  vec2 g = vUv * vec2(uRes.x / uRes.y, 1.0) * 13.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(id + dustT * 7.13);
  if (h > 0.9) {
    vec2 c = (vec2(hash(id + dustT), hash(id - dustT)) - 0.5) * 0.7;
    float r = 0.025 + 0.07 * hash(id * 3.1 + dustT);
    vec2 q = (f - c) * vec2(1.0, 1.0 + 2.5 * hash(id + 9.0)); // some are fibres
    float speck = smoothstep(r, r * 0.3, length(q));
    vec3 tone = hash(id + dustT * 1.7) > 0.5 ? vec3(0.96, 0.93, 0.86) : vec3(0.08, 0.06, 0.05);
    col = mix(col, tone, speck * 0.65);
  }

  // Scratch: a thin vertical line that comes and goes
  if (hash(vec2(dustT, 7.0)) > 0.55) {
    float sx = hash(vec2(dustT, 3.1));
    float s = smoothstep(0.0012, 0.0, abs(vUv.x - sx - sin(vUv.y * 9.0) * 0.002));
    col = mix(col, vec3(0.92, 0.9, 0.84), s * 0.4 * noise(vec2(vUv.y * 14.0, dustT)));
  }

  // Vignette and lamp flicker
  vec2 v = vUv - 0.5;
  col *= 1.0 - dot(v, v) * 1.1;
  col *= 0.96 + 0.04 * hash(vec2(frame, 1.0));

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  #include <colorspace_fragment>
}
`

const ZOOM = 1.3           // resting zoom when the photo can be explored
const ZOOM_MIN = 1.12
const ZOOM_MAX = 2.6

const REDUCE = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function stamp(date) {
  const mon = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  return `${mon}. ${String(date.getDate()).padStart(2, '0')} ${date.getFullYear()}`
}

// The card photo played back off a dusty VHS tape. Falls back to a plain
// <img> without WebGL. With `explorable`, desktop and tablet visitors can
// drag the photo (mouse, trackpad or finger) to look around it, and pinch
// to zoom. Phones keep the still framing.
export default function VhsImage({ src, focusY = 0.5, explorable = false, imgClassName = '', imgStyle }) {
  const hostRef = useRef(null)
  const cursorRef = useRef(null)
  const cursorDotRef = useRef(null)
  const [explore] = useState(() => explorable
    && window.matchMedia('(min-width: 641px) and (min-height: 501px)').matches)
  const playRef = useRef(null)
  const counterRef = useRef(null)
  const [fallback, setFallback] = useState(false)

  // WebGL picture (GSAP drives time and glitch bursts)
  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false })
    } catch {
      setFallback(true)
      return
    }
    // The shader samples the photo nine times a pixel across the whole
    // screen, so phones render at a lower pixel ratio
    const coarse = window.matchMedia('(pointer: coarse)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.25 : 2))
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const uniforms = {
      uTex: { value: null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImg: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uGlitch: { value: 0 },
      uCenter: { value: new THREE.Vector2(0.5, focusY) },
      uZoom: { value: 1 },
      uVel: { value: 0 },
    }
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms })
    const geometry = new THREE.PlaneGeometry(2, 2)
    scene.add(new THREE.Mesh(geometry, material))

    const render = () => {
      if (uniforms.uTex.value) renderer.render(scene, camera)
    }
    const fit = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      uniforms.uRes.value.set(w, h)
      render()
    }
    const ro = new ResizeObserver(fit)
    ro.observe(host)
    fit()

    const reduce = REDUCE()
    let texture
    let disposed = false
    let nextGlitch
    const tweens = []

    // A short burst, then the next one a few seconds later
    const glitch = (strength = 1) => {
      tweens.push(
        gsap.timeline()
          .to(uniforms.uGlitch, { value: strength, duration: 0.06, ease: 'none' })
          .to(uniforms.uGlitch, { value: strength * 0.3, duration: 0.08, ease: 'none' })
          .to(uniforms.uGlitch, { value: strength * 0.8, duration: 0.05, ease: 'none' })
          .to(uniforms.uGlitch, { value: 0, duration: 0.4, ease: 'power2.out' }),
      )
    }
    const schedule = () => {
      nextGlitch = gsap.delayedCall(gsap.utils.random(3.5, 8), () => {
        glitch(gsap.utils.random(0.5, 1))
        schedule()
      })
    }

    // Velocity of the view, so the picture smears a little as it moves
    const center = uniforms.uCenter.value
    let lastCX = center.x
    let lastCY = center.y
    const tick = (time) => {
      uniforms.uTime.value = time
      const v = Math.min(1, Math.hypot(center.x - lastCX, center.y - lastCY) * 40)
      uniforms.uVel.value += (v - uniforms.uVel.value) * 0.2
      lastCX = center.x
      lastCY = center.y
      render()
    }

    // ── Look around: drag, trackpad scroll, pinch zoom, arrow keys ──
    const frame = host.parentElement
    const target = { x: center.x, y: center.y, zoom: explore ? ZOOM : 1 }
    const ease = reduce ? { duration: 0 } : { duration: 0.9, ease: 'power3.out' }
    const toX = gsap.quickTo(center, 'x', ease)
    const toY = gsap.quickTo(center, 'y', ease)
    const toZoom = gsap.quickTo(uniforms.uZoom, 'value', reduce ? ease : { duration: 0.6, ease: 'power3.out' })
    let intro

    // Pixels of hidden picture on each axis at the target zoom
    const slack = () => {
      const w = uniforms.uRes.value.x
      const h = uniforms.uRes.value.y
      const ri = uniforms.uImg.value.x / uniforms.uImg.value.y
      const rs = w / h
      const sx = (rs > ri ? 1 : rs / ri) / target.zoom
      const sy = (rs > ri ? ri / rs : 1) / target.zoom
      return { x: ((1 - sx) / sx) * w, y: ((1 - sy) / sy) * h }
    }
    // Move the view by screen pixels (content follows the pointer)
    const pan = (dx, dy) => {
      const sl = slack()
      if (sl.x > 1) target.x = gsap.utils.clamp(0, 1, target.x - dx / sl.x)
      if (sl.y > 1) target.y = gsap.utils.clamp(0, 1, target.y + dy / sl.y)
      toX(target.x)
      toY(target.y)
      if (reduce) render()
    }
    const zoomBy = (factor) => {
      intro?.kill()
      target.zoom = gsap.utils.clamp(ZOOM_MIN, ZOOM_MAX, target.zoom * factor)
      toZoom(target.zoom)
      if (reduce) render()
    }

    // One pointer drags; two fingers on a tablet pinch to zoom
    const pointers = new Map()
    let drag = null
    let pinch = null
    const spread = () => {
      const [a, b] = [...pointers.values()]
      return Math.hypot(a.x - b.x, a.y - b.y) || 1
    }
    const startDrag = (e) => {
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0 }
    }
    const onDown = (e) => {
      if (e.button !== 0) return
      frame.setPointerCapture(e.pointerId)
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        drag = null
        pinch = spread()
      } else if (pointers.size === 1) {
        startDrag(e)
      }
      frame.classList.add('vhs--dragging')
    }
    const onMove = (e) => {
      if (!pointers.has(e.pointerId)) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pinch) {
        const d = spread()
        zoomBy(d / pinch)
        pinch = d
        return
      }
      if (!drag) return
      const now = performance.now()
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      const dt = Math.max(1, now - drag.t)
      drag.vx = drag.vx * 0.6 + (dx / dt) * 0.4
      drag.vy = drag.vy * 0.6 + (dy / dt) * 0.4
      drag.x = e.clientX
      drag.y = e.clientY
      drag.t = now
      pan(dx, dy)
    }
    const onUp = (e) => {
      if (!pointers.delete(e.pointerId)) return
      if (frame.hasPointerCapture(e.pointerId)) frame.releasePointerCapture(e.pointerId)
      if (pinch) {
        // Lifting one finger of a pinch carries on as a drag, no fling
        pinch = null
        const [id, p] = [...pointers.entries()][0] || []
        if (id !== undefined) startDrag({ clientX: p.x, clientY: p.y })
        return
      }
      // Fling: carry on in the direction of the throw, unless the pointer
      // had already come to rest
      if (drag && !reduce && performance.now() - drag.t < 80) pan(drag.vx * 260, drag.vy * 260)
      drag = null
      frame.classList.remove('vhs--dragging')
    }
    const onWheel = (e) => {
      e.preventDefault()
      const k = e.deltaMode === 1 ? 16 : 1
      // Trackpad pinch arrives as ctrl + wheel
      if (e.ctrlKey) zoomBy(Math.exp(-e.deltaY * k * 0.01))
      else pan(-e.deltaX * k, -e.deltaY * k)
    }
    const onKey = (e) => {
      const step = 140
      const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }
      if (moves[e.key]) {
        e.preventDefault()
        pan(...moves[e.key])
      } else if (e.key === '+' || e.key === '=') zoomBy(1.15)
      else if (e.key === '-') zoomBy(1 / 1.15)
    }
    if (explore) {
      frame.addEventListener('pointerdown', onDown)
      frame.addEventListener('pointermove', onMove)
      frame.addEventListener('pointerup', onUp)
      frame.addEventListener('pointercancel', onUp)
      frame.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('keydown', onKey)
    }

    new THREE.TextureLoader().load(src, (tex) => {
      if (disposed) return tex.dispose()
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearFilter
      tex.generateMipmaps = false
      texture = tex
      uniforms.uTex.value = tex
      uniforms.uImg.value.set(tex.image.width, tex.image.height)
      if (reduce) {
        uniforms.uTime.value = 1.3
        uniforms.uZoom.value = target.zoom
        render()
        return
      }
      // Slow push in to the explore zoom as the tape starts
      if (explore) intro = gsap.to(uniforms.uZoom, { value: target.zoom, duration: 2.2, ease: 'expo.out', delay: 0.2 })
      // Tape catching as it starts to play
      uniforms.uGlitch.value = 1
      tweens.push(gsap.to(uniforms.uGlitch, { value: 0, duration: 1.1, ease: 'power3.out' }))
      gsap.ticker.add(tick)
      schedule()
    }, undefined, () => {
      dispose()
      setFallback(true)
    })

    const onEnter = () => !reduce && glitch(0.7)
    frame.addEventListener('pointerenter', onEnter)

    function dispose() {
      if (disposed) return
      disposed = true
      gsap.ticker.remove(tick)
      nextGlitch?.kill()
      tweens.forEach((t) => t.kill())
      frame.removeEventListener('pointerenter', onEnter)
      frame.removeEventListener('pointerdown', onDown)
      frame.removeEventListener('pointermove', onMove)
      frame.removeEventListener('pointerup', onUp)
      frame.removeEventListener('pointercancel', onUp)
      frame.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      intro?.kill()
      gsap.killTweensOf([center, uniforms.uZoom])
      ro.disconnect()
      texture?.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
    return dispose
    // focusY is read once; the page remounts per card
  }, [src, explore])

  // Drag cursor: GSAP trails the pointer, anime.js pops and squeezes it.
  // On a tablet it rides just above the finger, and waits in the middle
  // of the photo as a hint until the first touch.
  useEffect(() => {
    if (!explore || fallback) return
    const wrap = cursorRef.current
    const dot = cursorDotRef.current
    const frame = wrap.parentElement
    const reduce = REDUCE()
    const toX = gsap.quickTo(wrap, 'x', { duration: reduce ? 0 : 0.35, ease: 'power3.out' })
    const toY = gsap.quickTo(wrap, 'y', { duration: reduce ? 0 : 0.35, ease: 'power3.out' })
    let anim
    const to = (params) => {
      anim?.pause()
      anim = animate(dot, { duration: reduce ? 0 : 450, ...params })
    }
    // A fingertip would cover the bubble, so lift it clear
    const at = (e) => {
      const r = frame.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top - (e.pointerType === 'touch' ? 90 : 0) }
    }
    const place = (e) => {
      const { x, y } = at(e)
      toX(x)
      toY(y)
    }
    const onEnter = (e) => {
      gsap.set(wrap, at(e))
      to({ scale: [0, 1], opacity: [0, 1], ease: 'outElastic(1, .6)', duration: reduce ? 0 : 700 })
    }
    const onLeave = () => to({ scale: 0, opacity: 0, ease: 'inQuad', duration: reduce ? 0 : 220 })
    let hint
    const onDown = () => {
      hint?.kill()
      to({ scale: 0.78, opacity: 1, ease: 'outQuad', duration: reduce ? 0 : 180 })
    }
    const onUp = () => to({ scale: 1, ease: 'outElastic(1, .5)' })

    // Touch screens have no hover, so show the hint until it is used
    if (!window.matchMedia('(hover: hover)').matches) {
      gsap.set(wrap, { x: frame.clientWidth / 2, y: frame.clientHeight / 2 })
      hint = gsap.delayedCall(reduce ? 0 : 1.2, () => {
        to({ scale: [0, 1], opacity: [0, 1], ease: 'outElastic(1, .6)', duration: reduce ? 0 : 700 })
        if (!reduce) {
          anim = animate(dot, { scale: [1, 1.12], duration: 900, ease: 'inOutSine', loop: true, alternate: true, delay: 700 })
        }
      })
    }

    frame.addEventListener('pointerenter', onEnter)
    frame.addEventListener('pointerleave', onLeave)
    frame.addEventListener('pointermove', place)
    frame.addEventListener('pointerdown', onDown)
    frame.addEventListener('pointerup', onUp)
    frame.addEventListener('pointercancel', onUp)
    return () => {
      hint?.kill()
      anim?.pause()
      gsap.killTweensOf(wrap)
      frame.removeEventListener('pointerenter', onEnter)
      frame.removeEventListener('pointerleave', onLeave)
      frame.removeEventListener('pointermove', place)
      frame.removeEventListener('pointerdown', onDown)
      frame.removeEventListener('pointerup', onUp)
      frame.removeEventListener('pointercancel', onUp)
    }
  }, [explore, fallback])

  // On-screen tape display (anime.js): blinking PLAY and a running counter
  useEffect(() => {
    if (fallback || REDUCE()) return
    const blink = animate(playRef.current, {
      opacity: [1, 0.15],
      duration: 650,
      ease: steps(1),
      loop: true,
      alternate: true,
    })
    const pad = (n) => String(n).padStart(2, '0')
    const counter = createTimer({
      onUpdate: (self) => {
        const s = Math.floor(self.currentTime / 1000)
        if (counterRef.current) {
          counterRef.current.textContent = `SP ${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`
        }
      },
    })
    return () => {
      blink.revert()
      counter.revert()
    }
  }, [fallback])

  if (fallback) {
    return <img src={src} alt="" className={imgClassName} style={imgStyle} />
  }

  return (
    <div className={`vhs${explore ? ' vhs--explore' : ''}`}>
      <div ref={hostRef} className="vhs-canvas" />
      {explore && (
        <div ref={cursorRef} className="vhs-cursor" aria-hidden="true">
          <span ref={cursorDotRef} className="vhs-cursor-dot">DRAG</span>
        </div>
      )}
      <div className="vhs-osd" aria-hidden="true">
        <span ref={playRef} className="vhs-osd-play">PLAY ▶</span>
        <span ref={counterRef} className="vhs-osd-counter">SP 00:00:00</span>
        <span className="vhs-osd-date">{stamp(new Date())}</span>
      </div>
    </div>
  )
}
