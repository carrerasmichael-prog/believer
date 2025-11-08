import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import config from 'config';

export default defineConfig({
  base: './',
  publicDir: 'public',  // ← THIS LINE FIXES IT
  plugins: [
    nodePolyfills(),
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
        enabled: true,
        type: 'module',
      },
    } as VitePWAOptions),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
build: {
  reportCompressedSize: true,
  chunkSizeWarningLimit: 2000,
  rollupOptions: {
    input: {
      main: 'index.html',
      debug: 'debug.html',
    },
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
  copyPublicDir: true,
},
  define: {
    CONFIG: config,
    global: {},
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
  },
  server: {
    hmr: {
      overlay: true,
      port: 5173,
    },
    proxy: {
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
});
