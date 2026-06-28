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

/** Resultado de un partido ya jugado (para marcarlo en el calendario). */
export interface ResultadoTarjeta {
  golesLocal: number;
  golesVisitante: number;
  /** ¿El consenso de las IAs acertó? Para el sello ✓/✗ de marca. */
  consensoAcerto: boolean;
}

interface Props {
  partido: Partido;
  /** Si true muestra la fecha corta además de la hora (para inicio). */
  mostrarFecha?: boolean;
  /** Si está presente, el partido ya se jugó: se muestra el marcador. */
  resultado?: ResultadoTarjeta;
}

function TarjetaPartido({ partido, mostrarFecha = false, resultado }: Props) {
  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);
  const finalizado = !!resultado;
  const ganaLocal = finalizado && resultado!.golesLocal > resultado!.golesVisitante;
  const ganaVisitante = finalizado && resultado!.golesVisitante > resultado!.golesLocal;

  return (
    <Link
      to={`/partido/${partido.id}`}
      className="group block border-l-2 border-transparent hover:border-verde bg-tinta-tarjeta hover:bg-tinta-elevado transition-all duration-200 ease-editorial rounded-r-lg"
    >
      <div className="px-4 sm:px-5 py-4 flex items-center gap-4">
        {/* Hora / fecha — o FINAL + sello IA si ya se jugó */}
        <div className="shrink-0 w-16 text-center">
          {finalizado ? (
            <>
              <p className="font-mono text-[11px] text-tinta-mute uppercase tracking-wide">
                Final
              </p>
              <span
                className={`inline-block mt-1 font-mono text-[11px] font-semibold ${resultado!.consensoAcerto ? 'text-verde' : 'text-peligro'}`}
                title={resultado!.consensoAcerto ? 'Las IAs acertaron' : 'Las IAs fallaron'}
              >
                IA {resultado!.consensoAcerto ? '✓' : '✗'}
              </span>
            </>
          ) : (
            <>
              <p className="font-mono text-sm text-tinta-titulo font-semibold tabular">
                {horaLocal(partido.fechaISO)}
              </p>
              {mostrarFecha && (
                <p className="font-mono text-[10px] text-tinta-mute uppercase mt-0.5">
                  {fechaCorta(partido.fechaISO)}
                </p>
              )}
            </>
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
            <span className={`text-sm truncate flex-1 ${finalizado && !ganaLocal ? 'text-tinta-mute' : 'text-tinta-cuerpo'}`}>
              {local.nombre}
            </span>
            {finalizado && (
              <span className={`tabular text-[15px] w-5 text-right ${ganaLocal ? 'text-tinta-titulo font-bold' : 'text-tinta-mute'}`}>
                {resultado!.golesLocal}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 font-mono mt-1.5">
            <span className="text-tinta-titulo font-semibold text-[15px] w-10">
              {visitante.id}
            </span>
            <span className={`text-sm truncate flex-1 ${finalizado && !ganaVisitante ? 'text-tinta-mute' : 'text-tinta-cuerpo'}`}>
              {visitante.nombre}
            </span>
            {finalizado && (
              <span className={`tabular text-[15px] w-5 text-right ${ganaVisitante ? 'text-tinta-titulo font-bold' : 'text-tinta-mute'}`}>
                {resultado!.golesVisitante}
              </span>
            )}
          </div>
        </div>

        {/* Meta a la derecha */}
        <div className="shrink-0 text-right hidden sm:block">
          <p className="font-mono text-[11px] text-tinta-mute uppercase tracking-wide">
            {partido.grupo
              ? `Grupo ${partido.grupo}`
              : partido.fase === 'r32'
                ? 'Ronda de 32'
                : partido.fase}
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
