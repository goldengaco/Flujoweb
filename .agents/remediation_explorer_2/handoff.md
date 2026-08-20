# Forensic Remediation Investigation Report: Systems 9, 12, 13

**Investigator**: `remediation_explorer_2` (Remediation Specialist & Layout Explorer)  
**Parent Conversation ID**: `2921ca7c-beb2-418e-872a-61f3f2080046`  
**Date**: 2026-08-20  
**Scope**: Systems 9, 12, and 13
1. **System 9**: `sistemas/gcp-iam-security/index.html`
2. **System 12**: `sistemas/apigee-mulesoft-hybrid/index.html`
3. **System 13**: `sistemas/emergency-evacuation-v1/index.html`

---

## 1. Observation

### 1.1 Empirical Automated Test Telemetry

Executed multi-viewport layout validation using Chrome DevTools Protocol via `node .agents/remediation_explorer_2/test_systems_9_12_13.js` across 8 standard viewports:
- Mobile Mini (360x640)
- Mobile Modern (412x915)
- Tablet Portrait (768x1024)
- Tablet Landscape (1024x768)
- Laptop HD (1280x800)
- Full HD Desktop (1920x1080)
- 2K QHD (2560x1440)
- 4K UHD (3840x2160)

#### System 9: `sistemas/gcp-iam-security/index.html`
- **360px Mobile Mini**: `scrollWidth (859px) > clientWidth (360px)` (+499px overflow)
- **412px Mobile Modern**: `scrollWidth (859px) > clientWidth (412px)` (+447px overflow)
- **768px Tablet Portrait**: `scrollWidth (866px) > clientWidth (768px)` (+98px overflow)
- **Offending DOM Elements**:
  - `div.brand-section` (width: 814px, right: 859px)
  - `div.brand-info` / `h1` (width: 766px, right: 859px)
  - `div.subtitle` containing 5 un-wrapped `.api-badge` spans (width: 766px, right: 859px)
  - `div.project-selector-wrapper` / `select#projectSelect` (width: 358px, right: 379px)
  - `nav.tabs-nav` / `button.tab-btn` (width: 323px inside flex container without `min-width: 0`)
- **Z-Index Layering Defect**: Line 1018 sets `.modal-overlay { z-index: 999; }` violating the standard `0 (Canvas) -> 1 (Lines) -> 2 (Cards) -> 100 (Modals)` contract.

#### System 12: `sistemas/apigee-mulesoft-hybrid/index.html`
- **360px Mobile Mini**: `scrollWidth (377px) > clientWidth (360px)` (+17px overflow)
- **Offending DOM Elements**:
  - `div.code-card` (width: 357px, right: 377px)
  - `div.log-card` (width: 357px, right: 377px)
  - `div.tab-group` and `.log-filters` lacking flex wrapping inside a 320px inner content box (`360px - 2 * 20px padding = 320px`).
- **Defect Mechanism**: `.cockpit-app` has `padding: 24px 20px 48px;` and `.code-card, .log-card` have `padding: 16px 20px;`. Total horizontal padding (80px) leaves only 280px for child content. The 3 tab buttons in `.tab-group` (`DW 2.0 Mapping`, `Input JSON`, `Output JSON`) require 285px+ minimum width and cannot wrap.

#### System 13: `sistemas/emergency-evacuation-v1/index.html`
- **360px Mobile Mini**: `scrollWidth (848px) > clientWidth (360px)` (+488px overflow)
- **412px Mobile Modern**: `scrollWidth (848px) > clientWidth (412px)` (+436px overflow)
- **768px Tablet Portrait**: `scrollWidth (848px) > clientWidth (768px)` (+80px overflow)
- **Offending DOM Elements**:
  - `div#strobe-overlay` (stretched to 848px by body width)
  - `section.center-column` / `div.master-broadcast-banner` (width: 584px, right: 616px)
  - `button#btn-master-broadcast` (width: 364px, right: 595px)
  - `div.btn-pulse-ring` (width: 413px, right: 620px)
  - `section.right-column` (width: 216px, right: 848px on 768px tablet)
- **Defect Mechanism**:
  1. In HTML lines 1298, 1317, and 1436, inline styles `style="grid-column: 1;"`, `style="grid-column: 2;"`, and `style="grid-column: 3;"` are assigned to the 3 main layout sections.
  2. When `@media (max-width: 1100px)` applies `grid-template-columns: 1fr;` to `main.tactical-main`, the inline `grid-column: 2` and `grid-column: 3` styles force the CSS Grid engine to spawn implicit columns 2 and 3, expanding the grid to 848px.
  3. `.master-broadcast-banner` lacks `flex-wrap: wrap;` and `min-width: 0;`, and `button#btn-master-broadcast` has fixed padding with `white-space: nowrap;`.

