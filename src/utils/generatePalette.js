// Bulk-generates a tab's base palette (40-50+ swatches) from a hue/
// saturation range plus small word banks, rather than hand-authoring
// each entry — at this volume per tab, combinatorial naming is what
// keeps names unique without needing hundreds of hand-written ones.
// Saturation is the authoritative sort key (low -> high), per the site's
// convention for the Discover Palettes pages; lightness is varied for
// visual richness but isn't part of the ordering.

const ADJECTIVES = [
  'Deep', 'Soft', 'Pale', 'Warm', 'Cool', 'Muted', 'Rich', 'Dusty',
  'Faded', 'Hushed', 'Quiet', 'Bold', 'Sheer', 'Subtle',
]

export function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// Used to keep "load more" (real Colormind colors, which don't carry a
// known saturation the way generated ones do) sorted into the same
// low -> high order as the generated base list.
export function hexSaturation(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255)
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return 0
  const d = max - min
  return (l > 0.5 ? d / (2 - max - min) : d / (max + min)) * 100
}

// hue: 0-360, one fixed hue for the whole tab. hueRange: [start, end]
// instead, to sweep smoothly across a span as saturation rises — e.g.
// brown into orange into red — rather than staying one color family.
// hueCycle: an array of several unrelated hues, cycled by index (used
// only for the one "mixed" tab that isn't a single color story). Give
// exactly one of the three. sat: [min, max] (0-100), the full range
// this tab's swatches span, low -> high — every item's own saturation
// is computed straight from this, so the low -> high order is exact by
// construction, not just a byproduct of some other formula. nouns:
// theme-specific words (8-10 is plenty). descs: short poetic phrases,
// cycled (don't need to be unique). count: how many swatches to
// generate — kept well under nouns.length * 14 so every name is unique.
export function generatePalette({ hue, hueRange, hueCycle, sat, light, nouns, descs, count = 45 }) {
  const [lMin, lSpan] = light ? [light[0], light[1] - light[0]] : [10, 42]
  const combos = []
  for (const noun of nouns) {
    for (const adj of ADJECTIVES) combos.push(`${adj} ${noun}`)
  }
  const items = []
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1)
    const s = sat[0] + (sat[1] - sat[0]) * t
    // Lightness swings across a band on a different cycle length than
    // the name/hue cycling below, so two swatches with close saturation
    // values still land far enough apart in lightness to read as
    // genuinely different colors rather than "the same shade" repeated
    // with a slightly different label. Defaults to a dark-to-mid band
    // (10-52%), per the site's low-saturation, darker, more editorial
    // direction over anything approaching neon — light: [min, max]
    // overrides that band for the rare tab that should read lighter
    // instead (e.g. Spring's pastel blossoms).
    const l = lMin + ((i * 47) % Math.max(lSpan, 1))
    const hRaw = hueRange
      ? hueRange[0] + (hueRange[1] - hueRange[0]) * t
      : hueCycle
        ? hueCycle[i % hueCycle.length]
        : hue
    // hueRange endpoints can go negative on purpose (e.g. sweeping past
    // true red at 0deg into crimson just beyond it) — normalized here
    // rather than left negative, since hslToHex's own modulo math
    // assumes a positive 0-360 input.
    const h = ((hRaw % 360) + 360) % 360
    items.push({
      color: hslToHex(h, s, l),
      name: combos[i % combos.length],
      desc: descs[i % descs.length],
      _s: s,
    })
  }
  // Belt-and-suspenders: the loop above already builds this ascending by
  // construction, but sorting explicitly on the exact saturation used
  // (rather than trusting float arithmetic never rounds a step out of
  // order) guarantees the low -> high order is exact.
  items.sort((a, b) => a._s - b._s)
  return items.map(({ _s, ...item }) => item)
}

function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255)
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h *= 60
  }
  return [h, s * 100, l * 100]
}

// Reasonably wide hue buckets — precision doesn't matter here, this is
// just for naming, not color math.
const HUE_NAMES = [
  { max: 12, name: 'Ruby' }, { max: 40, name: 'Amber' }, { max: 65, name: 'Gold' },
  { max: 85, name: 'Olive' }, { max: 150, name: 'Sage' }, { max: 170, name: 'Emerald' },
  { max: 195, name: 'Teal' }, { max: 225, name: 'Azure' }, { max: 255, name: 'Indigo' },
  { max: 285, name: 'Violet' }, { max: 320, name: 'Orchid' }, { max: 350, name: 'Rose' },
  { max: 360, name: 'Ruby' },
]

function hueName(h) {
  return HUE_NAMES.find((b) => h <= b.max)?.name ?? 'Rose'
}

function lightnessDescriptor(l) {
  if (l < 15) return 'Deepest'
  if (l < 28) return 'Deep'
  if (l < 42) return 'Rich'
  if (l < 56) return 'Dusty'
  if (l < 70) return 'Soft'
  if (l < 84) return 'Pale'
  return 'Palest'
}

export function isValidHex(value) {
  return /^#?[0-9a-f]{3}$|^#?[0-9a-f]{6}$/i.test(value.trim())
}

function normalizeHex(value) {
  let h = value.trim().replace(/^#/, '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return `#${h.toLowerCase()}`
}

// Powers the hex search on Discover/Seasonal Palettes: takes whatever
// hex the user typed and builds a family of shades of that same color,
// light -> dark (the search's own ordering — distinct from the
// saturation-ascending convention every hand-curated tab uses), instead
// of the tab-based word-bank categories above.
export function generateShadesFromHex(inputHex, count = 45) {
  const hex = normalizeHex(inputHex)
  const [h, inputSat] = hexToHsl(hex)
  // Keeps close to the searched color's own saturation rather than
  // reusing it exactly — a very low or very high input would otherwise
  // make half the generated shades look identical (near-grey or
  // near-neon) regardless of lightness.
  const sat = Math.max(20, Math.min(65, inputSat || 35))
  const items = []
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1)
    const l = 90 - t * 82 // light -> dark, 90% down to 8%
    const name = `${lightnessDescriptor(l)} ${hueName(h)}`
    items.push({
      color: hslToHex(h, sat, l),
      name,
      desc: `A shade of ${hex}`,
    })
  }
  return items
}

// 9 representative hex codes, one per color family, used to power the
// hamburger menu on Discover Palettes (and referenced from PalettePage's
// own menu/announcement bar) now that browsing happens by hex search
// rather than named tabs.
const SAMPLE_FAMILIES = [
  { hue: 18, sat: [16, 46] },      // Warm Terracotta
  { hue: 200, sat: [10, 38] },     // Cool Slate
  { hue: 38, sat: [20, 55] },      // Golden Hour
  { hue: 265, sat: [14, 44] },     // Midnight Bloom
  { hue: 345, sat: [12, 40] },     // Rose Quartz
  { hue: 140, sat: [12, 40] },     // Forest Canopy
  { hue: 205, sat: [16, 46] },     // Ocean Depth
  { hueRange: [28, -10], sat: [18, 58] }, // Autumn Harvest (brown -> crimson)
  { hue: 350, sat: [18, 50] },     // Berry Wine
]

export const SAMPLE_HEX_CODES = SAMPLE_FAMILIES.map(
  (f) => generatePalette({ ...f, nouns: ['x'], descs: ['x'], count: 90 })[45].color
)

// The Nude Series and Autumn Harvest hex specifically — used by
// PalettePage's announcement bar links, which used to point at named
// tabs that no longer exist.
export const NUDE_SAMPLE_HEX = generatePalette({ hue: 28, sat: [8, 28], nouns: ['x'], descs: ['x'], count: 90 })[45].color
