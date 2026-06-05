import { Link } from 'react-router-dom';
import type { Partido } from '../tipos';
import { equipoPorId } from '../datos/equipos';
import { horaLocal, fechaCorta } from '../lib/zonaHoraria';

/**
 * Fila editorial de un partido. Sin banderas emoji: usa códigos de país
 * en mono. Layout horizontal limpio, hover sutil (border-left verde +
 * elevación de fondo). Se usa en calendario e inicio.
 */

const CODIGO_PAIS: Record<Partido['paisAnfitrion'], string> = {
  México: 'MEX',
  'Estados Unidos': 'USA',
  Canadá: 'CAN',
};

interface Props {
  partido: Partido;
  /** Si true muestra la fecha corta además de la hora (para inicio). */
  mostrarFecha?: boolean;
}

function TarjetaPartido({ partido, mostrarFecha = false }: Props) {
  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);

  return (
    <Link
      to={`/partido/${partido.id}`}
      className="group block border-l-2 border-transparent hover:border-verde bg-tinta-tarjeta hover:bg-tinta-elevado transition-all duration-200 ease-editorial rounded-r-lg"
    >
      <div className="px-4 sm:px-5 py-4 flex items-center gap-4">
        {/* Hora / fecha en mono */}
        <div className="shrink-0 w-16 text-center">
          <p className="font-mono text-sm text-tinta-titulo font-semibold tabular">
            {horaLocal(partido.fechaISO)}
          </p>
          {mostrarFecha && (
            <p className="font-mono text-[10px] text-tinta-mute uppercase mt-0.5">
              {fechaCorta(partido.fechaISO)}
            </p>
          )}
        </div>

        {/* Separador */}
        <div className="w-px h-8 bg-tinta-linea shrink-0" />

        {/* Equipos en mono — el corazón editorial */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 font-mono">
            <span className="text-tinta-titulo font-semibold text-[15px] w-10">
              {local.id}
            </span>
            <span className="text-tinta-cuerpo text-sm truncate flex-1">
              {local.nombre}
            </span>
          </div>
          <div className="flex items-center gap-2.5 font-mono mt-1.5">
            <span className="text-tinta-titulo font-semibold text-[15px] w-10">
              {visitante.id}
            </span>
            <span className="text-tinta-cuerpo text-sm truncate flex-1">
              {visitante.nombre}
            </span>
          </div>
        </div>

        {/* Meta a la derecha */}
        <div className="shrink-0 text-right hidden sm:block">
          <p className="font-mono text-[11px] text-tinta-mute uppercase tracking-wide">
            {partido.grupo ? `Grupo ${partido.grupo}` : partido.fase}
          </p>
          <p className="font-mono text-[11px] text-tinta-mute mt-0.5">
            {CODIGO_PAIS[partido.paisAnfitrion]}
          </p>
        </div>

        {/* Indicador */}
        <span className="shrink-0 text-verde opacity-0 group-hover:opacity-100 transition-opacity font-mono text-sm">
          →
        </span>
      </div>
    </Link>
  );
}

export default TarjetaPartido;
