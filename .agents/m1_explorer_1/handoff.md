# Milestone 1 Technical Exploration Report — Systems 1 to 5

**Author**: `m1_explorer_1`  
**Date**: 2026-08-20  
**Scope**: Systems 1–5 in `sistemas/`:
1. `sistemas/tv-diagnostic/index.html`
2. `sistemas/network-health/index.html`
3. `sistemas/security-audit/index.html`
4. `sistemas/server-status/index.html`
5. `sistemas/transaction-flow/index.html`

---

## 1. Observation

Direct code examination of all five systems revealed specific lines requiring refactoring across typography, heights, z-index stratification, and responsive layout.

### 1.1 System 1: `sistemas/tv-diagnostic/index.html`
- **Typography**:
  - Line 49: `.hdr__pill { font-size: .68rem; }` — rigid rem font size.
  - Line 65: `.hdr__title { font-size: clamp(1.6rem, 4.5vw, 2.6rem); }` — media query at Line 350 (`@media(max-width:640px){ .hdr__title{ font-size: 1.5rem; } }`) overrides fluid clamp with rigid rem.
  - Line 70: `.hdr__sub { font-size: .9rem; }` — rigid rem.
  - Line 74: `.hdr__status { font-size: .85rem; }` — rigid rem.
  - Line 222: `.node__label { font-size: .85rem; }` — rigid rem (overridden by rigid `.72rem` at Line 346).
  - Line 234: `.node__metric { font-size: .75rem; }` — rigid rem.
  - Line 254: `.btn-primary { font-size: .95rem; }` — rigid rem (overridden by `.88rem` at Line 349).
  - Line 299: `.logs__title { font-size: .76rem; }` — rigid rem.
- **Fixed Dimensions / Heights**:
  - Line 153: `.node__circle { width: 112px; height: 112px; }` — hardcoded pixel width/height scaled via discrete media queries (Line 343: 82px, Line 353: 66px).
  - Line 130: `.node__glow { width: 130px; height: 130px; }` — hardcoded pixel sizing.
- **Z-Index Layering**:
  - Line 29: `.scene { z-index: 0; }` — conforms to Canvas/Bg (0).
  - Line 88: `.track { z-index: 0; }` — **VIOLATION**: Track line is at `z-index: 0` instead of `z-index: 1`.
  - Line 124: `.node { z-index: 1; }` — **VIOLATION**: Step nodes are at `z-index: 1` instead of `z-index: 2`.
  - Line 360: `.footer { z-index: 1; }` — Footer layer.
- **Responsiveness (360px–500px Viewports)**:
  - Line 38: `.hub { padding: 56px 24px 40px; }` — on 360px viewport, 48px horizontal padding leaves only 312px for 4 nodes.
  - Line 88: `.track { position: absolute; top: 56px; left: 64px; right: 64px; }` — track endpoints are hardcoded pixels rather than aligned to dynamic node centers.

---

### 1.2 System 2: `sistemas/network-health/index.html`
- **Typography**:
  - Line 51: `.hdr__sub { font-size: .82rem; }` — rigid rem.
  - Line 57: `.pill { font-size: .7rem; }` — rigid rem.
  - Line 162: `.nd__lb { font-size: .72rem; }` — rigid rem (overridden by `.62rem` at Line 275).
  - Line 168: `.nd__mt { font-size: .68rem; }` — rigid rem.
  - Line 189: `.summary__head { font-size: .78rem; }` — rigid rem.
  - Line 199: `.s-card__label { font-size: .65rem; }` — rigid rem.
  - Line 200: `.s-card__value { font-size: 1.2rem; }` — rigid rem (overridden by `1rem` at Line 280).
  - Line 209: `.btn { font-size: .9rem; }` — rigid rem (overridden by `.82rem` at Line 277).
  - Line 230: `.btn2 { font-size: .7rem; }` — rigid rem.
  - Line 250: `.logs__t { font-size: .72rem; }` — rigid rem.
- **Fixed Dimensions / Heights**:
  - Line 10: `html { height: 100% }` — rigid height constraint; needs `min-height: 100%`.
  - Line 101: `.nd__c { width: 88px; height: 88px; }` — hardcoded pixel width/height (scaled to 68px at Line 273, 54px at Line 282).
  - Line 184: `.summary[data-show="1"] { max-height: 400px; }` — rigid max-height risks clipping content on 360px screens where 5 summary cards stack vertically.
