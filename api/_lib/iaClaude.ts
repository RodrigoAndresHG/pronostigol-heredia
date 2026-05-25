import Anthropic from '@anthropic-ai/sdk';
import type { RespuestaIA } from '../../src/tipos/index.ts';
import { parsearRespuestaIA, respuestaErronea } from './parser.ts';

/**
 * Consulta a Claude (Anthropic) y devuelve la respuesta parseada.
 *
 * El modelo se configura por env var MODELO_CLAUDE para que se pueda
 * mover entre versiones (Sonnet, Opus, Haiku) sin tocar código.
 * Si la clave no está configurada, devuelve un RespuestaIA con error
 * en lugar de fallar — la UI mostrará el caso de forma honesta.
 */

const MODELO_DEFAULT = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 600;

export async function consultarClaude(
  sistema: string,
  usuario: string
): Promise<RespuestaIA> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return respuestaErronea('Claude', 'ANTHROPIC_API_KEY no configurada');
  }

  const cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const modelo = process.env.MODELO_CLAUDE || MODELO_DEFAULT;

  try {
    const respuesta = await cliente.messages.create({
      model: modelo,
      max_tokens: MAX_TOKENS,
      system: sistema,
      messages: [{ role: 'user', content: usuario }],
    });

    // Concatenamos todos los bloques de texto (puede venir uno o más).
    const texto = respuesta.content
      .filter((bloque) => bloque.type === 'text')
      .map((bloque) => (bloque.type === 'text' ? bloque.text : ''))
      .join('\n');

    return parsearRespuestaIA('Claude', texto);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    return respuestaErronea('Claude', mensaje);
  }
}