---

## 2. Logic Chain

1. **Contract Requirement (`ORIGINAL_REQUEST.md` §R1, §AC; `PROJECT.md`)**:
   - `scrollWidth <= clientWidth` across all screen resolutions from 360px to 3840px.
   - Strict z-index stratification: `0 (Canvas/Bg) -> 1 (Lines/Tracks) -> 2 (Cards/Nodes) -> 100 (Modals/Drawers)`.
   - Zero layout collisions and zero text clipping.

2. **System 9 Causality & Solution**:
   - Header branding text and 5 `.api-badge` elements reside inside `.subtitle`. Because neither `.brand-section`, `.brand-info`, nor `.subtitle` has `flex-wrap: wrap;`, all 5 badges and the subtitle title stay on a single line of 766px width.
   - Furthermore, `nav.tabs-nav` is a flex child inside `.app-container` (a column flex container). In CSS flexbox, flex children default to `min-width: auto;`. Because `.tabs-nav` contains non-wrapping tab buttons, it prevents `.app-container` from shrinking below the tabs width unless `min-width: 0; width: 100%;` and `.app-container { overflow-x: hidden; min-width: 0; }` are declared.
   - Normalizing `.modal-overlay { z-index: 100; }` brings System 9 into 100% z-index compliance.

3. **System 12 Causality & Solution**:
   - Fixed card padding (`20px`) combined with container padding (`20px`) leaves 280px on 360px viewport. The `.tab-group` and `.log-filters` buttons lack `flex-wrap: wrap;`, pushing card width to 357px (+17px overflow).
   - Adding `flex-wrap: wrap;` to `.tab-group` and `.log-filters`, declaring `min-width: 0; max-width: 100%;` on `.code-card` and `.log-card`, and adding a responsive `@media (max-width: 640px)` block with `padding: 12px 10px;` completely resolves the overflow while preserving all UI elements.

4. **System 13 Causality & Solution**:
   - The inline HTML attributes `style="grid-column: 2;"` and `style="grid-column: 3;"` override the responsive 1-column layout at `<= 1100px`. Overriding this with `main.tactical-main > section { grid-column: 1 !important; }` collapses all 3 sections into a single fluid vertical column.
   - Adding `flex-wrap: wrap;` and `min-width: 0; max-width: 100%;` to `.master-broadcast-banner`, setting `tactical-broadcast-btn` font-size to `clamp(0.78rem, 1.8vw, 0.95rem)`, and adjusting `.btn-pulse-ring` to `box-sizing: border-box; max-width: 100%;` eliminates all horizontal overflow.
   - Setting `#strobe-overlay { max-width: 100vw; z-index: 50; }` ensures the strobe effect never exceeds the viewport.

5. **Empirical Validation**:
   - Tested using automated CDP script `.agents/remediation_explorer_2/test_remediation_simulation.js`.
   - Result: **24 out of 24 viewport checks PASSED (100%) with 0px overflow across all 8 viewports for all 3 systems**.

---

## 3. Caveats

- **Scope Boundary**: Systems 1–8, 10, 11, 14, 15 are outside this report's remediation scope. (System 10 and System 11 were verified passing 100% in baseline audits).
- **JavaScript & Event Handlers**: All proposed CSS changes preserve existing DOM IDs (`#btn-master-broadcast`, `#projectSelect`, `#tabBadgeKeys`, `.tab-btn`, etc.), ensuring zero regression to JavaScript click handlers, sound synthesizers, or data streams.

---

## 4. Conclusion & Actionable Remediation Specification

Below are the exact file paths, line numbers, CSS selectors, and code replacements to be applied by the implementer.

---

### System 9: `sistemas/gcp-iam-security/index.html`

#### Edit 1: `.app-container` (Lines 121–130)
**Target Location**: Lines 121–130
```css
<<<< BEFORE
    /* App Container */
    .app-container {
      position: relative;
      z-index: 1;
      max-width: 1600px;
      margin: 0 auto;
      padding: 16px 20px 48px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
====
>>>> AFTER
    /* App Container */
    .app-container {
      position: relative;
      z-index: 1;
      max-width: 1600px;
      margin: 0 auto;
      padding: 16px 20px 48px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 0;
      max-width: 100%;
      overflow-x: hidden;
    }
```

