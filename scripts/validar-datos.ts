/**
 * Validación de integridad del dataset.
 *
 * Se ejecuta con:
 *   node --experimental-strip-types scripts/validar-datos.ts
 *
 * Verifica:
 *   - 48 equipos totales.
 *   - 4 equipos por grupo, 12 grupos (A-L).
 *   - IDs de equipo únicos.
 *   - 72 partidos totales (12 grupos × 6 partidos).
 *   - Cada equipo juega exactamente 3 partidos.
 *   - Todo partido referencia equipos que existen.
 *   - Equipos local y visitante están en el mismo grupo.
 *   - Cada par de equipos del mismo grupo se enfrenta exactamente 1 vez.
 *   - 12 grupos × 3 matchdays × 2 partidos = 72, correctamente repartidos.
 */

import { EQUIPOS, EQUIPOS_POR_ID } from '../src/datos/equipos.ts';
import { PARTIDOS } from '../src/datos/partidos.ts';
import { LETRAS_GRUPOS } from '../src/datos/grupos.ts';

let errores = 0;
const fallar = (msg: string) => {
  console.error('❌ ' + msg);
  errores++;
};
const ok = (msg: string) => console.log('✓ ' + msg);

// ── Equipos ───────────────────────────────────────────────────────
if (EQUIPOS.length !== 48) fallar(`Equipos: esperaba 48, hay ${EQUIPOS.length}`);
else ok(`48 equipos`);

const idsVistos = new Set<string>();
for (const equipo of EQUIPOS) {
  if (idsVistos.has(equipo.id)) fallar(`ID duplicado: ${equipo.id}`);
  idsVistos.add(equipo.id);
}
if (idsVistos.size === 48) ok(`48 IDs únicos`);

// ── Grupos ────────────────────────────────────────────────────────
for (const letra of LETRAS_GRUPOS) {
  const equiposDelGrupo = EQUIPOS.filter((e) => e.grupo === letra);
  if (equiposDelGrupo.length !== 4) {
    fallar(`Grupo ${letra}: ${equiposDelGrupo.length} equipos, debería ser 4`);
  }
}
ok(`12 grupos × 4 equipos`);

// ── Partidos ──────────────────────────────────────────────────────
if (PARTIDOS.length !== 72) fallar(`Partidos: esperaba 72, hay ${PARTIDOS.length}`);
else ok(`72 partidos`);

// Cada equipo juega 3 veces.
const conteoPartidos = new Map<string, number>();
for (const partido of PARTIDOS) {
  if (!EQUIPOS_POR_ID[partido.equipoLocalId]) {
    fallar(`Partido ${partido.id}: equipo local desconocido ${partido.equipoLocalId}`);
  }
  if (!EQUIPOS_POR_ID[partido.equipoVisitanteId]) {
    fallar(`Partido ${partido.id}: equipo visitante desconocido ${partido.equipoVisitanteId}`);
  }
  conteoPartidos.set(partido.equipoLocalId, (conteoPartidos.get(partido.equipoLocalId) ?? 0) + 1);
  conteoPartidos.set(partido.equipoVisitanteId, (conteoPartidos.get(partido.equipoVisitanteId) ?? 0) + 1);

  // Mismo grupo
  const local = EQUIPOS_POR_ID[partido.equipoLocalId];
  const visitante = EQUIPOS_POR_ID[partido.equipoVisitanteId];
  if (local && visitante && local.grupo !== visitante.grupo) {
    fallar(`Partido ${partido.id}: ${local.id} (${local.grupo}) vs ${visitante.id} (${visitante.grupo}) — grupos distintos`);
  }
  if (local && partido.grupo && local.grupo !== partido.grupo) {
    fallar(`Partido ${partido.id}: campo grupo=${partido.grupo} no coincide con grupo del local ${local.grupo}`);
  }
}

const equiposQueNoJueganTres: string[] = [];
for (const equipo of EQUIPOS) {
  if (conteoPartidos.get(equipo.id) !== 3) {
    equiposQueNoJueganTres.push(`${equipo.id}=${conteoPartidos.get(equipo.id) ?? 0}`);
  }
}
if (equiposQueNoJueganTres.length > 0) {
  fallar(`Equipos sin 3 partidos: ${equiposQueNoJueganTres.join(', ')}`);
} else {
  ok(`Todos los equipos juegan exactamente 3 partidos`);
}

// Cada par del mismo grupo se enfrenta exactamente 1 vez
const enfrentamientosVistos = new Set<string>();
for (const partido of PARTIDOS) {
  const par = [partido.equipoLocalId, partido.equipoVisitanteId].sort().join('-');
  if (enfrentamientosVistos.has(par)) {
    fallar(`Enfrentamiento duplicado: ${par}`);
  }
  enfrentamientosVistos.add(par);
}
ok(`Sin enfrentamientos duplicados (${enfrentamientosVistos.size} pares)`);

// ── Resumen ───────────────────────────────────────────────────────
console.log('');
if (errores === 0) {
  console.log('✅ Datos íntegros.');
  process.exit(0);
} else {
  console.error(`❌ ${errores} error(es) encontrados.`);
  process.exit(1);
}
