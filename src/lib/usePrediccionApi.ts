import { useEffect, useState } from 'react';
import type { Prediccion } from '../tipos';

/**
 * Hook que maneja la llamada a /api/predecir.
 *
 * Diseño deliberado:
 *   - La llamada NO se dispara automáticamente al montar. Eso quemaría
 *     tokens cada vez que el usuario abre un partido. La invoca
 *     manualmente con `generar()`, típicamente al apretar un botón.
 *   - Al montar, intenta restaurar la predicción desde sessionStorage
 *     (caché por sesión del navegador). Así, si el usuario ya generó
 *     la predicción y luego volvió, no se vuelve a llamar.
 *   - Si /api falla, se queda en estado de error con `mensaje`. El UI
 *     muestra el error y deja reintentar.
 */

export type EstadoApi =
  | { tipo: 'idle' }
  | { tipo: 'cargando' }
  | { tipo: 'ok'; prediccion: Prediccion }
  | { tipo: 'error'; mensaje: string };

interface UsePrediccionApi {
  estado: EstadoApi;
  generar: () => Promise<void>;
  /** Limpia caché y vuelve a idle. Útil para forzar regeneración. */
  reiniciar: () => void;
}

const claveCache = (partidoId: string) => `prediccion:${partidoId}`;

export function usePrediccionApi(partidoId: string | undefined): UsePrediccionApi {
  const [estado, setEstado] = useState<EstadoApi>({ tipo: 'idle' });

  // Al montar (o al cambiar partidoId), restauramos desde caché de sesión si existe.
  useEffect(() => {
    if (!partidoId) {
      setEstado({ tipo: 'idle' });
      return;
    }
    const cacheado = sessionStorage.getItem(claveCache(partidoId));
    if (cacheado) {
      try {
        const prediccion = JSON.parse(cacheado) as Prediccion;
        setEstado({ tipo: 'ok', prediccion });
        return;
      } catch {
        /* JSON corrupto en cache, lo ignoramos */
      }
    }
    setEstado({ tipo: 'idle' });
  }, [partidoId]);

  const generar = async () => {
    if (!partidoId) return;
    setEstado({ tipo: 'cargando' });
    try {
      const respuesta = await fetch('/api/predecir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partidoId }),
      });
      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null);
        throw new Error(cuerpo?.error || `HTTP ${respuesta.status}`);
      }
      const prediccion = (await respuesta.json()) as Prediccion;
      try {
        sessionStorage.setItem(claveCache(partidoId), JSON.stringify(prediccion));
      } catch {
        /* sessionStorage llena, no es crítico */
      }
      setEstado({ tipo: 'ok', prediccion });
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error desconocido al consultar las IAs';
      setEstado({ tipo: 'error', mensaje });
    }
  };

  const reiniciar = () => {
    if (partidoId) sessionStorage.removeItem(claveCache(partidoId));
    setEstado({ tipo: 'idle' });
  };

  return { estado, generar, reiniciar };
}
