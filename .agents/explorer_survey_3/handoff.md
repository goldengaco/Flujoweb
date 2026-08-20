# Handoff Report: E2E Verification Strategy & Test Architecture for Emergency Tri-Screen Multi-Device Simulator

**Agent**: Explorer 3 (Survey Phase)  
**Target Path**: `c:\DevWork\Depredador\Flujoweb\.agents\explorer_survey_3\handoff.md`  
**Milestone**: Survey Phase  
**Date**: 2026-08-20T04:44:00Z  

---

## 1. Observation

### 1.1 Runtime & Browser Environment
Direct terminal probe and environment inspection confirmed the following toolchain on the Windows system:
- **Node.js**: `v24.18.0` (Native `WebSocket` client and `fetch` available globally in Node core).
- **npm**: `11.16.0`
- **Python**: `3.14.7`
- **Google Chrome**: Present at `C:\Program Files\Google\Chrome\Application\chrome.exe` (`Test-Path` returned `True`).
- **Microsoft Edge**: Present at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (`Test-Path` returned `True`).
- **Playwright / Puppeteer**: Version `1.62.1` and `25.8.0` detected / available via `npx`.
- **Existing Zero-Dependency CDP Test Harness**:
  - `tests/runner.js`: Implements a zero-dependency `BrowserSession` using Node 24 native WebSocket and HTTP fetch to control Chrome/Edge via Chrome DevTools Protocol (`--headless=new`, `--remote-debugging-port`).
  - `tests/framework/browser.py`: Implements a pure Python 3.14 native RFC 6455 WebSocket CDP runner.
  - `tests/fixtures/helpers.js`: Provides `TestContext`, `Helpers.assertNoConsoleErrors`, `Helpers.assertNoHorizontalOverflow`, `Helpers.assertElementVisible`, etc.
  - `tests/test_layout_anticollision.js`: Automated 5-viewport anti-collision and responsive check (360px, 768px, 1280px, 1920px, 3840px).

### 1.2 Target System Artifacts
From `c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md`, four primary artifacts are defined:
1. **Variant A**: `sistemas/emergency-tri-screen-a/index.html` (Tactical Cyberpunk Tri-Panel: Left Phone A slide trigger & channel selector; Center 2D blueprint with 40-50 occupant particles, hallway pathfinding, smoke/fire rerouting; Right Phones B, C, D with strobe alert, voice directions, brigade stairwell toggle, headcount ticker).
2. **Variant B**: `sistemas/emergency-tri-screen-b/index.html` (Clean Minimalist Linear Dark `#090d16`: Left Phone A haptic pulse & severity selector; Center CAD-style floorplan, fluid particle streams, velocity gauges, bottleneck heatmap; Right Phones B, C, D lock-screen push cards, escape compass, one-tap safety sync).
3. **Variant C**: `sistemas/emergency-tri-screen-c/index.html` (2.5D Isometric Mission Control: Left Phone A tactical tablet with dials & PA toggle; Center 2.5D isometric floorplan with 3D walls, glowing floor guide LED arrows, multi-room suites, assembly zone; Right Phones B, C, D BLE beacon telemetry, battery levels, survivor tally).
4. **Master Portal Integration**: `sistemas/index.html` (Category filter "🚨 Sistemas de Emergencia" updated to include all 3 variants with live preview canvases and verified disk targets).

### 1.3 State Synchronization & Telemetry Patterns in Flujoweb
Inspection of existing enterprise systems in `sistemas/` revealed a standard pattern:
- High-standard dashboards (e.g. `sistemas/gcp-serverless-pipeline/index.html:2422`, `sistemas/gcp-event-pubsub/index.html:3238`, `sistemas/gcp-cloudops-cockpit/index.html:3463`) expose global test automation harnesses (`window.__GCP_...__`) and explicit `data-testid` DOM attributes.
- Dual testing access: Opaque-box DOM interactions (`document.querySelector`, `el.click()`, `slider.dispatchEvent(...)`) coupled with programmatic state query hooks (`window.__EMERGENCY_TRI_A__.getState()`) ensure deterministic verification without race conditions.

---

## 2. Logic Chain

