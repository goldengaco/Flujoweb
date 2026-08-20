# Architectural & Specification Survey: Mission Control NOC & Multi-Service Status Board
**System**: R2 — `sistemas/server-status/index.html`  
**Author**: `explorer_server` (Specification Miner)  
**Status**: COMPLETE / VERIFIED  
**Date**: 2026-08-19  

---

## Executive Summary

The **Mission Control NOC & Multi-Service Status Board** is an enterprise-grade, high-density Observability & Network Operations Center (NOC) dashboard designed to monitor a distributed mission-critical microservice topology. Operating in a single-file, zero-dependency browser architecture, the system provides real-time telemetry streaming, interactive dual-metric Canvas sparklines, an interactive 90-day SLA history matrix, an active Chaos Injection and Automated Self-Healing Engine, and a high-performance streaming ANSI terminal log console.

This specification establishes the authoritative data contracts, state machines, visualization algorithms, failure topologies, and UI tokens required to construct `sistemas/server-status/index.html`.

---

## 1. Complete Service Mesh Topology (9 Critical Services)

The dashboard monitors 9 core distributed infrastructure services across multiple availability zones and regions (`us-east-1`, `us-west-2`, `eu-central-1`, `ap-southeast-1`).

```
                              ┌────────────────────────────────┐
                              │    🌍 Global Edge CDN (CDN)    │
                              └───────────────┬────────────────┘
                                              │
                                              ▼
                              ┌────────────────────────────────┐
                              │    🌐 API Gateway / Envoy      │
                              └───────┬────────────────┬───────┘
                                      │                │
                     ┌────────────────┴────┐      ┌────┴────────────────┐
                     │ 🔐 Auth & Identity  │      │ ⚡ Core Web Engine   │
                     │    (OAuth2/JWT)     │      │   (Microservices)   │
                     └─────────────────────┘      └────┬───────┬────┬───┘
                                                       │       │    │
             ┌─────────────────────────┬───────────────┴──┐    │    └───┬─────────────────────────┐
             │                         │                  │    │        │                         │
             ▼                         ▼                  ▼    │        ▼                         ▼
┌─────────────────────────┐ ┌──────────────────────┐ ┌─────────┴──┐ ┌──────────────────────┐ ┌──────────────────────┐
│ 💳 Payment Gateway      │ │ 🐘 PostgreSQL 16 HA  │ │ ⚡ Redis 7.2 │ │ 📦 Object Storage    │ │ 📧 Transactional     │
│    (ISO-8583 / Stripe)  │ │    Primary DB        │ │   Cluster  │ │    (S3 / Ceph)       │ │    Mailer (Postfix)  │
└─────────────────────────┘ └──────────────────────┘ └────────────┘ └──────────────────────┘ └──────────────────────┘
```

### Detailed Service Specifications

