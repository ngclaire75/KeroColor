import { useState, useLayoutEffect } from 'react'
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
        <button
          className="pp-discover-btn"
          onClick={() => navigate('/palette/discover', activeTab === 'Seasonal Edition' ? { state: { hex: '#484537', anchorFirst: true } } : undefined)}
        >
          Discover More Palettes
        </button>
      </div>

      <Footer />

    </div>
  )
}
