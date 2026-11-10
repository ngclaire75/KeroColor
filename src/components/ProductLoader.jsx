import { useEffect, useRef, useState } from 'react'
import lipDior from '../../images/loader/lip-dior.webp'
import lipRhodeBerry from '../../images/loader/lip-rhode-berry.webp'
import lipRhodeBrown from '../../images/loader/lip-rhode-brown.webp'
import paletteDior from '../../images/loader/palette-dior.webp'
import rhodeModel from '../../images/rhode_peptide_lip_tint_3d.glb?url'
import './ProductLoader.css'

// Shown in this order, one at a time. `h` is each product's height as a
// share of the stage — tubes stand taller than the palette so the set
// keeps a natural relative scale.
const PRODUCTS = [
  { src: lipDior,       h: 1 },
  { src: paletteDior,   h: 0.8 },
  { src: lipRhodeBerry, h: 1 },
  { src: lipRhodeBrown, h: 1 },
]

// Per-product timing (ms): fade/settle in, hold, fade out — the next
// product only starts once the previous one has fully faded.
const IN = 320
const HOLD = 260
const OUT = 280
const SLOT = IN + HOLD + OUT
// The last product doesn't fade on its own; it leaves with the overlay.
const SEQUENCE = SLOT * (PRODUCTS.length - 1) + IN + HOLD

// Temporary: show the Rhode 3D model (GLB) instead of the image sequence.
// Set to false to go back to the product images.
const SHOW_MODEL = false
const MODEL_SEQUENCE = 2800 // ms the model is on show before the exit

const CURTAIN_OUT = 1100 // ms for it to lift away and reveal the page

// Background curtain (WebGL): a deep brownish red, drawn as a full-screen
// shader. It starts fully covering (`uEnter` = 1); `uExit` lifts it off
// the top; while moving, its edge bulges at the centre and ripples, and a
// slightly lighter red layer runs just ahead of it. At rest the edge is
// off-screen, so the settled background is plain flat colour.
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`
const FRAG = /* glsl */ `
  uniform float uEnter;
  uniform float uExit;
  uniform float uTime;
  uniform vec2 uRes;
  varying vec2 vUv;
  const float PI = 3.14159265;
  const vec3 RED = vec3(59.0, 19.0, 16.0) / 255.0;   // #3b1310
  const vec3 LEAD = vec3(86.0, 32.0, 25.0) / 255.0;  // #562019

  // Edge height for a sweep at progress p: centre leads, with a soft ripple
  // whose strength peaks mid-motion and vanishes at both ends.
  float edge(float p, float x) {
    float motion = sin(clamp(p, 0.0, 1.0) * PI);
    float bulge = sin(x * PI) * 0.16;
    float ripple = sin(x * 7.0 + uTime * 2.4) * 0.018 + sin(x * 13.0 - uTime * 1.7) * 0.008;
    return p * 1.36 - 0.18 + (bulge + ripple) * motion;
  }

  void main() {
    float aa = 1.5 / uRes.y;
    float x = vUv.x, y = vUv.y;
    // layer coverage: below the rising edge and above the lifting edge
    float leadIn  = smoothstep(edge(uEnter + 0.07, x) + aa, edge(uEnter + 0.07, x) - aa, y);
    float mainIn  = smoothstep(edge(uEnter, x) + aa, edge(uEnter, x) - aa, y);
    float leadOut = smoothstep(edge(uExit - 0.07, x) - aa, edge(uExit - 0.07, x) + aa, y);
    float mainOut = smoothstep(edge(uExit, x) - aa, edge(uExit, x) + aa, y);
    float lead = leadIn * leadOut;
    float main = mainIn * mainOut;
    vec3 col = mix(LEAD, RED, main);
    float alpha = max(lead, main);
    gl_FragColor = vec4(col * alpha, alpha); // premultiplied
  }
