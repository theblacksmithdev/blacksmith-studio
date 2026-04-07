import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  root: 'client',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  base: './',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },
  server: {
    port: 3940,
  },
})
