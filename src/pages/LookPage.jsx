import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSearch } from '../SearchContext'
import kImg from '../../images/k.png'
import SearchLoader from '../components/SearchLoader'
import './LookPage.css'

const BATCH_META = {
  next: { label: 'The Next Look', cards: [
    { heading: 'Deep Crimson —\na statement in red',     desc: 'Rich reds and warm roses build a bold, expressive palette for the daring look.' },
    { heading: 'Crimson Edge —\nfeel the intensity',     desc: 'A concentrated red that commands attention and refuses to fade into the background.' },
    { heading: 'Red Rising —\nown the moment',           desc: 'Layers of deep crimson unfold into a look that is equal parts raw and refined.' },
    { heading: 'Bold Red —\nno apologies',               desc: 'Saturated, vivid, and uncompromising. This is red at its most confident.' },
    { heading: 'Scarlet Mood —\ndrama in every detail',  desc: 'From lip to lid, scarlet takes over — creating a look that stops the room.' },
    { heading: 'The Red Look —\npassion personified',    desc: 'A palette built entirely around the power of one singular, magnetic color.' },
    { heading: 'Vivid Red —\nfor the bold',              desc: 'Bright, electric, fearless. This red palette is made for those who lean in.' },
    { heading: 'Dark Crimson —\ndeep and deliberate',    desc: 'A moodier take on red — shadowed, rich, and full of quiet drama.' },
    { heading: 'Cherry Red —\nsweet but sharp',          desc: 'A cherry-toned palette that balances playfulness with a cutting edge.' },
  ]},
  ws: { label: 'Warm Stone', cards: [
    { heading: 'Warm Stone —\nearthy & understated',     desc: 'Soft taupes and sandy nudes ground a look that is quietly confident.' },
    { heading: 'Stone Skin —\nnude but alive',           desc: 'Warm beige tones blend seamlessly with skin for an elevated, natural finish.' },
    { heading: 'Desert Glow —\nsun-kissed warmth',       desc: 'Sandy, warm, and luminous. A palette inspired by golden hour on open terrain.' },
    { heading: 'Sandstone —\ntextured and true',         desc: 'Natural browns and ochres bring a grounded texture that feels lived-in and real.' },
    { heading: 'Earth Edit —\nmuted tones, loud impact', desc: 'Stripped back to the essentials — warm neutrals that speak quietly but clearly.' },
    { heading: 'Warm Nude —\nsecond skin finish',        desc: 'Barely-there coverage that enhances without altering. Natural, warm, effortless.' },
    { heading: 'Clay Tone —\nartisan warmth',            desc: 'Rich clay hues that recall handmade craft — organic, warm, and deeply human.' },
    { heading: 'Stone Edit —\ncalm and collected',       desc: 'Cool stones and warm sands in balance — a palette of composed sophistication.' },
    { heading: 'Golden Stone —\nwarm light captured',    desc: 'Dusty gold and tan tones that mimic the glow of sunlight through dry air.' },
  ]},
  np: { label: 'Natural Pale', cards: [
    { heading: 'Natural Pale —\nbareface elegance',      desc: 'Blush nudes and milky whites create a barely-there, effortlessly clean finish.' },
    { heading: 'Pale Light —\nclear and clean',          desc: 'A pale palette that erases noise and lets natural skin luminosity shine through.' },
    { heading: 'Bare Skin —\nnaked beauty',              desc: 'Minimal coverage, maximum glow. Skin-like sheers that enhance what is already there.' },
    { heading: 'Milky Glow —\nsoft and translucent',     desc: 'Porcelain tones blurred at the edges — soft, dreamy, and quietly radiant.' },
    { heading: 'Pale Petal —\ndelicate as morning',      desc: 'Whisper-soft blush and pale ivory combine for a look as gentle as dawn.' },
    { heading: 'Skin First —\nnude and luminous',        desc: 'Every shade serves the skin. A palette dedicated to skin-first, effortless beauty.' },
    { heading: 'Snow Nude —\ncrisp and refined',         desc: 'Pale cool nudes with just a hint of pink — clean, crisp, and impeccably refined.' },
    { heading: 'White Glow —\npure radiance',            desc: 'High-luminosity whites and nudes that amplify natural glow from within.' },
    { heading: 'Pearl Tone —\nuniform and soft',         desc: 'Soft pearlescent nudes that diffuse light and smooth the skin\'s surface evenly.' },
  ]},
  tj: { label: 'Terracotta & Jade', cards: [
    { heading: 'Terracotta —\nbold earth tones',         desc: 'Clay reds and warm terracotta bring a grounded, sun-kissed depth to the look.' },
    { heading: 'Clay & Fire —\nearth meets heat',        desc: 'The warmth of fired clay meets the intensity of open flame in this rich palette.' },
    { heading: 'Rust Bloom —\norganic color story',      desc: 'Blooming rust and warm brown-reds create an organic, almost botanical palette.' },
    { heading: 'Terracotta Sun —\nbaked warmth',         desc: 'Sun-dried clay tones that recall warm afternoons and open landscape vistas.' },
    { heading: 'Earth & Edge —\nbold nature-inspired',   desc: 'Deep terracotta shades with a modern edge — nature-inspired, city-worn.' },
    { heading: 'Fired Clay —\nrich and grounded',        desc: 'A warm, richly pigmented palette with the depth of kiln-fired ceramics.' },
    { heading: 'Warm Rust —\ndrawn from the earth',      desc: 'Rust hues pulled straight from the ground — raw, warm, and utterly honest.' },
    { heading: 'Ochre Bloom —\nclay and warmth',         desc: 'Golden ochre meets warm clay — a sun-drenched palette full of natural life.' },
    { heading: 'Terracotta Dusk —\nlast light warmth',   desc: 'The deep terracotta of a fading sunset — rich, warm, and quietly dramatic.' },
  ]},
  pw: { label: 'Pink Wine', cards: [
    { heading: 'Pink Wine —\nfeminine & moody',          desc: 'Dusty rose meets deep wine for a romantic palette that lingers.' },
    { heading: 'Rosé Flush —\nwarm and hazy',            desc: 'A soft rosé-tinted flush that blurs the line between bare skin and blush.' },
    { heading: 'Berry Lip —\nbold femininity',           desc: 'Ripe berry tones layered into a look that is lush, full, and deeply feminine.' },
    { heading: 'Wine Rose —\nintimate and warm',         desc: 'The warmth of wine and the softness of rose petals — a deeply intimate palette.' },
    { heading: 'Dusty Pink —\nquiet romance',            desc: 'A muted, dusty pink that leans romantic without being saccharine or loud.' },
    { heading: 'Blush Wine —\nserene and deep',          desc: 'Soft blush bleeding into deep wine — a palette of layered, slow-building emotion.' },
    { heading: 'Pink Dusk —\nfading light softness',     desc: 'The soft pink of fading dusk — warm, gentle, and quietly melancholic.' },
    { heading: 'Mauve Touch —\nrefined softness',        desc: 'A mauve-leaning pink that reads refined and polished without trying too hard.' },
    { heading: 'Rose Stain —\nbloomed and worn',         desc: 'A lived-in rose stain — as if the color has been there all day and only deepened.' },
  ]},
  ap: { label: 'Ash & Pearl', cards: [
    { heading: 'Ash & Pearl —\ncool sophistication',     desc: 'Silvery ash and pale pearl tones keep this look refined and quietly luminous.' },
    { heading: 'Silver Ash —\ncool and precise',         desc: 'Cool ash grays and silver undertones that read effortlessly minimal and precise.' },
    { heading: 'Pearl Light —\nluminous and pure',       desc: 'Pearl-white luminosity that catches and scatters light in the softest possible way.' },
    { heading: 'Ash Cloud —\ndiffused and serene',       desc: 'Soft ash tones spread like light through cloud — cool, even, and serene.' },
    { heading: 'Smoke Pearl —\nmysterious shimmer',      desc: 'Smoky ash meets pearlescent shimmer for a look that is cool yet magnetic.' },
    { heading: 'Cool Glow —\nicy luminance',             desc: 'An icy, cool-toned glow that sits close to the skin and reads effortlessly fresh.' },
    { heading: 'Pale Ash —\nquietly elegant',            desc: 'Whisper-pale ash tones that add depth without weight — light, elegant, refined.' },
    { heading: 'Opal Tone —\nshifting light',            desc: 'Opal-inspired hues that shift between pearl and ash depending on the light.' },
    { heading: 'Silver Veil —\nsheer and cool',          desc: 'A sheer silver veil cast over cool skin tones — minimal, crisp, and composed.' },
  ]},
  tp: { label: 'Taupe', cards: [
    { heading: 'Taupe —\ntimeless neutrals',             desc: 'Greige and warm brown tones offer a versatile base for any mood.' },
    { heading: 'Greige Edit —\nmodernly neutral',        desc: 'Greige — the perfect grey-beige hybrid — grounds any look with modern restraint.' },
    { heading: 'Nude Taupe —\nwarm and effortless',      desc: 'Warm taupe nudes that complement every skin tone without effort or overthinking.' },
    { heading: 'Taupe Layer —\ndepth without drama',     desc: 'Layered taupe shades that build depth quietly — no drama, all substance.' },
    { heading: 'Brown Nude —\nsoft and wearable',        desc: 'A soft brown nude palette that works morning to night without missing a beat.' },
    { heading: 'Stone Taupe —\nsolid and grounded',      desc: 'Stony, solid taupe that anchors the face and provides a reliable, polished base.' },
    { heading: 'Warm Greige —\neasy sophistication',     desc: 'A warm, lived-in greige that translates sophistication into something approachable.' },
    { heading: 'Taupe Smoke —\ndimmed and refined',      desc: 'A slightly smoky taupe that adds a refined edge to an otherwise neutral palette.' },
    { heading: 'Nude Ground —\nessential taupe',         desc: 'The most essential taupe — stripped of all excess, leaving only what matters.' },
  ]},
  nr: { label: 'Natural Rust', cards: [
    { heading: 'Natural Rust —\nwarm & raw',             desc: 'Burnt sienna and rust hues add an organic warmth that feels untamed.' },
    { heading: 'Rust Glow —\nfiery and natural',         desc: 'A fiery rust glow that catches like embers — warm, wild, and entirely natural.' },
    { heading: 'Burnt Orange —\nraw energy',             desc: 'Burnt orange tones that radiate raw, kinetic energy and sun-soaked warmth.' },
    { heading: 'Iron Rust —\naged and authentic',        desc: 'The color of aged iron and autumn leaves — authentic, textured, and honest.' },
    { heading: 'Sienna Skin —\nearth-toned warmth',      desc: 'Burnt sienna blends with skin for an earthy warmth that reads naturally gorgeous.' },
    { heading: 'Rust & Gold —\nwarm contrast',           desc: 'Rust meets warm gold in a palette of rich contrast and sun-weathered beauty.' },
    { heading: 'Wild Rust —\nunfiltered warmth',         desc: 'Unfiltered, unpolished rust tones that feel as natural as the earth they come from.' },
    { heading: 'Ember Tone —\nheat from within',         desc: 'Deep ember oranges and rusts that look like warmth radiating from within the skin.' },
    { heading: 'Rust Season —\nautumn in color',         desc: 'The falling-leaf palette of deep rust and amber — an ode to the changing season.' },
  ]},
  wr: { label: 'Wine & Rose', cards: [
    { heading: 'Wine & Rose —\ndark floral romance',     desc: 'Deep wine layered with dusty rose makes for a moody, blooming palette.' },
    { heading: 'Dark Rose —\nbloom and shadow',          desc: 'A rose that has been left in low light — deeper, richer, more dramatic than expected.' },
    { heading: 'Plum Rose —\njewel-toned florals',       desc: 'Jewel-toned plum and rose combine into a palette as rich as a vintage garden.' },
    { heading: 'Wine Blush —\nfermented softness',       desc: 'The blushing warmth of deep wine — a palette of fermented, layered femininity.' },
    { heading: 'Midnight Rose —\nsensual darkness',      desc: 'Rose tones pulled into midnight — sensual, shadowed, and deeply alluring.' },
    { heading: 'Rose Wine —\nsweet and moody',           desc: 'Sweetness and moodiness in equal parts — the most wearable kind of drama.' },
    { heading: 'Deep Petal —\nfloating and full',        desc: 'Full, heavy petals in dark rose and wine — lush, saturated, and romantic.' },
    { heading: 'Velvet Rose —\nsoft luxury',             desc: 'A velvet-textured rose palette that feels luxurious and impossibly soft.' },
    { heading: 'Wine Bloom —\ndark and romantic',        desc: 'Blooming shades of dark wine and rose — romantic, deep, and timeless.' },
  ]},
  b: { label: 'Blue', cards: [
    { heading: 'Blue —\ncalm & composed',                  desc: 'A palette of deep navy and soft slate — cool tones that settle into the skin with quiet authority.' },
    { heading: 'Navy —\nthe classic depth',                 desc: 'Saturated navy pulled from shadow and sea — a foundational blue that builds gravitas without effort.' },
    { heading: 'Steel Blue —\nmodern cool',                 desc: 'Pale steel and cool grey-blue tones that sit close to the skin — minimal, precise, and refined.' },
    { heading: 'Midnight —\ndark and still',                desc: 'Near-black blues extracted from the deepest part of the image — dense, still, and commanding.' },
    { heading: 'Ocean —\nwaves of depth',                   desc: 'Layered blues from horizon to depth — a palette that shifts from bright aqua to dark teal as the look deepens.' },
    { heading: 'Slate —\nmuted and refined',                desc: 'Dusty blue-greys drawn from the cooler edges of the frame — understated tones with a polished finish.' },
    { heading: 'Indigo —\nrich and moody',                  desc: 'Blue pushed toward violet — a pigment-rich indigo palette that reads complex and deeply saturated.' },
    { heading: 'Denim —\ncasual and cool',                  desc: 'Washed-out, faded blues with warm undertones — a palette as lived-in and comfortable as raw denim.' },
    { heading: 'Cobalt —\nbold and vivid',                  desc: 'Pure, high-chroma blue at its most electric — a palette extracted from the brightest zones of the image.' },
  ]},
  r: { label: 'Red', cards: [
    { heading: 'Red —\npure & unapologetic',             desc: 'A vivid, saturated red with nothing to hide — intense, iconic, bold.' },
    { heading: 'True Red —\nthe original statement',     desc: 'The original power color. True red needs no explanation and takes no prisoners.' },
    { heading: 'Electric Red —\nhigh voltage beauty',    desc: 'High-voltage red that charges the room with energy before you even speak.' },
    { heading: 'Lipstick Red —\nclassically bold',       desc: 'The red of classic lipstick — iconic, timeless, and completely unforgettable.' },
    { heading: 'Signal Red —\nstop everything',          desc: 'A signal-red that stops traffic and demands every eye in the room.' },
    { heading: 'Fire Red —\nburning bright',             desc: 'Burning, blazing, utterly alive. This red is heat made visible on the skin.' },
    { heading: 'Poppy Red —\nbright and alive',          desc: 'The bright, living red of poppies in bloom — optimistic, vivid, unfaded.' },
    { heading: 'Cherry Red —\nplayful power',            desc: 'A cherry-bright red that balances playfulness with the full force of color.' },
    { heading: 'Scarlet —\nthe classic power red',       desc: 'Scarlet has been the color of power since the beginning. Nothing has changed.' },
  ]},
  p: { label: 'Pink', cards: [
    { heading: 'Pink —\nsoft & playful',                desc: 'Blush tones and candy pinks come together in a look that is light and effortless.' },
    { heading: 'Baby Pink —\ngentle and sweet',         desc: 'Soft, powdery pink that keeps the look airy, innocent, and quietly charming.' },
    { heading: 'Bubblegum —\nbold sweetness',           desc: 'A vivid, saturated pink that is bright, fun, and completely unapologetic.' },
    { heading: 'Rose Petal —\ndelicate bloom',          desc: 'Fresh rose petal tones that bring a natural flush and effortless femininity.' },
    { heading: 'Candy Pink —\nplayful energy',          desc: 'Sweet, electric candy pink that radiates joy and youthful confidence.' },
    { heading: 'Flamingo —\nbold and warm',             desc: 'A warm, vivid pink inspired by flamingos — striking, tropical, and full of life.' },
    { heading: 'Dusty Rose —\nmuted romance',           desc: 'A softened, muted rose that leans romantic and refined without trying too hard.' },
    { heading: 'Hot Pink —\nmaximum impact',            desc: 'Bright, fearless, and fully committed — hot pink that demands attention.' },
    { heading: 'Soft Blush —\nbare and luminous',       desc: 'A barely-there blush that enhances skin naturally, glowing from within.' },
  ]},
  j: { label: 'Jade', cards: [
    { heading: 'Jade —\nmystery in deep red',            desc: 'Dark garnet and raspberry tones give this look a cool, jewel-like allure.' },
    { heading: 'Garnet Tone —\nprecious and deep',       desc: 'Deep garnet — a gemstone color that adds precious, jewel-like intensity to the look.' },
    { heading: 'Dark Berry —\nrich and indulgent',       desc: 'Indulgent dark berry tones that feel like autumn fruit and luxury in one breath.' },
    { heading: 'Ruby Shade —\ngemstone depth',           desc: 'The depth of a cut ruby — many-faceted, complex, and stunning under any light.' },
    { heading: 'Plum Dark —\ndeep and magnetic',         desc: 'A deep, magnetic plum that pulls the gaze in and holds it there effortlessly.' },
    { heading: 'Raspberry —\nbold berry energy',         desc: 'Raspberry tones that combine the energy of red with the depth of berry — vivid and alive.' },
    { heading: 'Jewel Red —\nprecious intensity',        desc: 'A jewel-toned red that catches the light like a carefully set precious stone.' },
    { heading: 'Cranberry —\ntart and refined',          desc: 'The tart, refined shade of cranberry — sharp enough to be interesting, deep enough to last.' },
    { heading: 'Dark Jade —\ncool mystique',             desc: 'A cool, shadowed red-to-garnet palette that carries an air of composed mystique.' },
  ]},
  g: { label: 'Green', cards: [
    { heading: 'Forest Green —\nnature\'s depth',        desc: 'Deep forest tones drawn from leaf and bark — grounded, organic, and endlessly calm.' },
    { heading: 'Sage —\nsoft and earthy',                desc: 'Muted sage green with grey undertones — a quiet, refined palette for understated beauty.' },
    { heading: 'Moss Green —\ntextured & raw',           desc: 'The living texture of forest moss — dense, damp, and rich with natural color.' },
    { heading: 'Olive Depth —\nwarm and grounded',       desc: 'Warm olive tones with earthy undertones that anchor any look with natural confidence.' },
    { heading: 'Hunter Green —\nbold & composed',        desc: 'A classic hunter green — deep, decisive, and quietly commanding in every setting.' },
    { heading: 'Fern —\nfresh and alive',                desc: 'The vivid, living green of young ferns — bright, energetic, and full of growth.' },
    { heading: 'Juniper —\ncool and still',              desc: 'Cool juniper tones that carry the stillness of pine forests and winter mornings.' },
    { heading: 'Eucalyptus —\nsoft muted calm',          desc: 'Dusty eucalyptus greens that are soft, cool, and effortlessly sophisticated.' },
    { heading: 'Deep Verdant —\nlush and rich',          desc: 'A lush, saturated verdant green that speaks of abundance, vitality, and raw beauty.' },
  ]},
}

function toHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function extractPalette(imgSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const S = 60
      const canvas = document.createElement('canvas')
      canvas.width = S; canvas.height = S
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, S, S)
      const { data } = ctx.getImageData(0, 0, S, S)
      const zones = [
        { x: 0,  y: 0,  w: 20, h: 20 },
        { x: 40, y: 0,  w: 20, h: 20 },
        { x: 20, y: 20, w: 20, h: 20 },
        { x: 0,  y: 40, w: 20, h: 20 },
        { x: 40, y: 40, w: 20, h: 20 },
      ]
      const colors = zones.map(({ x, y, w, h }) => {
        let r = 0, g = 0, b = 0, count = 0
        for (let py = y; py < y + h; py++) {
          for (let px = x; px < x + w; px++) {
            const i = (py * S + px) * 4
            const pr = data[i], pg = data[i + 1], pb = data[i + 2]
            if (pr > 90 && pr > pg * 1.4 && pr > pb * 1.4) {
              r += pr; g += pg; b += pb; count++
            }
          }
        }
        return count > 0
          ? toHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
          : '#8b1a1a'
      })
      resolve(colors)
    }
    img.onerror = () => resolve(['#8b1a1a', '#c04040', '#d06060', '#b03030', '#a02020'])
    img.src = imgSrc
  })
}

