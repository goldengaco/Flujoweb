const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname);
const sistemasDir = path.join(rootDir, 'sistemas');

const doc1 = fs.readFileSync(path.join(sistemasDir, 'mulesoft_80_ideas_observabilidad.md'), 'utf8');
const doc2 = fs.readFileSync(path.join(sistemasDir, 'manual_observabilidad_cloud_sre.md'), 'utf8');
const doc3 = fs.readFileSync(path.join(sistemasDir, 'mulesoft_y_arquitectura_sistemas.md'), 'utf8');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flujoweb Master Enterprise Launchpad Portal — 14 Active Enterprise Systems</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #030712;
      --bg-surface: #0b0f19;
      --bg-card: rgba(15, 23, 42, 0.78);
      --bg-card-hover: rgba(30, 41, 59, 0.88);
      --border-subtle: rgba(56, 189, 248, 0.15);
      --border-glow: rgba(56, 189, 248, 0.45);
      --border-card: rgba(255, 255, 255, 0.08);
      --accent-cyan: #00f0ff;
      --accent-sky: #38bdf8;
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
      --accent-indigo: #818cf8;
      --accent-purple: #c084fc;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --font-main: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', 'Cascadia Code', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      min-height: 100vh;
      background-color: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-main);
      overflow-x: hidden;
      line-height: 1.5;
    }

    /* Strict Z-Index Stratification */
    /* Z:0 Background Canvas & Scanlines */
    #bg-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
      opacity: 0.6;
    }

    .ambient-glow {
      position: fixed;
      top: -20%;
      left: 50%;
      transform: translateX(-50%);
      width: 80vw;
      height: 60vh;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 80%);
      z-index: 0;
      pointer-events: none;
      filter: blur(80px);
    }

    /* Z:1 Decorative connection lines & grid */
    .grid-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 40px 40px;
      z-index: 1;
      pointer-events: none;
    }

    /* Z:2 App Layout & Cards Container */
    .app-container {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 1720px;
      margin: 0 auto;
      padding: clamp(16px, 3vw, 40px);
      display: flex;
      flex-direction: column;
      gap: clamp(24px, 3vw, 40px);
    }

    /* Top Navigation Bar */
    .top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      padding: clamp(12px, 1.5vw, 18px) clamp(16px, 2vw, 28px);
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-card);
      border-radius: 16px;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #00f0ff, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.4);
    }

    .brand-title {
      font-size: clamp(1.1rem, 2vw, 1.35rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(90deg, #ffffff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-tag {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(56, 189, 248, 0.12);
      color: var(--accent-sky);
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-architecture, .btn-docs-trigger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: clamp(0.85rem, 1.2vw, 0.92rem);
      font-weight: 600;
      cursor: pointer;
      border: 1px solid rgba(0, 240, 255, 0.4);
      background: linear-gradient(135deg, rgba(0, 240, 255, 0.12), rgba(99, 102, 241, 0.18));
      color: #ffffff;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
      transition: all 0.25s ease;
      text-decoration: none;
    }

    .btn-architecture:hover, .btn-docs-trigger:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 25px rgba(0, 240, 255, 0.45);
      border-color: var(--accent-cyan);
      background: linear-gradient(135deg, rgba(0, 240, 255, 0.22), rgba(99, 102, 241, 0.3));
    }

    /* Hero Section & HUD */
    .hero, .hero-section {
      display: flex;
      flex-direction: column;
      gap: clamp(20px, 2.5vw, 32px);
      padding: clamp(24px, 3.5vw, 48px);
      background: linear-gradient(145deg, rgba(15, 23, 42, 0.85), rgba(3, 7, 18, 0.95));
      backdrop-filter: blur(16px);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 24px;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }

    .hero-glow-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent-cyan), #818cf8, transparent);
    }

    .hero-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 24px;
    }

    .hero-text {
      flex: 1 1 500px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .hero-badge {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-emerald);
      box-shadow: 0 0 10px var(--accent-emerald);
      animation: pulse-glow 1.8s infinite;
    }

    @keyframes pulse-glow {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.5; }
    }

    .hero-title {
      font-size: clamp(1.8rem, 4vw, 3.2rem);
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1.15;
      background: linear-gradient(135deg, #ffffff 30%, #38bdf8 70%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: clamp(0.95rem, 1.4vw, 1.15rem);
      color: var(--text-secondary);
      max-width: 850px;
      line-height: 1.6;
    }

    /* Telemetry HUD Grid */
    .hud-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      width: 100%;
    }

    .hud-card {
      padding: 16px 20px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-card);
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: border-color 0.2s;
    }

    .hud-card:hover {
      border-color: var(--border-subtle);
    }

    .hud-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .hud-val-group {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .stat-value, .counter-number, #hero-counter, #system-count, #active-systems-count {
      font-size: clamp(1.4rem, 2.5vw, 1.85rem);
      font-weight: 800;
      font-family: var(--font-mono);
      color: #ffffff;
      line-height: 1;
    }

    .hud-unit {
      font-size: 0.8rem;
      color: var(--accent-sky);
      font-weight: 600;
    }

    .hud-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      color: var(--accent-emerald);
      font-family: var(--font-mono);
    }

    /* Control Bar: Search & Category Filter Pills */
    .control-bar {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: clamp(16px, 2vw, 24px);
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-card);
      border-radius: 20px;
    }

    .search-wrapper {
      position: relative;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.1rem;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input, #search-input, #portal-search {
      width: 100%;
      padding: clamp(12px, 1.4vw, 16px) clamp(16px, 2vw, 20px) clamp(12px, 1.4vw, 16px) 48px;
      background: rgba(3, 7, 18, 0.75);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 12px;
      color: #ffffff;
      font-family: var(--font-main);
      font-size: clamp(0.9rem, 1.2vw, 1.02rem);
      transition: all 0.2s ease;
      outline: none;
    }

    .search-input:focus, #search-input:focus, #portal-search:focus {
      border-color: var(--accent-cyan);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
      background: rgba(3, 7, 18, 0.95);
    }

    .filter-pills-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-btn, .category-pill, .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: clamp(0.8rem, 1.1vw, 0.88rem);
      font-weight: 600;
      color: var(--text-secondary);
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid var(--border-card);
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .filter-btn:hover, .category-pill:hover, .filter-chip:hover {
      color: #ffffff;
      border-color: rgba(56, 189, 248, 0.35);
      background: rgba(30, 41, 59, 0.85);
      transform: translateY(-1px);
    }

    .filter-btn.active, .category-pill.active, .filter-chip.active {
      color: #ffffff;
      background: linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(99, 102, 241, 0.3));
      border-color: var(--accent-cyan);
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.25);
    }

    .pill-count {
      padding: 2px 7px;
      border-radius: 10px;
      font-size: 0.72rem;
      font-family: var(--font-mono);
      background: rgba(0, 0, 0, 0.35);
      color: var(--accent-sky);
    }

    /* 14 High-Density System Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(clamp(320px, 28vw, 420px), 1fr));
      gap: clamp(18px, 2vw, 28px);
      width: 100%;
    }

    .system-card, .card {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 480px;
      padding: clamp(20px, 2vw, 26px);
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-card);
      border-radius: 20px;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
    }

    .system-card:hover, .card:hover {
      transform: translateY(-4px);
      border-color: var(--border-glow);
      background: var(--bg-card-hover);
      box-shadow: 0 20px 40px -15px rgba(0, 240, 255, 0.15), 0 0 20px rgba(56, 189, 248, 0.1);
    }

    .card-top {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .card-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .category-tag {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 4px 10px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
    }

    .category-tag[data-cat="emergencia"] {
      background: rgba(244, 63, 94, 0.15);
      border-color: rgba(244, 63, 94, 0.4);
      color: #fda4af;
    }

    .category-tag[data-cat="mulesoft"] {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.4);
      color: #7dd3fc;
    }

    .category-tag[data-cat="gcp-sre"] {
      background: rgba(129, 140, 248, 0.15);
      border-color: rgba(129, 140, 248, 0.4);
      color: #a5b4fc;
    }

    .category-tag[data-cat="seguridad-fintech"] {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.4);
      color: #6ee7b7;
    }

    .card-health-ping {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--accent-emerald);
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .card-canvas-preview {
      width: 100%;
      height: 100px;
      border-radius: 12px;
      background: rgba(3, 7, 18, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.06);
      overflow: hidden;
      position: relative;
    }

    .card-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    .card-title-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .card-title {
      font-size: clamp(1.1rem, 1.5vw, 1.25rem);
      font-weight: 700;
      color: #ffffff;
      line-height: 1.3;
    }

    .card-subtitle {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-sky);
      font-family: var(--font-mono);
    }

    .card-desc {
      font-size: 0.86rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .card-badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .tech-badge {
      font-size: 0.72rem;
      font-family: var(--font-mono);
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
    }

    .card-bottom {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .card-metrics-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .metric-key {
      font-size: 0.68rem;
      text-transform: uppercase;
    }

    .metric-val {
      font-weight: 700;
      color: #e2e8f0;
    }

    .btn-launch, a.btn-launch {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.2));
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #ffffff;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-launch:hover {
      background: linear-gradient(135deg, rgba(0, 240, 255, 0.35), rgba(99, 102, 241, 0.45));
      border-color: var(--accent-cyan);
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.3);
      transform: translateX(2px);
    }

    /* Z:100 Technical Architecture Slide-Out Drawer */
    .drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(3, 7, 18, 0.75);
      backdrop-filter: blur(8px);
      z-index: 99;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .drawer-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    #docs-drawer, .architecture-drawer, .drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: min(920px, 94vw);
      height: 100vh;
      background: #0b0f19;
      border-left: 1px solid rgba(56, 189, 248, 0.3);
      box-shadow: -20px 0 60px rgba(0, 0, 0, 0.9);
      z-index: 100;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #docs-drawer.open, #docs-drawer.active, .architecture-drawer.open, .drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 28px;
      border-bottom: 1px solid var(--border-card);
      background: rgba(15, 23, 42, 0.8);
      gap: 16px;
    }

    .drawer-header-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .drawer-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
    }

    .drawer-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .drawer-close, #btn-close-drawer {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-card);
      color: #ffffff;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .drawer-close:hover, #btn-close-drawer:hover {
      background: rgba(244, 63, 94, 0.2);
      border-color: rgba(244, 63, 94, 0.4);
      color: #fda4af;
    }

    .drawer-tabs-bar {
      display: flex;
      border-bottom: 1px solid var(--border-card);
      background: rgba(3, 7, 18, 0.6);
      overflow-x: auto;
    }

    .doc-tab, .drawer-tab {
      padding: 14px 20px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .doc-tab:hover, .drawer-tab:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.03);
    }

    .doc-tab.active, .drawer-tab.active {
      color: var(--accent-cyan);
      border-bottom-color: var(--accent-cyan);
      background: rgba(0, 240, 255, 0.05);
    }

    .drawer-body, #drawer-content, .drawer-content, .markdown-viewer, #markdown-body {
      flex: 1;
      padding: clamp(20px, 3vw, 36px);
      overflow-y: auto;
      font-size: 0.92rem;
      color: #cbd5e1;
      line-height: 1.7;
    }

    /* Markdown Rich Styling */
    .markdown-body h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
      margin: 1.4em 0 0.6em;
      padding-bottom: 0.4em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .markdown-body h2 {
      font-size: 1.4rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 1.3em 0 0.5em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .markdown-body h3 {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--accent-sky);
      margin: 1.1em 0 0.4em;
    }

    .markdown-body p {
      margin-bottom: 1em;
    }

    .markdown-body ul, .markdown-body ol {
      margin: 0.8em 0 1.2em 1.5em;
    }

    .markdown-body li {
      margin-bottom: 0.4em;
    }

    .markdown-body blockquote {
      margin: 1em 0;
      padding: 12px 18px;
      background: rgba(56, 189, 248, 0.08);
      border-left: 4px solid var(--accent-sky);
      border-radius: 0 10px 10px 0;
      color: #e2e8f0;
    }

    .markdown-body pre {
      margin: 1.2em 0;
      padding: 16px;
      background: #030712;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.84rem;
      color: #38bdf8;
    }

    .markdown-body code {
      font-family: var(--font-mono);
      font-size: 0.85em;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: #38bdf8;
    }

    .markdown-body pre code {
      padding: 0;
      background: transparent;
      color: inherit;
    }

    .markdown-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2em 0;
      font-size: 0.85rem;
    }

    .markdown-body th, .markdown-body td {
      padding: 10px 14px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      text-align: left;
    }

    .markdown-body th {
      background: rgba(15, 23, 42, 0.9);
      color: #ffffff;
      font-weight: 700;
    }

    .markdown-body tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.02);
    }

    .markdown-body hr {
      border: none;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 2em 0;
    }

    /* Footer */
    .portal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 24px clamp(16px, 2vw, 32px);
      border-top: 1px solid var(--border-card);
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 20px;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .footer-right {
      font-family: var(--font-mono);
      font-size: 0.76rem;
    }
  </style>
