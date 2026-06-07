/**
 * Motor Astronómico Principal
 * Usa astronomy-engine (MIT) para cálculos planetarios.
 * Implementa fórmulas estándar para Ascendente y casas Placidus.
 */

import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';
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
}

/**
 * Calcula la Hora Sidérea Local (LST) en grados
 */
function calculateLST(date: Date, longitudeEast: number): number {
  const time = Astronomy.MakeTime(date);
  // SiderealTime retorna GAST en horas siderales [0, 24)
  const gstHours = Astronomy.SiderealTime(time);
  // Convertir a grados (15° por hora) y ajustar por longitud geográfica
  const lstDeg = gstHours * 15 + longitudeEast;
  return normalizeDegrees(lstDeg);
}

/**
 * Calcula la oblicuidad de la eclíptica para una fecha dada
 */
function getObliquity(date: Date): number {
  const epoch = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const T = (date.getTime() - epoch.getTime()) / (365.25 * 24 * 3600 * 1000 * 100);
  // Fórmula IAU para oblicuidad media
  const eps = 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
  return eps;
}

/**
 * Conversión robusta BirthData -> Date (UTC)
 * Usa timezoneId (IANA) si está disponible; si no, usa timezoneOffset (legacy)
 */
export function convertBirthToUTC(birthData: BirthData): Date {
  const [year, month, day] = birthData.date.split('-').map(Number);
  const [hours, minutes] = birthData.time.split(':').map(Number);

  if (birthData.timezoneId) {
    const dt = DateTime.fromObject({ year, month, day, hour: hours, minute: minutes }, { zone: birthData.timezoneId });
    return dt.toUTC().toJSDate();
  }

  // Fallback legacy: timezoneOffset (hours)
  const offset = typeof birthData.timezoneOffset === 'number' ? birthData.timezoneOffset : 0;
  return new Date(Date.UTC(year, month - 1, day, hours - offset, minutes));
}

/**
 * Calcula el Ascendente usando la fórmula estándar
 * RAMC = LST en grados (Right Ascension of Midheaven)
 */
function calculateAscendant(ramc: number, latitude: number, obliquity: number): number {
  const ramcRad = toRad(ramc);
  const latRad = toRad(latitude);
  const epsRad = toRad(obliquity);

  // Fórmula estándar: ASC = atan2(cos(RAMC), -(sin(RAMC)*cos(eps) + tan(lat)*sin(eps)))
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));

  let asc = toDeg(Math.atan2(y, x));
  return normalizeDegrees(asc);
}

/**
 * Calcula el Medio Cielo (MC) a partir del RAMC y oblicuidad
 */
function calculateMidheaven(ramc: number, obliquity: number): number {
  const ramcRad = toRad(ramc);
  const epsRad = toRad(obliquity);

  // MC = atan2(tan(RAMC), cos(eps))
  // Necesitamos mantener el cuadrante correcto
  let mc = toDeg(Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad)));
  return normalizeDegrees(mc);
}

/**
 * Calcula las cúspides de las casas usando el sistema Placidus simplificado
 * Usa interpolación semi-arco para casas intermedias
 */
function calculatePlacidusHouses(ramc: number, latitude: number, obliquity: number): number[] {
  const asc = calculateAscendant(ramc, latitude, obliquity);
  const mc = calculateMidheaven(ramc, obliquity);

  const cusps: number[] = new Array(12);
  cusps[0] = asc;                                  // Casa 1 = Ascendente
  cusps[9] = mc;                                   // Casa 10 = MC
  cusps[6] = normalizeDegrees(asc + 180);          // Casa 7 = Descendente
  cusps[3] = normalizeDegrees(mc + 180);           // Casa 4 = IC

  // Interpolación semi-arco para casas intermedias
  // Arco del MC al ASC (casas 11 y 12)
  let mcToAsc = asc - mc;
  if (mcToAsc < 0) mcToAsc += 360;

  // Arco del ASC al IC (casas 2 y 3)
  const ic = cusps[3];
  let ascToIc = ic - asc;
  if (ascToIc < 0) ascToIc += 360;

  // Casas intermedias por interpolación
  cusps[10] = normalizeDegrees(mc + mcToAsc / 3);       // Casa 11
  cusps[11] = normalizeDegrees(mc + 2 * mcToAsc / 3);   // Casa 12
  cusps[1] = normalizeDegrees(asc + ascToIc / 3);       // Casa 2
  cusps[2] = normalizeDegrees(asc + 2 * ascToIc / 3);   // Casa 3

  // Casas opuestas (hemisferio inferior)
  cusps[4] = normalizeDegrees(cusps[10] + 180);  // Casa 5
  cusps[5] = normalizeDegrees(cusps[11] + 180);  // Casa 6
  cusps[7] = normalizeDegrees(cusps[1] + 180);   // Casa 8
  cusps[8] = normalizeDegrees(cusps[2] + 180);   // Casa 9

  return cusps;
}

