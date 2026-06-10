import type {
  DistribucionResultado,
  HechosPartido,
  Partido,
} from '../../src/tipos/index.js';
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
 * ANCLAJE A HECHOS (el arreglo del bug del DT):
 *   Antes, el prompt invitaba a "ajustar por forma reciente, lesiones,
 *   narrativa" pero NO entregaba esos datos → las IAs los rellenaban con
 *   su memoria de entrenamiento (vieja) e inventaban (p. ej. "DT: Sánchez
 *   Bas", que ya no dirige a Ecuador). Ahora el prompt entrega un dossier
 *   de hechos verificados y datados como ÚNICA fuente de verdad permitida,
 *   y prohíbe explícitamente afirmar datos que no estén en él.
 *
 * El prompt incluye:
 *   - Los dos equipos con su rating y confederación.
 *   - La sede y país anfitrión.
 *   - La probabilidad base (Capa 1) y su desglose.
 *   - Los HECHOS VERIFICADOS del partido (si los hay) o la regla "sin hechos".
 *   - Instrucciones estrictas de formato JSON.
 */

export function construirPrompt(
  partido: Partido,
  probabilidadBase: DistribucionResultado,
  desglose: DesgloseModelo,
  hechos: HechosPartido | null
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

ANCLAJE A HECHOS (regla dura, no negociable):
- Razona SÓLO con los HECHOS VERIFICADOS que se te entregan y con el modelo base. Tu memoria de entrenamiento puede estar desactualizada.
- PROHIBIDO afirmar datos específicos que no estén en los hechos: nombres de entrenadores, jugadores, lesiones, resultados o estadísticas concretas. Si lo haces, fallas la tarea.
- Si necesitas un dato que no está en los hechos, NO lo inventes: razona en términos generales (nivel, estilo, confederación) o di explícitamente que no lo sabes y baja la confianza.

Formato exacto de respuesta:
{
  "probabilidad": { "local": 0.NN, "empate": 0.NN, "visitante": 0.NN },
  "confianza": NN,
  "explicacion": "texto en español",
  "marcadorEsperado": "X-Y"
}

Tu opinión puede coincidir con el modelo base o desviarse, pero SÓLO apoyándote en los hechos verificados. Si los hechos no dan razón para desviarte, respeta la base — eso también es información.`;

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

${bloqueHechos(local.nombre, visitante.nombre, hechos)}

Tu trabajo: ajusta la base apoyándote ÚNICAMENTE en estos hechos y el modelo base, y devuelve TU propia probabilidad.`;

  return { sistema, usuario };
}

/**
 * Serializa el dossier a texto para el prompt. Si no hay hechos verificados
 * del partido, devuelve la regla dura que impide inventar.
 */
function bloqueHechos(
  nombreLocal: string,
  nombreVisitante: string,
  hechos: HechosPartido | null
): string {
  if (!hechos) {
    return `HECHOS VERIFICADOS: NO disponibles para este partido.
No tienes datos actuales de entrenador, plantilla ni forma de estos equipos. NO inventes ninguno (entrenadores, jugadores, lesiones, estadísticas): razona sólo con el modelo base y consideraciones generales de nivel y estilo, y baja tu confianza en consecuencia.`;
  }

  return `HECHOS VERIFICADOS (al ${hechos.capturadoEl} · única fuente permitida, no inventes fuera de aquí):
- ${nombreLocal}: ${lineaEquipo(hechos.local)}
- ${nombreVisitante}: ${lineaEquipo(hechos.visitante)}`;
}

function lineaEquipo(d: {
  dt: string;
  dtDesde?: string;
  estrella?: string;
  formaReciente?: string;
  notaTorneo?: string;
}): string {
  const limpio = (s: string) => s.trim().replace(/\.+$/, '');
  const partes = [`DT ${limpio(d.dt)}${d.dtDesde ? ` (desde ${d.dtDesde})` : ''}`];
  if (d.estrella) partes.push(`Figura: ${limpio(d.estrella)}`);
  if (d.formaReciente) partes.push(`Forma: ${limpio(d.formaReciente)}`);
  if (d.notaTorneo) partes.push(limpio(d.notaTorneo));
  return partes.join('. ') + '.';
}
