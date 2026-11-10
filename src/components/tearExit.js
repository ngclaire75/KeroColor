// Torn-paper exit for the page loader. The loader (background + dot
// figure) is snapshotted onto two full-screen paper halves in a three.js
// (WebGL) scene. On exit a jagged tear unzips diagonally from the bottom-
// left corner to the top-right, exposing a white, fibrous paper edge
// (fibres generated with p5.js), then the halves pull apart and away —
// timed with anime.js — revealing the page underneath.

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform sampler2D uScene;   // snapshot of the loader
  uniform sampler2D uFibre;   // p5 paper-fibre strip
  uniform float uSide;        // +1 = top-left half, -1 = bottom-right half
  uniform float uTear;        // 0..1 how far the tear has run along the line
  uniform float uFromTop;     // 1 = tear starts top-right, runs to bottom-left
  uniform float uAspect;
  varying vec2 vUv;

  float hash(float x) { return fract(sin(x * 127.1) * 43758.5453); }
  float noise(float x) {
    float i = floor(x), f = fract(x);
    return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f));
  }
  float ridge(float s) {
    // jagged but smooth-ish tear: a few octaves of 1D noise along the line
    return (noise(s * 9.0) - 0.5) * 0.045
         + (noise(s * 31.0 + 3.1) - 0.5) * 0.018
         + (noise(s * 97.0 + 7.7) - 0.5) * 0.006;
  }

  void main() {
    // position along (s) and across (d) the bottom-left → top-right diagonal,
    // with x scaled by aspect so the tear runs corner to corner
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    vec2 dir = normalize(vec2(uAspect, 1.0));
    vec2 nrm = vec2(-dir.y, dir.x);           // points to the top-left side
    float s = dot(p, dir) / length(vec2(uAspect, 1.0));
    float d = dot(p, nrm) - ridge(s * 3.0);
    float side = d * uSide;                   // > 0 on this half's own side
    if (side < 0.0) discard;

    vec4 scene = texture2D(uScene, vUv);

    // white torn paper edge: wider and fibrous on the top-left half, a thin
    // lip on the other; only where the tear has already run
    float along = mix(s, 1.0 - s, uFromTop);
    float ran = smoothstep(uTear + 0.02, uTear - 0.02, along);
    float width = (uSide > 0.0 ? 0.016 : 0.006) * (0.6 + 0.8 * noise(s * 23.0 + uSide * 5.0));
    float fibre = texture2D(uFibre, vec2(s * 5.0, clamp(side / width, 0.0, 1.0))).r;
    float rim = smoothstep(width, width * 0.35, side) * ran;
    // feathered fibres right at the very edge
    float feather = smoothstep(0.0, 0.004, side) + fibre * 0.6;
    vec3 paper = mix(vec3(0.93, 0.91, 0.87), vec3(1.0), fibre);
    // soft shade on the coloured paper just inside the rim
    float shade = 1.0 - 0.25 * smoothstep(width * 2.5, width, side) * ran;
    vec3 col = mix(scene.rgb * shade, paper, rim);
    float alpha = rim > 0.001 ? clamp(feather, 0.0, 1.0) : 1.0;
    gl_FragColor = vec4(col * alpha, alpha); // premultiplied
  }
