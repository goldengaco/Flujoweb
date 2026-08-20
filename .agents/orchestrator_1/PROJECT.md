# Project: Observability & Monitoring Dashboards Suite

## Architecture
Three self-contained single-file HTML5/CSS3/JS enterprise dashboards residing in `sistemas/`:
- Zero external build dependencies (pure browser-native ES6+, CSS Variables, Canvas/SVG).
- Global theme: Cinematic dark base (`#030812` / `#060d1b`), Google Font Inter + Cascadia/Fira Code monospace, 60fps animations.
- Permanent luminous icon persistence (emojis + glowing indicators).

## Code Layout
- `c:\DevWork\Depredador\Flujoweb\sistemas\security-audit\index.html` — Security Audit & Vulnerability Scanner (Verified)
- `c:\DevWork\Depredador\Flujoweb\sistemas\server-status\index.html` — Mission Control NOC Status Board (Verified)
- `c:\DevWork\Depredador\Flujoweb\sistemas\transaction-flow\index.html` — High-Frequency Transaction & Settlement Pipeline (Verified)

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | 7-Node Security Stepper | SSL/TLS, Headers, CORS, SQLi, XSS, Session/JWT, RBAC | M1 | ORIGINAL_REQUEST §R1 | VERIFIED |
| 2 | Security Node Telemetry Drawer | Raw headers, payloads, CVE references, evaluation logs | M1 | ORIGINAL_REQUEST §R1 | VERIFIED |
| 3 | Circular Dynamic Score Gauge | SVG gauge 0-100, letter grades (A+ to F), animated interpolation | M1 | ORIGINAL_REQUEST §R1 | VERIFIED |
| 4 | Vulnerability Matrix & Patch Simulation | Severity filters (Critical to Passed), remediation snippets, live patch simulation | M1 | ORIGINAL_REQUEST §R1 | VERIFIED |
| 5 | JSON Security Report Export | Downloadable JSON report and formatted summary modal | M1 | ORIGINAL_REQUEST §R1 | VERIFIED |
| 6 | 9-Service Mesh NOC Grid | Gateway, Core, Postgres, Auth, Payment, CDN, Mailer, S3, Redis | M2 | ORIGINAL_REQUEST §R2 | VERIFIED |
| 7 | Per-Service Telemetry & Sparklines | Real-time RPS, Latency distribution, CPU%, Mem, Error% | M2 | ORIGINAL_REQUEST §R2 | VERIFIED |
| 8 | 90-Day SLA Uptime Bar | Segmented uptime bars with interactive historical micro-outage tooltips | M2 | ORIGINAL_REQUEST §R2 | VERIFIED |
| 9 | Chaos Injection & Auto-Healing | Trigger simulated service outage, automated detection, rerouting, recovery | M2 | ORIGINAL_REQUEST §R2 | VERIFIED |
| 10 | ANSI Live Terminal Console | Collapsible streaming log with ANSI colored events and heartbeat logs | M2 | ORIGINAL_REQUEST §R2 | VERIFIED |
| 11 | 6-Node Branching Transaction Pipeline | Order capture, Tokenization, Fraud ML, 3DS Auth, Clearing, Settlement | M3 | ORIGINAL_REQUEST §R3 | VERIFIED |
| 12 | Scenario Selector & Bifurcation | Success, Fraud Block (>85 score), Insufficient Funds, Network Retry | M3 | ORIGINAL_REQUEST §R3 | VERIFIED |
| 13 | 30s TTL Microsecond Countdown | High precision countdown timer during processing | M3 | ORIGINAL_REQUEST §R3 | VERIFIED |
| 14 | Dynamic Ledger & Risk Radar | Animated currency counter and risk score radar | M3 | ORIGINAL_REQUEST §R3 | VERIFIED |
| 15 | Reversal & Chargeback Flow | Animated rollback sequence reversing ledger state and confirming refund | M3 | ORIGINAL_REQUEST §R3 | VERIFIED |
| 16 | ISO-8583 / JSON Payload Inspector | Live financial payload moving across pipeline stages | M3 | ORIGINAL_REQUEST §R3 | VERIFIED |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Survey & Spec Mining | Detailed component, data, and visual specs | none | DONE |
| M1 | Security Audit Dashboard | `sistemas/security-audit/index.html` | M0 | DONE |
| M2 | Server Status NOC Dashboard | `sistemas/server-status/index.html` | M0 | DONE |
| M3 | Transaction Pipeline Dashboard | `sistemas/transaction-flow/index.html` | M0 | DONE |
| M4 | E2E Testing & Audit | Comprehensive test runner, challenger stress tests, forensic audit | M1, M2, M3 | DONE |