| # | Service Name & ID | Emoji & Visual Badge | Category | Cluster & Port Topology | Baseline RPS | Baseline P95 Latency | Baseline CPU / RAM | Error Rate (Normal) | Upstream / Downstream Dependencies |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Global Edge CDN**<br>`svc-cdn` | 🌍 `CDN-EDGE` | Edge & Routing | 320 Anycast PoPs<br>Port 443 (HTTP/3 QUIC) | 12,000 – 18,500 | 12 – 28 ms | 28% – 42%<br>18.4 GB pool | < 0.005% | **Upstream**: Public Internet<br>**Downstream**: `svc-gateway`, `svc-s3` |
| 2 | **API Gateway**<br>`svc-gateway` | 🌐 `GATEWAY` | Routing & Ingress | 16x Envoy Pods<br>Port 8443 / gRPC 9090 | 8,500 – 14,200 | 18 – 45 ms | 45% – 65%<br>8.2 GB pool | < 0.02% | **Upstream**: `svc-cdn`<br>**Downstream**: `svc-auth`, `svc-core` |
| 3 | **Core Web Engine**<br>`svc-core` | ⚡ `CORE-SRV` | Compute Engine | 32x Go/Node Worker Pods<br>Port 8080 (ClusterIP) | 4,200 – 7,800 | 45 – 95 ms | 55% – 78%<br>24.6 GB pool | < 0.05% | **Upstream**: `svc-gateway`<br>**Downstream**: `svc-db`, `svc-redis`, `svc-pay`, `svc-s3`, `svc-mail` |
| 4 | **Auth & Identity**<br>`svc-auth` | 🔐 `AUTH-IAM` | Identity & Security | 8x Keycloak/OIDC Pods<br>Port 8443 (mTLS) | 1,200 – 2,800 | 35 – 70 ms | 32% – 50%<br>6.8 GB pool | < 0.01% | **Upstream**: `svc-gateway`<br>**Downstream**: `svc-db`, `svc-redis` |
| 5 | **Primary Database**<br>`svc-db` | 🐘 `POSTGRES` | Data Persistence | 1 Primary + 3 Read Replicas<br>Patroni HA (Port 5432) | 2,800 – 4,500 QPS | 8 – 22 ms | 40% – 68%<br>64.0 GB pool | < 0.001% | **Upstream**: `svc-core`, `svc-auth`<br>**Downstream**: Storage Volume (NVMe SAN) |
| 6 | **Redis Cluster**<br>`svc-redis` | ⚡ `REDIS-CACHE` | In-Memory Cache | 6 Nodes (3 Master, 3 Replica)<br>Redis 7.2 (Port 6379) | 18,000 – 35,000 QPS | 0.8 – 2.5 ms | 20% – 38%<br>32.0 GB RAM | < 0.001% | **Upstream**: `svc-core`, `svc-auth`<br>**Downstream**: Memory Subsystem |
| 7 | **Payment Gateway**<br>`svc-pay` | 💳 `PAY-BRIDGE` | Fintech Integration | 6x Isolated PCI Enclaves<br>Port 9443 (Strict mTLS) | 350 – 850 | 180 – 320 ms | 22% – 40%<br>4.2 GB pool | < 0.08% | **Upstream**: `svc-core`<br>**Downstream**: Banking Switch / Card Acquiring Network |
| 8 | **Object Storage**<br>`svc-s3` | 📦 `S3-STORE` | Distributed Storage | Ceph RADOS Gateway<br>Port 9000 (S3 API) | 950 – 2,100 | 45 – 110 ms | 35% – 58%<br>48.0 TB pool | < 0.01% | **Upstream**: `svc-cdn`, `svc-core`<br>**Downstream**: Erasure-Coded Block Device |
| 9 | **Transactional Mailer**<br>`svc-mail` | 📧 `MAIL-QUEUE` | Async Integration | 4x Postfix/Haraka Daemons<br>Port 587 / SMTP | 120 – 450 msg/s | 60 – 140 ms | 15% – 30%<br>3.5 GB pool | < 0.04% | **Upstream**: `svc-core`<br>**Downstream**: Upstream MX & SMTP Relay Swarms |

### Service Health State Lifecycle

Every service evaluates its telemetry into one of 5 distinct operational states:

```
                  ┌──────────────────────────────┐
                  │   🟢 OPERATIONAL (Healthy)   │
                  └──────────────┬───────────────┘
                                 │
                   Latency Spike │ Error Rate > 2%
                                 ▼
                  ┌──────────────────────────────┐
                  │    🟡 DEGRADED (Impaired)    │
                  └──────────────┬───────────────┘
                                 │
              Chaos Injection / │ Heartbeat Loss / Error Rate > 15%
                                 ▼
                  ┌──────────────────────────────┐
                  │   🔴 MAJOR_OUTAGE (Down)     │
                  └──────────────┬───────────────┘
                                 │
                   Auto-Remediation Playbook Triggered
                                 ▼
                  ┌──────────────────────────────┐
                  │   🟣 HEALING (Recovering)    │
                  └──────────────┬───────────────┘
                                 │
                    Synthetic Probes Pass 3x
                                 ▼
                  ┌──────────────────────────────┐
                  │  🟢 OPERATIONAL (Restored)   │
                  └──────────────────────────────┘
```

---

## 2. Live Telemetry & Dual Sparkline Visualization Schema

### Real-Time Metric Ring Buffer Architecture

Each service card maintains two separate 40-point ring buffers (circular arrays) updated synchronously on a **1000ms NOC tick**:
1. **RPS Throughput Buffer**: Normalized integer request count per second.
2. **Latency Distribution Buffer**: Floating-point response time in milliseconds.

```javascript
class ServiceTelemetryBuffer {
  constructor(capacity = 40, baselineRPS = 1000, baselineLatency = 30) {
    this.capacity = capacity;
    this.rpsBuffer = new Float32Array(capacity).fill(baselineRPS);
    this.latencyBuffer = new Float32Array(capacity).fill(baselineLatency);
    this.pointer = 0;
  }

  push(rps, latency) {
    this.rpsBuffer[this.pointer] = rps;
    this.latencyBuffer[this.pointer] = latency;
    this.pointer = (this.pointer + 1) % this.capacity;
  }

  getOrderedData() {
    const rps = new Float32Array(this.capacity);
    const latency = new Float32Array(this.capacity);
    for (let i = 0; i < this.capacity; i++) {
      const idx = (this.pointer + i) % this.capacity;
      rps[i] = this.rpsBuffer[idx];
      latency[i] = this.latencyBuffer[idx];
    }
    return { rps, latency };
  }
}
```

### Fluctuation & Stochastic Math Model

