import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // This allows external connections
    port: 5173,
    hmr: {
      host: '0.0.0.0',
      clientPort: 5173,
      allowedHosts: 'all'
    }
  }
})
