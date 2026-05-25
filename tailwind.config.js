/**
 * Configuración de Tailwind para PronostiGol HeredIA.
 * - La paleta de marca usa verde-cancha + ámbar para diferenciarse
 *   del azul del LMS Centro Builder.
 * - Si más adelante quieres ajustar la marca, sólo cambias los
 *   hex de la sección `marca`.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marca: {
          primario: '#0D9488',       // teal-600 · "verde cancha"
          primarioOscuro: '#0F766E', // teal-700 · hover/borders
          primarioClaro: '#14B8A6',  // teal-500 · acentos suaves
          acento: '#F59E0B',         // amber-500 · ámbar Mundial
          acentoClaro: '#FCD34D',    // amber-300
          tinta: '#0A0A0F',          // casi negro · titulares
          grisFondo: '#F8FAFC',      // slate-50 · fondo de página
          grisLinea: '#E2E8F0',      // slate-200 · separadores
          grisTexto: '#475569',      // slate-600 · cuerpo de texto
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
