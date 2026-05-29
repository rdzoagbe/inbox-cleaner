import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use sub-path only for GitHub Pages; Vercel and local dev serve from root
const base = process.env.GITHUB_PAGES === 'true' ? '/inbox-cleaner/' : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
