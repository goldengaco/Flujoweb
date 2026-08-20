# Technical Exploration & Refactor Plan: Systems 11–15

## 1. Observation

Direct code examination of systems 11–15 was conducted across all source files in `c:\DevWork\Depredador\Flujoweb\sistemas\`:

### System 11: `sistemas/mulesoft-observability/index.html` (Total lines: 414)
- **Fluid Typography (`clamp()`)**:
  - Line 43: `.hdr__badge` font-size is hardcoded `.72rem`.
  - Line 48: `.hdr h1` has `font-size: clamp(1.5rem,3.6vw,2.3rem)`. On 4K viewports (>2560px) it under-scales; on mobile (<380px) it causes multi-line wrapping.
  - Line 53: `.hdr p` has static `font-size: .85rem`.
  - Line 65: `.card__title` has static `font-size: .85rem`.
  - Line 75: `.tier-tag` has static `font-size: .65rem`.
  - Line 87: `.api-node__name` has static `font-size: .74rem` and `white-space: nowrap` which truncates text on small card widths.
  - Line 118: `.btn` has static `font-size: .82rem`.
  - Line 133: `.log-head h3` has static `font-size: .76rem`.
- **Fixed Heights & Overflow Bugs**:
  - Line 109: `.dw-editor` has `max-height: 150px; overflow-y: auto`. Needs minimum height support (`min-height: 140px; max-height: 240px;`).
  - Line 134: `.log-body` has `max-height: 220px; overflow-y: auto`. Needs fluid min/max bounds (`min-height: 180px; max-height: 280px;`).
- **Z-Index Layering**:
  - Lines 28, 33: `body::before`, `body::after` set `z-index: 0` (Canvas/Background).
  - Line 36: `.app` sets `z-index: 1`. Per standard, interactive app shell / cards should be `z-index: 2`.
  - Line 93: `.flow-arrow` lacks explicit `z-index: 1` (Energy flow tracks / connection lines).
- **Responsive Layout & Grid**:
  - Line 80: `.node-group` uses `grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))`. Reducing `minmax` to `130px` prevents 1-column drops on 360px viewports.

---

### System 12: `sistemas/apigee-mulesoft-hybrid/index.html` (Total lines: 2355)
- **Fluid Typography (`clamp()`)**:
  - Line 139: `.hdr__title-box h1` has `font-size: clamp(1.1rem, 2.2vw, 1.45rem)`.
  - Line 151: `.hdr__title-box p` has static `font-size: 0.76rem`.
  - Line 171: `.hud-pill` has static `font-size: 0.72rem`.
  - Line 249: `.control-deck__label` has static `font-size: 0.76rem`.
  - Line 278: `.btn-ctrl` has static `font-size: 0.75rem`.
  - Line 399: `.canvas-card__title` has static `font-size: 0.85rem`.
  - Line 519: `.tier-box__title` has static `font-size: 0.88rem`.
  - Line 607: `.waterfall-card__title` has static `font-size: 0.85rem`.
  - Line 636: `.stat-item__val` has static `font-size: 0.95rem`.
  - Line 787: `.dial-value-text` has static `font-size: 1.1rem`.
  - Line 834: `.code-card__title, .log-card__title` has static `font-size: 0.82rem`.
- **Fixed Heights & Overflow Bugs**:
  - Line 431: `.canvas-container` has rigid `height: 280px`.
  - Line 648: `.waterfall-bar-track` has rigid `height: 24px`.
  - Line 875: `.code-viewer` has rigid `height: 240px`.
  - Line 924: `.log-terminal` has rigid `height: 240px`.
- **Z-Index Layering**:
  - Lines 72, 82: `body::before`, `body::after` set `z-index: 0`.
  - Line 87: `.cockpit-app` sets `z-index: 1` (Should be `z-index: 2` for cards/NOC components).
  - Line 430: `.canvas-container` and `#packetCanvas` operate at layer `z-index: 0` / `z-index: 1`.
