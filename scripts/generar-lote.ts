/**
 * Generación de predicciones EN LOTE contra producción.
 *
 * Llama al endpoint /api/predecir (POST, con tu código admin) para varios
 * partidos de una sola corrida. Las predicciones se guardan en Supabase y
 * quedan visibles para el público — igual que si las generaras a mano.
 *
 * ─── Cómo se usa ──────────────────────────────────────────────────────
 *
 *   1. Exporta tu código admin y la URL (NUNCA los pongas en el código):
 *        export CODIGO_ADMIN="el-valor-de-vercel"
 *        export BASE_URL="https://pronostigol.rodriheredia.com"
 *
 *   2. Corre con el alcance que quieras:
 *        npm run generar-lote -- md1     # solo Jornada 1 (12 partidos)
 *        npm run generar-lote -- md2     # solo Jornada 2
 *        npm run generar-lote -- md3     # solo Jornada 3
 *        npm run generar-lote -- todos   # las 72
 *        npm run generar-lote            # por defecto: md1
 *
 *   Por defecto SALTA los partidos que ya tienen predicción (para poder
 *   reanudar sin gastar tokens). Para forzar regeneración:
 *        npm run generar-lote -- todos --forzar
 *
 * ─── Notas ────────────────────────────────────────────────────────────
 *   - Es secuencial a propósito (1 partido a la vez) para no toparse con
 *     límites de tasa de las IAs ni timeouts. ~5-20s por partido.
 *   - Si una falla, sigue con las demás y reporta al final.
 */

import { PARTIDOS } from '../src/datos/partidos.js';
import { equipoPorId } from '../src/datos/equipos.js';

// ─── Configuración desde entorno ─────────────────────────────────────

const CODIGO_ADMIN = process.env.CODIGO_ADMIN;
const BASE_URL = process.env.BASE_URL || 'https://pronostigol.rodriheredia.com';

if (!CODIGO_ADMIN) {
  console.error('❌ Falta la variable CODIGO_ADMIN.');
  console.error('   Corre primero: export CODIGO_ADMIN="tu-codigo-de-vercel"');
  process.exit(1);
}

// ─── Argumentos ──────────────────────────────────────────────────────

const args = process.argv.slice(2);
const forzar = args.includes('--forzar');
const alcance = args.find((a) => !a.startsWith('--')) ?? 'md1';

const FILTROS: Record<string, (id: string) => boolean> = {
  md1: (id) => id.includes('-MD1-'),
  md2: (id) => id.includes('-MD2-'),
  md3: (id) => id.includes('-MD3-'),
  todos: () => true,
};

const filtro = FILTROS[alcance];
if (!filtro) {
  console.error(`❌ Alcance desconocido: "${alcance}". Usa: md1 | md2 | md3 | todos`);
  process.exit(1);
}

const objetivo = PARTIDOS.filter((p) => filtro(p.id));

// ─── Helpers ─────────────────────────────────────────────────────────

const etiqueta = (id: string) => {
  const p = PARTIDOS.find((x) => x.id === id)!;
  return `${equipoPorId(p.equipoLocalId).id} vs ${equipoPorId(p.equipoVisitanteId).id}`;
};

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function yaExiste(partidoId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/predecir?partidoId=${encodeURIComponent(partidoId)}`
    );
    return res.status === 200;
  } catch {
    return false;
  }
}

async function generar(partidoId: string): Promise<{ ok: boolean; detalle: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/predecir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Codigo-Admin': CODIGO_ADMIN!,
      },
      body: JSON.stringify({ partidoId }),
    });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      return { ok: false, detalle: cuerpo?.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    const v = data.veredicto ?? '?';
    const erroresIA = (data.respuestasIA ?? []).filter((r: { error?: string }) => r.error).length;
    const nota = erroresIA > 0 ? ` (⚠️ ${erroresIA} IA con error)` : '';
    return { ok: true, detalle: `${v}${nota}` };
  } catch (err) {
    return { ok: false, detalle: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Ejecución ───────────────────────────────────────────────────────

console.log(`\n🎯 Generación en lote — alcance: ${alcance} (${objetivo.length} partidos)`);
console.log(`   Destino: ${BASE_URL}`);
console.log(`   Forzar regeneración: ${forzar ? 'sí' : 'no (salta los que ya existen)'}\n`);

let generadas = 0;
let saltadas = 0;
const fallidas: { id: string; detalle: string }[] = [];

for (let i = 0; i < objetivo.length; i++) {
  const p = objetivo[i];
  const prefijo = `[${i + 1}/${objetivo.length}] ${etiqueta(p.id)} (${p.id})`;

  if (!forzar && (await yaExiste(p.id))) {
    console.log(`⏭️  ${prefijo} — ya existe, salto`);
    saltadas++;
    continue;
  }

  process.stdout.write(`⏳ ${prefijo} — generando… `);
  const r = await generar(p.id);
  if (r.ok) {
    console.log(`✅ ${r.detalle}`);
    generadas++;
  } else {
    console.log(`❌ ${r.detalle}`);
    fallidas.push({ id: p.id, detalle: r.detalle });
  }

  // Pausa corta entre partidos para ser amable con las APIs.
  if (i < objetivo.length - 1) await dormir(1500);
}

// ─── Resumen ─────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────');
console.log(`✅ Generadas:  ${generadas}`);
console.log(`⏭️  Saltadas:   ${saltadas}`);
console.log(`❌ Fallidas:   ${fallidas.length}`);
if (fallidas.length > 0) {
  console.log('\nDetalle de fallos:');
  for (const f of fallidas) console.log(`   ${f.id}: ${f.detalle}`);
  console.log('\nPuedes volver a correr el mismo comando; saltará las que ya quedaron.');
}
console.log('');
process.exit(fallidas.length > 0 ? 1 : 0);
