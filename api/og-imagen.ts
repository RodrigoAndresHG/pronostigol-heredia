import React from 'react';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ImageResponse } from '@vercel/og';
import { resolverDatosPartido } from './_lib/datosPartido.js';
import { FUENTES_OG } from './_fontsData.js';
import type {
  DistribucionResultado,
  Prediccion,
  RespuestaIA,
} from '../src/tipos/index.js';

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

/** Párrafo que envuelve (Satori parte el texto dentro del ancho dado). */
function parrafo(style: Estilo, contenido: string) {
  return h('div', { style: { display: 'flex', ...style } }, contenido);
}

function corta(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}

/** El resultado dominante de una distribución, con su etiqueta y color. */
function dominante(
  d: DistribucionResultado,
  codigoLocal: string,
  codigoVisitante: string
): { pct: number; etiqueta: string; color: string } {
  const [pl, pe, pv] = porcentajes(d);
  const maxima = Math.max(pl, pe, pv);
  if (maxima === pl) return { pct: pl, etiqueta: `GANA ${codigoLocal}`, color: C.verde };
  if (maxima === pv) return { pct: pv, etiqueta: `GANA ${codigoVisitante}`, color: C.cyan };
  return { pct: pe, etiqueta: 'EMPATE', color: C.mute };
}

/**
 * Tarjeta vertical 1080×1920 "El Choque de IAs": enfrenta cara a cara las
 * dos IAs más opuestas en P(local). El desacuerdo, que antes moría en una
 * línea de texto gris, se vuelve el objeto compartible estrella.
 */
function tarjetaChoque(
  pred: Prediccion | null,
  codigoLocal: string,
  codigoVisitante: string,
  nombreLocal: string,
  nombreVisitante: string,
  contexto: string
): React.ReactNode {
  const validas = (pred?.respuestasIA ?? []).filter((r) => !r.error);
  const esConsenso = pred?.veredicto === 'consenso';

  // Las dos IAs más opuestas en P(local): una empuja al local, otra al rival.
  let duelo: React.ReactNode;
  if (validas.length >= 2) {
    const ordenadas = [...validas].sort(
      (a, b) => b.probabilidad.local - a.probabilidad.local
    );
    const alta = ordenadas[0];
    const baja = ordenadas[ordenadas.length - 1];
    duelo = caja(
      { flexDirection: 'column', width: '100%' },
      panelIA(alta, codigoLocal, codigoVisitante),
      caja(
        { justifyContent: 'center', alignItems: 'center', padding: '14px 0' },
        txt(
          { fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 44, color: C.mute, letterSpacing: 4 },
          'VS'
        )
      ),
      panelIA(baja, codigoLocal, codigoVisitante)
    );
  } else {
    duelo = caja(
      { padding: '40px 0' },
      txt(
        { fontFamily: 'Inter', fontSize: 30, color: C.mute },
        'Predicción de las 3 IAs · pronostigol.rodriheredia.com'
      )
    );
  }

  const colorHead = esConsenso ? C.verde : C.cyan;

  return caja(
    {
      width: '1080px',
      height: '1920px',
      boxSizing: 'border-box',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 64px',
      fontFamily: 'Inter',
      color: C.titulo,
      background: `linear-gradient(160deg, ${C.fondoAlt} 0%, ${C.fondo} 50%, ${C.fondo} 100%)`,
    },
    // Cabecera + héroe + titular
    caja(
      { flexDirection: 'column' },
      caja(
        { justifyContent: 'space-between', alignItems: 'center', marginBottom: 56 },
        txt(
          { fontFamily: 'JetBrains Mono', fontSize: 24, letterSpacing: 4, color: C.verde },
          'PRONOSTIGOL HEREDIA'
        ),
        txt({ fontFamily: 'JetBrains Mono', fontSize: 20, letterSpacing: 2, color: C.mute }, contexto)
      ),
      caja(
        { alignItems: 'center', justifyContent: 'center' },
        txt({ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 132, color: C.titulo, lineHeight: 1 }, codigoLocal),
        txt({ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 44, color: C.mute, margin: '0 36px' }, 'vs'),
        txt({ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 132, color: C.titulo, lineHeight: 1 }, codigoVisitante)
      ),
      caja(
        { justifyContent: 'center', marginTop: 14 },
        txt({ fontFamily: 'Inter', fontSize: 30, color: C.cuerpo }, `${nombreLocal} — ${nombreVisitante}`)
      ),
      caja(
        { justifyContent: 'center', marginTop: 40 },
        txt(
          { fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 46, letterSpacing: 2, color: colorHead, textAlign: 'center' },
          esConsenso ? 'LAS 3 IAs COINCIDEN' : 'LAS IAs NO SE PONEN DE ACUERDO'
        )
      )
    ),
    // El duelo
    duelo,
    // Pie
    caja(
      { justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.linea}`, paddingTop: 24 },
      txt({ fontFamily: 'JetBrains Mono', fontSize: 22, color: C.mute }, 'pronostigol.rodriheredia.com'),
      txt({ fontFamily: 'JetBrains Mono', fontSize: 22, color: C.verde }, 'CLAUDE · GPT · GEMINI')
    )
  );
}

/** Un panel del duelo: nombre de la IA, su pronóstico dominante y su frase. */
function panelIA(
  r: RespuestaIA,
  codigoLocal: string,
  codigoVisitante: string
): React.ReactNode {
  const dom = dominante(r.probabilidad, codigoLocal, codigoVisitante);
  return caja(
    {
      flexDirection: 'column',
      width: '100%',
      border: `1px solid ${dom.color}66`,
      borderRadius: 16,
      padding: '32px 36px',
      backgroundColor: '#0F1E3399',
    },
    caja(
      { justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
      txt({ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 38, color: C.titulo }, r.ia),
      caja(
        { flexDirection: 'column', alignItems: 'flex-end' },
        txt({ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 52, color: dom.color, lineHeight: 1 }, `${dom.pct}%`),
        txt({ fontFamily: 'JetBrains Mono', fontSize: 19, letterSpacing: 1, color: C.mute, marginTop: 6 }, dom.etiqueta)
      )
    ),
    parrafo(
      { fontFamily: 'Inter', fontSize: 29, lineHeight: 1.4, color: C.cuerpo, width: '100%' },
      corta(r.explicacion, 190)
    )
  );
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

  // ── Formato vertical 9:16 — "El Choque de IAs" (Stories/Reels/TikTok) ──
  if (String(req.query.formato ?? '') === 'vertical') {
    const tarjetaV = tarjetaChoque(
      pred,
      codigoLocal,
      codigoVisitante,
      nombreLocal,
      nombreVisitante,
      contexto
    );
    const imagenV = new ImageResponse(tarjetaV, {
      width: 1080,
      height: 1920,
      fonts: FUENTES_OG,
    });
    const bufferV = Buffer.from(await imagenV.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).send(bufferV);
  }

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
