import type { DesgloseModelo } from '../lib/modeloBase';
import { equipoPorId } from '../datos/equipos.ts';
import { porcentaje } from '../lib/formato';

/**
 * Expandible "Cómo lo calculó" — abre el detalle del modelo base.
 * Estética editorial: tabla mono dentro de un <details>. Demuestra que
 * la Capa 1 no es caja negra: cada factor es un número auditable.
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
    <details className="group rounded-lg bg-tinta-tarjeta border border-tinta-linea overflow-hidden">
      <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between hover:bg-tinta-elevado/50 transition-colors">
        <span className="font-mono text-[13px] text-tinta-cuerpo uppercase tracking-wide">
          Cómo lo calculó la Capa 1
        </span>
        <span className="text-tinta-mute group-open:rotate-180 transition-transform font-mono">
          ▾
        </span>
      </summary>
      <div className="px-5 pb-5 space-y-1 font-mono text-[13px]">
        <p className="text-tinta-mute font-sans text-sm leading-relaxed pb-3 pt-1 max-w-lectura">
          El modelo parte del rating Elo de cada equipo y suma ajustes
          objetivos. Sin opinión cualitativa — sólo números.
        </p>

        <Linea etiqueta={`Rating · ${local.id}`} valor={`${desglose.ratingLocal}`} />
        <Linea
          etiqueta="Ventaja de sede"
          valor={`${desglose.bonusSedeLocal >= 0 ? '+' : ''}${desglose.bonusSedeLocal}`}
          ayuda={
            desglose.bonusSedeLocal === 120
              ? 'Anfitrión en su país'
              : desglose.bonusSedeLocal === 0
                ? 'Sede neutral'
                : 'Bonus nominal'
          }
        />
        {desglose.ajusteFormaLocal !== 0 && (
          <Linea
            etiqueta="Forma del local"
            valor={`${desglose.ajusteFormaLocal >= 0 ? '+' : ''}${desglose.ajusteFormaLocal}`}
          />
        )}
        {desglose.ajusteDescansoLocal !== 0 && (
          <Linea etiqueta="Descanso del local" valor={`${desglose.ajusteDescansoLocal}`} />
        )}
        <Linea
          etiqueta={`Efectivo · ${local.id}`}
          valor={`${Math.round(desglose.ratingLocalEfectivo)}`}
          destacado
        />

        <div className="h-px bg-tinta-linea my-2" />

        <Linea etiqueta={`Rating · ${visitante.id}`} valor={`${desglose.ratingVisitante}`} />
        {desglose.ajusteFormaVisitante !== 0 && (
          <Linea
            etiqueta="Forma del visitante"
            valor={`${desglose.ajusteFormaVisitante >= 0 ? '+' : ''}${desglose.ajusteFormaVisitante}`}
          />
        )}
        {desglose.ajusteDescansoVisitante !== 0 && (
          <Linea etiqueta="Descanso del visitante" valor={`${desglose.ajusteDescansoVisitante}`} />
        )}
        <Linea
          etiqueta={`Efectivo · ${visitante.id}`}
          valor={`${Math.round(desglose.ratingVisitanteEfectivo)}`}
          destacado
        />

        <div className="h-px bg-tinta-linea my-2" />

        <Linea
          etiqueta="Diferencia Elo"
          valor={`${desglose.diferenciaElo > 0 ? '+' : ''}${Math.round(desglose.diferenciaElo)}`}
          ayuda={
            desglose.diferenciaElo > 0
              ? 'Favor local'
              : desglose.diferenciaElo < 0
                ? 'Favor visitante'
                : 'Equilibrio'
          }
        />
        <Linea
          etiqueta="Prob. empate"
          valor={porcentaje(desglose.probEmpate)}
          ayuda="Decrece con la diferencia"
        />

        <p className="text-tinta-mute/70 font-sans text-xs italic pt-3 leading-relaxed max-w-lectura">
          Forma y descanso entran con datos reales en una fase posterior. Las
          IAs (Capa 2) toman esta base y la ajustan con contexto.
        </p>
      </div>
    </details>
  );
}

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
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="text-tinta-mute">
        {etiqueta}
        {ayuda && <span className="text-tinta-mute/60 ml-2 text-[11px]">{ayuda}</span>}
      </span>
      <span
        className={`tabular whitespace-nowrap ${destacado ? 'text-verde font-semibold' : 'text-tinta-cuerpo'}`}
      >
        {valor}
      </span>
    </div>
  );
}

export default DesgloseModeloBase;
