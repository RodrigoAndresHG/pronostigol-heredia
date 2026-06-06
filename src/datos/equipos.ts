import type { Equipo } from '../tipos/index.js';

/**
 * Los 48 equipos del Mundial 2026 y su distribución oficial en grupos.
 *
 * Fuente: sorteo final del 5 de diciembre de 2025 en Washington D.C.,
 * cruzado con Wikipedia (2026_FIFA_World_Cup_draw) y DAZN. Los 6 cupos
 * de repechaje (Bosnia, Chequia, Suecia, Türkiye, Irak y R. D. del Congo)
 * se llenaron en marzo de 2026.
 *
 * Los equipos están listados en orden de pote (Pote 1 → Pote 4) dentro
 * de cada grupo, que es como FIFA los anuncia.
 *
 * ⚠️ Los `rating` son APROXIMACIONES tipo Elo basadas en el ranking FIFA.
 * En la Fase 4 los reemplazamos por los puntos oficiales obtenidos vía API.
 * Sirven para el modelo base (Fase 2) y para ordenar visualmente.
 */

export const EQUIPOS: Equipo[] = [
  // ── Grupo A · México (anfitrión) ──────────────────────────────────
  { id: 'MEX', nombre: 'México',         confederacion: 'CONCACAF', rating: 1635, grupo: 'A', banderaEmoji: '🇲🇽' },
  { id: 'RSA', nombre: 'Sudáfrica',      confederacion: 'CAF',      rating: 1550, grupo: 'A', banderaEmoji: '🇿🇦' },
  { id: 'KOR', nombre: 'Corea del Sur',  confederacion: 'AFC',      rating: 1620, grupo: 'A', banderaEmoji: '🇰🇷' },
  { id: 'CZE', nombre: 'Chequia',        confederacion: 'UEFA',     rating: 1535, grupo: 'A', banderaEmoji: '🇨🇿' },

  // ── Grupo B · Canadá (anfitrión) ──────────────────────────────────
  { id: 'CAN', nombre: 'Canadá',                confederacion: 'CONCACAF', rating: 1545, grupo: 'B', banderaEmoji: '🇨🇦' },
  { id: 'BIH', nombre: 'Bosnia y Herzegovina',  confederacion: 'UEFA',     rating: 1440, grupo: 'B', banderaEmoji: '🇧🇦' },
  { id: 'QAT', nombre: 'Catar',                 confederacion: 'AFC',      rating: 1380, grupo: 'B', banderaEmoji: '🇶🇦' },
  { id: 'SUI', nombre: 'Suiza',                 confederacion: 'UEFA',     rating: 1670, grupo: 'B', banderaEmoji: '🇨🇭' },

  // ── Grupo C ───────────────────────────────────────────────────────
  { id: 'BRA', nombre: 'Brasil',    confederacion: 'CONMEBOL', rating: 1810, grupo: 'C', banderaEmoji: '🇧🇷' },
  { id: 'MAR', nombre: 'Marruecos', confederacion: 'CAF',      rating: 1695, grupo: 'C', banderaEmoji: '🇲🇦' },
  { id: 'HAI', nombre: 'Haití',     confederacion: 'CONCACAF', rating: 1390, grupo: 'C', banderaEmoji: '🇭🇹' },
  { id: 'SCO', nombre: 'Escocia',   confederacion: 'UEFA',     rating: 1570, grupo: 'C', banderaEmoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },

  // ── Grupo D · Estados Unidos (anfitrión) ──────────────────────────
  { id: 'USA', nombre: 'Estados Unidos', confederacion: 'CONCACAF', rating: 1650, grupo: 'D', banderaEmoji: '🇺🇸' },
  { id: 'PAR', nombre: 'Paraguay',       confederacion: 'CONMEBOL', rating: 1495, grupo: 'D', banderaEmoji: '🇵🇾' },
  { id: 'AUS', nombre: 'Australia',      confederacion: 'AFC',      rating: 1615, grupo: 'D', banderaEmoji: '🇦🇺' },
  { id: 'TUR', nombre: 'Türkiye',        confederacion: 'UEFA',     rating: 1600, grupo: 'D', banderaEmoji: '🇹🇷' },

  // ── Grupo E · Ecuador ─────────────────────────────────────────────
  { id: 'GER', nombre: 'Alemania',        confederacion: 'UEFA',     rating: 1715, grupo: 'E', banderaEmoji: '🇩🇪' },
  { id: 'CUW', nombre: 'Curazao',         confederacion: 'CONCACAF', rating: 1340, grupo: 'E', banderaEmoji: '🇨🇼' },
  { id: 'CIV', nombre: 'Costa de Marfil', confederacion: 'CAF',      rating: 1600, grupo: 'E', banderaEmoji: '🇨🇮' },
  { id: 'ECU', nombre: 'Ecuador',         confederacion: 'CONMEBOL', rating: 1610, grupo: 'E', banderaEmoji: '🇪🇨' },

  // ── Grupo F ───────────────────────────────────────────────────────
  { id: 'NED', nombre: 'Países Bajos', confederacion: 'UEFA', rating: 1775, grupo: 'F', banderaEmoji: '🇳🇱' },
  { id: 'JPN', nombre: 'Japón',        confederacion: 'AFC',  rating: 1655, grupo: 'F', banderaEmoji: '🇯🇵' },
  { id: 'SWE', nombre: 'Suecia',       confederacion: 'UEFA', rating: 1505, grupo: 'F', banderaEmoji: '🇸🇪' },
  { id: 'TUN', nombre: 'Túnez',        confederacion: 'CAF',  rating: 1530, grupo: 'F', banderaEmoji: '🇹🇳' },

  // ── Grupo G ───────────────────────────────────────────────────────
  { id: 'BEL', nombre: 'Bélgica',       confederacion: 'UEFA', rating: 1740, grupo: 'G', banderaEmoji: '🇧🇪' },
  { id: 'EGY', nombre: 'Egipto',        confederacion: 'CAF',  rating: 1605, grupo: 'G', banderaEmoji: '🇪🇬' },
  { id: 'IRN', nombre: 'Irán',          confederacion: 'AFC',  rating: 1640, grupo: 'G', banderaEmoji: '🇮🇷' },
  { id: 'NZL', nombre: 'Nueva Zelanda', confederacion: 'OFC',  rating: 1420, grupo: 'G', banderaEmoji: '🇳🇿' },

  // ── Grupo H ───────────────────────────────────────────────────────
  { id: 'ESP', nombre: 'España',         confederacion: 'UEFA',     rating: 1875, grupo: 'H', banderaEmoji: '🇪🇸' },
  { id: 'CPV', nombre: 'Cabo Verde',     confederacion: 'CAF',      rating: 1430, grupo: 'H', banderaEmoji: '🇨🇻' },
  { id: 'KSA', nombre: 'Arabia Saudita', confederacion: 'AFC',      rating: 1425, grupo: 'H', banderaEmoji: '🇸🇦' },
  { id: 'URU', nombre: 'Uruguay',        confederacion: 'CONMEBOL', rating: 1675, grupo: 'H', banderaEmoji: '🇺🇾' },

  // ── Grupo I ───────────────────────────────────────────────────────
  { id: 'FRA', nombre: 'Francia', confederacion: 'UEFA', rating: 1870, grupo: 'I', banderaEmoji: '🇫🇷' },
  { id: 'SEN', nombre: 'Senegal', confederacion: 'CAF',  rating: 1645, grupo: 'I', banderaEmoji: '🇸🇳' },
  { id: 'IRQ', nombre: 'Irak',    confederacion: 'AFC',  rating: 1460, grupo: 'I', banderaEmoji: '🇮🇶' },
  { id: 'NOR', nombre: 'Noruega', confederacion: 'UEFA', rating: 1580, grupo: 'I', banderaEmoji: '🇳🇴' },

  // ── Grupo J ───────────────────────────────────────────────────────
  { id: 'ARG', nombre: 'Argentina', confederacion: 'CONMEBOL', rating: 1885, grupo: 'J', banderaEmoji: '🇦🇷' },
  { id: 'ALG', nombre: 'Argelia',   confederacion: 'CAF',      rating: 1510, grupo: 'J', banderaEmoji: '🇩🇿' },
  { id: 'AUT', nombre: 'Austria',   confederacion: 'UEFA',     rating: 1590, grupo: 'J', banderaEmoji: '🇦🇹' },
  { id: 'JOR', nombre: 'Jordania',  confederacion: 'AFC',      rating: 1480, grupo: 'J', banderaEmoji: '🇯🇴' },

  // ── Grupo K ───────────────────────────────────────────────────────
  { id: 'POR', nombre: 'Portugal',           confederacion: 'UEFA',     rating: 1770, grupo: 'K', banderaEmoji: '🇵🇹' },
  { id: 'COD', nombre: 'R. D. del Congo',    confederacion: 'CAF',      rating: 1410, grupo: 'K', banderaEmoji: '🇨🇩' },
  { id: 'UZB', nombre: 'Uzbekistán',         confederacion: 'AFC',      rating: 1490, grupo: 'K', banderaEmoji: '🇺🇿' },
  { id: 'COL', nombre: 'Colombia',           confederacion: 'CONMEBOL', rating: 1680, grupo: 'K', banderaEmoji: '🇨🇴' },

  // ── Grupo L ───────────────────────────────────────────────────────
  { id: 'ENG', nombre: 'Inglaterra', confederacion: 'UEFA',     rating: 1820, grupo: 'L', banderaEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'CRO', nombre: 'Croacia',    confederacion: 'UEFA',     rating: 1700, grupo: 'L', banderaEmoji: '🇭🇷' },
  { id: 'GHA', nombre: 'Ghana',      confederacion: 'CAF',      rating: 1450, grupo: 'L', banderaEmoji: '🇬🇭' },
  { id: 'PAN', nombre: 'Panamá',     confederacion: 'CONCACAF', rating: 1465, grupo: 'L', banderaEmoji: '🇵🇦' },
];

/** Acceso por ID — evita `.find` repetidos por toda la app. */
export const EQUIPOS_POR_ID: Record<string, Equipo> = Object.fromEntries(
  EQUIPOS.map((equipo) => [equipo.id, equipo])
);

/** Devuelve el equipo o lanza error si no existe — útil en render. */
export function equipoPorId(id: string): Equipo {
  const equipo = EQUIPOS_POR_ID[id];
  if (!equipo) throw new Error(`Equipo no encontrado: ${id}`);
  return equipo;
}
