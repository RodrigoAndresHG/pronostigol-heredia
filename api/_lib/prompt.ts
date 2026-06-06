import type { DistribucionResultado, Partido } from '../../src/tipos/index.js';
import type { DesgloseModelo } from '../../src/lib/modeloBase.js';
import { equipoPorId } from '../../src/datos/equipos.js';

/**
 * Construye el prompt que reciben las 3 IAs.
 *
 * El prompt es IDÉNTICO para Claude, GPT y Gemini — eso es importante:
 * cualquier diferencia entre sus respuestas viene del modelo en sí,
 * no de variaciones en el input. Eso es lo que hace honesto el
 * comparativo de "consenso vs desacuerdo".
 *
 * El prompt incluye:
 *   - Los dos equipos con su rating y confederación.
 *   - La sede y país anfitrión.
 *   - La probabilidad base (Capa 1) y su desglose, para que la IA tenga
 *     un anclaje numérico y opine sobre desvíos, no desde cero.
 *   - Instrucciones estrictas de formato JSON.
 */

export function construirPrompt(
  partido: Partido,
  probabilidadBase: DistribucionResultado,
  desglose: DesgloseModelo
): { sistema: string; usuario: string } {
  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);

  const sistema = `Eres un analista deportivo experto en fútbol internacional, evaluando un partido del Mundial 2026. Tu trabajo es dar una predicción probabilística honesta y bien razonada.

REGLAS ESTRICTAS:
- Responde SÓLO con JSON válido. Sin markdown, sin código, sin comentarios.
- Las tres probabilidades DEBEN sumar exactamente 1.0.
- "confianza" es 0-100: refleja qué tan seguro estás. Si tienes dudas reales, baja la confianza — la honestidad sobre la incertidumbre es más valiosa que la certeza falsa.
- "explicacion" es en español, máximo 3 frases, sin paja ni clichés. Da el razonamiento concreto.
- "marcadorEsperado" es opcional, formato "X-Y" con goles del local primero.

Formato exacto de respuesta:
{
  "probabilidad": { "local": 0.NN, "empate": 0.NN, "visitante": 0.NN },
  "confianza": NN,
  "explicacion": "texto en español",
  "marcadorEsperado": "X-Y"
}

Tu opinión puede coincidir con el modelo base o desviarse. Si te desvías, que sea por una razón identificable (forma reciente, lesiones, narrativa del torneo, calidad individual, factores de viaje/altitud). Si no tienes razón para desviarte, respeta la base — eso también es información.`;

  const usuario = `PARTIDO A EVALUAR

${local.banderaEmoji} ${local.nombre} (LOCAL — rating ${local.rating}, ${local.confederacion})
        vs
${visitante.banderaEmoji} ${visitante.nombre} (VISITANTE — rating ${visitante.rating}, ${visitante.confederacion})

Sede: ${partido.sede}, ${partido.paisAnfitrion}
Fase: ${partido.fase}${partido.grupo ? ` · Grupo ${partido.grupo}` : ''}
Fecha (UTC): ${partido.fechaISO}

MODELO BASE (Capa 1, estadístico, sin opinión):
- Victoria local: ${Math.round(probabilidadBase.local * 100)}%
- Empate: ${Math.round(probabilidadBase.empate * 100)}%
- Victoria visitante: ${Math.round(probabilidadBase.visitante * 100)}%

Factores que produjeron esa base:
- Diferencia de rating efectiva: ${desglose.diferenciaElo >= 0 ? '+' : ''}${Math.round(desglose.diferenciaElo)} Elo a favor del ${desglose.diferenciaElo >= 0 ? 'local' : 'visitante'}
- Ventaja de sede del local: +${desglose.bonusSedeLocal} Elo${desglose.bonusSedeLocal === 120 ? ' (anfitrión en su país)' : ''}

Tu trabajo: ajusta esta base con contexto cualitativo y devuelve TU propia probabilidad.`;

  return { sistema, usuario };
}
