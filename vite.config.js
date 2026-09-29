import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site is served from the apex domain via GitHub Pages, so the base is '/'.
// CNAME is copied into dist/ by publicDir so Pages keeps the custom domain.
export default defineConfig({
  plugins: [react()],
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
