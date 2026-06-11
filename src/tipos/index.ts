/**
 * Tipos centrales de la app.
 *
 * Esta es la fuente única de verdad para las formas de datos.
 * Las APIs externas (football-data.org, The Odds API) y la BD
 * (Supabase) deben mapearse hacia estos tipos en los adaptadores
 * correspondientes, no al revés.
 */

// ─── Equipos y grupos ────────────────────────────────────────────────

export type Confederacion =
  | 'UEFA'
  | 'CONMEBOL'
  | 'CONCACAF'
  | 'AFC'
  | 'CAF'
  | 'OFC';

export type LetraGrupo =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Equipo {
  /** Código ISO 3166-1 alpha-3, p. ej. "ARG", "ECU". Sirve también como ID. */
  id: string;
  /** Nombre en español, p. ej. "Argentina", "Países Bajos". */
  nombre: string;
  confederacion: Confederacion;
  /** Rating tipo Elo aproximado (1500-2200). Se usa en el modelo base (Fase 2). */
  rating: number;
  grupo: LetraGrupo;
  /** Emoji de la bandera. Funciona en macOS/iOS/Android sin assets adicionales. */
  banderaEmoji: string;
}

// ─── Partidos ────────────────────────────────────────────────────────

export type FasePartido =
  | 'grupos'
  | 'r32'
  | 'octavos'
  | 'cuartos'
  | 'semifinal'
  | 'tercer_puesto'
  | 'final';

export type EstadoPartido = 'programado' | 'enJuego' | 'finalizado';

export interface Partido {
  id: string;
  /** Fecha y hora en ISO 8601 UTC. La conversión a zona local se hace en la UI. */
  fechaISO: string;
  sede: string;
  paisAnfitrion: 'México' | 'Estados Unidos' | 'Canadá';
  equipoLocalId: string;
  equipoVisitanteId: string;
  fase: FasePartido;
  /** Sólo presente si fase === 'grupos'. */
  grupo?: LetraGrupo;
  estado: EstadoPartido;
  /** Sólo presentes si estado === 'finalizado'. */
  golesLocal?: number;
  golesVisitante?: number;
}

// ─── Predicciones ────────────────────────────────────────────────────

/** Las 3 IAs que consultamos en paralelo. */
export type NombreIA = 'Claude' | 'GPT' | 'Gemini';

/** Una distribución de probabilidad sobre los 3 resultados posibles. */
export interface DistribucionResultado {
  /** Probabilidad de victoria del equipo local. 0..1 */
  local: number;
  /** Probabilidad de empate. 0..1 */
  empate: number;
  /** Probabilidad de victoria del equipo visitante. 0..1 */
  visitante: number;
}

export interface RespuestaIA {
  ia: NombreIA;
  /** La IA emitió su propio juicio probabilístico. */
  probabilidad: DistribucionResultado;
  /** Confianza autoreportada por la IA, 0..100. */
  confianza: number;
  /** Explicación corta — máximo 3 frases. */
  explicacion: string;
  /** Marcador esperado opcional, p. ej. "2-1". */
  marcadorEsperado?: string;
  /** Si la llamada a la IA falló, aquí va el motivo. La UI lo muestra explícitamente. */
  error?: string;
}

/** Veredicto sintetizado de las 3 IAs. */
export type Veredicto = 'consenso' | 'desacuerdo';

/**
 * Hechos verificados de un equipo a una fecha concreta — el "anclaje"
 * que reciben las IAs para que NO inventen contexto desde su memoria
 * de entrenamiento (que tiene fecha de corte). Cada dato es público y
 * auditable. Esto es lo que mata alucinaciones como "DT: Sánchez Bas".
 */
export interface DossierEquipo {
  /** Director técnico ACTUAL. El dato que más se desactualiza. */
  dt: string;
  /** Desde cuándo dirige, p. ej. "ago 2024". */
  dtDesde?: string;
  /** Jugador figura/referente. */
  estrella?: string;
  /** Forma reciente / cómo clasificó, en una frase. */
  formaReciente?: string;
  /** Narrativa del torneo, en una frase (debutante, campeón AFCON 2024…). */
  notaTorneo?: string;
  /** Confianza de la verificación con fuentes. */
  confianza: 'alta' | 'media' | 'baja';
}

