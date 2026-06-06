import OpenAI from 'openai';
import type { RespuestaIA } from '../../src/tipos/index.js';
import { parsearRespuestaIA, respuestaErronea } from './parser.js';

/**
 * Consulta a GPT (OpenAI) y devuelve la respuesta parseada.
 *
 * Usamos `response_format: { type: 'json_object' }` que obliga al modelo
 * a devolver JSON estricto — más fiable que confiar en el prompt para
 * el formato. El modelo es configurable vía env var MODELO_GPT.
 */

const MODELO_DEFAULT = 'gpt-4o';

export async function consultarGPT(
  sistema: string,
  usuario: string
): Promise<RespuestaIA> {
  if (!process.env.OPENAI_API_KEY) {
    return respuestaErronea('GPT', 'OPENAI_API_KEY no configurada');
  }

  const cliente = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const modelo = process.env.MODELO_GPT || MODELO_DEFAULT;

  try {
    const respuesta = await cliente.chat.completions.create({
      model: modelo,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: sistema },
        { role: 'user', content: usuario },
      ],
    });

    const texto = respuesta.choices[0]?.message?.content ?? '';
    return parsearRespuestaIA('GPT', texto);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    return respuestaErronea('GPT', mensaje);
  }
}
