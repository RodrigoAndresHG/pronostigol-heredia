import { useEffect, useState } from 'react';

/**
 * Cuenta regresiva editorial hasta una fecha objetivo. Cifras en Fraunces
 * tabular, etiquetas en mono. Sin cajas con glow — sólo números grandes y
 * separadores finos. Tick cada segundo.
 */

interface Props {
  fechaObjetivoISO: string;
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

function calcular(fechaObjetivoISO: string): Tiempo {
  const diff = new Date(fechaObjetivoISO).getTime() - Date.now();
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, pasado: true };
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff / 3600000) % 24),
    minutos: Math.floor((diff / 60000) % 60),
    segundos: Math.floor((diff / 1000) % 60),
    pasado: false,
  };
}

function CuentaRegresiva({ fechaObjetivoISO, textoFinalizado = 'En juego', className = '' }: Props) {
  const [t, setT] = useState<Tiempo>(() => calcular(fechaObjetivoISO));

  useEffect(() => {
    const i = setInterval(() => setT(calcular(fechaObjetivoISO)), 1000);
    return () => clearInterval(i);
  }, [fechaObjetivoISO]);

  if (t.pasado) {
    return (
      <p className={`font-mono text-verde uppercase tracking-kicker animate-pulse-señal ${className}`}>
        {textoFinalizado}
      </p>
    );
  }

  return (
    <div className={`flex items-end gap-4 sm:gap-6 ${className}`}>
      <Unidad valor={t.dias} etiqueta={t.dias === 1 ? 'día' : 'días'} />
      <Sep />
      <Unidad valor={t.horas} etiqueta="hrs" />
      <Sep />
      <Unidad valor={t.minutos} etiqueta="min" />
      <Sep />
      <Unidad valor={t.segundos} etiqueta="seg" señal />
    </div>
  );
}

function Unidad({
  valor,
  etiqueta,
  señal = false,
}: {
  valor: number;
  etiqueta: string;
  señal?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-display font-bold tabular leading-none text-4xl sm:text-5xl ${señal ? 'text-verde' : 'text-tinta-titulo'}`}
      >
        {String(valor).padStart(2, '0')}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-kicker text-tinta-mute mt-1.5">
        {etiqueta}
      </span>
    </div>
  );
}

function Sep() {
  return <span className="font-display text-3xl sm:text-4xl text-tinta-linea leading-none mb-5">·</span>;
}

export default CuentaRegresiva;
