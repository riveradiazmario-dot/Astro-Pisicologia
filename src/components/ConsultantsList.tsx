import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, FileText, User } from 'lucide-react';
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
      <div className="bg-surface-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-accent flex items-center gap-2 mb-4">
          <User size={20} />
          Consultantes
        </h2>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">
          Cargando...
        </div>
      ) : consultants.length === 0 ? (
        <div className="text-center py-12">
          <User size={48} className="text-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-text-muted text-sm">
            {searchQuery ? 'No se encontraron resultados' : 'No hay consultantes registrados'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {consultants.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="w-full bg-surface-card border border-border rounded-xl p-4 hover:border-primary-700 transition flex items-center justify-between group"
            >
              <div className="text-left">
                <p className="font-medium text-text-primary group-hover:text-accent transition">
                  {c.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">
                    📅 {c.birthData.date}
                  </span>
                  <span className="text-xs text-text-muted">
                    🕐 {c.birthData.time}
                  </span>
                  <span className="text-xs text-text-muted">
                    📍 {c.birthData.city || 'Sin ciudad'}
                  </span>
                </div>
                {c.chart && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary-400">
                      ☉ {c.chart.planets[0]?.sign}
                    </span>
                    <span className="text-xs text-primary-400">
                      ☽ {c.chart.planets[1]?.sign}
                    </span>
                    <span className="text-xs text-primary-400">
                      ASC {c.chart.ascendantSign}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {c.chart && <FileText size={16} className="text-text-muted" />}
                <button
                  onClick={(e) => handleDelete(c.id, e)}
                  className="p-2 text-text-muted hover:text-red-400 transition rounded-lg hover:bg-red-900/20"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
