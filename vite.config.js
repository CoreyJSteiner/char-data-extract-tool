import { defineConfig } from 'vite'

export default defineConfig({
  base: '/5e-2024-pdf-extract',
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
})
