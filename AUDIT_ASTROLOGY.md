# AUDIT_ASTROLOGY — Technical & Astrological Audit

Fecha: 2026-06-06T20:18:54-06:00

Objetivo: verificar precisión astronómica/astrológica del motor actual.

1) Sistema de casas usado actualmente
- Implementación: sistema Placidus (cálculo en calculatePlacidusHouses).
- Nota: usa una interpolación "semi-arco" simplificada para cúspides intermedias (no cálculo completo por pasos de semi-arc individuales como en librerías especializadas).

2) Cálculo del Ascendente y Medio Cielo
- Ascendente: calculateAscendant(ramc, latitude, obliquity) utiliza RAMC (local sidereal time en grados) y fórmula ASC = atan2(cos(RAMC), -(sin(RAMC)*cos(eps)+tan(lat)*sin(eps))). Resultado normalizado 0–360.
- Medio Cielo: calculateMidheaven(ramc, obliquity) usa atan2(sin(RAMC), cos(RAMC)*cos(eps)) y normaliza.
- LST/RAMC: calculateLST usa Astronomy.SiderealTime(time) (horas siderales) *15 + longitudeEast.

3) Cálculo de aspectos
- calculateAspects compara diferencia absoluta de longitudes (ajustada >180 → 360-diff).
- Recorre ASPECT_CONFIG en orden (conjunción, oposición, trígono, cuadratura, sextil) y asigna el primer aspecto cuyo orbe ≤ min(globalOrb, aspect.defaultOrb).
- Resultado: un solo aspecto por par (break al primer match), orb redondeado a 2 decimales.

4) Cálculo de Quirón
- getChironLongitude usa una aproximación orbital simple:
  - Parámetros fijos (longitudEpoch, perihelio, excentricidad, periodo ~50.7 años)
  - Calcula anomalía media, resuelve ecuación de Kepler por iteración (E = M + e*sin(E)), obtiene anomalía verdadera y suma al perihelio.
- Es una aproximación analítica, no basada en efemérides observacionales (Swiss Ephemeris/JPL).

5) Cálculo de retrogradaciones
- isRetrograde compara longitudes a date-24h y date+24h y mide diferencia (ajustada en ±180) — considera retrogrado si diferencia < 0.
- Método sensible a elección de paso temporal (±24h) y puede fallar cerca de límites o para cuerpos muy lentos.

6) Diferencias esperadas vs Astro.com / AstroSeek / Solar Fire
- Efemérides: estos servicios usan Swiss Ephemeris o JPL (alta precisión) y consideraciones de TT/UT/ΔT; el proyecto usa astronomy-engine + aproximación para Quirón → diferencias en grados posibles (especialmente cuerpos menores).
- Casas: Placidus implementado, pero la interpolación simplificada puede producir pequeñas variaciones en cúspides intermedias vs cálculo completo (especialmente en latitudes altas).
- Tiempo/Timezone: Astro.com/others usan IANA timezone y convierten local→UT con reglas DST/zone históricas; aquí timezoneOffset es redondeado y BigDataCloud fallback devuelve estimados → puede generar errores de horas.
- Retrogradación y aspectos: la librería actual puede marcar diferente status en días límite por la técnica de muestreo (±24h) y el criterio de un solo aspecto por par limita detección de múltiples aspectos simultáneos.

7) Riesgos de precisión detectados
- Quirón inexacto: aproximación analítica puede divergir varios grados respecto a ephemeris certificadas.
- Timezone & DST: using timezoneOffset numeric rounding risks hour-level errors, desplazando casas y posiciones angulares.
- Houses at extreme latitudes: Placidus interpolation simplified may produce noticeable cusp errors or singularities.
- Retrograde detection: 24h finite difference can miss short station arcs or mislabel around 0° longitude wrap.
- Aspect assignment order: first-match strategy biases toward conjunction/opposition over others when multiple aspects fall within orbe.

8) Casos de prueba recomendados
- Baselines (compare results to Swiss Ephemeris / Astro.com):
  - J2000 reference: 2000-01-01T12:00:00 UTC — verify major planet longitudes vs reference.
  - Known births with published charts (use exact UT values and IANA tz): compare Sun, Moon, Ascendant, MC, house cusps, and aspects. (Use sources: Astro.com charts export.)
- Chiron accuracy: pick dates with published Chiron positions (e.g., 2000-01-01, 2010-06-01) and compare longitude difference ≤ 1.0° target.
- Retrograde station tests: choose known retrograde start/stop dates for Jupiter/Saturn (from ephemeris) and verify isRetrograde status across ±2 days.
- Timezone/DST edge cases: births at DST transition dates (local) in zones with fractional offsets (India +5:30, Nepal +5:45) — verify correct UT conversion and resulting Asc/MC.
- High-latitude birth: test near ±70° latitude (e.g., Tromsø) to validate Placidus cusp stability vs reference (tolerance ≤ 1° where possible).
- Aspect multiplicity: construct synthetic pair of planets where two aspects are possible within orbe (e.g., planet A 1°, planet B 61° → both conjunction (0) and sextile(60) may be ambiguous with wide orbe) — verify behavior and document limitation.

Recomendaciones rápidas
- Replace timezoneOffset integer usage with IANA-based conversion (luxon/Intl or timezone database) to handle historical DST and fractional offsets.
- For professional accuracy, replace Quirón approximation with ephemeris lookup (Swiss Ephemeris / JPL) or use astronomy-engine ephemeris for small bodies if available.
- Use smaller time-step or analytic method for retrograde/station detection (calculate dλ/dt or use apparent speed from ephemeris instead of ±24h difference).
- Consider computing full Placidus cusps via standard algorithms (semi-arc solving per cusp) or validate interpolation against a reference for high latitudes.

Tolerances suggested for validations (targets)
- Major planets (Sun–Saturn): ≤ 0.2° difference vs Swiss Ephemeris
- Outer planets (Uranus–Pluto): ≤ 0.5°
- Chiron and asteroids: ≤ 1.0–2.0° (until ephemeris integration)
- Ascendant/MC: ≤ 0.5° (depends on timezone correctness)
- House cusps: ≤ 0.5–1.0° (latitudes near poles may relax tolerance)
- Aspect detection: matching aspect type and orb within configured limits; ensure no false negatives on known configurations.

Conclusión
- Motor usa buenas bases (astronomy-engine) for major planets but exhibts practical shortcuts (Chiron approx, timezone rounding, simplified Placidus interpolation, retrograde finite-difference) that must be validated and likely improved for professional usage.
- Prioridad de corrección: timezone handling (IANA/DST) → retrograde detection accuracy → Chiron ephemeris → Placidus cusp precision.

Generado por: asistente AI usando Copilot CLI runtime en VS Code.
