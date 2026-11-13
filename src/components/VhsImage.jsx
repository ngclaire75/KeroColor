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
uniform float uFocusY;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// object-fit: cover, with a vertical focus point (0 = bottom, 1 = top)
vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return clamp(uv, 0.0, 1.0) * s + vec2((1.0 - s.x) * 0.5, (1.0 - s.y) * uFocusY);
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
  float ca = 0.0022 + 0.005 * band + 0.012 * uGlitch;
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

const REDUCE = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function stamp(date) {
  const mon = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  return `${mon}. ${String(date.getDate()).padStart(2, '0')} ${date.getFullYear()}`
}

// The card photo played back off a dusty VHS tape. Falls back to a plain
// <img> without WebGL.
export default function VhsImage({ src, focusY = 0.5, imgClassName = '', imgStyle }) {
  const hostRef = useRef(null)
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
      uFocusY: { value: focusY },
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

    const tick = (time) => {
      uniforms.uTime.value = time
      render()
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
        render()
        return
      }
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
    const frame = host.parentElement
    frame.addEventListener('pointerenter', onEnter)

    function dispose() {
      if (disposed) return
      disposed = true
      gsap.ticker.remove(tick)
      nextGlitch?.kill()
      tweens.forEach((t) => t.kill())
      frame.removeEventListener('pointerenter', onEnter)
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
  }, [src])

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
    <div className="vhs">
      <div ref={hostRef} className="vhs-canvas" />
      <div className="vhs-osd" aria-hidden="true">
        <span ref={playRef} className="vhs-osd-play">PLAY ▶</span>
        <span ref={counterRef} className="vhs-osd-counter">SP 00:00:00</span>
        <span className="vhs-osd-date">{stamp(new Date())}</span>
      </div>
    </div>
  )
}
