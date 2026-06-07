import { useState, useCallback } from 'react';
import { MapPin, Search, Calculator, Loader2, Clock } from 'lucide-react';
import type { BirthData } from '../astronomy/types';
import { geocodeCity } from '../astronomy/engine';

interface BirthDataFormProps {
  onCalculate: (data: BirthData) => void;
  initialData?: BirthData;
  loading?: boolean;
}

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
      setGeoResult('No se encontraron resultados. Ingrese coordenadas manualmente.');
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
      useManualCoords
    });
  };

  const inputClass = "w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-medium text-text-secondary mb-1.5";
  const errorClass = "text-xs text-red-400 mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos básicos */}
      <div className="bg-surface-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-accent mb-4 flex items-center gap-2">
          <span className="text-xl">☉</span> Datos del Consultante
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label className={labelClass}>Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre del consultante"
              className={inputClass}
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          {/* Fecha */}
          <div>
            <label className={labelClass}>Fecha de nacimiento</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={inputClass}
            />
            {errors.date && <p className={errorClass}>{errors.date}</p>}
          </div>

          {/* Hora */}
          <div>
            <label className={labelClass}>Hora de nacimiento (hora local)</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className={inputClass}
            />
            {errors.time && <p className={errorClass}>{errors.time}</p>}
          </div>
        </div>
      </div>

      {/* Ubicación - Búsqueda de ciudad */}
      <div className="bg-surface-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <MapPin size={16} />
          Lugar de Nacimiento
        </h3>

        {/* Ciudad */}
        <div className="mb-4">
          <label className={labelClass}>Ciudad</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGeocode();
                }
              }}
              placeholder="ej. Ciudad de México, México"
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding || !city.trim()}
              className="px-4 py-2 bg-primary-700 hover:bg-primary-600 disabled:bg-surface-lighter disabled:text-text-muted text-white rounded-lg transition flex items-center gap-2 whitespace-nowrap min-w-[120px] justify-center"
            >
              {geocoding ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-text-muted mt-1">
            🔍 Al buscar se autocompletarán las coordenadas y la zona horaria
          </p>
          {geoResult && (
            <div className={`mt-3 px-3 py-2 rounded-lg text-xs ${
              geoResult.startsWith('✓') 
                ? 'bg-green-900/20 text-green-400 border border-green-700/30' 
                : 'bg-amber-900/20 text-amber-400 border border-amber-700/30'
            }`}>
              {geoResult}
            </div>
          )}
        </div>

        {/* Grid con Coordenadas y Timezone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
          {/* Latitud */}
          <div>
            <label className={labelClass}>
              Latitud
              {latitude && !useManualCoords && (
                <span className="text-[10px] ml-2 text-green-400">✓ Auto</span>
              )}
            </label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={e => {
                setLatitude(e.target.value);
                setUseManualCoords(true);
              }}
              placeholder="ej. 19.4326"
              className={inputClass}
            />
            {errors.latitude && <p className={errorClass}>{errors.latitude}</p>}
          </div>

          {/* Longitud */}
          <div>
            <label className={labelClass}>
              Longitud
              {longitude && !useManualCoords && (
                <span className="text-[10px] ml-2 text-green-400">✓ Auto</span>
              )}
            </label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={e => {
                setLongitude(e.target.value);
                setUseManualCoords(true);
              }}
              placeholder="ej. -99.1332"
              className={inputClass}
            />
            {errors.longitude && <p className={errorClass}>{errors.longitude}</p>}
          </div>

          {/* Zona Horaria */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-2">
                <Clock size={12} />
                Zona horaria
                {timezoneName && (
                  <span className="text-[10px] text-green-400">✓ Auto</span>
                )}
              </span>
            </label>
            <select
              value={timezoneOffset}
              onChange={e => {
                setTimezoneOffset(e.target.value);
                setTimezoneName('');
              }}
              className={inputClass}
            >
              {Array.from({ length: 25 }, (_, i) => i - 12).map(offset => (
                <option key={offset} value={offset}>
                  UTC {offset >= 0 ? '+' : ''}{offset}
                </option>
              ))}
            </select>
            {timezoneName && (
              <p className="text-[10px] text-green-400 mt-1 truncate" title={timezoneName}>
                {timezoneName}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-text-muted mt-3">
          Positivo = Norte/Este · Negativo = Sur/Oeste
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-lighter text-white font-semibold rounded-xl transition shadow-lg shadow-primary-900/30"
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Calculator size={20} />
        )}
        <span>{loading ? 'Calculando carta natal...' : 'Calcular Carta Natal'}</span>
      </button>
    </form>
  );
}