`

// Temporary GLB preview: loads the Rhode model into its own transparent
// three.js canvas, stands it upright (it's authored Z-up, front facing -Y),
// fits it to the stage and lights it with a soft studio environment. After
// reveal() it eases in and then sways gently side to side so its depth
// reads, without ever turning its back to the viewer.
async function setupModel(THREE, { GLTFLoader }, { RoomEnvironment }, el, reduceMotion) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.NeutralToneMapping
  el.appendChild(renderer.domElement)
  el.style.opacity = 0

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTex
  const key = new THREE.DirectionalLight('#ffffff', 1.1)
  key.position.set(1.5, 2.5, 3)
  scene.add(key)
  const camera = new THREE.PerspectiveCamera(26, 1, 0.01, 100)

  const gltf = await new GLTFLoader().loadAsync(rhodeModel)
  const obj = gltf.scene
  obj.rotation.x = -Math.PI / 2
  const fit = new THREE.Group()
  fit.add(obj)
  const box = new THREE.Box3().setFromObject(fit)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  obj.position.sub(center)
  fit.scale.setScalar(1 / size.y) // unit height
  const spin = new THREE.Group()
  spin.add(fit)
  scene.add(spin)

  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    camera.position.set(0, 0, (0.5 / t) * 1.08)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  const state = { t: 0 }
  let revealAt = null
  let raf
  const tick = () => {
    raf = requestAnimationFrame(tick)
    const time = revealAt === null ? 0 : (performance.now() - revealAt) / 1000
    const sway = reduceMotion ? 0 : Math.sin(time * 0.9) * 0.5
    spin.rotation.y = -1.1 * (1 - state.t) + sway * state.t
    spin.position.y = -0.06 * (1 - state.t)
    spin.scale.setScalar(0.88 + 0.12 * state.t)
    renderer.render(scene, camera)
  }
  tick()

  return {
    reveal(animate) {
      revealAt = performance.now()
      animate(el, { opacity: [0, 1], duration: 500, ease: 'outQuad' })
      animate(state, { t: 1, duration: reduceMotion ? 1 : 1100, ease: 'outCubic' })
    },
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      obj.traverse((o) => {
        if (!o.isMesh) return
        o.geometry.dispose()
        for (const m of [].concat(o.material)) {
          for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap']) m[k]?.dispose()
          m.dispose()
        }
      })
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}

// Loading screen for the homepage: on a dark red WebGL curtain (three.js,
// animated with anime.js), the cut-out products appear one after another
// with a progress bar filling in step, then the curtain lifts away to
// reveal the page.
export default function ProductLoader({ onDone }) {
  const rootRef = useRef(null)
  const curtainRef = useRef(null)
  const contentRef = useRef(null)
  const modelStageRef = useRef(null)
  const itemRefs = useRef([])
  const barRef = useRef(null)
  const pctRef = useRef(null)
  const [gone, setGone] = useState(false)

  // Lock scrolling while the loader is up, but keep the scrollbar's space
  // reserved: otherwise the page is wider under the curtain and visibly
  // shifts sideways (reads as a refresh) the moment the scrollbar returns.
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

    // Progress = the lower of the sequence's progress and real loading
    // (libraries + every product image decoded), eased so it never jumps.
    let loaded = 0
    const totalSteps = (SHOW_MODEL ? 1 : PRODUCTS.length) + 1
    let seqStart = null
    let shown = 0
    let barRaf

    const images = SHOW_MODEL ? [] : PRODUCTS.map(({ src }) => {
      const img = new Image()
      img.src = src
      return img.decode().catch(() => {}).then(() => { loaded += 1 })
    })
    const gltfLoader = SHOW_MODEL ? import('three/examples/jsm/loaders/GLTFLoader.js') : null
    const roomEnv = SHOW_MODEL ? import('three/examples/jsm/environments/RoomEnvironment.js') : null

    Promise.all([import('three'), import('animejs'), gltfLoader, roomEnv, ...images]).then(async ([THREE, anime, gltfMod, envMod]) => {
      if (disposed) return
      loaded += 1
      const { animate, createTimeline } = anime

      // ── WebGL curtain ──
      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      curtainRef.current.appendChild(renderer.domElement)
      const uniforms = {
        uEnter: { value: 1 },
        uExit: { value: 0 },
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      }
      const material = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, uniforms,
        transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false,
      })
      const geometry = new THREE.PlaneGeometry(2, 2)
      const scene = new THREE.Scene()
      scene.add(new THREE.Mesh(geometry, material))
      const camera = new THREE.Camera()

      const curtain = { enter: 1, exit: 0 }
      let raf
      const t0 = performance.now()
      const tick = () => {
        raf = requestAnimationFrame(tick)
        uniforms.uTime.value = (performance.now() - t0) / 1000
        uniforms.uEnter.value = curtain.enter
        uniforms.uExit.value = curtain.exit
        renderer.render(scene, camera)
      }
      tick()
      // The curtain is now drawing the red, so the solid CSS red behind it
      // can go — the lift-off at the end then reveals the real page.
      rootRef.current.classList.add('pfl--covered')

      const onResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight)
        uniforms.uRes.value.set(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onResize)

      // ── 3D model stage (temporary GLB preview) ──
      let model = null
      if (SHOW_MODEL) {
        try {
          model = await setupModel(THREE, gltfMod, envMod, modelStageRef.current, reduceMotion)
        } catch (err) {
          console.error('Loader: could not load the 3D model', err)
        }
        loaded += 1 // counted either way so the bar can still finish
      }
      if (disposed) { model?.dispose(); return }

      // ── sequence: curtain in → products one by one ──
      let seqDone = false
      const items = itemRefs.current
      let tl
      const startProducts = () => {
        seqStart = performance.now()
        if (SHOW_MODEL) {
          model?.reveal(animate)
          setTimeout(() => { seqDone = true }, MODEL_SEQUENCE)
          return
        }
        if (reduceMotion) {
          items[items.length - 1].style.opacity = 1
          seqDone = true
          return
        }
        tl = createTimeline({ onComplete: () => { seqDone = true } })
        items.forEach((el, i) => {
          const at = i * SLOT
          tl.add(el, {
            opacity: [0, 1],
            scale: [0.94, 1],
            translateY: [14, 0],
            duration: IN,
            ease: 'outCubic',
          }, at)
          if (i < items.length - 1) {
            tl.add(el, {
              opacity: [1, 0],
              scale: [1, 1.03],
              duration: OUT,
              ease: 'inCubic',
            }, at + IN + HOLD)
          }
        })
      }

      startProducts()

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', onResize)
        tl?.pause()
        model?.dispose()
        geometry.dispose()
        material.dispose()
        renderer.dispose()
        renderer.forceContextLoss()
        renderer.domElement.remove()
      }

      // ── exit: content drifts up and fades as the curtain lifts away ──
      let exiting = false
      checkExit = () => {
        if (exiting || !seqDone || shown < 0.999) return
        exiting = true
        const finish = () => { setGone(true); onDone?.() }
        if (reduceMotion) {
          animate(rootRef.current, { opacity: 0, duration: 200, onComplete: finish })
          return
        }
        animate(contentRef.current, {
          opacity: [1, 0],
          translateY: [0, -36],
          duration: 520,
          delay: 200,
          ease: 'inCubic',
        })
        animate(curtain, {
          exit: [0, 1],
          duration: CURTAIN_OUT,
          delay: 360,
          ease: 'inOutQuart',
          onComplete: finish,
        })
      }
    })

    const barTick = () => {
      barRaf = requestAnimationFrame(barTick)
      const seqFrac = seqStart === null
        ? 0
        : reduceMotion ? 1 : Math.min((performance.now() - seqStart) / (SHOW_MODEL ? MODEL_SEQUENCE : SEQUENCE), 1)
      const target = Math.min(seqFrac, loaded / totalSteps)
      shown += (target - shown) * 0.15
      if (target - shown < 0.001) shown = target
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`
      if (pctRef.current) pctRef.current.textContent = `${Math.round(shown * 100)}%`
      checkExit()
    }
    barTick()

    return () => {
      disposed = true
      cancelAnimationFrame(barRaf)
      cleanup()
    }
  }, [onDone])

  if (gone) return null

  return (
    <div ref={rootRef} className="pfl" role="progressbar" aria-label="Loading KeroColor">
      <div ref={curtainRef} className="pfl-curtain" aria-hidden="true" />
      <div ref={contentRef} className="pfl-content">
        {SHOW_MODEL ? (
          <div ref={modelStageRef} className="pfl-stage pfl-stage--model" aria-hidden="true" />
        ) : (
        <div className="pfl-stage" aria-hidden="true">
          {PRODUCTS.map(({ src, h }, i) => (
            <img
              key={src}
              ref={(el) => { itemRefs.current[i] = el }}
              className="pfl-item"
              src={src}
              alt=""
              draggable="false"
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
        )}
        <div className="pfl-progress">
          <div className="pfl-track">
            <div ref={barRef} className="pfl-bar" />
          </div>
          <span ref={pctRef} className="pfl-pct">0%</span>
        </div>
      </div>
    </div>
  )
}