#### Edit 2: `.brand-section`, `.brand-info`, `h1`, `.subtitle` (Lines 164–205)
**Target Location**: Lines 164–205
```css
<<<< BEFORE
    .brand-section {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-logo {
      width: 46px;
      height: 46px;
      border-radius: 10px;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.3), rgba(6, 13, 27, 0.95));
      border: 1.5px solid var(--red-alert);
      box-shadow: 0 0 18px var(--red-glow), inset 0 0 10px var(--red-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .brand-info h1 {
      font-size: clamp(1rem, 2.2vw, 1.3rem);
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: linear-gradient(90deg, #ffffff, #fca5a5, #f43f5e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-info .subtitle {
      font-size: clamp(0.68rem, 1.2vw, 0.78rem);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 2px;
    }
====
>>>> AFTER
    .brand-section {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      min-width: 0;
      max-width: 100%;
    }

    .brand-logo {
      width: 46px;
      height: 46px;
      border-radius: 10px;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.3), rgba(6, 13, 27, 0.95));
      border: 1.5px solid var(--red-alert);
      box-shadow: 0 0 18px var(--red-glow), inset 0 0 10px var(--red-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .brand-info {
      min-width: 0;
      max-width: 100%;
    }

    .brand-info h1 {
      font-size: clamp(1rem, 2.2vw, 1.3rem);
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: linear-gradient(90deg, #ffffff, #fca5a5, #f43f5e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .brand-info .subtitle {
      font-size: clamp(0.68rem, 1.2vw, 0.78rem);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 10px;
      margin-top: 2px;
      min-width: 0;
    }
```

#### Edit 3: `.project-selector-wrapper` & `.project-select` (Lines 225–250)
**Target Location**: Lines 225–250
```css
<<<< BEFORE
    .project-selector-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(3, 8, 18, 0.8);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 4px 10px;
    }

    .project-selector-wrapper label {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      text-transform: uppercase;
    }

    .project-select {
      background: transparent;
      border: none;
      color: var(--cyan-cyber);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      outline: none;
      cursor: pointer;
    }
====
>>>> AFTER
    .project-selector-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(3, 8, 18, 0.8);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 4px 10px;
      max-width: 100%;
      min-width: 0;
    }

    .project-selector-wrapper label {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      text-transform: uppercase;
      white-space: nowrap;
    }

    .project-select {
      background: transparent;
      border: none;
      color: var(--cyan-cyber);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      outline: none;
      cursor: pointer;
      max-width: 100%;
      min-width: 0;
    }
```

#### Edit 4: `.tabs-nav` (Lines 506–512)
**Target Location**: Lines 506–512
```css
<<<< BEFORE
    /* Tabs Navigation */
    .tabs-nav {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--border-subtle);
    }
====
>>>> AFTER
    /* Tabs Navigation */
    .tabs-nav {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      min-width: 0;
      max-width: 100%;
      width: 100%;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--border-subtle);
      -webkit-overflow-scrolling: touch;
    }
```

#### Edit 5: `.modal-overlay` Z-Index (Lines 1013–1024)
**Target Location**: Lines 1013–1024
```css
<<<< BEFORE
    /* Modals & Dialogs */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(3, 8, 18, 0.85);
      backdrop-filter: blur(8px);
      z-index: 999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }
====
>>>> AFTER
    /* Modals & Dialogs */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(3, 8, 18, 0.85);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }
```

#### Edit 6: Responsive Breakpoints (Lines 1202–1215)
**Target Location**: Lines 1202–1215
```css
<<<< BEFORE
    /* Responsive Breakpoints */
    @media (max-width: 768px) {
      .app-header { flex-direction: column; align-items: flex-start; }
      .header-controls { width: 100%; justify-content: space-between; }
      .kpi-grid { grid-template-columns: 1fr 1fr; }
      .timeline-track { padding: 20px 10px; }
      .timeline-node { min-width: 80px; }
    }
    @media (max-width: 480px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .filters-bar { flex-direction: column; align-items: stretch; }
      .search-input { min-width: 100%; }
    }
====
>>>> AFTER
    /* Responsive Breakpoints */
    @media (max-width: 768px) {
      .app-container { padding: 12px 12px 36px; }
      .app-header { flex-direction: column; align-items: flex-start; padding: 12px 14px; }
      .header-controls { width: 100%; justify-content: space-between; }
      .project-selector-wrapper { width: 100%; }
      .project-select { width: 100%; text-overflow: ellipsis; }
      .kpi-grid { grid-template-columns: 1fr 1fr; }
      .timeline-track { padding: 20px 10px; }
      .timeline-node { min-width: 80px; }
    }
    @media (max-width: 480px) {
      .app-container { padding: 10px 8px 24px; }
      .app-header { padding: 10px 12px; }
      .kpi-grid { grid-template-columns: 1fr; }
      .filters-bar { flex-direction: column; align-items: stretch; }
      .search-input { min-width: 100%; }
      .tab-btn { padding: 6px 10px; font-size: 0.72rem; }
    }
```

