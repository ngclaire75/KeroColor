import { useEffect, useState } from 'react'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const STEP_MS = 45 // one scramble tick
const STEPS_PER_LETTER = 3 // how many ticks before each letter locks in

// Classic "decode" reveal: every letter scrambles through random
// characters, then locks into its real value one after another, left to
// right — not all landing at once. Renders as inert placeholder spaces
// (not scrambling) until `active` flips true, and resets back to that
// whenever `active` goes false again, so it's ready to replay.
export default function ScrambleText({ text, active, delay = 0 }) {
  const [display, setDisplay] = useState(text.replace(/\S/g, ' '))

  useEffect(() => {
    if (!active) {
      setDisplay(text.replace(/\S/g, ' '))
      return
    }
    const letters = text.split('')
    const revealAt = letters.map((c, i) => (c === ' ' ? 0 : (i + 1) * STEPS_PER_LETTER + Math.floor(Math.random() * 2)))
    const maxFrame = Math.max(...revealAt)
    let frame = 0
    let intervalId

    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        frame++
        setDisplay(
          letters
            .map((c, i) => {
              if (c === ' ') return ' '
              if (frame >= revealAt[i]) return c
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
            })
            .join('')
        )
        if (frame >= maxFrame) clearInterval(intervalId)
      }, STEP_MS)
    }, delay)

    return () => {
      clearTimeout(startTimeout)
      clearInterval(intervalId)
    }
  }, [text, active, delay])

  return display
}
