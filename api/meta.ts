import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolverDatosPartido } from './_lib/datosPartido.js';
import { HTML_BASE } from './_htmlBase.js';

/**
 * Inyecta meta tags Open Graph por partido en el HTML que reciben los
 * crawlers de redes sociales.
 *
 * EL PROBLEMA: es un SPA Vite. Los scrapers (WhatsApp, Twitter, Facebook,
 * Telegram) NO ejecutan JavaScript, así que no ven los meta tags que React
 * pondría. Sin esto, todos los partidos comparten el mismo preview genérico.
 *
 * LA SOLUCIÓN: vercel.json reescribe /partido/:id → /api/meta. Esta función
 * lee el index.html ya construido (dist/), reemplaza el bloque entre los
 * comentarios <!-- OG:INICIO --> y <!-- OG:FIN --> por meta tags específicos
 * del partido, y devuelve el HTML. El navegador del usuario hidrata React
 * encima sin problema; el crawler ve los OG correctos.
 *
 * Las rutas que NO son /partido (inicio, calendario…) sirven el index.html
 * estático con los valores por defecto del bloque — no pasan por aquí.
 */

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Tolerante: el marcador de apertura puede llevar texto descriptivo
// (<!-- OG:INICIO — ... -->), así que matcheamos desde "OG:INICIO" hasta "OG:FIN -->".
const REGION_OG = /<!-- OG:INICIO[\s\S]*?OG:FIN -->/;
const REGION_TITULO = /<title>[\s\S]*?<\/title>/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const partidoId = String(req.query.idPartido ?? req.query.partidoId ?? '');
  const host = req.headers.host ?? 'pronostigol.rodriheredia.com';
  const origin = `https://${host}`;

  let html = HTML_BASE;

  // Valores por defecto.
  let titulo = 'PronostiGol HeredIA — Predicciones Mundial 2026';
  let desc =
    'Predicciones del Mundial 2026 con consenso de 3 IAs y señales de valor vs mercado.';
  let alt = 'PronostiGol HeredIA';
  let version = '0';

  try {
    const datos = await resolverDatosPartido(partidoId);
    if (datos) {
      const { local, visitante, prediccion, generadaEn } = datos;
      titulo = `${local.nombre} vs ${visitante.nombre} — Predicción HeredIA`;
      alt = `Predicción ${local.nombre} vs ${visitante.nombre}`;
      if (prediccion) {
        const pf = prediccion.probabilidadFinal;
        const pares: [string, number][] = [
          [local.nombre, pf.local],
          ['empate', pf.empate],
          [visitante.nombre, pf.visitante],
        ];
        pares.sort((a, b) => b[1] - a[1]);
        const [nombreDom, probDom] = pares[0];
        const veredicto = prediccion.veredicto === 'consenso' ? 'Consenso' : 'Desacuerdo';
        desc = `${veredicto} de 3 IAs: ${Math.round(probDom * 100)}% ${nombreDom}. Mundial 2026.`;
        version = generadaEn ?? '0';
      } else {
        desc = `Predicción de las 3 IAs para ${local.nombre} vs ${visitante.nombre}. Mundial 2026.`;
      }
    }
  } catch {
    /* usa los valores por defecto */
  }

  const urlCanon = `${origin}/partido/${partidoId}`;
  const imagen = `${origin}/api/og-imagen?partidoId=${encodeURIComponent(partidoId)}&v=${encodeURIComponent(version)}`;

  const bloqueOG = `<!-- OG:INICIO -->
    <meta name="description" content="${esc(desc)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="PronostiGol HeredIA" />
    <meta property="og:title" content="${esc(titulo)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${esc(urlCanon)}" />
    <meta property="og:image" content="${esc(imagen)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(alt)}" />
    <meta property="og:locale" content="es_EC" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(titulo)}" />
    <meta name="twitter:description" content="${esc(desc)}" />
    <meta name="twitter:image" content="${esc(imagen)}" />
    <!-- OG:FIN -->`;

  html = html
    .replace(REGION_TITULO, `<title>${esc(titulo)}</title>`)
    .replace(REGION_OG, bloqueOG);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
