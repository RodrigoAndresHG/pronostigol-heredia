import type { Prediccion, RegistroHistorial, Partido } from '../tipos';
import { calcularProbabilidadBase } from '../lib/modeloBase.js';
import { partidoPorId } from './partidos.js';

/**
 * Predicciones mock para los partidos destacados del Mundial 2026.
 *
 * Se muestran en la pantalla de detalle mientras no tenemos backend
 * (Fase 3). Cada una ilustra una situación distinta a propósito:
 *   - Inaugural (MEX vs RSA): CONSENSO claro, México favorito en casa.
 *   - CIV vs ECU (Grupo E):   DESACUERDO, partido parejo.
 *   - BRA vs MAR (Grupo C):   DESACUERDO + SEÑAL DE VALOR (Marruecos infravalorado).
 *   - ARG vs ALG (Grupo J):   CONSENSO, Argentina favorita amplia.
 *
 * Diseño: la `probabilidadBase` ya NO está hardcodeada. La calcula el
 * modelo en vivo (lib/modeloBase) al cargar el módulo. Las respuestas
 * de las IAs sí están hand-tuned porque ilustran opiniones distintas
 * sobre el mismo partido. Cuando entren los modelos reales en Fase 3,
 * estas respuestas mock se reemplazan con llamadas a /api/predecir.
 */

/**
 * Plantilla de predicción sin la `probabilidadBase` — esa la inyecta
 * el modelo abajo.
 */
type PrediccionSinBase = Omit<Prediccion, 'probabilidadBase'>;

