# Architectural & Technical Survey: GCP Cloud Observability Dashboards (R1 & R2)

**Authoritative Explorer**: Explorer GCP 1  
**Target Systems**:
1. **R1**: Serverless Microservice Pipeline & Zero-Downtime Deployer (`sistemas/gcp-serverless-pipeline/index.html`)
2. **R2**: Event-Driven Pub/Sub Ingestion & DLQ Console (`sistemas/gcp-event-pubsub/index.html`)  
**Date**: 2026-08-20  
**Status**: Authoritative Architectural Survey & Specification Complete

---

# SECTION 1: R1 — Serverless Microservice Pipeline & Zero-Downtime Deployer

## 1.1 Architectural Blueprint & Pipeline Topology
The dashboard models a mission-critical Google Cloud serverless deployment pipeline operating across 6 GCP services:
- **Cloud Build** (`cloudbuild.googleapis.com`): Automated container compilation and Kaniko caching.
- **Artifact Registry & Container Analysis** (`artifactregistry.googleapis.com` / `containeranalysis.googleapis.com`): Vulnerability CVE scanning and SBOM validation.
- **Cloud KMS & Binary Authorization** (`cloudkms.googleapis.com`): Asymmetric cryptographic signing (`SHA256withRSA`) of container digests.
- **Secret Manager** (`secretmanager.googleapis.com`): Runtime secret injection via KMS envelope decryption and IAM service account binding.
- **Cloud Run** (`run.googleapis.com`): Knative-based serverless container orchestration with gVisor sandbox isolation, scale-from-zero cold-start mechanics, and dual-revision management (`Revision 42` Green / Stable vs `Revision 43` Blue / Canary).
- **Cloud Logging** (`logging.googleapis.com`): High-throughput structured JSON telemetry and live streaming log console.

```
+-------------------------------------------------------------------------------------------------------------------+
|                                  GCP SERVERLESS MICROSERVICE PIPELINE & DEPLOYER                                 |
+-------------------------------------------------------------------------------------------------------------------+
|  [STAGE 1: BUILD]       [STAGE 2: SECURITY]      [STAGE 3: SECRETS]     [STAGE 4: DEPLOY]     [STAGE 5: TRAFFIC]     |
|   +---------------+      +---------------+        +---------------+      +---------------+     +---------------+  |
|   | 📦 Trigger &  | ===> | 🛡️ Artifact Reg|  ===>  | 🔑 Secret     | ===> | 🚀 Cloud Run  | ==> | 🔀 Blue/Green |  |
|   |  Cloud Build  |      |  & KMS Signing |        |  Manager Auth |      |  Spin-Up (ms) |     |  Canary Split |  |
|   +---------------+      +---------------+        +---------------+      +---------------+     +---------------+  |
|           |                      |                        |                      |                     |          |
|    Kaniko Cache Hit       CVE Vuln Scanner          KMS Envelope Key       gVisor Sandbox Init     Dual-Revision  |
|    Docker Multi-Stage     Binary Auth Attest        IAM Service Account    Cold-Start Gauge        Traffic Slider |
+-------------------------------------------------------------------------------------------------------------------+
|                                            LIVE TELEMETRY & OBSERVABILITY                                         |
|  +---------------------------+  +-------------------------------+  +-------------------------------------------+  |
|  |  Cold-Start Latency Dial  |  | Active Instances Matrix (0-10)|  | Dynamic Traffic Split Particles (0-100%)  |  |
|  |  T_cold = 348 ms          |  | [Inst-1: WARM] [Inst-2: IDLE] |  | Rev 42 (80%) 🟢 ========> [🟢 Green Flow] |  |
|  |  Sandbox/Image/App breakdown | [Inst-3: BUSY] [Inst-4: SPIN] |  | Rev 43 (20%) 🔷 ========> [🔷 Blue Flow]  |  |
|  +---------------------------+  +-------------------------------+  +-------------------------------------------+  |
|                                                                                                                   |
|  +-------------------------------------------------------------------------------------------------------------+  |
|  |  Real-time Cloud Logging Live-Tail Console (ANSI, Severity Badges, JSON Expander, Filter by Service & Level)|  |
|  +-------------------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 1.2 R1 Stepper State Machine Specifications

### Pipeline Nodes & States
Each node in the 5-stage pipeline has 5 possible states:
1. `PENDING` (Dimmed cyan/slate border, muted text, waiting for preceding stage)
2. `RUNNING` (Pulsing neon-cyan glow, animated spinner ring, real-time log emissions)
3. `SUCCESS` (Luminous emerald glow `#10b981`, permanent emoji icon intact, telemetry metrics rendered)
4. `FAILED` (Crimson alert glow `#ef4444`, detailed error drawer, rollback prompt)
5. `WARNING` (Amber warning glow `#f59e0b`, non-blocking CVE alert or cold-start threshold notification)

