/**
 * Configuración de Tailwind para PronostiGol HeredIA.
 *
 * Paleta extendida para el Mundial 2026:
 *   - `marca`: el sistema de marca HeredIA (teal + ámbar).
 *   - `mundial`: rojos, azules y verdes que evocan los 3 países anfitriones
 *     (México, USA, Canadá) sin copiar sus banderas literalmente. Se usan
 *     para acentos, gradientes y identidad de las mascotas.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marca: {
          primario: '#0D9488',
          primarioOscuro: '#0F766E',
          primarioClaro: '#14B8A6',
          acento: '#F59E0B',
          acentoClaro: '#FCD34D',
          tinta: '#0A0A0F',
          grisFondo: '#F8FAFC',
          grisLinea: '#E2E8F0',
          grisTexto: '#475569',
        },
        mundial: {
          // Rojo Mundial (Canadá, México)
          rojo: '#DC2626',
          rojoOscuro: '#991B1B',
          // Azul Mundial (USA)
          azul: '#2563EB',
          azulOscuro: '#1D4ED8',
          // Verde césped
          cesped: '#16A34A',
          cespedClaro: '#22C55E',
          // Crema/papel
          crema: '#FEF3C7',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // Gradiente "hero" principal — teal a tinta con un toque ámbar.
        'gradiente-hero':
          'linear-gradient(135deg, #0D9488 0%, #0A0A0F 60%, #422006 100%)',
        // Gradiente "cancha" — verdes para fondos de partido.
        'gradiente-cancha':
          'linear-gradient(180deg, #16A34A 0%, #15803D 50%, #14532D 100%)',
        // Gradiente "atardecer Mundial" — para CTA y banners.
        'gradiente-atardecer':
          'linear-gradient(135deg, #F59E0B 0%, #DC2626 50%, #7C2D12 100%)',
        // Patrón sutil de hexágonos (pelota) — se aplica como bg.
        'pelota-pattern':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpolygon points='20,2 38,12 38,28 20,38 2,28 2,12' fill='none' stroke='%230D9488' stroke-width='0.5' stroke-opacity='0.15'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-suave': 'pulseSuave 2.5s ease-in-out infinite',
        'aparecer': 'aparecer 0.6s ease-out',
        'subir': 'subir 0.5s ease-out',
        'flotar': 'flotar 3s ease-in-out infinite',
      },
      keyframes: {
        pulseSuave: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        aparecer: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subir: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flotar: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
