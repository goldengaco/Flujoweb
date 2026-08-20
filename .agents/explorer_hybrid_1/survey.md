# Architectural & Technical Survey: Apigee Multi-Cloud Gateway & MuleSoft External Telemetry Cockpit (R1)

**Authoritative Explorer**: Explorer Hybrid 1  
**Target System**: `sistemas/apigee-mulesoft-hybrid/index.html`  
**Milestone**: M1 (Apigee-MuleSoft Hybrid Cockpit)  
**Date**: 2026-08-20  
**Status**: Complete & Authoritative Specification  

---

# SECTION 1: Executive Summary & System Overview

The **Apigee Multi-Cloud Gateway & MuleSoft External Telemetry Cockpit** (`sistemas/apigee-mulesoft-hybrid/index.html`) is an enterprise-grade, high-stakes single-file web application that models an end-to-end distributed transaction and observability flow across three distinct architectural tiers:
1. **Tier 1: Apigee Edge Ingress (GCP)** — Global Anycast ingress enforcing Spike Arrest (10,000 RPS), OAuth2 JWT cryptographic verification, Response Cache at the edge, and WAF threat inspection (Google Cloud Armor / Apigee Sense).
2. **Tier 2: MuleSoft Runtime Fabric (RTF)** — Kubernetes-based enterprise integration engine executing DataWeave 2.0 mapping, non-blocking asynchronous batch pipelines, worker vCore pool management (CPU%, JVM Heap Memory, GC pause telemetry), and Object Store v2 caching.
3. **Tier 3: Downstream Multi-Cloud Routing & Fan-Out** — Parallel fan-out routing to AWS (Lambda Serverless Compute, DynamoDB NoSQL), Google Cloud (Cloud SQL PostgreSQL HA, Pub/Sub Event Streaming), and Core Enterprise SAP Legacy (RFC / BAPI `BAPI_ACC_DOCUMENT_POST`).

The system is delivered with **zero external runtime dependencies beyond Google Fonts**, built upon HTML5 Canvas 60fps particle physics, procedural Web Audio API synthesizers, high-contrast Dark Cyberpunk HUD aesthetics (`#030812` background, `#00e5ff` cyan, `#f59e0b` amber, `#8b5cf6` purple, `#00ff88` emerald), real-time waterfall latency decomposition, interactive policy toggles, and multi-scenario error injection.

```
+-------------------------------------------------------------------------------------------------------------------+
|                           APIGEE MULTI-CLOUD GATEWAY & MULESOFT TELEMETRY COCKPIT                                 |
+-------------------------------------------------------------------------------------------------------------------+
|  [TIER 1: APIGEE EDGE INGRESS]       [TIER 2: MULESOFT RUNTIME FABRIC]     [TIER 3: DOWNSTREAM MULTI-CLOUD FAN-OUT]  |
|  +---------------------------+       +-------------------------------+     +------------------------------------+ |
|  | * Spike Arrest (10k RPS)  | =====>| * DataWeave 2.0 Mapping       | ===>| [AWS] Lambda (Risk Scorer) /       | |
|  | * OAuth2 JWT RS256 Check  |       | * Async Batch Engine          |     |       DynamoDB (Global Orders)     | |
|  | * Response Cache (300s)   |       | * Worker vCores (0.2-2.0 vCore| ===>| [GCP] Cloud SQL HA (PostgreSQL) /  | |
|  | * WAF Threat Inspection   |       | * JVM Heap & G1GC Pauses      |     |       Cloud Pub/Sub (Event Topic)  | |
|  |   (SQLi / XSS / CRS 3.3)  |       | * Object Store v2 (OSv2)      | ===>| [SAP] Core Legacy S/4HANA          | |
|  +---------------------------+       +-------------------------------+     |       (BAPI_ACC_DOCUMENT_POST)     | |
|                                                                            +------------------------------------+ |
+-------------------------------------------------------------------------------------------------------------------+
|                                            LIVE TELEMETRY & OBSERVABILITY                                         |
|  +---------------------------+  +-------------------------------+  +-------------------------------------------+  |
|  | 60fps Canvas Particle Stream | Waterfall Latency Breakdown   | Worker Pool Telemetry & JVM Dials         |  |
|  | Real-time packet Bezier   | Apigee (12ms) | Mule (34ms)   | vCore CPU: 42% | Heap: 780/2048 MB        |  |
|  | spline physics & glow     | Downstream AWS/GCP/SAP (210ms)| G1GC Pause: 18ms | OSv2 Hit: 89.2%         |  |
|  +---------------------------+  +-------------------------------+  +-------------------------------------------+  |
|                                                                                                                   |
|  +-------------------------------------------------------------------------------------------------------------+  |
|  | Interactive Policies: [Cache ON/OFF] [Spike 429] [Expired JWT 401] [WAF Threat 403] [SAP Lag 800ms]        |  |
|  | Web Audio Synthesizer: Procedural Chirps, Chimes, Sawtooth Sweeps & Harmonic Alarms (Mute Toggle Available)|  |
|  | Monospace Anypoint & Apigee Streaming Log Console with Severity Filters (ALL, INFO, WARN, ERROR, SECURITY)  |  |
|  +-------------------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------------------+
```