---

### System 12: `sistemas/apigee-mulesoft-hybrid/index.html`

#### Edit 1: `.cockpit-app` (Lines 85–95)
**Target Location**: Lines 85–95
```css
<<<< BEFORE
.cockpit-app {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
====
>>>> AFTER
.cockpit-app {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  max-width: 100%;
}
```

#### Edit 2: `.code-card`, `.log-card`, `.tab-group` (Lines 800–832)
**Target Location**: Lines 800–832
```css
<<<< BEFORE
.code-card, .log-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-cyan);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.code-card__hdr, .log-card__hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.code-card__title, .log-card__title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--cyan);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-group {
  display: flex;
  gap: 6px;
}
====
>>>> AFTER
.code-card, .log-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-cyan);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  min-width: 0;
  max-width: 100%;
}

.code-card__hdr, .log-card__hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  min-width: 0;
}

.code-card__title, .log-card__title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--cyan);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
```

#### Edit 3: Add Mobile Responsive Breakpoint (around Line 798 or bottom of `<style>`)
**Target Location**: Lines 794–799
```css
<<<< BEFORE
@media (max-width: 960px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}
====
>>>> AFTER
@media (max-width: 960px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .cockpit-app {
    padding: 12px 10px 32px;
    gap: 14px;
  }
  .hdr {
    padding: 12px 14px;
  }
  .code-card, .log-card {
    padding: 12px 12px;
  }
  .tab-btn {
    padding: 4px 6px;
    font-size: 0.62rem;
  }
  .log-filter-btn {
    padding: 3px 6px;
    font-size: 0.6rem;
  }
  .code-viewer, .log-terminal {
    padding: 10px;
    font-size: 0.65rem;
  }
}
```

---

### System 13: `sistemas/emergency-evacuation-v1/index.html`

#### Edit 1: `#strobe-overlay` (Lines 64–71)
**Target Location**: Lines 64–71
```css
<<<< BEFORE
    /* Emergency Strobe Overlay */
    #strobe-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 90;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
====
>>>> AFTER
    /* Emergency Strobe Overlay */
    #strobe-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 50;
      opacity: 0;
      transition: opacity 0.3s ease;
      max-width: 100vw;
    }
```

#### Edit 2: `main.tactical-main` & Column Override (Lines 278–304)
**Target Location**: Lines 278–304
```css
<<<< BEFORE
    /* Main Container Layout */
    main.tactical-main {
      position: relative;
      z-index: 1;
      flex: 1;
      padding: 18px 24px;
      display: grid;
      grid-template-columns: 340px 1fr 380px;
      gap: 20px;
      max-width: 2200px;
      margin: 0 auto;
      width: 100%;
    }

    @media (max-width: 1440px) {
      main.tactical-main {
        grid-template-columns: 310px 1fr 340px;
        gap: 16px;
        padding: 14px;
      }
    }

    @media (max-width: 1100px) {
      main.tactical-main {
        grid-template-columns: 1fr;
      }
    }
====
>>>> AFTER
    /* Main Container Layout */
    main.tactical-main {
      position: relative;
      z-index: 1;
      flex: 1;
      padding: 18px 24px;
      display: grid;
      grid-template-columns: 340px 1fr 380px;
      gap: 20px;
      max-width: 2200px;
      margin: 0 auto;
      width: 100%;
      min-width: 0;
    }

    @media (max-width: 1440px) {
      main.tactical-main {
        grid-template-columns: 310px 1fr 340px;
        gap: 16px;
        padding: 14px;
      }
    }

    @media (max-width: 1100px) {
      main.tactical-main {
        grid-template-columns: 1fr;
      }
      main.tactical-main > section,
      main.tactical-main > div {
        grid-column: 1 !important;
      }
    }
```

