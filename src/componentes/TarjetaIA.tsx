import type { RespuestaIA } from '../tipos';
import BarraProbabilidad from './BarraProbabilidad';

/**
 * Tarjeta de una IA en la página de detalle.
 *
 * Muestra:
 *   - Nombre del modelo (con su color/identidad).
 *   - Su probabilidad lcoal/empate/visitante.
 *   - Confianza autoreportada.
 *   - Explicación corta.
 *   - Marcador esperado (si lo dio).
 *
 * Si la IA falló, se muestra el error en lugar de inventar respuestas.
 */

/**
 * Color de identidad por IA. Mantiene constancia visual al hablar de cada modelo.
 */
const IDENTIDAD_IA: Record<string, { color: string; emoji: string }> = {
  Claude: { color: '#D97757', emoji: '✦' },   // Anthropic naranja
  GPT:    { color: '#10A37F', emoji: '◐' },   // OpenAI verde
  Gemini: { color: '#4285F4', emoji: '◆' },   // Google azul
};

function TarjetaIA({ respuesta }: { respuesta: RespuestaIA }) {
  const identidad = IDENTIDAD_IA[respuesta.ia] ?? {
    color: '#475569',
    emoji: '●',
  };

  // Caso de error: la IA falló o no respondió. Se muestra explícito.
  if (respuesta.error) {
    return (
      <div className="rounded-2xl border border-marca-grisLinea bg-white p-4 opacity-75">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: identidad.color }}
          >
            {identidad.emoji}
          </span>
          <span className="font-display font-semibold text-marca-tinta">
            {respuesta.ia}
          </span>
        </div>
        <p className="mt-3 text-sm text-marca-grisTexto">
          ⚠️ No se pudo obtener respuesta de {respuesta.ia}: {respuesta.error}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-marca-grisLinea bg-white p-4 space-y-3">
      {/* Cabecera con identidad de la IA y confianza */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: identidad.color }}
          >
            {identidad.emoji}
          </span>
          <div>
            <p className="font-display font-semibold text-marca-tinta leading-tight">
              {respuesta.ia}
            </p>
            <p className="text-xs text-marca-grisTexto">
              Confianza {respuesta.confianza}/100
            </p>
          </div>
        </div>
        {respuesta.marcadorEsperado && (
          <span className="text-xs font-mono bg-marca-grisLinea/50 px-2 py-1 rounded">
            {respuesta.marcadorEsperado}
          </span>
        )}
      </div>

      {/* Barra de probabilidades */}
      <BarraProbabilidad
        local={respuesta.probabilidad.local}
        empate={respuesta.probabilidad.empate}
        visitante={respuesta.probabilidad.visitante}
        compacto
      />

      {/* Explicación */}
      <p className="text-sm text-marca-grisTexto leading-relaxed">
        {respuesta.explicacion}
      </p>
    </div>
  );
}

export default TarjetaIA;
