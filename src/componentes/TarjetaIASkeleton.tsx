import type { NombreIA } from '../tipos';

/**
 * Placeholder visual que se muestra mientras esperamos la respuesta
 * de una IA. Usa animación pulse de Tailwind para indicar carga
 * sin requerir un spinner.
 */

const IDENTIDAD: Record<NombreIA, { color: string; emoji: string }> = {
  Claude: { color: '#D97757', emoji: '✦' },
  GPT: { color: '#10A37F', emoji: '◐' },
  Gemini: { color: '#4285F4', emoji: '◆' },
};

function TarjetaIASkeleton({ ia }: { ia: NombreIA }) {
  const ident = IDENTIDAD[ia];
  return (
    <div className="rounded-2xl border border-marca-grisLinea bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: ident.color }}
        >
          {ident.emoji}
        </span>
        <div>
          <p className="font-display font-semibold text-marca-tinta leading-tight">
            {ia}
          </p>
          <p className="text-xs text-marca-grisTexto animate-pulse">
            Razonando…
          </p>
        </div>
      </div>
      <div className="h-2 bg-marca-grisLinea rounded-full animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 bg-marca-grisLinea rounded animate-pulse" />
        <div className="h-3 bg-marca-grisLinea rounded animate-pulse w-5/6" />
        <div className="h-3 bg-marca-grisLinea rounded animate-pulse w-3/4" />
      </div>
    </div>
  );
}

export default TarjetaIASkeleton;
