import type { Veredicto } from '../tipos';

/**
 * Cintillo grande que muestra el veredicto sintetizado de las 3 IAs:
 * "consenso" (alta confianza) o "desacuerdo" (las IAs piensan distinto).
 *
 * El desacuerdo NO se esconde — es feature visible. Ese es el diferencial.
 */
function VeredictoSintesis({
  veredicto,
  nota,
}: {
  veredicto: Veredicto;
  nota: string;
}) {
  const esConsenso = veredicto === 'consenso';

  const colorFondo = esConsenso
    ? 'bg-marca-primario/10 border-marca-primario/30'
    : 'bg-marca-acento/10 border-marca-acento/40';

  const colorEtiqueta = esConsenso
    ? 'bg-marca-primario text-white'
    : 'bg-marca-acento text-marca-tinta';

  const titulo = esConsenso
    ? 'Consenso — las 3 IAs coinciden'
    : 'Desacuerdo — las IAs piensan distinto';

  return (
    <div className={`rounded-2xl border p-4 ${colorFondo}`}>
      <span
        className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${colorEtiqueta}`}
      >
        {esConsenso ? '✓ Consenso' : '◇ Desacuerdo'}
      </span>
      <h3 className="mt-2 font-display font-semibold text-marca-tinta">
        {titulo}
      </h3>
      <p className="mt-1 text-sm text-marca-grisTexto leading-relaxed">
        {nota}
      </p>
    </div>
  );
}

export default VeredictoSintesis;
