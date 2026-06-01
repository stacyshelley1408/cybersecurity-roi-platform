import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/roi-calculator-app/',
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../core'),
    },
  },
})
