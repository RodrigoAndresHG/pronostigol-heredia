/**
 * Verificación de la ingesta de resultados (Fase 9). Throwaway.
 *
 *   node --env-file=.env.local --import tsx scripts/verificar-ingesta.ts
 *
 * Comprueba: fetch de openfootball + emparejamiento con nuestro calendario,
 * y un round-trip a la tabla `resultados` con un ID de prueba que se borra.
 */

import { obtenerResultadosParaIngerir } from '../api/_lib/openfootball.js';
import { guardarResultado, leerResultado } from '../api/_lib/resultados.js';
import { obtenerCliente } from '../api/_lib/almacen.js';

const aIngerir = await obtenerResultadosParaIngerir();
console.log(`openfootball → partidos jugados que matchean: ${aIngerir.length}`);
for (const r of aIngerir.slice(0, 5)) {
  console.log(`  ${r.partidoId}: ${r.golesLocal}-${r.golesVisitante}`);
}

const TEST_ID = 'ZZZ-TEST-DELETE';
const g = await guardarResultado(TEST_ID, 3, 1);
console.log(`round-trip guardar: ${g.partidoId} → ${g.resultadoReal}`);
const leido = await leerResultado(TEST_ID);
console.log(`round-trip leer: ${leido?.golesLocal}-${leido?.golesVisitante} (${leido?.resultadoReal})`);

const cli = obtenerCliente();
if (cli) {
  await cli.from('resultados').delete().eq('partido_id', TEST_ID);
  console.log('limpieza: fila de prueba borrada ✅');
}
process.exit(0);
