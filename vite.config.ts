import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'ui': path.resolve(__dirname, './src/ui'),
      'components': path.resolve(__dirname, './src/components'),
      'modules': path.resolve(__dirname, './src/modules'),
      'pages': path.resolve(__dirname, './src/pages'),
      'utils': path.resolve(__dirname, './src/utils'),
      'store': path.resolve(__dirname, './src/store'),
      'types': path.resolve(__dirname, './src/types'),
      'assets': path.resolve(__dirname, './src/assets'),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    exclude: ['@d-i-t-a/reader'],
    include: [],
  },
  assetsInclude: ['**/*.css'],
})
