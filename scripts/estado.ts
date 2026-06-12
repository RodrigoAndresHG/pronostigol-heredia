/**
 * Chequeo de estado (ops). Cuenta predicciones y resultados en Supabase.
 *   node --env-file=.env.local --import tsx scripts/estado.ts
 */
import { createClient } from '@supabase/supabase-js';
import { PARTIDOS } from '../src/datos/partidos.js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan credenciales de Supabase en .env.local');
  process.exit(1);
}
const cli = createClient(url, key);

const { data: preds } = await cli.from('predicciones').select('partido_id, generada_en');
const filas = preds ?? [];
const distintos = [...new Set(filas.map((p) => p.partido_id))];

const porJornada: Record<string, number> = {};
for (const id of distintos) {
  const m = id.match(/-MD(\d)-/);
  const j = m ? `MD${m[1]}` : 'otro';
  porJornada[j] = (porJornada[j] || 0) + 1;
}

const { data: res } = await cli.from('resultados').select('partido_id, goles_local, goles_visitante');
const resultados = res ?? [];

console.log('═══ ESTADO PRONOSTIGOL ═══');
console.log(`Predicciones (generaciones totales): ${filas.length}`);
console.log(`Partidos con predicción publicada:   ${distintos.length} / ${PARTIDOS.length} partidos del torneo`);
console.log(`  Por jornada: ${JSON.stringify(porJornada)}`);
console.log(`Resultados ya ingeridos:             ${resultados.length}`);
if (resultados.length) {
  for (const r of resultados) console.log(`  ${r.partido_id}: ${r.goles_local}-${r.goles_visitante}`);
}
// Partidos de MD1 sin predicción (para detectar huecos antes del kickoff)
const md1 = PARTIDOS.filter((p) => p.id.includes('-MD1-'));
const md1SinPred = md1.filter((p) => !distintos.includes(p.id)).map((p) => p.id);
console.log(`MD1 sin predicción: ${md1SinPred.length ? md1SinPred.join(', ') : 'ninguno ✅'}`);
process.exit(0);
