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

export default function ChartTable({ chart }: ChartTableProps) {
  const th = 'px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wide';
  const td = 'px-3 py-2 text-sm text-text-primary';

  return (
    <div className="space-y-6">
      <div className="bg-surface-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-accent">☉ Posiciones Planetarias</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className={th}>Planeta</th>
                <th className={th}>Signo</th>
                <th className={th}>Pos.</th>
                <th className={th}>Casa</th>
                <th className={th}>R</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {chart.planets.map((p) => (
                <tr key={p.name} className="hover:bg-surface/50 transition">
                  <td className={`${td} font-medium`}>{p.name}</td>
                  <td className={td}>{p.sign}</td>
                  <td className={`${td} font-mono text-xs`}>{p.degree}° {p.minute}'</td>
                  <td className={td}>{p.house}</td>
                  <td className={`${td} text-amber-400`}>{p.retrograde ? 'R' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-accent">⌂ Cúspides (Placidus)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className={th}>Casa</th>
                <th className={th}>Posición</th>
                <th className={th}>Casa</th>
                <th className={th}>Posición</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {Array.from({ length: 6 }, (_, i) => (
                <tr key={i} className="hover:bg-surface/50 transition">
                  <td className={`${td} font-medium`}>{i + 1}</td>
                  <td className={`${td} font-mono text-xs`}>{fmtCusp(chart.houses.cusps[i])}</td>
                  <td className={`${td} font-medium`}>{i + 7}</td>
                  <td className={`${td} font-mono text-xs`}>{fmtCusp(chart.houses.cusps[i + 6])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {chart.aspects.length > 0 && (
        <div className="bg-surface-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-accent">⚡ Aspectos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className={th}>Planeta 1</th>
                  <th className={th}>Aspecto</th>
                  <th className={th}>Planeta 2</th>
                  <th className={th}>Orbe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {chart.aspects.map((a, i) => (
                  <tr key={i} className="hover:bg-surface/50 transition">
                    <td className={`${td} font-medium`}>{a.planet1}</td>
                    <td className={td}>
                      <span className="mr-1">{a.symbol}</span>
                      <span className="text-xs text-text-muted">{ASPECT_CONFIG[a.type]?.name ?? a.type}</span>
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
