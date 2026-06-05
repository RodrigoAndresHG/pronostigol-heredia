import { useEffect, useState } from 'react';

/**
 * Cuenta regresiva en vivo hasta una fecha objetivo.
 *
 * Se actualiza una vez por segundo. Cuando el objetivo ya pasó, muestra
 * un texto alternativo ("¡Ya empezó!" por defecto). Es un componente
 * puramente visual — el padre decide la fecha objetivo y los estilos.
 */

interface Props {
  /** Fecha objetivo en ISO UTC. */
  fechaObjetivoISO: string;
  /** Texto a mostrar cuando ya pasó la fecha. */
  textoFinalizado?: string;
  className?: string;
}

interface Tiempo {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  pasado: boolean;
}

function calcularTiempo(fechaObjetivoISO: string): Tiempo {
  const ahora = Date.now();
  const objetivo = new Date(fechaObjetivoISO).getTime();
  const diff = objetivo - ahora;

  if (diff <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, pasado: true };
  }

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diff / (1000 * 60)) % 60);
  const segundos = Math.floor((diff / 1000) % 60);
  return { dias, horas, minutos, segundos, pasado: false };
}

function CuentaRegresiva({
  fechaObjetivoISO,
  textoFinalizado = '¡Ya empezó!',
  className = '',
}: Props) {
  const [tiempo, setTiempo] = useState<Tiempo>(() =>
    calcularTiempo(fechaObjetivoISO)
  );

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempo(calcularTiempo(fechaObjetivoISO));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [fechaObjetivoISO]);

  if (tiempo.pasado) {
    return (
      <div className={`text-center ${className}`}>
        <p className="font-display text-2xl font-bold text-marca-acento animate-pulse-suave">
          {textoFinalizado}
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-4 gap-2 sm:gap-4 ${className}`}>
      <Caja valor={tiempo.dias} etiqueta={tiempo.dias === 1 ? 'día' : 'días'} />
      <Caja
        valor={tiempo.horas}
        etiqueta={tiempo.horas === 1 ? 'hora' : 'horas'}
      />
      <Caja
        valor={tiempo.minutos}
        etiqueta={tiempo.minutos === 1 ? 'min' : 'mins'}
      />
      <Caja
        valor={tiempo.segundos}
        etiqueta="seg"
        destacar
      />
    </div>
  );
}

function Caja({
  valor,
  etiqueta,
  destacar = false,
}: {
  valor: number;
  etiqueta: string;
  destacar?: boolean;
}) {
  return (
    <div
      className={`rounded-xl backdrop-blur-sm border border-white/20 px-2 py-3 sm:py-4 text-center ${
        destacar ? 'bg-marca-acento/30' : 'bg-white/10'
      }`}
    >
      <p
        className={`font-display text-2xl sm:text-4xl font-bold text-white ${
          destacar ? 'animate-pulse-suave' : ''
        }`}
      >
        {String(valor).padStart(2, '0')}
      </p>
      <p className="text-xs uppercase tracking-wider text-white/70 mt-1">
        {etiqueta}
      </p>
    </div>
  );
}

export default CuentaRegresiva;
