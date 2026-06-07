# BUGS & POTENTIAL ISSUES — AstroAnima

Fecha: 2026-06-06T19:48:06-06:00

1) Errores potenciales detectados
- Timezone handling: Se crea Date UTC restando timezoneOffset horas; uso de timezoneOffset entero y redondeos puede introducir errores en zonas con offsets no enteros (p.ej. +5:30). BigDataCloud fallback redondea.
- DST: No hay manejo explícito de horario de verano (DST) por IANA; resultados pueden desviarse varias horas en fechas límite.
- Quirón: Implementación por aproximación orbital puede diferir de efemérides de referencia (ephemeris) por varios grados.
- isRetrograde: Método usa paso de +/-24h; para cuerpos con movimiento lento (Plutón/Quirón) puede fallar alrededor de estaciones de retrogradación.

2) Código incompleto / risky patterns
- Manejo de errores en llamadas fetch (geocoding) devuelve null silenciosamente; UI notifica, pero fallas de red no diferenciadas.
- Dexie: actualizaciones asíncronas sin transacción en saveConsultant (posible inconsistencia si se extiende schema).

3) Dependencias riesgosas
- astronomy-engine: dependencia central; cambios de API o versiones mayores pueden romper cálculos.
- BigDataCloud / Nominatim: servicios externos sin SLA; uso directo en UI sin cache ni rate-limit puede generar fallos.

4) Posibles bugs UI
- Inputs de fecha/hora: no validación robusta para formatos locales.
- PDF: uso de jsPDF en hilo principal puede bloquear UI para informes largos.


Recomendación inmediata: añadir validaciones de timezone (soporte para offsets no enteros y IANA), pruebas automáticas para calcular ejemplos conocidos y comparar con efemérides de referencia.