import { Link } from 'react-router-dom';
import type { Partido } from '../tipos';
import { equipoPorId } from '../datos/equipos';
import { horaLocal } from '../lib/zonaHoraria';
import { prediccionPara } from '../datos/predicciones';

/**
 * Tarjeta resumen de un partido. Se usa en el listado del calendario.
 * Al tocarla, navega a la página de detalle del partido.
 */
function TarjetaPartido({ partido }: { partido: Partido }) {
  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);
  const tienePrediccion = prediccionPara(partido.id) !== null;

  return (
    <Link
      to={`/partido/${partido.id}`}
      className="block rounded-2xl border border-marca-grisLinea bg-white p-4 hover:border-marca-primario hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between text-xs text-marca-grisTexto">
        <span className="uppercase tracking-wider font-semibold">
          {partido.grupo ? `Grupo ${partido.grupo}` : partido.fase}
        </span>
        <span>{horaLocal(partido.fechaISO)}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{local.banderaEmoji}</span>
          <span className="font-display font-semibold text-marca-tinta truncate">
            {local.nombre}
          </span>
        </div>
        <span className="text-marca-grisTexto text-sm">vs</span>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="font-display font-semibold text-marca-tinta truncate text-right">
            {visitante.nombre}
          </span>
          <span className="text-2xl flex-shrink-0">{visitante.banderaEmoji}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-marca-grisTexto">
        <span className="truncate">{partido.sede}</span>
        {tienePrediccion ? (
          <span className="text-marca-primario font-semibold whitespace-nowrap ml-2">
            Predicción lista →
          </span>
        ) : (
          <span className="whitespace-nowrap ml-2">Predicción pendiente</span>
        )}
      </div>
    </Link>
  );
}

export default TarjetaPartido;
