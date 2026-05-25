/**
 * Tests del modelo base (Capa 1).
 *
 * Se corren con: `npm test` (usa el runner integrado de Node 24).
 *
 * Las aserciones son tolerantes a propósito (rangos en vez de valores
 * exactos) para que tweaks pequeños en los parámetros del modelo no
 * rompan la suite. Si una aserción falla, hay que mirar si el cambio
 * fue intencional o un error.
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { calcularProbabilidadBase } from '../src/lib/modeloBase.ts';
import { PARTIDOS, partidoPorId } from '../src/datos/partidos.ts';

const dentro = (valor: number, minimo: number, maximo: number) =>
  valor >= minimo && valor <= maximo;

// ─── Invariantes generales ───────────────────────────────────────────

test('Invariante: las probabilidades suman ~1 en los 72 partidos', () => {
  for (const partido of PARTIDOS) {
    const { probabilidad } = calcularProbabilidadBase(partido);
    const suma = probabilidad.local + probabilidad.empate + probabilidad.visitante;
    assert.ok(
      Math.abs(suma - 1) < 1e-9,
      `Partido ${partido.id}: suma de probabilidades = ${suma}`
    );
  }
});

test('Invariante: todas las probabilidades caen en [0, 1]', () => {
  for (const partido of PARTIDOS) {
    const { probabilidad } = calcularProbabilidadBase(partido);
    for (const [nombre, p] of Object.entries(probabilidad)) {
      assert.ok(
        p >= 0 && p <= 1,
        `Partido ${partido.id}, ${nombre}: prob=${p} fuera de [0,1]`
      );
    }
  }
});

// ─── Casos específicos ───────────────────────────────────────────────

test('Favorito amplio: Argentina vs Argelia (Δ ~400 Elo)', () => {
  const partido = partidoPorId('J-MD1-3')!;
  assert.ok(partido, 'Partido J-MD1-3 debe existir');
  const { probabilidad } = calcularProbabilidadBase(partido);
  assert.ok(
    probabilidad.local >= 0.75,
    `Esperaba P(ARG) ≥ 75%, obtuvo ${(probabilidad.local * 100).toFixed(1)}%`
  );
  assert.ok(
    probabilidad.visitante <= 0.12,
    `Esperaba P(ALG) ≤ 12%, obtuvo ${(probabilidad.visitante * 100).toFixed(1)}%`
  );
});

test('Anfitrión recibe bonus grande: México vs Sudáfrica en el Azteca', () => {
  const partido = partidoPorId('A-MD1-1')!;
  const { probabilidad, desglose } = calcularProbabilidadBase(partido);

  assert.equal(
    desglose.bonusSedeLocal,
    120,
    'México como anfitrión debe recibir bonus de 120 Elo'
  );
  assert.ok(
    probabilidad.local >= 0.55,
    `Esperaba P(MEX) ≥ 55%, obtuvo ${(probabilidad.local * 100).toFixed(1)}%`
  );
});

test('Local no-anfitrión recibe bonus nominal: CIV vs ECU en Houston', () => {
  const partido = partidoPorId('E-MD1-2')!;
  const { desglose } = calcularProbabilidadBase(partido);

  assert.equal(
    desglose.bonusSedeLocal,
    20,
    'Costa de Marfil no es anfitrión; bonus nominal = 20'
  );
});

test('Partido parejo: ratings similares producen distribución equilibrada', () => {
  // CIV 1600 vs ECU 1610 — diferencia ínfima (10 Elo + 20 bonus = 30 d efectiva)
  const partido = partidoPorId('E-MD1-2')!;
  const { probabilidad } = calcularProbabilidadBase(partido);

  assert.ok(
    dentro(probabilidad.local, 0.32, 0.45),
    `P(CIV) en partido parejo debe ser 32-45%, obtuvo ${(probabilidad.local * 100).toFixed(1)}%`
  );
  assert.ok(
    dentro(probabilidad.visitante, 0.30, 0.42),
    `P(ECU) en partido parejo debe ser 30-42%, obtuvo ${(probabilidad.visitante * 100).toFixed(1)}%`
  );
  assert.ok(
    probabilidad.empate >= 0.22,
    `Empate en partido parejo debe ser ≥ 22%, obtuvo ${(probabilidad.empate * 100).toFixed(1)}%`
  );
});

// ─── Sensibilidad a los factores opcionales ──────────────────────────

test('Forma positiva del local sube su probabilidad', () => {
  const partido = partidoPorId('C-MD1-1')!; // Brasil vs Marruecos
  const base = calcularProbabilidadBase(partido);
  const conBuenaForma = calcularProbabilidadBase(partido, { formaLocal: 1 });

  assert.ok(
    conBuenaForma.probabilidad.local > base.probabilidad.local,
    `formaLocal=+1 debería subir P(local). base=${base.probabilidad.local.toFixed(3)} vs ${conBuenaForma.probabilidad.local.toFixed(3)}`
  );
});

test('Descanso corto del local reduce su probabilidad', () => {
  const partido = partidoPorId('C-MD1-1')!;
  const base = calcularProbabilidadBase(partido);
  const cansado = calcularProbabilidadBase(partido, { diasDescansoLocal: 2 });

  assert.ok(
    cansado.probabilidad.local < base.probabilidad.local,
    `descanso=2 debería bajar P(local). base=${base.probabilidad.local.toFixed(3)} vs ${cansado.probabilidad.local.toFixed(3)}`
  );
});

test('Empate es mayor en partidos parejos que en desniveles', () => {
  // Parejo: CIV 1600 vs ECU 1610
  const parejo = partidoPorId('E-MD1-2')!;
  // Desnivel: ARG 1885 vs ALG 1510
  const desnivel = partidoPorId('J-MD1-3')!;

  const { probabilidad: probParejo } = calcularProbabilidadBase(parejo);
  const { probabilidad: probDesnivel } = calcularProbabilidadBase(desnivel);

  assert.ok(
    probParejo.empate > probDesnivel.empate,
    `P(empate) parejo=${probParejo.empate.toFixed(3)} debería ser > desnivel=${probDesnivel.empate.toFixed(3)}`
  );
});

test('El bonus de sede inclina al local (test contrafactual)', () => {
  // Construyo un partido sintético sin sede de anfitrión para comparar.
  // Uso los mismos equipos pero finjo que se juega en territorio neutral.
  const partidoEnCasa = partidoPorId('A-MD1-1')!; // MEX vs RSA en CDMX (anfitrión)
  const partidoNeutral = {
    ...partidoEnCasa,
    paisAnfitrion: 'Estados Unidos' as const, // ya no es casa de México
  };

  const enCasa = calcularProbabilidadBase(partidoEnCasa);
  const neutral = calcularProbabilidadBase(partidoNeutral);

  assert.ok(
    enCasa.probabilidad.local > neutral.probabilidad.local,
    `Anfitrión en casa debe tener más P(local) que en sede neutral. casa=${enCasa.probabilidad.local.toFixed(3)} vs neutral=${neutral.probabilidad.local.toFixed(3)}`
  );
  // Diferencia debe ser sustancial (>5 puntos porcentuales).
  assert.ok(
    enCasa.probabilidad.local - neutral.probabilidad.local > 0.05,
    `Diferencia anfitrión vs neutral debería ser >5pts, obtuvo ${((enCasa.probabilidad.local - neutral.probabilidad.local) * 100).toFixed(1)}pts`
  );
});
