import { GoogleGenAI } from '@google/genai';
import type { RespuestaIA } from '../../src/tipos/index.js';
import { parsearRespuestaIA, respuestaErronea } from './parser.js';

/**
 * Consulta a Gemini (Google) y devuelve la respuesta parseada.
 *
 * Gemini soporta `responseMimeType: 'application/json'` que fuerza
 * salida JSON. El modelo por defecto es 2.5-flash (rápido y barato);
 * se puede subir a 2.5-pro con MODELO_GEMINI si quieres más calidad.
 */

const MODELO_DEFAULT = 'gemini-2.5-flash';

export async function consultarGemini(
  sistema: string,
  usuario: string
): Promise<RespuestaIA> {
  if (!process.env.GOOGLE_API_KEY) {
    return respuestaErronea('Gemini', 'GOOGLE_API_KEY no configurada');
  }

  const cliente = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  const modelo = process.env.MODELO_GEMINI || MODELO_DEFAULT;

  try {
    const respuesta = await cliente.models.generateContent({
      model: modelo,
      contents: usuario,
      config: {
        systemInstruction: sistema,
        responseMimeType: 'application/json',
      },
    });

    const texto = respuesta.text ?? '';
    return parsearRespuestaIA('Gemini', texto);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    return respuestaErronea('Gemini', mensaje);
  }
}
