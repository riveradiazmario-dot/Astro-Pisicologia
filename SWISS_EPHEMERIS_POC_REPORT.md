SWISS EPHEMERIS PoC REPORT (initial)
====================================

Branch: research/swiss-ephemeris-poc
Created: PoC workspace and plan

Objective
---------
Validate viability of integrating Swiss Ephemeris via WebAssembly into AstroIntegra Desktop (React + Vite + TypeScript + Tauri).

Scope (PoC)
-----------
- Clone top candidate repo (fusionstrings/swisseph-wasm). If unavailable, try next-ranked (Jthora/SwissEphemerisWASM, prolaxu/swisseph-wasm).
- Build WASM (or use provided prebuilt wasm), run library tests, and run a comparision script that computes authoritative positions for small bodies.
- Compare Chiron, North Node, South Node, and Lilith (if available) vs current engine implementation for 200 sample dates.
- Measure added bundle size, init time, memory, and integration complexity.

Environment Requirements
------------------------
- Node 18+ and npm/pnpm (for JS wrappers)
- Rust + wasm32-unknown-unknown toolchain (if building Rust-based WASM)
- Emscripten (only if repo uses emscripten-based build)
- CI runner with Linux/macOS/Windows matrix for cross-arch tests

PoC Steps (detailed)
--------------------
1. Clone repository (fusionstrings/swisseph-wasm).
2. Inspect LICENSE file and confirm compatibility (prefer MIT/Apache). If GPL, flag legal constraints.
3. Run `npm install` (or deno/pnpm as per project). Run test suite.
4. Build WASM artifact (npm run build or cargo build --target wasm32-unknown-unknown).
5. Create an isolated PoC inside this repo under /pocs/swisseph-wasm/ that imports WASM (no changes to main app).
6. Implement small Node/Vite runner that: loads WASM, computes swe_julday + swe_calc_ut for sample JD list, extracts longitudes for CHIRON, MOON_NODE (SE_MEAN_NODE / SE_TRUE_NODE), and mean/lilith if available.
7. Run comparison: current engine getChironLongitude vs WASM output; compute abs diffs (deg). Gather stats: max/min/avg.
8. Measure size: `du -sh` of wasm + JS glue, and build bundle impact (vite build with PoC import toggled on/off).
9. Measure init time: average time to init WASM (100 cold inits) and call latency per calc.
10. Document results in SWISS_EPHEMERIS_POC_REPORT.md and attach CSVs.

Acceptance Criteria
-------------------
- License compatible for target distribution (non-GPL for closed-source; GPL-only allowed only if project accepts copyleft).
- Precision: Chiron differences <= 0.5° (goal <=0.1°) vs Swiss Ephemeris C reference.
- Build: WASM integrates with Vite and Tauri without native toolchain at runtime (only at build time).
- Size & perf acceptable: wasm + glue <= 30MB (target), init < 500ms, per-call <5ms for batch calls.

Measurements to record
----------------------
- Precision stats (max/min/avg) for Chiron/Nodes/Lilith over 200 dates.
- Binary size (wasm + glue) and compressed size for packaged Tauri app.
- Init time (cold) and per-call latency.
- Developer effort estimate (days) to integrate and CI to maintain.

Constraints & Current Environment Note
-------------------------------------
- The analysis environment may not have npm or Rust toolchains installed (previous npm not found). Full PoC build must be executed in a runner or developer machine with required toolchain, or CI.

Initial recommendation (quick)
------------------------------
- Proceed with PoC using fusionstrings/swisseph-wasm as first candidate. If license is incompatible or build fails, try Jthora/SwissEphemerisWASM.

Next actions (requires your approval)
------------------------------------
A) Authorize PoC run here (will attempt `npm install` and build). Note: may fail due to missing toolchain; I will report exact failures and remediation steps. Estimated wall time: 2–6 hours (setup + builds + tests) depending on toolchain.

B) Prefer to run PoC in CI (recommended) — configure GitHub Actions matrix (linux, macos-latest, windows-latest) and run build/tests there. Estimated setup: 1–2 days including caching.

C) Postpone PoC and accept the documented recommendation (WASM candidate) and implement pyswisseph fallback for Pro builds.


