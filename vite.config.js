import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Simpler chunk naming to avoid 404s
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          // Simplified chunk splitting
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'animation-vendor': ['framer-motion'],
          'icons-vendor': ['react-icons'],
          'charts-vendor': ['echarts', 'echarts-for-react']
        }
      }
    },
    // Ensure assets are properly handled
    assetsDir: 'assets',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'framer-motion',
      'react-icons/fi',
      'echarts',
      'echarts-for-react'
    ]
  },
  server: {
    port: 3000,
    host: true
  }
});