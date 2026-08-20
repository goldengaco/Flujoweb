# Project: GCP Enterprise Cloud Observability & Architecture Dashboards

## Architecture Overview
A suite of 5 self-contained, enterprise-grade, high-framerate interactive single-file web applications (`index.html`) in `sistemas/`, modeling real-world Google Cloud mission-critical workloads using 18 GCP APIs with zero external runtime dependencies beyond Google Fonts. Designed with the dark Cyberpunk / Mission Control aesthetic (`#030812` / `#060d1b` base, glowing telemetry, monospace Cascadia/Fira Code metrics, interactive controls, live event streaming, and high-framerate Canvas/CSS rendering).

### Core Components
1. **R1: Serverless Microservice Pipeline & Zero-Downtime Deployer** (`sistemas/gcp-serverless-pipeline/index.html`)
   - GCP APIs: `cloudbuild.googleapis.com`, `artifactregistry.googleapis.com`, `secretmanager.googleapis.com`, `cloudkms.googleapis.com`, `run.googleapis.com`, `logging.googleapis.com`
   - Color Signature: Electric Cyan (`#00e5ff`)
2. **R2: Event-Driven Pub/Sub Ingestion & Dead-Letter Queue (DLQ) Console** (`sistemas/gcp-event-pubsub/index.html`)
   - GCP APIs: `pubsub.googleapis.com`, `cloudscheduler.googleapis.com`, `storage.googleapis.com`, `fcm.googleapis.com`, `monitoring.googleapis.com`
   - Color Signature: Neon Amber / Cyber Violet (`#f59e0b` / `#a855f7`)
3. **R3: Private VPC Peering & Cloud SQL High-Availability Hub** (`sistemas/gcp-sql-networking/index.html`)
   - GCP APIs: `servicenetworking.googleapis.com`, `sqladmin.googleapis.com`, `compute.googleapis.com`, `iam.googleapis.com`, `cloudkms.googleapis.com`
   - Color Signature: Emerald / Blue (`#10b981` / `#3b82f6`)
4. **R4: Identity & Access Governance (IAM) & Secret Vault Auditor** (`sistemas/gcp-iam-security/index.html`)
   - GCP APIs: `iam.googleapis.com`, `cloudresourcemanager.googleapis.com`, `secretmanager.googleapis.com`, `cloudkms.googleapis.com`, `serviceusage.googleapis.com`
   - Color Signature: Cyber Crimson / Ruby (`#ef4444` / `#f43f5e`)
