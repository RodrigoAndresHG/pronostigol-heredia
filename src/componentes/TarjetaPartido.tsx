import { Link } from 'react-router-dom';
import type { Partido } from '../tipos';
import { equipoPorId } from '../datos/equipos';
import { horaLocal } from '../lib/zonaHoraria';
import { EstadioMini } from './visual/Estadio';

/**
 * Tarjeta resumen de un partido. Se usa en el listado del calendario
 * y en la página de inicio. Al tocarla, navega al detalle.
 *
 * Diseño:
 *   - Cabecera con grupo + hora local + país anfitrión (bandera pequeña).
 *   - Fila central con las dos banderas grandes y nombres de equipos.
 *   - Silueta de estadio mini + sede.
 *   - Estado de la predicción (pendiente / publicada).
 */

const BANDERAS_PAIS_ANFITRION: Record<Partido['paisAnfitrion'], string> = {
  México: '🇲🇽',
  'Estados Unidos': '🇺🇸',
  Canadá: '🇨🇦',
};

function TarjetaPartido({ partido }: { partido: Partido }) {
  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);
  const banderaAnfitrion = BANDERAS_PAIS_ANFITRION[partido.paisAnfitrion];

  return (
    <Link
      to={`/partido/${partido.id}`}
      className="group block rounded-2xl border border-marca-grisLinea bg-white hover:border-marca-primario hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Cabecera con estadio sutil */}
      <div className="relative bg-gradient-to-r from-marca-primario/5 via-marca-primario/10 to-marca-acento/5 px-4 pt-3 pb-1">
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase tracking-wider font-bold text-marca-primario">
            {partido.grupo ? `Grupo ${partido.grupo}` : partido.fase}
          </span>
          <span className="flex items-center gap-1.5 text-marca-grisTexto font-medium">
            <span className="text-base leading-none">{banderaAnfitrion}</span>
            <span>{horaLocal(partido.fechaISO)}</span>
          </span>
        </div>
      </div>

      {/* Fila de equipos */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
            {local.banderaEmoji}
          </span>
          <div className="min-w-0">
            <p className="font-display font-bold text-marca-tinta truncate">
              {local.nombre}
            </p>
            <p className="text-xs text-marca-grisTexto/70">
              Rating {local.rating}
            </p>
          </div>
        </div>

        <span className="text-marca-grisTexto/60 text-xs font-bold tracking-wider">
          vs
        </span>

        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
          <div className="min-w-0 text-right">
            <p className="font-display font-bold text-marca-tinta truncate">
              {visitante.nombre}
            </p>
            <p className="text-xs text-marca-grisTexto/70">
              Rating {visitante.rating}
            </p>
          </div>
          <span className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
            {visitante.banderaEmoji}
          </span>
        </div>
      </div>

      {/* Pie con sede + indicador */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 text-xs text-marca-grisTexto">
          <EstadioMini ancho={32} alto={16} className="flex-shrink-0" />
          <span className="truncate">{partido.sede}</span>
        </div>
        <span className="text-xs text-marca-primario font-semibold whitespace-nowrap group-hover:translate-x-1 transition-transform">
          Ver →
        </span>
      </div>
    </Link>
  );
}

export default TarjetaPartido;
