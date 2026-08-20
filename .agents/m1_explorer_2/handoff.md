# Technical Exploration Report: Milestone 1 Layout & Quality Refactor (Systems 6–10)

**Date**: 2026-08-20  
**Author**: `m1_explorer_2`  
**Target Scope**: 
- System 6: `sistemas/gcp-serverless-pipeline/index.html`
- System 7: `sistemas/gcp-event-pubsub/index.html`
- System 8: `sistemas/gcp-sql-networking/index.html`
- System 9: `sistemas/gcp-iam-security/index.html`
- System 10: `sistemas/gcp-cloudops-cockpit/index.html`

---

## 1. Observation

Direct code inspection of the 5 interactive applications revealed exact line numbers, rigid CSS properties, and z-index stratification deviations across viewports (360px mobile to 3840px 4K).

### System 6: `sistemas/gcp-serverless-pipeline/index.html`
- **Typography**:
  - Line 187: `.brand-title { font-size: 18px; }` — rigid px sizing.
  - Line 196: `.brand-subtitle { font-size: 12px; }` — rigid px sizing.
  - Line 309: `.stat-label { font-size: 11px; }` — rigid px sizing.
  - Line 317: `.stat-value { font-size: 16px; }` — rigid px sizing.
  - Line 342: `.section-title { font-size: 14px; }` — rigid px sizing.
  - Line 481: `.step-name { font-size: 13px; }` — rigid px sizing.
  - Line 485: `.step-api { font-size: 10.5px; }` — rigid px sizing.
  - Line 702: `.gauge-number { font-size: 24px; }` — rigid px sizing.
  - Line 778: `.instance-id { font-size: 10.5px; }` — rigid px sizing.
- **Fixed Heights**:
  - Line 624: `.canvas-container { height: 210px; }` — fixed container height.
  - Line 893: `.log-terminal-window { height: 280px; }` — fixed terminal height.
  - Line 573: `.range-slider-wrap { height: 28px; }` — fixed height without min-height.
- **Z-Index Layering**:
  - Line 971: `.drawer-modal { z-index: 1000; }` — exceeds standard modal layer (100).
  - Line 987: `.drawer-backdrop { z-index: 999; }` — exceeds standard modal layer (100).
- **Grid Auto-Fit & Search Width**:
  - Line 360: `.stepper-container { grid-template-columns: repeat(5, 1fr); }` with hard breakpoint at 1024px.
  - Line 879, 885: `.log-search-input { width: 220px; }` and `:focus { width: 280px; }` — causes horizontal overflow on 360px viewports.

---

### System 7: `sistemas/gcp-event-pubsub/index.html`
- **Typography**:
  - Line 210: `.brand-title { font-size: 17px; }` — rigid px sizing.
  - Line 233: `.brand-subtitle { font-size: 11px; }` — rigid px sizing.
  - Line 320: `.ticker-val { font-size: 13px; }` — rigid px sizing.
  - Line 408: `.section-title { font-size: 15px; }` — rigid px sizing.
  - Line 510: `.node-name { font-size: 13px; }` — rigid px sizing.
  - Line 573: `.node-metric-num { font-size: 13px; }` — rigid px sizing.
  - Line 697: `.card-header-title { font-size: 14px; }` — rigid px sizing.
  - Line 805: `.gauge-main-val { font-size: 22px; }` — rigid px sizing.
  - Line 931: `.percentile-val { font-size: 13px; }` — rigid px sizing.
  - Line 994: `.aux-val { font-size: 13px; }` — rigid px sizing.
  - Line 1065: `.slider-value-display { font-size: 13px; }` — rigid px sizing.
  - Line 1459: `.modal-title { font-size: 15px; }` — rigid px sizing.
- **Fixed Heights**:
  - Line 647: `.stream-canvas-container { height: 160px; }` — fixed container height.
  - Line 738: `.chart-canvas-container { height: 220px; }` — fixed container height.
  - Line 855: `.histogram-bars-wrapper { height: 130px; }` — fixed container height.
  - Line 1164: `.dlq-table-wrapper { max-height: 320px; }` — lacks fluid height range.
  - Line 1354: `.log-stream-box { height: 200px; }` — fixed container height.
  - Line 1513: `.code-viewer-box { max-height: 240px; }` — lacks fluid height range.
