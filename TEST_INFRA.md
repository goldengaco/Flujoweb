# E2E Test Infra: Emergency Tri-Screen Multi-Device Simulator

## Test Philosophy
- Opaque-box, requirement-driven, zero-dependency browser automation using Node 24 native WebSocket CDP client against headless Chrome/Edge.
- Systematic 4-Tier verification: Category-Partition (Tier 1), Boundary Value & Corner Cases (Tier 2), Cross-Feature Combinations (Tier 3), Real-World Emergency Drills (Tier 4).
- Anti-collision layout inspection across 5 standard viewports (360px, 768px, 1280px, 1920px, 3840px).
- Zero console errors / uncaught exceptions policy.

---

## Feature Inventory & Tier Mapping
| # | Feature | Source | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|--------|:------:|:------:|:------:|:------:|
| 1 | Phone A Emergency Trigger & Channels | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | Center 2D Blueprint Particle Pathfinding | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 3 | Dynamic Hazard Rerouting (Breakroom/Server) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 4 | Recipient Phones B, C, D Multi-Device Sync | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 5 | Clean Minimalist Linear Dark Simulator | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 6 | CAD Velocity Stream & Bottleneck Heatmap | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 7 | Floating Cards & Live Escape Compass | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 8 | 2.5D Isometric Floorplan & 3D Extrusions | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 9 | Tactical Tablet & Incident Level Dials | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 10 | BLE Beacon Telemetry & Survivor Tally | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 11 | Master Portal Registration & Visualizers | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |

---

## Test Architecture
- **Runner**: `tests/tri_screen_e2e_suite.js` (executable via `node tests/tri_screen_e2e_suite.js`)
- **Auxiliary Checks**: `tests/test_layout_anticollision.js` (5 viewports check)
- **Protocol**: Chrome DevTools Protocol (CDP) via headless Chrome (`--headless=new`)
- **Pass Semantics**: All test assertions pass, 0 console errors, 0 uncaught exceptions, exit code 0.

---

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥55 test cases across the 3 variants and portal (verifying each feature in isolation).
- **Tier 2 (Boundary & Corner)**: ≥55 test cases (rapid triggers, viewport resizing 360px-4K, 0/100 occupants, reset during evacuation, muted audio, anti-collision).
- **Tier 3 (Cross-Feature Combinations)**: ≥15 pairwise combination tests (hazard injection + alternate exit + safe check-in, broadcast channel switch + severity, stairwell blockage + BLE proximity).
- **Tier 4 (Real-World Drills)**: ≥4 full end-to-end evacuation scenarios (Variant A full office drill, Variant B seismic bottleneck drill, Variant C BLE triage drill, Portal lifecycle drill).