function extractRedHex(imgSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 40
      canvas.height = 40
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 40, 40)
      const { data } = ctx.getImageData(0, 0, 40, 40)
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i], pg = data[i + 1], pb = data[i + 2]
        if (pr > 90 && pr > pg * 1.4 && pr > pb * 1.4) {
          r += pr; g += pg; b += pb; count++
        }
      }
      resolve(count > 0
        ? toHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
        : '#8b1a1a')
    }
    img.onerror = () => resolve('#8b1a1a')
    img.src = imgSrc
  })
}

// Blue pixel: B dominates, significantly above R and G
function isBluePixel(pr, pg, pb) {
  return pb > 80 && pb > pr * 1.3 && pb > pg * 1.1
}

function extractBluePalette(imgSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const S = 60
      const canvas = document.createElement('canvas')
      canvas.width = S; canvas.height = S
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, S, S)
      const { data } = ctx.getImageData(0, 0, S, S)
      const zones = [
        { x: 0,  y: 0,  w: 20, h: 20 },
        { x: 40, y: 0,  w: 20, h: 20 },
        { x: 20, y: 20, w: 20, h: 20 },
        { x: 0,  y: 40, w: 20, h: 20 },
        { x: 40, y: 40, w: 20, h: 20 },
      ]
      const colors = zones.map(({ x, y, w, h }) => {
        let r = 0, g = 0, b = 0, count = 0
        for (let py = y; py < y + h; py++) {
          for (let px = x; px < x + w; px++) {
            const i = (py * S + px) * 4
            const pr = data[i], pg = data[i + 1], pb = data[i + 2]
            if (isBluePixel(pr, pg, pb)) { r += pr; g += pg; b += pb; count++ }
          }
        }
        return count > 0
          ? toHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
          : '#445471'
      })
      resolve(colors)
    }
    img.onerror = () => resolve(['#15294d', '#2c3e5f', '#445471', '#5b6982', '#737f94'])
    img.src = imgSrc
  })
}