const PREDICCIONES_RAW: PrediccionSinBase[] = [
  // ── Partido inaugural · México vs Sudáfrica · 11 jun · Azteca ─────
  {
    partidoId: 'A-MD1-1',
    timestampISO: '2026-06-10T12:00:00Z',
    respuestasIA: [
      {
        ia: 'Claude',
        probabilidad: { local: 0.60, empate: 0.25, visitante: 0.15 },
        confianza: 78,
        explicacion:
          'México llega como anfitrión en el Azteca, con afición y altitud a favor. Sudáfrica es competitiva pero su nivel reciente no alcanza para incomodar al local en su estadio histórico. Riesgo bajo de sorpresa.',
        marcadorEsperado: '2-0',
      },
      {
        ia: 'GPT',
        probabilidad: { local: 0.62, empate: 0.22, visitante: 0.16 },
        confianza: 80,
        explicacion:
          'Apertura de Mundial en el Azteca, con todos los focos sobre México. Históricamente los anfitriones rara vez pierden el inaugural. Sudáfrica defiende bien pero le cuesta producir en ataque.',
        marcadorEsperado: '2-1',
      },
      {
        ia: 'Gemini',
        probabilidad: { local: 0.55, empate: 0.27, visitante: 0.18 },
        confianza: 72,
        explicacion:
          'México favorito por diferencial de ranking (1635 vs 1550) y sede. Pero la presión del partido inaugural en Azteca puede pesar; el empate técnico no es absurdo si los Bafana Bafana aguantan los primeros 30 minutos.',
        marcadorEsperado: '1-1',
      },
    ],
    probabilidadFinal: { local: 0.59, empate: 0.25, visitante: 0.16 },
    veredicto: 'consenso',
    notaVeredicto:
      'Las tres IAs coinciden: México favorito claro en su estadio. La duda menor está en el margen — entre 55% y 62% de probabilidad de victoria local.',
    cuotaMercado: { local: 0.61, empate: 0.24, visitante: 0.15 },
  },

  // ── Brasil vs Marruecos · Grupo C, MD1 · 13 jun · Gillette ────────
  {
    partidoId: 'C-MD1-1',
    timestampISO: '2026-06-12T12:00:00Z',
    respuestasIA: [
      {
        ia: 'Claude',
        probabilidad: { local: 0.46, empate: 0.28, visitante: 0.26 },
        confianza: 70,
        explicacion:
          'Marruecos no es el rival del 2018. Mostró en Qatar 2022 (semifinal) que sabe plantarse contra potencias y su bloque defensivo sigue siendo de los mejores del mundo. Brasil favorito, pero el margen real es menor al que sugiere el ranking.',
        marcadorEsperado: '1-1',
      },
      {
        ia: 'GPT',
        probabilidad: { local: 0.58, empate: 0.24, visitante: 0.18 },
        confianza: 76,
        explicacion:
          'Brasil con plantel renovado y la mejor delantera del torneo en papel. Marruecos competitivo pero pierde diferencial cuando enfrenta a equipos que también juegan con tres centrales.',
        marcadorEsperado: '2-1',
      },
      {
        ia: 'Gemini',
        probabilidad: { local: 0.49, empate: 0.28, visitante: 0.23 },
        confianza: 68,
        explicacion:
          'Diferencial Elo (1810 vs 1695) marca a Brasil favorita, pero el factor "Marruecos plantea problemas físicos a sudamericanos" se ha repetido en 4 de los últimos 5 cruces de Marruecos vs CONMEBOL.',
        marcadorEsperado: '1-1',
      },
    ],
    probabilidadFinal: { local: 0.51, empate: 0.27, visitante: 0.22 },
    veredicto: 'desacuerdo',
    notaVeredicto:
      'GPT ve a Brasil claramente arriba (58%), Claude y Gemini lo ven mucho más parejo (46-49%). El desacuerdo está en cuánto pesa la "lección" del 2022 sobre Marruecos como aguafiestas.',
    cuotaMercado: { local: 0.62, empate: 0.23, visitante: 0.15 },
    senalValor: {
      direccion: 'visitante',
      delta: 7,
      explicacion:
        'El mercado le da a Marruecos sólo 15% de victoria, pero el consenso de las IAs lo pone en 22%. Diferencia de 7 puntos que sugiere que la cuota podría estar valorando demasiado el blasón brasileño y poco la solidez defensiva marroquí.',
    },
  },

  // ── Costa de Marfil vs Ecuador · Grupo E, MD1 · 14 jun · Filadelfia ─
  {
    partidoId: 'E-MD1-2',
    timestampISO: '2026-06-13T12:00:00Z',
    respuestasIA: [
      {
        ia: 'Claude',
        probabilidad: { local: 0.32, empate: 0.32, visitante: 0.36 },
        confianza: 60,
        explicacion:
          'Partido casi a moneda. Ecuador llega con un proceso largo bajo el mismo entrenador y físico para sostener intensidad; Costa de Marfil tiene más talento individual pero menos cohesión. Empate como escenario muy plausible.',
        marcadorEsperado: '1-1',
      },
      {
        ia: 'GPT',
        probabilidad: { local: 0.40, empate: 0.26, visitante: 0.34 },
        confianza: 65,
        explicacion:
          'Costa de Marfil con generación 2024 (campeona de África) en plenitud y mediocampo superior. Ecuador competitivo pero le falta el "10" que cambie partidos cerrados. Marfileños tienen el filo en ataque.',
        marcadorEsperado: '2-1',
      },
      {
        ia: 'Gemini',
        probabilidad: { local: 0.28, empate: 0.30, visitante: 0.42 },
        confianza: 70,
        explicacion:
          'Ecuador trae 6 partidos invicto en eliminatorias y un perfil táctico que históricamente complica a equipos africanos (ver Mundial 2022 vs Países Bajos, donde empató). La velocidad por bandas es un activo claro.',
        marcadorEsperado: '0-1',
      },
    ],
    probabilidadFinal: { local: 0.33, empate: 0.29, visitante: 0.38 },
    veredicto: 'desacuerdo',
    notaVeredicto:
      'Las tres IAs discrepan más sobre Ecuador que sobre Costa de Marfil. Gemini lo ve favorito (42%), GPT lo pone segundo detrás de los marfileños (34%), Claude lo ve casi parejo. Partido para ver con cuidado.',
    cuotaMercado: { local: 0.38, empate: 0.30, visitante: 0.32 },
    senalValor: {
      direccion: 'visitante',
      delta: 6,
      explicacion:
        'El mercado pone a Ecuador en 32% pero el consenso de las IAs lo eleva a 38%. La diferencia podría estar en que las casas pesan más el ranking puro y menos la solidez del proceso ecuatoriano de los últimos 18 meses.',
    },
  },

  // ── Argentina vs Argelia · Grupo J, MD1 · 16 jun · Arrowhead ──────
  {
    partidoId: 'J-MD1-1',
    timestampISO: '2026-06-15T12:00:00Z',
    respuestasIA: [
      {
        ia: 'Claude',
        probabilidad: { local: 0.72, empate: 0.20, visitante: 0.08 },
        confianza: 82,
        explicacion:
          'Argentina como vigente campeón, con base del 2022 intacta y recambio joven probado en eliminatorias. Argelia es físicamente fuerte pero le faltan jerarquías a la hora de generar gol. Difícil ver otro resultado que no sea triunfo argentino.',
        marcadorEsperado: '2-0',
      },
      {
        ia: 'GPT',
        probabilidad: { local: 0.74, empate: 0.16, visitante: 0.10 },
        confianza: 85,
        explicacion:
          'Diferencial Elo enorme (1885 vs 1510). Argentina probablemente rote algunos titulares pero mantiene plantel superior en todas las líneas. Argelia jugará a destruir y eso suele beneficiar al favorito en partidos largos.',
        marcadorEsperado: '3-0',
      },
      {
        ia: 'Gemini',
        probabilidad: { local: 0.70, empate: 0.20, visitante: 0.10 },
        confianza: 80,
        explicacion:
          'Argentina favorita amplia. El único asterisco: arranque de torneo con presión de defender el título, y Argelia hace 90 minutos competitivos. Pero el desenlace no debería estar en duda.',
        marcadorEsperado: '2-1',
      },
    ],
    probabilidadFinal: { local: 0.72, empate: 0.19, visitante: 0.09 },
    veredicto: 'consenso',
    notaVeredicto:
      'Consenso fuerte: Argentina favorita con probabilidad superior al 70% en las tres IAs. Confianza alta (80-85). El mercado coincide.',
    cuotaMercado: { local: 0.71, empate: 0.20, visitante: 0.09 },
  },
];

