import type { Prediccion, RegistroHistorial, Partido } from '../tipos';

/**
 * Predicciones mock para algunos partidos destacados.
 *
 * Estas son las que se muestran en la pantalla de detalle mientras
 * no tenemos backend (Fase 3). Cada predicción ilustra una situación
 * distinta a propósito:
 *   - Inaugural (MEX vs CRO): DESACUERDO marcado entre las 3 IAs.
 *   - Ecuador vs Bélgica:     CONSENSO, mercado y IAs alineados.
 *   - Argentina vs Países Bajos: DESACUERDO leve en magnitud.
 *
 * Para los partidos sin predicción aquí, la UI muestra "predicción
 * pendiente" en lugar de inventar números.
 */

export const PREDICCIONES: Record<string, Prediccion> = {
  // ── Partido inaugural: México vs Croacia ──────────────────────────
  'MD1-A-1': {
    partidoId: 'MD1-A-1',
    timestampISO: '2026-06-10T12:00:00Z',
    probabilidadBase: { local: 0.35, empate: 0.28, visitante: 0.37 },
    respuestasIA: [
      {
        ia: 'Claude',
        probabilidad: { local: 0.32, empate: 0.30, visitante: 0.38 },
        confianza: 65,
        explicacion:
          'Croacia tiene mejor calidad individual pero el factor sede en el Azteca es enorme. Espero un partido cerrado donde la altitud penalice a Croacia en los últimos 20 minutos. Riesgo real de empate.',
        marcadorEsperado: '1-1',
      },
      {
        ia: 'GPT',
        probabilidad: { local: 0.38, empate: 0.24, visitante: 0.38 },
        confianza: 70,
        explicacion:
          'México llega con confianza tras un ciclo regular bajo su nuevo DT. Croacia es veterana pero con piernas justas en mediocampo. El empate es menos probable de lo que parece.',
        marcadorEsperado: '2-1',
      },
      {
        ia: 'Gemini',
        probabilidad: { local: 0.30, empate: 0.26, visitante: 0.44 },
        confianza: 75,
        explicacion:
          'El diferencial de ranking favorece a Croacia. Su volumen de juego central debería imponerse al desorden defensivo mexicano evidenciado en sus últimos amistosos.',
        marcadorEsperado: '1-2',
      },
    ],
    probabilidadFinal: { local: 0.33, empate: 0.27, visitante: 0.40 },
    veredicto: 'desacuerdo',
    notaVeredicto:
      'Gemini ve a Croacia clara favorita; Claude y GPT lo ven prácticamente abierto. La fuente del desacuerdo es cuánto pesa el factor sede frente al ranking puro.',
    cuotaMercado: { local: 0.33, empate: 0.27, visitante: 0.40 },
    // Mercado y consenso coinciden — no hay señal clara.
  },

  // ── Bélgica vs Ecuador (Grupo B, MD2) ─────────────────────────────
  // Bélgica es local en este encuentro según la rotación del grupo.
  'MD2-B-2': {
    partidoId: 'MD2-B-2',
    timestampISO: '2026-06-16T12:00:00Z',
    probabilidadBase: { local: 0.53, empate: 0.25, visitante: 0.22 },
    respuestasIA: [
      {
        ia: 'Claude',
        probabilidad: { local: 0.54, empate: 0.28, visitante: 0.18 },
        confianza: 70,
        explicacion:
          'Bélgica tiene el plantel más profundo pero su generación dorada ya cerró ciclo. Ecuador puede sacar empate aprovechando su físico, pero la victoria parece lejana sin un partido extraordinario.',
        marcadorEsperado: '2-0',
      },
      {
        ia: 'GPT',
        probabilidad: { local: 0.56, empate: 0.24, visitante: 0.20 },
        confianza: 68,
        explicacion:
          'El diferencial técnico es claro. Sin embargo, Ecuador ya mostró en el Mundial 2022 contra Países Bajos que sabe plantarse contra rivales europeos fuertes. El precio del pesimismo extremo es alto.',
        marcadorEsperado: '2-1',
      },
      {
        ia: 'Gemini',
        probabilidad: { local: 0.52, empate: 0.26, visitante: 0.22 },
        confianza: 72,
        explicacion:
          'Bélgica favorita por jerarquía, Ecuador competitivo. El partido se define en transiciones; la velocidad ecuatoriana es un activo real frente a una defensa belga lenta en retroceso.',
        marcadorEsperado: '2-1',
      },
    ],
    probabilidadFinal: { local: 0.54, empate: 0.26, visitante: 0.20 },
    veredicto: 'consenso',
    notaVeredicto:
      'Las tres IAs coinciden: Bélgica favorita por amplio margen, Ecuador con vida pero sin la victoria como escenario probable. La probabilidad final está alineada con el mercado.',
    cuotaMercado: { local: 0.54, empate: 0.25, visitante: 0.21 },
  },

  // ── Argentina vs Países Bajos (Grupo D, MD1) ──────────────────────
  'MD1-D-1': {
    partidoId: 'MD1-D-1',
    timestampISO: '2026-06-11T12:00:00Z',
    probabilidadBase: { local: 0.42, empate: 0.28, visitante: 0.30 },
    respuestasIA: [
      {
        ia: 'Claude',
        probabilidad: { local: 0.44, empate: 0.30, visitante: 0.26 },
        confianza: 60,
        explicacion:
          'Argentina mantiene base campeona del 2022 pero el peso emocional de la era post-Messi influye en la mentalidad colectiva. Países Bajos siempre incomoda a Argentina; los últimos 5 partidos directos lo confirman.',
        marcadorEsperado: '2-1',
      },
      {
        ia: 'GPT',
        probabilidad: { local: 0.48, empate: 0.24, visitante: 0.28 },
        confianza: 75,
        explicacion:
          'Argentina más fuerte en mediocampo y delantera, con recambio generacional consolidado. Países Bajos depende mucho de Gakpo y Frenkie de Jong; si los neutralizan, hay diferencia clara.',
        marcadorEsperado: '2-0',
      },
      {
        ia: 'Gemini',
        probabilidad: { local: 0.38, empate: 0.30, visitante: 0.32 },
        confianza: 65,
        explicacion:
          'Históricamente parejos: los últimos 5 cara a cara incluyen los penales del 2022. La estadística predice partido cerrado donde el empate al 90\' es plausible.',
        marcadorEsperado: '1-1',
      },
    ],
    probabilidadFinal: { local: 0.43, empate: 0.28, visitante: 0.29 },
    veredicto: 'desacuerdo',
    notaVeredicto:
      'Las tres IAs coinciden en que Argentina es favorita, pero discrepan en la magnitud: GPT muy convencido (48%), Gemini casi paridad (38% vs 32%). El desacuerdo está en cuánta ventaja le da cada modelo al plantel albiceleste.',
    cuotaMercado: { local: 0.50, empate: 0.26, visitante: 0.24 },
    senalValor: {
      direccion: 'visitante',
      delta: 5,
      explicacion:
        'El mercado le da a Argentina un 50% de victoria, pero el consenso de las IAs la pone en 43%. Países Bajos a +5 puntos vs mercado podría tener valor.',
    },
  },
};

