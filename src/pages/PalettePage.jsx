import { useState, useLayoutEffect, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import heroImg from '../../images/fire.webp'
import springImg from '../../images/spr.webp'
import lipstickImg from '../../images/girlofmydreams.webp'
import vogueImg from '../../images/vogue.webp'
import deerImg from '../../images/deer.webp'
import petalImg from '../../images/petal.webp'
import './PalettePage.css'
import { playPageLoader } from '../utils/pageLoader'

function DiscoverButton({ onClick }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const button = buttonRef.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.className = 'pp-discover-smoke'
    button.prepend(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const trail = Array.from({ length: 6 }, () => new THREE.Vector2(-10, -10))
    const radii = new Float32Array(6)
    const uniforms = { uTrail: { value: trail }, uTrailR: { value: radii }, uTime: { value: 0 }, uAspect: { value: 1 } }
    const material = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }',
      fragmentShader: `
        uniform vec2 uTrail[6]; uniform float uTrailR[6]; uniform float uTime; uniform float uAspect;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
        }
        float fbm(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return v; }
        void main() {
          vec2 p = vec2(vUv.x * uAspect, vUv.y);
          vec2 q = p * 4.0 + vec2(0., -uTime * .35);
          vec2 w = vec2(fbm(q + uTime * .12), fbm(q + vec2(5.2, 1.3) - uTime * .1));
          float s = fbm(q + w * 1.6), mask = 0.;
          for (int i = 0; i < 6; i++) {
            float d = length(p - uTrail[i]) + (s - .5) * .55;
            mask = max(mask, 1. - smoothstep(uTrailR[i] - .09, uTrailR[i] + .22, d));
          }
          gl_FragColor = vec4(vec3(0.0), mask * .95);
        }`,
    })
    const geometry = new THREE.PlaneGeometry(2, 2)
    scene.add(new THREE.Mesh(geometry, material))
    const pointer = new THREE.Vector2(-10, -10)
    let active = false, frame, last = performance.now()
    const resize = () => {
      const { width, height } = button.getBoundingClientRect()
      renderer.setSize(width, height, false)
      uniforms.uAspect.value = width / height
    }
    const move = (event) => {
      if (event.pointerType === 'touch') return
      const rect = button.getBoundingClientRect()
      pointer.set((event.clientX - rect.left) / rect.height, 1 - (event.clientY - rect.top) / rect.height)
      if (!active) trail.forEach((point) => point.copy(pointer))
      active = true
    }
    const leave = () => { active = false }
    button.addEventListener('pointermove', move)
    button.addEventListener('pointerleave', leave)
    const observer = new ResizeObserver(resize)
    observer.observe(button)
    resize()
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, .05)
      last = now
      uniforms.uTime.value = now / 1000
      trail.forEach((point, i) => {
        point.lerp(i === 0 ? pointer : trail[i - 1], 1 - Math.exp(-dt * (i === 0 ? 9 : 7)))
        const target = active ? 1.0 * (1 - i / 7) : 0
        radii[i] += (target - radii[i]) * (1 - Math.exp(-dt * (active ? 6 : 2.5)))
      })
      renderer.render(scene, camera)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      button.removeEventListener('pointermove', move)
      button.removeEventListener('pointerleave', leave)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <button ref={buttonRef} className="pp-discover-btn" onClick={onClick}><span className="pp-discover-label">Discover More Palettes</span></button>
}

const TABS = ['All', 'Seasonal Edition', 'Editorial', 'Inspiration']

const DUO_ITEMS = [
  { img: lipstickImg, name: 'Velvet Keepsake', desc: 'A heart kept safe in ruby velvet', hexes: ['#742833'] },
  { img: vogueImg, name: 'Neon Nocturne', desc: 'The city hums beneath amber light', hexes: ['#491319'] },
]

const SEASONAL_DUO_ITEMS = [
  { img: deerImg, name: 'Matcha Daydream', desc: 'Sweetness steeped in a quiet afternoon', hexes: ['#A9805E'] },
  { img: petalImg, name: 'Lace & Latte', desc: 'Soft indulgence, savored slow', hexes: ['#E7B8C2'] },
]

const SEASONAL_PALETTE_ITEMS = [
  { color: '#484537', category: 'Spring Blossom', name: 'Forest Umber', desc: 'Deep mossy woodland shadow' },
  { color: '#908A6E', category: 'Spring Blossom', name: 'Sage Khaki',   desc: 'Muted olive garden green' },
  { color: '#C4B5A6', category: 'Spring Blossom', name: 'Warm Taupe',  desc: 'Soft sunlit meadow beige' },
  { color: '#B78989', category: 'Spring Blossom', name: 'Dusty Rose',  desc: 'Faded blossom petal pink' },
  { color: '#CFADAB', category: 'Spring Blossom', name: 'Blush Petal', desc: 'Delicate pale cherry blossom' },
  { color: '#B89F9F', category: 'Spring Blossom', name: 'Rosy Mauve',  desc: 'Gentle dusky spring bloom' },
]

