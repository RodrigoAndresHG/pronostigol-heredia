/**
 * Tests de la tabla de posiciones.
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { calcularPosiciones } from '../src/lib/posiciones.js';

test('sin resultados: 12 grupos, todos los equipos en cero', () => {
  const g = calcularPosiciones([]);
  assert.equal(g.length, 12);
  for (const grupo of g) {
    assert.equal(grupo.filas.length, 4);
    for (const f of grupo.filas) {
      assert.equal(f.pj, 0);
      assert.equal(f.pts, 0);
    }
  }
});

test('un resultado (MEX 2-0 RSA) actualiza el Grupo A correctamente', () => {
  const g = calcularPosiciones([
    { partidoId: 'A-MD1-1', golesLocal: 2, golesVisitante: 0 },
  ]);
  const a = g.find((x) => x.grupo === 'A')!;

  // México lidera con 3 puntos, +2 de diferencia.
  assert.equal(a.filas[0].equipoId, 'MEX');
  assert.equal(a.filas[0].pts, 3);
  assert.equal(a.filas[0].pg, 1);
  assert.equal(a.filas[0].dg, 2);

  // Sudáfrica, último, 0 puntos y -2.
  const rsa = a.filas.find((f) => f.equipoId === 'RSA')!;
  assert.equal(rsa.pts, 0);
  assert.equal(rsa.pp, 1);
  assert.equal(rsa.dg, -2);
  assert.equal(a.filas[3].equipoId, 'RSA'); // peor diferencia → último
});

test('un empate reparte un punto a cada equipo', () => {
  const g = calcularPosiciones([
    { partidoId: 'A-MD1-2', golesLocal: 1, golesVisitante: 1 }, // KOR 1-1 CZE
  ]);
  const a = g.find((x) => x.grupo === 'A')!;
  const kor = a.filas.find((f) => f.equipoId === 'KOR')!;
  const cze = a.filas.find((f) => f.equipoId === 'CZE')!;
  assert.equal(kor.pts, 1);
  assert.equal(cze.pts, 1);
  assert.equal(kor.pe, 1);
  assert.equal(cze.dg, 0);
});
