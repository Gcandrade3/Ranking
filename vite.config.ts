import path from 'node:path'
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
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Reconluz Premia',
        short_name: 'Premia',
        description: 'Programa de pontos e ranking da equipe comercial Reconluz',
        lang: 'pt-BR',
        theme_color: '#f2af2d',
        background_color: '#fffdf9',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Nunca cachear chamadas à API do Supabase — só os assets estáticos do app.
        navigateFallbackDenylist: [/^\/rest\//, /^\/auth\//, /^\/storage\//, /^\/realtime\//],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
