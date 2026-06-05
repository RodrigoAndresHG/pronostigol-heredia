import type { Veredicto } from '../tipos';

/**
 * Cintillo del veredicto sintetizado: "consenso" o "desacuerdo".
 * El desacuerdo NO se esconde — es el diferencial editorial de la marca.
 *
 * Estilo: kicker + titular Fraunces + nota. Consenso lleva acento verde;
 * desacuerdo lleva acento cyan (señal de "mirá esto con cuidado").
 */
function VeredictoSintesis({
  veredicto,
  nota,
}: {
  veredicto: Veredicto;
  nota: string;
}) {
  const esConsenso = veredicto === 'consenso';
  const acento = esConsenso ? 'text-verde' : 'text-cyan';
  const borde = esConsenso ? 'border-verde/30' : 'border-cyan/30';
  const fondo = esConsenso ? 'bg-verde/[0.06]' : 'bg-cyan/[0.06]';

  return (
    <div className={`rounded-lg border ${borde} ${fondo} p-5 sm:p-6`}>
      <p className={`kicker ${acento}`}>
        {esConsenso ? 'Veredicto · Consenso' : 'Veredicto · Desacuerdo'}
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-tinta-titulo leading-snug">
        {esConsenso
          ? 'Las tres IAs coinciden.'
          : 'Las IAs piensan distinto.'}
      </h3>
      <p className="mt-2 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
        {nota}
      </p>
    </div>
  );
}

export default VeredictoSintesis;
