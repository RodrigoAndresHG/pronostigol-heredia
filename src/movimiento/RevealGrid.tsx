import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Contenedor que revela a sus hijos en cascada (stagger) al entrar al viewport.
 * Envuelve cada hijo en <RevealGrid.Item>. Los ítems heredan las variantes
 * por nombre, así que no necesitan initial/animate propios.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

const contenedor = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function RevealGrid({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={contenedor}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function Item({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const variantes = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0 } } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      };
  return (
    <motion.div className={className} variants={variantes}>
      {children}
    </motion.div>
  );
}

RevealGrid.Item = Item;
export default RevealGrid;
