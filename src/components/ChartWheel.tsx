import type { NatalChart } from '../astronomy/types';

interface ChartWheelProps {
  chart: NatalChart;
}

const SIGNS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const PLANET_SYMBOLS: Record<string, string> = {
  'Sol':'☉','Luna':'☽','Mercurio':'☿','Venus':'♀','Marte':'♂','Júpiter':'♃',
  'Saturno':'♄','Urano':'⛢','Neptuno':'♆','Plutón':'♇','Quirón':'⚷'
};

function polarToXY(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export default function ChartWheel({ chart }: ChartWheelProps) {
  const size = 500;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 220;
  const rSignRing = 200;
  const rSignInner = 180;
  const rHouse = 160;
  const rPlanet = 130;

  // ASC determina la rotación del ascendente al Este (180° en el SVG)
  const ascLon = chart.houses.ascendant;

  function lonToAngle(lon: number): number {
    // ASC en la izquierda (270°). Longitud creciente → sentido antihorario
    return 270 - (lon - ascLon);
  }

  return (
    <div className="bg-surface-card border border-border rounded-xl p-4 flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
        {/* Círculo exterior */}
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="var(--color-border,#334)" strokeWidth="1.5"/>
        {/* Anillo de signos */}
        <circle cx={cx} cy={cy} r={rSignInner} fill="none" stroke="var(--color-border,#334)" strokeWidth="1"/>
        {/* Círculo de casas */}
        <circle cx={cx} cy={cy} r={rHouse} fill="none" stroke="var(--color-border,#334)" strokeWidth="1"/>

        {/* Sectores de signos (30° cada uno) */}
        {SIGNS.map((sym, i) => {
          const startAngle = lonToAngle(i * 30);
          const midAngle = lonToAngle(i * 30 + 15);
          const [x, y] = polarToXY(cx, cy, (rSignRing + rSignInner) / 2, midAngle);
          return (
            <g key={i}>
              {/* línea divisoria de signo */}
              {(() => {
                const [x1, y1] = polarToXY(cx, cy, rSignInner, startAngle);
                const [x2, y2] = polarToXY(cx, cy, rOuter, startAngle);
                return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-border,#334)" strokeWidth="0.8"/>;
              })()}
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                fontSize="12" fill="var(--color-text-muted,#888)">
                {sym}
              </text>
            </g>
          );
        })}

        {/* Líneas de cúspides de casas */}
        {chart.houses.cusps.map((cusp, i) => {
          const angle = lonToAngle(cusp);
          const [x1, y1] = polarToXY(cx, cy, rHouse, angle);
          const [x2, y2] = polarToXY(cx, cy, rSignInner, angle);
          const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
          const [xL, yL] = polarToXY(cx, cy, rHouse - 12, lonToAngle(cusp + 15));
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isAngle ? 'var(--color-accent,#a78bfa)' : 'var(--color-border,#334)'}
                strokeWidth={isAngle ? '1.5' : '0.8'}/>
              <text x={xL} y={yL} textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fill="var(--color-text-muted,#888)">{i + 1}</text>
            </g>
          );
        })}

        {/* Planetas */}
        {chart.planets.map((planet) => {
          const angle = lonToAngle(planet.longitude);
          const [px, py] = polarToXY(cx, cy, rPlanet, angle);
          const sym = PLANET_SYMBOLS[planet.name] ?? planet.name.slice(0, 2);
          return (
            <g key={planet.name}>
              <line
                x1={polarToXY(cx, cy, rHouse + 2, angle)[0]}
                y1={polarToXY(cx, cy, rHouse + 2, angle)[1]}
                x2={polarToXY(cx, cy, rPlanet + 10, angle)[0]}
                y2={polarToXY(cx, cy, rPlanet + 10, angle)[1]}
                stroke="var(--color-border,#334)" strokeWidth="0.5"/>
              <text x={px} y={py} textAnchor="middle" dominantBaseline="middle"
                fontSize="13" fill="var(--color-accent,#a78bfa)"
               >
                {sym}
              </text>
              {planet.retrograde && (
                <text x={px + 8} y={py - 6} fontSize="7" fill="var(--color-text-muted,#888)">R</text>
              )}
            </g>
          );
        })}

        {/* Centro: ASC / MC labels */}
        <text x={cx} y={cy - 12} textAnchor="middle" fontSize="10" fill="var(--color-accent,#a78bfa)">
          ASC {chart.ascendantSign}
        </text>
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="var(--color-text-muted,#888)">
          MC {chart.midheavenSign}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9" fill="var(--color-text-muted,#888)">
          {chart.birthData.name}
        </text>
      </svg>
    </div>
  );
}
