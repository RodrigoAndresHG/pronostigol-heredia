import { PARTIDOS } from '../../src/datos/partidos.js';
import type { GoleadorAgregado } from '../../src/tipos/index.js';

/**
 * Fuente de resultados y goleadores: openfootball/worldcup.json.
 *
 * Datos abiertos (dominio público) servidos como JSON estático desde
 * GitHub: SIN API key, sin límite de tasa. Trae el calendario, los
 * marcadores (`score.ft`) y los goleadores (`goals1`/`goals2`) del
 * Mundial 2026. Se actualiza a mano (~1 vez al día), suficiente para
 * cerrar partidos y calcular el track-record.
 *
 * Elegida sobre API-Football porque su plan gratuito NO da acceso a la
 * temporada 2026 (solo 2022-2024). openfootball es gratis para 2026.
 */

const URL_2026 =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

/** Nombre en inglés (openfootball) → código ISO3 (nuestro). Los 48. */
const NOMBRE_A_ISO: Record<string, string> = {
  Mexico: 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR', 'Czech Republic': 'CZE',
  Canada: 'CAN', 'Bosnia & Herzegovina': 'BIH', Qatar: 'QAT', Switzerland: 'SUI',
  Brazil: 'BRA', Morocco: 'MAR', Haiti: 'HAI', Scotland: 'SCO',
  USA: 'USA', Paraguay: 'PAR', Australia: 'AUS', Turkey: 'TUR',
  Germany: 'GER', 'Curaçao': 'CUW', 'Ivory Coast': 'CIV', Ecuador: 'ECU',
  Netherlands: 'NED', Japan: 'JPN', Sweden: 'SWE', Tunisia: 'TUN',
  Belgium: 'BEL', Egypt: 'EGY', Iran: 'IRN', 'New Zealand': 'NZL',
  Spain: 'ESP', 'Cape Verde': 'CPV', 'Saudi Arabia': 'KSA', Uruguay: 'URU',
  France: 'FRA', Senegal: 'SEN', Iraq: 'IRQ', Norway: 'NOR',
  Argentina: 'ARG', Algeria: 'ALG', Austria: 'AUT', Jordan: 'JOR',
  Portugal: 'POR', 'DR Congo': 'COD', Uzbekistan: 'UZB', Colombia: 'COL',
  England: 'ENG', Croatia: 'CRO', Ghana: 'GHA', Panama: 'PAN',
};

export interface Goleador {
  nombre: string;
  minuto?: number;
  penal?: boolean;
  enContra?: boolean;
}

/** Un resultado ya alineado a la orientación local/visitante de NUESTRO partido. */
export interface ResultadoIngerible {
  partidoId: string;
  equipoLocalId: string;
  equipoVisitanteId: string;
  golesLocal: number;
  golesVisitante: number;
  goleadoresLocal: Goleador[];
  goleadoresVisitante: Goleador[];
}

export interface MatchOF {
  team1: string;
  team2: string;
  score?: { ft?: [number, number] };
  goals1?: Array<{ name: string; minute?: number; penalty?: boolean; owngoal?: boolean }>;
  goals2?: Array<{ name: string; minute?: number; penalty?: boolean; owngoal?: boolean }>;
}

function mapGoleadores(
  goles?: Array<{ name: string; minute?: number; penalty?: boolean; owngoal?: boolean }>
): Goleador[] {
  return (goles ?? []).map((g) => ({
    nombre: g.name,
    minuto: g.minute,
    penal: g.penalty || undefined,
    enContra: g.owngoal || undefined,
  }));
}

/** Índice de partidos por par de equipos (no ordenado) → nuestro Partido. */
function indicePorPar() {
  const idx = new Map<string, (typeof PARTIDOS)[number]>();
  for (const p of PARTIDOS) {
    const clave = [p.equipoLocalId, p.equipoVisitanteId].sort().join('|');
    idx.set(clave, p);
  }
  return idx;
}

