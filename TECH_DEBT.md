# TECH_DEBT — AstroAnima

Fecha: 2026-06-06T19:48:06-06:00

1) Deuda técnica existente
- Falta test coverage (unidad e integración) para engine/interpreter/pdf/db.
- Cálculos astronómicos en hilo principal: rendimiento y UX.
- Zona horaria: ausencia de IANA/luxon produce riesgos de precisión.
- Regla de Quirón y cuerpos menores implementadas por aproximación en lugar de efemérides.
- Falta CI/CD y linters configurados en package.json.

2) Refactorizaciones recomendadas
- Extraer cálculo astronómico a módulo worker (WebWorker) y API clara para mocking en tests.
- Separar concerns: engine (pure math) vs adapters (astronomy-engine wrappers, timezones, geocoding).
- Interpretación: transformar data-driven (JSON) a sistema de plantillas y tests de reglas.

3) Código duplicado y acoplamientos
- Formateo de grados y conversión signo/deg usado en varios lugares (centralizar).
- Lógica de UI/estado en App.tsx un poco grande — fragmentar en hooks (useChart, useTherapistConfig).

4) Riesgos futuros de mantenimiento
- Dependencia en APIs públicas para timezone/geo sin cache/ratelimit.
- Textos interpretativos embebidos que requerirán gestión de contenidos (migrar a CMS o JSON externos).

5) Prioridad de refactor
- Alta: mover cálculos pesados a worker; tests de engine; IANA tz.
- Media: modularizar App.tsx, externalizar plantillas interpretativas.
- Baja: optimizaciones UI menores.