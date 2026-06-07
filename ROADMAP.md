# ROADMAP — AstroAnima

Fecha: 2026-06-06T19:48:06-06:00

1) Funcionalidades implementadas
- Cálculo de carta natal (planetas: Sol, Luna, Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno, Plutón) usando astronomy-engine.
- Cálculo aproximado de Quirón.
- Cálculo de Ascendente, Medio Cielo y cúspides tipo Placidus (interpolación semi-arco).
- Detección de aspectos primarios (conjunción, oposición, trígono, cuadratura, sextil) con orbes configurables.
- Motor interpretativo rule-based (generación de secciones, oráculo simbólico local).
- Persistencia local con Dexie (IndexedDB) para consultantes y configuración del terapeuta.
- Exportación de informe a PDF con jsPDF.
- Interfaz básica: crear consultante, ver informe, oráculo, lista de consultantes, configuración.

2) Funcionalidades parcialmente implementadas
- Geocodificación y detección de zona horaria: Nominatim + BigDataCloud con fallback estimado por longitud (funciona pero precisión variable).
- PDF: formato y secciones completas; optimización de layout y recursos (imágenes, fuentes) parcialmente trabajada.
- Interpretación: motor y reglas presentes; cobertura de textos y reglas ampliable.

3) Funcionalidades faltantes (lista alta nivel)
- Tránsitos, Revolución Solar, Sinastría, Progresiones, Retornos (Lunar, Solar), Carta Dracónica.
- Herramientas de comparación (sinastría/compósito) y timelines.
- Calculadora de efemérides avanzada y precisión para cuerpos menores.
- WebWorker para cálculos pesados.
- Internacionalización, tests y CI.

4) Prioridades (Alta/Media/Baja)
- Alta: Tránsitos, Sinastría, Tests automáticos, CI, WebWorker, timezone/IANA accuracy, correcciones de calculo Quirón.
- Media: Revolución Solar, Progresiones, PDF optimizado, accesibilidad, exportes (CSV), mejores textos interpretativos.
- Baja: Astrogenealogía, Astrología Esotérica, tematización UI, plantillas profesionales impresas.

5) Estimación de esfuerzo por ítem (very rough)
- Tránsitos: 3-5 días (dev + tests)
- Sinastría: 4-7 días
- Revolución Solar: 2-3 días
- Progresiones: 3-5 días
- WebWorker refactor: 1-2 días
- CI + Tests: 1-2 días
- IANA timezone integration: 1-3 días


> Nota: estimaciones para 1 desarrollador experimentado en JS/astronomía (sin bloqueos externos).