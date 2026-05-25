import type { Partido, LetraGrupo, FasePartido } from '../tipos';

/**
 * Calendario oficial de la fase de grupos del Mundial 2026.
 *
 * Fuente: Wikipedia EN, una página por grupo (`2026_FIFA_World_Cup_Group_X`).
 * Cruzado con prensa ecuatoriana para el Grupo E. Todas las horas vienen
 * en UTC ISO 8601, calculadas a partir de la hora local de cada sede
 * (CDMX/Zapopan/Monterrey = UTC-6 año redondo; resto en horario de
 * verano de junio: EDT = UTC-4, CDT = UTC-5, PDT = UTC-7).
 *
 * Estructura del ID:
 *   GRUPO-MDx-N   donde N ∈ {1, 2} es el orden dentro del matchday del grupo.
 *   Ejemplos: A-MD1-1, E-MD3-2.
 *
 * Si en Fase 4 cargamos datos de football-data.org y detectamos
 * discrepancias, los reemplazamos automáticamente desde ese feed.
 */

type FixtureCrudo = {
  grupo: LetraGrupo;
  matchday: 1 | 2 | 3;
  ordenEnMD: 1 | 2;
  /** Timestamp ISO 8601 UTC del kickoff. */
  kickoffUTC: string;
  local: string;
  visitante: string;
  sede: string;
  paisAnfitrion: 'México' | 'Estados Unidos' | 'Canadá';
};

