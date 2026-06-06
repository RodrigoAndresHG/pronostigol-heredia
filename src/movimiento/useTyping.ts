import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Revela un texto con efecto "escritura en vivo" (streaming), carácter por
 * carácter con un ligero jitter para que no se sienta robótico.
 *
 * Devuelve { mostrado, completo }. Bajo reduced-motion (o si `activo` es
 * false) muestra el texto completo de inmediato.
 *
 * `arranque`: cuándo empezar (ms desde el montaje). Permite escalonar varias
 * escrituras en paralelo.
 */
export function useTyping(
  texto: string,
  opciones: { cps?: number; jitter?: number; activo?: boolean; arranque?: number } = {}
): { mostrado: string; completo: boolean } {
  const { cps = 32, jitter = 0.15, activo = true, arranque = 0 } = opciones;
  const reduce = useReducedMotion();
  const [mostrado, setMostrado] = useState(reduce || !activo ? texto : '');
  const [completo, setCompleto] = useState(reduce || !activo);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduce || !activo) {
      setMostrado(texto);
      setCompleto(true);
      return;
    }
    setMostrado('');
    setCompleto(false);
    let i = 0;
    let ultimo = 0;
    const intervaloBase = 1000 / cps;

    const paso = (t: number) => {
      if (!ultimo) ultimo = t;
      const espera = intervaloBase * (1 + (Math.random() * 2 - 1) * jitter);
      if (t - ultimo >= espera) {
        i += 1;
        setMostrado(texto.slice(0, i));
        ultimo = t;
        if (i >= texto.length) {
          setCompleto(true);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(paso);
    };

    timeoutRef.current = setTimeout(() => {
      rafRef.current = requestAnimationFrame(paso);
    }, arranque);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [texto, cps, jitter, activo, arranque, reduce]);

  return { mostrado, completo };
}