Telemetry values simulate realistic network traffic using a combination of **Brownian Random Walk**, **Diurnal Sine Wave Modulation**, and **Poisson Micro-Jitter**:

$$\text{RPS}(t) = \text{BaseRPS} \times \left(1 + 0.15 \sin\left(\frac{2\pi t}{120}\right)\right) + \mathcal{N}(0, \sigma_{\text{rps}})$$

$$\text{Latency}(t) = \text{BaseLat} \times \left(1 + 0.08 \cos\left(\frac{2\pi t}{60}\right)\right) + \text{ExpJitter}(\lambda) + \Delta_{\text{chaos}}$$

$$\text{CPU\%}(t) = \text{BaseCPU} + 0.35 \times \left(\frac{\text{RPS}(t) - \text{BaseRPS}}{\text{BaseRPS}}\right) \times 100 + \text{Noise}$$

### Dual Sparkline Canvas Rendering Engine

Each service card features a dedicated HTML5 `<canvas class="sparkline-canvas" width="220" height="48">` rendering dual-layered anti-aliased Bézier curves:
- **RPS Stream Curve**: Electric Cyan `#06b6d4` with gradient fill `rgba(6, 182, 212, 0.25)` to `transparent`.
- **Latency Curve**: Amber `#f59e0b` or Emerald `#10b981` (depending on threshold) with subtle dashed or dotted stroke.
- **Dynamic Gridlines**: 3 horizontal dashed reference lines (`25%`, `50%`, `75%`) rendered in `rgba(255, 255, 255, 0.05)`.
- **Latest Value Indicator**: Pulsing glowing cursor dot on the rightmost data point.

```
+-------------------------------------------------------------+
| [RPS: 12.4k]                                   [Lat: 18.4ms]|
|  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . |
|        __/\_                 /\                /\_          |
|  /\  _/     \_      _/\_   _/  \__/\         _/   \__ (o)   |
| /  \/         \____/    \_/         \_______/      \_____/  |
|/////////////////////////////////////////////////////////////|
+-------------------------------------------------------------+
```

---

## 3. 90-Day SLA Uptime Bar Matrix & Interactive Micro-Outage Tooltips

### 90-Day Segment Architecture

Below each service's telemetry stats sits an interactive **90-Day SLA Uptime Bar** composed of exactly **90 discrete micro-segments** (1 segment per day, ranging from $T-89$ to $T-0$ Today).

### Segment States & Visual Tokens

| Segment Status | Color Token | Glow Style | SLA % Range | Description |
|---|---|---|---|---|
| **Operational** | `#10b981` (Emerald) | `0 0 4px rgba(16,185,129,0.3)` | 100.0% | Zero incidents, optimal latency. |
| **Nominal Degraded** | `#34d399` (Light Emerald) | None | 99.95% – 99.99% | Minor transient jitter (< 1 min). |
| **Degraded Performance** | `#f59e0b` (Amber) | `0 0 6px rgba(245,158,11,0.5)` | 99.50% – 99.94% | High latency spike, partial failover. |
| **Micro-Outage** | `#ef4444` (Crimson) | `0 0 8px rgba(239,68,68,0.7)` | 95.00% – 99.49% | Unscheduled downtime, 5xx errors. |
| **Scheduled Maintenance** | `#8b5cf6` (Purple) | `0 0 6px rgba(139,92,246,0.4)` | Planned Window | Kernel upgrades, DB vacuuming. |

### SLA Historical Generator Algorithm

To populate realistic historical data across 90 days:
1. Generate an array of 90 day records starting from `currentDate - 89 days` up to `currentDate`.
2. Seed deterministic historical incident distributions (e.g. Day -42 had a 4-minute DB failover; Day -18 had a CDN edge routing blip).
3. Compute overall 90-day SLA aggregate using:

$$\text{SLA}_{\text{90d}} = \frac{\sum_{i=1}^{90} \text{UptimeMinutes}_i}{90 \times 1440} \times 100\%$$

### Interactive Hover Tooltip Specification

When a user hovers over any of the 90 segments, a floating cyberpunk tooltip card is positioned dynamically above the segment:

```
┌──────────────────────────────────────────────────────────┐
│ 📅 2026-07-14 (36 days ago)             🔴 Micro-Outage │
├──────────────────────────────────────────────────────────┤
│ Daily Uptime: 99.82% (2m 35s downtime)                   │
│ Incident: #INC-7201 - Connection Pool Exhaustion         │
│ Impact: 502 Bad Gateway on /api/v2/checkout              │
│ MTTR: 155 seconds | Resolved by Automated Auto-Scaler    │
└──────────────────────────────────────────────────────────┘
```