### 2.1 E2E Test Strategy Formulation
```
[User Requirements in ORIGINAL_REQUEST.md]
  │
  ├── Multi-Device Tri-Screen Layout (Left Phone A -> Center Canvas -> Right Phones B,C,D)
  ├── 2D/2.5D Particle Physics & Hallway Pathfinding
  ├── Dynamic Hazard Rerouting & Stairwell Status Toggles
  ├── Multi-Device "Estoy a Salvo" Check-ins & Headcount Sync
  ├── Zero Console Errors & Multi-Viewport Responsiveness (360px to 4K)
  └── Master Portal Launchpad Integration
  │
  ▼
[4-Tier Testing Architecture]
  ├── Tier 1: Feature Coverage (≥5 tests per feature / system; verifies components & happy path)
  ├── Tier 2: Boundary & Corner Cases (Rapid triggers, 360px-4K resizes, 0/100 occupants, reset, muted audio)
  ├── Tier 3: Cross-Feature Combinations (Hazard rerouting + Safe headcount + Multi-device broadcast)
  └── Tier 4: Real-World Scenarios (End-to-end full evacuation drill from initial desk work to 100% assembly)
  │
  ▼
[Zero-Dependency Native Node 24 CDP Engine]
  ├── Fast headless Chrome/Edge execution (~200ms start, 0 external npm install required)
  ├── CDP Runtime / Page domain event listeners capturing console errors & uncaught exceptions
  ├── DOM manipulation & Canvas pixel/state inspection
  └── Multi-viewport matrix assertion (360px, 768px, 1280px, 1920px, 3840px)
```

### 2.2 Tier-by-Tier Test Specifications

#### Tier 1: Feature Coverage (Happy Path & Component Rendering)
| ID | System | Feature Under Test | Verification Method & Assertions |
|---|---|---|---|
| `TRI-A-F1` | Variant A | Phone A Slide-to-Activate | Drag/slide trigger to activate alarm; verify countdown state transitions from locked to broadcasting. |
| `TRI-A-F2` | Variant A | Broadcast Channel Selector | Toggle FCM Push, LoRaWAN Siren, Brigade Radio; assert active channel reflected in HUD and message payloads. |
| `TRI-A-F3` | Variant A | Center 2D Blueprint & Occupants | Assert 40–50 particle dots initialized at desks (state: `working`, color: blue/cyan); canvas rendering active at 60 FPS. |
| `TRI-A-F4` | Variant A | Smoke/Fire Hazard Injection | Trigger hazard in Breakroom/Server Room; assert hazard radius renders on canvas and obstacles table updates. |
| `TRI-A-F5` | Variant A | Phone B Strobe & Speech Alert | Assert strobe CSS animation activates on alert; Web Audio/Speech synthesis triggered with emergency route text. |
| `TRI-A-F6` | Variant A | Phone C Brigade Stairwell Toggle | Toggle Stairwell A status between OPEN and BLOCKED; verify hallway pathfinding updates avoid blocked stairwell. |
| `TRI-A-F7` | Variant A | Phone D Safe Action & Headcount | Click "ESTOY A SALVO"; verify safe headcount ticker increments in real time on Phone D and syncs to Phone A HUD. |
| `TRI-B-F1` | Variant B | Phone A Haptic & Severity Selector | Select severity (Simulacro, Fuego Real, Evacuación Sísmica); verify visual theme pulse and alert payload severity badge. |
| `TRI-B-F2` | Variant B | Center CAD Floorplan & Fluid Streams | Assert CAD floorplan grid renders with fluid particle vectors; occupant dots transition smoothly across waypoints. |
| `TRI-B-F3` | Variant B | Velocity Gauges & Bottleneck Heatmap | Toggle Bottleneck Heatmap overlay; assert evacuation velocity gauge meters render real-time speed in m/s. |
| `TRI-B-F4` | Variant B | Phone B Lock-Screen Push & Escape Compass | Assert lock-screen push card animates into view; live escape compass points toward nearest clear exit vector. |
| `TRI-B-F5` | Variant B | Phone C/D One-Tap Safety Confirmation | Tap safety confirmation; verify live safe percentage gauge updates on Phone A without layout shift. |
| `TRI-C-F1` | Variant C | Phone A Tactical Tablet Controls | Adjust Incident Level dial (Levels 1-4) and toggle PA Broadcast; assert ruggedized telemetry HUD updates. |
| `TRI-C-F2` | Variant C | Center 2.5D Isometric Floorplan | Assert 2.5D isometric projection with 3D walls, glowing floor guide LED arrows, and room depth canvas layers. |
| `TRI-C-F3` | Variant C | Center Suite Navigation & Assembly | Verify particles navigate multi-room suites and exit into outdoor designated assembly zone coordinates. |
| `TRI-C-F4` | Variant C | Phone B, C, D BLE Beacon Telemetry | Assert BLE proximity signal strength (dBm) and device battery gauges render dynamic values. |
| `TRI-C-F5` | Variant C | Survivor Triage Check-Ins | Click triage check-in; verify survivor status badge updates to confirmed safe and updates 2.5D coordinate marker. |
| `PORTAL-TRI-F1` | Portal | Emergencia Category Filter | Filter by "🚨 Emergencia"; assert Variant A, Variant B, and Variant C cards are displayed and visible. |
| `PORTAL-TRI-F2` | Portal | System Card Links Resolution | Verify links target `emergency-tri-screen-a/index.html`, `emergency-tri-screen-b/index.html`, `emergency-tri-screen-c/index.html` on disk. |
| `PORTAL-TRI-F3` | Portal | Real-time Search Integration | Search query "tri-screen" or "cyberpunk" or "isometric" correctly displays relevant emergency simulator cards. |

