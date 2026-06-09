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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-accent">
            Informe: {chart.birthData.name}
          </h2>
          <p className="text-xs text-text-muted">
            {chart.birthData.date} · {chart.birthData.time} · {chart.birthData.city}
            {' · '}☉ {chart.planets[0]?.sign} · ☽ {chart.planets[1]?.sign} · ASC {chart.ascendantSign}
          </p>
        </div>

        {/* Export controls */}
        <div className="flex items-center gap-2">
          {/* Quality toggle */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1 text-xs">
            {(['NORMAL', 'HIGH'] as ExportQuality[]).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  quality === q
                    ? 'bg-primary-700 text-white'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-lighter disabled:text-text-muted text-white rounded-lg transition text-sm font-medium"
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generando…</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Exportar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card border border-border rounded-xl p-1">
        <button
          onClick={() => setActiveTab('wheel')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'wheel'
              ? 'bg-primary-700 text-white'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-lighter'
          }`}
        >
          ☉ Carta
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'chart'
              ? 'bg-primary-700 text-white'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-lighter'
          }`}
        >
          <Table size={16} />
          Datos
        </button>
        <button
          onClick={() => setActiveTab('interpretation')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'interpretation'
              ? 'bg-primary-700 text-white'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-lighter'
          }`}
        >
          <BookOpen size={16} />
          Interpretación
        </button>
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
