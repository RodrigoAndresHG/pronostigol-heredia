import { porcentajesNormalizados } from '../lib/formato';

/**
 * Barra de probabilidad editorial: una franja fina de 3 segmentos +
 * una tabla mono debajo con los porcentajes en cifras tabulares.
 *
 * Color (data-viz, no decoración):
 *   - local     → verde (equipo local)
 *   - empate    → slate mute (resultado neutro)
 *   - visitante → cyan (equipo visitante)
 *
 * Todo número va en JetBrains Mono tabular para que no "baile" al cambiar.
 */

interface Props {
  local: number;
  empate: number;
  visitante: number;
  /** Códigos de país para las etiquetas (ej. "ECU", "ARG"). Opcional. */
  codigoLocal?: string;
  codigoVisitante?: string;
  /** Kicker encima de la barra. */
  kicker?: string;
  /** Versión compacta para tarjetas estrechas. */
  compacto?: boolean;
}

function BarraProbabilidad({
  local,
  empate,
  visitante,
  codigoLocal = 'LOCAL',
  codigoVisitante = 'VISIT',
  kicker,
  compacto = false,
}: Props) {
  const [pctLocal, pctEmpate, pctVisitante] = porcentajesNormalizados(
    local,
    empate,
    visitante
  );

  const alto = compacto ? 'h-1.5' : 'h-2';

  return (
    <div>
      {kicker && <p className="kicker mb-2">{kicker}</p>}

      {/* Franja */}
      <div className={`flex w-full ${alto} rounded-full overflow-hidden bg-tinta-linea`}>
        <div className="bg-verde transition-all duration-300 ease-editorial" style={{ width: pctLocal }} />
        <div className="bg-tinta-mute/50 transition-all duration-300 ease-editorial" style={{ width: pctEmpate }} />
        <div className="bg-cyan transition-all duration-300 ease-editorial" style={{ width: pctVisitante }} />
      </div>

      {/* Tabla mono */}
      <div className={`mt-2.5 grid grid-cols-3 ${compacto ? 'gap-1' : 'gap-2'} font-mono ${compacto ? 'text-[11px]' : 'text-xs'}`}>
        <Fila color="bg-verde" etiqueta={codigoLocal} valor={pctLocal} />
        <Fila color="bg-tinta-mute/50" etiqueta="EMPATE" valor={pctEmpate} centro />
        <Fila color="bg-cyan" etiqueta={codigoVisitante} valor={pctVisitante} derecha />
      </div>
    </div>
  );
}

function Fila({
  color,
  etiqueta,
  valor,
  centro = false,
  derecha = false,
}: {
  color: string;
  etiqueta: string;
  valor: string;
  centro?: boolean;
  derecha?: boolean;
}) {
  const align = derecha ? 'items-end text-right' : centro ? 'items-center text-center' : 'items-start';
  return (
    <div className={`flex flex-col ${align}`}>
      <div className="flex items-center gap-1.5">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${color} flex-shrink-0`} />
        <span className="text-tinta-mute tracking-wide">{etiqueta}</span>
      </div>
      <span className="text-tinta-titulo font-semibold tabular mt-0.5">{valor}</span>
    </div>
  );
}

export default BarraProbabilidad;