const SEASONAL_CONTENT = {
  heroImg: springImg,
  oxbloodTitle: 'Our Spring Blossom Picks. Discover the colors of a new season.',
  paletteItems: SEASONAL_PALETTE_ITEMS,
  duoItems: SEASONAL_DUO_ITEMS,
}

const DEFAULT_CONTENT = {
  heroImg,
  oxbloodTitle: 'Our Oxblood Picks. Discover the depth of a timeless shade.',
  paletteItems: null,
  duoItems: DUO_ITEMS,
}

const PALETTE_ITEMS = [
  { color: '#371a16', category: 'Earth Tones', name: 'Deep Mahogany', desc: 'Warm earthy dark tone' },
  { color: '#e9d9ca', category: 'Neutrals',    name: 'Linen Blush',   desc: 'Soft creamy neutral hue' },
  { color: '#221616', category: 'Earth Tones', name: 'Espresso Dark', desc: 'Rich deep brown shade' },
  { color: '#1e100f', category: 'Earth Tones', name: 'Night Rider',   desc: 'Near-black warm charcoal tone' },
  { color: '#30050e', category: 'Jewel Tones', name: 'Aubergine',     desc: 'Deep plum-wine richness' },
  { color: '#4d0c12', category: 'Jewel Tones', name: 'Maroon Oak',    desc: 'Rich brownish red depth' },
]

export default function PalettePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'All')
  // Land on this page at the top, regardless of scroll position on the
  // tab navigated from (browsers preserve scroll across client-side route
  // changes by default). Layout effect so it happens before the first
  // paint. Keyed on the navigation, so arriving again while already here
  // (e.g. All or Seasonal Edition picked from another page's menu) also
  // resets to the top and switches to the requested tab.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setActiveTab(location.state?.tab || 'All')
  }, [location.key])

  const content = activeTab === 'Seasonal Edition' ? SEASONAL_CONTENT : DEFAULT_CONTENT
  const paletteItems = content.paletteItems || PALETTE_ITEMS
  const duoItems = content.duoItems

  const handleTabClick = (tab) => {
    if (tab === 'Editorial') { navigate('/editorial'); return }
    if (tab === 'Inspiration') { navigate('/inspiration'); return }
    if (tab === activeTab) return
    playPageLoader()
    window.scrollTo({ top: 0, behavior: 'instant' })
    setActiveTab(tab)
  }

  return (
    <div className="pp-page pp-editorial">
      <nav className="pp-editorial-nav" aria-label="Palette navigation">
        <Link to="/" className="pp-editorial-nav-item pp-editorial-home"><span>home</span></Link>
        {TABS.map(tab => (
          <button key={tab} className={`pp-editorial-nav-item${activeTab === tab ? ' pp-editorial-nav-item--active' : ''}`}
            onClick={() => handleTabClick(tab)} aria-current={activeTab === tab ? 'page' : undefined}>
            <span>{tab}</span>
          </button>
        ))}
      </nav>

      <section className="pp-editorial-intro">
        <h1 className="pp-oxblood-title">{content.oxbloodTitle}</h1>
        <div className="pp-feature">
          <img src={content.heroImg} alt="" className={`pp-feature-img${activeTab === 'Seasonal Edition' ? ' pp-feature-img--spring' : ''}`} />
        </div>
      </section>

      {/* ── Palette grid ── */}
      <div className="pp-palette-grid">
        {paletteItems.map((item) => (
          <div key={item.color} className="pp-palette-item">
            <div className="pp-palette-swatch" style={{ background: item.color }} />
            <div className="pp-palette-text">
              <p className="pp-palette-desc">{item.desc}</p>
              <h3 className="pp-palette-name">{item.name}</h3>
              <p className="pp-palette-hex">{item.color}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Duo grid ── */}
      <div className={`pp-duo-grid${activeTab === 'Seasonal Edition' ? ' pp-duo-grid--seasonal' : ''}`}>

        {duoItems.map((item) => (
          <div key={item.name} className="pp-palette-item">
            <div className="pp-duo-swatch">
              <img src={item.img} alt={item.name} className={`pp-duo-img${item.name === 'Musical Daydream' ? ' pp-duo-img-desat' : ''}`} loading="lazy" decoding="async" />
            </div>
            <div className="pp-duo-text">
              <p className="pp-palette-desc">{item.desc}</p>
              <h3 className="pp-palette-name">{item.name}</h3>
              {item.hexes && item.hexes.map(hex => (
                <p key={hex} className="pp-palette-hex">{hex}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Discover more button — always leads to the one Discover
          Palettes page; Seasonal Edition opens it on its matcha green,
          #484537, as the first swatch. ── */}
      <div className="pp-discover-wrap">
        <DiscoverButton
          onClick={() => navigate('/palette/discover', activeTab === 'Seasonal Edition' ? { state: { hex: '#484537', anchorFirst: true } } : undefined)}
        />
      </div>

      <Footer />

    </div>
  )
}
