## 2026-08-19T23:33:11Z

Implement `c:\DevWork\Depredador\Flujoweb\sistemas\server-status\index.html` as a self-contained, enterprise-grade Mission Control NOC & Multi-Service Status Board.

Requirements:
1. Self-contained single-file HTML5 application (inline CSS, embedded SVGs/Canvas, pure ES6+ JS, zero build steps, zero external CDN dependencies, Google Fonts with robust local monospace/sans-serif fallbacks).
2. Deep Matrix Navy / Electric Cyan (#06b6d4, #3b82f6) with Amber (#f59e0b) and Red (#ef4444) incident indicators on dark base (#030812 / #060d1b), Inter + Cascadia/Fira Code/JetBrains Mono fonts.
3. 9 Critical Service Mesh Grid:
   - 1. 🌐 API Gateway (Kong / Envoy)
   - 2. ⚡ Core Web Engine (Node / Rust)
   - 3. 🐘 Primary Database (PostgreSQL 16 HA)
   - 4. 🔐 Auth / OAuth2 (Keycloak / Ory)
   - 5. 💳 Payment Service (Stripe / ISO Gateway)
   - 6. 🌍 Global CDN Edge (Cloudflare / Fastly)
   - 7. ✉️ Transactional Mailer (SES / Postfix)
   - 8. 🗄️ Object Storage (MinIO / S3)
   - 9. ⚡ Redis Cluster (Redis 7.2)
   - Permanent luminous emoji icons with glow effects.
4. Per-Service Live Real-Time Telemetry:
   - Live Canvas mini sparkline graphs for RPS throughput and Latency distribution (smooth 60fps waveform rendering with ring buffer data structures, devicePixelRatio scaling).
   - CPU %, Memory Footprint (GB/MB), Error Rate % with animated thresholds.
   - Interactive 90-Day SLA Uptime Bar (90 individual hoverable segments per service with rich cyberpunk tooltips displaying historical micro-outage dates, incident logs, and SLA percentage).
5. Interactive Incident Simulator & Chaos Injection Engine:
   - Chaos Injection modal / selector allowing user to inject failures:
     * PostgreSQL connection pool exhaustion (503 Service Unavailable)
     * Payment Gateway 504 Gateway Timeout
     * Redis Cluster split-brain & memory pressure
     * Global CDN Edge SSL handshake / DDoS spike
     * Auth Service token signing JWKS desync
   - Automated Multi-Step Auto-Healing Sequence:
     * Step 1: Alert Triggered & Incident Logged
     * Step 2: Automated Triage & Runbook Execution
     * Step 3: Traffic Reroute / Standby Promotion / Pod Respawn
     * Step 4: Synthetic Health Probing
     * Step 5: Healthy State Restored (Green status, SLA recovery)
   - Visual step progress indicators and live status card animations during auto-healing.
6. ANSI Live Streaming Terminal Console:
   - Collapsible floating or docked terminal panel.
   - Formatted colored streaming system logs (ANSI parser for colored timestamps, cyan endpoints, red errors, yellow warnings, purple runbooks).
   - Real-time continuous log stream with pause, clear, filter by category/level, speed controls, copy to clipboard.
7. Quality:
   - Fully responsive (400px to 4K).
   - Zero console errors / warnings. Smooth 60fps animations.