/**
 * Las predicciones finales con `probabilidadBase` ya calculada por el modelo.
 * Se construye una sola vez al cargar el módulo.
 */
export const PREDICCIONES: Record<string, Prediccion> = Object.fromEntries(
  PREDICCIONES_RAW.map((raw): [string, Prediccion] => {
    const partido = partidoPorId(raw.partidoId);
    if (!partido) {
      throw new Error(
        `Predicción mock referencia un partido inexistente: ${raw.partidoId}`
      );
    }
    const { probabilidad } = calcularProbabilidadBase(partido);
    return [raw.partidoId, { ...raw, probabilidadBase: probabilidad }];
  })
);

/**
 * Devuelve la predicción mock para un partido, o null si no existe.
 */
export function prediccionPara(partidoId: string): Prediccion | null {
  return PREDICCIONES[partidoId] ?? null;
}

// ─── Historial mock ──────────────────────────────────────────────────

/**
 * 6 amistosos de mayo de 2026 con predicciones previas y resultados
 * reales. Mezcla aciertos y fallos a propósito — la transparencia es
 * el producto. Todos los equipos están en el Mundial 2026.
 */

const partidoAmistoso = (
  id: string,
  fechaISO: string,
  equipoLocalId: string,
  equipoVisitanteId: string,
  golesLocal: number,
  golesVisitante: number
): Partido => ({
  id,
  fechaISO,
  sede: 'Amistoso',
  paisAnfitrion: 'Estados Unidos',
  equipoLocalId,
  equipoVisitanteId,
  fase: 'grupos',
  estado: 'finalizado',
  golesLocal,
  golesVisitante,
});

