import type { DistribucionResultado, Equipo, Partido } from '../tipos';
import { equipoPorId } from '../datos/equipos.ts';

/**
 * Modelo base de probabilidad (Capa 1).
 *
 * El propósito es producir una distribución de probabilidad
 * { local, empate, visitante } usando SÓLO factores objetivos y
 * explicables, sin opinión cualitativa. Las IAs (Capa 2) tomarán
 * esta salida como punto de partida y la ajustarán con contexto.
 *
 * Factores que entran:
 *   1. Diferencia de rating tipo Elo entre los dos equipos.
 *   2. Ventaja de sede:
 *        - Anfitrión jugando en su país      → +120 Elo
 *        - Cualquier otro "local" del partido → +20 Elo
 *   3. Forma reciente (−1..+1, opcional)    → ±40 Elo cuando = ±1
 *   4. Días de descanso (penaliza <4 días)  → −15 Elo por día corto
 *
 * Cómo se traducen a probabilidades:
 *   - Diferencia efectiva d = rating_local_efectivo − rating_visitante_efectivo
 *   - Expected del local (estilo Elo): E = 1 / (1 + 10^(−d/400))
 *   - Probabilidad de empate: decrece con |d|.
 *       P(empate) = empate_base · exp(−|d| / decay)
 *   - El resto se reparte entre local y visitante según E.
 *
 * Los parámetros (constantes abajo) son aproximaciones razonables
 * para fútbol internacional. En Fase 4, cuando tengamos resultados
 * históricos del Mundial 2022/2018 fáciles de cargar, podemos
 * calibrarlos con datos reales.
 */

// ─── Parámetros del modelo ───────────────────────────────────────────

/** Bonus de Elo por jugar en el país anfitrión propio (MEX, USA, CAN). */
const BONUS_ANFITRION = 120;
/** Bonus nominal para el equipo designado como "local" cuando no es anfitrión. */
const BONUS_LOCAL_NOMINAL = 20;
/** Cuánto pesa la forma reciente (−1..+1) en Elo. */
const PESO_FORMA = 40;
/** Penalización por cada día de descanso por debajo del umbral. */
const PENALIZACION_DESCANSO = 15;
/** Umbral de descanso "normal" (días). */
const UMBRAL_DESCANSO = 4;
/** Probabilidad de empate cuando los equipos están perfectamente parejos. */
const EMPATE_BASE = 0.28;
/**
 * Velocidad a la que cae la probabilidad de empate al crecer la diferencia
 * de Elo. Valores típicos:
 *   d = 0   → P(emp) = 0.28
 *   d = 100 → P(emp) ≈ 0.18
 *   d = 200 → P(emp) ≈ 0.12
 *   d = 400 → P(emp) ≈ 0.05
 */
const DECAY_EMPATE = 250;

// ─── API pública ─────────────────────────────────────────────────────

export interface FactoresEntrada {
  /** Forma del local, escala −1..+1. Por defecto 0 (neutral). */
  formaLocal?: number;
  /** Forma del visitante, escala −1..+1. Por defecto 0. */
  formaVisitante?: number;
  /** Días de descanso del local antes del partido. Por defecto 5. */
  diasDescansoLocal?: number;
  /** Días de descanso del visitante antes del partido. Por defecto 5. */
  diasDescansoVisitante?: number;
}

/**
 * Desglose detallado del cálculo. Se devuelve junto con la probabilidad
 * para que la UI pueda explicar al usuario CÓMO se llegó al número.
 */
export interface DesgloseModelo {
  ratingLocal: number;
  ratingVisitante: number;
  bonusSedeLocal: number;
  ajusteFormaLocal: number;
  ajusteFormaVisitante: number;
  ajusteDescansoLocal: number;
  ajusteDescansoVisitante: number;
  ratingLocalEfectivo: number;
  ratingVisitanteEfectivo: number;
  diferenciaElo: number;
  /** Expected score Elo del local (0..1). Punto medio = 0.5. */
  expectedLocal: number;
  /** Probabilidad de empate antes de redistribuir. */
  probEmpate: number;
}

