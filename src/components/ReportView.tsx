import { useState } from 'react';
import { Download, Table, BookOpen, Loader2 } from 'lucide-react';
import type { NatalChart, TherapistConfig } from '../astronomy/types';
import type { FullInterpretation } from '../interpretation-engine/interpreter';
import ChartTable from './ChartTable';
import ChartWheel from './ChartWheel';
import InterpretationView from './InterpretationView';
import { generatePDF } from '../pdf/export';
import type { ExportQuality } from '../pdf/export';

interface ReportViewProps {
  chart: NatalChart;
  interpretation: FullInterpretation;
  therapistConfig: TherapistConfig;
}

type Tab = 'wheel' | 'chart' | 'interpretation';

export default function ReportView({ chart, interpretation, therapistConfig }: ReportViewProps) {
  const [activeTab,  setActiveTab]  = useState<Tab>('wheel');
  const [quality,    setQuality]    = useState<ExportQuality>('HIGH');
  const [exporting,  setExporting]  = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await generatePDF(chart, interpretation, therapistConfig, quality);
    } finally {
      setExporting(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'wheel',          label: 'Carta',          icon: <span className="text-base leading-none">☉</span> },
    { id: 'chart',          label: 'Datos',          icon: <Table size={14} /> },
    { id: 'interpretation', label: 'Interpretación', icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            {chart.birthData.name}
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {chart.birthData.date} · {chart.birthData.time}
            {chart.birthData.city && ` · ${chart.birthData.city}`}
            {'  '}
            <span className="text-accent/80">☉ {chart.planets[0]?.sign}</span>
            {' · '}
            <span className="text-accent/80">☽ {chart.planets[1]?.sign}</span>
            {' · '}
            <span className="text-accent/80">ASC {chart.ascendantSign}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Quality toggle */}
          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 text-xs">
            {(['NORMAL', 'HIGH'] as ExportQuality[]).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  quality === q
                    ? 'bg-surface-lighter text-text-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-primary-400 disabled:opacity-50 text-surface rounded-lg transition text-xs font-semibold"
          >
            {exporting ? (
              <><Loader2 size={13} className="animate-spin" /><span>Generando…</span></>
            ) : (
              <><Download size={13} /><span>PDF</span></>
            )}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface-card border border-border rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-surface-lighter text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'wheel' ? (
        <div className="space-y-6">
          <ChartWheel chart={chart} />
          <ChartTable chart={chart} />
        </div>
      ) : activeTab === 'chart' ? (
        <ChartTable chart={chart} />
      ) : (
        <InterpretationView interpretation={interpretation} />
      )}
    </div>
  );
}