/**
 * Determina en qué casa se encuentra un planeta basándose en las cúspides
 */
function getHouseForPlanet(longitude: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const nextI = (i + 1) % 12;
    const start = cusps[i];
    const end = cusps[nextI];

    if (end < start) {
      // La casa cruza 0° Aries
      if (longitude >= start || longitude < end) {
        return i;
      }
    } else {
      if (longitude >= start && longitude < end) {
        return i;
      }
    }
  }
  return 0; // fallback
}

/**
 * Convierte longitud eclíptica a posición en signo zodiacal
 */
function longitudeToSign(longitude: number): { signIndex: number; sign: string; degree: number; minute: number } {
  const normalized = normalizeDegrees(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degInSign = normalized - signIndex * 30;
  const degree = Math.floor(degInSign);
  const minute = Math.round((degInSign - degree) * 60);

  return {
    signIndex,
    sign: ZODIAC_SIGNS[signIndex],
    degree,
    minute
  };
}

/**
 * Calcula los aspectos entre todos los pares de planetas
 */
function calculateAspects(planets: PlanetPosition[], orb: number): AspectData[] {
  const aspects: AspectData[] = [];
  const aspectTypes = Object.entries(ASPECT_CONFIG) as [AspectType, typeof ASPECT_CONFIG[AspectType]][];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];

      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const [type, config] of aspectTypes) {
        const actualOrb = Math.abs(diff - config.angle);
        const maxOrb = Math.min(orb, config.defaultOrb);

        if (actualOrb <= maxOrb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type,
            angle: config.angle,
            orb: Math.round(actualOrb * 100) / 100,
            applying: false,
            symbol: config.symbol
          });
          break; // Solo un aspecto por par
        }
      }
    }
  }

  return aspects;
}

/**
 * FUNCIÓN PRINCIPAL: Calcula la carta natal completa
 * @param birthData - Datos de nacimiento del consultante
 * @param orbDegrees - Orbe máximo para aspectos (default: 5°)
 */
export function calculateNatalChart(birthData: BirthData, orbDegrees: number = 5): NatalChart {
  // Parsear fecha y hora
  const [year, month, day] = birthData.date.split('-').map(Number);
  const [hours, minutes] = birthData.time.split(':').map(Number);

  // Crear fecha UTC ajustando por el offset de zona horaria
  const utcDate = convertBirthToUTC(birthData);

  // Calcular posiciones de todos los planetas
  const planets: PlanetPosition[] = [];

  for (const { name, body } of PLANET_BODIES) {
    const longitude = getPlanetLongitude(body, utcDate);
    const signData = longitudeToSign(longitude);
    const retro = isRetrograde(body, utcDate);

    planets.push({
      name,
      longitude,
      ...signData,
      houseIndex: 0,
      house: 1,
      retrograde: retro
    });
  }

  // Quirón (cálculo orbital aproximado)
  const chironLon = getChironLongitude(utcDate);
  const chironSign = longitudeToSign(chironLon);
  planets.push({
    name: 'Quirón',
    longitude: chironLon,
    ...chironSign,
    houseIndex: 0,
    house: 1,
    retrograde: false
  });

  // Calcular sistema de casas
  const obliquity = getObliquity(utcDate);
  const ramc = calculateLST(utcDate, birthData.longitude); // LST = RAMC en grados
  const cusps = calculatePlacidusHouses(ramc, birthData.latitude, obliquity);

  const ascendant = cusps[0];
  const midheaven = cusps[9];

  // Asignar casa a cada planeta
  for (const planet of planets) {
    const hi = getHouseForPlanet(planet.longitude, cusps);
    planet.houseIndex = hi;
    planet.house = hi + 1;
  }

  // Calcular aspectos
  const aspects = calculateAspects(planets, orbDegrees);

  const ascSign = longitudeToSign(ascendant);
  const mcSign = longitudeToSign(midheaven);

  const houses: HouseData = {
    cusps,
    ascendant,
    midheaven
  };

  return {
    birthData,
    planets,
    houses,
    aspects,
    ascendantSign: ascSign.sign,
    midheavenSign: mcSign.sign,
    calculatedAt: new Date()
  };
}