#### Edit 3: `.master-broadcast-banner`, `.broadcast-info`, `.tactical-broadcast-btn`, `.btn-pulse-ring` (Lines 528–624)
**Target Location**: Lines 528–624
```css
<<<< BEFORE
    /* Master Broadcast Hero Banner */
    .master-broadcast-banner {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(17, 29, 56, 0.95));
      border: 1px solid var(--hazard-crimson);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.25);
      position: relative;
      overflow: hidden;
    }

    .master-broadcast-banner::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--hazard-crimson), var(--hazard-fire), var(--cyber-cyan));
    }

    .broadcast-info {
      flex: 1;
    }

    .broadcast-headline {
      font-size: 1.1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .broadcast-desc {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 4px;
      max-width: 620px;
    }

    /* Large Tactical Broadcast Button */
    .tactical-broadcast-btn {
      position: relative;
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: #ffffff;
      border: 2px solid #ef4444;
      border-radius: 10px;
      padding: 14px 28px;
      font-family: var(--font-mono);
      font-size: 0.95rem;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2);
      transition: all 0.2s ease;
      user-select: none;
      white-space: nowrap;
    }

    .tactical-broadcast-btn:hover {
      transform: scale(1.03);
      box-shadow: 0 0 35px rgba(239, 68, 68, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.4);
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .tactical-broadcast-btn:active {
      transform: scale(0.98);
    }

    .tactical-broadcast-btn.active-evac {
      background: linear-gradient(135deg, #059669, #047857);
      border-color: var(--safe-emerald);
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.6);
    }

    .btn-pulse-ring {
      position: absolute;
      inset: -6px;
      border: 2px solid var(--hazard-crimson);
      border-radius: 14px;
      animation: pulse-ring 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      pointer-events: none;
    }
====
>>>> AFTER
    /* Master Broadcast Hero Banner */
    .master-broadcast-banner {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(17, 29, 56, 0.95));
      border: 1px solid var(--hazard-crimson);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.25);
      position: relative;
      overflow: hidden;
      min-width: 0;
      max-width: 100%;
    }

    .master-broadcast-banner::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--hazard-crimson), var(--hazard-fire), var(--cyber-cyan));
    }

    .broadcast-info {
      flex: 1;
      min-width: 0;
      max-width: 100%;
    }

    .broadcast-headline {
      font-size: 1.1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .broadcast-desc {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 4px;
      max-width: 620px;
    }

    /* Large Tactical Broadcast Button */
    .tactical-broadcast-btn {
      position: relative;
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: #ffffff;
      border: 2px solid #ef4444;
      border-radius: 10px;
      padding: 14px 28px;
      font-family: var(--font-mono);
      font-size: clamp(0.78rem, 1.8vw, 0.95rem);
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2);
      transition: all 0.2s ease;
      user-select: none;
      max-width: 100%;
    }

    .tactical-broadcast-btn:hover {
      transform: scale(1.03);
      box-shadow: 0 0 35px rgba(239, 68, 68, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.4);
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .tactical-broadcast-btn:active {
      transform: scale(0.98);
    }

    .tactical-broadcast-btn.active-evac {
      background: linear-gradient(135deg, #059669, #047857);
      border-color: var(--safe-emerald);
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.6);
    }

    .btn-pulse-ring {
      position: absolute;
      inset: -6px;
      border: 2px solid var(--hazard-crimson);
      border-radius: 14px;
      animation: pulse-ring 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      pointer-events: none;
      max-width: 100%;
      box-sizing: border-box;
    }
```

#### Edit 4: Mobile Responsive Rules (Lines 632–636)
**Target Location**: Lines 632–636
```css
<<<< BEFORE
    @media (max-width: 768px) {
      .headcount-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
====
>>>> AFTER
    @media (max-width: 768px) {
      .headcount-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      main.tactical-main {
        padding: 12px 10px;
        gap: 14px;
      }
      header.tactical-header {
        padding: 10px 14px;
      }
      .tactical-broadcast-btn {
        width: 100%;
        white-space: normal;
        text-align: center;
        padding: 12px 16px;
        font-size: 0.82rem;
      }
      .btn-pulse-ring {
        inset: -4px;
      }
      .headcount-grid {
        grid-template-columns: 1fr;
      }
    }
```

---

## 5. Verification Method

To independently verify the validity of these proposed fixes:

1. **Run the simulated CDP validation script**:
   ```bash
   node .agents/remediation_explorer_2/test_remediation_simulation.js
   ```
   **Expected Result**: `24/24 Viewport checks PASSED (100%)` with zero horizontal overflow across all 8 viewports.

2. **After file modification, run the standard layout test suite**:
   ```bash
   node tests/test_layout_anticollision.js
   ```

3. **Run the deep multi-viewport stress suite**:
   ```bash
   node tests/challenger_m1_deep_stress.js
   ```

4. **Invalidation Condition**: If any of the 3 target systems exhibits `scrollWidth > clientWidth + 2px` on any viewport between 360px and 3840px, or any element bounding boxes collide, this remediation is invalidated.