- **Z-Index Layering**:
  - Line 158: `.app-header { z-index: 100; }` — collides with modal standard layer (100).
  - Line 764: `.chart-crosshair-tooltip { z-index: 20; }` — excessive inside-card z-index.
  - Line 1186: `.dlq-table th { z-index: 10; }` — excessive table header z-index.
  - Line 1417: `.modal-overlay { z-index: 1000; }` — exceeds standard modal layer (100).
- **Grid Auto-Fit & Inputs**:
  - Line 430: `.topology-deck { grid-template-columns: repeat(5, 1fr); }` with rigid step breakpoints.
  - Line 972: `.aux-grid { grid-template-columns: repeat(4, 1fr); }` — non-fluid columns.
  - Line 1150: `.cyber-input { width: 200px; }` — rigid width.

---

### System 8: `sistemas/gcp-sql-networking/index.html`
- **Typography**:
  - Line 181: `.brand-text h1 { font-size: 1.25rem; }` — non-fluid rem sizing.
  - Line 195: `.brand-subtitle { font-size: 0.8rem; }` — non-fluid rem sizing.
  - Line 393: `.kpi-value { font-size: 1.6rem; }` — non-fluid rem sizing.
  - Line 446: `.panel-title { font-size: 1rem; }` — non-fluid rem sizing.
  - Line 560: `.stopwatch-value { font-size: 1.25rem; }` — non-fluid rem sizing.
  - Line 670: `.gauge-percent { font-size: 1.7rem; }` — non-fluid rem sizing.
  - Line 862: `.cmek-info-val { font-size: 0.84rem; }` — non-fluid rem sizing.
  - Line 976: `.modal-title { font-size: 1.1rem; }` — non-fluid rem sizing.
- **Fixed Heights**:
  - Line 465: `.topology-container { height: 380px; }` — fixed container height.
  - Line 764: `.table-container { max-height: 280px; }` — lacks fluid height range.
  - Line 877: `.terminal-container { height: 220px; }` — fixed container height.
  - Line 989: `.modal-body { max-height: 400px; }` — lacks fluid height range.
- **Z-Index Layering**:
  - Line 118: `.ambient-glow { z-index: 0; }` — matches standard (0).
  - Line 946: `.modal-backdrop { z-index: 999; }` — exceeds standard modal layer (100).
  - Line 1002: `.toast-container { z-index: 1000; }` — exceeds standard modal layer (100).
- **Grid Auto-Fit**:
  - Line 341: `.kpi-strip { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }` — 280px causes side scroll on 360px screen.
  - Line 568: `.stepper-progress-list { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); }`
  - Line 840: `.cmek-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }`

---

### System 9: `sistemas/gcp-iam-security/index.html`
- **Typography**:
  - Line 184: `.brand-info h1 { font-size: 1.15rem; }` — non-fluid rem sizing.
  - Line 197: `.brand-info .subtitle { font-size: 0.75rem; }` — non-fluid rem sizing.
  - Line 479: `.kpi-value { font-size: 1.5rem; }` — non-fluid rem sizing.
  - Line 524: `.tab-btn { font-size: 0.8rem; }` — non-fluid rem sizing.
  - Line 599: `.panel-title { font-size: 0.95rem; }` — non-fluid rem sizing.
  - Line 889: `.kms-days-val { font-size: 1.6rem; }` — non-fluid rem sizing.
  - Line 931: `.quota-rps-val { font-size: 1.15rem; }` — non-fluid rem sizing.
  - Line 1050: `.modal-title { font-size: 1.05rem; }` — non-fluid rem sizing.
- **Fixed Heights**:
  - Line 948: `.chart-container { height: 220px; }` — fixed container height.
  - Line 987: `.terminal-body { height: 320px; }` — fixed container height.
  - Line 1035: `.modal-card { max-height: 90vh; }` — lacks min-height constraint.
  - Line 767: `.search-input { min-width: 220px; }` — rigid min-width.
- **Z-Index Layering**:
  - Line 90, 100: `body::before`, `body::after { z-index: 0; }` — matches standard (0).
  - Line 1018: `.modal-overlay { z-index: 999; }` — exceeds standard modal layer (100).
  - Line 1155: `.toast-container { z-index: 10000; }` — exceeds standard modal layer (100).
