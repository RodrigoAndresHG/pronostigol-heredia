import type { DesgloseModelo } from '../lib/modeloBase';
import { equipoPorId } from '../datos/equipos.ts';
import { porcentaje } from '../lib/formato';

/**
 * Expandible "Cómo lo calculó" que abre el detalle del modelo base.
 *
 * Lista cada factor (rating base, ventaja de sede, forma, descanso) y
 * la diferencia Elo efectiva. Sirve para que se entienda que la Capa 1
 * no es una caja negra — es una fórmula transparente.
 */

interface Props {
  desglose: DesgloseModelo;
  equipoLocalId: string;
  equipoVisitanteId: string;
}

function DesgloseModeloBase({ desglose, equipoLocalId, equipoVisitanteId }: Props) {
  const local = equipoPorId(equipoLocalId);
  const visitante = equipoPorId(equipoVisitanteId);

  return (
    <details className="rounded-2xl bg-white border border-marca-grisLinea overflow-hidden">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-marca-tinta hover:bg-marca-grisFondo">
        ¿Cómo lo calculó la Capa 1?
      </summary>
      <div className="px-4 pb-4 space-y-3 text-sm text-marca-grisTexto">
        <p>
          El modelo base parte del rating tipo Elo de cada equipo y le
          suma ajustes objetivos. Sin opinión cualitativa — sólo números.
        </p>

        <Linea
          etiqueta={`Rating base de ${local.banderaEmoji} ${local.nombre}`}
          valor={`${desglose.ratingLocal}`}
        />
        <Linea
          etiqueta="Ventaja de sede para el local"
          valor={`${desglose.bonusSedeLocal >= 0 ? '+' : ''}${desglose.bonusSedeLocal}`}
          ayuda={
            desglose.bonusSedeLocal === 120
              ? 'Anfitrión jugando en su propio país'
              : 'Bonus nominal (vestidor, coin-toss)'
          }
        />
        {desglose.ajusteFormaLocal !== 0 && (
          <Linea
            etiqueta="Forma reciente del local"
            valor={`${desglose.ajusteFormaLocal >= 0 ? '+' : ''}${desglose.ajusteFormaLocal}`}
          />
        )}
        {desglose.ajusteDescansoLocal !== 0 && (
          <Linea
            etiqueta="Descanso del local"
            valor={`${desglose.ajusteDescansoLocal}`}
            ayuda="Penalización por descanso corto"
          />
        )}
        <Linea
          etiqueta={`Rating efectivo del local`}
          valor={`${Math.round(desglose.ratingLocalEfectivo)}`}
          destacado
        />

        <div className="border-t border-marca-grisLinea my-2" />

        <Linea
          etiqueta={`Rating base de ${visitante.banderaEmoji} ${visitante.nombre}`}
          valor={`${desglose.ratingVisitante}`}
        />
        {desglose.ajusteFormaVisitante !== 0 && (
          <Linea
            etiqueta="Forma reciente del visitante"
            valor={`${desglose.ajusteFormaVisitante >= 0 ? '+' : ''}${desglose.ajusteFormaVisitante}`}
          />
        )}
        {desglose.ajusteDescansoVisitante !== 0 && (
          <Linea
            etiqueta="Descanso del visitante"
            valor={`${desglose.ajusteDescansoVisitante}`}
          />
        )}
        <Linea
          etiqueta="Rating efectivo del visitante"
          valor={`${Math.round(desglose.ratingVisitanteEfectivo)}`}
          destacado
        />

        <div className="border-t border-marca-grisLinea my-2" />

        <Linea
          etiqueta="Diferencia efectiva (Elo)"
          valor={`${desglose.diferenciaElo > 0 ? '+' : ''}${Math.round(desglose.diferenciaElo)}`}
          ayuda={
            desglose.diferenciaElo > 0
              ? 'Favorece al local'
              : desglose.diferenciaElo < 0
                ? 'Favorece al visitante'
                : 'Equilibrio total'
          }
        />
        <Linea
          etiqueta="Probabilidad de empate estimada"
          valor={porcentaje(desglose.probEmpate)}
          ayuda="Decrece al aumentar la diferencia de rating"
        />

        <p className="pt-2 text-xs text-marca-grisTexto/80 italic">
          Forma y descanso están en cero por ahora; entran con datos reales en
          Fase 4 (football-data.org). Las IAs (Capa 2) toman esta base como
          punto de partida y la ajustan con contexto cualitativo.
        </p>
      </div>
    </details>
  );
}

/** Una línea etiqueta / valor con tooltip opcional. */
function Linea({
  etiqueta,
  valor,
  ayuda,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  ayuda?: string;
  destacado?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-marca-grisTexto">
        {etiqueta}
        {ayuda && (
          <span className="block text-xs text-marca-grisTexto/70 italic">
            {ayuda}
          </span>
        )}
      </span>
      <span
        className={`font-mono whitespace-nowrap ${
          destacado ? 'font-bold text-marca-tinta' : 'text-marca-tinta'
        }`}
      >
        {valor}
      </span>
    </div>
  );
}

export default DesgloseModeloBase;
