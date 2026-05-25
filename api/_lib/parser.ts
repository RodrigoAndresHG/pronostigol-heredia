import type { NombreIA, RespuestaIA } from '../../src/tipos/index.ts';

/**
 * Helpers compartidos por las 3 integraciones de IA.
 *
 * El objetivo principal: convertir el texto que devuelve cada modelo
 * en un `RespuestaIA` bien tipado, con tolerancia a:
 *   - Markdown ```json ... ``` envolviendo el JSON.
 *   - Texto extra antes o después del JSON.
 *   - Probabilidades que no suman exactamente 1 (las renormalizamos).
 *   - Faltantes o tipos incorrectos (devolvemos `error` en lugar de crashear).
 */

/**
 * Extrae el JSON de un texto que puede venir con markdown alrededor.
 * Si no encuentra bloques de código, busca el primer `{` y el último `}`.
 */
export function extraerJSON(texto: string): string {
  // Bloque de markdown ```json ... ``` (o ``` ... ```)
  const matchMarkdown = texto.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (matchMarkdown) return matchMarkdown[1].trim();

  // Heurística: del primer { al último } balanceado
  const inicio = texto.indexOf('{');
  const fin = texto.lastIndexOf('}');
  if (inicio !== -1 && fin > inicio) {
    return texto.substring(inicio, fin + 1);
  }
  return texto.trim();
}

/**
 * Parsea la respuesta de texto de una IA al tipo `RespuestaIA`.
 * Si falla, devuelve un `RespuestaIA` con `error` poblado en lugar
 * de lanzar — así la UI puede mostrar el fallo en su tarjeta.
 */
export function parsearRespuestaIA(ia: NombreIA, texto: string): RespuestaIA {
  try {
    const jsonRaw = extraerJSON(texto);
    if (!jsonRaw) throw new Error('Respuesta vacía');
    const datos = JSON.parse(jsonRaw);

    if (!datos.probabilidad || typeof datos.probabilidad !== 'object') {
      throw new Error('Falta el campo "probabilidad"');
    }
    const { local, empate, visitante } = datos.probabilidad;
    if (
      typeof local !== 'number' ||
      typeof empate !== 'number' ||
      typeof visitante !== 'number'
    ) {
      throw new Error('Probabilidades deben ser números');
    }

    // Renormalizamos por si la IA devolvió valores que no suman exactamente 1.
    const suma = local + empate + visitante;
    if (suma <= 0) throw new Error('Probabilidades suman 0');
    const factor = 1 / suma;

    return {
      ia,
      probabilidad: {
        local: local * factor,
        empate: empate * factor,
        visitante: visitante * factor,
      },
      confianza: clampNumero(datos.confianza ?? 50, 0, 100),
      explicacion: String(datos.explicacion ?? '').trim(),
      marcadorEsperado: datos.marcadorEsperado
        ? String(datos.marcadorEsperado)
        : undefined,
    };
  } catch (err) {
    return respuestaErronea(
      ia,
      `No se pudo parsear la respuesta: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/**
 * Construye una RespuestaIA en estado de error. La UI la pinta con
 * el mensaje en lugar de probabilidades inventadas.
 */
export function respuestaErronea(ia: NombreIA, error: string): RespuestaIA {
  return {
    ia,
    probabilidad: { local: 0, empate: 0, visitante: 0 },
    confianza: 0,
    explicacion: '',
    error,
  };
}

function clampNumero(valor: unknown, minimo: number, maximo: number): number {
  const n = typeof valor === 'number' ? valor : Number(valor);
  if (!Number.isFinite(n)) return minimo;
  return Math.max(minimo, Math.min(maximo, n));
}
