import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'firebase/firestore',
            'firebase/app'
          ],
          components: [
            './src/components/Main.tsx',
            './src/components/Information.tsx',
            './src/components/NotFound.tsx'
          ]
        }
      }
    }
  }
})
