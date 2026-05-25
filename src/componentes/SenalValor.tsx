import type { Prediccion } from '../tipos';
import { porcentaje } from '../lib/formato';

/**
 * Compara la probabilidad final de la app contra la del mercado y muestra
 * si hay una "señal de valor" — un punto donde el mercado podría estar
 * subestimando un resultado.
 *
 * Si no hay señal clara (consenso y mercado coinciden), lo decimos
 * explícitamente. La transparencia sobre los "no hay" es tan importante
 * como los "sí hay".
 */

function SenalValor({ prediccion }: { prediccion: Prediccion }) {
  if (!prediccion.cuotaMercado) {
    return null;
  }

  // Hay cuota de mercado pero no señal de valor → caso "alineados".
  if (!prediccion.senalValor) {
    return (
      <div className="rounded-2xl border border-marca-grisLinea bg-white p-4">
        <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-marca-grisLinea text-marca-grisTexto">
          Mercado vs IAs
        </span>
        <h3 className="mt-2 font-display font-semibold text-marca-tinta">
          Sin señal de valor — mercado y consenso alineados
        </h3>
        <p className="mt-1 text-sm text-marca-grisTexto leading-relaxed">
          Las probabilidades del mercado (
          {porcentaje(prediccion.cuotaMercado.local)} /{' '}
          {porcentaje(prediccion.cuotaMercado.empate)} /{' '}
          {porcentaje(prediccion.cuotaMercado.visitante)}) están dentro de
          rango respecto al consenso de las IAs. No detectamos una
          discrepancia significativa.
        </p>
      </div>
    );
  }

  // Hay señal — mostramos dirección, delta y explicación.
  const { direccion, delta, explicacion } = prediccion.senalValor;
  const etiquetaDireccion =
    direccion === 'local' ? 'Local' : direccion === 'empate' ? 'Empate' : 'Visitante';

  return (
    <div className="rounded-2xl border border-marca-acento/40 bg-marca-acento/10 p-4">
      <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-marca-acento text-marca-tinta">
        🎯 Señal de valor
      </span>
      <h3 className="mt-2 font-display font-semibold text-marca-tinta">
        Posible valor en {etiquetaDireccion}{' '}
        <span className="text-marca-acento">+{delta} pts</span>
      </h3>
      <p className="mt-1 text-sm text-marca-grisTexto leading-relaxed">
        {explicacion}
      </p>
    </div>
  );
}

export default SenalValor;
