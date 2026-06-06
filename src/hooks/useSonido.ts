import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Micro-sonidos de UI con Web Audio API (0 KB de assets, síntesis en runtime).
 *
 * Principios:
 *   - APAGADO por defecto. Preferencia persistida en localStorage.
 *   - La AudioContext nace "suspended"; sólo suena tras un gesto del usuario
 *     (política de autoplay). El propio toggle al activar habilita el audio.
 *   - Envolvente ADSR cortísima para evitar el "click" parásito.
 *   - Volumen bajo, sonidos cortos (premium = sutil).
 *   - iOS: reanuda en visibilitychange (la AudioContext puede "interrupted").
 */

type Sonido = 'tick' | 'success' | 'error';
const CLAVE = 'pg:sonido-ui';
const VOLUMEN_MASTER = 0.08;
const THROTTLE_MS = 45;

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function envGain(c: AudioContext, t0: number, dur: number, peak: number): GainNode {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  return g;
}

function blip(
  c: AudioContext,
  master: GainNode,
  freq: number,
  type: OscillatorType,
  t0: number,
  dur: number,
  peak: number
) {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2600;
  const g = envGain(c, t0, dur, peak);
  osc.connect(lp).connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function reproducir(c: AudioContext, master: GainNode, s: Sonido) {
  const t = c.currentTime;
  if (s === 'tick') {
    blip(c, master, 1100, 'triangle', t, 0.055, 0.9);
  } else if (s === 'success') {
    blip(c, master, 660, 'sine', t, 0.1, 0.8);
    blip(c, master, 990, 'sine', t + 0.07, 0.13, 0.7);
  } else {
    const osc = c.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.13);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1400;
    const g = envGain(c, t, 0.14, 0.7);
    osc.connect(lp).connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 0.16);
  }
}

export function useSonido() {
  const [activo, setActivo] = useState(false);
  const masterRef = useRef<GainNode | null>(null);
  const ultimoRef = useRef(0);

  useEffect(() => {
    try {
      setActivo(localStorage.getItem(CLAVE) === 'on');
    } catch {
      /* ignore */
    }
  }, []);

  const init = useCallback(async () => {
    const c = getCtx();
    if (!c) return;
    if (c.state === 'suspended' || (c.state as string) === 'interrupted') {
      try {
        await c.resume();
      } catch {
        /* ignore */
      }
    }
    if (!masterRef.current) {
      const m = c.createGain();
      m.gain.value = VOLUMEN_MASTER;
      m.connect(c.destination);
      masterRef.current = m;
    }
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (activo && document.visibilityState === 'visible') void init();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [activo, init]);

  const toggle = useCallback(async () => {
    const nuevo = !activo;
    setActivo(nuevo);
    try {
      localStorage.setItem(CLAVE, nuevo ? 'on' : 'off');
    } catch {
      /* ignore */
    }
    if (nuevo) {
      await init();
      // 'tick' de confirmación al encender.
      const c = getCtx();
      if (c && masterRef.current && c.state === 'running') reproducir(c, masterRef.current, 'tick');
    }
  }, [activo, init]);

  const play = useCallback(
    (s: Sonido) => {
      if (!activo) return;
      const ahora = performance.now();
      if (ahora - ultimoRef.current < THROTTLE_MS) return;
      ultimoRef.current = ahora;
      const c = getCtx();
      if (!c || !masterRef.current || c.state !== 'running') {
        void init();
        return;
      }
      reproducir(c, masterRef.current, s);
    },
    [activo, init]
  );

  return { activo, toggle, play, init };
}
