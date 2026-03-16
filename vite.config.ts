import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
  ],
  server: {
    forwardConsole: true,
  }
}) satisfies UserConfig
