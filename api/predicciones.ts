import type { VercelRequest, VercelResponse } from '@vercel/node';
import type {
  DistribucionResultado,
  Prediccion,
  RespuestaIA,
  Veredicto,
} from '../src/tipos/index.js';
import { leerUltimasDeTodos } from './_lib/almacen.js';

/**
 * Endpoint /api/predicciones — el "qué dicen las 3 IAs", en compacto.
 *
 * Para el juego "Compite contra las IAs" cada tarjeta de partido futuro
 * necesita mostrar el pronóstico del consenso (sin destapar la predicción
 * completa, que vive en /partido/:id). Este endpoint devuelve, por partido
 * con predicción guardada, sólo lo justo: veredicto, resultado favorito,
 * su probabilidad y el marcador de consenso.
 *
 * `construirConsensos` es pura para poder testearla con `tsx --test`.
 */

/** Lo que el cliente necesita para enfrentar el pick del usuario a las IAs. */
export interface ConsensoPartido {
  partidoId: string;
  veredicto: Veredicto;
  /** Resultado al que el consenso le da más probabilidad. */
  favorito: 'local' | 'empate' | 'visitante';
  /** Probabilidad del favorito, 0..100 (entero). */
  pct: number;
  /** Marcador de consenso "goles_local-goles_visitante", o null. */
  marcador: string | null;
}

export interface PrediccionesResponse {
  consensos: ConsensoPartido[];
}

/** Reparte el redondeo para que los 3 porcentajes sumen exactamente 100. */
function porcentajes(d: DistribucionResultado): [number, number, number] {
  const v = [d.local, d.empate, d.visitante].map((x) => Math.round(x * 100));
  const ajuste = 100 - (v[0] + v[1] + v[2]);
  const i = v.indexOf(Math.max(...v));
  v[i] += ajuste;
  return [v[0], v[1], v[2]];
}

/** El resultado dominante de una distribución y su porcentaje. */
function favoritoDe(d: DistribucionResultado): {
  favorito: 'local' | 'empate' | 'visitante';
  pct: number;
} {
  const [pl, pe, pv] = porcentajes(d);
  const maxima = Math.max(pl, pe, pv);
  if (maxima === pl) return { favorito: 'local', pct: pl };
  if (maxima === pv) return { favorito: 'visitante', pct: pv };
  return { favorito: 'empate', pct: pe };
}

/**
 * Marcador de consenso: la moda del `marcadorEsperado` entre las IAs que
 * respondieron (desempate por mayor confianza acumulada). En orden
 * "goles del local primero". Null si ninguna IA propuso marcador.
 */
function marcadorConsenso(respuestas: RespuestaIA[]): string | null {
  const validos = respuestas.filter((r) => !r.error && r.marcadorEsperado);
  if (validos.length === 0) return null;
  const conteo = new Map<string, { n: number; conf: number }>();
  for (const r of validos) {
    const k = r.marcadorEsperado as string;
    const a = conteo.get(k) ?? { n: 0, conf: 0 };
    a.n += 1;
    a.conf += r.confianza;
    conteo.set(k, a);
  }
  let mejor: { marcador: string; n: number; conf: number } | null = null;
  for (const [marcador, { n, conf }] of conteo) {
    if (!mejor || n > mejor.n || (n === mejor.n && conf > mejor.conf)) {
      mejor = { marcador, n, conf };
    }
  }
  return mejor?.marcador ?? null;
}

export function construirConsensos(predicciones: Prediccion[]): ConsensoPartido[] {
  return predicciones.map((p) => {
    const { favorito, pct } = favoritoDe(p.probabilidadFinal);
    return {
      partidoId: p.partidoId,
      veredicto: p.veredicto,
      favorito,
      pct,
      marcador: marcadorConsenso(p.respuestasIA),
    };
  });
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const guardadas = await leerUltimasDeTodos();
    const consensos = construirConsensos(guardadas.map((g) => g.prediccion));
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=120');
    return res.status(200).json({ consensos } satisfies PrediccionesResponse);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}
