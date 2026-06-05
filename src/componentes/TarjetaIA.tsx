import type { RespuestaIA } from '../tipos';
import { porcentajesNormalizados } from '../lib/formato';

/**
 * Tarjeta editorial de una IA. Sin emojis: avatar de letra mono con anillo
 * de color tenue para distinguir cada modelo. Score grande en Fraunces,
 * probabilidades en lista mono tabular, razonamiento en Fraunces itálica.
 *
 * Si la IA falló, se muestra el error explícito (transparencia).
 */

/** Identidad mínima por modelo: inicial + color de anillo (tenue). */
const IDENTIDAD: Record<string, { inicial: string; anillo: string; texto: string }> = {
  Claude: { inicial: 'C', anillo: 'border-verde/60', texto: 'text-verde' },
  GPT: { inicial: 'G', anillo: 'border-cyan/60', texto: 'text-cyan' },
  Gemini: { inicial: 'G', anillo: 'border-alerta/60', texto: 'text-alerta' },
};

interface Props {
  respuesta: RespuestaIA;
  codigoLocal?: string;
  codigoVisitante?: string;
}

function TarjetaIA({ respuesta, codigoLocal = 'LOCAL', codigoVisitante = 'VISIT' }: Props) {
  const id = IDENTIDAD[respuesta.ia] ?? {
    inicial: '·',
    anillo: 'border-tinta-lineaFuerte',
    texto: 'text-tinta-mute',
  };

  // Caso de error.
  if (respuesta.error) {
    return (
      <div className="rounded-lg border border-tinta-linea bg-tinta-elevado/50 p-5">
        <CabeceraIA ia={respuesta.ia} id={id} />
        <p className="mt-4 font-mono text-xs text-alerta/90 leading-relaxed">
          NO DISPONIBLE — {respuesta.error}
        </p>
      </div>
    );
  }

  const [pl, pe, pv] = porcentajesNormalizados(
    respuesta.probabilidad.local,
    respuesta.probabilidad.empate,
    respuesta.probabilidad.visitante
  );

  return (
    <div className="rounded-lg border border-tinta-linea bg-tinta-elevado p-5 transition-all duration-200 ease-editorial hover:border-tinta-lineaFuerte">
      <CabeceraIA ia={respuesta.ia} id={id} confianza={respuesta.confianza} />

      {/* Marcador esperado grande en Fraunces */}
      {respuesta.marcadorEsperado && (
        <p className="mt-4 font-display text-5xl font-semibold text-tinta-titulo tabular leading-none">
          {respuesta.marcadorEsperado}
        </p>
      )}

      {/* Probabilidades en lista mono */}
      <dl className="mt-4 space-y-1.5 font-mono text-xs">
        <FilaProb etiqueta={codigoLocal} valor={pl} color="text-verde" />
        <FilaProb etiqueta="EMPATE" valor={pe} color="text-tinta-mute" />
        <FilaProb etiqueta={codigoVisitante} valor={pv} color="text-cyan" />
      </dl>

      {/* Razonamiento en Fraunces itálica */}
      <p className="mt-4 pt-4 border-t border-tinta-linea font-display italic text-[15px] text-tinta-cuerpo leading-relaxed">
        {respuesta.explicacion}
      </p>
    </div>
  );
}

function CabeceraIA({
  ia,
  id,
  confianza,
}: {
  ia: string;
  id: { inicial: string; anillo: string; texto: string };
  confianza?: number;
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
              CONFIANZA {confianza}/100
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FilaProb({
  etiqueta,
  valor,
  color,
}: {
  etiqueta: string;
  valor: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-tinta-mute tracking-wide">{etiqueta}</dt>
      <dd className={`${color} font-semibold tabular`}>{valor}</dd>
    </div>
  );
}

export default TarjetaIA;