- **Z-Index Layering**:
  - Lines 30, 35: `body::before`, `body::after { z-index: 0; }` — conforms to Canvas/Bg (0).
  - Line 77: `.trk { z-index: 0; }` — **VIOLATION**: Connection track is at `z-index: 0` instead of `z-index: 1`.
  - Line 98: `.nd { z-index: 1; }` — **VIOLATION**: Step nodes are at `z-index: 1` instead of `z-index: 2`.
  - Line 288: `.footer { z-index: 1; }`.
- **Responsiveness (360px–500px Viewports)**:
  - Line 70: `.stepper { display: flex; justify-content: space-between; }` with 5 nodes. On 360px viewport, 5 * 54px node circles + labels squeeze without fluid scaling.
  - Line 192: `.summary__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }` — `minmax(150px, 1fr)` causes uneven wrapping on 360px viewports (360px - 40px padding = 320px, forcing single column or awkward 2-column overflow).

---

### 1.3 System 3: `sistemas/security-audit/index.html`
- **Typography**:
  - Line 157: `.brand-titles h1 { font-size: 1.35rem; }` — rigid rem.
  - Line 167: `.badge-v { font-size: 0.65rem; }` — rigid rem.
  - Line 178: `.brand-titles p { font-size: 0.8rem; }` — rigid rem.
  - Line 195: `.target-pill { font-size: 0.75rem; }` — rigid rem.
  - Line 229: `.btn { font-size: 0.82rem; }` — rigid rem.
  - Line 308: `.section-title { font-size: 0.95rem; }` — rigid rem.
  - Line 324: `.stepper-status-badge { font-size: 0.75rem; }` — rigid rem.
  - Line 503: `.node-title { font-size: 0.78rem; }` — rigid rem.
  - Line 517: `.node-tag { font-size: 0.65rem; }` — rigid rem.
  - Line 611: `.gauge-score-value { font-size: 2.5rem; }` — rigid rem.
  - Line 704: `.metric-value { font-size: 1.85rem; }` — rigid rem.
  - Line 1126: `.drawer-titles h3 { font-size: 1.1rem; }` — rigid rem.
- **Fixed Dimensions / Heights**:
  - Line 393, 399: `.node-circle-wrap`, `.node-circle { width: 60px; height: 60px; }` — hardcoded pixel width/height.
  - Line 1021: `.terminal-body { height: 180px; }` — rigid height constraint; needs `min-height: 140px; max-height: 240px;`.
- **Z-Index Layering**:
  - Lines 81, 91: `body::before`, `body::after { z-index: 0; }` — conforms to Canvas/Bg (0).
  - Line 353: `.stepper-track-bg { z-index: 1; }` — conforms to Lines/Tracks (1).
  - Line 364: `.stepper-track-fill { z-index: 2; }` — **VIOLATION**: Track fill is at `z-index: 2` instead of `z-index: 1`.
  - Line 371: `.stepper-node { z-index: 3; }` — **VIOLATION**: Nodes are at `z-index: 3` instead of `z-index: 2`.
  - Line 1065: `.drawer-overlay { z-index: 100; }` — conforms to Modals/Drawers (100).
  - Line 1086: `.inspection-drawer { z-index: 101; }` — **VIOLATION**: Needs alignment to standard 100 (or overlay 99 / drawer 100).
  - Line 1267: `.modal-overlay { z-index: 200; }` — **VIOLATION**: `z-index: 200` instead of `100`.
  - Line 1361: `.toast-container { z-index: 300; }` — **VIOLATION**: `z-index: 300` instead of `100`/`110`.
- **Responsiveness (360px–500px Viewports)**:
  - Line 214: `.header-actions { display: flex; flex-wrap: wrap; gap: 10px; }` — contains 6 buttons.
  - Line 340: `.stepper-container { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }` — at Line 1418 (`@media (max-width: 768px)`), `grid-template-columns: repeat(2, 1fr);` leaves the 7th node orphaned; needs fluid auto-fit: `repeat(auto-fit, minmax(130px, 1fr))`.

---

### 1.4 System 4: `sistemas/server-status/index.html`
- **Typography**:
  - Line 210: `.brand-title { font-size: 1.25rem; }` — rigid rem (overridden by `1rem` at Line 1661).
  - Line 224: `.brand-sub { font-size: 0.72rem; }` — rigid rem.
  - Line 240: `.global-status-badge { font-size: 0.82rem; }` — rigid rem.
  - Line 402: `.kpi-label { font-size: 0.72rem; }` — rigid rem.
  - Line 420: `.kpi-value { font-size: 1.75rem; }` — rigid rem.
  - Line 690: `.service-name { font-size: 1.05rem; }` — rigid rem.
  - Line 700: `.service-tag { font-size: 0.68rem; }` — rigid rem.
  - Line 785: `.stat-value { font-size: 0.95rem; }` — rigid rem.
