import type { Prediccion } from '../tipos';
import { porcentaje } from '../lib/formato';

/**
 * Compara la probabilidad final contra la del mercado. Si hay discrepancia
 * significativa, marca "señal de valor". Si no, lo dice explícitamente —
 * la transparencia sobre los "no hay" importa tanto como los "sí hay".
 *
 * La señal usa el acento alerta (ámbar) porque es semánticamente "atención,
 * el mercado podría estar equivocado" — no decoración.
 */
function SenalValor({ prediccion }: { prediccion: Prediccion }) {
  if (!prediccion.cuotaMercado) return null;

  // Mercado disponible pero sin señal → alineados.
  if (!prediccion.senalValor) {
    return (
      <div className="rounded-lg border border-tinta-linea bg-tinta-tarjeta p-5 sm:p-6">
        <p className="kicker">Mercado vs IAs</p>
        <h3 className="mt-2 font-display text-xl font-semibold text-tinta-titulo">
          Sin señal de valor
        </h3>
        <p className="mt-2 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
          El mercado (
          <span className="font-mono text-tinta-titulo">
            {porcentaje(prediccion.cuotaMercado.local)} /{' '}
            {porcentaje(prediccion.cuotaMercado.empate)} /{' '}
            {porcentaje(prediccion.cuotaMercado.visitante)}
          </span>
          ) está dentro de rango respecto al consenso de las IAs. No detectamos
          discrepancia relevante.
        </p>
      </div>
    );
  }

  const { direccion, delta, explicacion } = prediccion.senalValor;
  const etiqueta =
    direccion === 'local' ? 'Local' : direccion === 'empate' ? 'Empate' : 'Visitante';

  return (
    <div className="rounded-lg border border-alerta/30 bg-alerta/[0.06] p-5 sm:p-6">
      <p className="kicker text-alerta">Señal de valor</p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-tinta-titulo leading-snug">
        Posible valor en {etiqueta}{' '}
        <span className="font-mono text-alerta">+{delta} pts</span>
      </h3>
      <p className="mt-2 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
        {explicacion}
      </p>
    </div>
  );
}

export default SenalValor;