### Detailed Node Specifications:

#### Node 1: 📦 Trigger Commit & Cloud Build
- **Trigger Source**: Git commit hook on `main` branch (`git commit -m "feat(checkout): v2.4.0 async pipeline" -> SHA: 8a4f29c017`).
- **GCP API**: `POST https://cloudbuild.googleapis.com/v1/projects/acme-gcp-prod/builds`
- **Execution Steps**:
  1. `Step 0: kaniko-cache` — Restores intermediate build cache layers (Hit rate: 91.4%).
  2. `Step 1: compile` — `go build -ldflags="-s -w -X main.version=v2.4.0" -o /bin/server .`
  3. `Step 2: pack` — Distroless container image assembly (`gcr.io/distroless/static-debian12:nonroot`).
- **Telemetry Displayed**: Build duration (e.g. `31.8s`), Artifact Digest (`sha256:7f9a8b1c4e92...`), Build ID (`b92a14e8-4c12-4217-a021-998fc1a1170d`).

#### Node 2: 🛡️ Artifact Registry Vulnerability Scanning & KMS Signing
- **GCP APIs**:
  - `POST https://containeranalysis.googleapis.com/v1/projects/acme-gcp-prod/occurrences`
  - `POST https://cloudkms.googleapis.com/v1/projects/acme-gcp-prod/locations/global/keyRings/pipeline-ring/cryptoKeys/binary-signer/cryptoKeyVersions/1:asymmetricSign`
- **Vulnerability Scanning**: Evaluates container SBOM against CVE database:
  - Critical: 0
  - High: 0
  - Medium: 1 (`CVE-2024-21626` in runc < 1.1.12 — mitigated via gVisor sandbox)
  - Low: 3 (Informational library dependencies)
- **Binary Authorization Attestation**: Container digest signed with Cloud KMS asymmetric key. Generates verifiable attestation occurrence `projects/acme-gcp-prod/attestors/build-attestor`.

#### Node 3: 🔑 Secret Manager Injection & IAM Auth
- **GCP APIs**:
  - `GET https://secretmanager.googleapis.com/v1/projects/acme-gcp-prod/secrets/DB_CONNECTION_STRING/versions/latest:access`
  - `GET https://secretmanager.googleapis.com/v1/projects/acme-gcp-prod/secrets/PAYMENT_GATEWAY_KEY/versions/latest:access`
  - `GET https://secretmanager.googleapis.com/v1/projects/acme-gcp-prod/secrets/JWT_HMAC_SECRET/versions/latest:access`
- **IAM Authorization**: Validates runtime Service Account `order-svc-sa@acme-gcp-prod.iam.gserviceaccount.com` has `roles/secretmanager.secretAccessor`.
- **Envelope Encryption**: Decrypted via KMS key `projects/acme-gcp-prod/locations/us-central1/keyRings/vault-ring/cryptoKeys/env-key`.
- **Security Guarantee**: Zero environment variables in plaintext; in-memory mounted ephemeral files `/secrets/db-config.json`.

#### Node 4: 🚀 Cloud Run Revision Spin-Up & Cold-Start Telemetry
- **GCP API**: `POST https://run.googleapis.com/v2/projects/acme-gcp-prod/locations/us-central1/services/order-service/revisions`
- **Revision Identifier**: `order-service-00043-k9p` (Blue/Canary) alongside `order-service-00042-xyz` (Green/Active).
- **Physical Cold-Start Latency Breakdown**:
  - Sandbox Creation (gVisor microVM runtime): $48\text{ ms}$
  - Image Layer Streaming (Artifact Registry CRFS): $115\text{ ms}$
  - Secret Decryption & IAM Exchange: $32\text{ ms}$
  - Go Runtime & DB Connection Pool Init: $153\text{ ms}$
  - Healthcheck HTTP Probe (`/healthz`): $12\text{ ms}$
  - **Total Cold-Start Latency**: $360\text{ ms}$ (vs Warm Request: $11.4\text{ ms}$).
- **Active Instances**: Autoscales from 0 up to 8 active microVM instances responding to simulated traffic.

#### Node 5: 🔀 Blue/Green & Canary Traffic Splitting
- **GCP API**: `PATCH https://run.googleapis.com/v2/projects/acme-gcp-prod/locations/us-central1/services/order-service`
- **Traffic Configuration**:
  ```json
  "traffic": [
    { "revisionName": "order-service-00042-xyz", "percent": 80 },
    { "revisionName": "order-service-00043-k9p", "percent": 20 }
  ]
  ```
- **Interactive Control**: Slider from 0% to 100% with preset quick-buttons:
  - `100% Green (Rev 42)`
  - `90/10 Canary`
  - `50/50 Blue/Green`
  - `100% Blue (Promote Rev 43)`
  - `Emergency Instant Rollback`