- **Grid Auto-Fit**:
  - Line 421: `.kpi-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }` — optimize for sub-400px.
  - Line 904: `.quota-gauges-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }`

---

### System 10: `sistemas/gcp-cloudops-cockpit/index.html`
- **Typography**:
  - Line 196: `.header-titles h1 { font-size: 1.35rem; }` — non-fluid rem sizing.
  - Line 206: `.header-titles .subtitle { font-size: 0.78rem; }` — non-fluid rem sizing.
  - Line 352: `.signal-title { font-size: 0.85rem; }` — non-fluid rem sizing.
  - Line 394: `.signal-big-value { font-size: 1.9rem; }` — non-fluid rem sizing.
  - Line 552: `.panel-title { font-size: 0.95rem; }` — non-fluid rem sizing.
  - Line 695: `.dial-big-text { font-size: 1.35rem; }` — non-fluid rem sizing.
  - Line 896: `.action-btn { font-size: 0.72rem; }` — non-fluid rem sizing.
- **Fixed Heights**:
  - Line 566: `.topology-radar-deck { height: 340px; }` — fixed container height.
  - Line 1125: `.logs-table-container { height: 280px; }` — fixed container height.
  - Line 1261: `.hud-drawer { height: 100vh; }` — lacks min-height constraint.
  - Line 1428: `.terminal-body { height: 320px; }` — fixed container height.
  - Line 965: `.search-input-wrap { min-width: 220px; max-width: 380px; }` — needs fluid width.
- **Z-Index Layering**:
  - Line 110, 124: `body::before`, `body::after { z-index: 0; }` — matches standard (0).
  - Line 135: `.scanline-pulse { z-index: 1000; }` — exceeds standard layer; reduce to `z-index: 50;`.
  - Line 1243: `.drawer-overlay { z-index: 1100; }` — exceeds standard modal layer (100); update to `z-index: 99;`.
  - Line 1265: `.hud-drawer { z-index: 1200; }` — exceeds standard modal layer (100); update to `z-index: 100;`.
  - Line 1374: `.modal-overlay { z-index: 1500; }` — exceeds standard modal layer (100); update to `z-index: 100;`.
- **Grid Auto-Fit**:
  - Line 274: `.golden-signals-grid { grid-template-columns: repeat(4, 1fr); }` — needs `repeat(auto-fit, minmax(clamp(200px, 22vw, 280px), 1fr));`.
  - Line 753: `.windows-grid { grid-template-columns: repeat(4, 1fr); }` — needs `repeat(auto-fit, minmax(clamp(90px, 12vw, 120px), 1fr));`.
  - Line 884: `.mitigation-actions-grid { grid-template-columns: repeat(6, 1fr); }` — needs `repeat(auto-fit, minmax(clamp(85px, 12vw, 110px), 1fr));`.

---

## 2. Logic Chain

1. **Root Cause Analysis for Visual Collisions**:
   - Rigid pixel and rem values on headings and metrics cause text wrapping into adjacent elements on viewports `< 768px`, while appearing disproportionately small on `> 2560px` (4K) displays.
   - Fixed heights (`height: 280px`, `height: 340px`) cause inner elements to overflow vertically or clip controls when dynamic content expands or when users increase browser zoom.
   - Z-index values arbitrarily assigned between `10` and `10000` create stacking context conflicts where floating tooltips and sticky headers either disappear underneath canvas layers or overlay modals improperly.

2. **Mathematical Alignment**:
   - Using CSS `clamp(min, preferred_vw, max)` ensures smooth continuous scaling:
     - Titles: `clamp(1.05rem, 1.8vw, 1.45rem)` ensures min 16.8px on 360px screens and max 23.2px on 4K screens.
     - Big KPI values: `clamp(1.25rem, 2.2vw, 2.1rem)` guarantees zero metric clipping.
   - Using `min-height` with `clamp(min_px, preferred_vh, max_px)` ensures containers adapt to viewport height changes while preserving minimum clearance for canvases and tables.
   - Re-indexing all elements to strict 4-layer standard:
     - `0`: Background Canvas / scanlines / body gradients.
     - `1`: SVG connection lines, packet tracks, canvas meshes.
     - `2`: Cards, nodes, gauges, HUD panels.
     - `50`: Sticky headers / floating action pills.
     - `99`: Modal/Drawer backdrop overlays.
     - `100`: Modal windows, slide-out inspection drawers, toast notifications.

