# ACCURACY_REMEDIATION_PLAN — Remediation for astronomical accuracy

Fecha: 2026-06-06T20:26:00-06:00

Objetivo
--------
Proponer pasos concretos para corregir las imprecisiones detectadas en AUDIT_ASTROLOGY.md: timezone handling, DST histórico, Quirón, retrogradaciones y Placidus.

Resumen ejecutivo (prioridad por impacto)
- P1 (alto): Sustituir timezoneOffset por IANA + manejo DST histórico.
- P2 (alto): Reemplazar cálculo de Quirón por efemérides profesionales (Swiss Ephemeris/JPL).
- P3 (alto): Mejorar retrogradaciones usando velocidad aparente (dλ/dt) del ephemeris.
- P4 (medio): Validar y mejorar implementación Placidus vs referencia.

Plan detallado
--------------
1) Sustitución de timezoneOffset por IANA Time Zones
- Descripción: reemplazar el uso numérico timezoneOffset por zonas IANA (ej. "America/Mexico_City") en todo flujo de conversión local→UTC y viceversa.
- Biblioteca recomendada: Luxon (browser+node) o Temporal (cuando disponible) + Intl API; alternativa: timezone-support.
- Pasos:
  a. Cambiar BirthData para aceptar timezoneId?: string (IANA) y conservar timezoneOffset solo como fallback.
  b. En la UI, en el geocoding, recuperar y guardar IANA tz (BigDataCloud o GeoNames pueden devolverla). Si no se obtiene, presentar selector de zona al usuario.
  c. Usar Luxon.DateTime.fromObject({year,month,day,hour,minute}, {zone: timezoneId}).toUTC() para crear fecha UTC correcta y consistente con DST histórica.
  d. Añadir tests unitarios que comparen conversiones para zonas con offsets fraccionarios y transiciones DST.
- Est. esfuerzo: 2-4 días de dev + 1 día testing
- Riesgo: Medio (cambios en estructuras de datos y UI)
- Criterio de finalización: Todas las conversiones locales->UTC en tests usan IANA y pasan casos DST/offsets fraccionarios.

2) Manejo correcto de DST histórico
- Descripción: asegurar que conversiones usan la base IANA y aplican reglas históricas (p. ej. cambios de legislación en 1970-2025).
- Pasos:
  a. Incluir test vectors (fechas en años 1940, 1968, 1995, 2007, etc.) para zonas relevantes.
  b. Validar Luxon (o Temporal) result vs. reference (Astro.com or Swiss Ephemeris input conversion).
  c. Documentar fallback si no se conoce zona (solicitar al usuario confirmar hora en UTC o elegir zona).
- Est. esfuerzo: 1-2 días
- Riesgo: Bajo
- Criterio de finalización: Test vectors DST históricos pasan; UI solicita zona cuando desconocida.

3) Estrategia para reemplazar cálculo de Quirón por efemérides profesionales
- Descripción: sustituir aproximación analítica por datos de efemérides (Swiss Ephemeris o JPL) usados en producción.
- Opciones técnicas:
  A. Integrar Swiss Ephemeris (libswisseph) via node-swisseph / swisseph npm — pros: estándar astrológico; cons: binding nativo y licencia C.
  B. Usar JPL DE430/DE440 via library or precomputed tables (más complejo).
  C. Si desea evitar binarios, consultar si astronomy-engine ofrece objetos menores con precisión aceptable.
- Pasos:
  a. Probar npm swisseph locally and write wrapper (getLongitude(body, date) returns geocentric ecliptic lon and speed).
  b. Replace getChironLongitude with call into ephemeris; support caching for performance (daily table or in-memory LRU).
  c. Add fallback to previous approximation if ephemeris unavailable, but log warning.
- Est. esfuerzo: 3-6 días (integration + tests)
- Riesgo: Medio-Alto (binarios nativos, packaging for desktop installers)
- Criterio de finalización: Chiron positions match Swiss Ephemeris within 0.1–0.5° on sample dates; package builds include native dependency or alternative distribution.

