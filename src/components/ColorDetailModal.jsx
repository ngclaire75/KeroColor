import { useEffect, useState } from 'react'
import bearImg from '../../images/bear.png'
import Footer from './Footer'
import './ColorDetailModal.css'

const BATCH_META = {
  next: {
    label: 'The Next Look',
    desc1: 'The highlights in this grade sit at the coolest edge of warm white — barely tinted but deliberate. Midtones carry a desaturated olive-grey that resists categorization, existing in the space between warm and cool without committing to either.',
    desc2: 'Shadow depth is achieved not through true black but through a deep, slightly greenish charcoal. The result is contrast that breathes — a palette that rewards careful study.',
    caption: 'A tonal edit defined by what it withholds — restraint as a creative statement.',
    tags: ['#Neutral', '#Editorial', '#Understated', '#CoolMidtones', '#Restrained'],
  },
  ws: {
    label: 'Warm Stone',
    desc1: 'Shadows lean unmistakably amber here — a decision that pushes every tone toward warmth without tipping into orange. The stone midtones sit between tan and greige, textural and grounded.',
    desc2: 'Highlights are lifted gently but stop short of blowing out, preserving a luminous quality that separates a warm grade from a flat one. The warmth is earned, not forced.',
    caption: 'Amber shadows, stone midtones, and lifted highlights — warmth through discipline.',
    tags: ['#WarmToned', '#Amber', '#Stone', '#Luminous', '#Grounded'],
  },
  np: {
    label: 'Natural Pale',
    desc1: 'The lightest entry in the collection — a bleached palette where shadows barely whisper and highlights dissolve toward white. Saturation is pulled in every channel, leaving only the faintest suggestion of hue.',
    desc2: 'Skin tones appear porcelain, environments feel overexposed in the best sense. This palette belongs to soft light and quiet subjects.',
    caption: 'Pale, lifted, desaturated — color at its most restrained.',
    tags: ['#Pale', '#Lifted', '#Soft', '#Desaturated', '#Airy'],
  },
  tj: {
    label: 'Terracotta & Jade',
    desc1: 'Drawn from earthen reds and oxidized greens, this palette bridges warm and cool with unusual authority. Terracotta shadows are rich without turning muddy; jade-tinted highlights feel precise and cool.',
    desc2: 'The contrast between these two opposing hue families creates visual tension that keeps the eye moving. Neither tone dominates — they negotiate.',
    caption: 'Terracotta and jade — opposing forces in careful equilibrium.',
    tags: ['#Terracotta', '#Jade', '#EarthenRed', '#OxidizedGreen', '#Contrasting'],
  },
  pw: {
    label: 'Pink Wine',
    desc1: 'The pinks here carry depth — veering toward rose wine and faded berry rather than anything pastel. Highlights glow with warm blush; shadows sink into soft plum without losing detail.',
    desc2: 'This is a romantic palette that avoids sweetness. The warmth is tempered by the depth of the shadows, giving it weight.',
    caption: 'Warm blush meets deep plum — romance without sentimentality.',
    tags: ['#Rose', '#PinkWine', '#Blush', '#Plum', '#WarmDepth'],
  },
  ap: {
    label: 'Ash & Pearl',
    desc1: 'A cool, desaturated palette where ash tones replace true blacks and pearl whites replace pure brightness. The result is a muted, almost analogue-film quality that distances itself from digital sharpness.',
    desc2: 'Every hue is quieted here. Even the warmest notes feel as though they have been left in overcast light for too long — which is exactly the point.',
    caption: 'Ash and pearl — desaturation as an aesthetic choice, not a compromise.',
    tags: ['#Ash', '#Pearl', '#Desaturated', '#Filmic', '#CoolMuted'],
  },
  tp: {
    label: 'Taupe',
    desc1: 'Taupe lives at the intersection of brown, grey, and rose — and this palette explores all three dimensions. Shadows feel like wet concrete; highlights like unbleached linen.',
    desc2: 'It is a sophisticated middle ground that adapts to almost any subject matter. Never loud, always present — the colour equivalent of a considered silence.',
    caption: 'The most versatile non-colour in any palette — taupe holds everything together.',
    tags: ['#Taupe', '#Concrete', '#Linen', '#NeutralDepth', '#Sophisticated'],
  },
  nr: {
    label: 'Natural Rust',
    desc1: 'Rust, sienna, and oxidised copper form the core of this palette. The warmth runs deep into the shadows while the highlights stay surprisingly clean — a contrast that creates energy without aggression.',
    desc2: 'Midtones carry an iron-oxide quality: rich, physical, and unmistakably warm. This is the colour of sunbaked clay and dry earth.',
    caption: 'Iron oxide and copper light — warmth with texture and weight.',
    tags: ['#NaturalRust', '#Sienna', '#Copper', '#OxideWarm', '#Earthy'],
  },
  wr: {
    label: 'Wine & Rose',
    desc1: 'Darker and more cinematic than the pink wine entry — deep burgundy shadows anchor the palette while faded rose midtones carry the transition upward. Contrast is higher and the mood more intentional.',
    desc2: 'Applied in low light or dappled shadow, this grade transforms ambient darkness into atmosphere. The colours do not describe the scene — they interpret it.',
    caption: 'Burgundy to rose — a cinematic interpretation of ambient darkness.',
    tags: ['#Burgundy', '#WineRose', '#Moody', '#Cinematic', '#DeepRed'],
  },
  r: {
    label: 'Red',
    desc1: 'An unapologetic red palette — shadows go crimson, highlights hold a hot coral warmth. Saturation is not reduced; it is directed. Every channel feeds into the red family with deliberate intent.',
    desc2: 'This palette commands attention. Used with precision it transforms any scene. The skill is knowing when the subject is strong enough to hold it.',
    caption: 'Crimson shadows, coral highlights — red as a palette decision, not an accident.',
    tags: ['#Red', '#Crimson', '#Coral', '#Saturated', '#Bold'],
  },
  j: {
    label: 'Jade',
    desc1: 'Cool greens and teal undertones run throughout — shadows drift toward deep forest, midtones toward sage, and highlights carry a faint metallic mint. The result feels organic and precise in equal measure.',
    desc2: 'This palette belongs to overcast light and botanical spaces. The cool green cast unifies the image and gives skin tones a restrained, almost editorial quality.',
    caption: 'Forest shadow, sage midtone, mint highlight — cool green from dark to light.',
    tags: ['#Jade', '#Teal', '#ForestGreen', '#MintHighlight', '#CoolGreen'],
  },
}

