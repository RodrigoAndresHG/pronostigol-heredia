import type {
  DistribucionResultado,
  HechosPartido,
  Partido,
} from '../../src/tipos/index.js';
import type { DesgloseModelo } from '../../src/lib/modeloBase.js';
import { equipoPorId } from '../../src/datos/equipos.js';
import type {
  ContextoTorneo,
  RecordEquipo,
} from './contextoTorneo.js';

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
 *   - Los RESULTADOS DEL TORNEO hasta la fecha (forma intra-torneo), si los hay.
 *   - Instrucciones estrictas de formato JSON.
 */

export function construirPrompt(
  partido: Partido,
  probabilidadBase: DistribucionResultado,
  desglose: DesgloseModelo,
  hechos: HechosPartido | null,
  contexto: ContextoTorneo | null = null
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
- Razona SÓLO con lo que se te entrega: los HECHOS VERIFICADOS, los RESULTADOS DEL TORNEO hasta la fecha (si aparecen) y el modelo base. Tu memoria de entrenamiento puede estar desactualizada.
- Los RESULTADOS DEL TORNEO que se incluyen abajo SÍ son fuente válida y verificada: úsalos para leer la forma actual de cada equipo. Cualquier otro resultado o estadística que no esté escrito ahí, NO lo afirmes.
- PROHIBIDO inventar datos específicos fuera de lo entregado: nombres de entrenadores, jugadores, lesiones, marcadores o estadísticas concretas. Si lo haces, fallas la tarea.
- Si necesitas un dato que no está, NO lo inventes: razona en términos generales (nivel, estilo, confederación) o di explícitamente que no lo sabes y baja la confianza.

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
${bloqueContextoTorneo(contexto)}
Tu trabajo: ajusta la base apoyándote ÚNICAMENTE en estos hechos, los resultados del torneo y el modelo base, y devuelve TU propia probabilidad.`;

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

/**
 * Serializa el contexto intra-torneo (resultados ya jugados + tabla del
 * grupo). Devuelve '' cuando no hay nada (MD1), o el bloque envuelto en
 * saltos de línea para separarlo visualmente del resto del prompt.
 */
function bloqueContextoTorneo(contexto: ContextoTorneo | null): string {
  if (!contexto) return '';

  const lineas = [
    'RESULTADOS DEL TORNEO HASTA AHORA (hechos verificados — esta SÍ es fuente válida, léela como forma actual):',
    lineasEquipoTorneo(contexto.local),
    lineasEquipoTorneo(contexto.visitante),
  ];

  if (contexto.tabla && contexto.tabla.length > 0) {
    const filas = contexto.tabla
      .map((f, i) => {
        const dif = f.dif >= 0 ? `+${f.dif}` : `${f.dif}`;
        return `  ${i + 1}. ${f.nombre} — ${f.pts} pts (${f.pj} PJ, dif ${dif})`;
      })
      .join('\n');
    lineas.push(
      `Tabla del Grupo ${contexto.grupo} antes de este partido (orden aprox. por pts y dif. de gol):\n${filas}`
    );
  }

  return '\n' + lineas.join('\n') + '\n';
}

/** Una o varias líneas con el récord de un equipo y sus partidos jugados. */
function lineasEquipoTorneo(r: RecordEquipo): string {
  if (r.pj === 0) {
    return `${r.nombre}: aún sin partidos jugados en el torneo.`;
  }
  const cabecera = `${r.nombre} — ${r.pj} PJ: ${r.g}G ${r.e}E ${r.p}P, ${r.gf}:${r.gc}, ${r.pts} pts:`;
  const detalle = r.partidos
    .map((p) => {
      const verbo =
        p.resultado === 'G' ? 'venció' : p.resultado === 'E' ? 'empató' : 'perdió';
      const nexo = p.resultado === 'G' ? 'a' : 'con';
      // "de local/visita" es la condición NOMINAL del fixture, no localía real:
      // sólo orienta la lectura del marcador (goles a favor primero). En fase de
      // grupos es fiel; si en el futuro se cargan partidos de eliminación directa
      // (sede neutral), conviene matizar esta etiqueta para no sugerir ventaja
      // de campo inexistente. La sede real y el bonus de localía ya van aparte.
      const condicion = p.esLocal ? 'de local' : 'de visita';
      return `  · MD${p.matchday}: ${verbo} ${p.golesAFavor}-${p.golesEnContra} ${nexo} ${p.rivalNombre} (${condicion})`;
    })
    .join('\n');
  return `${cabecera}\n${detalle}`;
}
