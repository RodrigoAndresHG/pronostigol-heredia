/**
 * Tests del juego "Compite contra las IAs": Brier del pick duro del usuario y
 * el consenso compacto que alimenta el selector de cada tarjeta.
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  brierPickDuro,
  calcularRankingUsuario,
  type ResultadoReal,
} from '../src/juego/brierJuego.js';
import { construirConsensos } from '../api/predicciones.js';
import type { Prediccion } from '../src/tipos/index.js';

// ─── Brier del pick duro ──────────────────────────────────────────────

test('pick duro acertado → Brier 0', () => {
  assert.equal(brierPickDuro('local', 'local'), 0);
  assert.equal(brierPickDuro('empate', 'empate'), 0);
  assert.equal(brierPickDuro('visitante', 'visitante'), 0);
});

test('pick duro fallado → Brier 2 (todo o nada)', () => {
  assert.equal(brierPickDuro('local', 'visitante'), 2);
  assert.equal(brierPickDuro('empate', 'local'), 2);
});

// ─── Ranking del usuario ──────────────────────────────────────────────

test('sólo cuentan los partidos jugados que el usuario predijo', () => {
  const picks = {
    M1: { resultado: 'local' as const },
    M2: { resultado: 'empate' as const },
    M3: { resultado: 'visitante' as const }, // aún no jugado
  };
  const resultados = new Map<string, ResultadoReal>([
    ['M1', 'local'], // acierta
    ['M2', 'visitante'], // falla
  ]);
  const r = calcularRankingUsuario(picks, resultados);
  assert.equal(r.total, 2);
  assert.equal(r.aciertos, 1);
  assert.equal(r.brierPromedio, 1); // (0 + 2) / 2
  assert.equal(r.tasaAcierto, 0.5);
});

test('sin partidos jugados, el ranking queda en cero sin romper', () => {
  const r = calcularRankingUsuario(
    { M1: { resultado: 'local' } },
    new Map()
  );
  assert.equal(r.total, 0);
  assert.equal(r.brierPromedio, 0);
});

// ─── Consenso compacto ────────────────────────────────────────────────

function pred(parcial: Partial<Prediccion> & { partidoId: string }): Prediccion {
  return {
    timestampISO: '2026-06-11T00:00:00Z',
    probabilidadBase: { local: 0.4, empate: 0.3, visitante: 0.3 },
    respuestasIA: [],
    probabilidadFinal: { local: 0.4, empate: 0.3, visitante: 0.3 },
    veredicto: 'consenso',
    notaVeredicto: '',
    ...parcial,
  };
}

test('construirConsensos toma el favorito de la prob. final y suma 100%', () => {
  const [c] = construirConsensos([
    pred({
      partidoId: 'M1',
      probabilidadFinal: { local: 0.62, empate: 0.23, visitante: 0.15 },
    }),
  ]);
  assert.equal(c.partidoId, 'M1');
  assert.equal(c.favorito, 'local');
  assert.equal(c.pct, 62);
});

test('marcador de consenso = moda del marcadorEsperado entre IAs válidas', () => {
  const [c] = construirConsensos([
    pred({
      partidoId: 'M2',
      probabilidadFinal: { local: 0.5, empate: 0.25, visitante: 0.25 },
      respuestasIA: [
        { ia: 'Claude', probabilidad: { local: 0.5, empate: 0.25, visitante: 0.25 }, confianza: 70, explicacion: '', marcadorEsperado: '2-1' },
        { ia: 'GPT', probabilidad: { local: 0.5, empate: 0.25, visitante: 0.25 }, confianza: 60, explicacion: '', marcadorEsperado: '2-1' },
        { ia: 'Gemini', probabilidad: { local: 0.4, empate: 0.3, visitante: 0.3 }, confianza: 50, explicacion: '', marcadorEsperado: '1-1' },
      ],
    }),
  ]);
  assert.equal(c.marcador, '2-1');
});

test('sin marcadores propuestos, marcador es null', () => {
  const [c] = construirConsensos([
    pred({
      partidoId: 'M3',
      respuestasIA: [
        { ia: 'Claude', probabilidad: { local: 0.4, empate: 0.3, visitante: 0.3 }, confianza: 50, explicacion: '' },
      ],
    }),
  ]);
  assert.equal(c.marcador, null);
});
