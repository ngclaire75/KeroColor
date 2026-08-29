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

// Real, specific color-family vocabulary (the way a paint catalog names
// swatches — Mahogany, Blush, Espresso — not a generic light/dark scale
// reused across every hue). Each family carries both nouns AND modifier
// words particular to that family (Mossy/Woodland for greens, Molten/
// Burnished for coppers, Twilight/Velvet for purples, ...) instead of a
// single Deep/Rich/Soft/Pale scale applied uniformly to any color. Near-
// black and near-grey/near-white swatches get their own vocabulary
// regardless of hue — a very dark red and a very dark blue both just
// read as "near-black" to the eye, which is why PalettePage's own hand-
// written names include things like "Night Rider" and "Espresso Dark"
// for colors that aren't red or brown at all.
const HUE_FAMILIES = [
  { max: 12,  nouns: ['Crimson', 'Cherry', 'Scarlet'], mods: ['Smoldering', 'Blazing', 'Sunburnt', 'Molten'] },
  { max: 30,  nouns: ['Mahogany', 'Rust', 'Terracotta', 'Sienna'], mods: ['Charred', 'Weathered', 'Sunbaked', 'Burnished'] },
  { max: 45,  nouns: ['Amber', 'Copper', 'Ginger'], mods: ['Molten', 'Burnished', 'Glowing', 'Honeyed'] },
  { max: 65,  nouns: ['Gold', 'Honey', 'Mustard'], mods: ['Burnt', 'Toasted', 'Gilded', 'Sunlit'] },
  { max: 90,  nouns: ['Olive', 'Moss'], mods: ['Shadowed', 'Weathered', 'Mossy', 'Sunlit'] },
  { max: 150, nouns: ['Sage', 'Forest', 'Ivy'], mods: ['Shadowed', 'Woodland', 'Mossy', 'Misted'] },
  { max: 195, nouns: ['Teal', 'Lagoon', 'Jade'], mods: ['Murky', 'Oceanic', 'Glassy', 'Misted'] },
  { max: 225, nouns: ['Azure', 'Denim', 'Slate'], mods: ['Stormy', 'Weathered', 'Faded', 'Hazy'] },
  { max: 255, nouns: ['Indigo', 'Navy', 'Cobalt'], mods: ['Midnight', 'Twilight', 'Stormy', 'Hazy'] },
  { max: 285, nouns: ['Violet', 'Plum', 'Aubergine'], mods: ['Smoldering', 'Twilight', 'Velvet', 'Misted'] },
  { max: 320, nouns: ['Orchid', 'Mauve', 'Lilac'], mods: ['Twilight', 'Powdery', 'Faded', 'Sunlit'] },
  { max: 350, nouns: ['Rose', 'Blush', 'Berry'], mods: ['Smoldering', 'Sunkissed', 'Powdery', 'Sunlit'] },
  { max: 360, nouns: ['Crimson', 'Cherry', 'Scarlet'], mods: ['Smoldering', 'Blazing', 'Sunburnt', 'Molten'] },
]
const NEAR_BLACK = { nouns: ['Espresso', 'Onyx', 'Charcoal', 'Raven', 'Ebony'], mods: ['Smoky', 'Shadowed', 'Charred', 'Midnight', 'Inky'] }
const NEAR_GREY = { nouns: ['Stone', 'Ash', 'Pewter', 'Fog'], mods: ['Weathered', 'Overcast', 'Misted', 'Faded'] }
const NEAR_WHITE = { nouns: ['Linen', 'Cream', 'Ivory', 'Powder'], mods: ['Sunwashed', 'Powdery', 'Bleached', 'Hazy'] }

function colorFamily(h, s, l) {
  if (l < 14) return NEAR_BLACK
  if (s < 12) return l > 80 ? NEAR_WHITE : NEAR_GREY
  return HUE_FAMILIES.find((b) => h <= b.max) ?? HUE_FAMILIES[HUE_FAMILIES.length - 1]
}

// A word describing what the hue itself feels like, for the desc's own
// sentence — kept specific to that hue family, not a brightness scale.
function hueTexture(h, s, l) {
  if (l < 14) return 'near-black'
  if (s < 12) return l > 80 ? 'warm neutral' : 'muted grey'
  if (h <= 12 || h > 350) return 'crimson'
  if (h <= 30) return 'earthy brown'
  if (h <= 45) return 'copper'
  if (h <= 65) return 'golden'
  if (h <= 90) return 'olive'
  if (h <= 150) return 'sage green'
  if (h <= 195) return 'teal'
  if (h <= 225) return 'denim blue'
  if (h <= 255) return 'indigo'
  if (h <= 285) return 'plum-wine'
  if (h <= 320) return 'orchid'
  return 'berry'
}

// 'tone' and 'hue' (the literal words) replaced with 'shade' — 'glow',
// 'cast', and 'note' stay as their own options.
const TONE_WORDS = ['shade', 'shade', 'shade', 'glow', 'cast', 'note']

