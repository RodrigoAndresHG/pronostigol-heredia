import { useCallback, useEffect, useState } from 'react';
import type { Prediccion } from '../tipos';

/**
 * Hook que conversa con /api/predecir en el modelo "publicación".
 *
 *   - Al montar: GET /api/predecir?partidoId=... para traer la última
 *     predicción guardada en Supabase. Si no hay (404), estado pasa a
 *     `sin-prediccion`.
 *   - `generar()`: POST /api/predecir con el header X-Codigo-Admin.
 *     Sólo funciona si `codigoAdmin` es no-null. El backend valida.
 *
 * El timestamp `guardadaEn` viene incluido en la respuesta — lo
 * exponemos para que la UI muestre cuándo se publicó la predicción.
 */

export type EstadoApi =
  | { tipo: 'cargando' }
  | { tipo: 'sin-prediccion' }
  | { tipo: 'ok'; prediccion: Prediccion; guardadaEn: string | null }
  | { tipo: 'error'; mensaje: string };

interface UsePrediccionApi {
  estado: EstadoApi;
  /** Re-dispara la generación (sólo admin). */
  generar: () => Promise<void>;
  /** True mientras se ejecuta una llamada POST. */
  generando: boolean;
}

interface RespuestaApi extends Prediccion {
  guardadaEn?: string | null;
  errorGuardado?: string | null;
}

export function usePrediccionApi(
  partidoId: string | undefined,
  codigoAdmin: string | null
): UsePrediccionApi {
  const [estado, setEstado] = useState<EstadoApi>({ tipo: 'cargando' });
  const [generando, setGenerando] = useState(false);

  // GET inicial: trae la última guardada.
  useEffect(() => {
    if (!partidoId) return;
    let cancelado = false;
    setEstado({ tipo: 'cargando' });

    fetch(`/api/predecir?partidoId=${encodeURIComponent(partidoId)}`)
      .then(async (res) => {
        if (cancelado) return;
        if (res.status === 404) {
          setEstado({ tipo: 'sin-prediccion' });
          return;
        }
        if (!res.ok) {
          const cuerpo = await res.json().catch(() => null);
          throw new Error(cuerpo?.error || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as RespuestaApi;
        const { guardadaEn = null, errorGuardado: _e, ...prediccion } = data;
        setEstado({
          tipo: 'ok',
          prediccion: prediccion as Prediccion,
          guardadaEn,
        });
      })
      .catch((err: Error) => {
        if (cancelado) return;
        setEstado({ tipo: 'error', mensaje: err.message });
      });

    return () => {
      cancelado = true;
    };
  }, [partidoId]);

  // POST: generar nueva (sólo admin).
  const generar = useCallback(async () => {
    if (!partidoId || !codigoAdmin) return;
    setGenerando(true);
    try {
      const res = await fetch('/api/predecir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Codigo-Admin': codigoAdmin,
        },
        body: JSON.stringify({ partidoId }),
      });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => null);
        throw new Error(cuerpo?.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as RespuestaApi;
      const { guardadaEn = null, errorGuardado, ...prediccion } = data;
      if (errorGuardado) {
        // Mostramos la predicción pero advertimos del error de guardado.
        console.warn('Predicción generada pero NO guardada:', errorGuardado);
      }
      setEstado({
        tipo: 'ok',
        prediccion: prediccion as Prediccion,
        guardadaEn,
      });
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error desconocido al generar';
      setEstado({ tipo: 'error', mensaje });
    } finally {
      setGenerando(false);
    }
  }, [partidoId, codigoAdmin]);

  return { estado, generar, generando };
}