4) Mejora del cálculo de retrogradaciones
- Descripción: reemplazar método de diferencia ±24h por velocidad instantánea del cuerpo (dλ/dt) calculada por ephemeris.
- Pasos:
  a. When using ephemeris (Swiss/JPL/astronomy-engine), obtain ecliptic longitude rate (speed) or compute central difference with small delta (e.g., 1 hour) and high-precision ephemeris.
  b. Retrogrado if speed < 0 (or below small epsilon threshold to avoid noise). For station detection, detect sign change in speed across samples.
  c. Add tests covering stations and short retrograde windows; implement hysteresis or smoothing to avoid spurious flips.
- Est. esfuerzo: 1-2 days
- Riesgo: Medio
- Criterio de finalización: Retrograde detection matches reference for Jupiter/Saturn examples; station dates identified within 1 day.

5) Validación y mejora del sistema Placidus
- Descripción: asegurar que las cúspides Placidus sean cercanas a las de referencia (Swiss Ephemeris/Astro.com) y ajustar interpolación o reemplazar por algoritmo estándar.
- Pasos:
  a. Implementar test harness to compute cusps both with current calculatePlacidusHouses y con reference (Swiss Ephemeris or using tested implementation).
  b. Compare across grid of latitudes (-80..+80) and dates; collect deltas y identify regimes where error > tolerance.
  c. If interpolation error significant, implement canonical Placidus semi-arc solving per cusp (Meeus o algorithmic approach) o adaptar algorithm from swiss ephemeris.
- Est. esfuerzo: 3-6 días (analysis + implementation if needed)
- Riesgo: Medio-Alto (math correctness and edge cases at high latitudes)
- Criterio de finalización: Cusps del sistema pasan tests with tolerances (<=0.5–1.0°) across standard latitudes; documentation of any high-latitude exceptions.

6) Priorización por impacto en precisión
- P0 (Urgente, alto impacto): Timezone IANA + DST (tasks 1-2). Without this, Ascendant/MC & houses are off by hours.
- P1 (Alto impacto): Replace Quirón with efemérides + retrograde via speed (tasks 3-4). Affects minor body positions and retrograde flags.
- P2 (Medio): Placidus validation & improvement (task 5).
- P3 (Bajo): Aspect multiplicity logic (separate, small effect) — consider later.

7) Validación, tests y QA
- Test datasets:
  - Known birth charts from Astro.com (export CSV) for multiple eras and timezones.
  - Ephemeris snapshot: daily positions for 1950–2030 from Swiss Ephemeris for automated comparison.
  - Retrograde/station windows for major planets across decades.
- Automation:
  - Create CI jobs que run comparisons and produce reports on deltas.
  - Fail build if planetary diffs exceed thresholds.

8) Packaging & distribution considerations
- Native Swiss Ephemeris bindings require packaging steps para Desktop installers (macOS, Windows). Strategy: include prebuilt binaries for target platforms o usar fallback web service for ephemeris queries (privacy trade-off).
- Document licensing implications for Swiss Ephemeris.

Estimaciones generales
- Total development effort (approx): 12-22 days (single experienced developer) depending on packaging complexity for native ephemeris.
- Total risk: Medium-High (native libraries + DST edge cases). Mitigations: phased approach — first implement IANA/DST & retrograde speed using astronomy-engine velocities (if available), then integrate Swiss Ephemeris.

Roadmap propuesto (phased)
- Phase A (0–1 week): Implement IANA timezone & DST handling; add conversion tests.
- Phase B (1–2 weeks): Improve retrograde detection using speed; add tests for stations.
- Phase C (1–2 weeks): Integrate ephemeris for Quirón or verify astronomy-engine small-body accuracy; run bulk comparisons.
- Phase D (1 week): Validate Placidus thoroughly and implement corrections if needed.
- Phase E (ongoing): CI guardrails and monitoring; package native dependencies for desktop installers.

Recomendación final
- Start by solving timezone/DST and retrograde speed: yields largest reduction in user-visible chart errors quickly.
- Next, integrate ephemeris for Quirón and validate houses.
- Maintain fallback behavior and clear user messaging if high-precision ephemerides are not available.

Generado por: asistente AI usando Copilot CLI runtime en VS Code.