- **Fixed Dimensions / Heights**:
  - Line 57, 155: `--header-height: 72px; .noc-header { height: var(--header-height); }` — **VIOLATION**: Fixed height header overflows and clips controls when buttons wrap on mobile viewports (< 600px). Needs `min-height: var(--header-height); height: auto; padding: 0.75rem 1.5rem;`.
  - Line 1314: `.terminal-drawer { height: var(--terminal-height); }` — rigid fixed height (240px); needs `min-height: 38px; max-height: 40vh;`.
- **Z-Index Layering**:
  - Lines 104, 117: `body::before`, `body::after { z-index: 0; }` — conforms to Canvas/Bg (0).
  - Line 133: `.scanlines { z-index: 1; }` — **VIOLATION**: Background scanline overlay is at `z-index: 1` instead of `z-index: 0`.
  - Line 139: `.app-container { z-index: 2; }` — conforms to Cards/Nodes layer.
  - Line 162: `.noc-header { position: sticky; top: 0; z-index: 100; }` — Navigation layer (100).
  - Line 988: `.chaos-overlay { z-index: 200; }` — **VIOLATION**: `z-index: 200` instead of `100`.
  - Line 1319: `.terminal-drawer { z-index: 150; }` — **VIOLATION**: `z-index: 150` instead of `100`.
  - Line 1510: `.sla-tooltip { z-index: 300; }` — **VIOLATION**: `z-index: 300` instead of `100`.
  - Line 1588: `.toast-container { z-index: 250; }` — **VIOLATION**: `z-index: 250` instead of `100`.
- **Responsiveness (360px–500px Viewports)**:
  - Line 154: `.noc-header` requires `flex-wrap: wrap; gap: 0.75rem;` to prevent button overlap.
  - Line 369: `.hero-ribbon { grid-template-columns: repeat(4, 1fr); }` — needs `repeat(auto-fit, minmax(200px, 1fr));`.
  - Line 554: `.services-grid { grid-template-columns: repeat(3, 1fr); }` — needs `repeat(auto-fit, minmax(min(100%, 300px), 1fr));`.
  - Line 1112: `.healing-steps-row { grid-template-columns: repeat(5, 1fr); }` — needs `repeat(auto-fit, minmax(80px, 1fr));`.

---

### 1.5 System 5: `sistemas/transaction-flow/index.html`
- **Typography**:
  - Line 171: `.brand-title h1 { font-size: 1.4rem; }` — rigid rem.
  - Line 181: `.brand-title p { font-size: 0.78rem; }` — rigid rem.
  - Line 201: `.status-pill { font-size: 0.76rem; }` — rigid rem.
  - Line 285: `.ttl-timer-display { font-size: 1.35rem; }` — rigid rem.
  - Line 354: `.scenario-btn { font-size: 0.78rem; }` — rigid rem.
  - Line 413: `.btn { font-size: 0.82rem; }` — rigid rem.
  - Line 628: `.ledger-value { font-size: 1.45rem; }` — rigid rem.
  - Line 692: `.pipeline-section-title h2 { font-size: 0.95rem; }` — rigid rem.
  - Line 942: `.node-title { font-size: 0.78rem; }` — rigid rem.
- **Fixed Dimensions / Heights**:
  - Line 808: `.node-circle { width: 78px; height: 78px; }` — hardcoded pixel width/height.
  - Line 1225: `.payment-card { width: 100%; height: 190px; }` — fixed height risks text clipping on narrow mobile viewports; needs `min-height: 180px; height: auto;`.
  - Line 1584: `.terminal-body { height: 200px; }` — rigid height constraint; needs `min-height: 150px; max-height: 250px;`.
- **Z-Index Layering**:
  - Line 113: `.ambient-glow { z-index: 0; }` — conforms to Canvas/Bg (0).
  - Line 119: `.app-container { z-index: 1; }` — Container layer.
  - Line 722: `.stepper-tracks-svg { z-index: 1; }` — conforms to Lines/Tracks (1).
  - Line 794: `.nodes-grid { z-index: 2; }` — conforms to Cards/Nodes (2).
  - Line 997: `.bifurcations-container { z-index: 2; }` — conforms to Cards/Nodes (2).
  - Line 1635: `.toast-container { z-index: 9999; }` — **VIOLATION**: Arbitrary `z-index: 9999` instead of standardized `100`.
