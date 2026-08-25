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
export function generatePalette({ hue, hueRange, hueCycle, sat, nouns, descs, count = 45 }) {
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
    // with a slightly different label. Capped well below "bright" —
    // kept in a dark-to-mid band, per the site's low-saturation, darker,
    // more editorial (Pantone-report-like) direction over anything
    // approaching neon.
    const l = 10 + ((i * 47) % 42)
    const h = hueRange
      ? hueRange[0] + (hueRange[1] - hueRange[0]) * t
      : hueCycle
        ? hueCycle[i % hueCycle.length]
        : hue
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
