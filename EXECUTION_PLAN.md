# EXECUTION_PLAN — AstroAnima Desktop 1.0

Fecha: 2026-06-06T20:14:08-06:00

Objetivo: alcanzar una versión Desktop 1.0 comercial vendible, estable y privada, sin agregar funcionalidades experimentales. 20 tareas concretas, priorizadas, con dependencias, estimaciones, riesgos y criterios de finalización.

Tarea 1 — Reproducir y documentar fallos actuales
- Prioridad: Alta
- Dependencias: Ninguna
- Tiempo estimado: 4 horas
- Riesgo: Bajo
- Criterio de finalización: Lista reproducible de fallos y pasos para reproducir (timezone, geocode, PDF slow, retrograde edge cases). Responsable con logs de ejemplo.

Tarea 2 — Implementar suite de testing y CI mínima
- Prioridad: Alta
- Dependencias: Tarea 1
- Tiempo estimado: 1 día
- Riesgo: Medio
- Criterio de finalización: Pipeline en GitHub Actions que instala, corre linter básico y ejecuta tests unitarios; README con comando para correr tests localmente.

Tarea 3 — Escribir tests unitarios para calculateNatalChart con casos de referencia
- Prioridad: Alta
- Dependencias: Tarea 2
- Tiempo estimado: 2 días
- Riesgo: Medio
- Criterio de finalización: >=10 casos unitarios (fechas/hours/timezones conocidos) que validen planet positions, houses, aspects; tests verdes en CI.

Tarea 4 — Corregir manejo de timezone offsets no enteros y DST
- Prioridad: Alta
- Dependencias: Tarea 1, Tarea 3
- Tiempo estimado: 1.5 días
- Riesgo: Alto (cambios sensibles en cálculos)
- Criterio de finalización: Tests que cubran offsets no enteros (e.g., +5:30) y fechas de cambio DST pasan; documentación de la estrategia de TZ (implementación en código a realizar por devs).

Tarea 5 — Añadir validaciones y mensajes de error para geocoding fallido
- Prioridad: Alta
- Dependencias: Tarea 1
- Tiempo estimado: 0.5 días
- Riesgo: Bajo
- Criterio de finalización: UI muestra mensajes claros y pasos alternativos cuando Nominatim/BigDataCloud fallan; tests de UI manual documentados.

Tarea 6 — Añadir tests de regresión para getChironLongitude y isRetrograde
- Prioridad: Alta
- Dependencias: Tarea 2, Tarea 3
- Tiempo estimado: 1 día
- Riesgo: Medio
- Criterio de finalización: Unit tests que comparen Chiron & retrograde detection contra una fuente de referencia o contra sampled expected values.

Tarea 7 — Añadir integración test para generación de PDF (smoke)
- Prioridad: Alta
- Dependencias: Tarea 2
- Tiempo estimado: 1 día
- Riesgo: Medio
- Criterio de finalización: Test que genera un PDF con datos de ejemplo y verifica que el archivo se crea y contiene texto clave (no requiere validar diseño exacto).

Tarea 8 — Implementar build y empaquetado Desktop (installer)
- Prioridad: Alta
- Dependencias: Tarea 2, Tarea 7
- Tiempo estimado: 2 días
- Riesgo: Medio
- Criterio de finalización: Build reproducible y empaquetado (zip or platform installers) listo para distribución; instalador probado en al menos macOS y Windows (o macOS y un runner).

Tarea 9 — Añadir LICENSE, EULA y política de privacidad (base) para distribución
- Prioridad: Alta
- Dependencias: Tarea 8
- Tiempo estimado: 1 día
- Riesgo: Bajo (si se usan plantillas legales revisadas)
- Criterio de finalización: Archivos LICENSE, EULA, Privacy en repo raíz y empaquetador incluye EULA en instalador.

Tarea 10 — Revisar y mejorar rendimiento de generación PDF (no funcional changes)
- Prioridad: Medium-High
- Dependencias: Tarea 7
- Tiempo estimado: 1 día
- Riesgo: Medio
- Criterio de finalización: PDF generation time reduced (medición antes y después) o documentadas limitaciones y recomendaciones (e.g., usar formatos más ligeros); no cambios de UX que afecten funcionalidades.

