# Challenger 1 Empirical Stress & Edge Case Verification Report

**Milestone**: Milestone 6 — Adversarial Stress & Edge Case Verification  
**Target Systems**:
- `sistemas/emergency-tri-screen-a/index.html` (Variant A: Tactical Cyberpunk)
- `sistemas/emergency-tri-screen-b/index.html` (Variant B: Clean Minimalist Linear Dark)
- `sistemas/emergency-tri-screen-c/index.html` (Variant C: 2.5D Isometric Mission Control)
- `sistemas/index.html` (Master Launchpad Portal)  
**Execution Runtime**: Node.js 24 Native WebSocket CDP Harness (Headless Chrome / Edge)  
**Verdict**: `REQUEST_CHANGES` (1 confirmed empirical bug in Variant B)

---

## 1. Observation

### Observation 1.1: Standard E2E Suite Execution
- **Command**: `node tests/tri_screen_e2e_suite.js`
- **Result**: 81/81 test cases passed across all 4 Tiers (Duration: 58.25s).
- **Details**:
  - Variant A: Tier 1 (10/10), Tier 2 (8/8), Tier 3 (5/5), Tier 4 (1/1)
  - Variant B: Tier 1 (6/6), Tier 2 (8/8), Tier 3 (5/5), Tier 4 (1/1)
  - Variant C: Tier 1 (5/5), Tier 2 (8/8), Tier 3 (5/5), Tier 4 (1/1)
  - Master Portal: Tier 1 (4/4), Tier 2 (8/8), Tier 3 (5/5), Tier 4 (1/1)

### Observation 1.2: Challenger Adversarial Stress Suite Execution
- **Test File**: `tests/challenger_stress_tri_screen.js`
- **Telemetry Artifact**: `tests/challenger_1_tri_screen_stress_results.json`
- **Command**: `node tests/challenger_stress_tri_screen.js`
- **Result**: 22 passed, 1 failed across 23 adversarial stress vectors (Duration: 23.47s).
- **Stress Vector Results**:
  - `STRESS-A-01` (Variant A Rapid Trigger & Reset Spam, 50 dispatches in <5ms): **PASSED** (0 NaN coords, state clean).
  - `STRESS-A-02` (Variant A Extreme Viewport Resizes 320px–4K during particle motion): **PASSED** (0 clipping, DPR clean).
  - `STRESS-A-03` (Variant A Boundary Occupants 0, 1, 100, 250, 500): **PASSED** (HUD displays `0.0%`, no divide-by-zero).
  - `STRESS-A-04` (Variant A Simultaneous Multi-Hazard Injection): **PASSED** (All rooms ignite, navmesh updates, dynamic repathfinds).
  - `STRESS-A-05` (Variant A All Stairwells Blocked / Shelter-in-Place): **PASSED** (Particles hold in place cleanly, unblock resumes).
  - `STRESS-A-06` (Variant A 100 Concurrent Check-Ins Burst): **PASSED** (Safe count strictly <= Total count).
  - `STRESS-A-07` (Variant A AudioContext Suspended & Speech Muted): **PASSED** (0 unhandled rejections).
  - `STRESS-B-01` (Variant B Rapid Severity Level Switches & Trigger Spam): **PASSED** (Velocity float metrics finite).
  - `STRESS-B-02` (Variant B Extreme Viewport Resizes during CAD Heatmap Stream): **PASSED** (Valid coordinates, 0 context loss).
  - `STRESS-B-03` (Variant B Boundary Occupants 0, 1, 100, 250, 500): **FAILED** (Error: `DOM text leaks detected: [{"text":"NaN%","parentTag":"DIV","parentClass":"donut-center-text","parentId":"donutPctText"}]`).
  - `STRESS-B-04` (Variant B Multi-Hazard Injection & Compass Rotation): **PASSED** (Escape compass angle finite float).
  - `STRESS-B-05` (Variant B All Stairwells Blocked / Shelter-in-Place): **PASSED** (Velocity drops to 0, unblocking resumes).
  - `STRESS-B-06` (Variant B 100 Concurrent Check-Ins Burst): **PASSED** (Safe percentage clamped <= 100%).
  - `STRESS-C-01` (Variant C Incident Level Dial Rotations L1-4 & PA Spam): **PASSED** (State remains coherent).
  - `STRESS-C-02` (Variant C Extreme Viewport Resizes during 2.5D Projection): **PASSED** (3D wall extrusions finite).
  - `STRESS-C-03` (Variant C Boundary Occupants 0, 1, 100, 250, 500): **PASSED** (BLE telemetry and headcount correct).
  - `STRESS-C-04` (Variant C Multi-Hazard Injection & LED Guide Arrows): **PASSED** (LED paths update dynamically).
  - `STRESS-C-05` (Variant C All Stairwells Blocked / Shelter-in-Place): **PASSED** (0 NaN coordinates in 2.5D space).
  - `STRESS-C-06` (Variant C 100 Survivor Check-Ins Burst): **PASSED** (No duplicate triage entries).
  - `STRESS-PORTAL-01` (Portal Rapid Category Filter Spam): **PASSED** (Cards update cleanly).
  - `STRESS-PORTAL-02` (Portal Rapid Search Input Spam): **PASSED** (0 memory leak).
  - `STRESS-PORTAL-03` (Portal Viewports 360px–4K Horizontal Overflow Check): **PASSED** (`scrollWidth <= clientWidth + 3`).
  - `STRESS-PORTAL-04` (Portal Tri-Screen Cards and Canvas Preview Animation): **PASSED** (All 3 live canvases render).

