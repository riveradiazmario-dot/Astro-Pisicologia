# BUSINESS_ROADMAP — AstroAnima

Fecha: 2026-06-06T20:00:38-06:00

Resumen
-------
Documento de producto y monetización para convertir AstroAnima (desktop) en un producto comercial viable y escalable en la nube. Basado en ROADMAP.md, MVP_STATUS.md, BUGS.md, TECH_DEBT.md y FEATURES_MISSING.md.

1) Versión 1.0 — Desktop (Producto mínimo comercial)
- Público objetivo: terapeutas y consultores que necesitan informes locales y privados.
- Funcionalidades incluidas:
  - Cálculo de carta natal (actual)
  - Interpretación rule-based (actual)
  - Persistencia local (IndexedDB)
  - Export PDF con plantilla básica
  - Geocodificación básica y timezone fallback
- Valor comercial: privacidad, rapidez y coste 0 infra.
- Entregables: instalador/distribuible (zip), tutorial rápido, licencia básica.

2) Versión Pro — Desktop (para profesionales)
- Público objetivo: astrólogos profesionales y terapeutas con carga de trabajo y requerimientos de precisión.
- Funcionalidades adicionales:
  - Sinastría (comparación), carta compuesta
  - Tránsitos (timeline y alertas básicas)
  - Revolución Solar y Retornos (Solar, Lunar)
  - Mejora de efemérides: precisión para Quirón/cuerpos menores (configurable)
  - Templates avanzadas de PDF y firma digital básica
  - Export/Import CSV y compatibilidad con formatos .txt/CSV de clientes
- Valor comercial: herramientas para consultas profesionales, ahorro de tiempo y presentaciones profesionales.
- Entregables: instalador Pro, licencia con clave, documentos legales, soporte básico.

3) Versión Premium Cloud — SaaS (Premium)
- Público objetivo: equipos, consultorios y académicos; market B2B/B2C.
- Funcionalidades adicionales:
  - Multi-usuario y multi-tenant, backups y sincronización segura
  - API para integraciones y webhook de alertas
  - Historial de tránsitos y notificaciones programables
  - Motor de efemérides centralizado (Swiss Ephemeris / JPL integration optional)
  - Panel de gestión de clientes, facturación, roles (admin/consultant)
  - Plantillas personalizables, firmas digitales, PDF a medida
- Valor comercial: modelo recurrente, escalabilidad, mercado institucional.
- Entregables: sitio SaaS, subscripciones, onboarding y SLA.

4) Funcionalidades que generan más valor comercial
- Sinastría y carta compuesta (alta demanda en parejas/consultas)
- Tránsitos con alertas y timeline (mantiene usuarios activos y retorno de uso)
- Exportes profesionales (PDF con branding, plantillas)
- Precisión de efemérides (confianza profesional)
- Multi-usuario/backup y sincronización (SaaS selling point)

5) Funcionalidades que pueden posponerse
- Astrogenealogía y astrología esotérica (nicho)
- Visualizaciones AR o experimentales
- Plantillas muy especializadas para sub-nichos

6) Estrategia de suscripción (pricing guidance)
- Freemium (Desktop free): funcionalidad básica (calculo natal, interpretación, export PDF limitado a 3 por mes). Ideal para adquisición.
- Pro — Desktop (licencia anual o mensual):
  - Monthly: 9.99 USD/mo — licencia Pro (sinastría, tránsitos básicos, plantillas Pro)
  - Annual: 89.99 USD/yr (≈2 meses free)
  - Licencia por equipo (3-5 usuarios): 199 USD/yr
- Premium Cloud (SaaS):
  - Starter: 19 USD/mo — 100 clientes, tránsitos históricos limitados, PDF Pro
  - Professional: 49 USD/mo — 1000 clientes, API, backups, priority email support
  - Studio: 149 USD/mo — multi-seat, SLA, advanced efemérides, dedicated onboarding
- Pricing notes: ofrecer 14-day trial for Pro and 30-day trial for SaaS; academic and therapist discounts.

7) Priorización basada en valor por segmento
- Astrólogos profesionales (High-value):
  - Priority: efemérides de alta precisión, sinastría detallada, progresiones, import/export standard, templates personalizables.
- Terapeutas / Consultores (Value & Privacy focused):
  - Priority: informes rápidos, plantillas PDF, privacidad local (Desktop), oráculo y guías breves para intervención, facilidad de uso.
- Consultorios / Estudio (Enterprise buyers):
  - Priority: Multi-user, backups, calendar/alerts, invoicing, API, support SLA.

Roadmap de lanzamiento y monetización (12 meses)
- 0-2 meses: Polish 1.0 Desktop — bug fixes (timezone, DST), installer, basic docs, freemium release.
- 2-4 meses: Develop Pro Desktop features (sinastría, tránsitos, revoluciones), pricing & licensing system.
- 4-6 meses: Launch Pro Desktop, start paid users, gather feedback & testimonials.
- 6-9 months: Build SaaS core: auth, multi-tenant, efemérides central, backups.
- 9-12 months: Beta Premium Cloud, pilot customers (studios), integrate billing & SLA.

KPIs a medir
- MRR, churn, trial->paid conversion, DAU/MAU, average revenue per user (ARPU) by tier, time-to-first-report.

Recomendaciones comerciales
- Enfocar el primer año en Desktop Pro: menor infraestructura, alto margen, rápido time-to-market.
- Usar Pro customers como evangelists para SaaS pilot.
- Crear materiales (sample reports, case studies) y partnerships con escuelas/terapeutas.

---
Generado por: asistente AI usando Copilot CLI runtime en VS Code.