/**
 * Devuelve la predicción mock para un partido, o null si no existe.
 */
export function prediccionPara(partidoId: string): Prediccion | null {
  return PREDICCIONES[partidoId] ?? null;
}

// ─── Historial mock ──────────────────────────────────────────────────

/**
 * 6 amistosos jugados en mayo de 2026 con predicciones previas y resultados
 * reales. Mezcla aciertos y fallos a propósito — la transparencia es el producto.
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
    partido: partidoAmistoso('AM-2', '2026-05-15T01:00:00Z', 'BRA', 'SEN', 3, 0),
    prediccion: {
      partidoId: 'AM-2',
      timestampISO: '2026-05-13T20:00:00Z',
      probabilidadBase: { local: 0.55, empate: 0.25, visitante: 0.20 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.60, empate: 0.22, visitante: 0.18 },
      veredicto: 'consenso',
      notaVeredicto: 'Brasil favorita por amplio margen.',
    },
    resultadoPredicho: 'local',
    resultadoReal: 'local',
    acerto: true,
  },
  {
    partido: partidoAmistoso('AM-3', '2026-05-17T23:00:00Z', 'MEX', 'USA', 1, 1),
    prediccion: {
      partidoId: 'AM-3',
      timestampISO: '2026-05-16T20:00:00Z',
      probabilidadBase: { local: 0.40, empate: 0.28, visitante: 0.32 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.42, empate: 0.26, visitante: 0.32 },
      veredicto: 'desacuerdo',
      notaVeredicto:
        'Claude veía favorito local, GPT y Gemini lo veían más parejo. Ninguna acertó el empate.',
    },
    resultadoPredicho: 'local',
    resultadoReal: 'empate',
    acerto: false,
  },
  {
    partido: partidoAmistoso('AM-4', '2026-05-19T19:00:00Z', 'CRO', 'ITA', 2, 2),
    prediccion: {
      partidoId: 'AM-4',
      timestampISO: '2026-05-18T20:00:00Z',
      probabilidadBase: { local: 0.36, empate: 0.30, visitante: 0.34 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.30, empate: 0.34, visitante: 0.36 },
      veredicto: 'desacuerdo',
      notaVeredicto:
        'Claude apostó por el empate (acertó); GPT y Gemini se fueron por Italia (fallaron).',
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
      probabilidadBase: { local: 0.58, empate: 0.24, visitante: 0.18 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.55, empate: 0.25, visitante: 0.20 },
      veredicto: 'consenso',
      notaVeredicto:
        'Las 3 IAs vieron a España favorita y se equivocaron — fallo limpio de consenso.',
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
      probabilidadBase: { local: 0.42, empate: 0.28, visitante: 0.30 },
      respuestasIA: [],
      probabilidadFinal: { local: 0.45, empate: 0.27, visitante: 0.28 },
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
