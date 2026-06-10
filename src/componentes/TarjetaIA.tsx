import { motion, useReducedMotion } from 'motion/react';
import type { RespuestaIA } from '../tipos';
import { porcentajesNormalizados } from '../lib/formato';
import { useTyping } from '../movimiento/useTyping.ts';
import CountUp from '../movimiento/CountUp';

/**
 * Tarjeta editorial de una IA. Avatar de letra mono con anillo de color,
 * score grande en Fraunces, probabilidades en lista mono, razonamiento en
 * Fraunces itálica.
 *
 * En `modoMesa` (dentro de la Mesa de Deliberación): entra con stagger,
 * el razonamiento se "escribe" en vivo (typing) y los números cuentan.
 * Fuera de modoMesa, render estático idéntico al original.
 */

const IDENTIDAD: Record<string, { inicial: string; anillo: string; texto: string }> = {
  Claude: { inicial: 'C', anillo: 'border-verde/60', texto: 'text-verde' },
  GPT: { inicial: 'G', anillo: 'border-cyan/60', texto: 'text-cyan' },
  Gemini: { inicial: 'G', anillo: 'border-alerta/60', texto: 'text-alerta' },
};

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  respuesta: RespuestaIA;
  codigoLocal?: string;
  codigoVisitante?: string;
  /** Activa la dramatización (typing + count-up + entrada escalonada). */
  modoMesa?: boolean;
  /** Orden en la mesa (0,1,2) para escalonar la entrada y el typing. */
  index?: number;
}

function TarjetaIA({
  respuesta,
  codigoLocal = 'LOCAL',
  codigoVisitante = 'VISIT',
  modoMesa = false,
  index = 0,
}: Props) {
  const reduce = useReducedMotion();
  const id = IDENTIDAD[respuesta.ia] ?? {
    inicial: '·',
    anillo: 'border-tinta-lineaFuerte',
    texto: 'text-tinta-mute',
  };

  // Entrada escalonada en modo mesa.
  const entrada = modoMesa && !reduce
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE, delay: index * 0.2 },
      }
    : {};

  // Caso de error.
  if (respuesta.error) {
    return (
      <motion.div className="rounded-lg border border-tinta-linea bg-tinta-elevado/50 p-5" {...entrada}>
        <CabeceraIA ia={respuesta.ia} id={id} />
        <p className="mt-4 font-mono text-xs text-alerta/90 leading-relaxed">
          NO DISPONIBLE — {respuesta.error}
        </p>
      </motion.div>
    );
  }

  const [pl, pe, pv] = porcentajesNormalizados(
    respuesta.probabilidad.local,
    respuesta.probabilidad.empate,
    respuesta.probabilidad.visitante
  );

  // El razonamiento empieza a escribirse cuando la tarjeta ya entró.
  const arranque = index * 200 + 400;

  return (
    <motion.div
      className="min-w-0 rounded-lg border border-tinta-linea bg-tinta-elevado p-5 transition-all duration-200 ease-editorial hover:border-tinta-lineaFuerte"
      {...entrada}
    >
      <CabeceraIA ia={respuesta.ia} id={id} confianza={respuesta.confianza} modoMesa={modoMesa} arranque={arranque} />

      {/* Marcador esperado grande en Fraunces */}
      {respuesta.marcadorEsperado && (
        <p className="mt-4 font-display text-5xl font-semibold text-tinta-titulo tabular leading-none">
          {respuesta.marcadorEsperado}
        </p>
      )}

      {/* Probabilidades en lista mono */}
      <dl className="mt-4 space-y-1.5 font-mono text-xs">
        <FilaProb etiqueta={codigoLocal} valorPct={pl} color="text-verde" modoMesa={modoMesa} delay={arranque / 1000} />
        <FilaProb etiqueta="EMPATE" valorPct={pe} color="text-tinta-mute" modoMesa={modoMesa} delay={arranque / 1000} />
        <FilaProb etiqueta={codigoVisitante} valorPct={pv} color="text-cyan" modoMesa={modoMesa} delay={arranque / 1000} />
      </dl>

      {/* Razonamiento en Fraunces itálica (typing en modo mesa) */}
      <Razonamiento texto={respuesta.explicacion} modoMesa={modoMesa} arranque={arranque} />
    </motion.div>
  );
}

function Razonamiento({ texto, modoMesa, arranque }: { texto: string; modoMesa: boolean; arranque: number }) {
  const { mostrado, completo } = useTyping(texto, { activo: modoMesa, arranque });
  return (
    <p className="mt-4 pt-4 border-t border-tinta-linea font-display italic text-[15px] text-tinta-cuerpo leading-relaxed">
      {modoMesa ? mostrado : texto}
      {modoMesa && !completo && <span className="text-verde animate-pulse-señal">▍</span>}
    </p>
  );
}

function CabeceraIA({
  ia,
  id,
  confianza,
  modoMesa = false,
  arranque = 0,
}: {
  ia: string;
  id: { inicial: string; anillo: string; texto: string };
  confianza?: number;
  modoMesa?: boolean;
  arranque?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full border ${id.anillo} bg-tinta-fondo font-mono font-semibold ${id.texto}`}
        >
          {id.inicial}
        </span>
        <div>
          <p className="font-sans font-semibold text-tinta-titulo text-[15px] leading-tight">
            {ia}
          </p>
          {confianza !== undefined && (
            <p className="font-mono text-[11px] text-tinta-mute">
              CONFIANZA{' '}
              {modoMesa ? <CountUp to={confianza} duration={1.2} delay={arranque / 1000} /> : confianza}
              /100
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FilaProb({
  etiqueta,
  valorPct,
  color,
  modoMesa = false,
  delay = 0,
}: {
  etiqueta: string;
  valorPct: string;
  color: string;
  modoMesa?: boolean;
  delay?: number;
}) {
  const num = parseInt(valorPct, 10);
  return (
    <div className="flex items-center justify-between">
      <dt className="text-tinta-mute tracking-wide">{etiqueta}</dt>
      <dd className={`${color} font-semibold tabular`}>
        {modoMesa ? <CountUp to={num} suffix="%" duration={1.1} delay={delay} /> : valorPct}
      </dd>
    </div>
  );
}

export default TarjetaIA;
