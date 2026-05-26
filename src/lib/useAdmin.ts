import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Maneja el estado "admin" del usuario.
 *
 * El código de admin vive en localStorage. Se establece de dos formas:
 *   1. Compartiendo una URL con `?admin=XYZ` (ej. tu bookmark personal
 *      o un enlace en tu password manager). El hook lo captura y lo
 *      guarda automáticamente, luego limpia el query param de la URL
 *      para que no quede expuesto.
 *   2. Llamando a `iniciarSesion(codigo)` manualmente.
 *
 * Si tu sesión tiene código guardado, los componentes que lo necesitan
 * (botones de generar) lo recogen y lo mandan en el header X-Codigo-Admin.
 * El backend valida contra la env var CODIGO_ADMIN.
 *
 * Nota: localStorage NO es seguro para datos sensibles si compartes la
 * máquina. Para una vitrina personal sirve. Si en el futuro queremos
 * auth real, hacemos /api/login con httpOnly cookie.
 */

const CLAVE_LOCALSTORAGE = 'pronostigol-codigo-admin';

interface EstadoAdmin {
  codigoAdmin: string | null;
  iniciarSesion: (codigo: string) => void;
  cerrarSesion: () => void;
}

export function useAdmin(): EstadoAdmin {
  const [codigoAdmin, setCodigoAdmin] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // 1. Si la URL trae ?admin=XYZ, lo guardamos y lo limpiamos de la URL.
    const codigoEnURL = searchParams.get('admin');
    if (codigoEnURL) {
      try {
        localStorage.setItem(CLAVE_LOCALSTORAGE, codigoEnURL);
      } catch {
        /* storage lleno o desactivado */
      }
      const nuevos = new URLSearchParams(searchParams);
      nuevos.delete('admin');
      setSearchParams(nuevos, { replace: true });
      setCodigoAdmin(codigoEnURL);
      return;
    }
    // 2. Recuperamos de localStorage si existe.
    try {
      const guardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
      setCodigoAdmin(guardado);
    } catch {
      setCodigoAdmin(null);
    }
  }, [searchParams, setSearchParams]);

  const iniciarSesion = (codigo: string) => {
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, codigo);
    } catch {
      /* storage lleno o desactivado */
    }
    setCodigoAdmin(codigo);
  };

  const cerrarSesion = () => {
    try {
      localStorage.removeItem(CLAVE_LOCALSTORAGE);
    } catch {
      /* nada que hacer */
    }
    setCodigoAdmin(null);
  };

  return { codigoAdmin, iniciarSesion, cerrarSesion };
}
