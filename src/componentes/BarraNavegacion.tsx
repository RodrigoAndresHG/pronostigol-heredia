import { NavLink } from 'react-router-dom';
import ToggleSonido from './ToggleSonido';

/**
 * Barra de navegación editorial. Sticky, fondo midnight con blur.
 * Marca a la izquierda (wordmark serif), enlaces a la derecha en mono.
 */
function BarraNavegacion() {
  const enlaces = [
    { ruta: '/', etiqueta: 'Inicio' },
    { ruta: '/calendario', etiqueta: 'Calendario' },
    { ruta: '/historial', etiqueta: 'Historial' },
    { ruta: '/torneo', etiqueta: 'Torneo' },
  ];

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

        {/* Enlaces */}
        <div className="flex items-center gap-2">
          <nav className="overflow-x-auto">
            <ul className="flex gap-1 font-mono text-[13px]">
              {enlaces.map((enlace) => (
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
      </div>
    </header>
  );
}

export default BarraNavegacion;
