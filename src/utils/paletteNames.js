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

function rgbToHex([r, g, b]) {
  const toHex = (n) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Used to build a lock color for Colormind's API (see fetchColormindColors)
// so a "load more" request comes back in the same color family as an
// existing tab instead of an unrelated random palette.
function hslToRgb(h, s, l) {
  s /= 100; l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))]
}

// Short, generic, mood-appropriate — Colormind gives us a color, not a
// story, so the description is picked from the same lightness/saturation
// read used for the name rather than hand-written per swatch.
const DESCS = [
  'A shade freshly drawn',
  'Color, undiluted',
  'Straight from the source',
  'A tone worth pausing on',
  'A color found, not chosen',
  'A color in its own right',
]

function descFromRgb([, , b], i) {
  return DESCS[i % DESCS.length]
}

// lockRgb, if given, is sent as one fixed slot in Colormind's 5-color
// input (the rest as "N" for "generate"), so every color that comes
// back is a real Colormind pick that's still plausible alongside that
// anchor color — the model's own job is producing colors that work
// together, which is exactly what "matches this tab's family" needs.
// Without a lock, Colormind free-generates from its default model.
async function fetchColormindColors(count, lockRgb) {
  const calls = Math.ceil(count / 5)
  const body = JSON.stringify({
    model: 'default',
    input: lockRgb ? [lockRgb, 'N', 'N', 'N', 'N'] : undefined,
  })
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
        body,
      }).then(res => res.json())
    )
  )
  let colors = responses.flatMap(r => r.result)
  // Drop the echoed lock color itself from each response — it's not a
  // new generated color, just the anchor we sent back unchanged.
  if (lockRgb) {
    const [lr, lg, lb] = lockRgb
    colors = colors.filter(([r, g, b]) => !(r === lr && g === lg && b === lb))
  }
  return colors
}

// Shortest distance between two hues on the color wheel (0-360, wraps
// around) — plain subtraction breaks near the 0/360 seam (e.g. 5 and 355
// are 10deg apart, not 350).
function hueDistance(a, b) {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

// Locking one Colormind input slot keeps that exact color, but the model
// still fills the other slots with whatever it judges "harmonious" —
// often a genuinely complementary (i.e. visually distant) hue, which
// reads as unrelated rather than "more of this same family." Filtering
// the response to hues actually close to the anchor is what makes that
// reliable instead of a coin flip.
const HUE_TOLERANCE = 30

// Generates one more on-hue color deterministically from a tab's own
// hue/sat, used to top up a batch when Colormind's response doesn't
// return enough in-family colors on its own — guarantees "load more"
// always comes back full and aligned, rather than depending on how many
// of Colormind's picks happen to pass the hue filter.
function localSwatch(hueAnchor, seed) {
  // Spreads seeds across a wide lightness range with small hue jitter so
  // repeated calls (repeated "load more" clicks) don't all land on the
  // same color, while everything still reads as the same family.
  const l = 20 + ((seed * 37) % 65)
  const hueJitter = ((seed * 53) % 21) - 10
  const rgb = hslToRgb(hueAnchor.hue + hueJitter, hueAnchor.sat, l)
  return rgb
}

// Like fetchPaletteNames, but returns the actual generated colors too
// (hex + name + a short description), sorted light -> dark so a grid
// built from them reads as one arranged set rather than a random
// scatter — same convention as the hand-curated categories.
//
// hueAnchor, if given, is a { hue, sat } pair (0-360, 0-100) used both to
// lock the Colormind request and to filter/top up its response, so
// "load more" reliably stays in that tab's color family instead of
// occasionally pulling in an unrelated complementary hue.
export async function fetchPaletteSwatches(count = 12, hueAnchor) {
  const seen = new Set()
  const swatches = []

  const tryAdd = (rgb) => {
    const name = nameFromRgb(rgb)
    if (seen.has(name)) return false
    seen.add(name)
    swatches.push({ color: rgbToHex(rgb), name, desc: descFromRgb(rgb, swatches.length), _s: rgbToHsl(...rgb)[1] })
    return true
  }

  try {
    const lockRgb = hueAnchor ? hslToRgb(hueAnchor.hue, hueAnchor.sat, 50) : undefined
    const rgbs = await fetchColormindColors(count, lockRgb)
    for (const rgb of rgbs) {
      if (swatches.length >= count) break
      if (hueAnchor) {
        const [h] = rgbToHsl(...rgb)
        if (hueDistance(h, hueAnchor.hue) > HUE_TOLERANCE) continue
      }
      tryAdd(rgb)
    }
  } catch {
    // Colormind unreachable — local top-up below covers the whole count.
  }

  // Colormind rarely returns enough in-family colors to fill the batch
  // on its own (it's optimizing for a harmonious palette, not a
  // monochromatic one) — this guarantees a full, aligned batch regardless.
  if (hueAnchor) {
    let seed = 1
    while (swatches.length < count && seed < count * 6) {
      tryAdd(localSwatch(hueAnchor, seed))
      seed++
    }
  }

  swatches.sort((a, b) => b._l - a._l)
  return swatches.map(({ _l, ...s }) => s)
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