</head>
<body>
  <canvas id="bg-canvas"></canvas>
  <div class="ambient-glow"></div>
  <div class="grid-overlay"></div>

  <div class="app-container">
    <!-- Top Navigation Bar -->
    <header class="top-nav">
      <div class="brand-group">
        <div class="brand-icon">⚡</div>
        <div>
          <div class="brand-title">FLUJOWEB ENTERPRISE</div>
        </div>
        <span class="brand-tag">v2.5.0-PROD</span>
      </div>
      <div class="nav-actions">
        <button id="btn-docs-drawer" class="btn-architecture btn-docs-trigger" data-action="open-docs">
          <span>📚 Enterprise Architecture Docs</span>
        </button>
      </div>
    </header>

    <!-- Hero Section & Global Telemetry HUD -->
    <section class="hero hero-section" id="hero" data-testid="hero-hud">
      <div class="hero-glow-line"></div>
      <div class="hero-main">
        <div class="hero-text">
          <div class="hero-badge">
            <div class="pulse-dot"></div>
            <span>Global Operations Command • All Systems Live</span>
          </div>
          <h1 class="hero-title">Enterprise Command Launchpad</h1>
          <p class="hero-subtitle">
            Central orchestration portal bridging Google Cloud SRE, Apigee Perimeter Gateways, MuleSoft Runtime Fabric (RTF), High-Frequency Fintech, and Life-Critical Emergency Evacuation ("Salvar Vidas").
          </p>
        </div>
      </div>

      <!-- Live Telemetry HUD -->
      <div class="hud-grid">
        <div class="hud-card">
          <div class="hud-label">Active Enterprise Systems</div>
          <div class="hud-val-group">
            <span id="hero-counter" class="stat-value counter-number">15</span>
            <span class="hud-unit">/ 15 Online</span>
          </div>
          <div class="hud-status-badge">● 14 Active Enterprise Systems</div>
        </div>

        <div class="hud-card">
          <div class="hud-label">Global Availability SLO</div>
          <div class="hud-val-group">
            <span class="stat-value" id="hud-sla">99.998</span>
            <span class="hud-unit">%</span>
          </div>
          <div class="hud-status-badge">● Error Budget: 99.98%</div>
        </div>

        <div class="hud-card">
          <div class="hud-label">Mean Mesh Latency</div>
          <div class="hud-val-group">
            <span class="stat-value" id="hud-latency">18.4</span>
            <span class="hud-unit">ms</span>
          </div>
          <div class="hud-status-badge">● p95 Sub-50ms</div>
        </div>

        <div class="hud-card">
          <div class="hud-label">Global Throughput</div>
          <div class="hud-val-group">
            <span class="stat-value" id="hud-throughput">184.5</span>
            <span class="hud-unit">k req/s</span>
          </div>
          <div class="hud-status-badge">● 0% Dropped Packets</div>
        </div>

        <div class="hud-card">
          <div class="hud-label">System Telemetry Clock</div>
          <div class="hud-val-group">
            <span class="stat-value" id="hud-clock" style="font-size: 1.15rem;">--:--:-- UTC</span>
          </div>
          <div class="hud-status-badge">● Real-Time Sync</div>
        </div>
      </div>
    </section>

    <!-- Search Bar & Category Filter Pills -->
    <section class="control-bar">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          id="search-input" 
          class="search-input" 
          placeholder="Search systems by name, keyword, technology badge (e.g. 'evac', 'gcp', 'mulesoft', 'canary', 'pubsub', 'sql', 'lorawan')..."
          autocomplete="off"
        >
      </div>

      <div class="filter-pills-row">
        <button class="filter-btn category-pill active" data-category="all" data-filter="all">
          <span>🌐 All Systems</span>
          <span class="pill-count" id="count-all">15</span>
        </button>
        <button class="filter-btn category-pill" data-category="emergencia" data-filter="emergencia">
          <span>🚨 Emergencia ("Salvar Vidas")</span>
          <span class="pill-count" id="count-emergencia">3</span>
        </button>
        <button class="filter-btn category-pill" data-category="mulesoft" data-filter="mulesoft">
          <span>🌐 MuleSoft & Apigee</span>
          <span class="pill-count" id="count-mulesoft">2</span>
        </button>
        <button class="filter-btn category-pill" data-category="gcp-sre" data-filter="gcp-sre">
          <span>☁️ Google Cloud SRE</span>
          <span class="pill-count" id="count-gcp">5</span>
        </button>
        <button class="filter-btn category-pill" data-category="seguridad-fintech" data-filter="seguridad-fintech">
          <span>🛡️ Seguridad & Fintech</span>
          <span class="pill-count" id="count-fintech">5</span>
        </button>
      </div>
    </section>

    <!-- 14+ Interactive System Cards Manifest -->
    <main class="cards-grid" id="cards-container">
      <!-- System Cards injected dynamically -->
    </main>

    <!-- Portal Footer -->
    <footer class="portal-footer">
      <div class="footer-left">
        <span>⚡ Flujoweb Enterprise Ecosystem</span>
        <span>•</span>
        <span>Zero External Runtime Dependencies</span>
      </div>
      <div class="footer-right">
        <span>Certified Production Build • 14 Active Enterprise Systems</span>
      </div>
    </footer>
  </div>

  <!-- Technical Architecture Slide-Out Drawer -->
  <div class="drawer-overlay" id="drawer-overlay"></div>
  <aside id="docs-drawer" class="architecture-drawer drawer" data-testid="docs-drawer">
    <div class="drawer-header">
      <div class="drawer-header-left">
        <div class="drawer-title">Enterprise Architecture Documentation</div>
        <div class="drawer-subtitle">Comprehensive Markdown Technical Manuals & Reference Guides</div>
      </div>
      <button id="btn-close-drawer" class="drawer-close" data-action="close-drawer" title="Close Drawer">&times;</button>
    </div>

    <div class="drawer-tabs-bar">
      <button class="doc-tab drawer-tab active" data-doc="ideas">
        <span>📘 80 Ideas Observabilidad MuleSoft</span>
      </button>
      <button class="doc-tab drawer-tab" data-doc="cloud-sre">
        <span>☁️ Manual Observabilidad Cloud SRE</span>
      </button>
      <button class="doc-tab drawer-tab" data-doc="mulesoft-arch">
        <span>🌐 Arquitectura MuleSoft & Apigee</span>
      </button>
    </div>

    <div id="drawer-content" class="drawer-content markdown-viewer markdown-body">
      <!-- Markdown Content rendered here -->
    </div>
  </aside>

  <script>
    // Embedded Technical Documentation Fallbacks (guarantees offline/file:// protocol instant rendering)
    const EMBEDDED_DOCS = {
      'ideas': ${JSON.stringify(doc1)},
      'cloud-sre': ${JSON.stringify(doc2)},
      'mulesoft-arch': ${JSON.stringify(doc3)}
    };

    // Systems Manifest
    const SYSTEMS_MANIFEST = [
      {
        id: 'emergency-evacuation-v1',
        name: 'Command & Control Evacuation Hub',
        subtitle: 'Tactical Building Matrix & Headcount Tally',
        category: 'emergencia',
        categoryLabel: '🚨 Emergencia',
        badges: ['Floor Heatmap', 'LoRaWAN Strobe', 'Occupant Tally', 'Brigade Dispatch'],
        description: 'Master tactical command center for Fire Chiefs and Building Safety Directors. Displays 12-floor interactive occupancy heatmaps, strobe broadcaster, and live safe-vs-trapped headcount tally.',
        href: './emergency-evacuation-v1/index.html',
        metrics: { latency: '18ms', sla: '99.999%', rps: '4.8k msg/s' },
        visType: 'heatmap'
      },
      {
        id: 'emergency-evacuation-v2',
        name: 'Mobile Occupant HUD & A* Route',
        subtitle: 'Dynamic Escape Pathfinding & Web Audio Siren',
        category: 'emergencia',
        categoryLabel: '🚨 Emergencia',
        badges: ['A* Pathfinding', 'Web Audio Siren', 'Speech Synth', 'Beacon HUD'],
        description: 'Personal mobile HUD for building occupants. Computes dynamic vector escape routes around fire hazards with audible tactical sirens, Web Speech voice navigation, and one-tap safe check-ins.',
        href: './emergency-evacuation-v2/index.html',
        metrics: { latency: '12ms', sla: '99.999%', rps: '5.2k req/s' },
        visType: 'path'
      },
      {
        id: 'emergency-evacuation-v3',
        name: 'Multi-Carrier Broadcast Fan-Out',
        subtitle: '5,000+ Device Mass Alert Telemetry Engine',
        category: 'emergencia',
        categoryLabel: '🚨 Emergencia',
        badges: ['FCM Push', 'Twilio SMS', 'LoRaWAN Sirens', 'Latency Histogram'],
        description: 'Massive emergency alert distribution engine fanning out alerts to 5,000+ occupants simultaneously across 4 carrier channels with real-time millisecond delivery histograms and auto-retry.',
        href: './emergency-evacuation-v3/index.html',
        metrics: { latency: '420ms (p99)', sla: '99.995%', rps: '12.4k pkts/s' },
        visType: 'histogram'
      },
      {
        id: 'apigee-mulesoft-hybrid',
        name: 'Apigee + MuleSoft Hybrid Cockpit',
        subtitle: 'Perimeter Gateway Ingress to RTF Worker Mesh',
        category: 'mulesoft',
        categoryLabel: '🌐 MuleSoft',
        badges: ['Apigee X Edge', 'Spike Arrest 10k', 'mTLS / JWT', 'RTF vCores', 'DataWeave 2.0'],
        description: 'Hybrid multi-cloud observability cockpit bridging Apigee perimeter policies (Spike Arrest, JWT verification, WAF, Edge Cache) with MuleSoft Runtime Fabric vCore workers and downstream cloud fan-outs.',
        href: './apigee-mulesoft-hybrid/index.html',
        metrics: { latency: '24ms', sla: '99.99%', rps: '18.5k req/s' },
        visType: 'flow'
      },
      {
        id: 'mulesoft-observability',
        name: 'MuleSoft API-Led Connectivity Hub',
        subtitle: '3-Tier Architecture & Anypoint Runtime Telemetry',
        category: 'mulesoft',
        categoryLabel: '🌐 MuleSoft',
        badges: ['API-Led 3-Tier', 'System / Process / Exp', 'OSv2 Cache', 'Scatter-Gather'],
        description: 'Real-time telemetry and architectural visualizer for MuleSoft Anypoint Platform. Monitors Experience, Process, and System API tiers with DataWeave 2.0 streaming, OSv2 caching, and JVM metrics.',
        href: './mulesoft-observability/index.html',
        metrics: { latency: '36ms', sla: '99.99%', rps: '9.1k req/s' },
        visType: 'tiers'
      },
      {
        id: 'gcp-serverless-pipeline',
        name: 'GCP Serverless Pipeline & Deployer',
        subtitle: 'Cloud Run Canary 95/5 & Auto-Rollback Engine',
        category: 'gcp-sre',
        categoryLabel: '☁️ Cloud SRE',
        badges: ['Cloud Run', 'Canary 95/5', 'Zero-Downtime', 'Cloud Deploy'],
        description: 'Interactive serverless continuous deployment cockpit featuring live Cloud Run traffic shifting (95/5 canary), synthetic health probing, revision comparison, and sub-second automated rollback.',
        href: './gcp-serverless-pipeline/index.html',
        metrics: { latency: '34ms', sla: '99.995%', rps: '14.2k req/s' },
        visType: 'canary'
      },
      {
        id: 'gcp-event-pubsub',
        name: 'GCP Pub/Sub & DLQ Ingestion Console',
        subtitle: 'Event-Driven Message Streaming & Dead-Letter Routing',
        category: 'gcp-sre',
        categoryLabel: '☁️ Cloud SRE',
        badges: ['Cloud Pub/Sub', 'DLQ Routing', 'Exp Backoff', 'Ordering Keys'],
        description: 'High-throughput event streaming console simulating real-time subscriber ingestion, exponential backoff retries, poison pill error injection, and automated Dead Letter Queue (DLQ) redrive.',
        href: './gcp-event-pubsub/index.html',
        metrics: { latency: '8ms', sla: '99.999%', rps: '45.0k msg/s' },
        visType: 'pubsub'
      },
      {
        id: 'gcp-sql-networking',
        name: 'Private VPC Peering & Cloud SQL HA',
        subtitle: 'Cross-AZ Failover & Private Service Access',
        category: 'gcp-sre',
        categoryLabel: '☁️ Cloud SRE',
        badges: ['Cloud SQL HA', 'VPC Peering', 'Cross-AZ Mirror', 'Zero-Data-Loss'],
        description: 'Enterprise relational database topology simulator. Visualizes private VPC peering networks, active-active synchronous replication, zero-data-loss cross-zone failover, and read-replica offloading.',
        href: './gcp-sql-networking/index.html',
        metrics: { latency: '4ms (VPC)', sla: '99.999%', rps: '12.0k QPS' },
        visType: 'db'
      },
      {
        id: 'gcp-iam-security',
        name: 'GCP IAM Security & Secret Vault Auditor',
        subtitle: 'Least Privilege & Secret Manager Auto-Rotation',
        category: 'gcp-sre',
        categoryLabel: '☁️ Cloud SRE',
        badges: ['IAM Least Privilege', 'Secret Manager', 'Auto-Rotation', 'Workload ID'],
        description: 'Security & identity governance console auditing service account permissions, enforcing Workload Identity keyless authentication, and simulating automated 30-day credential rotation cycles.',
        href: './gcp-iam-security/index.html',
        metrics: { latency: '15ms', sla: '100.0%', rps: '3.4k checks/s' },
        visType: 'shield'
      },
      {
        id: 'gcp-cloudops-cockpit',
        name: 'GCP CloudOps SRE Command Cockpit',
        subtitle: 'Four Golden Signals & SLO Error Budget Hub',
        category: 'gcp-sre',
        categoryLabel: '☁️ Cloud SRE',
        badges: ['Four Golden Signals', 'Latency / Traffic', 'Errors / Saturation', 'Error Budget'],
        description: 'Unified SRE command center monitoring Latency, Traffic, Errors, and Saturation. Computes real-time multi-window error budget burn rates, trigger thresholds, and automated remediation runbooks.',
        href: './gcp-cloudops-cockpit/index.html',
        metrics: { latency: '28ms', sla: '99.998%', rps: '22.0k req/s' },
        visType: 'cockpit'
      },
      {
        id: 'security-audit',
        name: 'CyberSec Sentinel Security Scanner',
        subtitle: 'Zero-Trust Threat Hunting & Penetration Auditor',
        category: 'seguridad-fintech',
        categoryLabel: '🛡️ Seguridad & Fintech',
        badges: ['Zero Trust', 'WAF Threat Shield', 'JWT Introspect', 'DLP Regex'],
        description: 'Active cybersecurity inspection scanner testing API endpoints against SQL injection, XSS vectors, broken object level authorization (BOLA), and unauthorized volumetric credential stuffing.',
        href: './security-audit/index.html',
        metrics: { latency: '6ms', sla: '99.99%', rps: '8.5k scan/s' },
        visType: 'sec'
      },
      {
        id: 'server-status',
        name: 'Mission Control NOC & Status Board',
        subtitle: 'Multi-Cluster Health & Web Audio Synthesizer',
        category: 'seguridad-fintech',
        categoryLabel: '🛡️ Seguridad & Fintech',
        badges: ['NOC Radar', 'Web Audio Synth', 'Cluster Nodes', 'Log Terminal'],
        description: 'Global Network Operations Center status board monitoring distributed cluster health across North America, Europe, and Asia-Pacific with interactive Web Audio alerts and searchable log terminals.',
        href: './server-status/index.html',
        metrics: { latency: '22ms', sla: '99.995%', rps: '15.6k req/s' },
        visType: 'radar'
      },
      {
        id: 'transaction-flow',
        name: 'High-Frequency Fintech Pipeline',
        subtitle: 'ISO 20022 Settlement & Real-Time Fraud Engine',
        category: 'seguridad-fintech',
        categoryLabel: '🛡️ Seguridad & Fintech',
        badges: ['Sub-10ms FX', 'ISO 20022', 'Fraud Scoring', 'Saga Compensate'],
        description: 'Ultra-low-latency financial transaction pipeline processing cross-border payments with real-time ISO 20022 parsing, ML fraud risk classification, and atomic distributed Saga rollbacks.',
        href: './transaction-flow/index.html',
        metrics: { latency: '6.4ms', sla: '99.999%', rps: '28.0k tx/s' },
        visType: 'tx'
      },
      {
        id: 'network-health',
        name: 'Network Health Check Diagnostic Hub',
        subtitle: 'BGP Anycast Routing & Latency Mesh Telemetry',
        category: 'seguridad-fintech',
        categoryLabel: '🛡️ Seguridad & Fintech',
        badges: ['BGP Anycast', 'RTT Jitter', 'Packet Loss 0%', 'Edge PoP Mesh'],
        description: 'Global network diagnostics console analyzing edge PoP latency, BGP route convergence, jitter distributions, and fiber backbone availability across 24 international availability zones.',
        href: './network-health/index.html',
        metrics: { latency: '14ms', sla: '99.999%', rps: '64.0k ping/s' },
        visType: 'mesh'
      },
      {
        id: 'tv-diagnostic',
        name: 'TV & OTT Playback Telemetry Hub',
        subtitle: 'Adaptive Bitrate & QoE Streaming Diagnostics',
        category: 'seguridad-fintech',
        categoryLabel: '🛡️ Seguridad & Fintech',
        badges: ['HLS / MPEG-DASH', 'Buffer Health', 'ABR Bitrate', 'QoE Score 4.9'],
        description: 'Live telemetry console for Over-The-Top (OTT) video delivery. Monitors video buffer health, chunk download latencies, adaptive bitrate transitions, and Quality of Experience (QoE) scores.',
        href: './tv-diagnostic/index.html',
        metrics: { latency: '19ms', sla: '99.98%', rps: '11.8k stream/s' },
        visType: 'video'
      }
    ];

    // Client-Side Markdown Parser
    function renderMarkdown(md) {
      if (!md) return '<p>No content available.</p>';
      
      let html = '';
      const lines = md.split('\\n');
      let inCode = false;
      let codeLang = '';
      let codeBuffer = [];
      let inTable = false;
      let tableRows = [];
      let inList = false;

      function flushTable() {
        if (!inTable) return;
        if (tableRows.length > 0) {
          html += '<table>';
          tableRows.forEach((row, idx) => {
            const isHeader = idx === 0;
            const cols = row.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
            if (cols.length > 0) {
              if (idx === 1 && cols.every(c => /^:?-+:?$/.test(c))) {
                return;
              }
              html += '<tr>';
              cols.forEach(col => {
                const tag = isHeader ? 'th' : 'td';
                html += '<' + tag + '>' + formatInline(col) + '</' + tag + '>';
              });
              html += '</tr>';
            }
          });
          html += '</table>';
        }
        inTable = false;
        tableRows = [];
      }

      function flushList() {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
      }

      function formatInline(text) {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
          .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
          .replace(/\`(.+?)\`/g, '<code>$1</code>')
          .replace(/\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g, '<a href="$2" target="_blank">$1</a>');
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code block toggle
        if (line.trim().startsWith('\`\`\`')) {
          if (inCode) {
            html += '<pre><code class="language-' + codeLang + '">' + codeBuffer.join('\\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code></pre>';
            inCode = false;
            codeBuffer = [];
          } else {
            flushTable();
            flushList();
            inCode = true;
            codeLang = line.trim().slice(3).trim();
          }
          continue;
        }

        if (inCode) {
          codeBuffer.push(line);
          continue;
        }

        // Table lines
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          flushList();
          inTable = true;
          tableRows.push(line.trim());
          continue;
        } else {
          flushTable();
        }

        // Unordered lists
        if (/^\\s*[-*]\\s+/.test(line)) {
          if (!inList) {
            html += '<ul>';
            inList = true;
          }
          const itemText = line.replace(/^\\s*[-*]\\s+/, '');
          html += '<li>' + formatInline(itemText) + '</li>';
          continue;
        } else {
          flushList();
        }

        // Blockquotes
        if (line.trim().startsWith('>')) {
          const quoteText = line.replace(/^>\\s*/, '');
          html += '<blockquote>' + formatInline(quoteText) + '</blockquote>';
          continue;
        }

        // Headers
        if (line.startsWith('# ')) {
          html += '<h1>' + formatInline(line.slice(2)) + '</h1>';
          continue;
        }
        if (line.startsWith('## ')) {
          html += '<h2>' + formatInline(line.slice(3)) + '</h2>';
          continue;
        }
        if (line.startsWith('### ')) {
          html += '<h3>' + formatInline(line.slice(4)) + '</h3>';
          continue;
        }
        if (line.startsWith('#### ')) {
          html += '<h4>' + formatInline(line.slice(5)) + '</h4>';
          continue;
        }

        // Horizontal rule
        if (/^---+\\s*$/.test(line.trim())) {
          html += '<hr>';
          continue;
        }

        // Normal paragraph
        if (line.trim().length > 0) {
          html += '<p>' + formatInline(line) + '</p>';
        }
      }

      flushTable();
      flushList();
      return html;
    }

    // Render Cards in DOM
    const cardsContainer = document.getElementById('cards-container');
    function renderSystemCards(systemsToRender) {
      cardsContainer.innerHTML = '';
      systemsToRender.forEach(sys => {
        const card = document.createElement('div');
        card.className = 'system-card card';
        card.setAttribute('data-system', sys.id);
        card.setAttribute('data-category', sys.category);

        const badgesHtml = sys.badges.map(b => '<span class="tech-badge">' + b + '</span>').join('');

        card.innerHTML = 
          '<div class="card-top">' +
            '<div class="card-meta-row">' +
              '<span class="category-tag" data-cat="' + sys.category + '">' + sys.categoryLabel + '</span>' +
              '<div class="card-health-ping">' +
                '<span class="pulse-dot"></span>' +
                '<span class="ping-text" id="ping-' + sys.id + '">' + Math.floor(12 + Math.random() * 25) + 'ms</span>' +
              '</div>' +
            '</div>' +

            '<div class="card-canvas-preview">' +
              '<canvas class="card-canvas" id="canvas-' + sys.id + '"></canvas>' +
            '</div>' +

            '<div class="card-title-group">' +
              '<h2 class="card-title">' + sys.name + '</h2>' +
              '<div class="card-subtitle">' + sys.subtitle + '</div>' +
            '</div>' +

            '<p class="card-desc">' + sys.description + '</p>' +
            
            '<div class="card-badges-row">' +
              badgesHtml +
            '</div>' +
          '</div>' +

          '<div class="card-bottom">' +
            '<div class="card-metrics-row">' +
              '<div class="metric-item">' +
                '<span class="metric-key">LATENCY</span>' +
                '<span class="metric-val">' + sys.metrics.latency + '</span>' +
              '</div>' +
              '<div class="metric-item">' +
                '<span class="metric-key">SLA</span>' +
                '<span class="metric-val" style="color: #34d399;">' + sys.metrics.sla + '</span>' +
              '</div>' +
              '<div class="metric-item">' +
                '<span class="metric-key">THROUGHPUT</span>' +
                '<span class="metric-val">' + sys.metrics.rps + '</span>' +
              '</div>' +
            '</div>' +

            '<a class="btn-launch" href="' + sys.href + '">' +
              '<span>Launch Dashboard</span>' +
              '<span>→</span>' +
            '</a>' +
          '</div>';

        cardsContainer.appendChild(card);
      });

      initMicroCanvases();
    }

    // Filter and Search Logic
    let currentCategory = 'all';
    let currentSearchTerm = '';

    function applyFilter() {
      const allCards = Array.from(document.querySelectorAll('.system-card'));
      allCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const text = card.innerText.toLowerCase();

        const matchCat = currentCategory === 'all' || cat === currentCategory;
        const matchSearch = !currentSearchTerm || text.includes(currentSearchTerm);

        if (matchCat && matchSearch) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Category Filter Buttons
    const filterBtns = Array.from(document.querySelectorAll('.filter-btn, .category-pill'));
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category') || btn.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });

    // Real-Time Search Input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchTerm = (e.target.value || '').trim().toLowerCase();
        applyFilter();
      });
    }

    // Background Canvas Visualizer
    const bgCanvas = document.getElementById('bg-canvas');
    if (bgCanvas) {
      const ctx = bgCanvas.getContext('2d');
      let w = bgCanvas.width = window.innerWidth;
      let h = bgCanvas.height = window.innerHeight;

      window.addEventListener('resize', () => {
        w = bgCanvas.width = window.innerWidth;
        h = bgCanvas.height = window.innerHeight;
      });

      const particles = Array.from({ length: 45 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2
      }));

      function renderBg() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, ' + p.alpha + ')';
          ctx.fill();
        });

        requestAnimationFrame(renderBg);
      }
      renderBg();
    }

    // Micro-Canvas Visualizer for Cards
    let microAnimId = null;
    function initMicroCanvases() {
      if (microAnimId) cancelAnimationFrame(microAnimId);
      
      const canvases = Array.from(document.querySelectorAll('.card-canvas'));
      let frame = 0;

      function renderMicro() {
        frame++;
        canvases.forEach((c, idx) => {
          if (!c.width || c.width !== c.offsetWidth) {
            c.width = c.offsetWidth;
            c.height = c.offsetHeight;
          }
          const ctx = c.getContext('2d');
          const cw = c.width;
          const ch = c.height;
          ctx.clearRect(0, 0, cw, ch);

          // Grid backdrop
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          for (let x = 0; x < cw; x += 15) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ch);
            ctx.stroke();
          }

          const offset = (frame * 0.04) + idx;
          const grad = ctx.createLinearGradient(0, 0, cw, 0);
          grad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
          grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.8)');
          grad.addColorStop(1, 'rgba(99, 102, 241, 0.3)');

          // Dynamic Waveform / Energy Stream
          ctx.beginPath();
          ctx.moveTo(0, ch / 2);
          for (let x = 0; x < cw; x += 3) {
            const y = ch / 2 + Math.sin(x * 0.05 + offset) * (ch * 0.22) + Math.cos(x * 0.02 - offset) * 8;
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Packet Pulse Node
          const pulseX = (frame * 2 + idx * 30) % cw;
          const pulseY = ch / 2 + Math.sin(pulseX * 0.05 + offset) * (ch * 0.22) + Math.cos(pulseX * 0.02 - offset) * 8;
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        microAnimId = requestAnimationFrame(renderMicro);
      }
      renderMicro();
    }

    // Telemetry Oscillators
    function initTelemetryOscillators() {
      // Clock
      function updateClock() {
        const now = new Date();
        const clockEl = document.getElementById('hud-clock');
        if (clockEl) {
          clockEl.textContent = now.toISOString().slice(11, 19) + ' UTC';
        }
      }
      setInterval(updateClock, 1000);
      updateClock();

      // Latency jitter & ping updates
      setInterval(() => {
        const latEl = document.getElementById('hud-latency');
        if (latEl) {
          latEl.textContent = (16.5 + Math.random() * 3.8).toFixed(1);
        }
        const tpEl = document.getElementById('hud-throughput');
        if (tpEl) {
          tpEl.textContent = (182.0 + Math.random() * 5.0).toFixed(1);
        }

        // Pings on cards
        SYSTEMS_MANIFEST.forEach(s => {
          const pEl = document.getElementById('ping-' + s.id);
          if (pEl) {
            pEl.textContent = Math.floor(12 + Math.random() * 26) + 'ms';
          }
        });
      }, 2500);
    }

    // Documentation Slide-Out Drawer Logic
    const drawer = document.getElementById('docs-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const btnOpenDrawer = document.getElementById('btn-docs-drawer');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    const drawerContent = document.getElementById('drawer-content');
    const docTabs = Array.from(document.querySelectorAll('.doc-tab, .drawer-tab'));

    function openDrawer() {
      drawer.classList.add('open');
      drawer.classList.add('active');
      drawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      drawer.classList.remove('active');
      drawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (btnOpenDrawer) btnOpenDrawer.addEventListener('click', openDrawer);
    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    // Also support any element with .btn-architecture or [data-action="open-docs"]
    document.querySelectorAll('.btn-architecture, [data-action="open-docs"]').forEach(el => {
      el.addEventListener('click', openDrawer);
    });

    async function loadDoc(docKey) {
      let content = EMBEDDED_DOCS[docKey] || EMBEDDED_DOCS['ideas'] || '';

      // Try fetching dynamic relative file
      let filename = 'mulesoft_80_ideas_observabilidad.md';
      if (docKey === 'cloud-sre' || docKey.includes('cloud') || docKey.includes('sre') || docKey.includes('manual_observabilidad')) {
        filename = 'manual_observabilidad_cloud_sre.md';
      } else if (docKey === 'mulesoft-arch' || docKey.includes('arquitectura') || docKey.includes('mulesoft_y')) {
        filename = 'mulesoft_y_arquitectura_sistemas.md';
      }

      try {
        const resp = await fetch(filename);
        if (resp.ok) {
          const txt = await resp.text();
          if (txt && txt.length > 50) {
            content = txt;
          }
        }
      } catch (e) {
        // Fallback to embedded doc cleanly
      }

      drawerContent.innerHTML = renderMarkdown(content);
      drawerContent.scrollTop = 0;
    }

    docTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        docTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const docKey = tab.getAttribute('data-doc') || 'ideas';
        loadDoc(docKey);
      });
    });

    // Initialize Portal
    document.addEventListener('DOMContentLoaded', () => {
      renderSystemCards(SYSTEMS_MANIFEST);
      initTelemetryOscillators();
      loadDoc('ideas');
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      renderSystemCards(SYSTEMS_MANIFEST);
      initTelemetryOscillators();
      loadDoc('ideas');
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(sistemasDir, 'index.html'), htmlContent, 'utf8');
console.log('Successfully generated sistemas/index.html (' + htmlContent.length + ' bytes)');
