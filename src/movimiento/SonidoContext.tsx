import { createContext, useContext, type ReactNode } from 'react';
import { useSonido } from '../hooks/useSonido.ts';

/**
 * Contexto de sonido: expone un único `useSonido()` para toda la app, para que
 * el toggle del header y los `play()` de cualquier componente compartan la misma
 * AudioContext y el mismo estado (evita contextos desincronizados).
 */
type SonidoApi = ReturnType<typeof useSonido>;
const SonidoContext = createContext<SonidoApi | null>(null);

export function SonidoProvider({ children }: { children: ReactNode }) {
  const api = useSonido();
  return <SonidoContext.Provider value={api}>{children}</SonidoContext.Provider>;
}

/** Hook de consumo. Si se usa fuera del provider, devuelve un no-op seguro. */
export function useSonidoUI(): SonidoApi {
  const ctx = useContext(SonidoContext);
  if (ctx) return ctx;
  return {
    activo: false,
    toggle: async () => {},
    play: () => {},
    init: async () => {},
  };
}
