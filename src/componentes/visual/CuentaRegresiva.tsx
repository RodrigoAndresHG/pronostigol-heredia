import { useEffect, useRef, useState } from 'react';
import { useSonidoUI } from '../../movimiento/SonidoContext.tsx';

/**
 * Cuenta regresiva editorial con vida: dígitos que hacen flip al cambiar
 * (estilo split-flap sutil) y un latido del segundero. Sólo se animan los
 * dígitos que cambian. Ancho fijo por dígito → cero salto de layout.
 * Respeta prefers-reduced-motion vía el bloque @media en index.css.
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
  const { play } = useSonidoUI();
  const segPrev = useRef(t.segundos);

  useEffect(() => {
    const i = setInterval(() => {
      const nuevo = calcular(fechaObjetivoISO);
      setT(nuevo);
      // Tick de sonido (sólo si el usuario activó el audio; play() ya lo gatea).
      if (nuevo.segundos !== segPrev.current) {
        segPrev.current = nuevo.segundos;
        play('tick');
      }
    }, 1000);
    return () => clearInterval(i);
  }, [fechaObjetivoISO, play]);

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
  const texto = String(valor).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      {/* El latido (scale) se reinicia con key={valor} cuando cambia el segundo */}
      <span
        key={señal ? valor : undefined}
        className={`flex font-display font-bold leading-none text-4xl sm:text-5xl ${señal ? 'text-verde animate-latido' : 'text-tinta-titulo'}`}
      >
        <Digito d={texto[0]} />
        <Digito d={texto[1]} />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-kicker text-tinta-mute mt-1.5">
        {etiqueta}
      </span>
    </div>
  );
}

/** Un dígito con flip: el saliente sube y el entrante llega desde abajo. */
function Digito({ d }: { d: string }) {
  const prev = useRef(d);
  const cambio = prev.current !== d;
  useEffect(() => {
    prev.current = d;
  }, [d]);

  return (
    <span
      className="relative inline-block overflow-hidden tabular"
      style={{ height: '1em', width: '0.62ch' }}
    >
      {cambio && (
        <span key={`${prev.current}-out`} className="absolute inset-0 animate-flip-out">
          {prev.current}
        </span>
      )}
      <span key={`${d}-in`} className={cambio ? 'block animate-flip-in' : 'block'}>
        {d}
      </span>
    </span>
  );
}

function Sep() {
  return <span className="font-display text-3xl sm:text-4xl text-tinta-linea leading-none mb-5">·</span>;
}

export default CuentaRegresiva;
