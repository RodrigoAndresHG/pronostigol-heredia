import type { Partido, LetraGrupo } from '../tipos';
import { LETRAS_GRUPOS, equiposDelGrupo } from './grupos';

/**
 * Generación mock del calendario de la fase de grupos del Mundial 2026.
 *
 * ⚠️ Las fechas y sedes son ilustrativas. El calendario oficial real lo
 * tomaremos en la Fase 4 de football-data.org. Para la UI nos basta
 * con tener 72 partidos repartidos en el rango 11–22 de junio de 2026.
 *
 * Reglas de generación dentro de cada grupo de 4 equipos [t1, t2, t3, t4]:
 *   MD1: t1 vs t2  ·  t3 vs t4
 *   MD2: t1 vs t3  ·  t2 vs t4
 *   MD3: t1 vs t4  ·  t2 vs t3
 */

/** 16 sedes anunciadas para el Mundial 2026. */
const SEDES = [
  // México
  { ciudad: 'Estadio Azteca, CDMX',            pais: 'México' as const },
  { ciudad: 'Estadio Akron, Guadalajara',      pais: 'México' as const },
  { ciudad: 'BBVA, Monterrey',                 pais: 'México' as const },
  // Estados Unidos
  { ciudad: 'MetLife Stadium, Nueva York',     pais: 'Estados Unidos' as const },
  { ciudad: 'SoFi Stadium, Los Ángeles',       pais: 'Estados Unidos' as const },
  { ciudad: 'AT&T Stadium, Dallas',            pais: 'Estados Unidos' as const },
  { ciudad: 'NRG Stadium, Houston',            pais: 'Estados Unidos' as const },
  { ciudad: 'Mercedes-Benz, Atlanta',          pais: 'Estados Unidos' as const },
  { ciudad: 'Gillette, Boston',                pais: 'Estados Unidos' as const },
  { ciudad: 'Arrowhead, Kansas City',          pais: 'Estados Unidos' as const },
  { ciudad: 'Hard Rock, Miami',                pais: 'Estados Unidos' as const },
  { ciudad: 'Lincoln Financial, Filadelfia',   pais: 'Estados Unidos' as const },
  { ciudad: 'Levi\'s Stadium, San Francisco',  pais: 'Estados Unidos' as const },
  { ciudad: 'Lumen Field, Seattle',            pais: 'Estados Unidos' as const },
  // Canadá
  { ciudad: 'BMO Field, Toronto',              pais: 'Canadá' as const },
  { ciudad: 'BC Place, Vancouver',             pais: 'Canadá' as const },
];

/**
 * Fechas base por matchday (UTC). Cada matchday cubre 4 días con 6
 * partidos por día.
 */
const FECHAS_BASE_UTC = {
  MD1: '2026-06-11',
  MD2: '2026-06-17',
  MD3: '2026-06-21',
};

/** Horarios de cada partido del día, en UTC (mediodía a 9pm CDMX). */
const HORARIOS_UTC = ['18:00', '21:00', '00:00', '03:00'] as const;

/**
 * Genera los 6 partidos de un grupo dado, repartidos en MD1/MD2/MD3.
 * El índice del grupo (0..11) define el offset de día dentro del matchday.
 */
function partidosDeGrupo(letra: LetraGrupo, indiceGrupo: number): Partido[] {
  const [t1, t2, t3, t4] = equiposDelGrupo(letra);
  const partidos: Partido[] = [];

  // Cada matchday se reparte en 4 días: 3 grupos por día (12 grupos / 4 días).
  const diaOffsetDentroMD = indiceGrupo % 4;
  // Cada par de partidos del mismo grupo en el mismo MD se separa por slots.
  const slotsPorMD: [number, number] = indiceGrupo < 4 ? [0, 2] : indiceGrupo < 8 ? [1, 3] : [0, 2];

  const enfrentamientos = [
    { md: 'MD1' as const, locales: [t1, t3], visitantes: [t2, t4] },
    { md: 'MD2' as const, locales: [t1, t2], visitantes: [t3, t4] },
    { md: 'MD3' as const, locales: [t1, t2], visitantes: [t4, t3] },
  ];

  let contador = 1;
  for (const { md, locales, visitantes } of enfrentamientos) {
    for (let i = 0; i < 2; i++) {
      const local = locales[i];
      const visitante = visitantes[i];
      const fechaBase = new Date(FECHAS_BASE_UTC[md] + 'T00:00:00Z');
      fechaBase.setUTCDate(fechaBase.getUTCDate() + diaOffsetDentroMD);
      const [hh, mm] = HORARIOS_UTC[slotsPorMD[i]].split(':').map(Number);
      fechaBase.setUTCHours(hh, mm, 0, 0);

      // Sede: rotamos por el array para que cada grupo use distintas.
      // El partido inaugural del torneo (MEX vs CRO, MD1) lo forzamos en Azteca.
      const indiceSede = (indiceGrupo * 6 + contador - 1) % SEDES.length;
      let sede = SEDES[indiceSede];
      if (letra === 'A' && md === 'MD1' && local.id === 'MEX') {
        sede = SEDES[0]; // Azteca
      }

      partidos.push({
        id: `${md}-${letra}-${contador}`,
        fechaISO: fechaBase.toISOString(),
        sede: sede.ciudad,
        paisAnfitrion: sede.pais,
        equipoLocalId: local.id,
        equipoVisitanteId: visitante.id,
        fase: 'grupos',
        grupo: letra,
        estado: 'programado',
      });
      contador++;
    }
  }

  return partidos;
}

/**
 * Calendario completo de la fase de grupos (72 partidos), ordenado por fecha.
 */
export const PARTIDOS: Partido[] = LETRAS_GRUPOS.flatMap((letra, indice) =>
  partidosDeGrupo(letra, indice)
).sort((a, b) => a.fechaISO.localeCompare(b.fechaISO));

/**
 * Índice por ID para acceso O(1) — usado en la página de detalle.
 */
export const PARTIDOS_POR_ID: Record<string, Partido> = Object.fromEntries(
  PARTIDOS.map((partido) => [partido.id, partido])
);

export function partidoPorId(id: string): Partido | undefined {
  return PARTIDOS_POR_ID[id];
}