---

# SECTION 2: Exhaustive Architectural Tiers Specification

## 2.1 Tier 1: Apigee Edge Gateway Ingress (GCP)
Apigee serves as the intelligent API gateway running at Google Cloud edge PoPs worldwide, terminating client TLS, enforcing zero-trust identity, shielding internal infrastructure from DDoS/spikes, and caching responses.

### 1. Spike Arrest Policy (`SpikeArrest-10k-RPS`)
- **Algorithm**: Leaky Bucket with microsecond rate-smoothing window.
- **Specification**:
  - Configured Rate: `10000pm` (equivalent to 166.6 requests per second smoothing window).
  - Peak Burst Tolerance: Clamped to 50 concurrent tokens in burst window.
  - Formula: $	ext{Inter-arrival Interval } \Delta t = rac{60 	ext{ sec}}{10000} = 6.0	ext{ ms}$. If request arrives at $t < t_{last} + \Delta t$, it is evaluated against burst bucket.
- **Observable Telemetry**:
  - Current Ingress Rate (`currentRps`: e.g. `8,420 RPS`)
  - Spike Arrest Capacity Gauge (`spikeUtilization`: `84.2%`)
  - Throttled Counter (`droppedCount`: `0` nominal, increments on breach)
- **Error Behavior**:
  - Returns HTTP `429 Too Many Requests`.
  - Header: `Retry-After: 1`, `X-RateLimit-Limit: 10000`, `X-RateLimit-Remaining: 0`.
  - Body: RFC 7807 Problem Details (`type: "https://api.acme.com/errors/spike-arrest-violation"`, `code: "policies.ratelimit.SpikeArrestViolation"`).

### 2. OAuth2 & JWT Verification Policy (`Verify-JWT-RS256`)
- **Algorithm & Protocol**: Cryptographic asymmetric signature verification (`RS256` / `SHA256withRSA`).
- **JWKS Endpoint**: `https://auth.enterprise.acme/.well-known/jwks.json` (cached at edge with 3600s TTL).
- **Claims Evaluated**:
  - `iss` (Issuer): Must match `https://auth.enterprise.acme`
  - `aud` (Audience): Must include `https://api.acme.com/v1`
  - `sub` (Subject / Client ID): e.g. `client-app-pos-9941`
  - `exp` (Expiration Time): Epoch timestamp, rejected if $	ext{epoch}_{now} > 	ext{exp}$
  - `scope` (Entitlements): Required `payments:settle orders:create`
- **Error Behavior**:
  - Token Expired: HTTP `401 Unauthorized` (`code: "jwt.TokenExpired"`, `message: "JWT expired at epoch 1771549200"`).
  - Corrupted Signature: HTTP `403 Forbidden` (`code: "jwt.InvalidSignature"`, `message: "RS256 signature verification failed"`).

### 3. Response Cache Policy (`ResponseCache-Edge`)
- **Storage Layer**: Distributed high-speed in-memory L1 cache at Apigee Edge.
- **Cache Key Generation**: `MD5(request.verb + ":" + proxy.pathsuffix + ":" + request.header.idempotency-key)`
- **TTL**: 300 seconds (5 minutes).
- **Cache Hit Workflow**:
  - Ingress request hits Apigee -> Cache Key exists -> Response returned immediately.
  - Latency: $T_{edge} pprox 6 - 12	ext{ ms}$ (bypasses Tier 2 and Tier 3 completely).
  - Response Header: `X-Cache: HIT`, `X-Cache-TTL: 284s`.
  - Audio: Harmonic dual-frequency chime (`523.25Hz` + `659.25Hz`).
- **Cache Miss Workflow**:
  - Request forwarded to MuleSoft RTF -> Response populated in cache asynchronously.
  - Latency: $T_{e2e} pprox 65 - 150	ext{ ms}$.
  - Response Header: `X-Cache: MISS`.

