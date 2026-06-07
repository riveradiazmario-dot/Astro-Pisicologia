# ARCHITECTURE — AstroAnima (Astro-Psicología)

Fecha: 2026-06-06T19:33:55-06:00

Resumen
-------
Aplicación SPA React + Vite + TypeScript para generación de cartas natales y reportes de interpretación simbólica (astrología psicológica). Local-first: cálculos locales (astronomy-engine + aproximaciones propias) y persistencia en IndexedDB (Dexie). Exporta PDF con jsPDF.

Tech stack
----------
- Framework: React 19 (TSX)
- Bundler: Vite 7
- Language: TypeScript 5.x (strict)
- Styling: TailwindCSS
- Astronomy: astronomy-engine (npm)
- Persistence: Dexie (IndexedDB)
- PDF: jsPDF + html2canvas
- Utilities: clsx, tailwind-merge, lucide-react

Project layout (root)
---------------------
- index.html — app host, loads /src/main.tsx
- package.json, vite.config.ts, tsconfig.json — build & type config
- ARCHITECTURE.md — este archivo

src/ (application source)
--------------------------
- main.tsx — React entry; mounts <App />
- index.css — global Tailwind styles
- App.tsx — aplicación principal: vista/estado, navegación y flujo alto (calcular → interpretar → guardar → ver/expotar).

src/astronomy/
- engine.ts — Motor astronómico principal
  - Usa astronomy-engine para posiciones planetarias (Sol, Luna, Mercurio… Plutón)
  - Implementa Quirón por aproximación orbital propia
  - Calcula LST / Ascendente / MC y cúspides tipo Placidus (interpolación semi-arco)
  - Detecta aspectos (conjunción/oposición/trígono/cuadratura/sextil) con orbes
  - Estado: Implementado y probado manualmente; gómez/precisión razonable; edge-cases (zona horaria, DST) cubiertos con fallback de geocodificación

- types.ts — Tipos TS centrales (BirthData, PlanetPosition, NatalChart, AspectData, constants)
  - Estado: completo y estricto (strict TS)

src/interpretation-engine/
- interpreter.ts — Generador interpretativo
  - Motor rule-based: combina plantillas, reglas y tablas simbólicas (symbolic-data)
  - Produce FullInterpretation (secciones: rasgos, necesidades, heridas, miedos, dinámicas, patrones, fortalezas)
  - Incluye oráculo simbólico (queryOracle) que busca temas y sugiere intervenciones
  - Estado: Implementado en profundidad; depende de tablas de contenido para riqueza textual

- symbolic-data.ts — Diccionarios y reglas (arquetipos por planeta/signo, significados de casas, reglas de aspectos)
  - Estado: implementado; ampliable con más reglas y textos

src/storage/
- db.ts — Dexie schema + CRUD
  - Tablas: consultants (++id), config (id)
  - Funciones: saveConsultant, getConsultant, getAllConsultants, searchConsultants, saveTherapistConfig, getTherapistConfig
  - Estado: Implementado; manejo de errores básico; podría mejorar con transacciones y validaciones

src/components/
- Sidebar.tsx — navegación principal
- BirthDataForm.tsx — formulario de ingreso (geocoding, coords manuales, timezone select)
- ReportView.tsx — vista compuesta: ChartWheel, ChartTable, InterpretationView, export PDF
- ConsultantsList.tsx — CRUD/listado local de consultantes
- OracleView.tsx — interfaz del oráculo simbólico
- ChartWheel, ChartTable, InterpretationView, ConfigView — UI auxiliares
- Estado: UI completo y funcional; UX sólido; accesibilidad y pruebas unitarias faltantes

src/pdf/
- export.ts — generación de PDF con jsPDF (portada, posiciones, casas, aspectos, secciones interpretativas, nota ética)
  - Estado: Implementado; formateo básico y limpieza de markdown

src/utils/
- Utilidades varias (pequeñas funciones compartidas)

Integración y flujo de datos
---------------------------
1. Usuario ingresa BirthData (form). Opcional: geocodeCity() usa Nominatim y BigDataCloud con timeout y fallback de longitud → timezone offset estimado.
2. App.tsx llama calculateNatalChart(birthData, orb) (astronomy/engine)
3. Resultado (NatalChart) → generateFullInterpretation(chart) (interpretation-engine)
4. Resultado mostrado en ReportView; se guarda con saveConsultant en Dexie
5. Exportar: generatePDF(chart, interpretation, therapistConfig)
6. Oráculo: queryOracle(chart, question) usa tablas simbólicas locales

Current implementation status
-----------------------------
- Core features: implemented and integrated (calculation, interpretation, persistence, PDF export). ✅
- Edge-case handling: reasonable fallbacks for geocoding/timezone; Quirón approximated (not ephemeris-grade). ⚠️
- Missing/Improvable:
  - Unit and integration tests (none present)
  - CI (GitHub Actions) and linting scripts
  - Accessibility (a11y) audits and keyboard navigation coverage
  - Internationalization (app text in Spanish; locale handling for dates exists minimally)
  - More robust timezone/DST handling (consider timezone APIs or IANA mapping)
  - Performance: large PDF generation and heavy astronomy calls may block main thread — consider WebWorker

Security & Privacy
------------------
- Data stays local (IndexedDB). No remote telemetry by default.
- Geocoding uses public APIs (Nominatim, BigDataCloud) — user consent and network availability required.
- Recommendation: add privacy notice, opt-in for any remote calls, and exclude PHI from external services.

Suggested next steps (high priority)
-----------------------------------
1. Add automated tests for engine.calculateNatalChart and interpreter outputs (snapshot + property tests).
2. Add CI pipeline: install, build, lint, run tests, and basic static analysis.
3. Move heavy astronomy calculations to a WebWorker to avoid UI jank.
4. Add integration tests for Dexie persistence (use indexeddbshim in CI) and PDF generation smoke tests.
5. Improve timezone accuracy: integrate with `luxon` + IANA tz DB or use paid timezone API as an option.
6. Add LICENSE and CONTRIBUTING.md; add code of conduct if public.

How to run locally
------------------
- npm install
- npm run dev
- Open http://localhost:5173

Notes about repository state
---------------------------
- Repo created and initial push performed; some files were previously uploaded with placeholders but these were replaced. Remote: https://github.com/riveradiazmario-dot/Astro-Pisicologia

Contacto
--------
Para cambios mayores (migraciones de schema, integración de CI), abrir issues en el repo y seguir checklist propuesto.

---
Generado por: asistente AI usando Copilot CLI runtime en VS Code.
