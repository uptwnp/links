import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const version = process.env.npm_package_version || '1.0.1';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    exclude: [],
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Add version to asset filenames for cache busting
        assetFileNames: `assets/[name]-[hash]-v${version}.[ext]`,
        chunkFileNames: `assets/[name]-[hash]-v${version}.js`,
        entryFileNames: `assets/[name]-[hash]-v${version}.js`,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
});
