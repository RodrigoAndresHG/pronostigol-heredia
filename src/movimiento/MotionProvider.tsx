import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Provider global de animación.
 *
 * `reducedMotion="user"` hace que TODAS las animaciones de Motion (m.*)
 * respeten automáticamente el ajuste "reducir movimiento" del sistema
 * operativo: desactiva transforms (x/y/scale) pero mantiene opacidad/color.
 * Una sola línea cubre accesibilidad en toda la app.
 */
function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export default MotionProvider;