- **Grid Fluidity**:
  - Line 267: `.control-deck__buttons` uses `grid-template-columns: repeat(auto-fit, minmax(170px, 1fr))`.
  - Line 710: `.dials-grid` has static 4 columns with media query overrides at 900px and 480px. Converting to `repeat(auto-fit, minmax(160px, 1fr))` creates fluid scaling at all widths.

---

### System 13: `sistemas/emergency-evacuation-v1/index.html` (Total lines: 2515)
- **Fluid Typography (`clamp()`)**:
  - Line 128: `.branding-title` has static `font-size: 1.15rem`.
  - Line 150: `.branding-subtitle` has static `font-size: 0.75rem`.
  - Line 327: `.panel-title` has static `font-size: 0.8rem`.
  - Line 554: `.broadcast-headline` has static `font-size: 1.1rem`.
  - Line 565: `.broadcast-desc` has static `font-size: 0.78rem`.
  - Line 580: `.tactical-broadcast-btn` has static `font-size: 0.95rem`.
  - Line 692: `.hc-number` has static `font-size: 1.6rem`.
  - Line 815: `.brigade-callsign` has static `font-size: 0.85rem`.
  - Line 1059: `.modal-title` has static `font-size: 0.95rem`.
- **Fixed Heights & Overflow Bugs**:
  - Line 715: `.chart-container` has rigid `height: 220px`.
  - Line 933: `.schematic-box` has rigid `height: 180px`.
  - Line 954: `.log-stream-box` has rigid `height: 140px`.
  - Line 1176: `.occupant-roster-list` has rigid `max-height: 180px`.
- **Z-Index Layering**:
  - Line 60: `body::before` sets `z-index: 0`.
  - Line 68: `#strobe-overlay` has rogue `z-index: 999`. Must be normalized to `z-index: 90` (below modals at `z-index: 100`).
  - Line 90: `header.tactical-header` has `z-index: 10`.
  - Line 280: `main.tactical-main` sets `z-index: 1`. Must be `z-index: 2` (Cards/Panels).
  - Line 1015: `.modal-backdrop` sets `z-index: 1000`. Must be `z-index: 100` (Modals/Drawers standard).
- **Grid Fluidity**:
  - Line 628: `.headcount-grid` has rigid 4 columns (`repeat(4, 1fr)`).
  - Line 1104: `.rooms-grid` has rigid 4 columns (`repeat(4, 1fr)`).

---

### System 14: `sistemas/emergency-evacuation-v2/index.html` (Total lines: 2774)
- **Viewport Shell & Responsive Architecture Issue**:
  - Line 111: `.app-viewport` is constrained by default to `max-width: 440px; margin: 20px auto;`.
  - Line 137: `.phone-housing` renders a simulated smartphone chassis (`border: 3px solid #23344d; border-radius: 40px;`).
  - Line 144: `.phone-notch-area` renders a fixed mobile Dynamic Island notch.
  - Line 328: `.app-main-content` is locked with `max-height: 85vh; overflow-y: auto;`.
  - On desktop/tablet viewports (768px – 3840px / 4K), the application is artificially trapped in a tiny 440px phone box unless manually toggled into fullscreen.
  - Required: Implement an automatic fluid responsive shell via media queries (`@media (min-width: 768px)`, `@media (min-width: 1200px)`, `@media (min-width: 1800px)`) that transforms the interface into a spacious 2-column tactical occupant cockpit with dynamic blueprint canvas scaling and unconstrained height.
- **Fluid Typography (`clamp()`)**:
  - Line 278: `.strobe-title` has static `font-size: 13px`.
  - Line 301: `.strobe-message-box` has static `font-size: 11.5px`.
  - Line 457: `.blueprint-title` has static `font-size: 12px`.
  - Line 581: `.tel-value` has static `font-size: 12px`.
  - Line 610: `.guidance-title` has static `font-size: 11px`.
  - Line 678: `.btn-action-primary` has static `font-size: 13px`.
  - Line 716: `.btn-action-sos` has static `font-size: 13px`.
  - Line 764: `.mesh-title` has static `font-size: 11px`.
  - Line 853: `.asset-name` has static `font-size: 10.5px`.