/**
 * Empareja matches de openfootball con NUESTROS partidos (por par de
 * equipos) y alinea la orientación a nuestro local/visitante — incluido el
 * swap de goles si openfootball lista los equipos al revés. PURA y testeable.
 * Devuelve los jugados que matchean por nombre de equipo: la fase de grupos y
 * también la Ronda de 32 una vez que sus equipos están resueltos (esto último
 * es intencional: el cron ingiere R32 como respaldo del registro manual). Los
 * cruces aún con placeholders (3A/B/.., Gan. 74) no matchean y se ignoran.
 */
export function emparejarMatches(matches: MatchOF[]): ResultadoIngerible[] {
  const idx = indicePorPar();
  const salida: ResultadoIngerible[] = [];
  for (const m of matches) {
    const ft = m.score?.ft;
    if (!ft || ft.length !== 2) continue; // sin jugar todavía

    const iso1 = NOMBRE_A_ISO[m.team1];
    const iso2 = NOMBRE_A_ISO[m.team2];
    if (!iso1 || !iso2) continue; // equipo no reconocido (placeholder de eliminatoria)

    const partido = idx.get([iso1, iso2].sort().join('|'));
    if (!partido) continue; // ese cruce no está en nuestro calendario

    // Alinear orientación: ¿team1 es nuestro local o nuestro visitante?
    const team1EsLocal = partido.equipoLocalId === iso1;
    salida.push({
      partidoId: partido.id,
      equipoLocalId: partido.equipoLocalId,
      equipoVisitanteId: partido.equipoVisitanteId,
      golesLocal: team1EsLocal ? ft[0] : ft[1],
      golesVisitante: team1EsLocal ? ft[1] : ft[0],
      goleadoresLocal: mapGoleadores(team1EsLocal ? m.goals1 : m.goals2),
      goleadoresVisitante: mapGoleadores(team1EsLocal ? m.goals2 : m.goals1),
    });
  }
  return salida;
}

/**
 * Agrega los goleadores de varios partidos en una tabla del torneo,
 * agrupando por (equipo, jugador). Los autogoles NO cuentan para el
 * goleador. PURA y testeable.
 */
export function agregarGoleadores(
  resultados: ResultadoIngerible[]
): GoleadorAgregado[] {
  const mapa = new Map<string, GoleadorAgregado>();
  const sumar = (nombre: string, equipoId: string, g: Goleador) => {
    if (g.enContra) return; // un autogol no es gol del jugador
    const clave = `${equipoId}|${nombre}`;
    const acc = mapa.get(clave) ?? { nombre, equipoId, goles: 0, penales: 0 };
    acc.goles += 1;
    if (g.penal) acc.penales += 1;
    mapa.set(clave, acc);
  };
  for (const r of resultados) {
    for (const gl of r.goleadoresLocal) sumar(gl.nombre, r.equipoLocalId, gl);
    for (const gv of r.goleadoresVisitante) sumar(gv.nombre, r.equipoVisitanteId, gv);
  }
  return [...mapa.values()].sort(
    (a, b) => b.goles - a.goles || a.nombre.localeCompare(b.nombre)
  );
}

/** Tabla de goleadores del torneo (en vivo desde openfootball). */
export async function obtenerGoleadores(): Promise<GoleadorAgregado[]> {
  const res = await fetch(URL_2026, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`openfootball respondió ${res.status}`);
  const data = (await res.json()) as { matches?: MatchOF[] };
  return agregarGoleadores(emparejarMatches(data.matches ?? []));
}

/**
 * Trae los partidos del Mundial 2026 que YA tienen marcador y los empareja
 * con nuestro calendario. Hace el fetch (openfootball) y delega en
 * `emparejarMatches`.
 */
export async function obtenerResultadosParaIngerir(): Promise<ResultadoIngerible[]> {
  const res = await fetch(URL_2026, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`openfootball respondió ${res.status}`);
  const data = (await res.json()) as { matches?: MatchOF[] };
  return emparejarMatches(data.matches ?? []);
}