function extractBlueHex(imgSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 40; canvas.height = 40
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 40, 40)
      const { data } = ctx.getImageData(0, 0, 40, 40)
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i], pg = data[i + 1], pb = data[i + 2]
        if (isBluePixel(pr, pg, pb)) { r += pr; g += pg; b += pb; count++ }
      }
      resolve(count > 0
        ? toHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
        : '#445471')
    }
    img.onerror = () => resolve('#445471')
    img.src = imgSrc
  })
}

// Pink pixel: high R and B, lower G, R dominates or matches B
function isPinkPixel(pr, pg, pb) {
  return pr > 130 && pb > 100 && pr > pg * 1.05 && pb > pg && pr >= pb * 0.9
}

function extractPinkPalette(imgSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const S = 60
      const canvas = document.createElement('canvas')
      canvas.width = S; canvas.height = S
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, S, S)
      const { data } = ctx.getImageData(0, 0, S, S)
      const zones = [
        { x: 0,  y: 0,  w: 20, h: 20 },
        { x: 40, y: 0,  w: 20, h: 20 },
        { x: 20, y: 20, w: 20, h: 20 },
        { x: 0,  y: 40, w: 20, h: 20 },
        { x: 40, y: 40, w: 20, h: 20 },
      ]
      const colors = zones.map(({ x, y, w, h }) => {
        let r = 0, g = 0, b = 0, count = 0
        for (let py = y; py < y + h; py++) {
          for (let px = x; px < x + w; px++) {
            const i = (py * S + px) * 4
            const pr = data[i], pg = data[i + 1], pb = data[i + 2]
            if (isPinkPixel(pr, pg, pb)) { r += pr; g += pg; b += pb; count++ }
          }
        }
        return count > 0
          ? toHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
          : '#f4c6cf'
      })
      resolve(colors)
    }
    img.onerror = () => resolve(['#feeff5', '#e5d7dd', '#f4c6cf', '#cbbfc4', '#b2a7ac'])
    img.src = imgSrc
  })
}