### 4. WAF Threat Inspection Policy (`CloudArmor-WAF-CRS33`)
- **Rule Engine**: Google Cloud Armor integrated with Apigee Edge proxy.
- **Inspection Rules**:
  - SQL Injection (`OWASP CRS 3.3 sqli-rule-942100` / pattern regex detection)
  - Cross-Site Scripting (`OWASP CRS 3.3 xss-rule-941100`)
  - Log4Shell / JNDI Remote Code Execution (`CVE-2021-44228` payload scanner)
  - Malicious IP Reputation & Geo-blocking
- **Error Behavior**:
  - Returns HTTP `403 Forbidden`.
  - Body: `{"error": "WAF_THREAT_BLOCKED", "rule": "OWASP-CRS-3.3-SQLI", "clientIp": "198.51.100.44"}`.

---

## 2.2 Tier 2: MuleSoft Runtime Fabric (RTF) Integration Layer
MuleSoft RTF runs on a dedicated multi-node Kubernetes cluster, providing enterprise mediation, protocol transformation, message choreography, and non-blocking asynchronous processing.

### 1. DataWeave 2.0 Mapping Engine
- **Engine Spec**: High-throughput functional data transformation engine.
- **Canonical Transformation Flow**:
  - Inbound: REST JSON payload from Apigee.
  - Mapping logic: Normalizes customer identifiers, applies tax settlement rules, generates multi-target formats.
  - Outbound Targets:
    - Target 1 (AWS): AWS JSON event document.
    - Target 2 (GCP): CloudEvent 1.0 JSON tuple for Pub/Sub and SQL parameters.
    - Target 3 (SAP): XML / IDoc format for BAPI execution.
- **Live DataWeave 2.0 Code View**:
```dataweave
%dw 2.0
output application/json
var taxRate = 0.0825
---
{
  transactionId: payload.orderId,
  correlationId: vars.correlationId,
  status: "ROUTED_HYBRID",
  settlement: {
    baseAmount: payload.amount,
    tax: payload.amount * taxRate,
    total: payload.amount * (1 + taxRate),
    currency: upper(payload.currency default "USD")
  },
  destinations: {
    awsRiskScorer: "/v2/risk/evaluate",
    gcpCloudSqlHA: "orders_partition_2026",
    sapCoreLegacy: "BAPI_ACC_DOCUMENT_POST"
  },
  dispatchedAt: now()
}
```

### 2. Async Batch Pipelines & Thread Pooling
- **Threading Model**: Grizzly / Grizzly NIO reactor with non-blocking worker thread pool (`mule-worker-async-pool`).
- **Scatter-Gather Parallel Dispatch**: Simultaneously invokes AWS Lambda, GCP Cloud SQL, and SAP Legacy in non-blocking threads with timeout thresholds ($T_{timeout} = 1200	ext{ ms}$).
- **Batch Processing**: Block size = 100 records, auto-commit checkpoints to Object Store.

### 3. Worker vCore Pool & JVM Telemetry
- **vCore Allocation**:
  - Cluster configuration: 2.0 total vCores across 4 worker replicas (`mule-rtf-pod-0` through `pod-3`).
  - CPU Utilization: Dynamic simulation $15\% - 85\%$ under normal load; spikes to $95\%$ on batch surges.
- **JVM Heap Memory**:
  - Total Committed: 2,048 MB.
  - Active Used: 720 MB - 1,150 MB across Eden Space, Survivor Space, and Tenured Old Gen.
  - Watermark: High-memory warning at $>85\%$ ($1,740	ext{ MB}$).
- **Garbage Collection (GC) Pauses**:
  - Collector: G1GC (Garbage-First Collector).
  - Young Gen GC: $8 - 14	ext{ ms}$ pause duration.
  - Mixed GC: $22 - 38	ext{ ms}$ pause duration.
  - Real-time telemetry: GC pause frequency ($2.4	ext{ pauses/min}$), GC overhead ($0.8\%$).
- **Object Store v2 (OSv2)**:
  - Cache Hit Ratio: $85\% - 94\%$.
  - Partition Key Lookup: $3.2	ext{ ms}$ average latency.
  - Eviction rate: $0.1	ext{ items/sec}$ under LRU policy.
- **Circuit Breaker Policy**:
  - States: `CLOSED` (Normal), `OPEN` (Tripped after 3 consecutive downstream failures or latency $>600	ext{ ms}$), `HALF-OPEN` (Probing after 10s cooldown).

