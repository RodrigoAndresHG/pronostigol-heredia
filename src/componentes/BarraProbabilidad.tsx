import { porcentajesNormalizados } from '../lib/formato';

/**
 * Barra horizontal de 3 segmentos que visualiza la distribución
 * de probabilidad de un partido: local | empate | visitante.
 *
 * Es la visualización más usada en la app — aparece en la barra
 * base, en cada tarjeta de IA, en la síntesis final y en el mercado.
 *
 * Convención de color:
 *   - local     → verde-cancha (marca-primario)
 *   - empate    → gris medio
 *   - visitante → ámbar (marca-acento)
 */

interface Props {
  local: number;
  empate: number;
  visitante: number;
  /** Si se pasa, se muestra encima de la barra. */
  titulo?: string;
  /** Tamaño compacto para usar dentro de tarjetas de IA. */
  compacto?: boolean;
}

function BarraProbabilidad({ local, empate, visitante, titulo, compacto = false }: Props) {
  const [pctLocal, pctEmpate, pctVisitante] = porcentajesNormalizados(
    local,
    empate,
    visitante
  );

  const alto = compacto ? 'h-2' : 'h-3';
  const fontSize = compacto ? 'text-xs' : 'text-sm';

  return (
    <div>
      {titulo && (
        <p className="text-xs uppercase tracking-wider text-marca-grisTexto font-semibold mb-1.5">
          {titulo}
        </p>
      )}

      {/* Barra */}
      <div className={`flex w-full ${alto} rounded-full overflow-hidden bg-marca-grisLinea`}>
        <div
          className="bg-marca-primario transition-all"
          style={{ width: pctLocal }}
          aria-label={`Local ${pctLocal}`}
        />
        <div
          className="bg-marca-grisTexto/40 transition-all"
          style={{ width: pctEmpate }}
          aria-label={`Empate ${pctEmpate}`}
        />
        <div
          className="bg-marca-acento transition-all"
          style={{ width: pctVisitante }}
          aria-label={`Visitante ${pctVisitante}`}
        />
      </div>

      {/* Leyenda con porcentajes */}
      <div className={`mt-1.5 flex justify-between ${fontSize} font-medium text-marca-tinta`}>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-marca-primario" />
          Local <span className="text-marca-grisTexto">{pctLocal}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-marca-grisTexto/40" />
          Empate <span className="text-marca-grisTexto">{pctEmpate}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-marca-acento" />
          Visitante <span className="text-marca-grisTexto">{pctVisitante}</span>
        </span>
      </div>
    </div>
  );
}

export default BarraProbabilidad;