- **Visual Feedback**: Real-time traffic split visualization showing particle beams routing between green and blue revisions, live error rate delta, and P99 latency comparison.

---

## 1.3 R1 Mathematical & Rendering Physics Models

### Cold-Start Latency Gauge Mathematics
The cold-start latency gauge is an SVG arc gauge with radius $R = 70\text{px}$, span angle $\theta = 240^\circ$ (from $150^\circ$ to $390^\circ$).
- Total Arc Length: $L = \frac{240}{360} \times 2\pi R = \frac{2}{3} \times 2 \pi \times 70 \approx 293.215\text{px}$.
- Scale: $0\text{ ms} \rightarrow 1000\text{ ms}$.
- Formula:
  $$\text{strokeDashoffset} = L \times \left(1 - \frac{\min(T_{\text{cold}}, 1000)}{1000}\right)$$
- Dynamic Color Interpolation:
  - $0-250\text{ ms} \rightarrow \text{Emerald } \#10b981$ (Blazing fast)
  - $251-500\text{ ms} \rightarrow \text{Cyan } \#00e5ff$ (Normal cold start)
  - $501-750\text{ ms} \rightarrow \text{Amber } \#f59e0b$ (Moderate initialization delay)
  - $751-1000\text{ ms} \rightarrow \text{Crimson } \#ef4444$ (Severe cold start / JVM bootstrap)

### Particle Traffic Splitting Physics (Canvas 60fps)
The traffic split visualizer uses an HTML5 Canvas rendering particle flow:
- Inbound Source: $P_0 = (x_0, y_0)$ at center left.
- Bifurcation Junction: $P_1 = (x_1, y_1)$ at center.
- Target Revision Green (Rev 42): $P_{\text{green}} = (x_2, y_{\text{top}})$.
- Target Revision Blue (Rev 43): $P_{\text{blue}} = (x_2, y_{\text{bottom}})$.
- Path generated via Cubic Bézier:
  $$B(t) = (1-t)^3 P_0 + 3(1-t)^2 t C_1 + 3(1-t) t^2 C_2 + t^3 P_{\text{target}}$$
- Particle Assignment: Each particle is assigned a pseudo-random seed $u \in [0, 100)$. If $u < \text{splitPercent}$, route to Blue ($P_{\text{blue}}$); else route to Green ($P_{\text{green}}$).
- Particle Speed: $v \sim \mathcal{U}(2.5, 4.0)\text{ px/frame}$ with trailing alpha decay $\alpha(t) = \sin(\pi t)$.

### Autoscaling Differential Model
Active instances $N(t)$ scale based on traffic rate $R(t)$ (req/s), target concurrency $C = 80$, and average request latency $\bar{L} = 0.045\text{s}$:
$$N_{\text{target}}(t) = \max\left(N_{\min}, \min\left(N_{\max}, \left\lceil \frac{R(t) \cdot \bar{L}}{C \cdot 0.70} \right\rceil\right)\right)$$
Smoothing step:
$$N(t + \Delta t) = N(t) + \operatorname{sgn}(N_{\text{target}} - N(t)) \cdot \begin{cases} 1 & \text{if scale-up (fast: } \tau_{\text{up}} = 0.8\text{s)} \\ 0.2 & \text{if scale-down (cooldown: } \tau_{\text{down}} = 5\text{s)} \end{cases}$$

---

## 1.4 R1 Interactive Cloud Logging & Telemetry Specifications
The Cloud Logging Console provides live structured logs with:
- Severity Filters: `ALL`, `INFO`, `NOTICE`, `WARN`, `ERROR`, `CRITICAL`.
- Log Types: `Cloud Build`, `Artifact Registry`, `Secret Manager`, `Cloud Run`, `KMS Auth`.
- Search Bar: Live regex / substring filter matching payload text or trace ID.
- Expandable JSON Rows: Clicking any row unfolds the full GCP Cloud Logging structured JSON schema (`insertId`, `httpRequest`, `labels`, `resource.type: "cloud_run_revision"`, `severity`, `timestamp`, `trace`).

---

# SECTION 2: R2 — Event-Driven Pub/Sub Ingestion & DLQ Console

