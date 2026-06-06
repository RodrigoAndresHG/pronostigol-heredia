import React from 'react';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ImageResponse } from '@vercel/og';
import { resolverDatosPartido } from './_lib/datosPartido.js';
import { FUENTES_OG } from './_fontsData.js';
import type { DistribucionResultado } from '../src/tipos/index.js';

/**
 * Genera la imagen compartible (1200×630 PNG) de una predicción.
 *
 *   GET /api/og-imagen?partidoId=A-MD1-1
 *
 * IMPORTANTE — sin JSX a propósito: se usa React.createElement (alias `h`)
 * en lugar de JSX. El JSX en /api no se transpila de forma fiable en Vercel
 * (su tsconfig no cubre /api con el flag jsx), lo que dejaba `<div>` crudos
 * en el bundle. createElement es TS puro y compila idéntico en todos lados.
 *
 * Fondo midnight sólido (no foto): un PNG con foto pesa >800KB y WhatsApp no
 * muestra el thumbnail; sólido pesa ~65KB y el texto se lee nítido. La marca
 * es la tipografía mono + verde/cyan, no la foto.
 *
 * Runtime Node. Fuentes embebidas como código (api/_fontsData.ts).
 */

export const config = { runtime: 'nodejs' };

const h = React.createElement;
type Estilo = React.CSSProperties;

const C = {
  fondo: '#0A1628',
  fondoAlt: '#0F1E33',
  titulo: '#F8FAFC',
  cuerpo: '#CBD5E1',
  mute: '#64748B',
  linea: '#1E2D47',
  verde: '#00D27A',
  cyan: '#38BDF8',
  ambar: '#F5B700',
};

/** Helper: div con estilo. Satori exige display:flex en todo div con hijos. */
function caja(style: Estilo, ...hijos: React.ReactNode[]) {
  return h('div', { style: { display: 'flex', ...style } }, ...hijos);
}
/** Helper: texto (div de una línea). */
function txt(style: Estilo, contenido: React.ReactNode) {
  return h('div', { style: { display: 'flex', ...style } }, contenido);
}