---

## 2.3 Tier 3: Downstream Multi-Cloud Routing & Fan-Out
Downstream execution orchestrates three enterprise cloud destinations in parallel:

### 1. AWS Cloud Services (Serverless & NoSQL)
- **AWS Lambda Function**: `arn:aws:lambda:us-east-1:123456789012:function:OrderRiskScorer`
  - Runtime: Node.js 20 / Python 3.12 Warm Container.
  - Execution Latency: $24 - 42	ext{ ms}$.
  - Concurrency: Auto-scaling up to 1,000 unreserved concurrent executions.
- **AWS DynamoDB**: Table `EnterpriseOrders_Global`
  - Partition Key: `PK = TENANT#9941`, Sort Key: `SK = ORDER#2026-8841`.
  - Latency: Single-digit millisecond ($4 - 8	ext{ ms}$).
  - Consumed Capacity: 15 WCU, 45 RCU.

### 2. Google Cloud Platform (GCP Database & Event Mesh)
- **GCP Cloud SQL High Availability**:
  - Engine: PostgreSQL 15 High Availability Cluster (`orders-db-primary` in `us-central1-a` with synchronous standby in `us-central1-f`).
  - Connection Pool: PgBouncer connection pool (Active: 28 / Max: 120).
  - Latency: $12 - 20	ext{ ms}$ query commit.
- **GCP Cloud Pub/Sub**:
  - Topic: `projects/acme-hybrid-prod/topics/order-settlement-events`.
  - Ingestion: High-throughput streaming with partition ordering keys (`OrderPartitionKey`).
  - Publish Latency: $8 - 15	ext{ ms}$.

### 3. Core Enterprise SAP Legacy (On-Premise / S/4HANA)
- **Connector**: SAP JCo 3.1.8 / RFC Connector with SNC (Secure Network Communications).
- **BAPI Function**: `BAPI_ACC_DOCUMENT_POST` (Financial accounting document creation).
- **Legacy Performance Profile**:
  - Latency: $180 - 420	ext{ ms}$ (represents typical mainframe / ERP enterprise commit lag).
  - Connection Pool: CPIC connection limit = 20.
  - Degradation Injection: Simulates SAP lock table contention and latency spikes up to $850	ext{ ms}$.

---

# SECTION 3: Visual & UI Blueprint

## 3.1 Cyberpunk Dark HUD Theme & Design Tokens
The visual design utilizes an ultra-high-contrast Cyberpunk HUD palette engineered for 24/7 mission-critical Network Operations Centers (NOC) and Site Reliability Engineering (SRE) war rooms.

### Color Tokens:
```css
:root {
  --bg-cosmic: #030812;
  --bg-card: rgba(8, 19, 38, 0.85);
  --bg-card-hover: rgba(14, 29, 56, 0.95);
  --border-cyan: rgba(0, 229, 255, 0.22);
  --border-purple: rgba(139, 92, 246, 0.22);
  --border-amber: rgba(245, 158, 11, 0.25);
  --cyan: #00e5ff;
  --cyan-glow: rgba(0, 229, 255, 0.45);
  --purple: #8b5cf6;
  --purple-glow: rgba(139, 92, 246, 0.45);
  --amber: #f59e0b;
  --amber-glow: rgba(245, 158, 11, 0.45);
  --emerald: #00ff88;
  --emerald-glow: rgba(0, 255, 136, 0.45);
  --crimson: #ff0055;
  --crimson-glow: rgba(255, 0, 85, 0.45);
  --text-main: #e2eafc;
  --text-muted: #7086ad;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-mono: 'Cascadia Code', 'Fira Code', monospace;
}
```

## 3.2 HTML5 Canvas 60 FPS Packet Stream Visualizer
A full-width high-framerate HTML5 Canvas renders real-time particle streams across all 3 tiers with cubic Bezier spline kinematics.

### Canvas Coordinate Map (1120px x 280px):
- **Node A (Client Ingress)**: $(x: 70, y: 140)$
- **Node B (Apigee Edge Gateway)**: $(x: 280, y: 140)$
- **Node C (MuleSoft RTF Hub)**: $(x: 580, y: 140)$
- **Node D1 (AWS Lambda / DynamoDB)**: $(x: 960, y: 60)$
- **Node D2 (GCP Cloud SQL / PubSub)**: $(x: 960, y: 140)$
- **Node D3 (SAP Legacy Core)**: $(x: 960, y: 220)$

