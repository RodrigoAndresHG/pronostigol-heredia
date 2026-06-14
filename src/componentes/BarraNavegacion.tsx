import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import ToggleSonido from './ToggleSonido';

/**
 * Barra de navegación editorial. Sticky, fondo midnight con blur.
 * Marca a la izquierda (wordmark serif), enlaces a la derecha.
 *
 * Responsive:
 *   - Pantallas grandes (lg+): los 6 enlaces inline en mono.
 *   - Móvil/tablet (<lg): wordmark + toggle + botón hamburguesa. Los enlaces
 *     viven en un panel desplegable. Con 6 enlaces ya no caben inline antes
 *     de ~1024px (a 768px desbordaban), por eso el umbral es lg.
 */

const ENLACES = [
  { ruta: '/', etiqueta: 'Inicio' },
  { ruta: '/calendario', etiqueta: 'Calendario' },
  { ruta: '/mi-ranking', etiqueta: 'Mi Ranking' },
  { ruta: '/posiciones', etiqueta: 'Posiciones' },
  { ruta: '/historial', etiqueta: 'Historial' },
  { ruta: '/torneo', etiqueta: 'Torneo' },
];

function BarraNavegacion() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const reducir = useReducedMotion();
  const location = useLocation();

  // Cierra el menú al cambiar de ruta (incluido tocar un enlace).
  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-tinta-fondo/90 backdrop-blur-md border-b border-tinta-linea">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="relative flex items-center justify-center">
            <span className="absolute inline-block w-2 h-2 rounded-full bg-verde animate-pulse-señal" />
            <span className="inline-block w-2 h-2 rounded-full bg-verde" />
          </span>
          <span className="font-display font-semibold text-tinta-titulo text-lg tracking-tight">
            PronostiGol<span className="text-verde"> HeredIA</span>
          </span>
        </NavLink>

        {/* ─── Enlaces inline (solo lg+; 6 enlaces no caben antes) ── */}
        <div className="hidden lg:flex items-center gap-2">
          <nav>
            <ul className="flex gap-1 font-mono text-[13px]">
              {ENLACES.map((enlace) => (
                <li key={enlace.ruta}>
                  <NavLink
                    to={enlace.ruta}
                    end={enlace.ruta === '/'}
                    className={({ isActive }) =>
                      [
                        'inline-block px-3 py-1.5 rounded-md whitespace-nowrap transition-colors duration-200 ease-editorial',
                        isActive
                          ? 'text-verde'
                          : 'text-tinta-mute hover:text-tinta-cuerpo',
                      ].join(' ')
                    }
                  >
                    {enlace.etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <ToggleSonido />
        </div>

        {/* ─── Controles móviles (toggle + hamburguesa) ───────────── */}
        <div className="flex lg:hidden items-center gap-1 shrink-0">
          <ToggleSonido />
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-tinta-cuerpo hover:text-tinta-titulo transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {menuAbierto ? (
                <>
                  <path d="m6 6 12 12" />
                  <path d="m18 6-12 12" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Panel desplegable móvil ──────────────────────────────── */}
      <AnimatePresence>
        {menuAbierto && (
          <motion.nav
            id="menu-movil"
            className="lg:hidden border-t border-tinta-linea bg-tinta-fondo/95 backdrop-blur-md overflow-hidden"
            initial={reducir ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reducir ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reducir ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
          >
            <ul className="max-w-6xl mx-auto px-5 py-2 flex flex-col font-mono text-[15px]">
              {ENLACES.map((enlace) => (
                <li key={enlace.ruta}>
                  <NavLink
                    to={enlace.ruta}
                    end={enlace.ruta === '/'}
                    className={({ isActive }) =>
                      [
                        'block px-3 py-3 rounded-md transition-colors duration-200 ease-editorial',
                        isActive
                          ? 'text-verde'
                          : 'text-tinta-cuerpo hover:text-tinta-titulo',
                      ].join(' ')
                    }
                  >
                    {enlace.etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export default BarraNavegacion;