## 2.1 Architectural Blueprint & Topology
The dashboard models high-scale event streaming across 5 GCP services:
- **Cloud Scheduler & Webhooks** (`cloudscheduler.googleapis.com`): High-volume cron triggers and REST webhook ingestion.
- **Cloud Pub/Sub Topics & Partitions** (`pubsub.googleapis.com`): Partitioned message streaming (4 partition lanes), ordering keys, and deduplication IDs.
- **Worker Subscriptions & Cloud Storage Archival** (`storage.googleapis.com`): High-throughput pull/push subscribers archiving Parquet batches into Cloud Storage data lake `gs://acme-event-lake-prod/`.
- **Firebase / FCM Push Notifications** (`fcm.googleapis.com`): Downstream device dispatch and notification receipts.
- **Dead-Letter Queue (DLQ) & Poison-Pill Interceptor** (`pubsub.googleapis.com` DLQ Policy): Automatic redirection of unparseable or expired messages ($N \ge 5$ NACKs), interactive payload inspector, and instant "Replay to Topic" remediation.
- **Cloud Monitoring** (`monitoring.googleapis.com`): Live throughput charts, backlog depth gauge, and P50/P95/P99 latency SLA histogram.

```
+-------------------------------------------------------------------------------------------------------------------+
|                                  GCP EVENT-DRIVEN PUB/SUB INGESTION & DLQ CONSOLE                                 |
+-------------------------------------------------------------------------------------------------------------------+
|  [INGESTION]              [STREAMING TOPIC]               [PROCESSING & SINK]             [DLQ QUARANTINE]        |
|  +-----------------+      +-----------------------+       +------------------------+      +--------------------+  |
|  | ⏰ Cloud Sched  | ===> | 📬 Pub/Sub Topic      | ====> | ⚙️ Worker Consumer Sub | ===> | ☠️ Dead-Letter Queue|  |
|  | & Webhook Ingest|      | (4 Partition Lanes)   |   ||  | & GCS Parquet Lake Sink|      | (Poison Pill Trap) |  |
|  +-----------------+      +-----------------------+   ||  +------------------------+      +--------------------+  |
|          |                            |               ||              |                             |             |
|   Webhook Bursts           Ordering Key Hashing       ||      Parquet Batching (4MB)       Schema Mismatch / NACK |
|   Cron Ticks (1/min)       Partition Load Balancer    ||      📱 FCM Push Dispatch         Interactive Inspector  |
|                                                       \/                                   "Replay to Topic" 🔄   |
+-------------------------------------------------------------------------------------------------------------------+
|                                            LIVE TELEMETRY & OBSERVABILITY                                         |
|  +-------------------------------------+  +-------------------------------+  +---------------------------------+  |
|  | Live Ingestion vs ACK Throughput    |  | Queue Backlog Depth Meter     |  | Latency SLA Histogram (P50/P99) |  |
|  | [Ingestion: 1,420 msg/s (Amber)]    |  | Unacked: 42 msgs (1.8 MB)     |  | <5ms: 45%  5-20ms: 40%          |  |
|  | [ACK Rate: 1,390 msg/s (Cyan)]      |  | Oldest Msg Age: 1.2s          |  | 20-50ms: 12%  >100ms (SLA): 3%  |  |
|  +-------------------------------------+  +-------------------------------+  +---------------------------------+  |
|                                                                                                                   |
|  +-------------------------------------------------------------------------------------------------------------+  |
|  | Interactive DLQ Quarantine Table & Payload Inspector (View Corrupted Byte Dumps, NACK Causes, Batch Replay) |  |
|  +-------------------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 2.2 R2 Interactive Topology & State Machine Specifications

### Streaming Topology Nodes:
1. ⏰ **Cloud Scheduler / Webhook Ingestion**:
   - Webhook Ingestion endpoint: `POST /v1/ingest/events`
   - Scheduler Job: `projects/acme-gcp-prod/locations/us-central1/jobs/sync-events-cron` (`schedule: "* * * * *"`, target: Pub/Sub topic).
   - Ingestion Modes: Continuous baseline (800-1,200 msg/s), Periodic Burst (+3,000 msg/s), Webhook Pulse.
2. 📬 **Cloud Pub/Sub Topic (`telemetry-events-inbound`)**:
   - 4 Partition Streams (`partition-0`, `partition-1`, `partition-2`, `partition-3`).
   - Ordering Key Hashing: $\text{partition} = \text{CRC32}(\text{ordering\_key}) \pmod 4$.
   - Message Deduplication: Sliding 10-minute window deduplication cache based on `message_id`.
3. ⚙️ **Worker Subscription Consumer & GCS Archival**:
   - Subscription: `projects/acme-gcp-prod/subscriptions/worker-stream-sub` (Ack deadline: 30s).
   - Worker Pool: 8 concurrent processing threads pulling messages in batches of 100.
   - Cloud Storage Sink: Aggregates 10,000 messages or 4MB into Snappy-compressed Parquet objects written to `gs://acme-event-lake-prod/events/YYYY/MM/DD/part-*.parquet`.
4. 📱 **FCM Push Notification Dispatcher**:
   - Dispatches high-priority notifications to registered mobile/web tokens via FCM v1 API.
   - Live Delivery Success Rate meter (99.85%).
