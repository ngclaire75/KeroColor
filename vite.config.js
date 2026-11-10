import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The built stylesheet <link> normally blocks first paint until it has
// downloaded. Load it without blocking instead: the inline loading screen
// in index.html covers the page until the app (and its CSS) is ready, so
// there's nothing unstyled to see — and the loader shows straight away even
// on a slow connection.
function nonBlockingCss() {
  return {
    name: 'non-blocking-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g,
          '<link rel="preload" as="style" crossorigin href="$1" onload="this.onload=null;this.rel=\'stylesheet\'">' +
            '<noscript><link rel="stylesheet" crossorigin href="$1"></noscript>',
        )
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), nonBlockingCss()],
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 60000,
  },
  server: {
    watch: {
      // Ad-hoc verification scripts (e.g. `_foo.mjs`, `_bar.png`) get
      // written and deleted directly in the project root during
      // development — without this, each one triggers a full dev-server
      // reload, which resets any in-progress page state (most visibly,
      // any CSS animation like the Inspiration page's ticker snapping
      // back to its start every time).
      ignored: ['**/_*'],
    },
  },
})