5. **R5: Unified CloudOps SRE Command Cockpit** (`sistemas/gcp-cloudops-cockpit/index.html`)
   - GCP APIs: `monitoring.googleapis.com`, `logging.googleapis.com`, `serviceusage.googleapis.com`, multi-service aggregation
   - Color Signature: Matrix Multi-Spectrum (`#00e5ff`, `#10b981`, `#f59e0b`, `#ef4444`, `#a855f7`)

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1 5-Stage Pipeline Stepper | Interactive deployment stepper (Commit -> Build -> Vuln Scan -> Secrets -> Run Deploy -> Traffic Split) | M1 | Survey R1 |
| 2 | R1 Vulnerability Scanner & Image Signer | Artifact Registry CVE triage + Cloud KMS container digest signing | M1 | Survey R1 |
| 3 | R1 Secret Manager KMS Injection | Decrypts and injects runtime env secrets via IAM credentials | M1 | Survey R1 |
| 4 | R1 Cloud Run Instance Scaling & Cold-Start Gauge | Multi-phase cold-start latency decomposition (ms) & active container instance gauge | M1 | Survey R1 |
| 5 | R1 Canary & Blue/Green Traffic Split Slider | Interactive 0-100% traffic slider with 60fps Bézier particle beam routing | M1 | Survey R1 |
| 6 | R1 Cloud Logging Live Console | Real-time streaming deployment logs with severity filters | M1 | Survey R1 |
| 7 | R2 Event Ingestion Scheduler & Webhook | Dual-mode ingestion generator (Cloud Scheduler cron & Webhook payload bursts) | M2 | Survey R2 |
| 8 | R2 Partition Streaming Canvas Topology | 4 partition lanes with CRC32 ordering key hashing & glowing packet streams | M2 | Survey R2 |
| 9 | R2 Ingestion vs ACK 60s Dual-Line Chart | Real-time Canvas throughput chart with Catmull-Rom smoothing & hover crosshair | M2 | Survey R2 |
| 10 | R2 Backlog Depth Meter & SLA Histogram | Queue backlog differential gauge & Log-Normal latency SLA distribution histogram | M2 | Survey R2 |
| 11 | R2 Dead-Letter Queue (DLQ) Inspector | Quarantine table with poison-pill JSON viewer and 'Replay to Topic' action | M2 | Survey R2 |
| 12 | R2 GCS Archival & FCM Push Dispatch | Worker subscriber archival to Cloud Storage & Firebase Cloud Messaging push dispatch | M2 | Survey R2 |
| 13 | R3 Private Service Connect & Peering Map | Interactive Canvas packet router (VM -> Subnet -> VPC Peering -> Cloud SQL HA) | M3 | Survey R3 |
| 14 | R3 Connection Pool Saturation Gauge | Circular/donut gauge showing Active, Idle, Reserved connections vs Max limit | M3 | Survey R3 |
| 15 | R3 Slow Query & Lock Contention Table | Tabular inspector of active PostgreSQL queries, lock modes, and blocked PIDs | M3 | Survey R3 |
| 16 | R3 Automated Primary Crash & Failover | Real-time simulation of Zone A crash, automated standby election & route cutover | M3 | Survey R3 |
| 17 | R3 Dual-Zone Replica Reprovisioning | One-click action to reprovision standby node and restore 99.99% HA redundancy | M3 | Survey R3 |
| 18 | R3 Cloud KMS CMEK Cryptographic Guard | Validates disk block and WAL encryption at rest with CMEK key rotation | M3 | Survey R3 |
| 19 | R4 GCP Resource Hierarchy & Policy Scanner | Organization -> Folder -> Project IAM policy tree visualizer and compliance score | M4 | Survey R4 |
| 20 | R4 Least-Privilege Risk Matrix | Excess permissions detector over 90 days with automated downscoping recommendations | M4 | Survey R4 |
| 21 | R4 SA Key Expiration & Threat Alert | Key age tracker, leak detection alert, and '🚨 Instant Revoke / Rotate Key' action | M4 | Survey R4 |
| 22 | R4 Secret Version Lifecycle Timeline | Interactive node timeline showing Active, Deprecated, and Destroyed secret versions | M4 | Survey R4 |
| 23 | R4 Cloud KMS Key Auto-Rotation Dial | HSM protection level indicator and animated circular countdown to next rotation | M4 | Survey R4 |
| 24 | R4 Service Usage API Quota Gauges | Multi-gauge RPS vs quota limits with interactive 429 rate spike simulation | M4 | Survey R4 |
| 25 | R5 4 Golden Signals Telemetry Engine | Real-time Latency (p50/p95/p99), Traffic (RPS), Errors (%), and Saturation (%) | M5 | Survey R5 |
| 26 | R5 Multi-Service Health Radar & Mesh | 8-Axis polar radar chart and 9-node interactive topology mesh with particle physics | M5 | Survey R5 |
| 27 | R5 SLO & Multi-Burn-Rate Dials | Rolling 30-day Error Budget remaining & Google SRE multi-burn-rate alerting engine | M5 | Survey R5 |
| 28 | R5 Interactive Cloud Logging Live-Tail | High-throughput streaming logs with safe regex search, severity chips, & trace correlation | M5 | Survey R5 |
| 29 | R5 SRE Incident Mitigation Action Bar | Real-time recovery controls: Scale Instances, Clear Cache, Drain Traffic, Trip Breaker, Rollback | M5 | Survey R5 |
| 30 | Global Cyberpunk Mission Control Theme | Base `#030812`/`#060d1b`, glassmorphism, glowing telemetry, and Cascadia/Fira Code typography | All | Survey Global |
| 31 | Permanent Luminous Icon Visibility | All emojis and status icons remain visible with luminous glow across all states (no plain checkmarks) | All | Survey Global |
| 32 | Responsive Multi-Device Layout | Seamless adaptation from 400px mobile to 3840px 4K displays | All | Survey Global |
| 33 | Comprehensive E2E Automated Test Suite | Multi-tier test harness (Tiers 1-5) validating 100% functional and visual acceptance criteria | M6 | Survey Global |

---

## Milestones
| # | Name | Scope | Target File | Dependencies | Status |
|---|------|-------|-------------|-------------|--------|
| M1 | GCP Serverless Pipeline | R1 Serverless Microservice Pipeline & Deployer | `sistemas/gcp-serverless-pipeline/index.html` | Survey | DONE |
| M2 | GCP Event-Driven Pub/Sub & DLQ | R2 Event Ingestion, Partitions, DLQ Console | `sistemas/gcp-event-pubsub/index.html` | Survey | DONE |
| M3 | GCP Cloud SQL HA & VPC Peering | R3 Private VPC, Connection Pool, HA Failover | `sistemas/gcp-sql-networking/index.html` | Survey | DONE |
| M4 | GCP IAM Security & Secret Vault | R4 IAM Risk Matrix, SA Key Revoke, Secrets | `sistemas/gcp-iam-security/index.html` | Survey | DONE |
| M5 | GCP CloudOps SRE Command Cockpit | R5 4 Golden Signals, Mesh, SLO, Logs, Actions | `sistemas/gcp-cloudops-cockpit/index.html` | Survey | DONE |
| M6 | E2E Testing Suite & Hardening | Opaque-box & Adversarial Test Harness (Tiers 1-5) | `tests/` | M1-M5 | DONE |
