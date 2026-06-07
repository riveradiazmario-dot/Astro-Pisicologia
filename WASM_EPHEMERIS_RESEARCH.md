WASM EPHEMERIS RESEARCH
========================

Goal
----
Investigate WebAssembly ports of Swiss Ephemeris and rank options for integration into AstroIntegra Desktop (React + Vite + TypeScript + Tauri readiness). Provide one recommended solution and fallback.

Method
------
Searched public GitHub repositories and npm/crate indicators for: "swisseph-wasm", "swejs", "SwissEphemerisWASM", and related projects. Collected README/package metadata where available.

Candidates found (short)
------------------------
1) fusionstrings/swisseph-wasm
- Summary: Rust-based WASM build wrapping Swiss Ephemeris (claims full C library v2.10.03). Provides TS types, Node/browser entrypoints, CI badges and benchmarks.
- Observations: Active CI; npm/crate packaging; appears modern and isomorphic. Precise (wraps libse) per README.
- License: Not reliably fetched (verify in repo).
- Suitability: High if license is permissive (MIT/Apache) or compatible with project.

2) prolaxu/swisseph-wasm
- Summary: JS wrapper with embedded WASM + tests, docs, examples and CDN demo. Quick start for Vite/React provided.
- Observations: Comprehensive examples and explicit Vite guidance; package.json shows license: GPL-3.0-or-later.
- License: GPL-3.0-or-later (restrictive for closed-source commercial builds).
- Suitability: Technically excellent and very easy to integrate; legal constraints may prevent use for closed-source commercial distribution without relicensing or compliance.

3) Jthora/SwissEphemerisWASM and other forks
- Summary: Several repos claim Swiss Ephemeris compiled to WASM with React examples and Vite configs.
- Observations: Varying maturity; some include ephemeris download tooling and larger demos. License/maintenance varies per fork.

4) Smaller/experimental ports ("swejs", "swisseph_wasm", community forks)
- Summary: Multiple small projects exist; some provide quick demos but lack tests or maintenance.
- Observations: Useful for prototyping but not for production without audit.

Evaluation criteria
-------------------
- Precision: All options that compile official libswisseph to WASM should match Swiss Ephemeris C precision (subject to build configuration). Verify by tests.
- Maintenance & activity: Prefer projects with CI, tests, recent commits, and issue/PR activity.
- License: Critical. GPL-based projects (e.g., prolaxu) impose copyleft that impacts distribution; permissive licenses (MIT/Apache) are preferred for commercial desktop app.
- Compatibility: WASM ports are inherently cross-platform (macOS ARM, Windows) and integrate well with Vite and Tauri as renderer-side modules. Watch for .wasm asset handling in Vite config and Tauri static bundling.
- Packaging: WASM reduces native binding complexity and simplifies Tauri packaging vs native node-gyp modules.

Ranking (recommendation)
------------------------
1. fusionstrings/swisseph-wasm — Top candidate (if license is permissive)
   - Rationale: Rust-based, CI, TypeScript support, appears actively maintained and optimized for browser/node. Best trade-off: precision + portability + packaging.
2. Jthora/SwissEphemerisWASM — Strong candidate
   - Rationale: Explicit React + Vite examples, download tooling; verify license & activity.
3. prolaxu/swisseph-wasm — Good technical fit but license-limited
   - Rationale: Well-documented and feature-complete, but GPL-3 license blocks proprietary distribution without compliance.
4. Smaller forks/experimental ports — Use only for prototyping

Single recommended solution
--------------------------
- Primary recommendation: Adopt fusionstrings/swisseph-wasm (or equivalent WASM project with permissive license) AFTER verifying the repository license and running precision regression tests (compare Chiron across sample dates vs Swiss Ephemeris C).

Fallback (if no permissive WASM port is acceptable)
---------------------------------------------------
- Use a bundled local service with pyswisseph (Python + libse) for Pro/Premium editions. Rationale: guarantees official Swiss Ephemeris C precision and clear license handling (pyswisseph typically wraps libse under its license). Trade-offs: larger installer and more complex packaging for macOS/Windows/Apple Silicon.

Verification checklist before integration
----------------------------------------
1. Confirm license of chosen WASM project (must be compatible with distribution plan). If GPL, either obtain dual-license or avoid for closed-source builds.
2. Run an authoritative precision test suite: compare chosen WASM against libse (native) on 200+ sample dates for Chiron and other small bodies; target ≤0.1°.
3. Test initialization & binary size impact in Vite and Tauri builds; ensure .wasm assets load in renderer and in packaged app.
4. Add CI that runs the precision tests and publishes WASM artifact versions used in releases.

Conclusion
----------
WASM ports are the preferred integration path for AstroIntegra Desktop because they provide libswisseph precision with cross-platform packaging simplicity. fusionstrings/swisseph-wasm is the top candidate pending license verification. If no permissive WASM port is acceptable, implement pyswisseph as a bundled local service for Pro/Premium builds.

Next step (recommended): authorize a quick PoC to clone fusionstrings/swisseph-wasm, verify license file, run their test suite, and execute the CHIRON validation against the WASM to confirm parity.