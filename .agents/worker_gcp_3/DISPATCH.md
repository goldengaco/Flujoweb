## 2026-08-20T00:16:03Z

You are Worker GCP 3.
Your working directory is c:\DevWork\Depredador\Flujoweb\.agents\worker_gcp_3/
You have exclusive write ownership of: c:\DevWork\Depredador\Flujoweb\sistemas\gcp-sql-networking\index.html

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Authoritative Documents to Read First:
- c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md (lines 84-130, 153-167)
- c:\DevWork\Depredador\Flujoweb\PROJECT.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_gcp_2\handoff.md

Your Task:
Build the complete, self-contained single-file application `sistemas/gcp-sql-networking/index.html` (R3: Private VPC Peering & Cloud SQL High-Availability Hub).
Requirements:
1. Core GCP APIs: servicenetworking.googleapis.com, sqladmin.googleapis.com, compute.googleapis.com, iam.googleapis.com, cloudkms.googleapis.com.
2. Architecture & Topology:
   - Compute Engine GCE VM in private subnet accessing Cloud SQL (PostgreSQL HA) via Private Service Connect / VPC Peering with CMEK encryption.
3. Observability Telemetry & Controls:
   - Interactive Network Topology map packet route visualizer (VM -> Private Subnet -> VPC Tunnel -> Cloud SQL Primary Zone A & Standby Replica Zone B) with 60fps packet animations.
   - Connection Pool Saturation Gauge (Active, Idle, Max connections, PgBouncer metrics).
   - Slow Query & Lock Contention table (active SQL queries, lock types, blocked PIDs, "Kill PID" and "Add Index" actions).
   - "Simulate Primary Node Crash" button: Triggers real-time automated replica promotion, failover routing to Zone B, stopwatch timer, and "Reprovision Zone A Replica" recovery control.
4. Design & Polish:
   - Cyberpunk Mission Control aesthetic (#030812 / #060d1b base, Emerald #10b981 and Blue #3b82f6 accents)
   - Permanent luminous icon visibility (emojis and icons NEVER disappear or turn into plain checkmarks)
   - Responsive from 400px mobile to 4K displays
   - Expose window.__GCP_SQL_NETWORKING__ and data-testid attributes for automated testing.

Implement the file completely, test it, and write your handoff report to c:\DevWork\Depredador\Flujoweb\.agents\worker_gcp_3\handoff.md. Report back when done.
