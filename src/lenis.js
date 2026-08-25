// Singleton accessor for the site's one Lenis instance (created by
// LenisProvider, mounted once in App.jsx). Anything else that needs to
// trigger a smooth scroll — ScrollToHash's hash-link jumps, for
// instance — reads it from here instead of creating its own instance,
// so there's only ever one thing driving scroll smoothing on the page.
let instance = null

export function setLenis(lenis) {
  instance = lenis
}

export function getLenis() {
  return instance
}
