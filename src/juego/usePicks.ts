import { useCallback, useEffect, useState } from 'react';
import {
  cargarPicks,
  guardarPick,
  borrarPick,
  EVENTO_PICKS,
  type Pick,
  type Picks,
} from './picks.ts';

/**
 * Hook reactivo sobre los picks en localStorage. Se sincroniza entre
 * componentes (tarjetas, panel, ranking) vía un CustomEvent, y entre
 * pestañas vía el evento 'storage'.
 */
export function usePicks() {
  const [picks, setPicks] = useState<Picks>(() => cargarPicks());

  useEffect(() => {
    const sync = () => setPicks(cargarPicks());
    window.addEventListener(EVENTO_PICKS, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENTO_PICKS, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setPick = useCallback((partidoId: string, pick: Omit<Pick, 'ts'>) => {
    setPicks(guardarPick(partidoId, pick));
  }, []);

  const quitarPick = useCallback((partidoId: string) => {
    setPicks(borrarPick(partidoId));
  }, []);

  return { picks, setPick, quitarPick };
}