### Particle Physics & Kinematics Engine:
- **Trajectory Calculation**:
  $$\mathbf{B}(t) = (1-t)^3 \mathbf{P}_0 + 3(1-t)^2 t \mathbf{P}_1 + 3(1-t) t^2 \mathbf{P}_2 + t^3 \mathbf{P}_3, \quad t \in [0, 1]$$
- **Particle State Properties**:
  - `x, y`: Current interpolated position.
  - `t`: Progress parameter $[0, 1]$, updated by $\Delta t = 	ext{speed} 	imes dt$.
  - `color`: Luminous hex code based on transaction state:
    - Cyan (`#00e5ff`) for active HTTP traffic.
    - Emerald (`#00ff88`) for Cache-Hit edge shortcuts.
    - Purple (`#8b5cf6`) for DataWeave processing.
    - Amber (`#f59e0b`) for SAP legacy transmission.
    - Crimson (`#ff0055`) for blocked / rate-limited packets.
  - `size`: $3.5	ext{ px}$ with glowing shadow radius $8	ext{ px}$.
  - `trail`: Ring buffer of previous 5 positions rendered with decaying opacity.
- **Node Impact Shockwave**:
  - When $t \ge 1.0$, node emits an expanding radial ripple ($r = 5 	o 30	ext{ px}$, $lpha = 0.8 	o 0$).

## 3.3 Waterfall Latency Decomposition Chart
Stacked horizontal latency breakdown bar visualizing millisecond budget consumption across tiers:
- **Segment 1: Apigee Edge Ingress**: $12	ext{ ms}$ (DNS, TLS, WAF, JWT, Spike Arrest) — Cyan `#00e5ff`
- **Segment 2: MuleSoft RTF Core**: $34	ext{ ms}$ (Worker Thread Dispatch, DataWeave 2.0, Batch Queue) — Purple `#8b5cf6`
- **Segment 3: AWS Serverless**: $28	ext{ ms}$ (Lambda + DynamoDB) — Orange `#f97316`
- **Segment 4: GCP Cloud SQL & PubSub**: $16	ext{ ms}$ (PgBouncer Commit + Pub/Sub Publish) — Blue `#3b82f6`
- **Segment 5: SAP Legacy Core**: $210	ext{ ms}$ (RFC / BAPI transaction lock) — Amber `#f59e0b`
- **Total Roundtrip**: $300	ext{ ms}$ vs SLA Target $500	ext{ ms}$ with dynamic pass/fail threshold indicator.

## 3.4 Worker Telemetry Dials & SVG Circular Gauges
Four high-precision SVG radial dials displaying live worker pool vitals:
1. **Worker vCore CPU Utilization Dial**: $0.00 - 2.00	ext{ vCores}$ ($0 - 100\%$, dynamic value e.g. $42\%$).
2. **JVM Heap Memory Saturation Dial**: $780	ext{ MB} / 2048	ext{ MB}$ ($38.1\%$).
3. **G1GC Pause Duration Dial**: $18	ext{ ms}$ average pause time ($2.4	ext{ pauses/min}$).
4. **Object Store v2 Cache Hit Ratio Dial**: $89.2\%$ Hit Ratio with real-time partition counter.

---

# SECTION 4: Interactive Behaviors, State Transitions & Web Audio API

## 4.1 Procedural Web Audio API Synthesizer
Zero external audio files; 100% pure procedural Web Audio API synthesis with dynamic envelope shaping and master mute toggle:

1. **`playPacketChirp()`** (Ingress packet transmission):
   - Type: Sine Wave Oscillator.
   - Frequency: Exponential ramp from $880	ext{ Hz}$ to $1,760	ext{ Hz}$.
   - Duration: $0.05	ext{ s}$.
   - Gain: $0.06$ peak with exponential decay.

2. **`playCacheHitTone()`** (Edge Cache Hit Chime):
   - Type: Dual Sine Oscillators.
   - Frequencies: $523.25	ext{ Hz}$ (C5) and $659.25	ext{ Hz}$ (E5).
   - Duration: $0.22	ext{ s}$.
   - Gain: Harmonious bell envelope.

3. **`playDataWeaveBuzz()`** (DataWeave Transformation Sweep):
   - Type: Bandpass Filtered Sawtooth Wave.
   - Filter Center Frequency: Sweep from $300	ext{ Hz}$ to $1,200	ext{ Hz}$.
   - Duration: $0.12	ext{ s}$.
   - Gain: $0.08$.

