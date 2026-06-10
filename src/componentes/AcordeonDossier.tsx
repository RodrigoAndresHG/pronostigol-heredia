import type { DossierEquipo, HechosPartido } from '../tipos';

/**
 * "Los hechos que recibieron las IAs" — el dossier de anclaje, visible.
 *
 * Muestra los datos verificados y datados con los que razonaron los 3
 * modelos. Es la transparencia radical del producto: pruebas, a la vista,
 * que la predicción NO sale de la memoria vieja de un modelo sino de hechos
 * auditables. Si ves "DT: Beccacece" aquí, sabes que ninguna IA pudo decir
 * "Sánchez Bas".
 *
 * Estética editorial: un <details> con dos fichas mono, una por equipo.
 */

interface Props {
  hechos: HechosPartido;
  codigoLocal: string;
  codigoVisitante: string;
  nombreLocal: string;
  nombreVisitante: string;
}

function AcordeonDossier({
  hechos,
  codigoLocal,
  codigoVisitante,
  nombreLocal,
  nombreVisitante,
}: Props) {
  return (
    <details
      className="group rounded-lg bg-tinta-tarjeta border border-tinta-linea overflow-hidden"
      open
    >
      <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between hover:bg-tinta-elevado/50 transition-colors">
        <span className="flex items-center gap-2 font-mono text-[13px] text-tinta-cuerpo uppercase tracking-wide">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-verde" />
          Los hechos que recibieron las IAs
        </span>
        <span className="text-tinta-mute group-open:rotate-180 transition-transform font-mono">
          ▾
        </span>
      </summary>

      <div className="px-5 pb-5">
        <p className="text-tinta-mute font-sans text-sm leading-relaxed pb-4 pt-1 max-w-lectura">
          Datos verificados al{' '}
          <span className="text-tinta-cuerpo">{hechos.capturadoEl}</span>. Las 3
          IAs razonaron sólo con esto y el modelo base — tienen prohibido
          inventar entrenadores, jugadores o estadísticas fuera de aquí.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FichaDossier codigo={codigoLocal} nombre={nombreLocal} d={hechos.local} />
          <FichaDossier
            codigo={codigoVisitante}
            nombre={nombreVisitante}
            d={hechos.visitante}
          />
        </div>
      </div>
    </details>
  );
}

function FichaDossier({
  codigo,
  nombre,
  d,
}: {
  codigo: string;
  nombre: string;
  d: DossierEquipo;
}) {
  return (
    <div className="rounded-md bg-tinta-fondo border border-tinta-linea p-4">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-tinta-titulo font-semibold">{codigo}</span>
        <span className="font-display text-tinta-cuerpo text-[15px] leading-tight">
          {nombre}
        </span>
      </div>

      <dl className="mt-3 space-y-2 font-mono text-[13px]">
        <DatoDossier
          etiqueta="DT"
          valor={`${d.dt}${d.dtDesde ? ` · desde ${d.dtDesde}` : ''}`}
          destacado
        />
        {d.estrella && <DatoDossier etiqueta="Figura" valor={d.estrella} />}
        {d.formaReciente && <DatoDossier etiqueta="Forma" valor={d.formaReciente} />}
        {d.notaTorneo && <DatoDossier etiqueta="Torneo" valor={d.notaTorneo} />}
      </dl>
    </div>
  );
}

function DatoDossier({
  etiqueta,
  valor,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <dt className="text-tinta-mute shrink-0 w-12">{etiqueta}</dt>
      <dd
        className={`font-sans leading-snug ${destacado ? 'text-verde' : 'text-tinta-cuerpo'}`}
      >
        {valor}
      </dd>
    </div>
  );
}

export default AcordeonDossier;
