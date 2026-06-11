import type { CubetaCalibracion } from '../tipos';

/**
 * El "Termómetro de honestidad": curva de calibración de confianza.
 *
 * Cruza la CONFIANZA que declaran las IAs (eje X) contra su ACIERTO real
 * (eje Y). La diagonal punteada es la calibración perfecta: "cuando digo
 * 70%, acierto el 70%". Puntos por ENCIMA de la diagonal = IAs demasiado
 * cautas; por DEBAJO = sobreconfiadas.
 *
 * SVG dibujado a mano (sin librería de charts) para mantener la estética
 * artesanal del proyecto. Colores de la paleta editorial, inline.
 */

const C = {
  verde: '#00D27A',
  mute: '#64748B',
  linea: '#1E2D47',
  cuerpo: '#CBD5E1',
  titulo: '#F8FAFC',
};

// Geometría del lienzo.
const W = 340;
const H = 300;
const PAD_X = 46;
const PAD_TOP = 18;
const PAD_BOT = 46;

const ix = (conf: number) => PAD_X + (conf / 100) * (W - PAD_X - 18);
const iy = (acc: number) => H - PAD_BOT - (acc / 100) * (H - PAD_TOP - PAD_BOT);

function CurvaCalibracion({ cubetas }: { cubetas: CubetaCalibracion[] }) {
  const puntos = cubetas.map((c) => ({
    x: ix(c.confianzaPromedio),
    y: iy(c.tasaAciertoReal),
    c,
  }));
  const polyline = puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md" role="img" aria-label="Curva de calibración de confianza de las IAs">
      {/* Ejes */}
      <line x1={PAD_X} y1={PAD_TOP} x2={PAD_X} y2={H - PAD_BOT} stroke={C.linea} strokeWidth="1" />
      <line x1={PAD_X} y1={H - PAD_BOT} x2={W - 18} y2={H - PAD_BOT} stroke={C.linea} strokeWidth="1" />

      {/* Diagonal de calibración perfecta */}
      <line x1={ix(0)} y1={iy(0)} x2={ix(100)} y2={iy(100)} stroke={C.mute} strokeWidth="1.5" strokeDasharray="5 5" />
      <text x={ix(100) - 4} y={iy(100) + 14} textAnchor="end" fill={C.mute} fontSize="10" fontFamily="ui-monospace, monospace">
        calibración perfecta
      </text>

      {/* Marcas de eje */}
      {[0, 50, 100].map((t) => (
        <text key={`x${t}`} x={ix(t)} y={H - PAD_BOT + 16} textAnchor="middle" fill={C.mute} fontSize="10" fontFamily="ui-monospace, monospace">
          {t}
        </text>
      ))}
      {[0, 50, 100].map((t) => (
        <text key={`y${t}`} x={PAD_X - 8} y={iy(t) + 3} textAnchor="end" fill={C.mute} fontSize="10" fontFamily="ui-monospace, monospace">
          {t}
        </text>
      ))}

      {/* Línea que une los puntos */}
      {puntos.length > 1 && (
        <polyline points={polyline} fill="none" stroke={C.verde} strokeWidth="2" strokeOpacity="0.5" />
      )}

      {/* Puntos: radio crece con el tamaño de muestra */}
      {puntos.map((p) => (
        <g key={p.c.rango}>
          <circle cx={p.x} cy={p.y} r={4 + Math.min(p.c.n, 6)} fill={C.verde} fillOpacity="0.85">
            <title>
              {`Confianza ~${Math.round(p.c.confianzaPromedio)}% → acierto ${Math.round(p.c.tasaAciertoReal)}% (n=${p.c.n})`}
            </title>
          </circle>
        </g>
      ))}

      {/* Títulos de eje */}
      <text x={(PAD_X + W - 18) / 2} y={H - 6} textAnchor="middle" fill={C.cuerpo} fontSize="11" fontFamily="ui-monospace, monospace">
        confianza declarada
      </text>
      <text x={14} y={(PAD_TOP + H - PAD_BOT) / 2} textAnchor="middle" fill={C.cuerpo} fontSize="11" fontFamily="ui-monospace, monospace" transform={`rotate(-90 14 ${(PAD_TOP + H - PAD_BOT) / 2})`}>
        acierto real
      </text>
    </svg>
  );
}

export default CurvaCalibracion;
