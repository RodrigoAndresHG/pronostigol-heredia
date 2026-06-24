/**
 * Tests del contexto intra-torneo: el récord y la tabla que se inyectan al
 * prompt de las IAs a partir de los resultados ya jugados. Lo más delicado es
 * el anti data-leakage: nunca debe colarse un partido posterior al que se
 * predice.
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { construirContextoTorneo } from '../api/_lib/contextoTorneo.js';
import { construirPrompt } from '../api/_lib/prompt.js';
import { partidoPorId } from '../src/datos/partidos.js';
import { calcularProbabilidadBase } from '../src/lib/modeloBase.js';
import { hechosDePartido } from '../src/datos/dossiers.js';
import type { Partido } from '../src/tipos/index.js';
import type { ResultadoPartido } from '../api/_lib/resultados.js';

function res(partidoId: string, gl: number, gv: number): ResultadoPartido {
  return {
    partidoId,
    golesLocal: gl,
    golesVisitante: gv,
    resultadoReal: gl > gv ? 'local' : gl < gv ? 'visitante' : 'empate',
    registradoEn: '2026-06-20T00:00:00Z',
  };
}

/** Arma el mensaje de usuario REAL que recibirían las IAs para un partido. */
function promptUsuario(partidoId: string, resultados: ResultadoPartido[]): string {
  const partido = partidoPorId(partidoId)!;
  const { probabilidad, desglose } = calcularProbabilidadBase(partido);
  const contexto = construirContextoTorneo(partido, resultados);
  return construirPrompt(
    partido,
    probabilidad,
    desglose,
    hechosDePartido(partido),
    contexto
  ).usuario;
}

// Grupo A: A-MD1-1 MEX-RSA, A-MD1-2 KOR-CZE, A-MD2-1 CZE-RSA,
// A-MD2-2 MEX-KOR, A-MD3-1 CZE-MEX, A-MD3-2 RSA-KOR (los dos MD3 simultáneos).
const RESULTADOS_GRUPO_A = [
  res('A-MD1-1', 2, 0), // MEX vence a RSA
  res('A-MD1-2', 1, 1), // KOR empata con CZE
  res('A-MD2-1', 3, 0), // CZE vence a RSA
  res('A-MD2-2', 1, 2), // MEX pierde con KOR
];

test('arma el récord de cada equipo con sus partidos previos', () => {
  const partido = partidoPorId('A-MD3-1')!; // CZE (local) vs MEX (visitante)
  const ctx = construirContextoTorneo(partido, RESULTADOS_GRUPO_A);

  assert.ok(ctx, 'debe haber contexto en MD3');
  // CZE: empató 1-1 (MD1, visita) y ganó 3-0 (MD2, local) → 4 pts.
  assert.equal(ctx!.local.equipoId, 'CZE');
  assert.equal(ctx!.local.pj, 2);
  assert.equal(ctx!.local.g, 1);
  assert.equal(ctx!.local.e, 1);
  assert.equal(ctx!.local.p, 0);
  assert.equal(ctx!.local.gf, 4);
  assert.equal(ctx!.local.gc, 1);
  assert.equal(ctx!.local.pts, 4);
  // MEX: ganó 2-0 (MD1) y perdió 1-2 (MD2) → 3 pts.
  assert.equal(ctx!.visitante.equipoId, 'MEX');
  assert.equal(ctx!.visitante.pts, 3);
  assert.equal(ctx!.visitante.g, 1);
  assert.equal(ctx!.visitante.p, 1);
});

test('la tabla del grupo se ordena por pts, luego dif. de gol', () => {
  const partido = partidoPorId('A-MD3-1')!;
  const ctx = construirContextoTorneo(partido, RESULTADOS_GRUPO_A);
  const orden = ctx!.tabla!.map((f) => f.equipoId);
  // CZE 4(+3), KOR 4(+1), MEX 3(+1), RSA 0(-5).
  assert.deepEqual(orden, ['CZE', 'KOR', 'MEX', 'RSA']);
  assert.equal(ctx!.tabla![0].dif, 3);
  assert.equal(ctx!.tabla![3].pts, 0);
});

