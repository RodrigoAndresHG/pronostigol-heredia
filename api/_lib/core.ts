import type { Prediccion } from '../../src/tipos/index.js';
import { partidoPorId } from '../../src/datos/partidos.js';
import { calcularProbabilidadBase } from '../../src/lib/modeloBase.js';
import { construirPrompt } from './prompt.js';
import { consultarClaude } from './iaClaude.js';
import { consultarGPT } from './iaGPT.js';
import { consultarGemini } from './iaGemini.js';
import { sintetizar } from './sintesis.js';

/**
 * Función núcleo de predicción.
 *
 * Es pura en el sentido de que NO conoce HTTP — recibe un partidoId,
 * dispara las 3 llamadas en paralelo, sintetiza y devuelve un objeto
 * `Prediccion` listo para mandar al cliente. Esto la hace reutilizable
 * desde:
 *   - El handler de Vercel (api/predecir.ts)
 *   - El middleware de Vite en desarrollo (vite.config.ts)
 *   - Tests futuros en Node
 *
 * Sobre el orden de ejecución:
 *   - Las 3 IAs se llaman SIEMPRE en paralelo. Si una se cuelga,
 *     las otras igual responden. Si todas fallan, la síntesis lo dice.
 */

export async function predecir(partidoId: string): Promise<Prediccion> {
  const partido = partidoPorId(partidoId);
  if (!partido) {
    throw new Error(`Partido no encontrado: ${partidoId}`);
  }

  // Capa 1 — modelo base, instantáneo
  const { probabilidad: probabilidadBase, desglose } =
    calcularProbabilidadBase(partido);

  // Capa 2 — las 3 IAs en paralelo
  const { sistema, usuario } = construirPrompt(partido, probabilidadBase, desglose);
  const [claude, gpt, gemini] = await Promise.all([
    consultarClaude(sistema, usuario),
    consultarGPT(sistema, usuario),
    consultarGemini(sistema, usuario),
  ]);

  const respuestasIA = [claude, gpt, gemini];
  const { probabilidadFinal, veredicto, notaVeredicto } = sintetizar(respuestasIA);

  return {
    partidoId,
    timestampISO: new Date().toISOString(),
    probabilidadBase,
    respuestasIA,
    probabilidadFinal,
    veredicto,
    notaVeredicto,
    // cuotaMercado y senalValor se rellenan en Fase 4 con The Odds API.
  };
}
