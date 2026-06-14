import { useMemo } from 'react';
import type { Partido, PartidoCalificado } from '../tipos';
import TarjetaPartido from '../componentes/TarjetaPartido';
import SelectorPick from './SelectorPick.tsx';
import type { ConsensoPartido } from '../../api/predicciones.ts';

/**
 * Tarjeta de partido + selector de pronóstico del usuario ("Compite contra
 * las IAs"). Envuelve <TarjetaPartido> (que es un <Link> y NO puede contener
 * botones interactivos) y, sólo para partidos FUTUROS aún no jugados, añade
 * el <SelectorPick> como hermano debajo.
 *
 * - Partido ya jugado (hay resultado): tarjeta con marcador, sin selector.
 * - Partido futuro (no ha arrancado): tarjeta + selector jugable.
 * - Partido en curso sin resultado aún: tarjeta sola (ya no se puede pronosticar).
 */

interface Props {
  partido: Partido;
  mostrarFecha?: boolean;
  /** Resultado real si ya se jugó (marca la tarjeta como finalizada). */
  resultado?: PartidoCalificado;
  /** Consenso de las 3 IAs (para enfrentarlo al pick). */
  consenso?: ConsensoPartido;
}

function TarjetaJugable({ partido, mostrarFecha, resultado, consenso }: Props) {
  // El pick sólo tiene sentido antes del pitazo. Se evalúa una vez por
  // montaje (el "ahora" se lee con new Date() como en el resto de la app).
  // El hook va antes de cualquier return condicional (reglas de hooks).
  const noHaArrancado = useMemo(
    () => new Date(partido.fechaISO).getTime() > new Date().getTime(),
    [partido.fechaISO]
  );

  if (resultado) {
    return (
      <TarjetaPartido
        partido={partido}
        mostrarFecha={mostrarFecha}
        resultado={resultado}
      />
    );
  }

  return (
    <div>
      <TarjetaPartido partido={partido} mostrarFecha={mostrarFecha} />
      {noHaArrancado && <SelectorPick partido={partido} consenso={consenso} />}
    </div>
  );
}

export default TarjetaJugable;
