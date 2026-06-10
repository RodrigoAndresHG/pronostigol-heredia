import { useState } from 'react';
import type { Prediccion, RespuestaIA } from '../tipos';
import { lmsConSeguimiento } from '../marca/enlaces.ts';

/**
 * "Anatomía del desacuerdo" — la transparencia operativa convertida en
 * lección de prompting (y en puente honesto al workshop).
 *
 * Sólo aparece cuando hay DESACUERDO. Descompone POR QUÉ divergen las IAs:
 * cuánto movió cada una la probabilidad respecto al modelo base y sobre qué
 * factor se apoyó. Al pie, el botón "Copiar este caso como prompt" entrega
 * el prompt EXACTO y reproducible (anclado a hechos) para que el usuario lo
 * corra él mismo. Regalas el pescado y la caña: el valor está en el método.
 */

interface Props {
  prediccion: Prediccion;
  codigoLocal: string;
  codigoVisitante: string;
}

function AnatomiaDesacuerdo({ prediccion, codigoLocal, codigoVisitante }: Props) {
  const [estado, setEstado] = useState<'idle' | 'copiando' | 'copiado' | 'error'>(
    'idle'
  );

  const validas = prediccion.respuestasIA.filter((r) => !r.error);
  const base = prediccion.probabilidadBase;

  const copiarPrompt = async () => {
    setEstado('copiando');
    try {
      const res = await fetch(
        `/api/predecir?partidoId=${encodeURIComponent(prediccion.partidoId)}&soloPrompt=1`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { sistema, usuario } = (await res.json()) as {
        sistema: string;
        usuario: string;
      };
      const texto = `# PROMPT DE SISTEMA\n\n${sistema}\n\n\n# PROMPT DE USUARIO\n\n${usuario}\n\n\n— Prompt reproducible de PronostiGol HeredIA. Córrelo en Claude, GPT o Gemini y compara sus respuestas tú mismo.`;
      await navigator.clipboard.writeText(texto);
      setEstado('copiado');
      setTimeout(() => setEstado('idle'), 3000);
    } catch {
      setEstado('error');
      setTimeout(() => setEstado('idle'), 3000);
    }
  };

  return (
    <section className="rounded-lg border border-cyan/25 bg-cyan/[0.04] p-6">
      <p className="kicker text-cyan">Anatomía del desacuerdo</p>
      <h3 className="mt-2 font-display text-xl sm:text-2xl font-semibold text-tinta-titulo leading-snug max-w-[34ch]">
        Vieron los mismos hechos y aún así difieren. Aquí el porqué.
      </h3>
      <p className="mt-2 max-w-lectura text-[14px] text-tinta-cuerpo leading-relaxed">
        Cuánto movió cada IA la probabilidad respecto al modelo base, y sobre
        qué factor se apoyó. El desacuerdo no es ruido: es información.
      </p>

      <div className="mt-5 divide-y divide-tinta-linea border-y border-tinta-linea">
        {validas.map((r) => (
          <FilaIA
            key={r.ia}
            respuesta={r}
            base={base}
            codigoLocal={codigoLocal}
            codigoVisitante={codigoVisitante}
          />
        ))}
      </div>

      {/* Copiar el prompt real — transparencia operativa total */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={copiarPrompt}
          disabled={estado === 'copiando'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-cyan/40 text-cyan font-semibold text-sm hover:bg-cyan/10 transition-colors disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {estado === 'copiando' ? 'Copiando…' : 'Copiar este caso como prompt'}
        </button>
        {estado === 'copiado' && (
          <span className="font-mono text-[12px] text-verde" aria-live="polite">
            ✓ Prompt copiado — córrelo tú mismo
          </span>
        )}
        {estado === 'error' && (
          <span className="font-mono text-[12px] text-alerta" aria-live="polite">
            No se pudo copiar
          </span>
        )}
      </div>

      {/* Puente honesto al método */}
      <a
        href={lmsConSeguimiento('anatomia-desacuerdo')}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-5 flex items-center justify-between gap-4 rounded-md bg-tinta-elevado/60 border border-tinta-linea px-4 py-3 hover:border-cyan/40 transition-colors"
      >
        <span className="text-[13px] text-tinta-cuerpo leading-snug">
          Así se audita el razonamiento de 3 IAs en decisiones que importan en
          tu negocio.
        </span>
        <span className="font-mono text-[12px] text-cyan whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
          El método →
        </span>
      </a>
    </section>
  );
}

function FilaIA({
  respuesta,
  base,
  codigoLocal,
  codigoVisitante,
}: {
  respuesta: RespuestaIA;
  base: { local: number; empate: number; visitante: number };
  codigoLocal: string;
  codigoVisitante: string;
}) {
  const movida = movidaPrincipal(respuesta.probabilidad, base, codigoLocal, codigoVisitante);
  const factor = factorDeclarado(respuesta.explicacion);

  return (
    <div className="py-3 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="font-mono text-[13px] text-tinta-titulo font-semibold">
          {respuesta.ia}
        </p>
        <p className="mt-0.5 font-mono text-[12px] text-tinta-mute">
          factor: <span className="text-tinta-cuerpo">{factor}</span>
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-mono text-[13px] font-semibold ${movida.color}`}>
          {movida.texto}
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-tinta-mute">
          confianza {respuesta.confianza}
        </p>
      </div>
    </div>
  );
}

/** Identifica el "movimiento" de la IA: en qué resultado se separó más de la base. */
function movidaPrincipal(
  p: { local: number; empate: number; visitante: number },
  base: { local: number; empate: number; visitante: number },
  codigoLocal: string,
  codigoVisitante: string
): { texto: string; color: string } {
  const deltas: Array<{ k: 'local' | 'empate' | 'visitante'; d: number }> = [
    { k: 'local', d: p.local - base.local },
    { k: 'empate', d: p.empate - base.empate },
    { k: 'visitante', d: p.visitante - base.visitante },
  ];
  const top = deltas.reduce((a, b) => (Math.abs(b.d) > Math.abs(a.d) ? b : a));
  const pts = Math.round(top.d * 100);
  const signo = pts > 0 ? '+' : '';
  const etiqueta =
    top.k === 'local'
      ? `gana ${codigoLocal}`
      : top.k === 'visitante'
        ? `gana ${codigoVisitante}`
        : 'empate';
  const color =
    top.k === 'local' ? 'text-verde' : top.k === 'visitante' ? 'text-cyan' : 'text-tinta-cuerpo';
  if (pts === 0) return { texto: 'pegada al modelo base', color: 'text-tinta-mute' };
  return { texto: `${signo}${pts} pts a ${etiqueta}`, color };
}

/** Heurística simple: detecta el factor cualitativo dominante en la explicación. */
function factorDeclarado(explicacion: string): string {
  const t = explicacion.toLowerCase();
  if (/lesi[oó]n|\bbajas?\b|ausen|descart|sin su\b/.test(t)) return 'lesiones / bajas';
  if (/forma|momento|racha|invict|reciente|venía|llega/.test(t)) return 'forma reciente';
  if (/individual|figura|talento|estrella|crack|calidad|jugadore/.test(t))
    return 'calidad individual';
  if (/táctic|tactic|esquema|estilo|press|defens|cohesi|bloque|orden/.test(t))
    return 'táctica / estilo';
  if (/viaj|altitud|clima|calor|descanso|fatiga|físic|fisic/.test(t))
    return 'viaje / físico';
  if (/histor|experiencia|mundial|jerarqu|peso|tradici/.test(t))
    return 'jerarquía / experiencia';
  return 'lectura propia del partido';
}

export default AnatomiaDesacuerdo;
