import { motion, useReducedMotion } from 'motion/react';
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
  /** Si true, los segmentos se "llenan" con animación al entrar al viewport. */
  animarEntrada?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function BarraProbabilidad({
  local,
  empate,
  visitante,
  codigoLocal = 'LOCAL',
  codigoVisitante = 'VISIT',
  kicker,
  compacto = false,
  animarEntrada = false,
}: Props) {
  const [pctLocal, pctEmpate, pctVisitante] = porcentajesNormalizados(
    local,
    empate,
    visitante
  );
  const reduce = useReducedMotion();
  const animar = animarEntrada && !reduce;

  const alto = compacto ? 'h-1.5' : 'h-2';

  // Cada segmento: si anima, crece con scaleX desde la izquierda (GPU, sin reflow).
  const segmento = (color: string, ancho: string, i: number) =>
    animar ? (
      <motion.div
        key={i}
        className={color}
        style={{ width: ancho, transformOrigin: 'left center' }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.05 * i }}
      />
    ) : (
      <div key={i} className={`${color} transition-all duration-300 ease-editorial`} style={{ width: ancho }} />
    );

  return (
    <div>
      {kicker && <p className="kicker mb-2">{kicker}</p>}

      {/* Franja */}
      <div className={`flex w-full ${alto} rounded-full overflow-hidden bg-tinta-linea`}>
        {segmento('bg-verde', pctLocal, 0)}
        {segmento('bg-tinta-mute/50', pctEmpate, 1)}
        {segmento('bg-cyan', pctVisitante, 2)}
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