- **Fixed Heights & Overflow Bugs**:
  - Line 487: `#floorplan-canvas` has `max-height: 380px`.
  - Line 792: `.mesh-svg-container` has rigid `height: 110px`.
  - Line 873: `.terminal-drawer` has rigid `max-height: 120px`.
- **Z-Index Layering Violation**:
  - Line 87: `body::before` (Scanlines) sets `z-index: 9999;`! This blocks proper layering. Must be changed to `z-index: 0; pointer-events: none;`.
  - Line 101: `.ambient-grid` sets `z-index: 1`. Must be `z-index: 0`.
  - Line 109: `.app-viewport` sets `z-index: 10`. Must be `z-index: 2` (Cards/Nodes layer).
  - Line 151: `.phone-notch-area` sets `z-index: 20`. Must be `z-index: 2`.
  - Line 925: `.modal-overlay` sets `z-index: 100` (Conforms to standard).

---

### System 15: `sistemas/emergency-evacuation-v3/index.html` (Total lines: 2734)
- **Fluid Typography (`clamp()`)**:
  - Line 137: `.brand-title-group h1` has static `font-size: 17px`.
  - Line 154: `.brand-subtitle` has static `font-size: 11px`.
  - Line 180: `.tactical-btn` has static `font-size: 13px`.
  - Line 312: `.kpi-value` has static `font-size: 16px`.
  - Line 421: `.panel-title` has static `font-size: 13.5px`.
  - Line 507: `.carrier-name` has static `font-size: 13px`.
  - Line 920: `.sla-item .value` has static `font-size: 13px`.
- **Fixed Heights & Overflow Bugs**:
  - Line 727: `.canvas-panel` has `min-height: 500px`.
  - Line 773: `.canvas-viewport-wrapper` has rigid `min-height: 440px`.
  - Line 881: `.histogram-container` has rigid `height: 230px`.
  - Line 931: `.terminal-panel` has `min-height: 280px`.
  - Line 964: `.terminal-body` has `max-height: 320px`.
- **Z-Index Layering**:
  - Line 102: `.tactical-header` has `z-index: 100; position: sticky;`. Must be reduced to `z-index: 10` so overlays/modals at `z-index: 100` always stay strictly on top.
  - Line 801: `.canvas-overlay-legend` has `z-index: 10`. Change to `z-index: 2`.
  - Line 837: `.canvas-node-inspector` has `z-index: 20`. Change to `z-index: 2` (or floating HUD widget at z:10).
- **Grid Fluidity**:
  - Line 263: `.kpi-bar` uses `grid-template-columns: repeat(auto-fit, minmax(130px, 1fr))`.
  - Line 368: `.app-workspace` uses `grid-template-columns: 360px 1fr 390px`. Ensure smooth collapse down to 360px without horizontal overflow.

---

## 2. Logic Chain

1. **Root Cause of Layout Fragility**: Fixed font sizes (`px`, `.85rem`) coupled with hardcoded container heights (`height: 240px`, `max-height: 120px`) fail when viewport sizes change between 360px (mobile phones) and 3840px (4K monitors).
2. **Fluid Typography Solution**: Using CSS `clamp(min, preferred_vw, max)` allows smooth, mathematical font scaling without media-query snapping.
3. **Fluid Container Height Solution**: Replacing rigid `height: Xpx` with `min-height: Xpx; height: clamp(...)` and `max-height` ensures content never overflows its visual boundary or clips text during layout shifts.
4. **Z-Index Unification Rationale**: The ecosystem contract specifies:
   - `z-index: 0`: Background canvas, scanline filters, ambient glows, ambient grid.
   - `z-index: 1`: SVG connection lines, animated packet tracks, flow arrows.
   - `z-index: 2`: Interactive cards, step nodes, telemetry panels, header HUDs.
   - `z-index: 100`: Floating inspection tooltips, modal dialog backdrops, slide-out drawers.
   *System 14 had a scanline layer at `z-index: 9999` and System 13 had `#strobe-overlay` at `z-index: 999` and modal backdrops at `z-index: 1000` — all violating strict stratification.*
