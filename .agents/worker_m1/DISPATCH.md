## 2026-08-20T04:46:15Z

You are the Test Suite Writer for Milestone 1 (E2E Testing Infrastructure & Suite) of the Emergency Tri-Screen Multi-Device Simulator project.

Read the following documents:
- c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md
- c:\DevWork\Depredador\Flujoweb\PROJECT.md
- c:\DevWork\Depredador\Flujoweb\TEST_INFRA.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_survey_3\handoff.md

Your exclusive write ownership:
- `tests/tri_screen_e2e_suite.js`
- `TEST_READY.md`

Your tasks:
1. Build `tests/tri_screen_e2e_suite.js` using Node 24 native WebSocket and fetch to communicate directly with headless Chrome/Edge via Chrome DevTools Protocol (`--headless=new`, `--remote-debugging-port`), without external npm packages.
2. Implement comprehensive test suites across 4 Tiers:
   - Tier 1: Feature Coverage (Phone A triggers, channels, 60fps canvas, particles moving, smoke/hazard propagation, Phone B strobe/voice, Phone C stairwells, Phone D headcount, Portal cards)
   - Tier 2: Boundary & Corner Cases (rapid triggers, resizing 360px-4K, zero/max occupants, mid-flight reset, headless audio mute safety, anti-collision scrollWidth <= clientWidth)
   - Tier 3: Cross-Feature Combinations (hazard + exit reroute + safe check-in, broadcast channel switch + severity, brigade stairwell blockage + BLE proximity)
   - Tier 4: Real-World Scenarios (Full evacuation drill Variant A, Variant B seismic bottleneck drill, Variant C BLE triage drill, Portal launch drill)
3. Support CLI flags: `--tier=1`, `--tier=2`, `--tier=3`, `--tier=4`, `--system=a/b/c/portal`, or run all tests by default.
4. Verify execution of `node tests/tri_screen_e2e_suite.js` and write `TEST_READY.md` documenting runner command and coverage summary.