Tarea 11 — Preparar y publicar release v1.0 (GitHub Release + changelog)
- Prioridad: High
- Dependencias: Tareas 1-10 completadas
- Tiempo estimado: 0.5 días
- Riesgo: Bajo
- Criterio de finalización: Release creado en GitHub con binarios y notas de lanzamiento.

Tarea 12 — Crear paquete de marketing mínimo: sample report, screenshots, short demo video
- Prioridad: Medium
- Dependencias: Tarea 8, Tarea 11
- Tiempo estimado: 2 días
- Riesgo: Bajo
- Criterio de finalización: Carpeta /marketing con 3 screenshots, un PDF sample y un video de 1-2min.

Tarea 13 — Implementar UI guardado/backup export (export backup file) y restore
- Prioridad: Medium
- Dependencias: Tarea 8
- Tiempo estimado: 1 día
- Riesgo: Medio
- Criterio de finalización: Usuario puede exportar todos consultantes a un archivo JSON y restaurarlo; prueba manual completada.

Tarea 14 — Añadir telemetry opt-in (opcional) y basic analytics for usage (privacy first)
- Prioridad: Medium
- Dependencias: Tarea 9
- Tiempo estimado: 1 day
- Riesgo: Medium (privacy concerns)
- Criterio de finalización: Opt-in dialog present; events logged to chosen analytics if opted-in; docs updated about telemetry policy.

Tarea 15 — QA: Accessibility & basic UX polish (forms, labels, keyboard nav)
- Prioridad: Medium
- Dependencias: Tarea 1
- Tiempo estimado: 2 days
- Riesgo: Low
- Criterio de finalización: Issues list with fixes for critical accessibility problems (contrast, focus order); keyboard flow test passed.

Tarea 16 — Create pricing & licensing workflow for Pro upgrade (internal flow)
- Prioridad: Medium
- Dependencias: Tarea 8, Tarea 9
- Tiempo estimado: 1.5 days
- Riesgo: Medium (legal/pricing decisions)
- Criterio de finalización: Simple licensing mechanism documented (activation key flow) and pricing page draft; decision on distribution channel.

Tarea 17 — Security review and data-protection checklist
- Prioridad: High
- Dependencias: Tarea 9, Tarea 14
- Tiempo estimado: 1 day
- Riesgo: Medium
- Criterio de finalización: Checklist completado (local storage encryption decision, network calls review) y remediation plan para any high-risk items.

Tarea 18 — Manual acceptance testing and bug-fix sprint
- Prioridad: High
- Dependencias: Tareas 1-17
- Tiempo estimado: 3 days
- Riesgo: Medium
- Criterio de finalización: All P0/P1 bugs fixed; regression tests pass; product owner signs off for release.

Tarea 19 — Prepare customer support & onboarding assets (FAQ, templates)
- Prioridad: Medium
- Dependencies: Tarea 12, Tarea 11
- Tiempo estimado: 2 days
- Riesgo: Low
- Criterio de finalización: FAQ document and 3 onboarding templates available for support staff; sample responses.

Tarea 20 — Post-release monitoring & plan for 30-day hotfix cycle
- Prioridad: High
- Dependencias: Tarea 11, Tarea 14, Tarea 18
- Tiempo estimado: 0.5 days (planning)
- Riesgo: Low
- Criterio de finalización: Monitoring dashboard set, issue triage process definido, y team assigned para 30-day hotfix SLA.

Notas finales
- Orden sugerido: ejecutar tareas en el orden prioritario agrupando CI/tests (T2-T7) y empaquetado/release (T8-T11) para acelerar publicación.
- Evitar añadir nuevas funcionalidades que cambien cálculos astronómicos críticos; priorizar estabilidad, precisión y experiencia de usuario.

Generado por: asistente AI usando Copilot CLI runtime en VS Code.
