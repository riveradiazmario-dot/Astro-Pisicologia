import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import type { TherapistConfig } from '../astronomy/types';
import { getTherapistConfig, saveTherapistConfig } from '../storage/db';

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
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = 'w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Configuración</h1>
        <p className="text-sm text-text-muted mt-1">Datos del profesional para informes PDF.</p>
      </div>

      <div className="bg-surface-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-accent mb-4">Datos del Profesional</h2>

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
          <label className={labelClass}>Orbe por defecto para aspectos (grados)</label>
          <input
            type="number"
            min={1}
            max={15}
            value={config.orbDefault}
            onChange={e => setConfig(c => ({ ...c, orbDefault: Number(e.target.value) }))}
            className={inputClass}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-lighter text-white font-semibold rounded-lg transition"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? '¡Guardado!' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  );
}