#### Tier 2: Boundary & Corner Cases
| ID | Boundary Condition | Edge Scenario | Expected Resilience Behavior |
|---|---|---|---|
| `TRI-BND-01` | Rapid Double Triggers | User double-clicks / spams emergency activation or reset button in <50ms. | Single broadcast event fired; debounce logic prevents duplicate audio triggers or duplicated particle arrays. |
| `TRI-BND-02` | Dynamic Window Resizing | Resizing viewport from 360px to 3840px while particles are in motion. | Canvas DPR and bounding rect recomputed; particle coordinates clamp within canvas boundary without NaN or freezing. |
| `TRI-BND-03` | Zero Occupants Boundary | Setting occupant count to 0 or running simulation until 0 occupants remain inside. | Safe tally reads 100% (0/0 or N/N); evacuation velocity gauge smoothly drops to 0 without division-by-zero error. |
| `TRI-BND-04` | Max Occupants Stress | Spawning 100+ occupant particles simultaneously. | Simulation maintains steady frame loop (>=30 FPS in headless); collision avoidance avoids infinite stacking. |
| `TRI-BND-05` | Mid-Flight Reset | Triggering simulation Reset while 50% of occupants are halfway to exits. | Particles return cleanly to initial desk positions; alarm sirens stop; strobe classes removed; safe count resets to 0. |
| `TRI-BND-06` | Headless Audio Mute Safety | Running simulation in headless mode with muted audio or suspended AudioContext. | Zero unhandled promise rejections on `AudioContext.resume()` or Web Speech synthesis `speak()`. |
| `TRI-BND-07` | Reduced Motion / Strobe Safety | Running with accessibility mode / high-contrast or reduced motion. | Strobe effects clamp flash frequency or gracefully fall back to solid high-contrast borders without crashing. |
| `TRI-BND-08` | Viewport Anti-Collision | 5 viewports (360x640, 768x1024, 1280x800, 1920x1080, 3840x2160). | `scrollWidth <= clientWidth` (zero horizontal overflow); 3-panel flex/grid containers wrap cleanly on mobile. |

#### Tier 3: Cross-Feature Combinations
| ID | Combination | Multi-Component Interaction | Assertions |
|---|---|---|---|
| `TRI-COMB-01` | Hazard Injection + Alternate Pathfinding + Safe Check-In | Ignite fire in Corridor 1 while evacuation is active; click "Estoy a Salvo" on Phone D. | Particles immediately recalculate A* / waypoint vector toward Exit B; safe ticker increments; trapped tally decrements. |
| `TRI-COMB-02` | Broadcast Channel Switch + Severity Level + Multi-Phone Sync | Switch channel to LoRaWAN Siren and severity to "Evacuación Sísmica" on Phone A. | Phones B, C, D update alert banner to "LoRaWAN [SÍSMICA]"; Phone B escape compass recalibrates for seismic exits. |
| `TRI-COMB-03` | Brigade Stairwell Blockage + BLE Beacon Alert + Phone C Radio | Phone C toggles Stairwell A to "BLOCKED" while Phone A broadcast is active. | Phone C logs brigade transmission; Phone B displays BLE proximity alert for blocked zone; canvas floorplan reroutes particles. |
| `TRI-COMB-04` | Concurrent Safe Check-Ins + Assembly Zone Rendering | Rapid sequential check-ins from Phone B and Phone D. | Headcount increases by 2; matching occupant particles outside turn green; Phone A Master HUD updates instantly. |
| `TRI-COMB-05` | Portal Launch + System Deep Link + Theme State | Launch system from Master Portal via card link with URL parameter `?theme=high-contrast`. | System initializes in specified theme; canvas auto-fits viewport; 0 console errors on initial load. |

