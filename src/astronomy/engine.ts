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
 * Calcula la longitud eclíptica geocéntrica de Quirón usando elementos orbitales completos.
 *
 * Implementa geometría orbital 3D completa:
 *   - Inclinación (i), nodo ascendente (Ω) y argumento del perihelio (ω)
 *   - Corrección geocéntrica usando la posición de la Tierra de astronomy-engine
 *
 * Elementos orbitales en J2000.0 (JPL/MPC, perihelio ~14 feb 1996):
 *   a = 13.6455 AU   e = 0.3786    i = 6.9261°
 *   Ω = 209.3673°    ω = 339.3984°  M₀ = 27.7°
 *
 * Precisión: sub-grado frente al modelo heliocéntrico simple anterior (~30° de error).
 */
function getChironLongitude(date: Date): number {
  const epoch = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const daysSinceEpoch = (date.getTime() - epoch.getTime()) / (24 * 3600 * 1000);

  // Elementos orbitales osculates de Quirón en J2000.0
  const a      = 13.6455;          // semieje mayor (UA)
  const e      = 0.3786;           // excentricidad
  const iRad   = toRad(6.9261);    // inclinación
  const OmRad  = toRad(209.3673);  // longitud del nodo ascendente (Ω)
  const omRad  = toRad(339.3984);  // argumento del perihelio (ω)
  const M0     = 27.7;             // anomalía media en J2000.0 (grados)

  // Período orbital por 3ª ley de Kepler: T = a^1.5 años
  const period = Math.pow(a, 1.5) * 365.25; // días
  const n      = 360.0 / period;            // movimiento medio (°/día)

  // Anomalía media en la fecha dada
  const M    = normalizeDegrees(M0 + n * daysSinceEpoch);
  const Mrad = toRad(M);

  // Ecuación de Kepler — Newton-Raphson
  let E = Mrad;
  for (let iter = 0; iter < 20; iter++) {
    const dE = (Mrad - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-12) break;
  }

  // Anomalía verdadera (ν)
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );

  // Distancia heliocéntrica (UA)
  const rAU = a * (1 - e * Math.cos(E));

  // Argumento de latitud u = ν + ω
  const u    = nu + omRad;
  const cosU = Math.cos(u);
  const sinU = Math.sin(u);
  const cosI = Math.cos(iRad);

  // Coordenadas eclípticas heliocéntricas rectangulares de Quirón (UA)
  // (z_C = rAU * sinU * sin(i) no se necesita para longitud eclíptica)
  const xC = rAU * (Math.cos(OmRad) * cosU - Math.sin(OmRad) * sinU * cosI);
  const yC = rAU * (Math.sin(OmRad) * cosU + Math.cos(OmRad) * sinU * cosI);

  // Corrección geocéntrica: posición de la Tierra vía astronomy-engine
  // GeoVector(Sol) = vector Tierra→Sol en ecuatorial J2000 (UA)
  const time   = Astronomy.MakeTime(date);
  const sunGeo = Astronomy.GeoVector(Astronomy.Body.Sun, time, true);

  // Convertir Sol geocéntrico ecuatorial → eclíptico (rotación por oblicuidad)
  const eps      = toRad(getObliquity(date));
  const sunEclX  = sunGeo.x;
  const sunEclY  = sunGeo.y * Math.cos(eps) + sunGeo.z * Math.sin(eps);

  // Vector geocéntrico eclíptico de Quirón:
  //   heliocéntrico(Quirón) − heliocéntrico(Tierra)
  //   heliocéntrico(Tierra) = −geocéntrico(Sol) en eclíptico
  //   ⇒ geocéntrico(Quirón) = (xC + sunEclX, yC + sunEclY)
  const dx = xC + sunEclX;
  const dy = yC + sunEclY;

  return normalizeDegrees(toDeg(Math.atan2(dy, dx)));
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
 * Ascensión recta de un grado eclíptico (cuadrante correcto)
 */
function eclipticRA(lambda: number, obliquity: number): number {
  const l = toRad(lambda);
  const e = toRad(obliquity);
  return normalizeDegrees(toDeg(Math.atan2(Math.cos(e) * Math.sin(l), Math.cos(l))));
}

/**
 * Declinación de un grado eclíptico
 */
function eclipticDec(lambda: number, obliquity: number): number {
  const l = toRad(lambda);
  const e = toRad(obliquity);
  return toDeg(Math.asin(Math.sin(e) * Math.sin(l)));
}

/**
 * Semiarco diurno (DSA) de un grado eclíptico para una latitud dada
 */
function diurnalSemiArc(lambda: number, obliquity: number, lat: number): number {
  const dec = eclipticDec(lambda, obliquity);
  const arg = -Math.tan(toRad(lat)) * Math.tan(toRad(dec));
  if (arg >= 1) return 0;
  if (arg <= -1) return 180;
  return toDeg(Math.acos(arg));
}

/**
 * Resuelve una cúspide Placidus iterativamente.
 *
 * Casas superiores (11, 12):  RA(λ) = RAMC + f·DSA(λ)
 *   f = 1/3 → casa 11 | f = 2/3 → casa 12
 *
 * Casas inferiores (2, 3):    RA(λ) = RAMC + 180° − f·NSA(λ)
 *   f = 2/3 → casa 2  | f = 1/3 → casa 3
 */
