import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { writeFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'meta-json',
      closeBundle() {
        const meta = {
          version: process.env.npm_package_version || '0.0.0',
          buildTime: new Date().toISOString(),
          buildHash: Date.now().toString(36),
        }
        writeFileSync(
          join(process.cwd(), 'dist', 'meta.json'),
          JSON.stringify(meta, null, 2)
        )
      },
    },
  ],
  base: '/DentMetric/',
})
