import { useEffect, useState } from 'react';
import type { ConsensoPartido } from '../../api/predicciones.ts';

type Consensos = Map<string, ConsensoPartido>;

/**
 * Una sola petición en vuelo, compartida entre montajes simultáneos. En el
 * landing hay dos consumidores a la vez (el calendario y la llave); sin esto
 * dispararían dos GET concurrentes a /api/predicciones. Se limpia al resolver,
 * así un montaje posterior vuelve a traer datos frescos (el cron las regenera).
 */
let enVuelo: Promise<Consensos> | null = null;
function cargarConsensos(): Promise<Consensos> {
  if (!enVuelo) {
    enVuelo = fetch('/api/predicciones')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { consensos?: ConsensoPartido[] } | null): Consensos =>
        d?.consensos ? new Map(d.consensos.map((c) => [c.partidoId, c])) : new Map()
      )
      .catch((): Consensos => new Map())
      .finally(() => {
        enVuelo = null;
      });
  }
  return enVuelo;
}

/**
 * Trae el consenso de las 3 IAs por partido (/api/predicciones) y lo indexa
 * por partidoId, para que cada tarjeta jugable enfrente el pick del usuario
 * contra "lo que dicen las IAs" sin destapar la predicción completa.
 * Silencioso ante fallos: si no carga, el selector sigue jugable.
 */
export function usePredicciones() {
  const [consensos, setConsensos] = useState<Consensos>(() => new Map());

  useEffect(() => {
    let cancelado = false;
    cargarConsensos().then((m) => {
      if (!cancelado) setConsensos(m);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  return consensos;
}
