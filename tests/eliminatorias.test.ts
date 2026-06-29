/**
 * Tests de la Llave en vivo: ubicación de clasificados directos en sus slots
 * de la Ronda de 32 (provisional vs confirmado) y carrera por los mejores
 * terceros. La estructura R32 está verificada contra fuentes oficiales.
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { construirLlave } from '../src/lib/eliminatorias.js';
import { calcularPosiciones } from '../src/lib/posiciones.js';
import { partidoPorId, PARTIDOS } from '../src/datos/partidos.js';
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

// ─── Fixtures R32 resueltos (fase de grupos cerrada) ──────────────────
// Cruces verificados contra el bracket oficial (Anexo C) + nuestras posiciones.

test('los 16 fixtures de la Ronda de 32 están resueltos con los equipos correctos', () => {
  const esperado: Record<number, [string, string]> = {
    73: ['RSA', 'CAN'], 74: ['GER', 'PAR'], 75: ['NED', 'MAR'], 76: ['BRA', 'JPN'],
    77: ['FRA', 'SWE'], 78: ['CIV', 'NOR'], 79: ['MEX', 'ECU'], 80: ['ENG', 'COD'],
    81: ['USA', 'BIH'], 82: ['BEL', 'SEN'], 83: ['POR', 'CRO'], 84: ['ESP', 'AUT'],
    85: ['SUI', 'ALG'], 86: ['ARG', 'CPV'], 87: ['COL', 'GHA'], 88: ['AUS', 'EGY'],
  };
  for (const [numero, [local, visitante]] of Object.entries(esperado)) {
    const p = partidoPorId(`R32-${numero}`);
    assert.ok(p, `falta el fixture R32-${numero}`);
    assert.equal(p!.fase, 'r32');
    assert.equal(p!.equipoLocalId, local, `R32-${numero} local`);
    assert.equal(p!.equipoVisitanteId, visitante, `R32-${numero} visitante`);
  }
});

// ─── Marcador del cruce + propagación del ganador a la ronda siguiente ──
// Cierra los 12 grupos (cualquier marcador) para que la R32 use sus fixtures
// reales; luego inyecta el resultado de un cruce y verifica el avance.
const TODOS_LOS_GRUPOS = PARTIDOS.filter((p) => p.grupo).map((p) => res(p.id, 1, 0));
const cruceEn = (
  llave: ReturnType<typeof construirLlave>,
  fase: string,
  numero: number
) => llave.rondas.find((r) => r.fase === fase)!.cruces.find((c) => c.numero === numero)!;

test('R32 jugado: el cruce lleva su marcador y el ganador avanza a octavos', () => {
  // R32-73 = RSA vs CAN; gana el visitante (CAN) 0–1.
  const llave = construirLlave([...TODOS_LOS_GRUPOS, res('R32-73', 0, 1)]);
  const c73 = cruceEn(llave, 'r32', 73);
  assert.deepEqual(
    [c73.resultado?.golesLocal, c73.resultado?.golesVisitante, c73.resultado?.ganador],
    [0, 1, 'visitante']
  );
  // M73 alimenta el local del octavo M90 (AVANCE: localDe 73) → debe ubicar a CAN.
  const m90 = cruceEn(llave, 'r16', 90);
  assert.equal(m90.local.equipoId, 'CAN');
  assert.equal(m90.local.confirmado, true);
  // El otro lado de M90 (ganador de 75, no jugado) sigue pendiente.
  assert.equal(m90.visitante.equipoId, undefined);
  assert.equal(m90.visitante.etiqueta, 'Gan. 75');
});

test('R32 empatado en los 90 NO propaga ganador (faltarían los penales)', () => {
  const llave = construirLlave([...TODOS_LOS_GRUPOS, res('R32-73', 1, 1)]);
  assert.equal(cruceEn(llave, 'r32', 73).resultado?.ganador, 'empate');
  const m90 = cruceEn(llave, 'r16', 90);
  assert.equal(m90.local.equipoId, undefined);
  assert.equal(m90.local.etiqueta, 'Gan. 73');
});

test('R32 sin jugar: el cruce no tiene resultado y el octavo queda pendiente', () => {
  const llave = construirLlave(TODOS_LOS_GRUPOS);
  assert.equal(cruceEn(llave, 'r32', 73).resultado, undefined);
  assert.equal(cruceEn(llave, 'r16', 90).local.equipoId, undefined);
});

test('calcularPosiciones IGNORA resultados de R32 (no contamina la tabla de grupos)', () => {
  const soloGrupos = calcularPosiciones(GRUPO_A_COMPLETO);
  // MEX (Grupo A) juega también en R32-79; ese resultado NO debe sumar al grupo.
  const conR32 = calcularPosiciones([
    ...GRUPO_A_COMPLETO,
    res('R32-79', 5, 0),
  ]);
  const a1 = soloGrupos.find((g) => g.grupo === 'A')!.filas;
  const a2 = conR32.find((g) => g.grupo === 'A')!.filas;
  assert.deepEqual(
    a2.map((f) => [f.equipoId, f.pts, f.pj, f.gf]),
    a1.map((f) => [f.equipoId, f.pts, f.pj, f.gf])
  );
});