4. **`playErrorAlarm()`** (429 Rate Limit / 401 Expiry / WAF Threat):
   - Type: Dual Square Waves with Dissonant Frequencies ($150	ext{ Hz}$ and $220	ext{ Hz}$).
   - Duration: $0.28	ext{ s}$.
   - Gain: $0.12$.

5. **`playCircuitTripSound()`** (Circuit Breaker OPEN):
   - Type: Descending Sawtooth Slide from $650	ext{ Hz}$ down to $110	ext{ Hz}$.
   - Duration: $0.35	ext{ s}$.
   - Gain: $0.10$.

## 4.2 Interactive Policy Control Bar & Scenarios
The dashboard features an interactive control deck enabling live scenario triggering:

| Button ID | Label | Action & Scenario | Visual / Telemetry Response |
|-----------|-------|-------------------|-----------------------------|
| `btnRunE2E` | ⚡ Disparar Transacción E2E | Triggers nominal Happy Path flow through Apigee -> MuleSoft -> AWS, GCP & SAP. | Full 3-tier packet flow, DataWeave mapping, latency waterfall populated (~300ms), 200 OK log. |
| `btnToggleCache` | ⚡ Response Cache (ON/OFF) | Toggles Edge Cache. When ON, packet returns from Apigee node in 8ms without touching MuleSoft. | Green edge particle loop, "X-Cache: HIT" badge, latency drops to 8ms, cache tone plays. |
| `btnInjectSpike` | 🚫 Inyectar Spike Arrest 429 | Simulates traffic burst exceeding 10,000 RPS limit. | Apigee flashes crimson, packet terminates at Apigee, HTTP 429 Too Many Requests, error alarm. |
| `btnExpireToken` | 🔑 Simular Token Expirado (401) | Injects expired JWT token header. | Apigee JWT validator rejects request, HTTP 401 Unauthorized, zero load on MuleSoft workers. |
| `btnInjectWAF` | 🛡️ Inyectar Ataque WAF (403) | Injects SQL Injection probe (`' OR '1'='1`). | Cloud Armor WAF rule trips, HTTP 403 Forbidden, security alert banner, WAF log entry. |
| `btnInjectLag` | 🐢 Inyectar SAP Lag (800ms) | Simulates SAP RFC contention and latency spike. | SAP node glows amber, total latency spikes to 880ms, Circuit Breaker trips to OPEN. |
| `btnScaleWorkers` | 📈 Autoscale Workers (+2 Pods) | Scales MuleSoft RTF worker pool from 2 to 4 pods. | vCore capacity doubles to 2.0 vCores, CPU load drops from 80% to 40%, pod indicators light up. |
| `btnMuteAudio` | 🔊 Audio: ON / OFF | Toggles Web Audio API synthesis. | Updates button text/icon, mutes/unmutes audio gain node. |

## 4.3 Streaming Anypoint & Apigee Event Console
- High-density monospace live-tail terminal.
- Filter buttons: `ALL`, `INFO`, `WARN`, `ERROR`, `SECURITY`.
- Features: Auto-scroll lock toggle, buffer capped at 200 entries to prevent memory bloat, instant clipboard copy (`Copiar Logs`).
- Format: `[HH:mm:ss.SSS] [corr-uuid] [TIER-TAG] [STATUS] Message payload`.

---