**Tooltip Data Contract**:
```json
{
  "dayIndex": 54,
  "date": "2026-07-14",
  "uptimePercent": 99.82,
  "status": "MICRO_OUTAGE",
  "downtimeDurationSec": 155,
  "incidentId": "INC-7201",
  "title": "Connection Pool Exhaustion",
  "impact": "502 Bad Gateway on /api/v2/checkout",
  "mttr": "2m 35s",
  "resolvedBy": "Auto-Remediation Playbook #42"
}
```

---

## 4. Interactive Incident Simulator & Chaos Injection Engine

The dashboard features an interactive **Chaos Mode & Failure Injection Center** allowing operators to simulate realistic production incidents and observe the autonomous multi-stage self-healing sequence.

### Selectable Chaos Scenarios

| Scenario ID | Name & Target | Failure Injection Signature | Cascade Effect | Auto-Remediation Playbook |
|---|---|---|---|---|
| `CHAOS_DB_POOL` | **PostgreSQL Connection Pool Exhaustion**<br>Target: `svc-db` | Active DB connections surge to `1000/1000`. DB latency spikes from 12ms to 4800ms. DB error rate hits 38%. | `svc-core` and `svc-auth` transition to `DEGRADED` due to query timeouts. Global RPS drops 40%. | 1. Detect thread saturation<br>2. Terminate idle zombie connections (`pg_terminate_backend`)<br>3. Scale PgBouncer pool capacity +40%<br>4. Re-route read traffic to Replica-02 |
| `CHAOS_PAY_504` | **Payment Gateway 504 Gateway Timeout**<br>Target: `svc-pay` | Upstream bank acquirer switch drops connection. Latency spikes to 8500ms. Error rate surges to 74%. | `svc-core` checkout worker queues back up to 8,000 requests. User checkout failure rate increases. | 1. Trip Hystrix/Resilience4j Circuit Breaker<br>2. Fallback to Secondary Acquiring Switch (Stripe EU fallback)<br>3. Drain dead connection queues<br>4. Reset circuit breaker to half-open |
| `CHAOS_REDIS_SPLIT` | **Redis Cluster Master Split-Brain**<br>Target: `svc-redis` | Node-01 loses quorum. Latency jumps to 650ms. Cache miss rate spikes to 99.4%. | `svc-db` query load jumps 350% as cache is bypassed. `svc-core` CPU surges to 88%. | 1. Sentinel consensus triggers auto-failover<br>2. Promote Replica-01 to Master<br>3. Cluster slot mapping re-sync<br>4. Warm L1 cache hotkeys |
| `CHAOS_CDN_DDOS` | **Global Edge DDoS & Cache Purge Storm**<br>Target: `svc-cdn` | Inbound traffic surges from 14k RPS to 140k RPS. Edge CPU hits 96%. Error rate jumps to 18%. | `svc-gateway` ingress buffers saturate. Inbound bandwidth reaches 98 Gbps. | 1. Anycast BGP traffic scrubbing activated<br>2. Challenge-response WAF rules engaged<br>3. Cache TTL pinned for static assets<br>4. Drop non-compliant bot signatures |
| `CHAOS_AUTH_DESYNC` | **Auth JWT Key Desync & Token Rejection**<br>Target: `svc-auth` | JWKS rotation error causes 85% of JWT verifications to fail with 401/403. | `svc-gateway` rejects client requests. Active user sessions invalidated. | 1. Invalidate stale JWKS cache<br>2. Force-broadcast updated public key bundle<br>3. Grace-period fallback to previous key pair<br>4. Resync session keystore |

### 5-Step Autonomous Self-Healing State Machine

During chaos execution, the dashboard visually transitions through a 5-step automated healing workflow with a dedicated real-time progress bar (0% to 100%) and stage badges:

```
[ STEP 1: ALERT TRIGGERED ] ──▶ [ STEP 2: INCIDENT TRIAGE ] ──▶ [ STEP 3: TRAFFIC REROUTE ] 
           │                                                               │
           ▼                                                               ▼
[ STEP 5: HEALTH RESTORED ] ◀── [ STEP 4: SYNTHETIC PROBING ] ◀────────────┘
```

#### Step Details & Execution Timeline