---

## 3. Caveats

- Canvas DPR scaling must be maintained when resizing canvas parent containers (`canvas.width = clientWidth * dpr`, `ctx.scale(dpr, dpr)`).
- Web Audio engines present in Systems 8, 9, 10 must retain their existing mute toggles and state preservation.
- No source code files were edited during this exploratory investigation.

---

## 4. Conclusion & Actionable Implementation Instructions

The worker implementing Milestone 1 for Systems 6–10 should execute the following targeted CSS replacements:

### Summary of Changes by System

| System | File | Typography `clamp()` Target Selectors | Fixed Height Replacements | Z-Index Layer Fixes | Grid Auto-Fit Conversions |
|---|---|---|---|---|---|
| **6** | `sistemas/gcp-serverless-pipeline/index.html` | `.brand-title`, `.brand-subtitle`, `.stat-value`, `.section-title`, `.step-name`, `.gauge-number`, `.instance-id` | `.canvas-container`, `.log-terminal-window`, `.range-slider-wrap` | `.drawer-backdrop` (99), `.drawer-modal` (100) | `.stepper-container`, `.quick-stats-bar`, `.instances-grid` |
| **7** | `sistemas/gcp-event-pubsub/index.html` | `.brand-title`, `.ticker-val`, `.section-title`, `.node-name`, `.node-metric-num`, `.gauge-main-val`, `.percentile-val` | `.stream-canvas-container`, `.chart-canvas-container`, `.histogram-bars-wrapper`, `.log-stream-box` | `.app-header` (50), `.modal-overlay` (100), `.chart-crosshair-tooltip` (3) | `.topology-deck`, `.aux-grid`, `.controls-deck` |
| **8** | `sistemas/gcp-sql-networking/index.html` | `.brand-text h1`, `.brand-subtitle`, `.kpi-value`, `.panel-title`, `.stopwatch-value`, `.gauge-percent` | `.topology-container`, `.table-container`, `.terminal-container`, `.modal-body` | `.modal-backdrop` (99), `.modal-card` (100), `.toast-container` (100) | `.kpi-strip`, `.stepper-progress-list`, `.cmek-grid` |
| **9** | `sistemas/gcp-iam-security/index.html` | `.brand-info h1`, `.kpi-value`, `.panel-title`, `.kms-days-val`, `.quota-rps-val`, `.modal-title` | `.chart-container`, `.terminal-body`, `.modal-card`, `.search-input` | `.modal-overlay` (100), `.toast-container` (100) | `.kpi-grid`, `.quota-gauges-grid`, `.tabs-nav` |
| **10** | `sistemas/gcp-cloudops-cockpit/index.html` | `.header-titles h1`, `.signal-big-value`, `.dial-big-text`, `.panel-title`, `.action-btn` | `.topology-radar-deck`, `.logs-table-container`, `.terminal-body`, `.hud-drawer` | `.scanline-pulse` (50), `.drawer-overlay` (99), `.hud-drawer` (100), `.modal-overlay` (100) | `.golden-signals-grid`, `.windows-grid`, `.mitigation-actions-grid` |

---

## 5. Verification Method

To independently verify the implementation after code updates:

1. **Layout & Responsiveness Inspection**:
   - Inspect each HTML dashboard at 360px (mobile), 768px (tablet), 1280px (laptop), 1920px (FHD), and 3840px (4K).
   - Validate zero horizontal scrollbar overflow on document body at 360px.
   - Validate zero overlapping text on cards and metric dials.

2. **Z-Index Inspection**:
   - Trigger modal windows (`#drawer-modal`, `#dlqModal`, `#explainModal`, `#runbook-terminal-modal`) and verify they render strictly above all canvas layers and cards without element bleed-through.

3. **Automated Test Run**:
   - Run multi-tier E2E testing suite once available:
     ```powershell
     python -m pytest tests/ -v
     ```
   - Verify 0 console errors and 0 layout collisions across all 5 systems.