5. ☠️ **Dead-Letter Queue (DLQ) & Poison-Pill Interceptor**:
   - Topic: `projects/acme-gcp-prod/topics/telemetry-events-dlq`
   - Dead-Letter Policy: `maxDeliveryAttempts: 5`.
   - Quarantined Poison Pill Reasons:
     - `SCHEMA_VALIDATION_ERROR`: JSON payload missing required `event_id` or invalid type.
     - `MALFORMED_UTF8_PAYLOAD`: Unparseable binary sequences / truncated buffer.
     - `DEPENDENCY_TIMEOUT_NACK`: Downstream database deadlocks causing 5 consecutive NACKs.
     - `CORRUPTED_SIGNATURE`: Cryptographic hash mismatch on tamper-evident payload.

### Interactive DLQ Inspector & Replay State Machine:
- **Quarantine Table**: Lists all quarantined poison pills with timestamp, message ID, retry count (5/5), failure reason badge, and action buttons.
- **Payload Viewer Modal/Drawer**: Displays formatted syntax-highlighted JSON/hex dump, delivery attempt headers (`x-goog-pubsub-delivery-attempt: 5`), and raw exception stack trace.
- **Interactive "Replay to Topic" Action**:
  1. User clicks "Replay to Topic" on an individual message or "Replay All Filtered".
  2. Modifies message attributes (`x-replayed-by: console-sre-admin`, `x-replay-timestamp: ISO_DATE`, `x-sanitized: true`).
  3. Re-publishes message to `projects/acme-gcp-prod/topics/telemetry-events-inbound`.
  4. Removes message from DLQ quarantine table with green flash animation.
  5. Logs audit event: `[AUDIT] SRE user replayed msg 91028471928374 to telemetry-events-inbound`.
  6. Backlog and DLQ counters dynamically decrement in real time.
- **"Purge Poison Pill" Action**: Discards unfixable malicious bytes with irreversible audit log confirmation.

---

## 2.3 R2 Mathematical & Canvas Rendering Models

### Live Ingestion vs ACK Throughput Dual-Line Chart (Canvas 60fps)
The throughput chart renders a sliding 60-second time window:
- Canvas resolution: $800\text{px} \times 240\text{px}$ (scaled with `window.devicePixelRatio`).
- Two continuous datasets:
  - Series 1 (Ingestion Rate $\lambda_{\text{in}}(t)$): Glowing Amber `#f59e0b`, fill `rgba(245, 158, 11, 0.12)`.
  - Series 2 (Acknowledged Rate $\mu_{\text{ack}}(t)$): Glowing Cyan `#06b6d4`, fill `rgba(6, 182, 212, 0.12)`.
- Math Formulas:
  - Time Step: $\Delta t = 1.0\text{s}$, sliding window of $N = 60$ points.
  - Coordinate Mapping:
    $$x_i = \text{paddingLeft} + i \cdot \frac{\text{width} - \text{paddingLeft} - \text{paddingRight}}{N - 1}$$
    $$y_i = \text{height} - \text{paddingBottom} - \left(\frac{v_i - v_{\min}}{v_{\max} - v_{\min}}\right) \cdot (\text{height} - \text{paddingTop} - \text{paddingBottom})$$
  - Catmull-Rom or Spline Interpolation for smooth organic curves between points.
  - Live cursor crosshair tracking: hovering shows exact timestamp, Ingestion msg/s, ACK msg/s, and delta.

### Queue Backlog Depth Differential Model
The backlog $B(t)$ (unacknowledged messages in queue) evolves according to:
$$\frac{dB(t)}{dt} = \lambda_{\text{in}}(t) - \mu_{\text{ack}}(t)$$
$$B(t + \Delta t) = \max\left(0, B(t) + (\lambda_{\text{in}}(t) - \mu_{\text{ack}}(t)) \cdot \Delta t\right)$$
- If $\lambda_{\text{in}} > \mu_{\text{ack}}$, backlog increases $\rightarrow$ Backlog gauge needle swings into Amber/Red alert.
- Oldest Unacked Message Age:
  $$A_{\text{oldest}}(t) = \begin{cases} 0\text{ ms} & \text{if } B(t) = 0 \\ 450\text{ ms} + \frac{B(t)}{\mu_{\text{ack}}} \times 1000\text{ ms} & \text{if } B(t) > 0 \end{cases}$$

### Latency SLA Histogram
Computes latency distribution over rolling 5,000 processed messages:
- Samples drawn from Log-Normal distribution $\ln(L) \sim \mathcal{N}(\mu=2.6, \sigma=0.45)$:
  - $L_{\text{median}} = e^{2.6} \approx 13.46\text{ ms}$