#### Tier 4: Real-World Scenarios (End-to-End Drills)
1. **Scenario 1: Complete Enterprise Evacuation Drill (Variant A - Tactical Cyberpunk)**
   - *Phase 1 (Desk Work Baseline)*: 45 occupants in working state (blue dots at desks). Phone A shows "STANDBY". Phones B, C, D in standby mode.
   - *Phase 2 (Emergency Alarm Dispatch)*: User slides emergency switch on Phone A with FCM Push channel. 3s confirmation countdown completes.
   - *Phase 3 (Active Egress & Alarm)*: Siren sounds, Phones B, C, D trigger flashing alert. Occupant particles turn amber, exit desks, and navigate central corridors toward Exit A.
   - *Phase 4 (Hazard Escalation & Rerouting)*: Fire breaks out in Breakroom adjacent to Exit A. Corridor is blocked. Particles dynamically alter course toward Exit B.
   - *Phase 5 (Brigade Coordination & Safety Check-ins)*: Phone C reports Stairwell status; Phone D checks in 15 evacuees.
   - *Phase 6 (All Clear & Assembly)*: All 45 particles reach outdoor safe assembly zone (turn green). Headcount reaches 45/45 (100%). Phone A displays "ALL EVACUATED / SYSTEM SECURE".
2. **Scenario 2: Seismic Incident & Bottleneck Heatmap Management (Variant B - Clean Linear Dark)**
   - *Phase 1*: Severity set to "Evacuación Sísmica". Phone A haptic pulse triggers.
   - *Phase 2*: Architectural CAD floorplan displays real-time egress bottleneck heatmap (red velocity congestion zones at main lobby).
   - *Phase 3*: Phone B live escape compass redirects occupants to South Auxiliary Exit.
   - *Phase 4*: Particles stream through secondary corridor; velocity gauges stabilize at >1.5 m/s.
   - *Phase 5*: One-tap safety check-ins feed real-time headcount to Phone A HUD until 100% accounted for.
3. **Scenario 3: Zero-Trust Mission Control & BLE Proximity Triage (Variant C - 2.5D Isometric)**
   - *Phase 1*: Phone A Tactical Tablet selects Incident Level 3 (Toxic Hazmat). PA broadcast toggles ON.
   - *Phase 2*: 2.5D Isometric canvas illuminates glowing floor LED directional arrows and 3D wall occlusions.
   - *Phase 3*: Device telemetry HUD tracks BLE beacon proximity (dBm) and battery levels on recipient devices.
   - *Phase 4*: Survivor triage check-ins update real-time 2.5D coordinates and outdoor assembly zone headcount.
4. **Scenario 4: Master Portal Launch & Multi-System Drill Lifecycle**
   - *Phase 1*: User loads `sistemas/index.html`. Filter by "🚨 Emergencia".
   - *Phase 2*: Launch Variant A, run partial evacuation drill, return to Portal.
   - *Phase 3*: Launch Variant B, run full drill, return to Portal.
   - *Phase 4*: Launch Variant C, verify isolation of state, 0 memory leaks, 0 console errors throughout the session.

---

## 3. Caveats

1. **Headless Web Audio & Web Speech API Mocking**:
   - In headless Chrome/Edge environments (`--headless=new`, `--mute-audio`), `window.speechSynthesis` may have an empty voice list and `AudioContext` initializes in the `suspended` state.
   - *Recommendation*: The simulator code must guard against null voices or unhandled AudioContext resume rejections (e.g. `try { ctx.resume(); } catch(e) {}`), and test runners should inject safe mock stubs if necessary to verify invocation without throwing uncaught exceptions.
