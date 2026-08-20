## 2026-08-20T00:16:03Z

You are Worker GCP 2.
Your working directory is c:\DevWork\Depredador\Flujoweb\.agents\worker_gcp_2/
You have exclusive write ownership of: c:\DevWork\Depredador\Flujoweb\sistemas\gcp-event-pubsub\index.html

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Authoritative Documents to Read First:
- c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md (lines 84-120, 153-167)
- c:\DevWork\Depredador\Flujoweb\PROJECT.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_gcp_1\survey.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_gcp_1\handoff.md

Your Task:
Build the complete, self-contained single-file application `sistemas/gcp-event-pubsub/index.html` (R2: Event-Driven Pub/Sub Ingestion & Dead-Letter Queue Console).
Requirements:
1. Core GCP APIs: pubsub.googleapis.com, cloudscheduler.googleapis.com, storage.googleapis.com, fcm.googleapis.com, monitoring.googleapis.com.
2. 5-Node Topology / Streaming Pipeline:
   - ⏰ Cloud Scheduler batch dispatcher & Webhook ingestion generator
   - 📬 Cloud Pub/Sub Topic with high-throughput 4-partition lane streaming
   - ⚙️ Worker Subscription consumer processing & GCS Storage archival
   - 📱 Firebase / FCM push notification dispatch
   - ☠️ Dead-Letter Queue (DLQ) Handler: Poison-pill / malformed message quarantine interceptor
3. Observability Telemetry:
   - Live Ingestion vs ACK throughput dual-line 60s Canvas chart with Catmull-Rom smoothing
   - Queue Backlog Depth meter & message age gauge
   - Interactive DLQ Inspector table with syntax-highlighted poison-pill payload viewer and functional "Replay to Topic" button
   - Latency SLA histogram (p50, p95, p99 percentiles)
4. Design & Polish:
   - Cyberpunk Mission Control aesthetic (#030812 / #060d1b base, Amber #f59e0b and Purple #a855f7 accents)
   - Permanent luminous icon visibility (emojis and icons NEVER disappear or turn into plain checkmarks)
   - Responsive from 400px mobile to 4K displays
   - Expose window.__GCP_EVENT_PUBSUB__ and data-testid attributes for automated testing.

Implement the file completely, test it, and write your handoff report to c:\DevWork\Depredador\Flujoweb\.agents\worker_gcp_2\handoff.md. Report back when done.