```
T+0.0s ── Stage 1: ALERT_TRIGGERED (Progress: 15%)
         - Anomaly detection rule triggered (Prometheus/Alertmanager).
         - Target service card border flashes Crimson Red (#ef4444) with pulsing halo.
         - Status badge shifts to "🔴 MAJOR_OUTAGE".
         - Incident siren sound effect / visual alert banner displayed.
         - Log: "[ALERT] P1 CRITICAL: Service svc-db latency 4820ms exceeds SLA threshold (200ms)".

T+2.5s ── Stage 2: INCIDENT_TRIAGE (Progress: 40%)
         - Automated root cause analysis (RCA) engine isolated fault domain.
         - Diagnostic health payload generated.
         - Incident ticket #INC-9482 automatically created in NOC registry.
         - Log: "[TRIAGE] Fault domain isolated: Connection pool saturation (1000/1000 slots locked)".

T+5.0s ── Stage 3: TRAFFIC_REROUTE / AUTO_REMEDIATION (Progress: 65%)
         - Auto-remediation playbook executed.
         - Container auto-respawn or connection pool recycle initiated.
         - Traffic re-routed to healthy replica nodes.
         - Service status badge shifts to "🟣 HEALING".
         - Log: "[HEAL] Executing Playbook #PG-RECYCLE-04: Evicting stale pool & promoting Replica-02".

T+7.5s ── Stage 4: SYNTHETIC_PROBING (Progress: 88%)
         - Synthetic health probes (HTTP/gRPC/SQL ping) dispatched at 50ms intervals.
         - Error rate drops from 38% -> 4% -> 0.01%.
         - Latency curves decline toward baseline.
         - Log: "[PROBE] Synthetic check 1/3 PASSED (14ms). Synthetic check 2/3 PASSED (12ms)".

T+9.5s ── Stage 5: HEALTH_RESTORED (Progress: 100%)
         - All 3 synthetic probes verified green.
         - Service card border returns to Electric Cyan / Emerald glow.
         - Status badge returns to "🟢 OPERATIONAL".
         - Incident ticket closed with MTTR = 9.5s.
         - Log: "[RESOLVED] Service svc-db fully restored. Normal traffic distribution resumed."
```

---

## 5. ANSI Live Terminal Console & Event Telemetry Stream

### Terminal Architecture & Color Parser

The dashboard includes a collapsible bottom drawer containing a **Cyberpunk ANSI Live Terminal Console** simulating a real-time Linux NOC syslog daemon.

### ANSI Escape Code Mapping

The terminal implements an in-browser ANSI color parser converting standard ANSI escape sequences into styled HTML elements:

| ANSI Sequence | Color / Style | CSS Class / Hex | NOC Event Semantic |
|---|---|---|---|
| `\x1b[32m` | Neon Green | `#00ff88` / `color: #00ff88` | `[OK]`, `[HEALTHY]`, `[ONLINE]`, `[RESOLVED]` |
| `\x1b[31m` | Crimson Red | `#ff3366` / `color: #ff3366` | `[CRIT]`, `[OUTAGE]`, `[500_ERR]`, `[DEADLOCK]` |
| `\x1b[33m` | Bright Amber | `#fbbf24` / `color: #fbbf24` | `[WARN]`, `[LATENCY_SPIKE]`, `[DEGRADED]` |
| `\x1b[36m` | Electric Cyan | `#22d3ee` / `color: #22d3ee` | `[INFO]`, `[ROUTER]`, `[GATEWAY]`, `[INGRESS]` |
| `\x1b[35m` | Cyber Purple | `#c084fc` / `color: #c084fc` | `[CHAOS]`, `[HEALER]`, `[FAILOVER]`, `[SENTINEL]` |
| `\x1b[90m` | Dim Slate | `#64748b` / `color: #64748b` | `[TIMESTAMP]`, `[DEBUG]`, `[HEARTBEAT]` |
| `\x1b[1m` | Bold Bright | `font-weight: 700; color: #ffffff` | Event headers & Incident IDs |
| `\x1b[0m` | Reset | Inherit base terminal color `#cbd5e1` | Default terminal text |

### Event Generation Types

The terminal continuously outputs four classes of real-time telemetry events:

1. **Heartbeat Pings (Every 1.5s – 3.0s)**:
   ```
   \x1b[90m[2026-08-19 16:32:01.412]\x1b[0m \x1b[36m[PING]\x1b[0m us-east-1 -> \x1b[1msvc-redis\x1b[0m (node-03): \x1b[32mACK 0.94ms\x1b[0m (cluster quorum 6/6 OK)
   ```
2. **Periodic Throughput & Cache Metrics (Every 4.0s)**:
   ```
   \x1b[90m[2026-08-19 16:32:04.108]\x1b[0m \x1b[36m[METRIC]\x1b[0m \x1b[1msvc-cdn\x1b[0m: Ingress 16,420 rps | Edge Cache Hit Rate: \x1b[32m98.92%\x1b[0m | Bandwidth: 24.8 Gbps
   ```
