import { useEffect, useRef } from 'react';

/**
 * Capa de partículas de luz finas sobre <canvas> — "polvo bajo reflectores".
 *
 * Motas blanco/verde de marca a baja opacidad, deriva vertical lentísima,
 * parpadeo senoidal. DPR-aware (tope 2), densidad por área (móvil dibuja
 * pocas), pausa con IntersectionObserver fuera de viewport, y respeta
 * prefers-reduced-motion (pinta un frame estático). <0.4 KB, sin assets.
 */
function CapaParticulas({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const lienzo = ref.current;
    if (!lienzo) return;
    const ctx = lienzo.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ancho = 0;
    let alto = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Mota = {
      x: number;
      y: number;
      r: number;
      vel: number;
      fase: number;
      vfase: number;
      verde: boolean;
    };
    let motas: Mota[] = [];

    const dimensionar = () => {
      const { width, height } = lienzo.getBoundingClientRect();
      ancho = width;
      alto = height;
      lienzo.width = Math.round(width * dpr);
      lienzo.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(45, Math.round((width * height) / 12000));
      motas = Array.from({ length: n }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.5 + Math.random() * 1.3,
        vel: 0.06 + Math.random() * 0.18,
        fase: Math.random() * Math.PI * 2,
        vfase: 0.004 + Math.random() * 0.01,
        verde: Math.random() < 0.22,
      }));
    };

    let raf = 0;
    const dibujar = () => {
      ctx.clearRect(0, 0, ancho, alto);
      for (const m of motas) {
        m.y -= m.vel;
        m.x += Math.sin(m.fase) * 0.08;
        m.fase += m.vfase;
        if (m.y < -4) {
          m.y = alto + 4;
          m.x = Math.random() * ancho;
        }
        const brillo = 0.04 + (Math.sin(m.fase) * 0.5 + 0.5) * 0.1;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = m.verde
          ? `rgba(0,210,122,${brillo})`
          : `rgba(248,250,252,${brillo})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(dibujar);
    };

    dimensionar();
    if (reduce) {
      dibujar();
      cancelAnimationFrame(raf);
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        cancelAnimationFrame(raf);
        if (e.isIntersecting) raf = requestAnimationFrame(dibujar);
      },
      { threshold: 0 }
    );
    io.observe(lienzo);

    const onResize = () => dimensionar();
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}

export default CapaParticulas;
