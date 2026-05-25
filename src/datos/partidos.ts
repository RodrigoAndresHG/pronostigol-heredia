import type { Partido, LetraGrupo, FasePartido } from '../tipos';

/**
 * Calendario oficial de la fase de grupos del Mundial 2026.
 *
 * Fuentes: cruzado entre el sorteo final de FIFA (5 de diciembre de 2025) y
 * el calendario publicado por DAZN. 72 partidos, 11 al 27 de junio de 2026.
 *
 * Notas:
 *   - Las HORAS exactas de kickoff aún no las tomamos del oficial; aquí se
 *     asignan slots aproximados (16:00 / 19:00 / 22:00 / 01:00 UTC). En la
 *     Fase 4 las reemplazamos con la hora oficial vía football-data.org.
 *   - El ID del partido sigue el patrón `GRUPO-MDx-N`, p. ej. `A-MD1-1`.
 *   - Los nombres de sede en español/inglés respetan el uso común en medios.
 */

type FixtureCrudo = {
  fecha: string;        // 'YYYY-MM-DD' del día del partido (zona local de la sede)
  grupo: LetraGrupo;
  matchday: 1 | 2 | 3;
  ordenEnElDia: 1 | 2 | 3 | 4 | 5 | 6;
  local: string;
  visitante: string;
  sede: string;
  paisAnfitrion: 'México' | 'Estados Unidos' | 'Canadá';
};

/**
 * Slots UTC por orden dentro del día. Si un día tiene 4 partidos,
 * se usan los slots 1-4. Distribuye los kickoffs a lo largo de la
 * tarde-noche en EEUU/CDMX/Toronto.
 */
const SLOTS_UTC = [
  '16:00', // mediodía costa este EEUU
  '19:00',
  '22:00',
  '01:00', // ya día siguiente UTC; se compensa abajo
  '04:00',
  '07:00',
];

/**
 * Lista cruda de los 72 partidos, en orden cronológico.
 * Tomada directamente del calendario oficial publicado.
 */
