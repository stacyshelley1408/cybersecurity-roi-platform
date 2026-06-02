import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/sales-builder/',
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../core'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
