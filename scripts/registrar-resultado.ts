/**
 * Registra MANUALMENTE el marcador de un partido cuando openfootball aún no
 * lo publicó (su actualización va con retraso de horas). Enciende al instante
 * el Boletín de Calibración, el Termómetro y la Autopsia, que es justo el
 * momento más viral: "¿acertaron las IAs?".
 *
 * El cron `cerrar-partidos` (openfootball) reconcilia después: el upsert es
 * idempotente, así que si openfootball trae el mismo marcador, no cambia nada.
 *
 *   node --env-file=.env.local --import tsx scripts/registrar-resultado.ts A-MD1-1 2 0
 *   (partidoId, golesLOCAL, golesVISITANTE — en el orden de NUESTRO calendario)
 */
import { guardarResultado } from '../api/_lib/resultados.js';
import { partidoPorId } from '../src/datos/partidos.js';
import { equipoPorId } from '../src/datos/equipos.js';

const [id, gl, gv] = process.argv.slice(2);
if (!id || gl === undefined || gv === undefined) {
  console.error('Uso: registrar-resultado.ts <partidoId> <golesLocal> <golesVisitante>');
  process.exit(1);
}

const partido = partidoPorId(id);
if (!partido) {
  console.error(`Partido no encontrado: ${id}`);
  process.exit(1);
}
const golesLocal = Number(gl);
const golesVisitante = Number(gv);
if (!Number.isInteger(golesLocal) || !Number.isInteger(golesVisitante) || golesLocal < 0 || golesVisitante < 0) {
  console.error('Goles inválidos (deben ser enteros ≥ 0).');
  process.exit(1);
}

const local = equipoPorId(partido.equipoLocalId);
const visitante = equipoPorId(partido.equipoVisitanteId);
console.log(`Registrando ${id}:  ${local.nombre} ${golesLocal}–${golesVisitante} ${visitante.nombre}`);

const r = await guardarResultado(id, golesLocal, golesVisitante);
console.log(`✅ Guardado en Supabase · resultado: ${r.resultadoReal}`);
console.log('   El Boletín, el Termómetro y la Autopsia ya tienen este partido.');
process.exit(0);
