import { useMemo } from 'react';
import type { NatalChart, PlanetPosition } from '../astronomy/types';

interface ChartWheelProps {
  chart: NatalChart;
}

// ─── Layout constants ─────────────────────────────────────────────────────────
const SIZE = 620;
const CX   = SIZE / 2;
const CY   = SIZE / 2;

const R = {
  frame:        300,   // outer decorative border
  zodiacOut:    290,   // outer edge of zodiac ring
  zodiacIn:     236,   // inner edge of zodiac ring  (~54 px wide)
  cuspOut:      232,   // house cusp lines reach up to here
  planetOuter:  208,   // primary planet placement radius
  planetInner:  190,   // secondary radius for stellium overflow
  cuspIn:       164,   // inner house circle
  houseNum:     122,   // house number badge centre
  aspectBound:  154,   // aspect lines connect here
  center:        68,   // centre info circle radius (enlarged for 6 lines)
} as const;

// Zodiac glyph radial position: ~28% from inner edge toward outer
// (12 px shifted inward vs. the old midpoint at 263)
const ZODIAC_GLYPH_R = R.zodiacIn + (R.zodiacOut - R.zodiacIn) * 0.30; // ≈ 252

// ─── Zodiac / element data ────────────────────────────────────────────────────
const SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'] as const;

// 0 = Fire · 1 = Earth · 2 = Air · 3 = Water
const SIGN_ELEMENT = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3] as const;

// Hardcoded – no CSS variables so html2canvas / PDF export works correctly
const ELEM_BG   = [
  'rgba(210,90,50,0.15)',   // Fire
  'rgba(80,150,80,0.15)',   // Earth
  'rgba(90,150,210,0.15)',  // Air
  'rgba(60,110,190,0.15)',  // Water
] as const;

const ELEM_FG = [
  '#e07050',  // Fire
  '#5ab060',  // Earth
  '#6aa8e0',  // Air
  '#4a80ce',  // Water
] as const;

const PLANET_SYMBOLS: Record<string, string> = {
  Sol: '☉', Luna: '☽', Mercurio: '☿', Venus: '♀', Marte: '♂',
  Júpiter: '♃', Saturno: '♄', Urano: '⛢', Neptuno: '♆',
  Plutón: '♇', Quirón: '⚷',
};

// ─── Aspect definitions ───────────────────────────────────────────────────────
const ASPECT_DEFS = [
  { name: 'conjunction', angle:   0, orb: 8, color: '#d4af37', dash: '',    sw: 1.4 },
  { name: 'sextile',     angle:  60, orb: 4, color: '#5ab060', dash: '4 3', sw: 0.9 },
  { name: 'square',      angle:  90, orb: 6, color: '#e05040', dash: '',    sw: 1.1 },
  { name: 'trine',       angle: 120, orb: 6, color: '#4a80ce', dash: '',    sw: 1.2 },
  { name: 'opposition',  angle: 180, orb: 8, color: '#e07050', dash: '6 3', sw: 1.3 },
] as const;

interface AspectLine {
  p1:     PlanetPosition;
  p2:     PlanetPosition;
  def:    typeof ASPECT_DEFS[number];
  orbVal: number;
}

// ─── Pure geometric helpers ───────────────────────────────────────────────────

/** Converts polar (radius, display-angle) to SVG Cartesian (x, y).
 *  angleDeg = 0 → top (12-o'clock), increases clockwise. */