const FIXTURES: FixtureCrudo[] = [
  // ── Grupo A · México (anfitrión) ──────────────────────────────────
  { grupo: 'A', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-11T19:00:00Z', local: 'MEX', visitante: 'RSA', sede: 'Estadio Azteca, CDMX',          paisAnfitrion: 'México' },          // 1pm CDMX
  { grupo: 'A', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-12T02:00:00Z', local: 'KOR', visitante: 'CZE', sede: 'Estadio Akron, Guadalajara',    paisAnfitrion: 'México' },          // 8pm Zapopan
  { grupo: 'A', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-18T16:00:00Z', local: 'CZE', visitante: 'RSA', sede: 'Mercedes-Benz, Atlanta',        paisAnfitrion: 'Estados Unidos' },  // 12pm EDT
  { grupo: 'A', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-19T01:00:00Z', local: 'MEX', visitante: 'KOR', sede: 'Estadio Akron, Guadalajara',    paisAnfitrion: 'México' },          // 7pm Zapopan
  { grupo: 'A', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-25T01:00:00Z', local: 'CZE', visitante: 'MEX', sede: 'Estadio Azteca, CDMX',          paisAnfitrion: 'México' },          // 7pm CDMX
  { grupo: 'A', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-25T01:00:00Z', local: 'RSA', visitante: 'KOR', sede: 'Estadio BBVA, Monterrey',       paisAnfitrion: 'México' },          // 7pm Monterrey

  // ── Grupo B · Canadá (anfitrión) ──────────────────────────────────
  { grupo: 'B', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-12T19:00:00Z', local: 'CAN', visitante: 'BIH', sede: 'BMO Field, Toronto',            paisAnfitrion: 'Canadá' },          // 3pm EDT
  { grupo: 'B', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-13T19:00:00Z', local: 'QAT', visitante: 'SUI', sede: "Levi's Stadium, San Francisco", paisAnfitrion: 'Estados Unidos' },  // 12pm PDT
  { grupo: 'B', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-18T19:00:00Z', local: 'SUI', visitante: 'BIH', sede: 'SoFi Stadium, Los Ángeles',     paisAnfitrion: 'Estados Unidos' },  // 12pm PDT
  { grupo: 'B', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-18T22:00:00Z', local: 'CAN', visitante: 'QAT', sede: 'BC Place, Vancouver',           paisAnfitrion: 'Canadá' },          // 3pm PDT
  { grupo: 'B', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-24T19:00:00Z', local: 'SUI', visitante: 'CAN', sede: 'BC Place, Vancouver',           paisAnfitrion: 'Canadá' },          // 12pm PDT
  { grupo: 'B', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-24T19:00:00Z', local: 'BIH', visitante: 'QAT', sede: 'Lumen Field, Seattle',          paisAnfitrion: 'Estados Unidos' },  // 12pm PDT

  // ── Grupo C ───────────────────────────────────────────────────────
  { grupo: 'C', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-13T22:00:00Z', local: 'BRA', visitante: 'MAR', sede: 'MetLife Stadium, Nueva York',   paisAnfitrion: 'Estados Unidos' },  // 6pm EDT
  { grupo: 'C', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-14T01:00:00Z', local: 'HAI', visitante: 'SCO', sede: 'Gillette Stadium, Boston',      paisAnfitrion: 'Estados Unidos' },  // 9pm EDT
  { grupo: 'C', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-19T22:00:00Z', local: 'SCO', visitante: 'MAR', sede: 'Gillette Stadium, Boston',      paisAnfitrion: 'Estados Unidos' },  // 6pm EDT
  { grupo: 'C', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-20T00:30:00Z', local: 'BRA', visitante: 'HAI', sede: 'Lincoln Financial, Filadelfia', paisAnfitrion: 'Estados Unidos' },  // 8:30pm EDT
  { grupo: 'C', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-24T22:00:00Z', local: 'SCO', visitante: 'BRA', sede: 'Hard Rock Stadium, Miami',      paisAnfitrion: 'Estados Unidos' },  // 6pm EDT
  { grupo: 'C', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-24T22:00:00Z', local: 'MAR', visitante: 'HAI', sede: 'Mercedes-Benz, Atlanta',        paisAnfitrion: 'Estados Unidos' },  // 6pm EDT

  // ── Grupo D · Estados Unidos (anfitrión) ──────────────────────────
  { grupo: 'D', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-13T01:00:00Z', local: 'USA', visitante: 'PAR', sede: 'SoFi Stadium, Los Ángeles',     paisAnfitrion: 'Estados Unidos' },  // 6pm PDT
  { grupo: 'D', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-14T04:00:00Z', local: 'AUS', visitante: 'TUR', sede: 'BC Place, Vancouver',           paisAnfitrion: 'Canadá' },          // 9pm PDT
  { grupo: 'D', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-19T19:00:00Z', local: 'USA', visitante: 'AUS', sede: 'Lumen Field, Seattle',          paisAnfitrion: 'Estados Unidos' },  // 12pm PDT
  { grupo: 'D', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-20T03:00:00Z', local: 'TUR', visitante: 'PAR', sede: "Levi's Stadium, San Francisco", paisAnfitrion: 'Estados Unidos' },  // 8pm PDT
  { grupo: 'D', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-26T02:00:00Z', local: 'TUR', visitante: 'USA', sede: 'SoFi Stadium, Los Ángeles',     paisAnfitrion: 'Estados Unidos' },  // 7pm PDT
  { grupo: 'D', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-26T02:00:00Z', local: 'PAR', visitante: 'AUS', sede: "Levi's Stadium, San Francisco", paisAnfitrion: 'Estados Unidos' },  // 7pm PDT

  // ── Grupo E · Ecuador ─────────────────────────────────────────────
  { grupo: 'E', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-14T17:00:00Z', local: 'GER', visitante: 'CUW', sede: 'NRG Stadium, Houston',          paisAnfitrion: 'Estados Unidos' },  // 12pm CDT
  { grupo: 'E', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-14T23:00:00Z', local: 'CIV', visitante: 'ECU', sede: 'Lincoln Financial, Filadelfia', paisAnfitrion: 'Estados Unidos' },  // 7pm EDT
  { grupo: 'E', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-20T20:00:00Z', local: 'GER', visitante: 'CIV', sede: 'BMO Field, Toronto',            paisAnfitrion: 'Canadá' },          // 4pm EDT
  { grupo: 'E', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-21T00:00:00Z', local: 'ECU', visitante: 'CUW', sede: 'Arrowhead, Kansas City',        paisAnfitrion: 'Estados Unidos' },  // 7pm CDT
  { grupo: 'E', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-25T20:00:00Z', local: 'CUW', visitante: 'CIV', sede: 'Lincoln Financial, Filadelfia', paisAnfitrion: 'Estados Unidos' },  // 4pm EDT
  { grupo: 'E', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-25T20:00:00Z', local: 'ECU', visitante: 'GER', sede: 'MetLife Stadium, Nueva York',   paisAnfitrion: 'Estados Unidos' },  // 4pm EDT

  // ── Grupo F ───────────────────────────────────────────────────────
  { grupo: 'F', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-14T20:00:00Z', local: 'NED', visitante: 'JPN', sede: 'AT&T Stadium, Dallas',          paisAnfitrion: 'Estados Unidos' },  // 3pm CDT
  { grupo: 'F', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-15T02:00:00Z', local: 'SWE', visitante: 'TUN', sede: 'Estadio BBVA, Monterrey',       paisAnfitrion: 'México' },          // 8pm Monterrey
  { grupo: 'F', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-20T17:00:00Z', local: 'NED', visitante: 'SWE', sede: 'NRG Stadium, Houston',          paisAnfitrion: 'Estados Unidos' },  // 12pm CDT
  { grupo: 'F', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-21T04:00:00Z', local: 'TUN', visitante: 'JPN', sede: 'Estadio BBVA, Monterrey',       paisAnfitrion: 'México' },          // 10pm Monterrey
  { grupo: 'F', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-25T23:00:00Z', local: 'JPN', visitante: 'SWE', sede: 'AT&T Stadium, Dallas',          paisAnfitrion: 'Estados Unidos' },  // 6pm CDT
  { grupo: 'F', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-25T23:00:00Z', local: 'TUN', visitante: 'NED', sede: 'Arrowhead, Kansas City',        paisAnfitrion: 'Estados Unidos' },  // 6pm CDT

  // ── Grupo G ───────────────────────────────────────────────────────
  { grupo: 'G', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-15T19:00:00Z', local: 'BEL', visitante: 'EGY', sede: 'Lumen Field, Seattle',          paisAnfitrion: 'Estados Unidos' },  // 12pm PDT
  { grupo: 'G', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-16T01:00:00Z', local: 'IRN', visitante: 'NZL', sede: 'SoFi Stadium, Los Ángeles',     paisAnfitrion: 'Estados Unidos' },  // 6pm PDT
  { grupo: 'G', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-21T19:00:00Z', local: 'BEL', visitante: 'IRN', sede: 'SoFi Stadium, Los Ángeles',     paisAnfitrion: 'Estados Unidos' },  // 12pm PDT
  { grupo: 'G', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-22T01:00:00Z', local: 'NZL', visitante: 'EGY', sede: 'BC Place, Vancouver',           paisAnfitrion: 'Canadá' },          // 6pm PDT
  { grupo: 'G', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-27T03:00:00Z', local: 'EGY', visitante: 'IRN', sede: 'Lumen Field, Seattle',          paisAnfitrion: 'Estados Unidos' },  // 8pm PDT
  { grupo: 'G', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-27T03:00:00Z', local: 'NZL', visitante: 'BEL', sede: 'BC Place, Vancouver',           paisAnfitrion: 'Canadá' },          // 8pm PDT

  // ── Grupo H ───────────────────────────────────────────────────────
  { grupo: 'H', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-15T16:00:00Z', local: 'ESP', visitante: 'CPV', sede: 'Mercedes-Benz, Atlanta',        paisAnfitrion: 'Estados Unidos' },  // 12pm EDT
  { grupo: 'H', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-15T22:00:00Z', local: 'KSA', visitante: 'URU', sede: 'Hard Rock Stadium, Miami',      paisAnfitrion: 'Estados Unidos' },  // 6pm EDT
  { grupo: 'H', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-21T16:00:00Z', local: 'ESP', visitante: 'KSA', sede: 'Mercedes-Benz, Atlanta',        paisAnfitrion: 'Estados Unidos' },  // 12pm EDT
  { grupo: 'H', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-21T22:00:00Z', local: 'URU', visitante: 'CPV', sede: 'Hard Rock Stadium, Miami',      paisAnfitrion: 'Estados Unidos' },  // 6pm EDT
  { grupo: 'H', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-27T00:00:00Z', local: 'CPV', visitante: 'KSA', sede: 'NRG Stadium, Houston',          paisAnfitrion: 'Estados Unidos' },  // 7pm CDT
  { grupo: 'H', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-27T00:00:00Z', local: 'URU', visitante: 'ESP', sede: 'Estadio Akron, Guadalajara',    paisAnfitrion: 'México' },          // 6pm Zapopan

  // ── Grupo I ───────────────────────────────────────────────────────
  { grupo: 'I', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-16T19:00:00Z', local: 'FRA', visitante: 'SEN', sede: 'MetLife Stadium, Nueva York',   paisAnfitrion: 'Estados Unidos' },  // 3pm EDT
  { grupo: 'I', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-16T22:00:00Z', local: 'IRQ', visitante: 'NOR', sede: 'Gillette Stadium, Boston',      paisAnfitrion: 'Estados Unidos' },  // 6pm EDT
  { grupo: 'I', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-22T21:00:00Z', local: 'FRA', visitante: 'IRQ', sede: 'Lincoln Financial, Filadelfia', paisAnfitrion: 'Estados Unidos' },  // 5pm EDT
  { grupo: 'I', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-23T00:00:00Z', local: 'NOR', visitante: 'SEN', sede: 'MetLife Stadium, Nueva York',   paisAnfitrion: 'Estados Unidos' },  // 8pm EDT
  { grupo: 'I', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-26T19:00:00Z', local: 'NOR', visitante: 'FRA', sede: 'Gillette Stadium, Boston',      paisAnfitrion: 'Estados Unidos' },  // 3pm EDT
  { grupo: 'I', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-26T19:00:00Z', local: 'SEN', visitante: 'IRQ', sede: 'BMO Field, Toronto',            paisAnfitrion: 'Canadá' },          // 3pm EDT

  // ── Grupo J ───────────────────────────────────────────────────────
  { grupo: 'J', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-17T01:00:00Z', local: 'ARG', visitante: 'ALG', sede: 'Arrowhead, Kansas City',        paisAnfitrion: 'Estados Unidos' },  // 8pm CDT
  { grupo: 'J', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-17T04:00:00Z', local: 'AUT', visitante: 'JOR', sede: "Levi's Stadium, San Francisco", paisAnfitrion: 'Estados Unidos' },  // 9pm PDT
  { grupo: 'J', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-22T17:00:00Z', local: 'ARG', visitante: 'AUT', sede: 'AT&T Stadium, Dallas',          paisAnfitrion: 'Estados Unidos' },  // 12pm CDT
  { grupo: 'J', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-23T03:00:00Z', local: 'JOR', visitante: 'ALG', sede: "Levi's Stadium, San Francisco", paisAnfitrion: 'Estados Unidos' },  // 8pm PDT
  { grupo: 'J', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-28T02:00:00Z', local: 'ALG', visitante: 'AUT', sede: 'Arrowhead, Kansas City',        paisAnfitrion: 'Estados Unidos' },  // 9pm CDT
  { grupo: 'J', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-28T02:00:00Z', local: 'JOR', visitante: 'ARG', sede: 'AT&T Stadium, Dallas',          paisAnfitrion: 'Estados Unidos' },  // 9pm CDT

  // ── Grupo K ───────────────────────────────────────────────────────
  { grupo: 'K', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-17T17:00:00Z', local: 'POR', visitante: 'COD', sede: 'NRG Stadium, Houston',          paisAnfitrion: 'Estados Unidos' },  // 12pm CDT
  { grupo: 'K', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-18T02:00:00Z', local: 'UZB', visitante: 'COL', sede: 'Estadio Azteca, CDMX',          paisAnfitrion: 'México' },          // 8pm CDMX
  { grupo: 'K', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-23T17:00:00Z', local: 'POR', visitante: 'UZB', sede: 'NRG Stadium, Houston',          paisAnfitrion: 'Estados Unidos' },  // 12pm CDT
  { grupo: 'K', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-24T02:00:00Z', local: 'COL', visitante: 'COD', sede: 'Estadio Akron, Guadalajara',    paisAnfitrion: 'México' },          // 8pm Zapopan
  { grupo: 'K', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-27T23:30:00Z', local: 'COL', visitante: 'POR', sede: 'Hard Rock Stadium, Miami',      paisAnfitrion: 'Estados Unidos' },  // 7:30pm EDT
  { grupo: 'K', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-27T23:30:00Z', local: 'COD', visitante: 'UZB', sede: 'Mercedes-Benz, Atlanta',        paisAnfitrion: 'Estados Unidos' },  // 7:30pm EDT

  // ── Grupo L ───────────────────────────────────────────────────────
  { grupo: 'L', matchday: 1, ordenEnMD: 1, kickoffUTC: '2026-06-17T20:00:00Z', local: 'ENG', visitante: 'CRO', sede: 'AT&T Stadium, Dallas',          paisAnfitrion: 'Estados Unidos' },  // 3pm CDT
  { grupo: 'L', matchday: 1, ordenEnMD: 2, kickoffUTC: '2026-06-17T23:00:00Z', local: 'GHA', visitante: 'PAN', sede: 'BMO Field, Toronto',            paisAnfitrion: 'Canadá' },          // 7pm EDT
  { grupo: 'L', matchday: 2, ordenEnMD: 1, kickoffUTC: '2026-06-23T20:00:00Z', local: 'ENG', visitante: 'GHA', sede: 'Gillette Stadium, Boston',      paisAnfitrion: 'Estados Unidos' },  // 4pm EDT
  { grupo: 'L', matchday: 2, ordenEnMD: 2, kickoffUTC: '2026-06-23T23:00:00Z', local: 'PAN', visitante: 'CRO', sede: 'BMO Field, Toronto',            paisAnfitrion: 'Canadá' },          // 7pm EDT
  { grupo: 'L', matchday: 3, ordenEnMD: 1, kickoffUTC: '2026-06-27T21:00:00Z', local: 'PAN', visitante: 'ENG', sede: 'MetLife Stadium, Nueva York',   paisAnfitrion: 'Estados Unidos' },  // 5pm EDT
  { grupo: 'L', matchday: 3, ordenEnMD: 2, kickoffUTC: '2026-06-27T21:00:00Z', local: 'CRO', visitante: 'GHA', sede: 'Lincoln Financial, Filadelfia', paisAnfitrion: 'Estados Unidos' },  // 5pm EDT
];

/** Calendario completo de la fase de grupos (72 partidos), ordenado por kickoff. */
export const PARTIDOS: Partido[] = FIXTURES.map((fixture): Partido => ({
  id: `${fixture.grupo}-MD${fixture.matchday}-${fixture.ordenEnMD}`,
  fechaISO: fixture.kickoffUTC,
  sede: fixture.sede,
  paisAnfitrion: fixture.paisAnfitrion,
  equipoLocalId: fixture.local,
  equipoVisitanteId: fixture.visitante,
  fase: 'grupos' satisfies FasePartido,
  grupo: fixture.grupo,
  estado: 'programado',
})).sort((a, b) => a.fechaISO.localeCompare(b.fechaISO));

/** Índice por ID para acceso O(1). */
export const PARTIDOS_POR_ID: Record<string, Partido> = Object.fromEntries(
  PARTIDOS.map((partido) => [partido.id, partido])
);

export function partidoPorId(id: string): Partido | undefined {
  return PARTIDOS_POR_ID[id];
}