- Dynamic percentile calculation:
  - $\text{P50} = \text{percentile}(50) \approx 13.5\text{ ms}$
  - $\text{P95} = \text{percentile}(95) \approx 28.1\text{ ms}$
  - $\text{P99} = \text{percentile}(99) \approx 42.7\text{ ms}$
- SLA Threshold: $50\text{ ms}$ (Warning), $100\text{ ms}$ (Critical SLA Breach).
- Histogram Bins: `[<5ms, 5-15ms, 15-30ms, 30-50ms, 50-100ms, >100ms]`.

---

# SECTION 3: Shared Cyberpunk Design Tokens & Implementation Standards

## 3.1 CSS Color Palettes & Visual Hierarchy

| Token Name | Hex Code | RGB / RGBA | Role / Usage |
|---|---|---|---|
| `--bg-base` | `#030812` | `rgb(3, 8, 18)` | Deep void background |
| `--bg-surface` | `#060d1b` | `rgb(6, 13, 27)` | Main card surface container |
| `--bg-card` | `#091428` | `rgb(9, 20, 40)` | Elevated telemetry card |
| `--bg-card-hover`| `#0e1f3d` | `rgb(14, 31, 61)` | Interactive hovered card |
| `--cyan-cyber` | `#00e5ff` | `rgb(0, 229, 255)` | R1 primary accent (Cloud Run, Canary, Live Stream) |
| `--cyan-glow` | `#00e5ff` | `rgba(0, 229, 255, 0.4)` | Cyber neon glow filter |
| `--amber-solar` | `#f59e0b` | `rgb(245, 158, 11)` | R2 primary accent (Pub/Sub Ingestion, Bursts) |
| `--amber-glow` | `#f59e0b` | `rgba(245, 158, 11, 0.4)` | Warning and ingestion glow filter |
| `--purple-pulse` | `#8b5cf6` | `rgb(139, 92, 246)` | R2 secondary accent (Worker Subscriptions, Storage) |
| `--purple-glow` | `#8b5cf6` | `rgba(139, 92, 246, 0.4)` | Worker subscriber glow |
| `--emerald-live` | `#10b981` | `rgb(16, 185, 129)` | Success state, Rev 42 Stable, ACKed messages |
| `--crimson-crit` | `#ef4444` | `rgb(239, 68, 68)` | Failure state, DLQ Poison Pills, SLA Breaches |
| `--text-primary` | `#f8fafc` | `rgb(248, 250, 252)` | High-contrast readable UI text |
| `--text-secondary`| `#94a3b8` | `rgb(148, 163, 184)` | Monospace labels, metric keys |
| `--text-muted` | `#64748b` | `rgb(100, 116, 139)` | Inactive nodes, background grid lines |
| `--border-subtle`| — | `rgba(0, 229, 255, 0.12)` | Subtle glassmorphic card borders |
| `--border-accent`| — | `rgba(0, 229, 255, 0.35)` | Active highlighted element borders |

## 3.2 Typography & Icon Persistence Rules
- **UI Typography**: `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- **Telemetry & Monospace**: `'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'SF Mono', Consolas, monospace`.
- **Permanent Icon Rule**: All icons and emojis (e.g. 📦, 🛡️, 🔑, 🚀, 🔀, ⏰, 📬, ⚙️, 📱, ☠️) must remain permanently visible in their designated circular badge with colored glow halos across `PENDING`, `RUNNING`, `SUCCESS`, and `FAILED` states. Emojis are NEVER replaced with flat tickmarks.

---