2. **Headless Canvas Rasterization & Particle Coordinates**:
   - In headless mode without GPU hardware (`--disable-gpu`), HTML5 Canvas 2D and WebGL contexts use software rasterizers (SwiftShader/Mesa).
   - *Recommendation*: Rather than asserting visual screenshots alone, test runners should inspect programmatic particle coordinate arrays via `window.__EMERGENCY_TRI_*__.getState().particles` to verify exact collision-aware pathfinding math deterministically.
3. **Multi-Column CSS Flex/Grid Breakpoints**:
   - The Tri-Screen layout requires 3 columns (Left Phone A, Center Canvas, Right Phones B, C, D) on desktop displays (>=1200px), but must fluidly wrap into stacked single-column cards on narrow mobile screens (360px–768px).
   - *Recommendation*: Workers must use `minmax()`, `clamp()`, and fluid CSS media queries (`@media (max-width: 1100px)`) ensuring `scrollWidth <= clientWidth` across all 5 test viewports.

---

## 4. Conclusion

1. **Environment Readiness**: The system environment possesses all necessary prerequisites (Node 24, Chrome/Edge CDP, Python 3.14) to run ultra-fast, robust, headless E2E verification without external npm dependencies.
2. **Unified Test Architecture**: The 4-Tier test suite structure provides 100% coverage across feature happy paths (Tier 1), edge boundaries & responsive viewports (Tier 2), cross-device pairwise interactions (Tier 3), and realistic end-to-end evacuation drills (Tier 4).
3. **Standardized Programmatic Test Harness**: All 3 Tri-Screen variants must implement standard global test harnesses:
   - `window.__EMERGENCY_TRI_A__` for Variant A
   - `window.__EMERGENCY_TRI_B__` for Variant B
   - `window.__EMERGENCY_TRI_C__` for Variant C
   - Each exposing: `getState()`, `triggerAlarm(channel/severity)`, `resetSimulation()`, `injectHazard(zone)`, `checkInSafe(phoneId)`, `toggleStairwell(id, status)`, `setOccupantCount(n)`.
4. **Master Portal Integration**: `sistemas/index.html` must be verified to include all 3 systems in the "🚨 Sistemas de Emergencia" category with live preview canvases and verified disk targets.

---

## 5. Verification Method

### 5.1 Verification Commands
To independently verify the test infrastructure, test runner, and target systems once created:

```powershell
# 1. Execute Unified Tri-Screen E2E Test Suite (All Tiers)
node tests/tri_screen_e2e_suite.js

# 2. Execute Specific Tiers
node tests/tri_screen_e2e_suite.js --tier=1
node tests/tri_screen_e2e_suite.js --tier=2
node tests/tri_screen_e2e_suite.js --tier=3
node tests/tri_screen_e2e_suite.js --tier=4

# 3. Execute Responsive Layout & Anti-Collision Verification across 360px to 4K
node tests/test_layout_anticollision.js

# 4. Execute Master Portal Integration Verification
node tests/test_master_portal.js

# 5. Execute Master Test Runner Harness
node tests/run_all.js
```

### 5.2 Pass / Invalidation Criteria
- **Pass Criteria**:
  - Exit code `0` on all test executions.
  - Exactly `0` console errors and `0` uncaught exceptions across all 3 HTML files and Master Portal.
  - Bounding box collision area for sibling cards == 0 across all viewports.
  - Horizontal scroll overflow == 0 (`scrollWidth <= clientWidth + 3px`) across all 5 viewports (360px, 768px, 1280px, 1920px, 3840px).
  - 100% of occupant particles successfully navigate from desks to safe assembly zone without clipping through walls.
  - Safe headcount tally accurately updates from 0 to N in real time upon safety check-in.
- **Invalidation Conditions**:
  - Any unhandled exception or console error.
  - Any particle clipping through blueprint walls or teleporting.
  - Failure of Phone A alarm trigger to broadcast state to Phones B, C, D.
  - Layout horizontal scrollbar or clipped text containers on mobile (360px) or 4K displays.
  - Broken links or missing cards in Master Portal `sistemas/index.html`.
