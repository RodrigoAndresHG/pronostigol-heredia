import type { Actor, Autopsia as AutopsiaData, AutopsiaActor } from '../tipos';

/**
 * "La autopsia del partido" — el reverso del Choque de IAs.
 *
 * Cuando el partido ya se jugó, enfrenta lo que cada IA DIJO antes (su
 * probabilidad, ya guardada e inmutable) con lo que PASÓ. Declara quién
 * acertó, qué tan calibrada estaba, y —en partidos de desacuerdo— quién
 * ganó la discusión. Cierra el círculo predicción → resultado.
 */

const COLOR_ACTOR: Record<Actor, string> = {
  Claude: 'text-verde',
  GPT: 'text-cyan',
  Gemini: 'text-alerta',
  Consenso: 'text-tinta-titulo',
  'Modelo base': 'text-tinta-mute',
};

const ETIQUETA: Record<AutopsiaActor['etiqueta'], { texto: string; clase: string }> = {
  calibrada: { texto: 'calibrada', clase: 'text-verde' },
  sobreconfiada: { texto: 'sobreconfiada', clase: 'text-peligro' },
  cauta: { texto: 'cauta', clase: 'text-alerta' },
};

interface Props {
  autopsia: AutopsiaData;
  codigoLocal: string;
  codigoVisitante: string;
}

function Autopsia({ autopsia, codigoLocal, codigoVisitante }: Props) {
  const ganador =
    autopsia.resultadoReal === 'local'
      ? `Ganó ${codigoLocal}`
      : autopsia.resultadoReal === 'visitante'
        ? `Ganó ${codigoVisitante}`
        : 'Empate';

  return (
    <section className="rounded-lg border border-tinta-lineaFuerte bg-tinta-elevado/40 p-6">
      <div className="flex items-center justify-between">
        <p className="kicker text-tinta-titulo">La autopsia · qué pasó</p>
        <span className="font-mono text-[11px] uppercase tracking-wide text-tinta-mute">
          resultado final
        </span>
      </div>

      {/* Marcador real */}
      <div className="mt-3 flex items-baseline gap-4">
        <span className="font-mono text-tinta-mute text-sm w-12">{codigoLocal}</span>
        <span className="font-display text-5xl font-bold tabular text-tinta-titulo leading-none">
          {autopsia.golesLocal}–{autopsia.golesVisitante}
        </span>
        <span className="font-mono text-tinta-mute text-sm w-12">{codigoVisitante}</span>
        <span className="font-mono text-[12px] uppercase tracking-wide text-verde">
          {ganador}
        </span>
      </div>

      {/* Nota del desacuerdo: quién ganó la discusión */}
      {autopsia.notaDesacuerdo && (
        <p className="mt-4 rounded-md border border-cyan/25 bg-cyan/[0.05] px-4 py-3 text-[14px] text-tinta-cuerpo leading-relaxed">
          <span className="font-mono text-[11px] uppercase tracking-wide text-cyan">
            Quién ganó la discusión
          </span>
          <br />
          {autopsia.notaDesacuerdo}
        </p>
      )}

      {/* Cómo le fue a cada actor */}
      <div className="mt-5 divide-y divide-tinta-linea border-t border-tinta-linea">
        {autopsia.actores.map((a) => (
          <FilaActor key={a.actor} a={a} />
        ))}
      </div>

      <p className="mt-4 font-mono text-[11px] text-tinta-mute leading-relaxed max-w-lectura">
        Cada probabilidad se guardó ANTES del partido y no se editó. La columna
        muestra qué probabilidad le dio cada uno al resultado que de verdad pasó.
      </p>
    </section>
  );
}

function FilaActor({ a }: { a: AutopsiaActor }) {
  const et = ETIQUETA[a.etiqueta];
  return (
    <div className="py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`font-mono text-[11px] uppercase tracking-wide shrink-0 ${a.acerto ? 'text-verde' : 'text-peligro'}`}
        >
          {a.acerto ? '✓' : '✗'}
        </span>
        <span className={`font-mono text-[14px] font-semibold ${COLOR_ACTOR[a.actor]}`}>
          {a.actor}
        </span>
        <span className={`font-mono text-[11px] ${et.clase}`}>{et.texto}</span>
      </div>
      <div className="text-right shrink-0">
        <span className="font-mono text-[14px] text-tinta-cuerpo tabular">
          {Math.round(a.probAlResultado * 100)}%
        </span>
        <span className="font-mono text-[10px] text-tinta-mute ml-1">al resultado</span>
      </div>
    </div>
  );
}

export default Autopsia;
