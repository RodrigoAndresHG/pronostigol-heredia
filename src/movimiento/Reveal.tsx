import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Aparición al entrar al viewport (scroll-reveal). Feel Apple/Linear:
 * recorrido corto (16px), blur sutil, easing suave, una sola vez.
 *
 * Bajo prefers-reduced-motion: sólo opacity, instantáneo (nunca deja
 * contenido invisible — se reduce el movimiento, no la visibilidad).
 */
const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.25, margin: '0px 0px -10% 0px' }}
      transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
