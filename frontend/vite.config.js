import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      // Safely allows Firebase Auth popup windows to talk back to your tab
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    }
  }
})
