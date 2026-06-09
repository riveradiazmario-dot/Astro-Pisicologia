import type { NatalChart } from '../astronomy/types';
import { ASPECT_CONFIG } from '../astronomy/types';

interface ChartTableProps {
  chart: NatalChart;
}

const SIGNS = ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];

function fmtCusp(lon: number): string {
  const idx = Math.floor(lon / 30);
  const deg = Math.floor(lon % 30);
  const min = Math.round((lon % 30 - deg) * 60);
  return `${deg}° ${SIGNS[idx]} ${min}'`;
}

const sectionHead = 'px-4 py-3 border-b border-border/60 flex items-center gap-2';
const th = 'px-4 py-2.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider';
const td = 'px-4 py-2.5 text-sm text-text-primary';
const rowClass = 'border-b border-border/30 hover:bg-surface/40 transition-colors';

export default function ChartTable({ chart }: ChartTableProps) {
  return (
    <div className="space-y-5">

      {/* Planetary positions */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        <div className={sectionHead}>
          <span className="text-accent text-base">☉</span>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
            Posiciones Planetarias
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/50">
              <tr>
                <th className={th}>Planeta</th>
                <th className={th}>Signo</th>
                <th className={th}>Posición</th>
                <th className={th}>Casa</th>
                <th className={th}>R</th>
              </tr>
            </thead>
            <tbody>
              {chart.planets.map((p) => (
                <tr key={p.name} className={rowClass}>
                  <td className={`${td} font-medium`}>{p.name}</td>
                  <td className={td}>{p.sign}</td>
                  <td className={`${td} font-mono text-xs text-text-secondary`}>{p.degree}° {p.minute}'</td>
                  <td className={`${td} text-text-secondary`}>{p.house}</td>
                  <td className={`${td} text-amber-400 text-xs font-semibold`}>{p.retrograde ? 'R' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* House cusps */}
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        <div className={sectionHead}>
          <span className="text-accent">⌂</span>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
            Cúspides · Placidus
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/50">
              <tr>
                <th className={th}>Casa</th>
                <th className={th}>Posición</th>
                <th className={th}>Casa</th>
                <th className={th}>Posición</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, i) => (
                <tr key={i} className={rowClass}>
                  <td className={`${td} font-medium text-text-secondary`}>{i + 1}</td>
                  <td className={`${td} font-mono text-xs`}>{fmtCusp(chart.houses.cusps[i])}</td>
                  <td className={`${td} font-medium text-text-secondary`}>{i + 7}</td>
                  <td className={`${td} font-mono text-xs`}>{fmtCusp(chart.houses.cusps[i + 6])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aspects */}
      {chart.aspects.length > 0 && (
        <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
          <div className={sectionHead}>
            <span className="text-accent">⚡</span>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
              Aspectos
            </h3>
            <span className="ml-auto text-[11px] text-text-muted">{chart.aspects.length} aspectos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface/50">
                <tr>
                  <th className={th}>Planeta 1</th>
                  <th className={th}>Aspecto</th>
                  <th className={th}>Planeta 2</th>
                  <th className={th}>Orbe</th>
                </tr>
              </thead>
              <tbody>
                {chart.aspects.map((a, i) => (
                  <tr key={i} className={rowClass}>
                    <td className={`${td} font-medium`}>{a.planet1}</td>
                    <td className={td}>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-accent">{a.symbol}</span>
                        <span className="text-xs text-text-muted">{ASPECT_CONFIG[a.type]?.name ?? a.type}</span>
                      </span>
                    </td>
                    <td className={`${td} font-medium`}>{a.planet2}</td>
                    <td className={`${td} font-mono text-xs text-text-muted`}>{a.orb}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
