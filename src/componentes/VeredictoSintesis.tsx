import type { Veredicto } from '../tipos';
import { useTyping } from '../movimiento/useTyping.ts';

/**
 * Cintillo del veredicto sintetizado: "consenso" o "desacuerdo".
 * El desacuerdo NO se esconde — es el diferencial editorial de la marca.
 *
 * En `animarNota` (dentro de la Mesa de Deliberación), la nota se "escribe"
 * en vivo, subrayando que el desacuerdo es contenido editorial, no un error.
 */
function VeredictoSintesis({
  veredicto,
  nota,
  animarNota = false,
}: {
  veredicto: Veredicto;
  nota: string;
  animarNota?: boolean;
}) {
  const esConsenso = veredicto === 'consenso';
  const acento = esConsenso ? 'text-verde' : 'text-cyan';
  const borde = esConsenso ? 'border-verde/30' : 'border-cyan/30';
  const fondo = esConsenso ? 'bg-verde/[0.06]' : 'bg-cyan/[0.06]';

  const { mostrado, completo } = useTyping(nota, { activo: animarNota, arranque: 200 });

  return (
    <div className={`rounded-lg border ${borde} ${fondo} p-5 sm:p-6`}>
      <p className={`kicker ${acento}`}>
        {esConsenso ? 'Veredicto · Consenso' : 'Veredicto · Desacuerdo'}
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-tinta-titulo leading-snug">
        {esConsenso ? 'Las tres IAs coinciden.' : 'Las IAs piensan distinto.'}
      </h3>
      <p className="mt-2 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
        {animarNota ? mostrado : nota}
        {animarNota && !completo && <span className={`${acento} animate-pulse-señal`}>▍</span>}
      </p>
    </div>
  );
}

export default VeredictoSintesis;
