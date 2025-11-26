// Vite config - using dynamic import to avoid requiring vite at config load time
import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
const config: UserConfig = {
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
}

export default config