const FIXTURES: FixtureCrudo[] = [
  // ── Día 1 · Jueves 11 de junio ────────────────────────────────────
  { fecha: '2026-06-11', grupo: 'A', matchday: 1, ordenEnElDia: 1, local: 'MEX', visitante: 'RSA', sede: 'Estadio Azteca, CDMX',          paisAnfitrion: 'México' },
  { fecha: '2026-06-11', grupo: 'A', matchday: 1, ordenEnElDia: 2, local: 'KOR', visitante: 'CZE', sede: 'Estadio Akron, Guadalajara',    paisAnfitrion: 'México' },

  // ── Día 2 · Viernes 12 de junio ───────────────────────────────────
  { fecha: '2026-06-12', grupo: 'B', matchday: 1, ordenEnElDia: 1, local: 'CAN', visitante: 'BIH', sede: 'BMO Field, Toronto',            paisAnfitrion: 'Canadá' },
  { fecha: '2026-06-12', grupo: 'B', matchday: 1, ordenEnElDia: 2, local: 'QAT', visitante: 'SUI', sede: "Levi's Stadium, San Francisco", paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-12', grupo: 'D', matchday: 1, ordenEnElDia: 3, local: 'USA', visitante: 'PAR', sede: 'SoFi Stadium, Los Ángeles',     paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-12', grupo: 'D', matchday: 1, ordenEnElDia: 4, local: 'AUS', visitante: 'TUR', sede: 'BC Place, Vancouver',           paisAnfitrion: 'Canadá' },

  // ── Día 3 · Sábado 13 de junio ────────────────────────────────────
  { fecha: '2026-06-13', grupo: 'C', matchday: 1, ordenEnElDia: 1, local: 'BRA', visitante: 'MAR', sede: 'Gillette Stadium, Boston',      paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-13', grupo: 'C', matchday: 1, ordenEnElDia: 2, local: 'HAI', visitante: 'SCO', sede: 'MetLife Stadium, Nueva York',   paisAnfitrion: 'Estados Unidos' },

  // ── Día 4 · Domingo 14 de junio ───────────────────────────────────
  { fecha: '2026-06-14', grupo: 'E', matchday: 1, ordenEnElDia: 1, local: 'GER', visitante: 'CUW', sede: 'Lincoln Financial, Filadelfia', paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-14', grupo: 'E', matchday: 1, ordenEnElDia: 2, local: 'CIV', visitante: 'ECU', sede: 'NRG Stadium, Houston',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-14', grupo: 'F', matchday: 1, ordenEnElDia: 3, local: 'NED', visitante: 'JPN', sede: 'AT&T Stadium, Dallas',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-14', grupo: 'F', matchday: 1, ordenEnElDia: 4, local: 'SWE', visitante: 'TUN', sede: 'Estadio BBVA, Monterrey',       paisAnfitrion: 'México' },

  // ── Día 5 · Lunes 15 de junio ─────────────────────────────────────
  { fecha: '2026-06-15', grupo: 'G', matchday: 1, ordenEnElDia: 1, local: 'BEL', visitante: 'EGY', sede: 'SoFi Stadium, Los Ángeles',     paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-15', grupo: 'G', matchday: 1, ordenEnElDia: 2, local: 'IRN', visitante: 'NZL', sede: 'Lumen Field, Seattle',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-15', grupo: 'H', matchday: 1, ordenEnElDia: 3, local: 'ESP', visitante: 'CPV', sede: 'Hard Rock Stadium, Miami',      paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-15', grupo: 'H', matchday: 1, ordenEnElDia: 4, local: 'KSA', visitante: 'URU', sede: 'Mercedes-Benz, Atlanta',        paisAnfitrion: 'Estados Unidos' },

  // ── Día 6 · Martes 16 de junio ────────────────────────────────────
  { fecha: '2026-06-16', grupo: 'I', matchday: 1, ordenEnElDia: 1, local: 'FRA', visitante: 'SEN', sede: 'MetLife Stadium, Nueva York',   paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-16', grupo: 'I', matchday: 1, ordenEnElDia: 2, local: 'IRQ', visitante: 'NOR', sede: 'Gillette Stadium, Boston',      paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-16', grupo: 'J', matchday: 1, ordenEnElDia: 3, local: 'ARG', visitante: 'ALG', sede: 'Arrowhead, Kansas City',        paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-16', grupo: 'J', matchday: 1, ordenEnElDia: 4, local: 'AUT', visitante: 'JOR', sede: "Levi's Stadium, San Francisco", paisAnfitrion: 'Estados Unidos' },

  // ── Día 7 · Miércoles 17 de junio ─────────────────────────────────
  { fecha: '2026-06-17', grupo: 'K', matchday: 1, ordenEnElDia: 1, local: 'POR', visitante: 'COD', sede: 'NRG Stadium, Houston',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-17', grupo: 'K', matchday: 1, ordenEnElDia: 2, local: 'UZB', visitante: 'COL', sede: 'Estadio Azteca, CDMX',          paisAnfitrion: 'México' },
  { fecha: '2026-06-17', grupo: 'L', matchday: 1, ordenEnElDia: 3, local: 'ENG', visitante: 'CRO', sede: 'BMO Field, Toronto',            paisAnfitrion: 'Canadá' },
  { fecha: '2026-06-17', grupo: 'L', matchday: 1, ordenEnElDia: 4, local: 'GHA', visitante: 'PAN', sede: 'AT&T Stadium, Dallas',          paisAnfitrion: 'Estados Unidos' },

  // ── Día 8 · Jueves 18 de junio · MD2 inicia ───────────────────────
  { fecha: '2026-06-18', grupo: 'A', matchday: 2, ordenEnElDia: 1, local: 'CZE', visitante: 'RSA', sede: 'Mercedes-Benz, Atlanta',        paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-18', grupo: 'A', matchday: 2, ordenEnElDia: 2, local: 'MEX', visitante: 'KOR', sede: 'Estadio Akron, Guadalajara',    paisAnfitrion: 'México' },
  { fecha: '2026-06-18', grupo: 'B', matchday: 2, ordenEnElDia: 3, local: 'SUI', visitante: 'BIH', sede: 'SoFi Stadium, Los Ángeles',     paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-18', grupo: 'B', matchday: 2, ordenEnElDia: 4, local: 'CAN', visitante: 'QAT', sede: 'BC Place, Vancouver',           paisAnfitrion: 'Canadá' },

  // ── Día 9 · Viernes 19 de junio ───────────────────────────────────
  { fecha: '2026-06-19', grupo: 'C', matchday: 2, ordenEnElDia: 1, local: 'BRA', visitante: 'HAI', sede: 'Lincoln Financial, Filadelfia', paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-19', grupo: 'C', matchday: 2, ordenEnElDia: 2, local: 'SCO', visitante: 'MAR', sede: 'Gillette Stadium, Boston',      paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-19', grupo: 'D', matchday: 2, ordenEnElDia: 3, local: 'TUR', visitante: 'PAR', sede: "Levi's Stadium, San Francisco", paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-19', grupo: 'D', matchday: 2, ordenEnElDia: 4, local: 'USA', visitante: 'AUS', sede: 'Lumen Field, Seattle',          paisAnfitrion: 'Estados Unidos' },

  // ── Día 10 · Sábado 20 de junio ───────────────────────────────────
  { fecha: '2026-06-20', grupo: 'E', matchday: 2, ordenEnElDia: 1, local: 'GER', visitante: 'CIV', sede: 'BMO Field, Toronto',            paisAnfitrion: 'Canadá' },
  { fecha: '2026-06-20', grupo: 'E', matchday: 2, ordenEnElDia: 2, local: 'ECU', visitante: 'CUW', sede: 'Arrowhead, Kansas City',        paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-20', grupo: 'F', matchday: 2, ordenEnElDia: 3, local: 'NED', visitante: 'SWE', sede: 'NRG Stadium, Houston',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-20', grupo: 'F', matchday: 2, ordenEnElDia: 4, local: 'TUN', visitante: 'JPN', sede: 'Estadio BBVA, Monterrey',       paisAnfitrion: 'México' },

  // ── Día 11 · Domingo 21 de junio ──────────────────────────────────
  { fecha: '2026-06-21', grupo: 'G', matchday: 2, ordenEnElDia: 1, local: 'BEL', visitante: 'IRN', sede: 'SoFi Stadium, Los Ángeles',     paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-21', grupo: 'G', matchday: 2, ordenEnElDia: 2, local: 'NZL', visitante: 'EGY', sede: 'BC Place, Vancouver',           paisAnfitrion: 'Canadá' },
  { fecha: '2026-06-21', grupo: 'H', matchday: 2, ordenEnElDia: 3, local: 'ESP', visitante: 'KSA', sede: 'Hard Rock Stadium, Miami',      paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-21', grupo: 'H', matchday: 2, ordenEnElDia: 4, local: 'URU', visitante: 'CPV', sede: 'Mercedes-Benz, Atlanta',        paisAnfitrion: 'Estados Unidos' },

  // ── Día 12 · Lunes 22 de junio ────────────────────────────────────
  { fecha: '2026-06-22', grupo: 'I', matchday: 2, ordenEnElDia: 1, local: 'FRA', visitante: 'IRQ', sede: 'MetLife Stadium, Nueva York',   paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-22', grupo: 'I', matchday: 2, ordenEnElDia: 2, local: 'NOR', visitante: 'SEN', sede: 'Lincoln Financial, Filadelfia', paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-22', grupo: 'J', matchday: 2, ordenEnElDia: 3, local: 'ARG', visitante: 'AUT', sede: 'AT&T Stadium, Dallas',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-22', grupo: 'J', matchday: 2, ordenEnElDia: 4, local: 'JOR', visitante: 'ALG', sede: "Levi's Stadium, San Francisco", paisAnfitrion: 'Estados Unidos' },

  // ── Día 13 · Martes 23 de junio ───────────────────────────────────
  { fecha: '2026-06-23', grupo: 'K', matchday: 2, ordenEnElDia: 1, local: 'POR', visitante: 'UZB', sede: 'NRG Stadium, Houston',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-23', grupo: 'K', matchday: 2, ordenEnElDia: 2, local: 'COL', visitante: 'COD', sede: 'Estadio Akron, Guadalajara',    paisAnfitrion: 'México' },
  { fecha: '2026-06-23', grupo: 'L', matchday: 2, ordenEnElDia: 3, local: 'ENG', visitante: 'GHA', sede: 'Gillette Stadium, Boston',      paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-23', grupo: 'L', matchday: 2, ordenEnElDia: 4, local: 'PAN', visitante: 'CRO', sede: 'BMO Field, Toronto',            paisAnfitrion: 'Canadá' },

  // ── Día 14 · Miércoles 24 de junio · MD3 inicia ───────────────────
  { fecha: '2026-06-24', grupo: 'A', matchday: 3, ordenEnElDia: 1, local: 'CZE', visitante: 'MEX', sede: 'Estadio Azteca, CDMX',          paisAnfitrion: 'México' },
  { fecha: '2026-06-24', grupo: 'A', matchday: 3, ordenEnElDia: 2, local: 'RSA', visitante: 'KOR', sede: 'Estadio BBVA, Monterrey',       paisAnfitrion: 'México' },
  { fecha: '2026-06-24', grupo: 'B', matchday: 3, ordenEnElDia: 3, local: 'SUI', visitante: 'CAN', sede: 'BC Place, Vancouver',           paisAnfitrion: 'Canadá' },
  { fecha: '2026-06-24', grupo: 'B', matchday: 3, ordenEnElDia: 4, local: 'BIH', visitante: 'QAT', sede: 'Lumen Field, Seattle',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-24', grupo: 'C', matchday: 3, ordenEnElDia: 5, local: 'SCO', visitante: 'BRA', sede: 'Hard Rock Stadium, Miami',      paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-24', grupo: 'C', matchday: 3, ordenEnElDia: 6, local: 'MAR', visitante: 'HAI', sede: 'Mercedes-Benz, Atlanta',        paisAnfitrion: 'Estados Unidos' },

  // ── Día 15 · Jueves 25 de junio ───────────────────────────────────
  { fecha: '2026-06-25', grupo: 'D', matchday: 3, ordenEnElDia: 1, local: 'TUR', visitante: 'USA', sede: 'SoFi Stadium, Los Ángeles',     paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-25', grupo: 'D', matchday: 3, ordenEnElDia: 2, local: 'PAR', visitante: 'AUS', sede: "Levi's Stadium, San Francisco", paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-25', grupo: 'E', matchday: 3, ordenEnElDia: 3, local: 'ECU', visitante: 'GER', sede: 'Lincoln Financial, Filadelfia', paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-25', grupo: 'E', matchday: 3, ordenEnElDia: 4, local: 'CUW', visitante: 'CIV', sede: 'MetLife Stadium, Nueva York',   paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-25', grupo: 'F', matchday: 3, ordenEnElDia: 5, local: 'TUN', visitante: 'NED', sede: 'AT&T Stadium, Dallas',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-25', grupo: 'F', matchday: 3, ordenEnElDia: 6, local: 'JPN', visitante: 'SWE', sede: 'Arrowhead, Kansas City',        paisAnfitrion: 'Estados Unidos' },

  // ── Día 16 · Viernes 26 de junio ──────────────────────────────────
  { fecha: '2026-06-26', grupo: 'G', matchday: 3, ordenEnElDia: 1, local: 'NZL', visitante: 'BEL', sede: 'Lumen Field, Seattle',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-26', grupo: 'G', matchday: 3, ordenEnElDia: 2, local: 'EGY', visitante: 'IRN', sede: 'BC Place, Vancouver',           paisAnfitrion: 'Canadá' },
  { fecha: '2026-06-26', grupo: 'H', matchday: 3, ordenEnElDia: 3, local: 'URU', visitante: 'ESP', sede: 'NRG Stadium, Houston',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-26', grupo: 'H', matchday: 3, ordenEnElDia: 4, local: 'CPV', visitante: 'KSA', sede: 'Estadio Akron, Guadalajara',    paisAnfitrion: 'México' },
  { fecha: '2026-06-26', grupo: 'I', matchday: 3, ordenEnElDia: 5, local: 'NOR', visitante: 'FRA', sede: 'Gillette Stadium, Boston',      paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-26', grupo: 'I', matchday: 3, ordenEnElDia: 6, local: 'SEN', visitante: 'IRQ', sede: 'BMO Field, Toronto',            paisAnfitrion: 'Canadá' },

  // ── Día 17 · Sábado 27 de junio · cierre de grupos ────────────────
  { fecha: '2026-06-27', grupo: 'J', matchday: 3, ordenEnElDia: 1, local: 'JOR', visitante: 'ARG', sede: 'Arrowhead, Kansas City',        paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-27', grupo: 'J', matchday: 3, ordenEnElDia: 2, local: 'ALG', visitante: 'AUT', sede: 'AT&T Stadium, Dallas',          paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-27', grupo: 'K', matchday: 3, ordenEnElDia: 3, local: 'COL', visitante: 'POR', sede: 'Hard Rock Stadium, Miami',      paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-27', grupo: 'K', matchday: 3, ordenEnElDia: 4, local: 'COD', visitante: 'UZB', sede: 'Mercedes-Benz, Atlanta',        paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-27', grupo: 'L', matchday: 3, ordenEnElDia: 5, local: 'PAN', visitante: 'ENG', sede: 'MetLife Stadium, Nueva York',   paisAnfitrion: 'Estados Unidos' },
  { fecha: '2026-06-27', grupo: 'L', matchday: 3, ordenEnElDia: 6, local: 'CRO', visitante: 'GHA', sede: 'Lincoln Financial, Filadelfia', paisAnfitrion: 'Estados Unidos' },
];

/**
 * Construye el timestamp ISO UTC de un partido a partir de su fecha local
 * y su orden en el día. Los slots 1..3 caen en el mismo día UTC; los slots
 * 4..6 caen al día siguiente UTC (kickoffs nocturnos).
 */
function timestampUTC(fecha: string, ordenEnElDia: number): string {
  const slot = SLOTS_UTC[ordenEnElDia - 1];
  if (!slot) throw new Error(`Slot inválido: ${ordenEnElDia}`);
  const sumarDia = ordenEnElDia >= 4;
  const base = new Date(`${fecha}T00:00:00Z`);
  if (sumarDia) base.setUTCDate(base.getUTCDate() + 1);
  const [hh, mm] = slot.split(':').map(Number);
  base.setUTCHours(hh, mm, 0, 0);
  return base.toISOString();
}

/** Calendario completo de la fase de grupos (72 partidos). */
export const PARTIDOS: Partido[] = FIXTURES.map((fixture): Partido => ({
  id: `${fixture.grupo}-MD${fixture.matchday}-${fixture.ordenEnElDia}`,
  fechaISO: timestampUTC(fixture.fecha, fixture.ordenEnElDia),
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