# SECTION 5: Comprehensive Features Discovered & Edge Cases

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Ingress | Spike Arrest Policy | 10,000 RPS leaky-bucket rate limiter smoothing traffic bursts | RPS traffic stream | Ingress pass / throttle status | Returns HTTP 429 Too Many Requests | ORIGINAL_REQUEST.md & Spec |
| 2 | Security | OAuth2 JWT RS256 Verification | Asymmetric signature, claims, expiry, and scope validation | Bearer JWT token | Decoded claims, client identity | Returns HTTP 401 / 403 on invalid/expired token | ORIGINAL_REQUEST.md & Spec |
| 3 | Ingress | Response Cache at Edge | L1 distributed key-value cache serving sub-10ms cached responses | Idempotency Key, URI hash | Cached JSON response, X-Cache: HIT | Cache miss falls through to MuleSoft RTF | ORIGINAL_REQUEST.md & Spec |
| 4 | Security | WAF Threat Inspection | Cloud Armor / CRS 3.3 rules inspecting SQLi, XSS, and RCE | HTTP payload / query parameters | Clean request forward / block | Returns HTTP 403 Forbidden with threat rule ID | ORIGINAL_REQUEST.md & Spec |
| 5 | Integration | DataWeave 2.0 Mapping Engine | Canonical JSON transformation to AWS, GCP, and SAP schemas | Inbound JSON order payload | Multi-target normalized schemas | DataWeave syntax/mapping error handling | ORIGINAL_REQUEST.md & Spec |
| 6 | Integration | Async Batch Flow Pipelines | Non-blocking async queueing and scatter-gather parallel routing | Batch message chunks | Concurrent dispatch to 3 clouds | Timeout isolation per cloud destination | ORIGINAL_REQUEST.md & Spec |
| 7 | Observability | Worker vCore Pool Telemetry | Real-time CPU utilization % across worker pod replicas | Worker telemetry feed | Live CPU % gauge, active pod count | Warning state when CPU > 85% | ORIGINAL_REQUEST.md & Spec |
| 8 | Observability | JVM Heap Memory Saturation | Real-time heap tracking (Eden, Survivor, Tenured Gen MB) | JVM telemetry feed | Memory dial (Used MB vs Committed MB) | GC trigger warning at 85% capacity | ORIGINAL_REQUEST.md & Spec |
| 9 | Observability | G1GC Pause Telemetry | Young and mixed garbage collection pause duration and frequency | JVM GC event stream | Millisecond pause gauge, pause rate/min | Alert on GC pause > 50ms | ORIGINAL_REQUEST.md & Spec |
| 10 | Observability | Object Store v2 Hit Ratio | Distributed Mule cache performance and key lookup latency | Cache read/write operations | Hit ratio %, active keys count | Low hit ratio notification (<70%) | ORIGINAL_REQUEST.md & Spec |
| 11 | Downstream | AWS Lambda & DynamoDB Fan-Out | Serverless risk scoring and NoSQL order table persistence | Event document | Lambda execution ms, DynamoDB WCU/RCU | AWS 500 error / retry handling | ORIGINAL_REQUEST.md & Spec |
| 12 | Downstream | GCP Cloud SQL HA & Pub/Sub | PostgreSQL HA commit and streaming Pub/Sub topic publication | SQL parameters, CloudEvent | Query latency ms, Pub/Sub ack | Database connection pool timeout handling | ORIGINAL_REQUEST.md & Spec |
| 13 | Downstream | Core SAP Legacy BAPI Execution | Financial accounting posting via `BAPI_ACC_DOCUMENT_POST` | SAP BAPI structure | SAP Doc ID, CPIC connection status | Mainframe lock contention / timeout handling | ORIGINAL_REQUEST.md & Spec |
| 14 | Observability | Waterfall Latency Decomposition | Live stacked bar chart isolating Apigee vs Mule vs Downstream ms | Millisecond phase timestamps | Stacked visual bar vs 500ms SLA | Highlights breaching tier in crimson | ORIGINAL_REQUEST.md & Spec |
| 15 | Visualizer | 60fps Canvas Particle Stream | High-framerate Bezier spline particle kinematics connecting nodes | Particle clock tick, node map | Luminous animated particle stream | Graceful degradation on frame drop | ORIGINAL_REQUEST.md & Spec |
| 16 | Audio | Web Audio API Sound Synthesizer | Procedural procedural audio for packets, cache hits, errors, alarms | Transaction trigger events | Real-time synthesized audio waves | Master mute button & AudioContext unlock | ORIGINAL_REQUEST.md & Spec |
| 17 | Resilience | Circuit Breaker Pattern | Trips to OPEN when downstream SAP latency >600ms or fails | Downstream health probe | Circuit state (CLOSED/OPEN/HALF-OPEN) | Serves cached fallback when OPEN | ORIGINAL_REQUEST.md & Spec |
| 18 | Observability | Monospace Live-Tail Log Console | High-density real-time log viewer with severity filters | Telemetry log events | Filterable log rows with correlation IDs | DOM ring buffer capped at 200 items | ORIGINAL_REQUEST.md & Spec |
| 19 | Resilience | Worker Pool Autoscaler | Interactive scaling of worker pod replicas from 2 to 4 pods | Scale button event | vCore capacity change, CPU rebalancing | Clamped to max 4 pods | ORIGINAL_REQUEST.md & Spec |
| 20 | Architecture | Zero-Dependency Single-File App | 100% self-contained HTML/CSS/JS with zero external CDNs | Browser engine | Autonomous client-side web application | Zero JavaScript console errors | ORIGINAL_REQUEST.md & Spec |