function pol(r: number, angleDeg: number): [number, number] {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

/** Maps ecliptic longitude to SVG display angle.
 *  ASC sits at left (270°); increasing longitude → counterclockwise. */
function lonToAngle(lon: number, ascLon: number): number {
  return 270 - (lon - ascLon);
}

/** Builds an annular sector SVG path (a "slice of ring").
 *  a1 → a2 travels counterclockwise when a2 < a1 (our normal case). */
function annularSector(
  rIn: number, rOut: number,
  a1: number,  a2: number,
): string {
  const [ox1, oy1] = pol(rOut, a1);
  const [ox2, oy2] = pol(rOut, a2);
  const [ix2, iy2] = pol(rIn,  a2);
  const [ix1, iy1] = pol(rIn,  a1);

  let diff = a2 - a1;
  if (diff >  180) diff -= 360;
  if (diff < -180) diff += 360;

  const large  = Math.abs(diff) > 180 ? 1 : 0;
  const swpOut = diff < 0 ? 0 : 1;
  const swpIn  = diff < 0 ? 1 : 0;
  const f      = (n: number) => n.toFixed(2);

  return [
    `M ${f(ox1)} ${f(oy1)}`,
    `A ${rOut} ${rOut} 0 ${large} ${swpOut} ${f(ox2)} ${f(oy2)}`,
    `L ${f(ix2)} ${f(iy2)}`,
    `A ${rIn} ${rIn} 0 ${large} ${swpIn} ${f(ix1)} ${f(iy1)}`,
    'Z',
  ].join(' ');
}

/** Formats ecliptic longitude as  "27°24' ♑"  (full, for centre info). */
function fmtLonFull(lon: number): string {
  const norm = ((lon % 360) + 360) % 360;
  const si   = Math.floor(norm / 30) % 12;
  const deg  = Math.floor(norm - si * 30);
  const min  = Math.round((norm - si * 30 - deg) * 60);
  return `${deg}°${String(min).padStart(2, '0')}' ${SIGN_GLYPHS[si]}`;
}

/** Formats a YYYY-MM-DD date string as  "22 Sep 1966". */
function fmtDate(dateStr: string): string {
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const parts  = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

// ─── Stellium resolver ────────────────────────────────────────────────────────

interface DisplayPlanet {
  planet:       PlanetPosition;
  displayAngle: number;
  trueAngle:    number;
  radius:       number;
  displaced:    boolean;
}

const MIN_SEP = 9;

function resolveStelliums(planets: PlanetPosition[], ascLon: number): DisplayPlanet[] {
  const items = [...planets]
    .sort((a, b) => a.longitude - b.longitude)
    .map(p => ({
      planet:       p,
      trueAngle:    lonToAngle(p.longitude, ascLon),
      displayAngle: lonToAngle(p.longitude, ascLon),
      radius:       R.planetOuter,
      displaced:    false,
    }));

  const result: DisplayPlanet[] = [];
  let i = 0;

  while (i < items.length) {
    const group = [items[i]];
    let j = i + 1;
    while (j < items.length) {
      const delta = items[j].planet.longitude - items[j - 1].planet.longitude;
      if (delta < MIN_SEP) { group.push(items[j]); j++; }
      else break;
    }

    if (group.length === 1) {
      result.push(group[0]);
    } else {
      const midIdx = (group.length - 1) / 2;
      group.forEach((item, k) => {
        const offset = (k - midIdx) * MIN_SEP;
        result.push({
          ...item,
          displayAngle: item.trueAngle - offset,
          radius:       k % 2 === 0 ? R.planetOuter : R.planetInner,
          displaced:    Math.abs(offset) > 0.5,
        });
      });
    }

    i = j;
  }

  return result;
}

// ─── Aspect calculator ────────────────────────────────────────────────────────

function computeAspects(planets: PlanetPosition[]): AspectLine[] {
  const result: AspectLine[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff  = Math.abs(planets[i].longitude - planets[j].longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      for (const def of ASPECT_DEFS) {
        const orbVal = Math.abs(angle - def.angle);
        if (orbVal <= def.orb) {
          result.push({ p1: planets[i], p2: planets[j], def, orbVal });
          break;
        }
      }
    }
  }
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChartWheel({ chart }: ChartWheelProps) {
  const ascLon  = chart.houses.ascendant;
  const toAngle = (lon: number) => lonToAngle(lon, ascLon);

  const displayPlanets = useMemo(
    () => resolveStelliums(chart.planets, ascLon),
    [chart.planets, ascLon],
  );

  const aspects = useMemo(
    () => computeAspects(chart.planets),
    [chart.planets],
  );

  const bd   = chart.birthData;
  const ascFull = `ASC ${fmtLonFull(chart.houses.ascendant)}`;
  const mcFull  = `MC  ${fmtLonFull(chart.houses.midheaven)}`;

  return (
    <div
      id="chart-wheel"
      className="bg-surface-card border border-border rounded-xl p-4 flex justify-center"
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="max-w-full"
        xmlns="http://www.w3.org/2000/svg"
      >

        {/* ── 0. Background ────────────────────────────────────── */}
        <circle cx={CX} cy={CY} r={R.frame} fill="#0d1117" />

        {/* ── 1. Zodiac ring – element fills + glyphs + dividers ── */}
        {SIGN_GLYPHS.map((glyph, i) => {
          const elem             = SIGN_ELEMENT[i];
          const startA           = toAngle(i * 30);
          const endA             = toAngle((i + 1) * 30);
          const midA             = toAngle(i * 30 + 15);
          // Glyph shifted ~12 px inward from old midpoint (252 vs old 263)
          const [gx, gy]         = pol(ZODIAC_GLYPH_R, midA);
          const [lx1, ly1]       = pol(R.zodiacIn,  startA);
          const [lx2, ly2]       = pol(R.zodiacOut, startA);

          return (
            <g key={`z${i}`}>
              <path
                d={annularSector(R.zodiacIn, R.zodiacOut, startA, endA)}
                fill={ELEM_BG[elem]}
              />
              <line x1={lx1} y1={ly1} x2={lx2} y2={ly2}
                stroke="#2a3a4a" strokeWidth="0.8" />
              <text
                x={gx} y={gy}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="17" fill={ELEM_FG[elem]} fontFamily="serif"
              >
                {glyph}
              </text>
            </g>
          );
        })}

        {/* 5° degree tick-marks on inner zodiac edge */}
        {Array.from({ length: 72 }, (_, k) => {
          if (k % 6 === 0) return null;
          const angle    = toAngle(k * 5);
          const tickLen  = k % 2 === 0 ? 6 : 3;
          const [x1, y1] = pol(R.zodiacIn, angle);
          const [x2, y2] = pol(R.zodiacIn - tickLen, angle);
          return (
            <line key={`td${k}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#3a4a5a" strokeWidth="0.6" />
          );
        })}

        {/* Zodiac ring strokes */}
        <circle cx={CX} cy={CY} r={R.frame}     fill="none" stroke="#3a4a5a" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={R.zodiacOut} fill="none" stroke="#2a3a4a" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R.zodiacIn}  fill="none" stroke="#2a3a4a" strokeWidth="1.2" />

        {/* ── 2. House cusps & numbers ──────────────────────────── */}
        <circle cx={CX} cy={CY} r={R.cuspIn}      fill="none" stroke="#1e2d3d" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R.aspectBound} fill="none" stroke="#192530" strokeWidth="0.8" />

        {chart.houses.cusps.map((cusp, i) => {
          const isAngular  = i === 0 || i === 3 || i === 6 || i === 9;
          const angle      = toAngle(cusp);

          const innerR = isAngular ? R.aspectBound : R.cuspIn;
          const outerR = isAngular ? R.zodiacOut   : R.cuspOut;
          const [lx1, ly1] = pol(innerR, angle);
          const [lx2, ly2] = pol(outerR, angle);

          const nextCusp = chart.houses.cusps[(i + 1) % 12];
          let midLon     = nextCusp < cusp
            ? (cusp + nextCusp + 360) / 2
            : (cusp + nextCusp)       / 2;
          if (midLon >= 360) midLon -= 360;
          const [hnx, hny] = pol(R.houseNum, toAngle(midLon));

          const si  = Math.floor(((cusp % 360) + 360) % 360 / 30) % 12;
          const deg = Math.floor(((cusp % 360) + 360) % 360 - si * 30);
          const [dlx, dly] = pol(R.zodiacIn - 12, angle);

          return (
            <g key={`h${i}`}>
              {/* Angular cusps: outer glow + bold line; normal cusps: dim line */}
              {isAngular && (
                <line
                  x1={lx1} y1={ly1} x2={lx2} y2={ly2}
                  stroke="#9b87f5" strokeWidth="5" opacity="0.18"
                />
              )}
              <line
                x1={lx1} y1={ly1} x2={lx2} y2={ly2}
                stroke={isAngular ? '#b8a4fc' : '#2e3e52'}
                strokeWidth={isAngular ? 2.2 : 0.9}
              />

              {/* House number badge – larger + brighter for angular */}
              <circle cx={hnx} cy={hny} r={isAngular ? 14 : 11}
                fill={isAngular ? '#1a1535' : '#111827'}
                stroke={isAngular ? '#9b87f5' : '#2a3a4a'}
                strokeWidth={isAngular ? 1.4 : 0.8}
              />
              <text
                x={hnx} y={hny}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={isAngular ? '11' : '9'}
                fill={isAngular ? '#d0c0ff' : '#6a7a8a'}
                fontFamily="sans-serif"
                fontWeight={isAngular ? '700' : '400'}
              >
                {i + 1}
              </text>

              {/* Angular cusp: degree + sign label at the zodiac edge */}
              {isAngular && (
                <text
                  x={dlx} y={dly}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fill="#b8a4fc" fontFamily="sans-serif"
                  fontWeight="600"
                >
                  {deg}°{SIGN_GLYPHS[si]}
                </text>
              )}
            </g>
          );
        })}

        {/* ── 4. Aspect lines (drawn behind planets) ───────────── */}
        {aspects.map(({ p1, p2, def, orbVal }, idx) => {
          const a1 = toAngle(p1.longitude);
          const a2 = toAngle(p2.longitude);
          const [x1, y1] = pol(R.aspectBound, a1);
          const [x2, y2] = pol(R.aspectBound, a2);
          // Opacity fades with orb: exact=0.85, max-orb=0.25
          const opacity  = 0.85 - (orbVal / def.orb) * 0.60;
          return (
            <line key={`asp${idx}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={def.color}
              strokeWidth={def.sw}
              opacity={opacity}
              strokeDasharray={def.dash || undefined}
            />
          );
        })}

        {/* ── 3. Planets with stellium separation ──────────────── */}
        {displayPlanets.map(({ planet, displayAngle, trueAngle, radius, displaced }) => {
          const sym   = PLANET_SYMBOLS[planet.name] ?? planet.name.slice(0, 2);
          const elem  = SIGN_ELEMENT[planet.signIndex % 12];
          const color = ELEM_FG[elem];

          const [px, py]     = pol(radius, displayAngle);
          // Degree label: 9px (+20% vs old 7.5px), drawn 14 px inward
          const [degX, degY] = pol(radius - 14, displayAngle);

          const [tkA_x, tkA_y] = pol(R.cuspIn - 1, trueAngle);
          const [tkB_x, tkB_y] = pol(R.cuspIn + 7, trueAngle);
          const [lnS_x, lnS_y] = pol(R.cuspIn + 2, trueAngle);
          const [lnE_x, lnE_y] = pol(radius - 15,  displayAngle);

          return (
            <g key={planet.name}>
              {displaced ? (
                <line
                  x1={tkA_x} y1={tkA_y} x2={tkB_x} y2={tkB_y}
                  stroke={color} strokeWidth="1.3" opacity="0.65"
                />
              ) : (
                <line
                  x1={lnS_x} y1={lnS_y} x2={lnE_x} y2={lnE_y}
                  stroke="#2a3a4a" strokeWidth="0.7"
                />
              )}

              {/* Planet symbol – 17px (+15% vs original 15px) */}
              <text
                x={px} y={py}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="17" fill={color} fontFamily="serif"
              >
                {sym}
              </text>

              {/* Degree – 9 px (+20%) */}
              <text
                x={degX} y={degY}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fill={color} opacity="0.85"
                fontFamily="sans-serif"
              >
                {planet.degree}°
              </text>

              {/* Retrograde glyph */}
              {planet.retrograde && (
                <text
                  x={px + 10} y={py - 7}
                  fontSize="8" fill="#f9a8b8" fontFamily="sans-serif"
                >
                  ℞
                </text>
              )}
            </g>
          );
        })}

        {/* ── Centre info (drawn last, overlays everything) ─────── */}
        {/* Outer ring + fill */}
        <circle cx={CX} cy={CY} r={R.center + 4}
          fill="#080d14" stroke="#2a3a4a" strokeWidth="1.5" />
        {/* Inner decorative ring */}
        <circle cx={CX} cy={CY} r={R.center + 1}
          fill="none" stroke="#1a2533" strokeWidth="0.6" />

        {/* AstroTherapy Pro watermark – discrete, bottom of centre circle */}
        <text x={CX} y={CY + 56}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="6.5" fill="#2a3a52" fontFamily="sans-serif"
          letterSpacing="1"
        >
          ASTROTHERAPY PRO
        </text>

        {/* Name */}
        <text x={CX} y={CY - 42}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fill="#c8a8f8" fontFamily="sans-serif" fontWeight="600"
        >
          {bd.name}
        </text>

        {/* Thin divider */}
        <line
          x1={CX - 44} y1={CY - 31} x2={CX + 44} y2={CY - 31}
          stroke="#1e2d3d" strokeWidth="0.7"
        />

        {/* ASC */}
        <text x={CX} y={CY - 20}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fill="#9b87f5" fontFamily="sans-serif"
        >
          {ascFull}
        </text>

        {/* MC */}
        <text x={CX} y={CY - 8}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fill="#7a8a9a" fontFamily="sans-serif"
        >
          {mcFull}
        </text>

        {/* Thin divider */}
        <line
          x1={CX - 44} y1={CY + 2} x2={CX + 44} y2={CY + 2}
          stroke="#1e2d3d" strokeWidth="0.7"
        />

        {/* Date */}
        <text x={CX} y={CY + 13}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="8.5" fill="#5a6a7a" fontFamily="sans-serif"
        >
          {fmtDate(bd.date)}
        </text>

        {/* Time */}
        <text x={CX} y={CY + 25}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fill="#4a5a6a" fontFamily="sans-serif"
        >
          {bd.time}
        </text>

        {/* City */}
        <text x={CX} y={CY + 37}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fill="#3a4a5a" fontFamily="sans-serif"
        >
          {bd.city}
        </text>

      </svg>
    </div>
  );
}