test('ANTI-LEAKAGE: ignora partidos simultáneos o posteriores al que se predice', () => {
  const partido = partidoPorId('A-MD3-1')!; // 2026-06-25T01:00:00Z
  // A-MD3-2 (RSA-KOR) es a la MISMA hora; un MD3 jamás debe influir en otro.
  const conFuturo = [...RESULTADOS_GRUPO_A, res('A-MD3-2', 5, 0)];
  const ctx = construirContextoTorneo(partido, conFuturo);
  // RSA sigue en 0 pts: el 5-0 simultáneo no se contó.
  const rsa = ctx!.tabla!.find((f) => f.equipoId === 'RSA')!;
  assert.equal(rsa.pts, 0);
  assert.equal(rsa.pj, 2);
});

test('MD1 sin partidos previos → null (no hay nada verificado que aportar)', () => {
  const partido = partidoPorId('A-MD1-1')!;
  // Aunque pasemos resultados de jornadas posteriores, no aplican a MD1.
  const ctx = construirContextoTorneo(partido, RESULTADOS_GRUPO_A);
  assert.equal(ctx, null);
});

// ─── Fidelidad del TEXTO que reciben las IAs ──────────────────────────
// Lo que importa de verdad es el prompt serializado, no sólo la estructura:
// un verbo errado, los goles invertidos o la condición cambiada inyectaría
// un dato falso a las 3 IAs sin romper ningún test numérico.

test('el prompt serializa el historial con verbo, orden de goles y condición correctos', () => {
  const usuario = promptUsuario('A-MD3-1', RESULTADOS_GRUPO_A);
  assert.match(usuario, /RESULTADOS DEL TORNEO HASTA AHORA/);
  // Chequia (local): récord y sus dos partidos (empate de visita, victoria de local).
  assert.ok(usuario.includes('Chequia — 2 PJ: 1G 1E 0P, 4:1, 4 pts:'));
  assert.ok(usuario.includes('MD1: empató 1-1 con Corea del Sur (de visita)'));
  assert.ok(usuario.includes('MD2: venció 3-0 a Sudáfrica (de local)'));
  // México (visitante): victoria de local y derrota de local, goles en su perspectiva.
  assert.ok(usuario.includes('MD1: venció 2-0 a Sudáfrica (de local)'));
  assert.ok(usuario.includes('MD2: perdió 1-2 con Corea del Sur (de local)'));
});

test('asimétrico: el equipo sin marcadores ingeridos sale como "aún sin partidos"', () => {
  // Sólo pasamos los partidos de Chequia; a México aún no se le ingirió ninguno.
  const soloCZE = [res('A-MD1-2', 1, 1), res('A-MD2-1', 3, 0)];
  const ctx = construirContextoTorneo(partidoPorId('A-MD3-1')!, soloCZE);
  assert.ok(ctx, 'no es null: un lado sí jugó');
  assert.equal(ctx!.local.equipoId, 'CZE');
  assert.equal(ctx!.local.pj, 2);
  assert.equal(ctx!.visitante.equipoId, 'MEX');
  assert.equal(ctx!.visitante.pj, 0);
  const usuario = promptUsuario('A-MD3-1', soloCZE);
  assert.ok(usuario.includes('México: aún sin partidos jugados en el torneo.'));
});

test('eliminatoria (partido sin grupo): arma récords pero omite la tabla', () => {
  const octavos: Partido = {
    id: 'R32-1',
    fechaISO: '2026-06-30T00:00:00Z', // después de toda la fase de grupos
    sede: 'MetLife Stadium, Nueva York',
    paisAnfitrion: 'Estados Unidos',
    equipoLocalId: 'CZE',
    equipoVisitanteId: 'KOR',
    fase: 'r32',
    estado: 'programado',
  };
  const ctx = construirContextoTorneo(octavos, RESULTADOS_GRUPO_A);
  assert.ok(ctx);
  assert.equal(ctx!.grupo, undefined);
  assert.equal(ctx!.tabla, undefined); // sin grupo no hay tabla
  // Ambos arrastran su récord de la fase de grupos.
  assert.equal(ctx!.local.equipoId, 'CZE');
  assert.equal(ctx!.local.pj, 2);
  assert.equal(ctx!.visitante.equipoId, 'KOR');
  assert.equal(ctx!.visitante.pj, 2);
});
