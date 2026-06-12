import { useCallback, useEffect, useState } from 'react';
import { canalConSeguimiento } from '../marca/enlaces.ts';
import type { Veredicto } from '../tipos';

/**
 * Botón "Compartir" mobile-first.
 *
 * Estrategia (de la investigación de Fase 6):
 *   - Pre-carga la imagen (/api/og-imagen) como File en useEffect, ANTES
 *     del click. iOS Safari pierde la "activación transitoria" del gesto si
 *     hay un `await` dentro del onClick → la hoja de compartir no abre o
 *     comparte solo el link.
 *   - Al tocar: si el navegador puede compartir archivos → comparte la
 *     IMAGEN nativa (se va directo a TikTok/IG/WhatsApp). Si no, cae a
 *     compartir el link, y en desktop a descargar imagen / copiar link.
 *   - Ignora AbortError (el usuario canceló, no es un fallo).
 */

/**
 * Súbelo si cambia el DISEÑO de la imagen compartible. Forma parte del
 * "rompe-caché" de la URL para que WhatsApp/redes traigan la vista previa
 * nueva en vez de la cacheada.
 */
const VERSION_IMAGEN = '2';

interface Props {
  idPartido: string;
  /** Texto del título/descr. al compartir (ej. "México vs Sudáfrica"). */
  titulo: string;
  /** Si es 'desacuerdo', se comparte la imagen vertical "Choque de IAs". */
  veredicto?: Veredicto;
  /**
   * Timestamp de la predicción (guardadaEn). Junto con VERSION_IMAGEN forma
   * un sufijo `?v=` en la URL compartida: cuando la predicción se regenera o
   * cambia el diseño, la URL cambia y WhatsApp deja de mostrar la cacheada.
   */
  version?: string | null;
}

type Estado = 'idle' | 'copiado' | 'descargado' | 'error';

function BotonCompartir({ idPartido, titulo, veredicto, version }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [estado, setEstado] = useState<Estado>('idle');

  // El desacuerdo se comparte como imagen vertical 9:16 ("el choque"):
  // formato nativo de Stories/Reels/TikTok y el momento más viral.
  const esChoque = veredicto === 'desacuerdo';
  const urlImagen = `/api/og-imagen?partidoId=${encodeURIComponent(idPartido)}${esChoque ? '&formato=vertical' : ''}`;

  // Rompe-caché del preview: cambia al regenerar la predicción o el diseño.
  const ts = version && !Number.isNaN(new Date(version).getTime())
    ? new Date(version).getTime()
    : 0;
  const bust = `${ts}-${VERSION_IMAGEN}`;
  const base =
    typeof window !== 'undefined'
      ? `${window.location.origin}/partido/${idPartido}`
      : `https://pronostigol.rodriheredia.com/partido/${idPartido}`;
  const urlCompartir = `${base}?v=${bust}`;
  const texto = esChoque
    ? `${titulo} — Las 3 IAs NO se ponen de acuerdo · PronostiGol HeredIA`
    : `${titulo} — Predicción de 3 IAs · PronostiGol HeredIA`;
  const etiquetaBoton = esChoque ? 'Compartir el choque de IAs' : 'Compartir predicción';

  // Pre-cargar la imagen como File (antes del click).
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch(urlImagen);
        if (!res.ok) return;
        const blob = await res.blob();
        const f = new File([blob], `pronostigol-${idPartido}${esChoque ? '-choque' : ''}.png`, {
          type: blob.type || 'image/png',
        });
        if (!cancelado) setArchivo(f);
      } catch {
        /* sin imagen: el botón usará fallback de link */
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [urlImagen, idPartido, esChoque]);

  const puedeCompartirImagen =
    typeof navigator !== 'undefined' &&
    !!navigator.canShare &&
    !!archivo &&
    navigator.canShare({ files: [archivo] });

  const descargar = useCallback(() => {
    if (!archivo) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(archivo);
    a.download = archivo.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
    setEstado('descargado');
    setTimeout(() => setEstado('idle'), 2500);
  }, [archivo]);

  const copiarLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(urlCompartir);
      setEstado('copiado');
      setTimeout(() => setEstado('idle'), 2500);
    } catch {
      setEstado('error');
      setTimeout(() => setEstado('idle'), 2500);
    }
  }, [urlCompartir]);

  const compartir = useCallback(async () => {
    // 1) Compartir la imagen nativamente (móvil).
    if (puedeCompartirImagen && archivo) {
      try {
        await navigator.share({ files: [archivo], title: titulo, text: texto, url: urlCompartir });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    // 2) Compartir sólo link/texto (móvil sin soporte de archivos).
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url: urlCompartir });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    // 3) Desktop / sin Web Share: copiar link.
    await copiarLink();
  }, [puedeCompartirImagen, archivo, titulo, texto, urlCompartir, copiarLink]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={compartir}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-verde text-tinta-fondo font-semibold text-sm hover:bg-verde-hover transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        {etiquetaBoton}
      </button>

      {/* Fallbacks visibles en desktop / sin Web Share de archivos */}
      {!puedeCompartirImagen && archivo && (
        <button
          onClick={descargar}
          className="inline-flex items-center px-4 py-2 rounded-md border border-tinta-lineaFuerte text-tinta-cuerpo text-sm hover:border-tinta-mute transition-colors"
        >
          Descargar imagen
        </button>
      )}
      <button
        onClick={copiarLink}
        className="inline-flex items-center px-3 py-2 rounded-md text-tinta-mute text-sm hover:text-tinta-cuerpo transition-colors font-mono"
      >
        Copiar link
      </button>

      {/* Feedback */}
      {estado === 'copiado' && (
        <span className="font-mono text-[12px] text-verde" aria-live="polite">
          ✓ Link copiado
        </span>
      )}
      {estado === 'descargado' && (
        <span className="font-mono text-[12px] text-verde" aria-live="polite">
          ✓ Imagen descargada
        </span>
      )}
      {estado === 'error' && (
        <span className="font-mono text-[12px] text-alerta" aria-live="polite">
          No se pudo copiar
        </span>
      )}

      {/* Anclaje viral discreto: el canal */}
      <a
        href={canalConSeguimiento('compartir')}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto font-mono text-[12px] text-tinta-mute hover:text-verde transition-colors"
      >
        + Canal WhatsApp
      </a>
    </div>
  );
}

export default BotonCompartir;