- **Responsiveness (360px–500px Viewports)**:
  - Line 131: `.header` — `display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;` works well, but needs tighter padding on mobile (`padding: 12px 16px;`).
  - Line 576: `.ledger-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }` — convert minmax to `minmax(200px, 1fr)` for mobile fit.
  - Line 671: `.pipeline-section { overflow-x: auto; }` — contains 6-node SVG track with `min-width: 1080px`. Needs `-webkit-overflow-scrolling: touch;` and smooth scrollbar indicator.

---

## 2. Logic Chain

1. **Standard Requirement**: `PROJECT.md` specifies strict 4-tier z-index stratification:
   - `z-index: 0` = Background Canvas, scanlines, and ambient backdrops.
   - `z-index: 1` = SVG connection lines, packet energy tracks, and dependency links.
   - `z-index: 2` = Interactive step nodes, metric cards, data gauges, and visualizer decks.
   - `z-index: 100` = Floating tooltips, dropdowns, inspection drawers, and dialog modals.
2. **Identified Discrepancies**:
   - In `tv-diagnostic`, `.track` is at `z:0` (under background glow) and `.node` is at `z:1`. Upgrading `.track` to `z:1` and `.node` to `z:2` establishes correct stacking order.
   - In `network-health`, `.trk` is at `z:0` and `.nd` is at `z:1`. Upgrading `.trk` to `z:1` and `.nd` to `z:2` fixes the layering.
   - In `security-audit`, `.stepper-track-fill` is at `z:2` and `.stepper-node` is at `z:3`, while modals and drawers span `z:101`, `z:200`, and `z:300`. Normalizing to `1` (tracks), `2` (nodes), and `100` (modals/drawers/toasts) creates strict consistency.
   - In `server-status`, `.scanlines` is at `z:1` (overlapping tracks), while modal overlays and tooltips span `z:150`, `z:200`, `z:250`, and `z:300`. Moving `.scanlines` to `z:0` and clamping all overlays/drawers to `z:100` satisfies the architecture standard.
   - In `transaction-flow`, `.toast-container` is at `z:9999`. Normalizing to `z:100` adheres to the project standard.
3. **Fluid Typography Reasoning**:
   - Rigid `px`/`rem` font sizes cause text wrapping and container collisions when viewports resize between 360px (mobile) and 3840px (4K).
   - Hardcoded media query font overrides (e.g. `.hdr__title { font-size: 1.5rem }` inside `@media (max-width: 640px)`) negate the benefits of fluid typography. Replacing hardcoded font sizes with CSS `clamp(min, preferred_vw, max)` guarantees smooth scaling without stepped jumps or truncation.
4. **Fluid Height & Anti-Collision Reasoning**:
   - Fixed heights on headers (e.g. `height: 72px` in `server-status`) or cards (`height: 190px` in `transaction-flow`) cause contents to clip or overflow when action buttons wrap onto multiple lines.
   - Replacing fixed `height: ...px` with `min-height: ...px; height: auto;` and fluid padding allows the element to expand naturally while maintaining its baseline design.
5. **Mobile Grid & Stepper Reasoning**:
   - Steppers with 4–7 nodes side-by-side without horizontal scrolling or wrapping will crush on 360px viewports (e.g. 5 nodes * 88px = 440px > 360px).
   - Scaling node circles using fluid `clamp(48px, 12vw, 88px)` in `tv-diagnostic` and `network-health`, and utilizing `repeat(auto-fit, minmax(...))` in `security-audit` and `server-status`, prevents horizontal blowout and guarantees 0 layout collision.

---

## 3. Caveats

- **No Caveats**. All 5 files are pure client-side zero-dependency HTML5/CSS3/JavaScript files with inline styles and scripts. No external build steps (e.g. Webpack, PostCSS) are required.
- Audio and log panel enhancements (M2) will build on top of these sanitized layout structures.

---

## 4. Conclusion & Actionable Implementation Instructions for Worker

The worker (`m1_worker_1`) should apply the following targeted modifications across the 5 files:

### System 1: `sistemas/tv-diagnostic/index.html`
1. **Z-Index**:
   - Update `.track` (Line 88) to `z-index: 1`.
   - Update `.node` (Line 124) to `z-index: 2`.
