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

// hue: 0-360. sat: [min, max] (0-100), the range this tab's swatches
// span, low -> high. nouns: theme-specific words (8-10 is plenty).
// descs: short poetic phrases, cycled (don't need to be unique). count:
// how many swatches to generate.
export function generatePalette({ hue, sat, nouns, descs, count = 45 }) {
  const combos = []
  for (const noun of nouns) {
    for (const adj of ADJECTIVES) combos.push(`${adj} ${noun}`)
  }
  const items = []
  for (let i = 0; i < count; i++) {
    const s = sat[0] + (sat[1] - sat[0]) * (i / Math.max(count - 1, 1))
    // Cycles across a wide lightness band (not tied to i in a simple
    // ascending/descending way) so swatches at similar saturation still
    // look visually distinct rather than near-duplicates.
    const l = 22 + ((i * 41) % 62)
    items.push({
      color: hslToHex(hue, s, l),
      name: combos[i % combos.length],
      desc: descs[i % descs.length],
    })
  }
  return items
}