function extractPinkHex(imgSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 40; canvas.height = 40
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 40, 40)
      const { data } = ctx.getImageData(0, 0, 40, 40)
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i], pg = data[i + 1], pb = data[i + 2]
        if (isPinkPixel(pr, pg, pb)) { r += pr; g += pg; b += pb; count++ }
      }
      resolve(count > 0
        ? toHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
        : '#d4687a')
    }
    img.onerror = () => resolve('#d4687a')
    img.src = imgSrc
  })
}

function isGreenPixel(pr, pg, pb) {
  return pg > 60 && pg > pr * 1.2 && pg > pb * 1.1
}

function extractGreenPalette(imgSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const S = 60
      const canvas = document.createElement('canvas')
      canvas.width = S; canvas.height = S
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, S, S)
      const { data } = ctx.getImageData(0, 0, S, S)
      const zones = [
        { x: 0,  y: 0,  w: 20, h: 20 },
        { x: 40, y: 0,  w: 20, h: 20 },
        { x: 20, y: 20, w: 20, h: 20 },
        { x: 0,  y: 40, w: 20, h: 20 },
        { x: 40, y: 40, w: 20, h: 20 },
      ]
      const colors = zones.map(({ x, y, w, h }) => {
        let r = 0, g = 0, b = 0, count = 0
        for (let py = y; py < y + h; py++) {
          for (let px = x; px < x + w; px++) {
            const i = (py * S + px) * 4
            const pr = data[i], pg = data[i + 1], pb = data[i + 2]
            if (isGreenPixel(pr, pg, pb)) { r += pr; g += pg; b += pb; count++ }
          }
        }
        return count > 0
          ? toHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
          : '#495750'
      })
      resolve(colors)
    }
    img.onerror = () => resolve(['#35443d', '#495750', '#5d6964', '#727c77', '#868f8b'])
    img.src = imgSrc
  })
}

