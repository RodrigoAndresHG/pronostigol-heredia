/**
 * Post-build: embebe dist/index.html en un módulo TS (api/_htmlBase.ts) que
 * api/meta.ts importa.
 *
 * Por qué: los archivos sueltos (como dist/index.html) NO viajan al bundle de
 * las funciones serverless de Vercel de forma fiable (includeFiles no funcionó).
 * Embeberlo como código garantiza que el bundler lo incluya. El index.html
 * construido tiene rutas de assets con hash, así que hay que regenerarlo en
 * cada build — por eso es post-build y no estático.
 *
 * Se ejecuta dentro de `npm run build`, después de `vite build`.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distIndex = join(process.cwd(), 'dist', 'index.html');
const salida = join(process.cwd(), 'api', '_htmlBase.ts');

if (!existsSync(distIndex)) {
  console.error('[incrustar-html] No existe dist/index.html — ¿corriste vite build antes?');
  process.exit(1);
}

const html = readFileSync(distIndex, 'utf-8');
// Lo guardamos como string JSON escapado (seguro para cualquier contenido).
const modulo = `/**
 * GENERADO AUTOMÁTICAMENTE por scripts/incrustar-html.mjs en cada build.
 * NO editar a mano. Es el dist/index.html embebido para que api/meta.ts lo
 * sirva con los meta tags OG inyectados (los crawlers no ejecutan JS).
 */
export const HTML_BASE = ${JSON.stringify(html)};
`;

writeFileSync(salida, modulo, 'utf-8');
console.log(`[incrustar-html] api/_htmlBase.ts generado (${Math.round(html.length / 1024)} KB)`);
