import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/seller-tool/',
  server: { port: 5180 },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../core'),
    },
  },
})
