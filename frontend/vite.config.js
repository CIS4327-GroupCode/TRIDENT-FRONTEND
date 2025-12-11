import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://trident-backend-phi.vercel.app',
        changeOrigin: true
      }
    }
  },
  build: {
    // Optimize build for production
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'bootstrap': ['bootstrap']
        }
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __VITE_API_URL__: JSON.stringify(process.env.VITE_API_URL || 'https://trident-backend-phi.vercel.app'),
    __VITE_APP_NAME__: JSON.stringify(process.env.VITE_APP_NAME || 'TRIDENT Match Portal')
  }
})
