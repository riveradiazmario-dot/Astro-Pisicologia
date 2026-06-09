import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, FileText, Users } from 'lucide-react';
import type { Consultant } from '../astronomy/types';
import { getAllConsultants, deleteConsultant, searchConsultants } from '../storage/db';

interface ConsultantsListProps {
  onSelect: (consultant: Consultant) => void;
  refreshTrigger: number;
}

export default function ConsultantsList({ onSelect, refreshTrigger }: ConsultantsListProps) {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadConsultants = useCallback(async () => {
    setLoading(true);
    const data = searchQuery
      ? await searchConsultants(searchQuery)
      : await getAllConsultants();
    setConsultants(data);
    setLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    loadConsultants();
  }, [loadConsultants, refreshTrigger]);

  const handleDelete = async (id: number | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    if (confirm('¿Eliminar este consultante? Esta acción no se puede deshacer.')) {
      await deleteConsultant(id);
      loadConsultants();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + search */}
      <div className="bg-surface-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Users size={16} className="text-accent" />
            Consultantes
          </h2>
          {!loading && (
            <span className="text-[11px] text-text-muted">
              {consultants.length} registros
            </span>
          )}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-text-muted text-sm">Cargando…</div>
      ) : consultants.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="text-border mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            {searchQuery ? 'Sin resultados para esa búsqueda' : 'No hay consultantes registrados'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {consultants.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="w-full bg-surface-card border border-border hover:border-accent/40 rounded-xl p-4 transition-all duration-150 flex items-center justify-between group hover:bg-surface-lighter"
            >
              <div className="text-left min-w-0">
                <p className="font-medium text-text-primary group-hover:text-accent transition-colors text-sm truncate">
                  {c.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                  <span className="text-[11px] text-text-muted">{c.birthData.date}</span>
                  <span className="text-[11px] text-text-muted">{c.birthData.time}</span>
                  {c.birthData.city && (
                    <span className="text-[11px] text-text-muted truncate">{c.birthData.city}</span>
                  )}
                </div>
                {c.chart && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-accent/70">☉ {c.chart.planets[0]?.sign}</span>
                    <span className="text-[11px] text-accent/70">☽ {c.chart.planets[1]?.sign}</span>
                    <span className="text-[11px] text-accent/70">ASC {c.chart.ascendantSign}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                {c.chart && <FileText size={14} className="text-text-muted opacity-60" />}
                <button
                  onClick={(e) => handleDelete(c.id, e)}
                  className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-900/20"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
