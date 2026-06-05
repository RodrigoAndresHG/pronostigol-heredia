import { NavLink } from 'react-router-dom';

/**
 * Barra de navegación principal.
 *
 * Sticky en top. Marca a la izquierda con icono de pelota,
 * enlaces a la derecha como chips. Estado activo destacado.
 */
function BarraNavegacion() {
  const enlaces = [
    { ruta: '/', etiqueta: 'Inicio' },
    { ruta: '/calendario', etiqueta: 'Calendario' },
    { ruta: '/historial', etiqueta: 'Historial' },
    { ruta: '/torneo', etiqueta: 'El torneo' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-marca-grisLinea">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 group">
          <span className="relative inline-flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-marca-primario/20 animate-pulse-suave" />
            <span className="relative inline-block w-3.5 h-3.5 rounded-full bg-marca-primario" />
          </span>
          <span className="font-display font-bold text-marca-tinta text-lg">
            PronostiGol{' '}
            <span className="text-marca-primario">HeredIA</span>
          </span>
        </NavLink>
      </div>

      <nav className="max-w-3xl mx-auto px-4 pb-2 overflow-x-auto">
        <ul className="flex gap-1.5 text-sm">
          {enlaces.map((enlace) => (
            <li key={enlace.ruta}>
              <NavLink
                to={enlace.ruta}
                end={enlace.ruta === '/'}
                className={({ isActive }) =>
                  [
                    'inline-block px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all font-medium',
                    isActive
                      ? 'bg-marca-primario text-white shadow-sm'
                      : 'text-marca-grisTexto hover:bg-marca-grisLinea/70',
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