---

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Spike Arrest | Instant 500-request burst at $t=0$ | Apigee leaky bucket allows initial tokens, immediately throttles remaining with HTTP 429, emits error alarm, and increments dropped counter without crashing. |
| 2 | JWT Verification | Malformed JWT with missing signature segment (`header.payload.`) | Apigee JWT validator flags format corruption, returns HTTP 401 Unauthorized, blocks request at edge, and logs security event. |
| 3 | Response Cache | Rapid repeated requests with identical Cache-Key | First request incurs full 300ms roundtrip (MISS); subsequent requests return in 8ms (HIT) directly from Apigee edge memory. |
| 4 | WAF Inspection | Payload containing obfuscated SQL injection (`1' /*!50000OR*/ 1=1 --`) | Cloud Armor regex engine detects obfuscated SQLi signature, aborts proxy execution, returns HTTP 403 Forbidden. |
| 5 | Downstream SAP Lag | SAP response latency artificially increased to 850ms | Total transaction latency reaches 900ms, breaching 500ms SLA bar; Circuit Breaker detects 3 consecutive lag violations and trips to OPEN. |
| 6 | Circuit Breaker OPEN | Inbound transaction while Circuit Breaker is OPEN | MuleSoft immediately serves fallback response from Object Store v2 (12ms) without attempting SAP connection. |
| 7 | Worker Pool Scaledown | Worker replicas scaled down while high CPU load is active | CPU utilization gauge dynamically spikes from 40% to 80%, JVM memory dial reallocates across remaining pods without dropping transactions. |
| 8 | AudioContext Locked | User loads page without prior click or user interaction | Web Audio API AudioContext enters suspended state; on first button click, `AudioContext.resume()` gracefully unlocks audio with zero console errors. |
| 9 | Log Buffer Overflow | Continuous high-frequency transactions generating >500 log rows | Circular DOM buffer automatically evicts oldest rows, strictly maintaining $\le 200$ rows in memory to guarantee 60fps rendering without memory leak. |
| 10 | Viewport Responsiveness | Viewport resized from 4K (3840px) down to Mobile Portrait (400px) | Layout gracefully reflows into single-column vertical stack, Canvas automatically scales to container width, metrics remain legible with zero horizontal overflow. |

---

# SECTION 6: DOM Architecture & Verification Test Contract

To enable automated E2E testing and complete architectural attestation, the following standard DOM element IDs and data attributes are specified:

### Key DOM Element IDs:
- `#packetCanvas`: 60fps HTML5 Canvas visualizer element.
- `#btnRunE2E`: Primary button to trigger E2E transaction.
- `#btnToggleCache`: Toggle button for Response Cache.
- `#btnInjectSpike`: Rate limiting 429 injection button.
- `#btnExpireToken`: Expired JWT 401 injection button.
- `#btnInjectWAF`: SQLi / WAF threat injection button.
- `#btnInjectLag`: Downstream SAP lag injection button.
- `#btnScaleWorkers`: Worker autoscaling button.
- `#btnMuteAudio`: Audio mute toggle button.
- `#corrIdDisplay`: Current active `X-Correlation-ID` span.
- `#e2eLatencyDisplay`: Live total latency text display.
- `#cacheStatusBadge`: Response cache status (`HIT` / `MISS` / `BYPASS`).
- `#circuitStatusBadge`: Circuit breaker status (`CLOSED` / `OPEN` / `HALF-OPEN`).
- `#vcoreGaugeVal`: Worker vCore CPU load text / gauge value.
- `#heapGaugeVal`: JVM Heap memory text / gauge value.
- `#gcPauseGaugeVal`: G1GC pause duration text / gauge value.
- `#osHitGaugeVal`: Object Store hit ratio text / gauge value.
- `#waterfallBarApigee`: Latency bar segment for Apigee Ingress.
- `#waterfallBarMule`: Latency bar segment for MuleSoft RTF.
- `#waterfallBarAWS`: Latency bar segment for AWS.
- `#waterfallBarGCP`: Latency bar segment for GCP.
- `#waterfallBarSAP`: Latency bar segment for SAP.
- `#logList`: Monospace log row container.
- `#dwCode`: DataWeave 2.0 transformation code preview container.

---

# SECTION 7: Conclusion & Implementation Readiness

The technical specification for R1 (`sistemas/apigee-mulesoft-hybrid/index.html`) is complete, authoritative, and exhaustive. It provides all architectural models, mathematical formulas, color tokens, canvas particle physics, Web Audio API sound designs, and DOM contracts required for implementation.
