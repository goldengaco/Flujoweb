# Master Implementation Plan: 5 GCP Observability & Architecture Dashboards

## Objectives
Deliver 5 self-contained, enterprise-grade, high-framerate interactive single-file dashboards in `sistemas/` adhering to the dark Cyberpunk / Mission Control aesthetic (#030812 / #060d1b), monospace Cascadia/Fira Code metrics, glowing telemetry, and real-time simulations modeling 18 GCP APIs:

1. `sistemas/gcp-serverless-pipeline/index.html`:
   - Cloud Build container compilation -> Artifact Registry scan & KMS signing -> Secret Manager injection -> Cloud Run revision deployment -> Canary Traffic Split Slider (0-100%) -> Streaming Cloud Logging.
2. `sistemas/gcp-event-pubsub/index.html`:
   - Cloud Scheduler / Webhook -> Pub/Sub Topic partitions -> Worker Subscriptions & GCS Archival -> FCM push -> Dead-Letter Queue (DLQ) poison-pill inspector & 'Replay to Topic' action -> Throughput & SLA charts.
3. `sistemas/gcp-sql-networking/index.html`:
   - Private VPC Peering / PSC packet routing visualizer (GCE -> Subnet -> Tunnel -> Cloud SQL HA PostgreSQL with CMEK) -> Connection Pool Saturation Gauge -> Slow Query / Lock Contention -> "Simulate Primary Node Crash" automated failover sequence.
4. `sistemas/gcp-iam-security/index.html`:
   - Least-Privilege Risk Matrix -> SA Key Expiration / Compromise Alert + "Instant Revoke / Rotate Key" -> Secret Version Lifecycle Timeline -> API Quota Consumption Gauges (Service Usage RPS vs Limit).
5. `sistemas/gcp-cloudops-cockpit/index.html`:
   - Master SRE Cockpit: 4 Golden Signals (Latency, Traffic, Errors, Saturation) -> Multi-service health radar / mesh -> SLO & Error Budget Burn-Rate dials -> Interactive Cloud Logging live-tail with regex/severity/correlation ID filters -> Incident Mitigation Action Bar (Scale, Clear Cache, Drain).

## Execution Strategy
- Step 1: Survey & Requirements Mining (3 Explorers in parallel).
- Step 2: Architecture Synthesis in `PROJECT.md` & `TEST_INFRA.md`.
- Step 3: Dispatch 5 Workers to build the 5 dashboards independently and concurrently.
- Step 4: Dispatch Test Writer to build comprehensive E2E test suites (Tiers 1-4).
- Step 5: Independent Verification with 2 Reviewers, 2 Challengers, and 1 Forensic Auditor.
- Step 6: Adversarial Hardening (Tier 5) & Mobile/Desktop Visual Responsiveness Check.
- Step 7: Final Verification and Handoff Report.