`

// p5: a strip of white paper fibres — fine, pale, randomly angled strokes
// on a light ground — used to texture the torn edge.
function makeFibreCanvas(P5) {
  return new Promise((resolve) => {
    const holder = document.createElement('div')
    holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
    document.body.appendChild(holder)
    // eslint-disable-next-line no-new
    new P5((p) => {
      p.setup = () => {
        p.pixelDensity(1)
        const c = p.createCanvas(512, 64)
        p.background(200)
        p.noFill()
        for (let i = 0; i < 1400; i++) {
          const x = p.random(p.width)
          const y = p.random(p.height)
          const len = p.random(3, 14)
          const a = p.random(-0.5, 0.5) + (p.random() < 0.5 ? 0 : Math.PI / 2)
          p.stroke(255, p.random(90, 230))
          p.strokeWeight(p.random(0.4, 1.3))
          p.line(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len)
        }
        p.noLoop()
        const el = c.elt
        holder.remove()
        resolve({ canvas: el, dispose: () => p.remove() })
      }
    }, holder)
  })
}

// Builds the torn-paper scene from a snapshot of the loader (flat
// background + the dot figure where it sits): two full-screen halves split
// along the diagonal, drawn in their own WebGL canvas over the loader.
// `tear.run` is how much of the white torn edge is showing (0..1 along the
// line from the bottom-left), `tear.sep` how far apart the halves are.
async function createTear({ THREE, P5, root, figureCanvas, background }) {
  const W = window.innerWidth
  const H = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio, 2)

  const snap = document.createElement('canvas')
  snap.width = Math.round(W * dpr)
  snap.height = Math.round(H * dpr)
  const ctx = snap.getContext('2d')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, snap.width, snap.height)
  if (figureCanvas) {
    const r = figureCanvas.getBoundingClientRect()
    ctx.drawImage(figureCanvas, r.left * dpr, r.top * dpr, r.width * dpr, r.height * dpr)
  }

  const fibre = await makeFibreCanvas(P5)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true })
  renderer.setPixelRatio(dpr)
  renderer.setSize(W, H)
  Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0', zIndex: '2' })
  root.appendChild(renderer.domElement)

  const aspect = W / H
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, -10, 10)
  const sceneTex = new THREE.CanvasTexture(snap)
  sceneTex.colorSpace = THREE.NoColorSpace
  const fibreTex = new THREE.CanvasTexture(fibre.canvas)
  fibreTex.colorSpace = THREE.NoColorSpace
  fibreTex.wrapS = THREE.RepeatWrapping
  const geometry = new THREE.PlaneGeometry(aspect * 2, 2)

  const tear = { run: 0, sep: 0 }
  const halves = [1, -1].map((side) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uScene: { value: sceneTex },
        uFibre: { value: fibreTex },
        uSide: { value: side },
        uTear: { value: 0 },
        uFromTop: { value: 0 },
        uAspect: { value: aspect },
      },
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    })
    const mesh = new THREE.Mesh(geometry, mat)
    scene.add(mesh)
    return { mesh, mat, side }
  })

  // Direction the halves travel: perpendicular to the tear, outward.
  const len = Math.hypot(aspect, 1)
  const nrm = new THREE.Vector2(-1 / len, aspect / len)

  const draw = () => {
    for (const h of halves) {
      h.mat.uniforms.uTear.value = tear.run * 1.08
      const dist = tear.sep * 2.2
      h.mesh.position.set(nrm.x * dist * h.side * aspect, nrm.y * dist * h.side, 0)
      h.mesh.rotation.z = tear.sep * 0.09 * h.side
    }
    renderer.render(scene, camera)
  }

  let raf
  const loop = () => { raf = requestAnimationFrame(loop); draw() }

  return {
    tear,
    start() { draw(); loop() },
    dispose() {
      cancelAnimationFrame(raf)
      sceneTex.dispose()
      fibreTex.dispose()
      geometry.dispose()
      halves.forEach((h) => h.mat.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
      fibre.dispose()
    },
  }
}

// Exit: the white torn edge runs from the bottom-left corner to the top-
// right, then the halves pull apart and away, revealing the page.
export async function runTearExit({ THREE, animate, P5, root, figureCanvas, background, fast = false, onDone }) {
  const t = await createTear({ THREE, P5, root, figureCanvas, background })
  t.tear.run = 0
  t.tear.sep = 0
  t.start()
  // The halves now stand in for the loader, so its own layers can go —
  // when they part, the real page shows through.
  root.classList.add('plx--tearing')
  // fast: ≈0.65s, for reloads/page switches; otherwise the full ≈1.6s
  const T = fast ? { run: 260, sep: 460, delay: 190 } : { run: 650, sep: 1050, delay: 520 }
  animate(t.tear, { run: [0, 1], duration: T.run, ease: 'inOutSine' })
  animate(t.tear, {
    sep: [0, 1],
    duration: T.sep,
    delay: T.delay,
    ease: 'inOutCubic',
    onComplete: () => { t.dispose(); onDone() },
  })
}
