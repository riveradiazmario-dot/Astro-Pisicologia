/**
 * Motor Astronómico Principal
 * Usa astronomy-engine (MIT) para cálculos planetarios.
 * Implementa fórmulas estándar para Ascendente y casas Placidus.
 */

import * as Astronomy from 'astronomy-engine';
import {
  BirthData,
  PlanetPosition,
  HouseData,
  AspectData,
  NatalChart,
  ZODIAC_SIGNS,
  ASPECT_CONFIG,
  AspectType
} from './types';

// Mapeo de planetas a los cuerpos de astronomy-engine
const PLANET_BODIES: { name: string; body: Astronomy.Body }[] = [
  { name: 'Sol', body: Astronomy.Body.Sun },
  { name: 'Luna', body: Astronomy.Body.Moon },
  { name: 'Mercurio', body: Astronomy.Body.Mercury },
  { name: 'Venus', body: Astronomy.Body.Venus },
  { name: 'Marte', body: Astronomy.Body.Mars },
  { name: 'Júpiter', body: Astronomy.Body.Jupiter },
  { name: 'Saturno', body: Astronomy.Body.Saturn },
  { name: 'Urano', body: Astronomy.Body.Uranus },
  { name: 'Neptuno', body: Astronomy.Body.Neptune },
  { name: 'Plutón', body: Astronomy.Body.Pluto },
];

/**
 * Normaliza un ángulo al rango [0, 360)
 */
function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/**
 * Convierte grados a radianes
 */
function toRad(deg: number): number {
  return deg * Math.PI / 180;
}

/**
 * Convierte radianes a grados
 */
function toDeg(rad: number): number {
  return rad * 180 / Math.PI;
}

/**
 * Calcula la longitud eclíptica geocéntrica de un cuerpo celeste
 */
function getPlanetLongitude(body: Astronomy.Body, date: Date): number {
  const time = Astronomy.MakeTime(date);

  if (body === Astronomy.Body.Moon) {
    // EclipticGeoMoon retorna Spherical con propiedades lat, lon, dist
    const moonPos = Astronomy.EclipticGeoMoon(time);
    return normalizeDegrees(moonPos.lon);
  }

  if (body === Astronomy.Body.Sun) {
    // SunPosition retorna EclipticCoordinates con propiedades elon, elat
    const sunPos = Astronomy.SunPosition(time);
    return normalizeDegrees(sunPos.elon);
  }

  // Para otros planetas: obtener vector geocéntrico y convertir a eclíptico
  const geo = Astronomy.GeoVector(body, time, true);
  const ecl = Astronomy.Ecliptic(geo);
  return normalizeDegrees(ecl.elon);
}

/**
 * Determina si un planeta está retrógrado comparando posiciones
 */
function isRetrograde(body: Astronomy.Body, date: Date): boolean {
  if (body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) return false;

  const time1 = new Date(date.getTime() - 24 * 3600 * 1000);
  const time2 = new Date(date.getTime() + 24 * 3600 * 1000);

  const lon1 = getPlanetLongitude(body, time1);
  const lon2 = getPlanetLongitude(body, time2);

  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return diff < 0;
}

/**
 * Calcula la posición de Quirón usando aproximación orbital
 * Quirón tiene un período orbital de ~50.7 años con alta excentricidad
 */
function getChironLongitude(date: Date): number {
  // Datos orbitales de Quirón
  // Época: J2000.0 (1 enero 2000, 12:00 TT)
  const epoch = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const daysSinceEpoch = (date.getTime() - epoch.getTime()) / (24 * 3600 * 1000);

  // Período orbital: 50.7 años
  const period = 50.7 * 365.25; // días
  const meanMotion = 360 / period;

  // Posición en J2000.0: ~246.4° (Sagitario ~6°)
  // Longitud del perihelio: ~209°
  const longitudeAtEpoch = 246.4;
  const perihelionLongitude = 209.0;

  // Excentricidad alta
  const e = 0.3786;
  const meanAnomalyAtEpoch = longitudeAtEpoch - perihelionLongitude;
  const meanAnomaly = normalizeDegrees(meanAnomalyAtEpoch + daysSinceEpoch * meanMotion);
  const M = toRad(meanAnomaly);

  // Ecuación de Kepler (iterativa)
  let E = M;
  for (let i = 0; i < 15; i++) {
    E = M + e * Math.sin(E);
  }

  // Anomalía verdadera
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );

  const longitude = normalizeDegrees(perihelionLongitude + toDeg(trueAnomaly));
  return longitude;
}]}]}')}