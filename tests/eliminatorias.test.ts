/**
 * Tests de la Llave en vivo: ubicación de clasificados directos en sus slots
 * de la Ronda de 32 (provisional vs confirmado) y carrera por los mejores
 * terceros. La estructura R32 está verificada contra fuentes oficiales.
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { construirLlave } from '../src/lib/eliminatorias.js';
import { RONDA_32, ORDEN_R32 } from '../src/datos/eliminatorias.js';

function res(partidoId: string, golesLocal: number, golesVisitante: number) {
  return { partidoId, golesLocal, golesVisitante };
}

// Grupo A completo y sintético → MEX 1º (9 pts), KOR 2º, RSA 3º, CZE 4º.
const GRUPO_A_COMPLETO = [
  res('A-MD1-1', 2, 0), // MEX vence RSA
  res('A-MD1-2', 1, 0), // KOR vence CZE
  res('A-MD2-1', 0, 1), // CZE pierde con RSA
  res('A-MD2-2', 2, 0), // MEX vence KOR
  res('A-MD3-1', 0, 3), // CZE pierde con MEX (MEX 9 de 9)
  res('A-MD3-2', 1, 1), // RSA empata KOR
];

const r32cruces = (llave: ReturnType<typeof construirLlave>) =>
  llave.rondas.find((r) => r.fase === 'r32')!.cruces;
const cruce = (llave: ReturnType<typeof construirLlave>, numero: number) =>
  r32cruces(llave).find((c) => c.numero === numero)!;

test('ORDEN_R32 cubre exactamente los 16 partidos de la Ronda de 32', () => {
  assert.equal(ORDEN_R32.length, 16);
  assert.equal(new Set(ORDEN_R32).size, 16); // sin duplicados
  assert.deepEqual(
    [...ORDEN_R32].sort((a, b) => a - b),
    RONDA_32.map((c) => c.numero).sort((a, b) => a - b)
  );
});

test('sin resultados: 16 cruces, todos los slots como etiqueta', () => {
  const llave = construirLlave([]);
  assert.equal(r32cruces(llave).length, 16);
  assert.equal(llave.gruposCompletos, 0);
  assert.equal(llave.terceros.length, 12);
  // Ningún slot resuelto.
  const algunoResuelto = r32cruces(llave).some(
    (c) => c.local.equipoId || c.visitante.equipoId
  );
  assert.equal(algunoResuelto, false);
  // Etiquetas correctas del cruce M79 (1A vs 3º C/E/F/H/I).
  const m79 = cruce(llave, 79);
  assert.equal(m79.local.etiqueta, '1A');
  assert.equal(m79.visitante.etiqueta, '3º C/E/F/H/I');
});

test('grupo cerrado: ubica al 1º y al 2º en sus slots, confirmados', () => {
  const llave = construirLlave(GRUPO_A_COMPLETO);
  assert.equal(llave.gruposCompletos, 1);
  // 1A → MEX en el local de M79; 2A → KOR en el local de M73.
  const m79 = cruce(llave, 79);
  assert.equal(m79.local.equipoId, 'MEX');
  assert.equal(m79.local.confirmado, true);
  const m73 = cruce(llave, 73);
  assert.equal(m73.local.equipoId, 'KOR');
  assert.equal(m73.local.confirmado, true);
  // El slot de tercero NO se ubica (depende del Anexo C): sigue como etiqueta.
  assert.equal(m79.visitante.equipoId, undefined);
});

test('carrera de terceros: 3º de cada grupo, ordenado, con corte a 8', () => {
  const llave = construirLlave(GRUPO_A_COMPLETO);
  // RSA es el 3º del único grupo cerrado, con 4 pts → encabeza y clasifica.
  const primero = llave.terceros[0];
  assert.equal(primero.equipoId, 'RSA');
  assert.equal(primero.grupo, 'A');
  assert.equal(primero.pts, 4);
  assert.equal(primero.confirmado, true);
  assert.equal(primero.clasifica, true);
  // Top 8 clasifican; del 9.º en adelante, no.
  assert.equal(llave.terceros.filter((t) => t.clasifica).length, 8);
  assert.equal(llave.terceros[7].clasifica, true);
  assert.equal(llave.terceros[8].clasifica, false);
});

test('grupo avanzado pero no cerrado: ocupante provisional, no confirmado', () => {
  // Mismos resultados menos el último partido → grupo A con 5 jugados.
  const cincoJugados = GRUPO_A_COMPLETO.slice(0, 5);
  const llave = construirLlave(cincoJugados);
  assert.equal(llave.gruposCompletos, 0);
  const m79 = cruce(llave, 79);
  assert.equal(m79.local.equipoId, 'MEX'); // ya lidera
  assert.equal(m79.local.confirmado, false);
  assert.equal(m79.local.provisional, true);
});

test('grupo apenas arrancado (<4 jugados): slot sin ocupante, solo etiqueta', () => {
  const dosJugados = GRUPO_A_COMPLETO.slice(0, 2);
  const llave = construirLlave(dosJugados);
  const m79 = cruce(llave, 79);
  assert.equal(m79.local.equipoId, undefined);
  assert.equal(m79.local.etiqueta, '1A');
});