2. **Typography**:
   - Update `.hdr__pill` (Line 49): `font-size: clamp(0.62rem, 1.4vw, 0.75rem);`.
   - Update `.hdr__title` (Line 65): `font-size: clamp(1.4rem, 4vw, 2.5rem);`.
   - Update `.hdr__sub` (Line 70): `font-size: clamp(0.8rem, 1.8vw, 0.95rem);`.
   - Update `.hdr__status` (Line 74): `font-size: clamp(0.75rem, 1.6vw, 0.88rem);`.
   - Update `.node__label` (Line 222): `font-size: clamp(0.68rem, 1.6vw, 0.85rem); max-width: clamp(70px, 18vw, 125px);`.
   - Update `.node__metric` (Line 234): `font-size: clamp(0.65rem, 1.4vw, 0.78rem);`.
   - Update `.btn-primary` (Line 254): `font-size: clamp(0.85rem, 2vw, 0.98rem);`.
   - Remove rigid media query font overrides at Lines 346, 349, 350.
3. **Fluid Nodes**:
   - Update `.node__circle` (Line 153): `width: clamp(66px, 14vw, 112px); height: clamp(66px, 14vw, 112px);`.
   - Update `.node__glow` (Line 130): `width: clamp(78px, 16vw, 130px); height: clamp(78px, 16vw, 130px);`.
   - Update `.track` (Line 88): `top: calc(clamp(66px, 14vw, 112px) / 2); left: calc(clamp(66px, 14vw, 112px) / 2); right: calc(clamp(66px, 14vw, 112px) / 2);`.

### System 2: `sistemas/network-health/index.html`
1. **Z-Index**:
   - Update `.trk` (Line 77) to `z-index: 1`.
   - Update `.nd` (Line 98) to `z-index: 2`.
2. **Typography**:
   - Update `.hdr__sub` (Line 51): `font-size: clamp(0.75rem, 1.6vw, 0.88rem);`.
   - Update `.pill` (Line 57): `font-size: clamp(0.62rem, 1.3vw, 0.72rem);`.
   - Update `.nd__lb` (Line 162): `font-size: clamp(0.6rem, 1.4vw, 0.75rem); max-width: clamp(56px, 16vw, 95px);`.
   - Update `.nd__mt` (Line 168): `font-size: clamp(0.58rem, 1.3vw, 0.7rem);`.
   - Update `.summary__head` (Line 189): `font-size: clamp(0.72rem, 1.6vw, 0.85rem);`.
   - Update `.s-card__value` (Line 200): `font-size: clamp(0.95rem, 2.5vw, 1.25rem);`.
   - Update `.btn` (Line 209): `font-size: clamp(0.8rem, 2vw, 0.95rem);`.
   - Remove rigid media query font overrides at Lines 275, 277, 280.
3. **Heights & Fluid Layout**:
   - Update `html` (Line 10): `min-height: 100%` instead of `height: 100%`.
   - Update `.nd__c` (Line 101): `width: clamp(52px, 12vw, 88px); height: clamp(52px, 12vw, 88px);`.
   - Update `.trk` (Line 77): `top: calc(clamp(52px, 12vw, 88px) / 2); left: calc(clamp(52px, 12vw, 88px) / 2); right: calc(clamp(52px, 12vw, 88px) / 2);`.
   - Update `.summary[data-show="1"]` (Line 184): `max-height: 800px;`.
   - Update `.summary__grid` (Line 192): `grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));`.

### System 3: `sistemas/security-audit/index.html`
1. **Z-Index**:
   - Update `.stepper-track-fill` (Line 364) to `z-index: 1`.
   - Update `.stepper-node` (Line 371) to `z-index: 2`.
   - Update `.inspection-drawer` (Line 1086) to `z-index: 100`.
   - Update `.modal-overlay` (Line 1267) to `z-index: 100`.
   - Update `.toast-container` (Line 1361) to `z-index: 100`.
2. **Typography**:
   - Update `.brand-titles h1` (Line 157): `font-size: clamp(1.05rem, 2.5vw, 1.4rem);`.
   - Update `.btn` (Line 229): `font-size: clamp(0.75rem, 1.5vw, 0.85rem);`.
   - Update `.section-title` (Line 308): `font-size: clamp(0.82rem, 1.8vw, 0.98rem);`.
   - Update `.gauge-score-value` (Line 611): `font-size: clamp(1.8rem, 4.5vw, 2.6rem);`.
   - Update `.metric-value` (Line 704): `font-size: clamp(1.3rem, 3.5vw, 1.9rem);`.