// Builds a name/desc pair from a swatch's own h/s/l, cycling through
// every noun x modifier combo in that hue family's own word bank
// (comboIdx counts up across noun then modifier, so it exhausts every
// pairing before any repeats) instead of a universal Deep/Rich/Soft/
// Pale scale — none of those words appear anywhere here. desc uses a
// different modifier (offset by one) than the name, so the two don't
// just restate each other.
function describeShade(h, s, l, comboIdx) {
  const family = colorFamily(h, s, l)
  const nounIdx = comboIdx % family.nouns.length
  const modIdx = Math.floor(comboIdx / family.nouns.length) % family.mods.length
  const name = comboIdx % 3 === 2
    ? `${family.nouns[nounIdx]} ${family.mods[modIdx]}`
    : `${family.mods[modIdx]} ${family.nouns[nounIdx]}`
  const descModIdx = (modIdx + 1) % family.mods.length
  const hueWord = hueTexture(h, s, l)
  const tone = TONE_WORDS[comboIdx % TONE_WORDS.length]
  const desc = `${family.mods[descModIdx]} ${hueWord} ${tone}`
  return { name, desc }
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
// hex the user typed and builds a family around it — only a handful of
// shades lighter (LIGHTER_STEPS, each a small fixed step up from the
// input's own lightness, not a sweep toward white), the entered hex
// itself exactly as typed, then the rest of the grid sweeping down to
// a near-black floor.
const LIGHTER_STEPS = 4
const LIGHT_STEP = 5 // lightness points per step above the input — kept
// small (max +10 across 2 steps) so the lighter shades stay close to
// the input, not too light

export function generateShadesFromHex(inputHex, count = 45) {
  const hex = normalizeHex(inputHex)
  const [h, inputSat, inputLight] = hexToHsl(hex)
  // Keeps close to the searched color's own saturation rather than
  // reusing it exactly — a very low or very high input would otherwise
  // make half the generated shades look identical (near-grey or
  // near-neon) regardless of lightness.
  const sat = Math.max(20, Math.min(65, inputSat || 35))
  // Not all the way to near-black — a shallower floor so the darkest
  // swatch still reads as a shade of the input color, not just black.
  const darkFloor = 10
  // A light input skips the darker sweep entirely — it has much less
  // room to go darker before it starts looking unrelated to what was
  // searched, so it only gets the lighter steps plus the anchor.
  const isLightInput = inputLight >= 65
  const hexIndex = Math.min(LIGHTER_STEPS, count - 1)
  const items = []
  // Shared across every push below (not reset per-loop) so the name/
  // desc variety (see describeShade) stays spread across the whole
  // grid instead of restarting at each segment.
  let idx = 0

  // Guards against two steps landing on the exact same hex — the eased
  // curve below (and the small LIGHT_STEP increments above) can put two
  // consecutive lightness values close enough that hslToHex's rounding
  // collapses them to an identical hex. On a collision, nudges further
  // in the direction that step was already heading (lighter items push
  // lighter, darker items push darker) rather than toward the anchor,
  // so the light -> dark order stays intact.
  const usedColors = new Set([hex])
  // Guards name/desc uniqueness the same way usedColors guards the hex
  // itself — comboIdx already cycles through a hue family's full noun x
  // modifier combo space without repeating, but this is the backstop
  // for whenever count exceeds that space (or a near-black/grey/white
  // override collapses several steps into the same small word bank).
  const usedNames = new Set()
  const usedDescs = new Set()
  const describeUnique = (l) => {
    let result = describeShade(h, sat, l, idx)
    let attempts = 0
    while ((usedNames.has(result.name) || usedDescs.has(result.desc)) && attempts < 40) {
      idx++
      result = describeShade(h, sat, l, idx)
      attempts++
    }
    // Truly exhausted the word bank (only possible with an unusually
    // large count) — a numbered suffix beats a silent duplicate.
    if (usedNames.has(result.name)) result = { ...result, name: `${result.name} ${Math.floor(idx / 40) + 2}` }
    if (usedDescs.has(result.desc)) result = { ...result, desc: `${result.desc}, ${Math.floor(idx / 40) + 2}` }
    usedNames.add(result.name)
    usedDescs.add(result.desc)
    idx++
    return result
  }

  const pushUnique = (l, direction) => {
    let color = hslToHex(h, sat, l)
    let attempts = 0
    while (usedColors.has(color) && attempts < 12) {
      l = Math.max(0, Math.min(100, l + direction))
      color = hslToHex(h, sat, l)
      attempts++
    }
    usedColors.add(color)
    items.push({ color, ...describeUnique(l) })
  }

  for (let i = 0; i < hexIndex; i++) {
    const l = Math.min(97, inputLight + (hexIndex - i) * LIGHT_STEP)
    pushUnique(l, 1)
  }

  items.push({ color: hex, ...describeUnique(inputLight) })

  const darkSteps = isLightInput ? 0 : count - 1 - hexIndex
  for (let i = 1; i <= darkSteps; i++) {
    const t = i / Math.max(darkSteps, 1)
    // Eased (t^1.4), not linear — a milder curve than t^2 so it doesn't
    // bunch the first couple of steps too close to the input itself,
    // while still delaying the drop into a darker lightnessAdjective
    // bucket rather than crossing it right after the anchor and then
    // sitting there, unchanged-looking, for most of the remaining run.
    const eased = Math.pow(t, 1.4)
    const l = inputLight - eased * (inputLight - darkFloor)
    pushUnique(l, -1)
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