function extractColors(imgSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const size = 40
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)
      const { data } = ctx.getImageData(0, 0, size, size)

      const pixels = []
      for (let i = 0; i < data.length; i += 4) {
        pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
      }

      pixels.sort((a, b) => {
        const la = 0.299 * a.r + 0.587 * a.g + 0.114 * a.b
        const lb = 0.299 * b.r + 0.587 * b.g + 0.114 * b.b
        return la - lb
      })

      const third = Math.floor(pixels.length / 3)
      const avg = (arr) => ({
        r: Math.round(arr.reduce((s, p) => s + p.r, 0) / arr.length),
        g: Math.round(arr.reduce((s, p) => s + p.g, 0) / arr.length),
        b: Math.round(arr.reduce((s, p) => s + p.b, 0) / arr.length),
      })

      resolve([
        avg(pixels.slice(0, third)),
        avg(pixels.slice(third, 2 * third)),
        avg(pixels.slice(2 * third)),
      ])
    }
    img.onerror = () => resolve([{ r: 180, g: 170, b: 160 }, { r: 140, g: 130, b: 120 }, { r: 200, g: 195, b: 188 }])
    img.src = imgSrc
  })
}

function toHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0').toUpperCase()).join('')
}

function getTextColor(hex) {
  if (!hex) return '#fff'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 140 ? '#111' : '#fff'
}

function clampColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  if (lum > 205) {
    const scale = 175 / lum
    return '#' + [r, g, b]
      .map(v => Math.min(255, Math.round(v * scale)).toString(16).padStart(2, '0').toUpperCase())
      .join('')
  }
  return hex
}

export default function ColorDetailModal({ imgSrc, batch, onClose }) {
  const [colors, setColors] = useState([])
  const meta = BATCH_META[batch] || BATCH_META.next

  useEffect(() => {
    extractColors(imgSrc).then(cols => setColors(cols.map(toHex).map(clampColor)))
  }, [imgSrc])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="cdm-overlay" onClick={onClose}>
      <div className="cdm-panel" onClick={e => e.stopPropagation()}>

        {/* Nav */}
        <nav className="cdm-nav">
          <div className="cdm-nav-left">
            <img src={bearImg} alt="" className="cdm-avatar" />
            <span className="cdm-brand">KeroColor</span>
          </div>
          <div className="cdm-nav-divider" />
          <div className="cdm-nav-colors">
            {(colors.length ? colors : ['#C8C0B8', '#A89880', '#D8D2CC']).map((hex, i) => (
              <div key={i} className="cdm-swatch-group">
                <div className="cdm-swatch" style={{ background: hex, outline: `1.5px solid ${hex}`, outlineOffset: '4px' }} />
                <span className="cdm-hex">{hex}</span>
              </div>
            ))}
          </div>
          <div className="cdm-nav-divider" />
          <div className="cdm-nav-right">
            <span className="cdm-about" onClick={onClose}>Close Notebook</span>
          </div>
        </nav>

        {/* Main */}
        <div className="cdm-main">

          {/* Left — text */}
          <div className="cdm-left">
            <div className="cdm-notebook-row">
              <h2 className="cdm-notebook">NOTEBOOK</h2>
            </div>

            <div className="cdm-text">
              <p>{meta.desc1}</p>
              <p>{meta.desc2}</p>
            </div>

            <div className="cdm-tags">
              <div className="cdm-tags-row">
                {meta.tags.slice(0, 3).map((tag, idx) => {
                  const bg = (colors.length ? colors : ['#6B5B4E', '#8A7060', '#4E4540'])[idx]
                  return <span key={tag} className="cdm-tag" style={{ background: bg, color: getTextColor(bg) }}>{tag}</span>
                })}
              </div>
              <div className="cdm-tags-row">
                {meta.tags.slice(3, 5).map((tag, idx) => {
                  const bg = (colors.length ? colors : ['#6B5B4E', '#8A7060', '#4E4540'])[idx]
                  return <span key={tag} className="cdm-tag" style={{ background: bg, color: getTextColor(bg) }}>{tag}</span>
                })}
              </div>
            </div>
          </div>

          {/* Right — image */}
          <div className="cdm-right">
            <div className="cdm-img-wrap">
              <img src={imgSrc} alt="" className="cdm-img" />
              <div className="cdm-caption">
                <p>{meta.caption}</p>
              </div>
            </div>
          </div>

        </div>
        <Footer />
      </div>
    </div>
  )
}
