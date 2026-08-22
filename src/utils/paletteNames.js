// Turns real Colormind-generated colors into evocative two-word palette
// names (e.g. "Deep Mahogany", "Dusty Rose") in the same style already
// used across the palette content in PalettePage.jsx.

const HUE_NAMES = [
  { max: 10, name: 'Ruby' },
  { max: 40, name: 'Amber' },
  { max: 60, name: 'Gold' },
  { max: 80, name: 'Olive' },
  { max: 150, name: 'Sage' },
  { max: 170, name: 'Emerald' },
  { max: 195, name: 'Teal' },
  { max: 220, name: 'Azure' },
  { max: 255, name: 'Indigo' },
  { max: 285, name: 'Violet' },
  { max: 320, name: 'Orchid' },
  { max: 350, name: 'Rose' },
  { max: 360, name: 'Ruby' },
]

const NEUTRAL_NAMES = [
  { max: 30, name: 'Onyx' },
  { max: 55, name: 'Charcoal' },
  { max: 75, name: 'Taupe' },
  { max: 100, name: 'Linen' },
]

// Curated fallback used if the Colormind API is unreachable, and to pad
// out any duplicate names the generator produces.
const FALLBACK_NAMES = [
  'Deep Mahogany', 'Dusty Rose', 'Rich Aubergine', 'Pale Linen', 'Soft Sage',
  'Muted Taupe', 'Rich Maroon', 'Deep Onyx', 'Warm Amber', 'Vivid Teal',
]

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
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

function hueName(h) {
  return HUE_NAMES.find(b => h <= b.max)?.name ?? 'Rose'
}

function neutralName(l) {
  return NEUTRAL_NAMES.find(b => l <= b.max)?.name ?? 'Linen'
}

function descriptor(l, s) {
  if (s < 15) return 'Muted'
  if (l < 22) return 'Deep'
  if (l < 38) return 'Rich'
  if (l < 55) return s > 55 ? 'Vivid' : 'Dusty'
  if (l < 72) return 'Soft'
  return 'Pale'
}

function nameFromRgb([r, g, b]) {
  const [h, s, l] = rgbToHsl(r, g, b)
  const noun = s < 12 ? neutralName(l) : hueName(h)
  return `${descriptor(l, s)} ${noun}`
}

// Fetches real generated palettes from the Colormind API and derives
// `count` unique palette names from their colors. Falls back to a
// curated list if the API is unreachable.
export async function fetchPaletteNames(count = 9) {
  try {
    const calls = Math.ceil(count / 5)
    const responses = await Promise.all(
      Array.from({ length: calls }, () =>
        // Content-Type is deliberately 'text/plain' (not 'application/json'):
        // Colormind's API parses the body as JSON regardless, but its preflight
        // response doesn't allow 'application/json' as a request header, which
        // makes browsers block the real request. 'text/plain' is CORS-safelisted,
        // so no preflight is sent at all.
        fetch('https://colormind.io/api/', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ model: 'default' }),
        }).then(res => res.json())
      )
    )

    const colors = responses.flatMap(r => r.result)
    const seen = new Set()
    const names = []
    for (const rgb of colors) {
      const name = nameFromRgb(rgb)
      if (!seen.has(name)) {
        seen.add(name)
        names.push(name)
      }
      if (names.length >= count) break
    }

    let i = 0
    while (names.length < count && i < FALLBACK_NAMES.length) {
      if (!seen.has(FALLBACK_NAMES[i])) {
        seen.add(FALLBACK_NAMES[i])
        names.push(FALLBACK_NAMES[i])
      }
      i++
    }

    return names.slice(0, count)
  } catch {
    return FALLBACK_NAMES.slice(0, count)
  }
}

export { FALLBACK_NAMES }