export const HISTORIAL: RegistroHistorial[] = [
  {
    partido: partidoAmistoso('AM-1', '2026-05-14T22:00:00Z', 'ARG', 'ECU', 2, 1),
    prediccion: {
      partidoId: 'AM-1',
      timestampISO: '2026-05-13T20:00:00Z',
      probabilidadBase: { local: 0.62, empate: 0.22, visitante: 0.16 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.58, empate: 0.24, visitante: 0.18 },
      veredicto: 'consenso',
      notaVeredicto: 'Las 3 IAs coincidieron en favoritismo argentino.',
    },
    resultadoPredicho: 'local',
    resultadoReal: 'local',
    acerto: true,
  },
  {
    partido: partidoAmistoso('AM-2', '2026-05-15T01:00:00Z', 'BRA', 'PAR', 3, 0),
    prediccion: {
      partidoId: 'AM-2',
      timestampISO: '2026-05-13T20:00:00Z',
      probabilidadBase: { local: 0.62, empate: 0.20, visitante: 0.18 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.65, empate: 0.20, visitante: 0.15 },
      veredicto: 'consenso',
      notaVeredicto: 'Brasil favorita por amplio margen contra una Paraguay en reconstrucción.',
    },
    resultadoPredicho: 'local',
    resultadoReal: 'local',
    acerto: true,
  },
  {
    partido: partidoAmistoso('AM-3', '2026-05-17T23:00:00Z', 'USA', 'MEX', 1, 1),
    prediccion: {
      partidoId: 'AM-3',
      timestampISO: '2026-05-16T20:00:00Z',
      probabilidadBase: { local: 0.40, empate: 0.28, visitante: 0.32 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.42, empate: 0.26, visitante: 0.32 },
      veredicto: 'desacuerdo',
      notaVeredicto:
        'Claude veía favorita a USA, GPT y Gemini lo veían más parejo. Ninguna acertó el empate.',
    },
    resultadoPredicho: 'local',
    resultadoReal: 'empate',
    acerto: false,
  },
  {
    partido: partidoAmistoso('AM-4', '2026-05-19T19:00:00Z', 'ENG', 'CRO', 2, 2),
    prediccion: {
      partidoId: 'AM-4',
      timestampISO: '2026-05-18T20:00:00Z',
      probabilidadBase: { local: 0.50, empate: 0.28, visitante: 0.22 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.30, empate: 0.40, visitante: 0.30 },
      veredicto: 'desacuerdo',
      notaVeredicto:
        'Claude apostó por el empate (acertó); GPT y Gemini se fueron por Inglaterra (fallaron).',
    },
    resultadoPredicho: 'empate',
    resultadoReal: 'empate',
    acerto: true,
  },
  {
    partido: partidoAmistoso('AM-5', '2026-05-21T20:00:00Z', 'ESP', 'JPN', 1, 2),
    prediccion: {
      partidoId: 'AM-5',
      timestampISO: '2026-05-20T20:00:00Z',
      probabilidadBase: { local: 0.62, empate: 0.22, visitante: 0.16 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.58, empate: 0.24, visitante: 0.18 },
      veredicto: 'consenso',
      notaVeredicto:
        'Las 3 IAs vieron a España favorita amplia y se equivocaron — fallo limpio de consenso.',
    },
    resultadoPredicho: 'local',
    resultadoReal: 'visitante',
    acerto: false,
  },
  {
    partido: partidoAmistoso('AM-6', '2026-05-23T22:00:00Z', 'FRA', 'POR', 1, 0),
    prediccion: {
      partidoId: 'AM-6',
      timestampISO: '2026-05-22T20:00:00Z',
      probabilidadBase: { local: 0.44, empate: 0.28, visitante: 0.28 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.46, empate: 0.27, visitante: 0.27 },
      veredicto: 'desacuerdo',
      notaVeredicto: 'Las IAs vieron a Francia ligeramente favorita; acertó.',
    },
    resultadoPredicho: 'local',
    resultadoReal: 'local',
    acerto: true,
  },
];

/**
 * Métricas agregadas sobre el historial — se muestran en el header de la página.
 */
export function metricasHistorial(historial: RegistroHistorial[] = HISTORIAL) {
  const total = historial.length;
  const aciertos = historial.filter((registro) => registro.acerto).length;
  return {
    total,
    aciertos,
    fallos: total - aciertos,
    tasaAcierto: total === 0 ? 0 : aciertos / total,
  };
}
