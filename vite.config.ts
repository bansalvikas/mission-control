import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        id: '/hoogle/',
        name: 'Hoogle — Google for my home',
        short_name: 'Hoogle',
        description:
          'Natural-language assistant that remembers where you put physical items at home.',
        start_url: '/hoogle/chat',
        scope: '/hoogle/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0a0a0f',
        theme_color: '#0a0a0f',
        icons: [
          {
            src: '/hoogle/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/hoogle/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/hoogle/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__\/auth/, /^\/firebase/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/[^/]+\.cloudfunctions\.net\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