### Observation 1.3: Code Inspection of Bug in Variant B
- **File**: `sistemas/emergency-tri-screen-b/index.html`
- **Lines 2682–2693**:
```javascript
      // Update Tally in Phone A
      const pct = Math.round((safeCount / state.occupantsTotal) * 100);
      document.getElementById('donutPctText').textContent = `${pct}%`;
      document.getElementById('tallySafeVal').textContent = safeCount;
      document.getElementById('tallyTotalVal').textContent = state.occupantsTotal;

      const circle = document.getElementById('donutProgressCircle');
      if (circle) {
        const offset = 100 - pct;
        circle.style.strokeDashoffset = offset;
      }
```
- **Contrast with Variant A** (`sistemas/emergency-tri-screen-a/index.html:2331`):
```javascript
const pct = total > 0 ? ((safe / total) * 100).toFixed(1) : '0.0';
```
- **Contrast with Variant C** (`sistemas/emergency-tri-screen-c/index.html:2965`):
```javascript
const pct = total > 0 ? Math.round((safe / total) * 100) : 0;
```

---

## 2. Logic Chain

1. **Step 1 (Baseline Verification)**: The existing 81 E2E test suite in `tests/tri_screen_e2e_suite.js` executes smoothly, confirming that all core functional features (Phone A triggers, Center floorplans, Recipient phones, Web Audio synthesis, BroadcastChannel sync, and Portal registration) operate properly in nominal scenarios.
2. **Step 2 (Adversarial Edge-Case Injection)**: When boundary test `STRESS-B-03` invokes `window.__EMERGENCY_TRI_B__.setOccupantCount(0)` on Variant B, `state.occupantsTotal` is set to `0`.
3. **Step 3 (Root Cause Identification)**: In `sistemas/emergency-tri-screen-b/index.html` line 2683, the function `renderCADFrame` executes every animation frame and evaluates `const pct = Math.round((safeCount / state.occupantsTotal) * 100);`. With `state.occupantsTotal === 0`, `0 / 0` evaluates to `NaN`. `Math.round(NaN)` returns `NaN`.
4. **Step 4 (DOM Corruption & Visual Bug)**: Line 2684 assigns `${pct}%` (`"NaN%"`) to `document.getElementById('donutPctText').textContent`. In addition, line 2691 assigns `circle.style.strokeDashoffset = NaN`.
5. **Step 5 (Invariant Violation)**: The test harness text-node validator (`assertNoDomLeakStrings`) detected `"NaN%"` rendered directly inside `<div class="donut-center-text" id="donutPctText">NaN%</div>`.
6. **Step 6 (Variant Comparison)**: Both Variant A and Variant C properly guard against `total === 0` using ternary checks (`total > 0 ? ... : 0`), confirming that Variant B simply omitted the zero-check on line 2683.

---

## 3. Caveats

- **Viewport 320px in Portal**: At 320px width (below the official 360px contract in `PROJECT.md`), `sistemas/index.html` exhibits a 16px scroll overflow (`scrollWidth=336px`). However, between 360px and 3840px (the required contract range), the portal exhibits zero horizontal scroll overflow.
- **AudioContext in Headless Environments**: All 3 simulators and the portal handle muted / headless AudioContext and unpopulated SpeechSynthesis voice lists gracefully with 0 unhandled promise rejections.

---

## 4. Conclusion & Required Changes

**Verdict**: `REQUEST_CHANGES`

### Required Fix
In `sistemas/emergency-tri-screen-b/index.html` (line 2683), update the percentage calculation to guard against division-by-zero:
```javascript
// BEFORE (Bug):
const pct = Math.round((safeCount / state.occupantsTotal) * 100);

// AFTER (Fix):
const pct = state.occupantsTotal > 0 ? Math.round((safeCount / state.occupantsTotal) * 100) : 100;
```

Once this single-line patch is applied, Variant B will be 100% compliant and free of `NaN%` DOM corruption under 0-occupant boundary conditions.

---

## 5. Verification Method

1. Run the challenger stress harness:
```powershell
node tests/challenger_stress_tri_screen.js
```
2. Invalidation Condition: The test suite must complete with **23/23 passed**, 0 failed, exit code 0, and JSON output report `tests/challenger_1_tri_screen_stress_results.json` showing `"verdict": "APPROVE"`.
3. Run the complete baseline E2E suite:
```powershell
node tests/tri_screen_e2e_suite.js
```
The baseline suite must complete with **81/81 passed**, 0 failed, exit code 0.
