import { useEffect, useRef, useState } from 'react'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// Scroll-triggered scramble/decode reveal: once scrolled into view, every
// character cycles through random glyphs before locking into its real
// character, sweeping left to right until it reaches the designated
// letter at each position — the classic "decrypting" text effect. Runs
// once per mount (IntersectionObserver disconnects after the first
// trigger) rather than replaying on every scroll back into view.
//
// Total sweep duration is fixed regardless of text length — a long
// paragraph just resolves each character faster than a short heading —
// so every instance on a page feels similarly paced rather than the
// longest text taking dramatically longer to finish.
//
// `armed` (default true) gates the actual start independently of
// intersection — pass false while e.g. a page-load overlay is still
// covering the content. Without this, an above-the-fold instance starts
// (and often finishes) its animation while still hidden behind the
// loader, so by the time the page is actually revealed it just shows
// the final text with no visible scramble at all.
//
// Renders the real text into an invisible sizing placeholder and
// absolutely-positions the live-scrambling text on top of it, so the
// box's dimensions stay pinned to the FINAL text's size the entire
// time — the scrambled glyphs (which vary in width character to
// character) never reflow surrounding layout, even mid-animation.
//
// The live-scrambling text is purely visual (aria-hidden); the wrapping
// element carries aria-label with the real text so assistive tech reads
// the actual content immediately instead of the in-progress scramble.
export default function ScrambleText({
  text,
  as: Tag = 'span',
  className,
  duration = 900,
  threshold = 0.3,
  armed = true,
}) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(text)
  const hasRunRef = useRef(false)
  const isIntersectingRef = useRef(false)
  const armedRef = useRef(armed)
  armedRef.current = armed

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frameId = null

    const runScramble = () => {
      const chars = text.split('')
      const perCharDelay = chars.length ? duration / chars.length : 0
      const start = performance.now()

      const tick = (now) => {
        const elapsed = now - start
        const revealCount = Math.min(chars.length, Math.floor(elapsed / perCharDelay))
        const next = chars
          .map((ch, i) => {
            if (ch === ' ' || ch === '\n') return ch
            if (i < revealCount) return ch
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          })
          .join('')
        setDisplay(next)
        if (revealCount < chars.length) {
          frameId = requestAnimationFrame(tick)
        } else {
          setDisplay(text)
        }
      }
      frameId = requestAnimationFrame(tick)
    }

    const maybeStart = () => {
      if (hasRunRef.current || !armedRef.current || !isIntersectingRef.current) return
      hasRunRef.current = true
      observer.disconnect()
      runScramble()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting
        maybeStart()
      },
      { threshold }
    )
    observer.observe(el)
    // Also re-check right away — covers the case where `armed` flips
    // true after the element was already intersecting the whole time.
    maybeStart()

    return () => {
      observer.disconnect()
      if (frameId) cancelAnimationFrame(frameId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, duration, threshold, armed])

  return (
    <Tag ref={ref} className={className} aria-label={text} style={{ position: 'relative', display: 'inline-block' }}>
      <span aria-hidden="true" style={{ visibility: 'hidden' }}>
        {text}
      </span>
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        {display}
      </span>
    </Tag>
  )
}