3. **Heights & Responsive Breakpoints**:
   - Update `.terminal-body` (Line 1021): `min-height: 140px; max-height: 240px; height: auto;`.
   - Update `.node-circle-wrap`, `.node-circle` (Lines 393, 399): `width: clamp(48px, 10vw, 60px); height: clamp(48px, 10vw, 60px);`.
   - Update `.stepper-container` (Line 340 / Line 1418): Ensure mobile viewports wrap gracefully with `grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));`.

### System 4: `sistemas/server-status/index.html`
1. **Z-Index**:
   - Update `.scanlines` (Line 133) to `z-index: 0`.
   - Update `.chaos-overlay` (Line 988) to `z-index: 100`.
   - Update `.terminal-drawer` (Line 1319) to `z-index: 100`.
   - Update `.sla-tooltip` (Line 1510) to `z-index: 100`.
   - Update `.toast-container` (Line 1588) to `z-index: 100`.
2. **Typography**:
   - Update `.brand-title` (Line 210): `font-size: clamp(1rem, 2.2vw, 1.35rem);`.
   - Update `.global-status-badge` (Line 240): `font-size: clamp(0.72rem, 1.5vw, 0.82rem);`.
   - Update `.kpi-value` (Line 420): `font-size: clamp(1.3rem, 3.5vw, 1.85rem);`.
   - Update `.service-name` (Line 690): `font-size: clamp(0.88rem, 2vw, 1.1rem);`.
   - Update `.stat-value` (Line 785): `font-size: clamp(0.8rem, 1.8vw, 0.95rem);`.
3. **Heights & Responsive Breakpoints**:
   - Update `.noc-header` (Line 155): `min-height: var(--header-height); height: auto; padding: 0.75rem 1.5rem; flex-wrap: wrap;`.
   - Update `.terminal-drawer` (Line 1314): `min-height: 38px; max-height: 40vh;`.
   - Update `.hero-ribbon` (Line 369): `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));`.
   - Update `.services-grid` (Line 554): `grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));`.
   - Update `.healing-steps-row` (Line 1112): `grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));`.

### System 5: `sistemas/transaction-flow/index.html`
1. **Z-Index**:
   - Update `.toast-container` (Line 1635) from `z-index: 9999` to `z-index: 100`.
2. **Typography**:
   - Update `.brand-title h1` (Line 171): `font-size: clamp(1.1rem, 2.8vw, 1.5rem);`.
   - Update `.ttl-timer-display` (Line 285): `font-size: clamp(1.1rem, 2.5vw, 1.4rem);`.
   - Update `.btn` (Line 413): `font-size: clamp(0.75rem, 1.5vw, 0.85rem);`.
   - Update `.ledger-value` (Line 628): `font-size: clamp(1.15rem, 2.5vw, 1.5rem);`.
3. **Heights & Responsive Breakpoints**:
   - Update `.node-circle` (Line 808): `width: clamp(58px, 12vw, 78px); height: clamp(58px, 12vw, 78px);`.
   - Update `.payment-card` (Line 1225): `min-height: 180px; height: auto;`.
   - Update `.terminal-body` (Line 1584): `min-height: 150px; max-height: 250px; height: auto;`.
   - Update `.ledger-grid` (Line 576): `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));`.
   - Ensure `.pipeline-section` has `-webkit-overflow-scrolling: touch;`.

---

## 5. Verification Method

To independently verify these findings and confirm that worker edits meet all criteria:
1. **Inspection Commands**:
   - Inspect z-index stratification in all 5 files:
     ```powershell
     pwsh -Command "Select-String -Path 'sistemas/tv-diagnostic/index.html','sistemas/network-health/index.html','sistemas/security-audit/index.html','sistemas/server-status/index.html','sistemas/transaction-flow/index.html' -Pattern 'z-index:'"
     ```
   - Verify zero instances of `z-index` exceeding 100 (e.g. 101, 150, 200, 250, 300, 9999).
2. **Viewport Responsiveness**:
   - Test each file under Headless Chrome at viewports: `360x640`, `412x915`, `768x1024`, `1280x800`, `1920x1080`, and `3840x2160`.
   - Confirm:
     - No horizontal scrollbars on body/app containers (except intentional `pipeline-section` track scroller).
     - No clipped text or overlapping header buttons.
     - Fluid font scaling across all breakpoints.
3. **Invalidation Conditions**:
   - If any header button wraps and overflows outside the `.noc-header` or `.header` box.
   - If any connection track is rendered over interactive node emojis or cards.
   - If any step node circle fails to render its permanent emoji.