3. **Chaos & Failover Orchestration Logs (On Trigger)**:
   ```
   \x1b[90m[2026-08-19 16:32:10.890]\x1b[0m \x1b[35m[CHAOS-ENGINE]\x1b[0m Injected scenario \x1b[1mCHAOS_DB_POOL\x1b[0m on target \x1b[31msvc-db\x1b[0m
   \x1b[90m[2026-08-19 16:32:11.204]\x1b[0m \x1b[31m[ALERT-CRIT]\x1b[0m \x1b[1msvc-db\x1b[0m: Active connection pool saturated (1000/1000). Latency: \x1b[31m4,820ms\x1b[0m
   \x1b[90m[2026-08-19 16:32:13.750]\x1b[0m \x1b[35m[AUTO-HEAL]\x1b[0m Triage complete. Triggering Playbook #PG-RECYCLE-04...
   \x1b[90m[2026-08-19 16:32:16.110]\x1b[0m \x1b[32m[RESTORED]\x1b[0m \x1b[1msvc-db\x1b[0m connections cleared. Health verification \x1b[32mPASSED\x1b[0m. MTTR: 5.22s
   ```
4. **Interactive Operator Actions**:
   ```
   \x1b[90m[2026-08-19 16:32:18.005]\x1b[0m \x1b[33m[OPERATOR]\x1b[0m Manual diagnostic probe dispatched to \x1b[1msvc-pay\x1b[0m: \x1b[32mHTTP 200 (192ms)\x1b[0m
   ```

### Terminal Controls & UX Features
- **Auto-Scroll Toggle**: Smooth pin-to-bottom scroll with auto-pause when user scrolls up.
- **Log Level Filter Tabs**: `ALL (340)`, `ERRORS & ALERTS (12)`, `HEARTBEATS (280)`, `CHAOS & HEAL (48)`.
- **Action Buttons**: `Clear Logs`, `Pause Stream`, `Copy to Clipboard`, `Simulate Ping Flood`.
- **Drawer Height Resize / Minimize**: Collapses down to a 38px status bar showing current event ticker.

---

## 6. Visual & Cyberpunk Design System & Tokens

### Color Hierarchy & Palette

| Token Name | Hex Code | Usage |
|---|---|---|
| `--bg-base` | `#030812` | Deepest root viewport background |
| `--bg-surface` | `#060d1b` | Main container and card backgrounds |
| `--bg-card-hover` | `#0c1830` | Hover state for service cards |
| `--border-subtle` | `rgba(6, 182, 212, 0.12)` | Inactive card borders and divider lines |
| `--border-accent` | `rgba(6, 182, 212, 0.35)` | Active card borders and focus outlines |
| `--cyan-primary` | `#06b6d4` | Primary brand accent and header gradients |
| `--cyan-glow` | `#22d3ee` | Glowing text, cursors, and sparkline fills |
| `--blue-accent` | `#3b82f6` | Secondary telemetry lines and badges |
| `--emerald-ok` | `#10b981` | Healthy status badges, 100% SLA segments |
| `--amber-warn` | `#f59e0b` | Degraded service badges, warning latency |
| `--crimson-crit` | `#ef4444` | Major outage cards, critical alarms |
| `--purple-heal` | `#8b5cf6` | Auto-healing indicators, maintenance windows |
| `--text-main` | `#f1f5f9` | Primary headings, service titles, values |
| `--text-muted` | `#94a3b8` | Subheadings, labels, secondary metrics |
| `--text-dim` | `#475569` | Metric units, segment dates, footer copyright |

### Glowing Emoji & Icon Persistence Guarantee

In compliance with the project's strict design requirement:
- **Permanent Icon Visibility**: All 9 service icons (🌍, 🌐, ⚡, 🔐, 🐘, ⚡, 💳, 📦, 📧) and status indicators remain **permanently visible** across all lifecycle states (`OPERATIONAL`, `DEGRADED`, `MAJOR_OUTAGE`, `HEALING`).
- **Luminous CSS Filters**: Emojis feature a multi-layered neon glow:
  ```css
  .service-icon {
    font-size: 1.6rem;
    filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))
            drop-shadow(0 0 16px rgba(6, 182, 212, 0.25));
    transition: filter 0.4s ease, transform 0.3s ease;
  }
  .service-card[data-status="outage"] .service-icon {
    filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))
            drop-shadow(0 0 20px rgba(239, 68, 68, 0.4));
    animation: iconShake 0.5s ease infinite alternate;
  }
  ```
- **No Replacement by Plain Ticks**: Status changes modify the ambient badge and glow color rather than stripping away or replacing the core service icon.

### Matrix Hex-Grid & Cyberpunk Atmosphere

- **Hexagonal Vector Grid**: CSS pseudo-element background grid rendering faint cyan/blue geometric nodes.
- **Ambient Radial Glows**: 2 subtle radial gradients in the background adding depth and vignette.
- **Scanline Overlay**: Faint 2px scanline pattern with opacity `0.03` providing authentic NOC CRT monitor vibes without impairing readability.

---

## 7. Single-File Architecture & ES6+ Implementation Blueprint