# SECTION 4: Features Discovered & Specification Matrix

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R1 Pipeline | Git Commit & Cloud Build Trigger | Triggers container compilation, Kaniko layer caching, and Go binary packaging | Commit SHA, Branch, Repo name | Build ID, artifact digest, build duration | Build failure logs with highlighted error lines & retry action | ORIGINAL_REQUEST.md & Cloud Build API v1 |
| 2 | R1 Pipeline | Vulnerability Scan & KMS Signing | Scans container image SBOM for CVEs and signs digest with Cloud KMS key | Image URI, KMS key ring URI | Attestation token, CVE severity breakdown | Quarantines image on Critical CVE, shows CVE details in drawer | ORIGINAL_REQUEST.md & Artifact Registry API v1 |
| 3 | R1 Pipeline | Secret Manager Injection | Securely injects decrypted DB credentials and API keys into Cloud Run runtime | Secret IDs, Service Account IAM | In-memory mounted ephemeral secrets | IAM PermissionDenied alert if SA lacks `secretAccessor` | ORIGINAL_REQUEST.md & Secret Manager API v1 |
| 4 | R1 Pipeline | Cloud Run Spin-Up & Cold Start Gauge | Deploys new revision `00043` with gVisor sandbox and measures cold-start latency | Concurrency (80), CPU/Mem specs | Cold-start breakdown (ms), active instance IDs | Startup probe timeout alert if cold start exceeds 10s | ORIGINAL_REQUEST.md & Cloud Run Admin API v2 |
| 5 | R1 Pipeline | Blue/Green Canary Traffic Splitter | Interactive slider dynamically allocates traffic (0-100%) between Rev 42 & 43 | Split percentage (0-100%) | Live particle routing, error delta, P99 delta | Instant rollback button if error rate on canary exceeds 5% | ORIGINAL_REQUEST.md & Cloud Run Traffic Splitting |
| 6 | R1 Telemetry | Active Instances Scaling Grid | Visual microVM instance pool showing live instance states (WARM, IDLE, BUSY, SPIN) | Inbound RPS, Concurrency target | Active container count, CPU/Mem gauge per node | Scale-to-zero visualization when traffic drops to 0 | Cloud Run Autoscaler specs |
| 7 | R1 Telemetry | Live Cloud Logging Live-Tail | Real-time ANSI-colored log viewer with severity filters, search, and JSON viewer | Log streams, search query, severity filter | Formatted log entries, trace IDs, expandable payloads | Displays syntax error badges on invalid regex search | Cloud Logging API v2 |
| 8 | R2 PubSub | Cloud Scheduler & Webhook Ingest | Generates continuous, burst, or scheduled event streams with ordering keys | Ingestion mode toggle, burst intensity | Inbound message rate (msg/s), partition assignment | Throttling warning if rate exceeds quota (10,000 msg/s) | ORIGINAL_REQUEST.md & Cloud Scheduler API v1 |
| 9 | R2 PubSub | 4-Partition Topic Streamer | Visualizes message distribution across 4 topic partition lanes with particle flow | Ordering keys, message payloads | Partition throughput, lane queue depths | Unbalanced partition alert if hash clustering occurs | Cloud Pub/Sub API v1 |
| 10| R2 PubSub | Worker Consumer & GCS Archival | Processes pull subscription messages and archives Parquet batches to Cloud Storage | Pull batch size, Ack deadline | ACK rate (msg/s), Parquet file size, GCS bucket URI | NACK retry countdown if worker processing fails | Cloud Storage API v1 & Pub/Sub Subscriber |
| 11| R2 PubSub | FCM Push Dispatcher | Dispatches mobile/web push notifications downstream with receipt tracking | Notification templates, target tokens | Delivery success rate (%), delivery latency | Invalid registration token quarantine | Firebase Cloud Messaging API v1 |
| 12| R2 PubSub | Dead-Letter Queue Poison Interceptor | Captures messages exceeding 5 retry attempts (schema error, unhandled exception) | Delivery attempts, NACK codes | DLQ count, quarantine table rows, error stack traces | Quarantined message inspection drawer | ORIGINAL_REQUEST.md & Pub/Sub DLQ Policy |
| 13| R2 DLQ | Interactive DLQ Replay & Purge | Allows SRE to inspect corrupted payload, edit/sanitize, and replay back to main topic | Selected DLQ message ID, replay action | Re-published event, decremented DLQ counter, audit log | Replay failure alert if topic unavailable | ORIGINAL_REQUEST.md DLQ Console |
| 14| R2 Telemetry| Ingestion vs ACK Live Canvas Chart | Real-time 60s sliding window dual-line chart (Amber Ingestion vs Cyan ACK) | Rolling 60s throughput samples | Smooth Bezier curves, live delta, hover crosshair | Handles canvas resizing without resetting history | Cloud Monitoring API v3 |
| 15| R2 Telemetry| Queue Backlog Depth & Age Meter | Needle/bar meter showing unacknowledged backlog depth (msgs & MB) and oldest msg age | Unacked count, ACK latency | Backlog gauge needle position, age string | Red alert flash when backlog exceeds 500 messages | Cloud Monitoring metric `backlog_bytes` |
| 16| R2 Telemetry| Latency SLA Histogram (P50/P95/P99) | Real-time distribution histogram across 6 latency bins with P50, P95, P99 markers | Event delivery latencies | Dynamic bar heights, percentile markers | Red SLA Breach bin highlight when latency > 100ms | Cloud Monitoring Latency Distribution |

---