5. **System 14 Viewport Transformation**: By default, System 14 wraps its content in a 440px phone container. Adding media queries at `>=768px`, `>=1200px`, and `>=1800px` unlocks a full-width tactical occupant cockpit, matching the visual caliber of Systems 13 and 15 while preserving phone framing on mobile (<768px).

---

## 3. Caveats

- **Canvas Coordinate Scaling**: In Systems 12, 14, and 15, canvas elements (`#packetCanvas`, `#floorplan-canvas`, `#particle-canvas`) have JavaScript rendering loops that measure `canvas.clientWidth` or set internal resolution via `canvas.width = ...`. CSS dimension changes must maintain canvas aspect ratio or call canvas resize handlers upon `window.resize` to prevent blurry canvas pixels.
- **Audio Synthesis**: Sound toggles in Systems 12, 14, and 15 utilize Web Audio / Speech Synthesis. CSS refactoring does not interfere with audio contexts, but UI mute button selectors must remain intact.

---

## 4. Conclusion & Actionable Implementation Instructions

### Exact Replacement Instructions for Milestone 1 Implementer:

#### 1. System 11: `sistemas/mulesoft-observability/index.html`
- **Replace CSS in `<style>`**:
  ```css
  /* Z-Index Stratification */
  body::before, body::after { z-index: 0; }
  .flow-arrow { z-index: 1; font-size: clamp(0.65rem, 1.2vw, 0.75rem); }
  .app, .card, .log-card { position: relative; z-index: 2; }

  /* Fluid Typography */
  .hdr__badge { font-size: clamp(0.68rem, 1.2vw, 0.78rem); }
  .hdr h1 { font-size: clamp(1.4rem, 3.8vw, 2.5rem); }
  .hdr p { font-size: clamp(0.78rem, 1.6vw, 0.92rem); }
  .card__title { font-size: clamp(0.8rem, 1.6vw, 0.95rem); }
  .tier-tag { font-size: clamp(0.6rem, 1.2vw, 0.72rem); }
  .api-node__name { font-size: clamp(0.7rem, 1.4vw, 0.82rem); white-space: normal; word-break: break-word; }
  .btn { font-size: clamp(0.75rem, 1.5vw, 0.88rem); }
  .log-head h3 { font-size: clamp(0.72rem, 1.4vw, 0.85rem); }

  /* Fluid Heights & Containers */
  .node-group { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; }
  .dw-editor { min-height: 140px; max-height: 240px; overflow-y: auto; }
  .log-body { min-height: 180px; max-height: 280px; overflow-y: auto; }
  ```

#### 2. System 12: `sistemas/apigee-mulesoft-hybrid/index.html`
- **Replace CSS in `<style>`**:
  ```css
  /* Z-Index Stratification */
  body::before, body::after { z-index: 0; }
  .canvas-container { position: relative; z-index: 0; }
  .cockpit-app, .hdr, .control-deck, .tier-box, .waterfall-card, .dial-card, .code-card, .log-card, .footer-bar { position: relative; z-index: 2; }

  /* Fluid Typography */
  .hdr__title-box h1 { font-size: clamp(1.1rem, 2.8vw, 1.75rem); }
  .hdr__title-box p { font-size: clamp(0.7rem, 1.4vw, 0.82rem); }
  .hud-pill { font-size: clamp(0.65rem, 1.2vw, 0.75rem); }
  .control-deck__label { font-size: clamp(0.7rem, 1.4vw, 0.82rem); }
  .btn-ctrl { font-size: clamp(0.68rem, 1.3vw, 0.78rem); }
  .canvas-card__title, .waterfall-card__title { font-size: clamp(0.75rem, 1.5vw, 0.92rem); }
  .tier-box__title { font-size: clamp(0.8rem, 1.6vw, 0.95rem); }
  .stat-item__val { font-size: clamp(0.85rem, 1.8vw, 1.1rem); }
  .dial-value-text { font-size: clamp(0.95rem, 2vw, 1.25rem); }
  .code-card__title, .log-card__title { font-size: clamp(0.74rem, 1.5vw, 0.88rem); }

  /* Fluid Heights & Containers */
  .control-deck__buttons { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
  .canvas-container { min-height: 220px; height: clamp(220px, 28vw, 320px); }
  .waterfall-bar-track { min-height: 24px; height: clamp(24px, 3vw, 32px); }
  .dials-grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
  .code-viewer { min-height: 200px; max-height: 320px; height: auto; }
  .log-terminal { min-height: 200px; max-height: 320px; height: auto; }
  ```

