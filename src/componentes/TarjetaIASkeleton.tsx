import type { NombreIA } from '../tipos';

/**
 * Placeholder de carga de una tarjeta IA. Estética editorial: sin spinner,
 * sólo barras que pulsan suavemente. Mantiene el avatar de letra para que
 * el layout no salte al llegar la respuesta.
 */

const INICIAL: Record<NombreIA, { inicial: string; anillo: string; texto: string }> = {
  Claude: { inicial: 'C', anillo: 'border-verde/40', texto: 'text-verde/60' },
  GPT: { inicial: 'G', anillo: 'border-cyan/40', texto: 'text-cyan/60' },
  Gemini: { inicial: 'G', anillo: 'border-alerta/40', texto: 'text-alerta/60' },
};

function TarjetaIASkeleton({ ia }: { ia: NombreIA }) {
  const id = INICIAL[ia];
  return (
    <div className="rounded-lg border border-tinta-linea bg-tinta-elevado p-5">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full border ${id.anillo} bg-tinta-fondo font-mono font-semibold ${id.texto}`}
        >
          {id.inicial}
        </span>
        <div>
          <p className="font-sans font-semibold text-tinta-cuerpo text-[15px] leading-tight">
            {ia}
          </p>
          <p className="font-mono text-[11px] text-tinta-mute animate-pulse-señal">
            RAZONANDO…
          </p>
        </div>
      </div>
      <div className="mt-5 h-10 w-20 bg-tinta-linea rounded animate-pulse-señal" />
      <div className="mt-5 space-y-2">
        <div className="h-2.5 bg-tinta-linea rounded animate-pulse-señal" />
        <div className="h-2.5 bg-tinta-linea rounded animate-pulse-señal w-5/6" />
        <div className="h-2.5 bg-tinta-linea rounded animate-pulse-señal w-3/4" />
      </div>
    </div>
  );
}

export default TarjetaIASkeleton;