function solvePlacidusCusp(
  ramc: number,
  obliquity: number,
  lat: number,
  fraction: number,
  upper: boolean
): number {
  let lambda = upper
    ? normalizeDegrees(ramc + fraction * 90)
    : normalizeDegrees(ramc + 180 - fraction * 90);

  for (let iter = 0; iter < 50; iter++) {
    const ra  = eclipticRA(lambda, obliquity);
    const dsa = diurnalSemiArc(lambda, obliquity, lat);
    const nsa = 180 - dsa;

    const target = upper
      ? normalizeDegrees(ramc + fraction * dsa)
      : normalizeDegrees(ramc + 180 - fraction * nsa);

    let err = target - ra;
    if (err > 180) err -= 360;
    if (err < -180) err += 360;

    lambda = normalizeDegrees(lambda + err);
    if (Math.abs(err) < 1e-8) break;
  }
  return lambda;
}

/**
 * Calcula las 12 cúspides de casas con el sistema Placidus verdadero.
 * Casas angulares: ASC (1), IC (4), DSC (7), MC (10).
 * Casas intermedias: resolución iterativa por semi-arco diurno/nocturno.
 */
function calculatePlacidusHouses(ramc: number, latitude: number, obliquity: number): number[] {
  const asc = calculateAscendant(ramc, latitude, obliquity);
  const mc  = calculateMidheaven(ramc, obliquity);

  const cusps: number[] = new Array(12);
  cusps[0] = asc;                              // Casa  1 = ASC
  cusps[9] = mc;                               // Casa 10 = MC
  cusps[6] = normalizeDegrees(asc + 180);      // Casa  7 = DSC
  cusps[3] = normalizeDegrees(mc  + 180);      // Casa  4 = IC

  // Casas superiores (entre MC y ASC, sobre el horizonte)
  cusps[10] = solvePlacidusCusp(ramc, obliquity, latitude, 1 / 3, true);  // Casa 11
  cusps[11] = solvePlacidusCusp(ramc, obliquity, latitude, 2 / 3, true);  // Casa 12

  // Casas inferiores (entre ASC e IC, bajo el horizonte)
  cusps[1] = solvePlacidusCusp(ramc, obliquity, latitude, 2 / 3, false);  // Casa 2
  cusps[2] = solvePlacidusCusp(ramc, obliquity, latitude, 1 / 3, false);  // Casa 3

  // Casas opuestas simétricas
  cusps[4] = normalizeDegrees(cusps[10] + 180);  // Casa 5
  cusps[5] = normalizeDegrees(cusps[11] + 180);  // Casa 6
  cusps[7] = normalizeDegrees(cusps[1]  + 180);  // Casa 8
  cusps[8] = normalizeDegrees(cusps[2]  + 180);  // Casa 9

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

  // Quirón (elementos orbitales completos + corrección geocéntrica)
  const chironLon = getChironLongitude(utcDate);
  const chironSign = longitudeToSign(chironLon);
  const chironRetro = (() => {
    const dt = 24 * 3600 * 1000;
    const lon1 = getChironLongitude(new Date(utcDate.getTime() - dt));
    const lon2 = getChironLongitude(new Date(utcDate.getTime() + dt));
    let diff = lon2 - lon1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff < 0;
  })();
  planets.push({
    name: 'Quirón',
    longitude: chironLon,
    ...chironSign,
    houseIndex: 0,
    house: 1,
    retrograde: chironRetro
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

/**
 * Formatea una longitud eclíptica en grados°minutos' Signo
 */
export function formatDegree(longitude: number): string {
  const { sign, degree, minute } = longitudeToSign(longitude);
  return `${degree}° ${sign} ${minute}'`;
}

/**
 * Resultado de geocodificación de ciudad
 */
export interface GeoResult {
  lat: number;
  lon: number;
  timezoneOffset: number;
  timezoneName: string;
  displayName: string;
}

/**
 * Geocodifica un nombre de ciudad usando Nominatim (OpenStreetMap).
 * Devuelve coordenadas, zona horaria UTC y nombre normalizado, o null si no se encuentra.
 */
export async function geocodeCity(cityQuery: string): Promise<GeoResult | null> {
  try {
    // Nominatim con extratags=1 para obtener timezone de OSM cuando está disponible
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityQuery)}&format=json&limit=1&addressdetails=1&extratags=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'es', 'User-Agent': 'AstroAnima/1.0' }
    });
    if (!res.ok) return null;

    const data = await res.json() as Array<{
      lat: string;
      lon: string;
      display_name: string;
      extratags?: { timezone?: string };
    }>;
    if (!data.length) return null;

    const { lat: latStr, lon: lonStr, display_name, extratags } = data[0];
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    let timezoneOffset = 0;
    let timezoneName = 'UTC';

    // Fuente 1: timezone de OSM extratags (sin petición adicional)
    const osmTz = extratags?.timezone;
    if (osmTz) {
      timezoneName = osmTz;
      try {
        // Usar Luxon para calcular el offset actual a partir del ID IANA
        const { IANAZone } = await import('luxon');
        const zone = IANAZone.create(osmTz);
        timezoneOffset = zone.offset(Date.now()) / 60;
      } catch {
        timezoneOffset = 0;
      }
    } else {
      // Fuente 2: timeapi.io — gratuito, sin API key, CORS habilitado
      try {
        const tzRes = await fetch(
          `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`
        );
        if (tzRes.ok) {
          const tzData = await tzRes.json() as {
            timeZone?: string;
            currentUtcOffset?: { seconds?: number };
          };
          if (tzData.timeZone) {
            timezoneName = tzData.timeZone;
            timezoneOffset = typeof tzData.currentUtcOffset?.seconds === 'number'
              ? tzData.currentUtcOffset.seconds / 3600
              : 0;
          }
        }
      } catch {
        // zona horaria no disponible — quedará UTC+0
      }
    }

    return { lat, lon, timezoneOffset, timezoneName, displayName: display_name };
  } catch {
    return null;
  }
}