#### 3. System 13: `sistemas/emergency-evacuation-v1/index.html`
- **Replace CSS in `<style>`**:
  ```css
  /* Z-Index Stratification */
  body::before { z-index: 0; }
  .chart-container, .schematic-box { z-index: 0; }
  main.tactical-main, header.tactical-header, .hud-panel { position: relative; z-index: 2; }
  #strobe-overlay { z-index: 90; }
  .modal-backdrop { z-index: 100; }

  /* Fluid Typography */
  .branding-title { font-size: clamp(0.95rem, 2.2vw, 1.35rem); }
  .branding-subtitle { font-size: clamp(0.68rem, 1.2vw, 0.8rem); }
  .panel-title { font-size: clamp(0.72rem, 1.4vw, 0.88rem); }
  .broadcast-headline { font-size: clamp(0.95rem, 2.2vw, 1.35rem); }
  .broadcast-desc { font-size: clamp(0.7rem, 1.3vw, 0.82rem); }
  .tactical-broadcast-btn { font-size: clamp(0.8rem, 1.6vw, 1rem); }
  .hc-number { font-size: clamp(1.3rem, 2.8vw, 1.9rem); }
  .brigade-callsign { font-size: clamp(0.75rem, 1.5vw, 0.95rem); }
  .modal-title { font-size: clamp(0.85rem, 1.8vw, 1.1rem); }

  /* Fluid Heights & Containers */
  .headcount-grid { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); }
  .rooms-grid { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); }
  .chart-container { min-height: 200px; height: clamp(200px, 25vw, 280px); }
  .schematic-box { min-height: 160px; height: clamp(160px, 20vw, 220px); }
  .log-stream-box { min-height: 120px; max-height: 220px; height: auto; }
  .occupant-roster-list { min-height: 120px; max-height: 240px; }
  ```

#### 4. System 14: `sistemas/emergency-evacuation-v2/index.html`
- **Replace CSS in `<style>`**:
  ```css
  /* Z-Index Stratification */
  body::before { z-index: 0; pointer-events: none; }
  .ambient-grid, .canvas-container { z-index: 0; }
  .app-viewport, .phone-housing, .phone-notch-area { position: relative; z-index: 2; }
  .modal-overlay { z-index: 100; }

  /* Responsive Shell & Fluid Viewport */
  .app-viewport {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 440px;
    margin: 16px auto;
    padding: 12px;
    transition: max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (min-width: 768px) {
    .app-viewport {
      max-width: min(94vw, 1400px);
      margin: 24px auto;
      padding: 20px;
    }
    .phone-housing {
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-hud);
      box-shadow: 0 15px 40px rgba(0,0,0,0.6);
    }
    .phone-notch-area {
      display: none;
    }
    .app-main-content {
      display: grid !important;
      grid-template-columns: 1.25fr 0.75fr;
      grid-template-rows: auto;
      gap: 20px;
      max-height: none;
      overflow-y: visible;
    }
  }

  @media (min-width: 1440px) {
    .app-viewport {
      max-width: min(92vw, 1800px);
    }
    .app-main-content {
      grid-template-columns: 1.4fr 0.8fr;
      gap: 24px;
    }
  }

  @media (min-width: 2560px) {
    .app-viewport {
      max-width: 2200px;
    }
  }

  /* Fluid Typography */
  .strobe-title { font-size: clamp(12px, 1.8vw, 15px); }
  .strobe-message-box { font-size: clamp(11px, 1.4vw, 13px); }
  .blueprint-title { font-size: clamp(11px, 1.5vw, 14px); }
  .tel-value { font-size: clamp(12px, 1.6vw, 15px); }
  .guidance-title { font-size: clamp(10.5px, 1.4vw, 13px); }
  .btn-action-primary, .btn-action-sos { font-size: clamp(12px, 1.8vw, 15px); }
  .mesh-title { font-size: clamp(10.5px, 1.4vw, 13px); }
  .asset-name { font-size: clamp(10px, 1.3vw, 12px); }

  /* Fluid Heights */
  #floorplan-canvas { min-height: 280px; max-height: clamp(340px, 48vh, 600px); }
  .mesh-svg-container { min-height: 100px; height: clamp(100px, 14vw, 150px); }
  .terminal-drawer { min-height: 100px; max-height: 220px; }
  ```

