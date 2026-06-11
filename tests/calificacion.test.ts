/**
 * Tests del módulo de calificación (Brier + calibración).
 *
 * Se corren con: `npm test`.
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  resultadoDesdeGoles,
  brier,
  resultadoPredicho,
  acerto,
  cubetaConfianza,
  etiquetaCalibracion,
} from '../api/_lib/calificacion.js';

// ─── resultadoDesdeGoles ─────────────────────────────────────────────

test('resultadoDesdeGoles deriva el 1X2 correcto', () => {
  assert.equal(resultadoDesdeGoles(2, 1), 'local');
  assert.equal(resultadoDesdeGoles(0, 3), 'visitante');
  assert.equal(resultadoDesdeGoles(1, 1), 'empate');
  assert.equal(resultadoDesdeGoles(0, 0), 'empate');
});

// ─── Brier Score ─────────────────────────────────────────────────────

test('Brier: predicción perfecta da 0', () => {
  const bs = brier({ local: 1, empate: 0, visitante: 0 }, 'local');
  assert.ok(Math.abs(bs) < 1e-9, `esperaba 0, dio ${bs}`);
});

test('Brier: certeza en el resultado equivocado da 2 (lo peor)', () => {
  const bs = brier({ local: 1, empate: 0, visitante: 0 }, 'visitante');
  assert.ok(Math.abs(bs - 2) < 1e-9, `esperaba 2, dio ${bs}`);
});

test('Brier: ignorancia 33/33/33 ≈ 0.667', () => {
  const bs = brier({ local: 1 / 3, empate: 1 / 3, visitante: 1 / 3 }, 'local');
  assert.ok(bs > 0.66 && bs < 0.67, `esperaba ~0.667, dio ${bs}`);
});

test('Brier: una predicción calibrada puntúa mejor que una sobreconfiada equivocada', () => {
  const real = 'empate' as const;
  const calibrada = brier({ local: 0.4, empate: 0.35, visitante: 0.25 }, real);
  const sobreconfiada = brier({ local: 0.85, empate: 0.1, visitante: 0.05 }, real);
  assert.ok(
    calibrada < sobreconfiada,
    `calibrada ${calibrada} debería ser < sobreconfiada ${sobreconfiada}`
  );
});

// ─── resultadoPredicho / acerto ──────────────────────────────────────

test('resultadoPredicho toma el argmax', () => {
  assert.equal(resultadoPredicho({ local: 0.5, empate: 0.3, visitante: 0.2 }), 'local');
  assert.equal(resultadoPredicho({ local: 0.2, empate: 0.3, visitante: 0.5 }), 'visitante');
  assert.equal(resultadoPredicho({ local: 0.2, empate: 0.6, visitante: 0.2 }), 'empate');
});

test('acerto es true cuando el favorito coincide con el resultado', () => {
  assert.equal(acerto({ local: 0.6, empate: 0.25, visitante: 0.15 }, 'local'), true);
  assert.equal(acerto({ local: 0.6, empate: 0.25, visitante: 0.15 }, 'visitante'), false);
});

// ─── Cubetas de confianza ────────────────────────────────────────────

test('cubetaConfianza agrupa en rangos de 10 desde 50', () => {
  assert.equal(cubetaConfianza(42), '<50');
  assert.equal(cubetaConfianza(50), '50-60');
  assert.equal(cubetaConfianza(64), '60-70');
  assert.equal(cubetaConfianza(72), '70-80');
  assert.equal(cubetaConfianza(89), '80-90');
  assert.equal(cubetaConfianza(90), '90-100');
  assert.equal(cubetaConfianza(100), '90-100');
});

// ─── Etiqueta de calibración (Autopsia) ──────────────────────────────

test('etiquetaCalibracion clasifica casos típicos', () => {
  // Acertó con seguridad → calibrada
  assert.equal(
    etiquetaCalibracion({ local: 0.7, empate: 0.2, visitante: 0.1 }, 'local'),
    'calibrada'
  );
  // Acertó pero estaba dudosa → cauta
  assert.equal(
    etiquetaCalibracion({ local: 0.4, empate: 0.35, visitante: 0.25 }, 'local'),
    'cauta'
  );
  // Falló estando muy segura → sobreconfiada
  assert.equal(
    etiquetaCalibracion({ local: 0.85, empate: 0.1, visitante: 0.05 }, 'visitante'),
    'sobreconfiada'
  );
});