/** Dossier de un partido: los hechos de ambos equipos + fecha de captura. */
export interface HechosPartido {
  local: DossierEquipo;
  visitante: DossierEquipo;
  /** Fecha (YYYY-MM-DD) del dataset de hechos. Se muestra al usuario. */
  capturadoEl: string;
}

export interface SenalValor {
  direccion: 'local' | 'empate' | 'visitante';
  /** Diferencia entre prob. final y prob. implícita del mercado, en puntos porcentuales. */
  delta: number;
  explicacion: string;
}

export interface Prediccion {
  partidoId: string;
  /** Timestamp ISO UTC en que se generó. SIEMPRE antes del partido. */
  timestampISO: string;
  /** Probabilidad de la Capa 1 (modelo estadístico simple). */
  probabilidadBase: DistribucionResultado;
  /** Respuestas de las 3 IAs. Si alguna falló, sigue apareciendo aquí con `error`. */
  respuestasIA: RespuestaIA[];
  /** Probabilidad final ponderada (Capa 2 sintetizada con la Capa 1). */
  probabilidadFinal: DistribucionResultado;
  veredicto: Veredicto;
  /** Nota corta que explica el veredicto a humanos. */
  notaVeredicto: string;
  /** Probabilidad implícita derivada de las cuotas del mercado, si la tenemos. */
  cuotaMercado?: DistribucionResultado;
  /** Si hay diferencia significativa con el mercado, se llena. */
  senalValor?: SenalValor;
  /**
   * Hechos verificados que recibieron las IAs al generar esta predicción.
   * Se guarda en el payload para auditoría: prueba con qué datos razonaron.
   * Ausente en predicciones antiguas (anteriores al anclaje de datos).
   */
  dossier?: HechosPartido;
}

// ─── Accountability (Fase 9): boletín, calibración, autopsia ─────────

/** Quién razonó: cada IA, el consenso sintetizado, o el modelo base. */
export type Actor = NombreIA | 'Consenso' | 'Modelo base';

/** Fila del Boletín de Calibración: el track-record de un actor. */
export interface BoletinActor {
  actor: Actor;
  /** Brier promedio sobre los partidos calificados. MENOR es mejor. */
  brierPromedio: number;
  aciertos: number;
  total: number;
  /** aciertos / total, 0..1. */
  tasaAcierto: number;
}

/** Una cubeta de la curva de calibración de confianza. */
export interface CubetaCalibracion {
  /** Rango de confianza declarada, p. ej. "70-80". */
  rango: string;
  n: number;
  /** Confianza declarada promedio en la cubeta, 0..100. */
  confianzaPromedio: number;
  /** Acierto real observado en la cubeta, 0..100. */
  tasaAciertoReal: number;
}

/** Resumen calificado de un partido ya jugado (para el Historial). */
export interface PartidoCalificado {
  partidoId: string;
  golesLocal: number;
  golesVisitante: number;
  resultadoReal: 'local' | 'empate' | 'visitante';
  veredicto: Veredicto;
  /** ¿El consenso de las IAs acertó el resultado? */
  consensoAcerto: boolean;
}

/** Respuesta del endpoint /api/historial. */
export interface HistorialResponse {
  partidosCalificados: number;
  /** Ordenado por Brier ascendente (el mejor primero). */
  boletin: BoletinActor[];
  calibracion: CubetaCalibracion[];
  registros: PartidoCalificado[];
}

// ─── Historial ───────────────────────────────────────────────────────

/**
 * Registro de un partido pasado con su predicción y su resultado real.
 * Se usa para calcular tasa de acierto.
 */
export interface RegistroHistorial {
  partido: Partido;
  prediccion: Prediccion;
  /** El resultado al que apuntaba la prob. más alta de la predicción. */
  resultadoPredicho: 'local' | 'empate' | 'visitante';
  /** El resultado real. */
  resultadoReal: 'local' | 'empate' | 'visitante';
  acerto: boolean;
}