#### 5. System 15: `sistemas/emergency-evacuation-v3/index.html`
- **Replace CSS in `<style>`**:
  ```css
  /* Z-Index Stratification */
  body::before, .canvas-viewport-wrapper, .histogram-container { z-index: 0; }
  .tactical-header { position: sticky; top: 0; z-index: 10; }
  .app-workspace, .tactical-panel, .canvas-overlay-legend, .canvas-node-inspector { position: relative; z-index: 2; }
  .modal-overlay, .modal-backdrop { z-index: 100; }

  /* Fluid Typography */
  .brand-title-group h1 { font-size: clamp(14px, 2.2vw, 19px); }
  .brand-subtitle { font-size: clamp(10px, 1.2vw, 12px); }
  .tactical-btn { font-size: clamp(11.5px, 1.5vw, 13.5px); }
  .kpi-value { font-size: clamp(14px, 2vw, 18px); }
  .panel-title { font-size: clamp(12px, 1.6vw, 15px); }
  .carrier-name { font-size: clamp(11.5px, 1.5vw, 14px); }
  .sla-item .value { font-size: clamp(12px, 1.6vw, 15px); }

  /* Fluid Heights & Containers */
  .canvas-panel { min-height: clamp(380px, 50vh, 600px); }
  .canvas-viewport-wrapper { min-height: clamp(340px, 44vh, 520px); }
  .histogram-container { min-height: 200px; height: clamp(200px, 25vh, 280px); }
  .terminal-panel { min-height: 240px; }
  .terminal-body { min-height: 180px; max-height: 320px; }
  ```

---

## 5. Verification Method

To independently verify these findings and check the implementation:

1. **Static Analysis / Inspection**:
   - Inspect files at paths `sistemas/mulesoft-observability/index.html`, `sistemas/apigee-mulesoft-hybrid/index.html`, `sistemas/emergency-evacuation-v1/index.html`, `sistemas/emergency-evacuation-v2/index.html`, and `sistemas/emergency-evacuation-v3/index.html`.
   - Verify all CSS font sizes on titles, subheadings, badges, and meters use `clamp(min, preferred, max)`.
   - Verify all `z-index` properties strictly adhere to the layers `0 (Canvas/Bg) -> 1 (Lines/Tracks) -> 2 (Cards/Nodes) -> 100 (Modals/Drawers)`.
2. **Automated Viewport Resizing Tests**:
   - Launch automated browser tests (via CDP / Playwright / Puppeteer runner) resizing viewports sequentially through `[360x640, 768x1024, 1280x800, 1920x1080, 2560x1440, 3840x2160]`.
   - Assert `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal scrolling / overflow).
   - Assert all text elements have bounding client rect width > 0 and height > 0 without clipping or text overlapping.
3. **Canvas Drawing Verification**:
   - Ensure particle streams and topological canvases in Systems 12, 14, and 15 animate smoothly at 60 FPS across all viewports without distortion or coordinate desynchronization.