### File Structure: `sistemas/server-status/index.html`

The entire application will reside in one clean, self-contained file with the following internal layout:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NOC Mission Control & Multi-Service Status Board</title>
  <!-- Google Fonts: Inter & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* CSS Variables & Reset */
    /* Cyberpunk Hex Grid & Ambient Background */
    /* Header, Global SLA Hero & Summary Ticker */
    /* 9-Service Grid Layout (3x3 on Desktop, 2x2 on Tablet, 1 col on Mobile) */
    /* Service Card Component: Header, Status Pill, Dual Sparklines, Resource Gauges */
    /* 90-Day SLA Segment Bar & Cyberpunk Hover Tooltip */
    /* Chaos Control Panel & 5-Step Auto-Healing Workflow Bar */
    /* ANSI Streaming Terminal Drawer & Colored Logs */
    /* Responsive Breakpoints & Accessibility */
  </style>
</head>
<body>
  <!-- Header: Title, Global System Health Pill, Real-time Clock UTC, Chaos Button -->
  <!-- Top Telemetry Summary Ribbon: Global RPS, Avg P95 Latency, 90d SLA Aggregate, Active Nodes -->
  <!-- Chaos Injection Drawer / Modal: Scenario Selector & Auto-Healing State Machine Progress -->
  <!-- 9-Service Mesh Grid: 9 interactive service cards -->
  <!-- Floating Tooltip Container for 90-Day SLA Bars -->
  <!-- Bottom Collapsible ANSI Live Terminal Console -->

  <script>
    /* ES6+ Modular Self-Contained Architecture:
       1. DATA_STORE: Initial state for all 9 services, baseline metrics, 90-day history generator
       2. TELEMETRY_ENGINE: 1000ms tick, stochastic Brownian generator, ring buffer updates
       3. SPARKLINE_RENDERER: Canvas 2D Bézier curve rasterizer with gradient fills
       4. SLA_MATRIX_RENDERER: 90 interactive DOM/SVG segments with tooltip listeners
       5. CHAOS_ENGINE: Scenario execution, cascading failure triggers, 5-stage healing state machine
       6. TERMINAL_EMULATOR: ANSI parser, log stream buffer, level filtering, auto-scroll
       7. UI_CONTROLLER: DOM binding, event listeners, keyboard shortcuts
    */
  </script>
