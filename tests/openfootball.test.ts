/**
 * Tests del emparejamiento openfootball → nuestro calendario.
 * Lo crítico: alinear la orientación (swap de goles/goleadores) cuando
 * openfootball lista los equipos al revés que nosotros.
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { emparejarMatches, agregarGoleadores } from '../api/_lib/openfootball.js';
import type { ResultadoIngerible } from '../api/_lib/openfootball.js';

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

test('agregarGoleadores suma por jugador y ordena por goles', () => {
  const resultados: ResultadoIngerible[] = [
    {
      partidoId: 'X', equipoLocalId: 'ECU', equipoVisitanteId: 'CIV',
      golesLocal: 2, golesVisitante: 1,
      goleadoresLocal: [
        { nombre: 'Valencia', minuto: 10 },
        { nombre: 'Valencia', minuto: 50, penal: true },
      ],
      goleadoresVisitante: [{ nombre: 'Haller', minuto: 30 }],
    },
    {
      partidoId: 'Y', equipoLocalId: 'ECU', equipoVisitanteId: 'GER',
      golesLocal: 1, golesVisitante: 0,
      goleadoresLocal: [{ nombre: 'Valencia', minuto: 20 }],
      goleadoresVisitante: [],
    },
  ];
  const tabla = agregarGoleadores(resultados);
  const valencia = tabla.find((g) => g.nombre === 'Valencia')!;
  assert.equal(valencia.goles, 3);
  assert.equal(valencia.penales, 1);
  assert.equal(valencia.equipoId, 'ECU');
  assert.equal(tabla[0].nombre, 'Valencia'); // el máximo goleador va primero
});

test('los autogoles no cuentan para el goleador', () => {
  const tabla = agregarGoleadores([
    {
      partidoId: 'Z', equipoLocalId: 'ECU', equipoVisitanteId: 'CIV',
      golesLocal: 1, golesVisitante: 0,
      goleadoresLocal: [{ nombre: 'Defensa', minuto: 5, enContra: true }],
      goleadoresVisitante: [],
    },
  ]);
  assert.equal(tabla.length, 0);
});
