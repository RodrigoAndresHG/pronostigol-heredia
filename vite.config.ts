import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Configuración de Vite.
 *
 * - Plugin de React: HMR + JSX automático.
 * - Plugin PWA: genera el service worker y el manifest desde aquí mismo
 *   para que la app sea instalable en pantalla de inicio (iOS y Android).
 *
 * Si más adelante quieres cambiar el ícono, edita los archivos en
 * /public/iconos y los nombres en `manifest.icons`.
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PronostiGol HeredIA',
        short_name: 'PronostiGol',
        description:
          'Predicciones del Mundial 2026 con consenso de 3 IAs y señales de valor vs mercado. Por HeredIA.',
        theme_color: '#0D9488',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es-EC',
        start_url: '/',
        icons: [
          {
            src: '/iconos/icono-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/iconos/icono-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/iconos/icono-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
