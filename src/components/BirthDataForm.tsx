import { useState, useCallback } from 'react';
import { MapPin, Search, Calculator, Loader2, Clock } from 'lucide-react';
import type { BirthData } from '../astronomy/types';
import { geocodeCity } from '../astronomy/engine';

interface BirthDataFormProps {
  onCalculate: (data: BirthData) => void;
  initialData?: BirthData;
  loading?: boolean;
}

const inputClass = [
  'w-full bg-surface border border-border rounded-lg px-4 py-2.5',
  'text-sm text-text-primary placeholder-text-muted',
  'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50',
  'hover:border-border/80 transition-all duration-150',
].join(' ');

const labelClass = 'block text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5';
const errorClass = 'text-xs text-red-400 mt-1';

export default function BirthDataForm({ onCalculate, initialData, loading }: BirthDataFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() || '');
  const [timezoneOffset, setTimezoneOffset] = useState(initialData?.timezoneOffset?.toString() || '0');
  const [timezoneName, setTimezoneName] = useState('');
  const [useManualCoords, setUseManualCoords] = useState(initialData?.useManualCoords || false);
  const [geocoding, setGeocoding] = useState(false);
  const [geoResult, setGeoResult] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGeocode = useCallback(async () => {
    if (!city.trim()) return;
    setGeocoding(true);
    setGeoResult('');
    setTimezoneName('');

    const result = await geocodeCity(city);
    if (result) {
      setLatitude(result.lat.toFixed(4));
      setLongitude(result.lon.toFixed(4));
      setTimezoneOffset(result.timezoneOffset.toString());
      setTimezoneName(result.timezoneName);
      setGeoResult(`✓ ${result.displayName}`);
    } else {
      setGeoResult('Sin resultados. Ingrese coordenadas manualmente.');
      setUseManualCoords(true);
    }
    setGeocoding(false);
  }, [city]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nombre requerido';
    if (!date) newErrors.date = 'Fecha requerida';
    if (!time) newErrors.time = 'Hora requerida';
    if (!latitude || isNaN(Number(latitude))) newErrors.latitude = 'Latitud válida requerida';
    if (!longitude || isNaN(Number(longitude))) newErrors.longitude = 'Longitud válida requerida';
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (lat < -90 || lat > 90) newErrors.latitude = 'Latitud entre -90 y 90';
    if (lon < -180 || lon > 180) newErrors.longitude = 'Longitud entre -180 y 180';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onCalculate({
      name: name.trim(),
      date,
      time,
      city: city.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezoneOffset: Number(timezoneOffset),
      timezoneId: timezoneName || undefined,
      useManualCoords
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Datos básicos */}
      <section className="bg-surface-card border border-border rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-5 flex items-center gap-2">
          <span className="text-accent text-base">☉</span> Datos del Consultante
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre del consultante"
              className={`${inputClass} ${errors.name ? 'border-red-500/50' : ''}`}
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass}>Fecha de nacimiento</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={`${inputClass} ${errors.date ? 'border-red-500/50' : ''}`}
            />
            {errors.date && <p className={errorClass}>{errors.date}</p>}
          </div>

          <div>
            <label className={labelClass}>Hora de nacimiento (local)</label>
            <div className="relative">
              <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className={`${inputClass} pl-9 ${errors.time ? 'border-red-500/50' : ''}`}
              />
            </div>
            {errors.time && <p className={errorClass}>{errors.time}</p>}
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section className="bg-surface-card border border-border rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-5 flex items-center gap-2">
          <MapPin size={13} className="text-accent" /> Lugar de Nacimiento
        </h2>

        <div className="mb-5">
          <label className={labelClass}>Ciudad</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleGeocode(); } }}
              placeholder="ej. Ciudad de México, México"
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding || !city.trim()}
              className="px-4 py-2.5 bg-primary-700 hover:bg-primary-600 disabled:opacity-40 text-white rounded-lg transition text-sm flex items-center gap-2 whitespace-nowrap"
            >
              {geocoding ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              <span>Buscar</span>
            </button>
          </div>
          <p className="text-[11px] text-text-muted mt-1.5">
            La búsqueda autocompleta coordenadas y zona horaria
          </p>
          {geoResult && (
            <div className={`mt-2.5 px-3 py-2 rounded-lg text-xs ${
              geoResult.startsWith('✓')
                ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-700/30'
                : 'bg-amber-900/20 text-amber-400 border border-amber-700/30'
            }`}>
              {geoResult}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/40">
          <div>
            <label className={labelClass}>
              Latitud
              {latitude && !useManualCoords && <span className="ml-1 text-emerald-400 normal-case">✓</span>}
            </label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={e => { setLatitude(e.target.value); setUseManualCoords(true); }}
              placeholder="19.4326"
              className={`${inputClass} font-mono text-xs ${errors.latitude ? 'border-red-500/50' : ''}`}
            />
            {errors.latitude && <p className={errorClass}>{errors.latitude}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Longitud
              {longitude && !useManualCoords && <span className="ml-1 text-emerald-400 normal-case">✓</span>}
            </label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={e => { setLongitude(e.target.value); setUseManualCoords(true); }}
              placeholder="-99.1332"
              className={`${inputClass} font-mono text-xs ${errors.longitude ? 'border-red-500/50' : ''}`}
            />
            {errors.longitude && <p className={errorClass}>{errors.longitude}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Zona horaria
              {timezoneName && <span className="ml-1 text-emerald-400 normal-case">✓</span>}
            </label>
            <select
              value={timezoneOffset}
              onChange={e => { setTimezoneOffset(e.target.value); setTimezoneName(''); }}
              className={inputClass}
            >
              {Array.from({ length: 25 }, (_, i) => i - 12).map(offset => (
                <option key={offset} value={offset}>
                  UTC {offset >= 0 ? '+' : ''}{offset}
                </option>
              ))}
            </select>
            {timezoneName && (
              <p className="text-[10px] text-emerald-400 mt-1 truncate" title={timezoneName}>
                {timezoneName}
              </p>
            )}
          </div>
        </div>
        <p className="text-[11px] text-text-muted mt-3">
          Norte / Este = positivo · Sur / Oeste = negativo
        </p>
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-accent hover:bg-primary-400 disabled:opacity-50 text-surface font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-accent/20 text-sm"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Calculator size={18} />
        )}
        <span>{loading ? 'Calculando carta natal…' : 'Calcular Carta Natal'}</span>
      </button>
    </form>
  );
}