## Edge Cases & Fault Tolerance Matrix
| # | Feature | Input / Condition | Observed / Documented Behavior |
|---|---------|-------------------|--------------------------------|
| 1 | R1 Canary Splitter | Split slider set to exactly 0% | 100% of particle traffic routes to Rev 42 (Green); Rev 43 (Blue) remains active with 0% traffic and 0 RPS. |
| 2 | R1 Canary Splitter | Split slider set to exactly 100% | 100% of particle traffic routes to Rev 43 (Blue); Rev 42 (Green) enters drain state with 0 RPS. |
| 3 | R1 Deployer | "Simulate Build Failure" clicked | Stage 1 fails with compilation exit code 1; pipeline halts; crimson error drawer opens; stages 2-5 remain untouched. |
| 4 | R1 Scale-to-Zero | Inbound traffic slider dragged to 0 RPS | Active container instances gradually cool down (cooldown timer: 5s) and terminate until active count reaches 0. Cold-start indicator lights up for next request. |
| 5 | R1 Cold Start | Rapid concurrent requests on 0 instances | Triggers simultaneous spin-up of 4 instances; latency gauge records initial spike (380ms), then drops back to 12ms warm latency. |
| 6 | R2 DLQ Ingestion | "Inject Poison Pill" clicked | Injects corrupted JSON `{"orderId": "evt-9912", "amount": NaN, "corrupt": \x00}`; fails schema validation; retries 5 times; enters DLQ within 2.5 seconds. |
| 7 | R2 DLQ Replay | "Replay All" clicked with 0 DLQ items | Button is disabled; tooltip shows "No quarantined messages in DLQ"; no state mutation or error thrown. |
| 8 | R2 DLQ Replay | Single message replayed | Re-publishes message with updated headers; message vanishes from DLQ table with emerald row dissolve; live backlog and DLQ meters decrement. |
| 9 | R2 Ingestion Surge | "Inject Traffic Burst" (5,000 msg/s) | Ingestion line spikes; worker capacity temporarily saturated; backlog depth increases; backlog gauge swings amber; worker autoscaling engages to clear backlog. |
| 10| R2 Worker Crash | "Simulate Worker Crash" clicked | ACK rate drops to 0; backlog increases rapidly; NACK storm counter increments; system auto-heals after 6 seconds. |
| 11| Canvas Rendering | Window resize / Mobile viewport (400px) | Canvas elements resize dynamically based on `getBoundingClientRect()` and `devicePixelRatio` without dropping points or distorting aspect ratio. |
| 12| Offline Operation | Google Fonts CDN unavailable | CSS font-family fallback stack (`'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace`) renders cleanly with zero layout shift. |

---

# SECTION 5: Verification & Quality Assurance Strategy

## 5.1 Verification Checklist for R1 (Serverless Pipeline)
1. **Zero Runtime Errors**: Clean console execution with zero `TypeError`, `ReferenceError`, or unhandled promise rejections.
2. **5-Stage Stepper Workflow**:
   - `Trigger & Build` -> `Artifact Registry & KMS` -> `Secret Manager` -> `Cloud Run Spin-Up` -> `Traffic Splitting`.
   - Node status icons permanently visible across pending, active, success, warning, error states.
3. **Interactive Canary Slider**:
   - Slider moves smoothly between 0% and 100%.
   - Particle streams on canvas dynamically split in proportion to the slider value.
   - Quick preset buttons (`100/0`, `90/10`, `50/50`, `0/100`, `Rollback`) update slider and state instantly.
4. **Cold-Start Latency Gauge**:
   - SVG circular arc needle and numerical readout accurately reflect cold-start millisecond breakdown.
5. **Active Instances Matrix**:
   - Container microVM grid dynamically updates instance states based on traffic load.
6. **Streaming Cloud Logging Console**:
   - ANSI-styled streaming entries with level filter toggles, search query input, and expandable JSON inspector.

## 5.2 Verification Checklist for R2 (Event Pub/Sub & DLQ Console)
1. **Zero Runtime Errors**: Clean console execution with zero JavaScript runtime warnings or errors.
2. **Interactive Streaming Topology**:
   - Visual message flow across `Scheduler/Webhook` -> `4-Partition Topic` -> `Worker Consumer & GCS` -> `FCM Push` -> `DLQ Trap`.
3. **Live Throughput Chart**:
   - Smooth 60 FPS HTML5 Canvas rendering dual lines (`Ingestion msg/s` vs `ACK msg/s`) over 60s sliding window.
4. **Backlog Depth Meter**:
   - Gauge needle and numeric counters reflect instantaneous backlog depth and oldest message age.
5. **Interactive Dead-Letter Queue (DLQ) Inspector**:
   - Quarantined poison pill table lists failed messages with failure reason badges.
   - Clicking a row opens the payload drawer showing corrupted data and stack traces.
   - Clicking "Replay to Topic" re-publishes the message, removes it from DLQ, and logs an SRE audit event.
6. **Latency SLA Histogram**:
   - Dynamic bar chart showing latency distribution bins with computed P50, P95, and P99 indicators.
7. **Simulation & Chaos Controls**:
   - "Inject Traffic Surge", "Inject Poison Pill", "Simulate Worker Crash", and "Schedule Cron Tick" buttons trigger observable live telemetry changes.

---
*Report generated and validated by Explorer GCP 1.*
