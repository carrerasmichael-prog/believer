// vite.config.ts
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import config from 'config';
import { Plugin } from 'vite';
import { resolve } from 'path';

// Plugin to ensure .htaccess is copied for Web2 SPA routing
const copyDotFilesPlugin = (): Plugin => ({
  name: 'copy-dot-files',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: '.htaccess',
      source: `
RewriteEngine On
RewriteBase /
# Redirect all non-file/non-directory requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
      `,
    });
  },
});

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || '/', // Dynamic base for root or subdirectory
  publicDir: 'public', // Copies public/ contents to /dist
  plugins: [
    mode === 'production' ? nodePolyfills() : null, // Apply nodePolyfills only in production
    react(),
    VitePWA({
      injectManifest: {
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        globPatterns: ['**/*'],
      },
      strategies: 'injectManifest',
      injectRegister: 'script',
      manifest: false,
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false, // Disable Psalm 150
      },
    } as VitePWAOptions),
    copyDotFilesPlugin(), // Ensure .htaccess is included in /dist
  ].filter(Boolean), // Remove null plugins
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    reportCompressedSize: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), // Single entry point
      external: [],
      onLog(level, log, handler) {
        if (log.code === 'CIRCULAR_DEPENDENCY') return;
        if (log.message.includes('node_modules/tseep') && log.message.includes('Use of eval')) return;
        handler(level, log);
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('nostr-social-graph/data/profileData.json')) {
            return 'profileData';
          }
          if (
            id.includes('utils/AnimalName') ||
            id.includes('utils/data/animals') ||
            id.includes('utils/data/adjectives')
          ) {
            return 'animalname';
          }
          const vendorLibs = [
            'react', 'react-dom/client', 'react-helmet', '@nostr-dev-kit/ndk',
            'markdown-to-jsx', '@nostr-dev-kit/ndk-cache-dexie', '@remixicon/react',
            'minidenticons', 'nostr-tools', 'nostr-social-graph', 'lodash',
            'lodash/debounce', 'lodash/throttle', 'localforage', 'dexie',
            '@noble/hashes', '@noble/curves', '@scure/base', '@scure/bip32',
            '@scure/bip39', 'classnames', 'fuse.js', 'react-string-replace',
            'tseep', 'typescript-lru-cache', 'zustand', 'blurhash',
          ];
          if (vendorLibs.some((lib) => id.includes(`node_modules/${lib}`))) {
            return 'vendor';
          }
        },
      },
    },
    assetsDir: 'assets',
    copyPublicDir: true, // Ensures public/ contents are copied
  },
  define: {
    CONFIG: config,
    global: {},
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
    'import.meta.env.VITE_BASE_PATH': JSON.stringify(process.env.VITE_BASE_PATH || '/'),
  },
  server: {
    port: 5174, // Use 5174 to avoid EADDRINUSE
    hmr: {
      overlay: true,
      port: 5174, // Match server port
    },
    proxy: {
      // Simplified proxy for API routes only
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/subscriptions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/invoices': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/.well-known': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['@vite/client', '@vite/env'],
    include: ['react', 'react-dom'],
  },
}));