function porcentajes(d: DistribucionResultado): [number, number, number] {
  const v = [d.local, d.empate, d.visitante].map((x) => Math.round(x * 100));
  const ajuste = 100 - (v[0] + v[1] + v[2]);
  const i = v.indexOf(Math.max(...v));
  v[i] += ajuste;
  return [v[0], v[1], v[2]];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const partidoId = String(req.query.partidoId ?? '');

  let datos = null;
  try {
    datos = await resolverDatosPartido(partidoId);
  } catch {
    /* fallback abajo */
  }

  const codigoLocal = datos?.local.id ?? 'PRO';
  const codigoVisitante = datos?.visitante.id ?? 'GOL';
  const nombreLocal = datos?.local.nombre ?? 'PronostiGol';
  const nombreVisitante = datos?.visitante.nombre ?? 'HeredIA';
  const contexto = datos
    ? `${datos.partido.grupo ? `GRUPO ${datos.partido.grupo}` : datos.partido.fase.toUpperCase()}${datos.estadioNombre ? ` · ${datos.estadioNombre.toUpperCase()}` : ''}`
    : 'MUNDIAL 2026';

  const pred = datos?.prediccion ?? null;

  // ── Bloque de datos (predicción) ──────────────────────────────────
  let bloqueDatos: React.ReactNode;
  if (pred) {
    const [pl, pe, pv] = porcentajes(pred.probabilidadFinal);
    const maxima = Math.max(pl, pe, pv);
    const dom =
      maxima === pl
        ? { pct: pl, etiqueta: `GANA ${codigoLocal}`, color: C.verde }
        : maxima === pv
          ? { pct: pv, etiqueta: `GANA ${codigoVisitante}`, color: C.cyan }
          : { pct: pe, etiqueta: 'EMPATE', color: C.mute };
    const esConsenso = pred.veredicto === 'consenso';
    const colorVer = esConsenso ? C.verde : C.cyan;

    bloqueDatos = caja(
      { flexDirection: 'column' },
      // Veredicto
      caja(
        {
          alignItems: 'center',
          border: `1px solid ${colorVer}55`,
          borderRadius: 10,
          padding: '10px 18px',
          marginBottom: 26,
        },
        txt(
          { fontFamily: 'JetBrains Mono', fontSize: 18, letterSpacing: 2, color: colorVer },
          esConsenso ? 'CONSENSO · 3 IAs COINCIDEN' : 'DESACUERDO · 3 IAs DIVIDIDAS'
        )
      ),
      // Número dominante + barra
      caja(
        { alignItems: 'flex-end' },
        caja(
          { flexDirection: 'column', marginRight: 56 },
          txt(
            { fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 96, color: dom.color, lineHeight: 1 },
            `${dom.pct}%`
          ),
          txt(
            { fontFamily: 'JetBrains Mono', fontSize: 20, letterSpacing: 2, color: C.mute, marginTop: 8 },
            dom.etiqueta
          )
        ),
        caja(
          { flexDirection: 'column', flexGrow: 1, minWidth: 0, paddingBottom: 8 },
          caja(
            { width: '100%', height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: C.linea },
            // Los dos primeros segmentos con ancho fijo; el último rellena el
            // resto con flexGrow para absorber el redondeo y NO desbordarse.
            caja({ width: `${pl}%`, flexShrink: 0, backgroundColor: C.verde }),
            caja({ width: `${pe}%`, flexShrink: 0, backgroundColor: '#475569' }),
            caja({ flexGrow: 1, backgroundColor: C.cyan })
          ),
          caja(
            { fontFamily: 'JetBrains Mono', fontSize: 22, marginTop: 14 },
            txt({ color: C.verde, marginRight: 30 }, `${codigoLocal} ${pl}%`),
            txt({ color: C.mute, marginRight: 30 }, `EMPATE ${pe}%`),
            txt({ color: C.cyan }, `${codigoVisitante} ${pv}%`)
          )
        )
      ),
      // Señal de valor (opcional)
      pred.senalValor
        ? caja(
            {
              alignItems: 'center',
              marginTop: 24,
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${C.ambar}55`,
            },
            txt(
              { fontFamily: 'JetBrains Mono', fontSize: 18, letterSpacing: 1, color: C.ambar },
              `SEÑAL DE VALOR · +${pred.senalValor.delta} pts ${pred.senalValor.direccion.toUpperCase()}`
            )
          )
        : null
    );
  } else {
    bloqueDatos = caja(
      {},
      txt(
        { fontFamily: 'Inter', fontSize: 26, color: C.mute },
        'Predicción de las 3 IAs · pronostigol.rodriheredia.com'
      )
    );
  }

  // ── Tarjeta completa ──────────────────────────────────────────────
  const tarjeta = caja(
    {
      width: '1200px',
      height: '630px',
      boxSizing: 'border-box',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '56px 64px',
      fontFamily: 'Inter',
      color: C.titulo,
      background: `linear-gradient(135deg, ${C.fondoAlt} 0%, ${C.fondo} 55%, ${C.fondo} 100%)`,
    },
    // Cabecera
    caja(
      { justifyContent: 'space-between', alignItems: 'center' },
      txt(
        { fontFamily: 'JetBrains Mono', fontSize: 22, letterSpacing: 4, color: C.verde },
        'PRONOSTIGOL HEREDIA'
      ),
      txt({ fontFamily: 'JetBrains Mono', fontSize: 18, letterSpacing: 2, color: C.mute }, contexto)
    ),
    // Héroe
    caja(
      { flexDirection: 'column' },
      caja(
        { alignItems: 'center' },
        txt(
          { fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 128, color: C.titulo, lineHeight: 1 },
          codigoLocal
        ),
        txt(
          { fontFamily: 'Inter', fontStyle: 'italic', fontSize: 40, color: C.mute, margin: '0 32px' },
          'vs'
        ),
        txt(
          { fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 128, color: C.titulo, lineHeight: 1 },
          codigoVisitante
        )
      ),
      caja(
        { marginTop: 10 },
        txt({ fontFamily: 'Inter', fontSize: 28, color: C.cuerpo }, `${nombreLocal} — ${nombreVisitante}`)
      )
    ),
    // Datos
    bloqueDatos,
    // Pie
    caja(
      { justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.linea}`, paddingTop: 20 },
      txt({ fontFamily: 'JetBrains Mono', fontSize: 18, color: C.mute }, 'pronostigol.rodriheredia.com'),
      txt({ fontFamily: 'JetBrains Mono', fontSize: 18, color: C.verde }, 'CLAUDE · GPT · GEMINI')
    )
  );

  const imagen = new ImageResponse(tarjeta, { width: 1200, height: 630, fonts: FUENTES_OG });
  const buffer = Buffer.from(await imagen.arrayBuffer());
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  return res.status(200).send(buffer);
}
