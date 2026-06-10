/**
 * Regeneración LOCAL de predicciones (usa el código de este checkout, no
 * producción) y guardado en Supabase.
 *
 * Sirve para aplicar de inmediato un cambio en el pipeline (p. ej. el
 * anclaje a hechos) sin esperar a desplegar: genera con el código local
 * y persiste en la misma tabla que lee la app.
 *
 *   node --env-file=.env.local --import tsx scripts/regenerar-local.ts E-MD1-2 [otros…]
 *
 * Llama a las 3 IAs reales (gasta API) y escribe en Supabase. Úsalo con
 * intención. Si no pasas IDs, no hace nada.
 */

import { predecir } from '../api/_lib/core.js';
import { guardarPrediccion, supabaseConfigurado } from '../api/_lib/almacen.js';

const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));

if (ids.length === 0) {
  console.error('Uso: regenerar-local.ts <partidoId> [partidoId…]');
  process.exit(1);
}

const guardar = supabaseConfigurado();
console.log(`Supabase: ${guardar ? 'configurado (se guardará)' : 'NO configurado (solo muestra)'}\n`);

for (const id of ids) {
  console.log(`── ${id} ──────────────────────────────`);
  try {
    const pred = await predecir(id);
    console.log(`veredicto: ${pred.veredicto}`);
    if (pred.dossier) {
      console.log(`dossier: ${pred.dossier.local.dt}  vs  ${pred.dossier.visitante.dt}`);
    } else {
      console.log('dossier: (sin hechos — el partido no está en el dataset)');
    }
    for (const r of pred.respuestasIA) {
      console.log(`  ${r.ia}: ${r.error ? 'ERROR ' + r.error : r.explicacion}`);
    }
    if (guardar) {
      const { generadaEn } = await guardarPrediccion(id, pred);
      console.log(`✅ guardada: ${generadaEn}`);
    }
  } catch (err) {
    console.log(`❌ ${err instanceof Error ? err.message : String(err)}`);
  }
  console.log('');
}

process.exit(0);
