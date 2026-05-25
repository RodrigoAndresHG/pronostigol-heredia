import type { Equipo } from '../tipos';

/**
 * Mock de los 48 equipos del Mundial 2026 y su distribución en grupos.
 *
 * ⚠️ DATOS MOCK — IMPORTANTE
 *
 * Este dataset es una construcción plausible pero NO refleja el sorteo
 * oficial del 5 de diciembre de 2025. Se usa para construir la UI sin
 * depender de APIs externas. En la Fase 4 reemplazaremos por datos
 * reales de football-data.org y la fuente será automática.
 *
 * Los ratings son aproximaciones tipo Elo (1500-2200) y se usan en
 * el modelo base de la Fase 2.
 */

export const EQUIPOS: Equipo[] = [
  // ── Grupo A ────────────────────────────────────────────────
  { id: 'MEX', nombre: 'México',       confederacion: 'CONCACAF', rating: 1850, grupo: 'A', banderaEmoji: '🇲🇽' },
  { id: 'CRO', nombre: 'Croacia',      confederacion: 'UEFA',     rating: 1950, grupo: 'A', banderaEmoji: '🇭🇷' },
  { id: 'EGY', nombre: 'Egipto',       confederacion: 'CAF',      rating: 1720, grupo: 'A', banderaEmoji: '🇪🇬' },
  { id: 'UZB', nombre: 'Uzbekistán',   confederacion: 'AFC',      rating: 1530, grupo: 'A', banderaEmoji: '🇺🇿' },

  // ── Grupo B ────────────────────────────────────────────────
  { id: 'USA', nombre: 'Estados Unidos', confederacion: 'CONCACAF', rating: 1870, grupo: 'B', banderaEmoji: '🇺🇸' },
  { id: 'BEL', nombre: 'Bélgica',        confederacion: 'UEFA',     rating: 1990, grupo: 'B', banderaEmoji: '🇧🇪' },
  { id: 'TUN', nombre: 'Túnez',          confederacion: 'CAF',      rating: 1660, grupo: 'B', banderaEmoji: '🇹🇳' },
  { id: 'ECU', nombre: 'Ecuador',        confederacion: 'CONMEBOL', rating: 1760, grupo: 'B', banderaEmoji: '🇪🇨' },

  // ── Grupo C ────────────────────────────────────────────────
  { id: 'CAN', nombre: 'Canadá',  confederacion: 'CONCACAF', rating: 1830, grupo: 'C', banderaEmoji: '🇨🇦' },
  { id: 'POL', nombre: 'Polonia', confederacion: 'UEFA',     rating: 1730, grupo: 'C', banderaEmoji: '🇵🇱' },
  { id: 'SEN', nombre: 'Senegal', confederacion: 'CAF',      rating: 1790, grupo: 'C', banderaEmoji: '🇸🇳' },
  { id: 'QAT', nombre: 'Catar',   confederacion: 'AFC',      rating: 1570, grupo: 'C', banderaEmoji: '🇶🇦' },

  // ── Grupo D ────────────────────────────────────────────────
  { id: 'ARG', nombre: 'Argentina',     confederacion: 'CONMEBOL', rating: 2150, grupo: 'D', banderaEmoji: '🇦🇷' },
  { id: 'NED', nombre: 'Países Bajos',  confederacion: 'UEFA',     rating: 2000, grupo: 'D', banderaEmoji: '🇳🇱' },
  { id: 'GHA', nombre: 'Ghana',         confederacion: 'CAF',      rating: 1600, grupo: 'D', banderaEmoji: '🇬🇭' },
  { id: 'KSA', nombre: 'Arabia Saudita', confederacion: 'AFC',     rating: 1620, grupo: 'D', banderaEmoji: '🇸🇦' },

  // ── Grupo E ────────────────────────────────────────────────
  { id: 'BRA', nombre: 'Brasil',  confederacion: 'CONMEBOL', rating: 2080, grupo: 'E', banderaEmoji: '🇧🇷' },
  { id: 'SUI', nombre: 'Suiza',   confederacion: 'UEFA',     rating: 1890, grupo: 'E', banderaEmoji: '🇨🇭' },
  { id: 'NGA', nombre: 'Nigeria', confederacion: 'CAF',      rating: 1680, grupo: 'E', banderaEmoji: '🇳🇬' },
  { id: 'IRN', nombre: 'Irán',    confederacion: 'AFC',      rating: 1770, grupo: 'E', banderaEmoji: '🇮🇷' },

  // ── Grupo F ────────────────────────────────────────────────
  { id: 'FRA', nombre: 'Francia',     confederacion: 'UEFA', rating: 2100, grupo: 'F', banderaEmoji: '🇫🇷' },
  { id: 'TUR', nombre: 'Türkiye',     confederacion: 'UEFA', rating: 1750, grupo: 'F', banderaEmoji: '🇹🇷' },
  { id: 'ALG', nombre: 'Argelia',     confederacion: 'CAF',  rating: 1670, grupo: 'F', banderaEmoji: '🇩🇿' },
  { id: 'KOR', nombre: 'Corea del Sur', confederacion: 'AFC', rating: 1820, grupo: 'F', banderaEmoji: '🇰🇷' },

  // ── Grupo G ────────────────────────────────────────────────
  { id: 'ENG', nombre: 'Inglaterra', confederacion: 'UEFA', rating: 2030, grupo: 'G', banderaEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'AUT', nombre: 'Austria',    confederacion: 'UEFA', rating: 1700, grupo: 'G', banderaEmoji: '🇦🇹' },
  { id: 'CMR', nombre: 'Camerún',    confederacion: 'CAF',  rating: 1650, grupo: 'G', banderaEmoji: '🇨🇲' },
  { id: 'UAE', nombre: 'Emiratos Árabes', confederacion: 'AFC', rating: 1560, grupo: 'G', banderaEmoji: '🇦🇪' },

  // ── Grupo H ────────────────────────────────────────────────
  { id: 'ESP', nombre: 'España',     confederacion: 'UEFA', rating: 2050, grupo: 'H', banderaEmoji: '🇪🇸' },
  { id: 'NOR', nombre: 'Noruega',    confederacion: 'UEFA', rating: 1710, grupo: 'H', banderaEmoji: '🇳🇴' },
  { id: 'MAR', nombre: 'Marruecos',  confederacion: 'CAF',  rating: 1810, grupo: 'H', banderaEmoji: '🇲🇦' },
  { id: 'AUS', nombre: 'Australia',  confederacion: 'AFC',  rating: 1780, grupo: 'H', banderaEmoji: '🇦🇺' },

  // ── Grupo I ────────────────────────────────────────────────
  { id: 'GER', nombre: 'Alemania',     confederacion: 'UEFA', rating: 1940, grupo: 'I', banderaEmoji: '🇩🇪' },
  { id: 'SRB', nombre: 'Serbia',       confederacion: 'UEFA', rating: 1740, grupo: 'I', banderaEmoji: '🇷🇸' },
  { id: 'CIV', nombre: 'Costa de Marfil', confederacion: 'CAF', rating: 1690, grupo: 'I', banderaEmoji: '🇨🇮' },
  { id: 'JPN', nombre: 'Japón',        confederacion: 'AFC',  rating: 1840, grupo: 'I', banderaEmoji: '🇯🇵' },

  // ── Grupo J ────────────────────────────────────────────────
  { id: 'POR', nombre: 'Portugal',    confederacion: 'UEFA',     rating: 2010, grupo: 'J', banderaEmoji: '🇵🇹' },
  { id: 'DEN', nombre: 'Dinamarca',   confederacion: 'UEFA',     rating: 1880, grupo: 'J', banderaEmoji: '🇩🇰' },
  { id: 'RSA', nombre: 'Sudáfrica',   confederacion: 'CAF',      rating: 1580, grupo: 'J', banderaEmoji: '🇿🇦' },
  { id: 'CRC', nombre: 'Costa Rica',  confederacion: 'CONCACAF', rating: 1610, grupo: 'J', banderaEmoji: '🇨🇷' },

  // ── Grupo K ────────────────────────────────────────────────
  { id: 'ITA', nombre: 'Italia',    confederacion: 'UEFA',     rating: 1970, grupo: 'K', banderaEmoji: '🇮🇹' },
  { id: 'URU', nombre: 'Uruguay',   confederacion: 'CONMEBOL', rating: 1920, grupo: 'K', banderaEmoji: '🇺🇾' },
  { id: 'PAR', nombre: 'Paraguay',  confederacion: 'CONMEBOL', rating: 1630, grupo: 'K', banderaEmoji: '🇵🇾' },
  { id: 'JAM', nombre: 'Jamaica',   confederacion: 'CONCACAF', rating: 1520, grupo: 'K', banderaEmoji: '🇯🇲' },

  // ── Grupo L ────────────────────────────────────────────────
  { id: 'COL', nombre: 'Colombia',  confederacion: 'CONMEBOL', rating: 1900, grupo: 'L', banderaEmoji: '🇨🇴' },
  { id: 'IRQ', nombre: 'Irak',      confederacion: 'AFC',      rating: 1550, grupo: 'L', banderaEmoji: '🇮🇶' },
  { id: 'PER', nombre: 'Perú',      confederacion: 'CONMEBOL', rating: 1640, grupo: 'L', banderaEmoji: '🇵🇪' },
  { id: 'PAN', nombre: 'Panamá',    confederacion: 'CONCACAF', rating: 1540, grupo: 'L', banderaEmoji: '🇵🇦' },
];

/**
 * Acceso por ID — index para evitar `.find` repetidos por toda la app.
 */
export const EQUIPOS_POR_ID: Record<string, Equipo> = Object.fromEntries(
  EQUIPOS.map((equipo) => [equipo.id, equipo])
);

/** Devuelve el equipo o lanza error si no existe — útil en render. */
export function equipoPorId(id: string): Equipo {
  const equipo = EQUIPOS_POR_ID[id];
  if (!equipo) throw new Error(`Equipo no encontrado: ${id}`);
  return equipo;
}
