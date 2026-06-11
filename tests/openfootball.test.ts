/**
 * Tests del emparejamiento openfootball → nuestro calendario.
 * Lo crítico: alinear la orientación (swap de goles/goleadores) cuando
 * openfootball lista los equipos al revés que nosotros.
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { emparejarMatches } from '../api/_lib/openfootball.js';

test('empareja un partido jugado con nuestro calendario', () => {
  const r = emparejarMatches([
    { team1: 'Mexico', team2: 'South Africa', score: { ft: [2, 1] } },
  ]);
  assert.equal(r.length, 1);
  assert.equal(r[0].partidoId, 'A-MD1-1');
  assert.equal(r[0].golesLocal, 2);
  assert.equal(r[0].golesVisitante, 1);
});

test('alinea la orientación aunque openfootball invierta los equipos', () => {
  const normal = emparejarMatches([
    { team1: 'Mexico', team2: 'South Africa', score: { ft: [2, 1] } },
  ]);
  const invertido = emparejarMatches([
    { team1: 'South Africa', team2: 'Mexico', score: { ft: [1, 2] } },
  ]);
  // Mismo partido y mismo marcador relativo a NUESTRO local (México).
  assert.equal(normal[0].partidoId, invertido[0].partidoId);
  assert.equal(invertido[0].golesLocal, 2);
  assert.equal(invertido[0].golesVisitante, 1);
});

test('los goleadores también se alinean al invertir', () => {
  const r = emparejarMatches([
    {
      team1: 'South Africa',
      team2: 'Mexico',
      score: { ft: [1, 2] },
      goals1: [{ name: 'Jugador RSA', minute: 10 }],
      goals2: [{ name: 'Jugador MEX', minute: 20 }],
    },
  ]);
  assert.equal(r[0].goleadoresLocal[0].nombre, 'Jugador MEX');
  assert.equal(r[0].goleadoresVisitante[0].nombre, 'Jugador RSA');
});

test('ignora partidos sin marcador (no jugados)', () => {
  const r = emparejarMatches([{ team1: 'Mexico', team2: 'South Africa' }]);
  assert.equal(r.length, 0);
});

test('ignora equipos no reconocidos (placeholders de eliminatoria)', () => {
  const r = emparejarMatches([
    { team1: 'Winner Group A', team2: 'Runner-up Group B', score: { ft: [1, 0] } },
  ]);
  assert.equal(r.length, 0);
});