</body>
</html>
```

### Performance & Memory Budget

| Metric | Target Budget | Strategy |
|---|---|---|
| **First Contentful Paint** | < 100ms | Zero external CSS/JS bundles, inline critical styles |
| **Animation Framerate** | Solid 60 FPS | `requestAnimationFrame` for Canvas, CSS GPU transforms (`translate3d`) |
| **Telemetry Tick Overhead** | < 4ms per tick | Pre-allocated `Float32Array` ring buffers, zero array allocations during tick |
| **Terminal DOM Footprint** | Max 300 DOM nodes | Ring buffer DOM recycling (removes `firstChild` when exceeding 300 lines) |
| **Responsive Range** | 360px to 3840px (4K) | CSS Grid `grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))` |

---

## 8. Features Discovered & Probe Matrix

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | **Topology** | 9-Service Mesh Grid | High-density grid monitoring 9 critical services (CDN, Gateway, Core, Auth, DB, Redis, Pay, S3, Mail) | Service state objects, config baselines | 9 interactive DOM cards with real-time stats | Graceful fallback to default mock baseline if missing | ORIGINAL_REQUEST §R2 |
| 2 | **Telemetry** | Dual Canvas Sparkline | Real-time dual-metric visualizer showing RPS and Latency curves | 40-point ring buffer of (RPS, Latency) | Smooth 2D Bézier curve rendering on `<canvas>` | Clamps extreme spikes to canvas bounds; draws flatline if zero | ORIGINAL_REQUEST §R2 |
| 3 | **Telemetry** | Live Resource Gauges | Visual percentage bars for CPU%, Memory MB/GB, and Error Rate % | Numeric CPU, Mem, Error floats | Animated CSS progress bars with color thresholds | Auto-escalates color from Cyan to Amber (>75%) to Red (>90%) | ORIGINAL_REQUEST §R2 |
| 4 | **SLA History** | 90-Day SLA Uptime Bar | 90 interactive micro-segments representing historical daily uptime | 90-element array of daily incident records | Colored bar with hover highlights and tooltips | Missing days default to 100% green nominal state | ORIGINAL_REQUEST §R2 |
| 5 | **SLA History** | Cyberpunk SLA Tooltip | Floating contextual card detailing date, uptime %, incident ID, MTTR | Mouse hover event on SLA segment | Dynamically positioned tooltip card with arrow | Clamps to viewport boundaries to prevent overflow | ORIGINAL_REQUEST §R2 |
| 6 | **Chaos Engine** | Chaos Scenario Selector | Modal/drawer to pick from 5 realistic production outages (DB pool, 504, etc.) | User scenario click (`CHAOS_DB_POOL`, etc.) | Triggers telemetry degradation on target service | Prevents overlapping injections while healing is active | ORIGINAL_REQUEST §R2 |
| 7 | **Chaos Engine** | 5-Step Auto-Healing Flow | Autonomous recovery state machine (Alert -> Triage -> Reroute -> Probe -> Restored) | Timer-based state transitions (T+0s to T+9.5s) | Animated step indicators, progress bar (0-100%) | Fail-safe auto-recovery if script interrupted | ORIGINAL_REQUEST §R2 |
| 8 | **Terminal** | ANSI Log Streamer | Collapsible terminal displaying colored live NOC logs and heartbeats | Log message strings with ANSI escape sequences (`\x1b[32m`) | Styled HTML `<span>` nodes inside scrollable terminal | Unrecognized ANSI codes sanitized and stripped | ORIGINAL_REQUEST §R2 |
| 9 | **Terminal** | Terminal Stream Controls | Filter logs by level (All, Warn, Crit), pause stream, clear, copy | User button clicks | Filtered terminal view, clipboard write | Shows toast notification on copy failure/success | ORIGINAL_REQUEST §R2 |
| 10 | **Design** | Persistent Neon Icons | Emojis and indicators stay permanently visible with glowing filters | Service state changes | Persistent emoji with state-dependent glow filter | Emojis never replaced or hidden during errors | ORIGINAL_REQUEST §R2 & Criteria |
| 11 | **UX** | Real-time UTC Master Clock | Live millisecond/second clock showing current NOC operational timestamp | Browser `Date.now()` | Top-bar formatted UTC timestamp string | Auto-syncs every 1000ms | NOC Best Practices |
| 12 | **UX** | Service Filter & Search | Quick-filter services by Category (All, Edge, Core, Storage, Integrations) | Category button click | Instantly filters 9-service grid visibility | Shows "No services found" if filter matches 0 | NOC Ergonomics |

---

## 9. Edge Cases & Handling Strategy

| # | Feature | Edge Case Input | Observed / Required Behavior |
|---|---|---|---|
| 1 | **Sparkline Canvas** | Window resize or display DPI change (e.g. Retina 2x) | Canvas uses `devicePixelRatio` scaling to prevent blurriness; redraws smoothly without buffer reset. |
| 2 | **Sparkline Canvas** | Outage value exceeds 10x normal max (e.g. 8500ms latency) | Canvas scaling function uses dynamic logarithm or soft-clamped upper bound so curve doesn't clip off-screen. |
| 3 | **90-Day SLA Bar** | Mobile viewport width (< 400px) | Segments maintain minimum `2px` width with `gap: 1px`, or use horizontal scroll with fade mask so all 90 days remain accessible. |
| 4 | **SLA Tooltip** | Hovering leftmost segment (Day -89) or rightmost (Today) | Tooltip calculates bounding box and shifts `left` offset inward to prevent escaping screen edges. |
| 5 | **Chaos Engine** | User triggers Chaos Injection while another scenario is already healing | UI disables injection button with a tooltip "Healing in progress...", or queues scenario cleanly. |
| 6 | **Terminal Console** | High event throughput (e.g. 50 pings/sec during incident) | DOM node count is strictly capped at 300 entries by recycling `logContainer.removeChild(logContainer.firstChild)`. |
| 7 | **Terminal Console** | User is scrolling up to read historical logs | Auto-scroll automatically disengages when `scrollTop + clientHeight < scrollHeight - 20`, resumes when scrolled to bottom. |
| 8 | **Memory Safety** | Dashboard runs continuously in NOC monitor for 24+ hours | All intervals and ring buffers use fixed-size static arrays (`Float32Array`), zero memory leak / DOM leak. |

---

## 10. Verification & Test Plan for M2 Implementation

1. **Static Validation**:
   - Zero external scripts, zero CDNs (except Google Fonts with fallback).
   - Valid HTML5 markup and semantic structure.
2. **Visual Verification**:
   - Cyberpunk palette matching `#030812` base, `#06b6d4` Electric Cyan, and `#10b981` Emerald.
   - Persistent glowing emojis on all 9 cards.
   - High-density responsive grid (3x3 desktop, 2x2 tablet, 1x mobile).
3. **Interactive Simulation**:
   - Trigger each of the 5 Chaos Scenarios; observe exact telemetry spikes, cascading warnings, and the 5-step auto-healing sequence restoring all metrics to green.
   - Hover over multiple segments across all 9 services to verify tooltip data consistency.
   - Filter terminal logs and verify ANSI color rendering.