export interface ResultadoModelo {
  probabilidad: DistribucionResultado;
  desglose: DesgloseModelo;
}

/**
 * Calcula la probabilidad base de un partido a partir del equipo y los
 * factores opcionales. Lanza si los IDs de equipo del partido no existen.
 */
export function calcularProbabilidadBase(
  partido: Partido,
  factores: FactoresEntrada = {}
): ResultadoModelo {
  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);

  const bonusSedeLocal = calcularBonusSede(local, partido);

  const formaLocal = clamp(factores.formaLocal ?? 0, -1, 1);
  const formaVisitante = clamp(factores.formaVisitante ?? 0, -1, 1);
  const ajusteFormaLocal = formaLocal * PESO_FORMA;
  const ajusteFormaVisitante = formaVisitante * PESO_FORMA;

  const ajusteDescansoLocal = calcularAjusteDescanso(factores.diasDescansoLocal);
  const ajusteDescansoVisitante = calcularAjusteDescanso(factores.diasDescansoVisitante);

  const ratingLocalEfectivo =
    local.rating + bonusSedeLocal + ajusteFormaLocal + ajusteDescansoLocal;
  const ratingVisitanteEfectivo =
    visitante.rating + ajusteFormaVisitante + ajusteDescansoVisitante;

  const diferenciaElo = ratingLocalEfectivo - ratingVisitanteEfectivo;

  // Expected score estilo Elo. Vive en (0, 1).
  const expectedLocal = 1 / (1 + Math.pow(10, -diferenciaElo / 400));

  // Empate: parte de la base y decae exponencialmente con |d|.
  const probEmpate =
    EMPATE_BASE * Math.exp(-Math.abs(diferenciaElo) / DECAY_EMPATE);

  // El resto se reparte entre local y visitante según el expected.
  const restante = 1 - probEmpate;
  const probLocal = restante * expectedLocal;
  const probVisitante = restante * (1 - expectedLocal);

  return {
    probabilidad: {
      local: probLocal,
      empate: probEmpate,
      visitante: probVisitante,
    },
    desglose: {
      ratingLocal: local.rating,
      ratingVisitante: visitante.rating,
      bonusSedeLocal,
      ajusteFormaLocal,
      ajusteFormaVisitante,
      ajusteDescansoLocal,
      ajusteDescansoVisitante,
      ratingLocalEfectivo,
      ratingVisitanteEfectivo,
      diferenciaElo,
      expectedLocal,
      probEmpate,
    },
  };
}

// ─── Helpers internos ────────────────────────────────────────────────

/**
 * El equipo local sólo recibe el bonus grande si está jugando en su
 * propio país anfitrión. En el resto de los partidos hay un bonus
 * nominal pequeño que captura el efecto vestidor/coin-toss/etc.
 */
function calcularBonusSede(local: Equipo, partido: Partido): number {
  const esAnfitrionEnCasa =
    (local.id === 'MEX' && partido.paisAnfitrion === 'México') ||
    (local.id === 'USA' && partido.paisAnfitrion === 'Estados Unidos') ||
    (local.id === 'CAN' && partido.paisAnfitrion === 'Canadá');
  return esAnfitrionEnCasa ? BONUS_ANFITRION : BONUS_LOCAL_NOMINAL;
}

/**
 * Devuelve ajuste de Elo por descanso. Sólo penaliza (nunca premia)
 * descanso por debajo del umbral. Si los días son ≥ umbral, devuelve 0.
 */
function calcularAjusteDescanso(diasDescanso?: number): number {
  const dias = diasDescanso ?? 5;
  if (dias >= UMBRAL_DESCANSO) return 0;
  return (dias - UMBRAL_DESCANSO) * PENALIZACION_DESCANSO;
}

function clamp(valor: number, minimo: number, maximo: number): number {
  return Math.max(minimo, Math.min(maximo, valor));
}
