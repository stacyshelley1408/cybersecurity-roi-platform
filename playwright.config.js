import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  reporter: [['list']],
  use: {
    headless: false,
    viewport: { width: 1400, height: 900 },
    baseURL: 'http://localhost:5175',
  },
})
