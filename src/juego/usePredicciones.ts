import { useEffect, useState } from 'react';
import type { ConsensoPartido } from '../../api/predicciones.ts';

/**
 * Trae una sola vez el consenso de las 3 IAs por partido (/api/predicciones)
 * y lo indexa por partidoId, para que cada tarjeta jugable enfrente el pick
 * del usuario contra "lo que dicen las IAs" sin destapar la predicción
 * completa. Silencioso ante fallos: si no carga, el selector sigue jugable.
 */
export function usePredicciones() {
  const [consensos, setConsensos] = useState<Map<string, ConsensoPartido>>(
    () => new Map()
  );

  useEffect(() => {
    let cancelado = false;
    fetch('/api/predicciones')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { consensos?: ConsensoPartido[] } | null) => {
        if (!cancelado && d?.consensos) {
          setConsensos(new Map(d.consensos.map((c) => [c.partidoId, c])));
        }
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  return consensos;
}
