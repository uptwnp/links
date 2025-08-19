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
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        // Add version to asset filenames for cache busting
        assetFileNames: `assets/[name]-[hash]-v${version}.[ext]`,
        chunkFileNames: `assets/[name]-[hash]-v${version}.js`,
        entryFileNames: `assets/[name]-[hash]-v${version}.js`,
      },
    },
  },
});
