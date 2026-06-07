# MVP_STATUS — Estado del MVP estimado

Fecha: 2026-06-06T19:48:06-06:00

Estimación general
- Completitud funcional actual: 45-55% del MVP (estimado)

Motivación
- El núcleo de cálculo natal, interpretación básica, persistencia local y export PDF están implementados.
- Faltan funciones esenciales para un producto comercial (tránsitos, sinastría, tests, CI, workers, timezone precisión).

Qué falta para versión 1.0 comercial
(orden sugerido):
1. Implementar Tránsitos y Sinastría (4-10 días)
2. Añadir test coverage crítico para engine/interpreter (2-4 días)
3. Integrar IANA timezone (luxon) y corregir offsets no enteros (1-3 días)
4. Mover cálculos pesados a WebWorker (1-3 días)
5. Añadir CI (build/test) y linters (1-2 días)
6. Mejorar PDF templates y opciones de exportación (1-3 días)
7. Documentación de producto y política de privacidad/legal (1-2 días)

Qué falta para una versión SaaS
- Backend multi-tenant: almacenar consultantes, seguridad, RBAC, facturación, backups.
- API pública y autenticación (OAuth2/JWT).
- Escalado de cálculo (mover engine a microservicio o colas de trabajo), cache de efemérides.
- Monitoreo, logs, SLOs y SLA.
- Cumplimiento de protección de datos (GDPR/locally relevant laws).

Qué falta para versión profesional para astrólogos
- Librerías de efemérides certificadas (JPL/Swiss Ephemeris), precisión de cuerpos menores.
- Herramientas avanzadas: sinastría detallada, progresiones, direcciones primarias, revoluciones, triaging de aspectos, AR/visualizaciones interactivas.
- Importación/Exportación estándar (Astro.com formats, CSV).
- Plantillas profesionales personalizables y firma digital en PDFs.

Porcentaje estimado para cada hito
- Core natal + PDF + DB: 50%
- Tránsitos + Sinastría: +30% (total 80%)
- Tests & CI & workers: +10% (total 90%)
- SaaS/features profesionales: +10% (total 100%)