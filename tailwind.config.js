/**
 * Configuración de Tailwind para PronostiGol HeredIA — v2 editorial.
 *
 * Dirección: "broadcast deportivo nocturno con alma editorial".
 * Dark-first, sin toggle. Tres familias tipográficas (Fraunces serif para
 * display, Inter para UI/cuerpo, JetBrains Mono para datos). Un solo
 * acento protagonista (verde-pasto), cyan sólo para señal.
 *
 * Si quieres ajustar la identidad, todo vive en `colors.tinta` y las
 * familias de `fontFamily`. No hay gradientes multicolor a propósito.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sistema editorial oscuro. "tinta" = la marca cromática completa.
        tinta: {
          fondo: '#0A1628',      // midnight pitch — fondo global
          tarjeta: '#111E33',    // surface — cards de partido
          elevado: '#1A2942',    // cards destacadas, modals
          titulo: '#F8FAFC',     // H1-H3, números grandes
          cuerpo: '#CBD5E1',     // párrafos
          mute: '#64748B',       // metadata, captions
          linea: '#1E2D47',      // borders default
          lineaFuerte: '#2A3C5C',// borders hover, separadores
        },
        // Acentos. Verde protagonista; cyan sólo señal.
        verde: {
          DEFAULT: '#00D27A',    // primario marca, probabilidad ganadora, CTAs
          hover: '#00B868',
        },
        cyan: {
          DEFAULT: '#38BDF8',    // señal: live, hover, segundo dato de gráficos
        },
        // Semánticos — exclusivamente para estado, nunca decoración.
        alerta: '#F5B700',       // warning, deadline, upset
        peligro: '#EF4444',      // error, predicción fallida
        // Acentos culturales sutiles por país anfitrión (overlays 6-8%).
        pais: {
          mexico: '#00D27A',
          usa: '#38BDF8',
          canada: '#F5B700',
        },
      },
      fontFamily: {
        // Display: serif variable de revista. TODO titular grande.
        display: ['"Fraunces"', 'Georgia', 'serif'],
        // UI y cuerpo: neo-grotesque.
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        // Datos: probabilidades, fechas, códigos de país, bylines IA.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        kicker: '0.16em',
      },
      maxWidth: {
        lectura: '65ch',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      animation: {
        // Revelaciones sutiles + capas del hero. Sin rebotes.
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.2, 0, 0, 1)',
        'fade-in': 'fadeIn 0.6s ease-out',
        'pulse-señal': 'pulseSenal 2s ease-in-out infinite',
        // Hero con vida (CSS puro, GPU-friendly):
        'ken-burns': 'kenBurns 40s ease-in-out infinite alternate',
        respira: 'respira 9s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
        // Cuenta regresiva:
        'flip-out': 'flipOut 0.28s cubic-bezier(0.2, 0, 0, 1) forwards',
        'flip-in': 'flipIn 0.28s cubic-bezier(0.2, 0, 0, 1)',
        latido: 'latido 0.4s cubic-bezier(0.2, 0, 0, 1)',
        // Clímax de consenso en la mesa de deliberación:
        'glow-consenso': 'glowConsenso 0.5s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSenal: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1.06) translate(0, 0)' },
          '100%': { transform: 'scale(1.12) translate(-1.5%, -1.5%)' },
        },
        respira: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.08)' },
        },
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100px)' },
        },
        flipOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
        flipIn: {
          '0%': { transform: 'translateY(60%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        latido: {
          '0%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        glowConsenso: {
          '0%': { boxShadow: '0 0 0px 0px rgba(0,210,122,0)' },
          '40%': { boxShadow: '0 0 18px 2px rgba(0,210,122,0.45)' },
          '100%': { boxShadow: '0 0 0px 0px rgba(0,210,122,0)' },
        },
      },
    },
  },
  plugins: [],
};
