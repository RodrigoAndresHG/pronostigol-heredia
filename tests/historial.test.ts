/**
 * Tests de la agregación del historial (Boletín de Calibración).
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { calcularHistorial } from '../api/historial.js';
import type { Prediccion } from '../src/tipos/index.js';
import type { ResultadoPartido } from '../api/_lib/resultados.js';

function pred(parcial: Partial<Prediccion> & { partidoId: string }): Prediccion {
  return {
    timestampISO: '2026-06-11T00:00:00Z',
    probabilidadBase: { local: 0.5, empate: 0.25, visitante: 0.25 },
    respuestasIA: [],
    probabilidadFinal: { local: 0.5, empate: 0.25, visitante: 0.25 },
    veredicto: 'consenso',
    notaVeredicto: '',
    ...parcial,
  };
}

const predicciones: Prediccion[] = [
  pred({
    partidoId: 'M1',
    probabilidadBase: { local: 0.55, empate: 0.25, visitante: 0.2 },
    probabilidadFinal: { local: 0.6, empate: 0.25, visitante: 0.15 },
    respuestasIA: [
      { ia: 'Claude', probabilidad: { local: 0.7, empate: 0.2, visitante: 0.1 }, confianza: 80, explicacion: '' },
      { ia: 'GPT', probabilidad: { local: 0.25, empate: 0.25, visitante: 0.5 }, confianza: 60, explicacion: '' },
    ],
  }),
  pred({
    partidoId: 'M2',
    probabilidadBase: { local: 0.5, empate: 0.25, visitante: 0.25 },
    probabilidadFinal: { local: 0.3, empate: 0.45, visitante: 0.25 },
    respuestasIA: [
      { ia: 'Claude', probabilidad: { local: 0.3, empate: 0.45, visitante: 0.25 }, confianza: 55, explicacion: '' },
      { ia: 'GPT', probabilidad: { local: 0.55, empate: 0.25, visitante: 0.2 }, confianza: 70, explicacion: '' },
    ],
  }),
];

const resultados: ResultadoPartido[] = [
  { partidoId: 'M1', golesLocal: 2, golesVisitante: 0, resultadoReal: 'local', registradoEn: '' },
  { partidoId: 'M2', golesLocal: 1, golesVisitante: 1, resultadoReal: 'empate', registradoEn: '' },
];

test('calcularHistorial califica los 2 partidos', () => {
  const h = calcularHistorial(predicciones, resultados);
  assert.equal(h.partidosCalificados, 2);
});

test('el boletín incluye cada IA + consenso + modelo base', () => {
  const h = calcularHistorial(predicciones, resultados);
  const actores = new Set(h.boletin.map((b) => b.actor));
  assert.ok(actores.has('Claude'));
  assert.ok(actores.has('GPT'));
  assert.ok(actores.has('Consenso'));
  assert.ok(actores.has('Modelo base'));
});

test('Claude (acertó ambos, calibrado) tiene mejor Brier que GPT (falló ambos)', () => {
  const h = calcularHistorial(predicciones, resultados);
  const claude = h.boletin.find((b) => b.actor === 'Claude')!;
  const gpt = h.boletin.find((b) => b.actor === 'GPT')!;
  assert.ok(claude.brierPromedio < gpt.brierPromedio);
  assert.equal(claude.aciertos, 2);
  assert.equal(gpt.aciertos, 0);
});

test('el boletín está ordenado por Brier ascendente (mejor primero)', () => {
  const h = calcularHistorial(predicciones, resultados);
  for (let i = 1; i < h.boletin.length; i++) {
    assert.ok(h.boletin[i].brierPromedio >= h.boletin[i - 1].brierPromedio);
  }
});

test('la calibración agrupa las confianzas en cubetas', () => {
  const h = calcularHistorial(predicciones, resultados);
  assert.ok(h.calibracion.length > 0);
  const totalN = h.calibracion.reduce((s, c) => s + c.n, 0);
  assert.equal(totalN, 4); // 2 IAs × 2 partidos
});

test('sin resultados, no hay nada calificado', () => {
  const h = calcularHistorial(predicciones, []);
  assert.equal(h.partidosCalificados, 0);
  assert.equal(h.boletin.length, 0);
});
