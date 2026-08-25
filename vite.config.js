import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
