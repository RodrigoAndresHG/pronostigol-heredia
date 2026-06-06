import { useEffect, useRef } from 'react';
import { animate, useInView, useMotionValue, useReducedMotion } from 'motion/react';

/**
 * Cuenta un número de 0 a `to` al entrar al viewport. Usa MotionValue +
 * textContent directo (sin re-render por frame). Bajo reduced-motion salta
 * al valor final. Cifras en mono tabular para que no "bailen".
 */
function CountUp({
  to,
  suffix = '',
  prefix = '',
  duration = 1.2,
  delay = 0,
  className = '',
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    const pintar = (n: number) => {
      if (ref.current) ref.current.textContent = `${prefix}${Math.round(n)}${suffix}`;
    };
    if (reduce) {
      pintar(to);
      return;
    }
    const controls = animate(count, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: pintar,
    });
    return () => controls.stop();
  }, [inView, reduce, to, suffix, prefix, duration, delay, count]);

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {prefix}0{suffix}
    </span>
  );
}

export default CountUp;
