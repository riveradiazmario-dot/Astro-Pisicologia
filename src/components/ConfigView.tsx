import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import type { TherapistConfig } from '../astronomy/types';
import { getTherapistConfig, saveTherapistConfig } from '../storage/db';

const inputClass = [
  'w-full bg-surface border border-border rounded-lg px-4 py-2.5',
  'text-sm text-text-primary placeholder-text-muted',
  'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50',
  'hover:border-border/80 transition-all duration-150',
].join(' ');

const labelClass = 'block text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5';

export default function ConfigView() {
  const [config, setConfig] = useState<TherapistConfig>({
    name: '',
    registration: '',
    signature: '',
    disclaimer: 'Esta herramienta ofrece interpretaciones simbólicas basadas en astrología psicológica y no sustituye procesos terapéuticos, médicos ni diagnósticos clínicos.',
    orbDefault: 5
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getTherapistConfig().then(setConfig);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveTherapistConfig(config);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Configuración</h1>
        <p className="text-sm text-text-muted mt-1">Datos del profesional para informes y exportaciones PDF.</p>
      </div>

      <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
          Datos del Profesional
        </h2>

        <div>
          <label className={labelClass}>Nombre completo</label>
          <input
            type="text"
            value={config.name}
            onChange={e => setConfig(c => ({ ...c, name: e.target.value }))}
            placeholder="Lic. María López"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Número de registro / matrícula</label>
          <input
            type="text"
            value={config.registration}
            onChange={e => setConfig(c => ({ ...c, registration: e.target.value }))}
            placeholder="REG-12345"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Firma / Iniciales (para PDF)</label>
          <input
            type="text"
            value={config.signature}
            onChange={e => setConfig(c => ({ ...c, signature: e.target.value }))}
            placeholder="M.L."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Descargo ético (pie de página en PDF)</label>
          <textarea
            rows={3}
            value={config.disclaimer}
            onChange={e => setConfig(c => ({ ...c, disclaimer: e.target.value }))}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>
            Orbe por defecto para aspectos
            <span className="ml-1 normal-case text-text-muted">(grados)</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={15}
              value={config.orbDefault}
              onChange={e => setConfig(c => ({ ...c, orbDefault: Number(e.target.value) }))}
              className="flex-1 accent-accent"
            />
            <span className="text-sm font-mono text-accent w-6 text-center">{config.orbDefault}°</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
              saved
                ? 'bg-emerald-800/40 text-emerald-400 border border-emerald-700/30'
                : 'bg-accent hover:bg-primary-400 text-surface disabled:opacity-50'
            }`}
          >
            {saving ? (
              <><Loader2 size={15} className="animate-spin" /><span>Guardando…</span></>
            ) : saved ? (
              <><CheckCircle size={15} /><span>Guardado</span></>
            ) : (
              <><Save size={15} /><span>Guardar configuración</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
