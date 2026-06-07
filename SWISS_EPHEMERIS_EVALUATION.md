SWISS EPHEMERIS INTEGRATION EVALUATION
=======================================

Resumen
------
Evaluación de opciones para integrar efemérides profesionales (Quirón y cuerpos menores) en AstroIntegra Desktop (React + Vite + TypeScript). Se consideran: swisseph (Node bindings), swisseph-v2 (fork), bindings alternativos (WASM ports), y servicio Python local (pyswisseph).

Opciones analizadas
-------------------
1) swisseph (npm native binding)
- Técnica: Node native binding a la librería C (libswisseph).
- macOS Apple Silicon: funciona pero suele requerir compilar libse y usar node-gyp; problemas comunes con toolchain (Xcode, brew) y compatibilidad con M1/M2; prebuilds pueden no estar disponibles.
- Windows: requiere Visual Studio Build Tools; empaquetado incrementa complejidad.
- Tauri: posible, pero hay que empaquetar la librería nativa para cada plataforma/arch; aumenta tamaño y complejidad del instalador.
- Mantenimiento: paquete npm históricamente con actualizaciones esporádicas; depende de mantener binarios o compilar en CI.
- Precisión: excelente (misma que Swiss Ephemeris).

2) swisseph-v2 / forks con prebuilds
- Técnica: forks que intentan ofrecer precompilados o mejoras de build.
- Compatibilidad: mejor si incluyen prebuilds para ARM64; aún es necesario verificar integridad y soporte.
- Riesgo: depender de forks introduce riesgo de mantenimiento a largo plazo.

3) WASM / JS ports (recomendado si disponible)
- Técnica: Swiss Ephemeris compilado a WebAssembly (swe-wasm / swejs / swisseph-wasm). Corre en navegador/renderer/Node via WASM runtime.
- macOS Apple Silicon & Windows: compatibles (WASM es portable); no need de toolchain nativa. Excelente para Tauri (funciona en renderer o Rust side con WASM runtimes).
- Empaquetado: simple (solo binarios WASM + wrappers TS), distribuible sin dependencias nativas. Tamaño razonable, se puede caché.
- Mantenimiento: depende del port — verificar proyecto, pero tendencia a ser más simple de mantener que builds nativas.
- Precisión: puede ser exactamente la misma si port compila la librería oficial; validar build.

4) Servicio local Python (pyswisseph)
- Técnica: ejecutar un microservicio local (HTTP/Unix socket) que usa pyswisseph (bindings Python a libse). App llama al servicio para obtener efemérides.
- macOS Apple Silicon & Windows: funciona si empaquetas Python embebido o instalador; aumenta footprint (Python runtime + librería nativa).
- Tauri: empaquetable, pero aumenta complejidad del instalador y requisitos de permisos.
- Mantenimiento: pyswisseph es mantenido; bundling y actualizaciones requieren trabajo adicional.
- Precisión: excelente (Swiss Ephemeris), offline disponible.

Criterios de decisión
---------------------
- Precisión: todas las opciones que usan libswisseph (nativa o portada a WASM) entregan la precisión requerida.
- Portabilidad y empaquetado: WASM gana (no requiere compilación nativa ni toolchains). Python service penaliza por tamaño y complejidad.
- Desarrollo y CI: Node native bindings complican CI por necesidad de cross-builds o prebuilds; WASM simplifies CI.
- Tauri readiness: WASM integrates smoothly into renderer; native bindings require bundling per platform or invoking external service.

Recomendación única (para AstroIntegra Desktop)
-----------------------------------------------
Primaria (recomendada): Integrar Swiss Ephemeris mediante un port WebAssembly ("swisseph-wasm" / "swejs") si existe un proyecto maduro y verificable. Razones:
- Cross-platform (macOS Apple Silicon, Windows) sin compilar nativo.
- Fácil empaquetado con Tauri (incluir WASM + TS wrapper).
- Mantiene precisión profesional si el WASM build procede de la librería oficial.
- Simplifica CI/CD y distribución.

Fallback (si no existe un WASM port maduro): Utilizar un servicio Python embebible con pyswisseph como backend local, empaquetado durante el instalador (solo para Pro/Premium builds). Razones:
- Garantiza precisión (libswisseph oficial).
- Permite operación offline.
- Trade-off: mayor tamaño y complejidad de instalación.

Acciones recomendadas siguientes
-------------------------------
1. Buscar y evaluar proyectos WASM existentes (swejs, swisseph-wasm). Validar licencia, última actualización, y tests de precisión (compare con libse).
2. Si WASM viable: integrar wrapper TS, añadir tests de validación (CHIRON tests, muestras contra Swiss Ephemeris), agregar a CI y empaquetado Tauri.
3. Si WASM no viable: implementar PoC de servicio local con pyswisseph; crear instalador que incluya Python runtime y libse precompilada para cada plataforma.
4. Documentar y medir tamaño del binario final y procedimientos de actualización de efemérides.

Notas finales
-------------
- Evitar Node native bindings unless prebuilt binaries and ARM64 support are guaranteed across CI and target platforms.
- Priorizar una solución que permita validaciones automáticas (regression tests) y caché de efemérides para rendimiento.

Fecha de análisis: 2026-06-06T20:38:50-06:00
