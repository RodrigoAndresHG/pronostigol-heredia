import { NavLink } from 'react-router-dom';

/**
 * Barra de navegación principal.
 *
 * Mobile-first: en pantallas pequeñas se muestra como una franja
 * horizontal scrolleable; en escritorio queda centrada.
 * El estado activo de cada enlace usa `NavLink` de react-router,
 * que añade automáticamente la clase `active` cuando coincide la ruta.
 */
function BarraNavegacion() {
  // Definimos los enlaces en un array para evitar repetir markup.
  // Si añades una nueva pantalla, sólo agregas una entrada aquí.
  const enlaces = [
    { ruta: '/', etiqueta: 'Inicio' },
    { ruta: '/calendario', etiqueta: 'Calendario' },
    { ruta: '/historial', etiqueta: 'Historial' },
    { ruta: '/torneo', etiqueta: 'El torneo' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-marca-grisLinea">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Marca: punto de color + nombre. Pequeño y siempre presente. */}
        <NavLink to="/" className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-marca-primario" />
          <span className="font-display font-semibold text-marca-tinta">
            PronostiGol <span className="text-marca-primario">HeredIA</span>
          </span>
        </NavLink>
      </div>

      <nav className="max-w-3xl mx-auto px-4 pb-2 overflow-x-auto">
        <ul className="flex gap-1 text-sm">
          {enlaces.map((enlace) => (
            <li key={enlace.ruta}>
              <NavLink
                to={enlace.ruta}
                end={enlace.ruta === '/'}
                className={({ isActive }) =>
                  [
                    'inline-block px-3 py-1.5 rounded-full whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-marca-primario text-white'
                      : 'text-marca-grisTexto hover:bg-marca-grisLinea',
                  ].join(' ')
                }
              >
                {enlace.etiqueta}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default BarraNavegacion;