function extractGreenHex(imgSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 40; canvas.height = 40
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 40, 40)
      const { data } = ctx.getImageData(0, 0, 40, 40)
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i], pg = data[i + 1], pb = data[i + 2]
        if (isGreenPixel(pr, pg, pb)) { r += pr; g += pg; b += pb; count++ }
      }
      resolve(count > 0
        ? toHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
        : '#35443d')
    }
    img.onerror = () => resolve('#35443d')
    img.src = imgSrc
  })
}

export default function LookPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const { searchResult } = useSearch()
  const isPink  = searchResult?.colorFamily === 'pink'
  const isBlue  = searchResult?.colorFamily === 'blue'
  const isGreen = searchResult?.colorFamily === 'green'
  const { imgSrc, batch, cardIndex } = state || {}
  const meta = BATCH_META[batch] || BATCH_META.next
  const cardMeta = meta.cards[cardIndex ?? 0] || meta.cards[0]
  const [thumbColor, setThumbColor] = useState('#8b1a1a')
  const [palette, setPalette] = useState([])
  const [overlayFading, setOverlayFading] = useState(false)
  const [overlayGone, setOverlayGone] = useState(false)
  const [contentReady, setContentReady] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => { setOverlayFading(true); setContentReady(true) }, 1700)
    const t2 = setTimeout(() => setOverlayGone(true), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (!imgSrc) navigate('/explore', { replace: true })
    else if (isPink) {
      extractPinkHex(imgSrc).then(setThumbColor)
      extractPinkPalette(imgSrc).then(setPalette)
    } else if (isBlue) {
      extractBlueHex(imgSrc).then(setThumbColor)
      extractBluePalette(imgSrc).then(setPalette)
    } else if (isGreen) {
      extractGreenHex(imgSrc).then(setThumbColor)
      extractGreenPalette(imgSrc).then(setPalette)
    } else {
      extractRedHex(imgSrc).then(setThumbColor)
      extractPalette(imgSrc).then(setPalette)
    }
  }, [imgSrc, navigate, isPink, isBlue, isGreen])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') navigate('/explore', { state: { resumeBatch: batch } }) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navigate])

  if (!imgSrc) return null

  return (
    <>
    {!overlayGone && <SearchLoader fading={overlayFading} />}
    <div className={`look-page${isPink ? ' look-page--pink' : isBlue ? ' look-page--blue' : isGreen ? ' look-page--green' : ''}${contentReady ? ' look-page--revealed' : ' look-page--hidden'}`}>

      {/* ── Left panel — image + card ── */}
      <div className="look-left">

        <div className="look-img-container">
          <div className="look-img-frame">
            <img src={imgSrc} alt="" className="look-img" style={isGreen && cardIndex === 6 ? { objectPosition: 'center 90%' } : undefined} />
          </div>

          <div className="look-card-wrap">
            <div className="look-card">
              <span className="look-card-brand">KEROCOLOR</span>
              <div className="look-card-thumb">
                <img
                  src={kImg}
                  alt=""
                  style={
                    isPink  ? { filter: 'hue-rotate(336deg) saturate(0.55)' } :
                    isBlue  ? { filter: 'hue-rotate(213deg) saturate(0.5) brightness(0.6)' } :
                    isGreen ? { filter: 'hue-rotate(130deg) saturate(0.4) brightness(0.55)' } :
                    undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Right panel ── */}
      <div className="look-right">
        <div className="look-right-panel">
<div className="look-right-content">
            {palette.length > 0 && (
              <div className="look-palette">
                {palette.map((color, i) => (
                  <div key={i} className="look-palette-dot" style={{ background: color }} />
                ))}
              </div>
            )}
            <h2 className="look-right-heading">{cardMeta.heading}</h2>
            <p className="look-right-desc">{cardMeta.desc}</p>
            <div className="look-right-buttons">
              <button className="look-btn look-btn--outline">
                Save Color Palette
                <span className="look-btn-icon look-btn-icon--circle look-btn-icon--heart">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </span>
              </button>
              <button className="look-btn look-btn--filled" onClick={() => navigate('/explore', { state: { resumeBatch: batch } })}>
                Back to Gallery
                <span className="look-btn-icon look-btn-icon--circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                    <path d="M7 7h10v10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
    </>
  )
}
