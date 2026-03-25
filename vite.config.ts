import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/space-villian-3k',
  plugins: [],
  server: {
    forwardConsole: true,
  }
}) satisfies UserConfig
