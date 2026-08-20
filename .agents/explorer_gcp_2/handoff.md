# Specification Mining Survey Report: R3 (Cloud SQL & Private VPC Peering) & R4 (IAM Governance & Secret Vault Auditor)

**Author**: Explorer GCP 2 (Specification Miner)  
**Date**: 2026-08-20T00:15:30Z  
**Target Applications**:
- R3: `sistemas/gcp-sql-networking/index.html`
- R4: `sistemas/gcp-iam-security/index.html`

---

## 1. Observation

Direct observations extracted from authoritative specification `c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md` (lines 84–168) and existing system foundations (`sistemas/security-audit/index.html`, `sistemas/server-status/index.html`, `sistemas/transaction-flow/index.html`):

1. **System Definition & Architecture Requirements**:
   - Quote from `ORIGINAL_REQUEST.md:86`: *"Build a comprehensive suite of 5 enterprise-grade, interactive Cloud Observability & Architecture Dashboards in c:\DevWork\Depredador\Flujoweb\sistemas\. Each system models real-world Google Cloud enterprise workloads using the specified 18 GCP APIs..."*
   - Quote from `ORIGINAL_REQUEST.md:95`: *"Each project is an ultra-polished, self-contained single-file web application (index.html) with zero external runtime dependencies beyond Google Fonts. All 5 share the dark Cyberpunk / Mission Control aesthetic (#030812 / #060d1b base, glowing telemetry, monospace Cascadia/Fira Code metrics, interactive controls, live event logs, and high-framerate Canvas/CSS rendering)."*

2. **R3 Specification**:
   - Quote from `ORIGINAL_REQUEST.md:121-130`:
     - *Core GCP APIs*: `servicenetworking.googleapis.com`, `sqladmin.googleapis.com`, `compute.googleapis.com`, `iam.googleapis.com`, `cloudkms.googleapis.com`.
     - *Workflow / Topology*: Compute Engine GCE instance in a private subnet accessing Cloud SQL (PostgreSQL HA) via Private Service Connect / VPC Peering with Customer-Managed Encryption Keys (CMEK).
     - *Observability Telemetry*:
       1. Interactive Network Topology map showing packet route (`VM → Private Subnet → VPC Tunnel → Cloud SQL Primary & Standby Replica`).
       2. Connection Pool Saturation Gauge (`Active vs Idle vs Max connections`).
       3. Slow Query & Lock Contention table.
       4. "Simulate Primary Node Crash" button: Triggers real-time automated replica promotion and failover routing.

3. **R4 Specification**:
   - Quote from `ORIGINAL_REQUEST.md:131-140`:
     - *Core GCP APIs*: `iam.googleapis.com`, `cloudresourcemanager.googleapis.com`, `secretmanager.googleapis.com`, `cloudkms.googleapis.com`, `serviceusage.googleapis.com`.
     - *Workflow / Topology*: Full-stack security posture auditor scanning project hierarchy, service account key lifecycles, over-privileged IAM bindings, and KMS key rotation status.
     - *Observability Telemetry*:
       1. Least-Privilege Risk Matrix (`Excessive Permissions detector`).
       2. Service Account Key Expiration & Compromise Alert panel with an "Instant Revoke / Rotate Key" action.
       3. Secret Version Lifecycle Timeline (`Active, Deprecated, Destroyed`).
       4. API Quota Consumption Gauges (`Service Usage quota limits vs current RPS`).

4. **Visual & UI Invariants**:
   - Quote from `ORIGINAL_REQUEST.md:162-166`:
     - *"All emojis and component status icons remain permanently visible with contextual luminous glow (never replaced by plain tickmarks)."*
     - *"Unified Cyberpunk Mission Control theme across all 5 applications with specialized color signatures (Emerald/Blue for Cloud SQL, Crimson/Ruby for IAM Security)."*
     - *"Seamlessly responsive from mobile devices (400px) to ultra-wide displays (4K)."*

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R3-NET | Private Service Connect & VPC Peering Tunnel | Visualizes the private network encapsulation between GCE client subnet (`10.140.10.0/24`) and Cloud SQL peering range (`10.200.0.0/20`) via `servicenetworking.googleapis.com`. | Client IP, Subnet CIDR, MTU (1460), Peering Name | Tunnel Status (`ACTIVE`), BGP routes, Latency (0.8ms), Encrypted Flow | If peering broken, displays `NETWORK_UNREACHABLE` & packet drop animation | `ORIGINAL_REQUEST.md:121-130`, `servicenetworking.googleapis.com` |
| 2 | R3-SQL | Cloud SQL PostgreSQL 16 HA Instance Manager | Models regional HA Cloud SQL cluster (`pg-cluster-prod-01`) with primary in Zone A (`us-east4-a`) and synchronous standby replica in Zone B (`us-east4-b`). | Instance tier (`db-perf-optimized-N-8`), Storage (500GB SSD), Flags | Replication lag (<1ms), Sync state (`SYNCHRONOUS`), IOPS (12,500), CPU % | On node desync, flags `WAL_REPLICATION_DELAY` warning | `ORIGINAL_REQUEST.md:121-130`, `sqladmin.googleapis.com` |
| 3 | R3-CMEK | Cloud KMS Customer-Managed Encryption Key Guard | Validates that all Cloud SQL disk blocks and WAL records are encrypted at rest with KMS key `key-cloudsql-postgres-cmek`. | KMS Key URI, CryptoKeyVersion (`v3`), Key Ring | CMEK Status (`ENCRYPTED`), Algorithm (`GOOGLE_SYMMETRIC_ENCRYPTION`), Auto-rotation (30d) | If IAM permission revoked, raises `CMEK_KEY_DENIED` storage freeze alert | `ORIGINAL_REQUEST.md:124`, `cloudkms.googleapis.com` |
| 4 | R3-TOPO | Interactive Network Topology Packet Router | Canvas/SVG animated topology showing continuous glowing data packets traversing from VM -> Subnet -> VPC Peering Gateway -> Primary DB Node. | Click on node, hover inspection, packet speed slider | Glowing animated packet trails, real-time node stats popup, IP/port/status badges | Renders red spark / packet drop on disrupted links | `ORIGINAL_REQUEST.md:126`, Visual Spec |
| 5 | R3-FAIL | Automated Primary Node Crash & HA Failover Engine | One-click simulation of Zone A primary node crash, triggering 7-step automated election, standby promotion in Zone B, and virtual route cutover in ~4.2s. | Click "Simulate Primary Node Crash" button | Live stopwatch timer, Zone B promoted to RW Primary, Route remapped to Zone B, Degraded mode banner | If failover aborted, triggers split-brain fencing lock | `ORIGINAL_REQUEST.md:129`, `sqladmin.instances.failover` |
| 6 | R3-RECOV | Dual-Zone Replica Reprovisioning Control | Action to provision a new standby replica in Zone A after failover, re-establishing dual-zone HA redundancy (99.99% SLA). | Click "Reprovision Zone A Replica" button | Progress bar, base backup streaming, HA status restored to `HEALTHY_DUAL_ZONE` | Displays resource contention if reprovisioned during peak traffic | `ORIGINAL_REQUEST.md:129`, Cloud SQL HA docs |
| 7 | R3-POOL | Connection Pool Saturation Gauge & PgBouncer Telemetry | Circular/donut SVG gauge and sparklines displaying Active (42), Idle in Transaction (18), Idle (25), and Reserved (5) connections vs Max limit (100). | Traffic burst injection, Pool reset button | Live saturation % (e.g. 85%), Client wait time (3.2ms), Pooled connections breakdown | Over 100% saturation triggers `HTTP 500 / 53300: too_many_connections` rejection | `ORIGINAL_REQUEST.md:127`, `pg_stat_activity` / PgBouncer |
| 8 | R3-QUERY | Slow Query & Lock Contention Inspector Table | Interactive tabular view of active queries, execution durations, lock modes (`ExclusiveLock`, `RowShareLock`), blocked PIDs, and CPU impact. | Query filter (All, Slow >100ms, Locked), Search by SQL text | Filtered query grid, lock wait tree, duration color coding (Green/Amber/Red) | Highlights deadlock risk when circular lock dependency occurs | `ORIGINAL_REQUEST.md:128`, `pg_stat_statements` / `pg_locks` |
| 9 | R3-KILL | Active Session Termination & Query Optimizer | One-click controls to `Explain Plan`, `Kill PID (pg_terminate_backend)`, or `Add Recommended Index` for any slow or blocking query. | Click "Kill PID" or "Add Index" | Frees held locks, drops execution time from 4200ms to 8ms, logs action to event stream | Returns error if PID is already terminated | `ORIGINAL_REQUEST.md:128`, PostgreSQL Admin |
| 10 | R3-INJECT | Artificial Lock Contention & Slow Query Injector | Testing tool to inject row-level lock conflicts (`UPDATE inventory ... FOR UPDATE`) or table-scan queries to evaluate alerting and pool behavior. | Click "Inject Lock Contention" button | Simulates blocking transaction, spikes Lock Wait metric to 4,500ms, triggers visual alert | Pool saturation increases and alert toast renders | `ORIGINAL_REQUEST.md:128`, Chaos Engineering |
| 11 | R4-HIER | GCP Resource Hierarchy & Policy Scanner | Scans and visualizes effective IAM policies across Organization (`acme-corp.com`), Folder (`Production-Workloads`), and Project (`prj-prod-payments-9941`). | Project selector, Scan Trigger button | Tree visualizer of hierarchy, inherited policy count, compliance score (0-100) | Flags policy inheritance conflicts or missing Org constraints | `ORIGINAL_REQUEST.md:133-134`, `cloudresourcemanager.googleapis.com` |
| 12 | R4-MATRIX | Least-Privilege Risk Matrix (Excessive Permissions) | Analyzes assigned roles vs actually utilized permissions over 90 days, flagging over-privileged service accounts and broad primitive roles (`roles/editor`, `roles/owner`). | Severity filter (Critical, High, Medium, Low), Search principal | Risk score badges, Delta (% excess permissions), Explanatory reasoning, Downscoping recommendations | Highlights privilege escalation pathways (e.g. `actAs`) | `ORIGINAL_REQUEST.md:136`, IAM Recommender API |
| 13 | R4-REMED | One-Click Least-Privilege Policy Auto-Remediation | Action button to automatically apply recommended granular role bindings (e.g. downscope `roles/editor` to `roles/storage.objectViewer` + `roles/pubsub.publisher`). | Click "Apply Recommended Policy" | Updates IAM binding, animates risk score reduction, logs security remediation audit event | Validates that required base permissions remain intact | `ORIGINAL_REQUEST.md:136`, `iam.googleapis.com` |
| 14 | R4-KEY | Service Account Key Lifecycle & Expiration Inspector | Tracks age, usage, and status of all user-managed SA keys; flags keys exceeding 90 days or violating org expiration policies. | Key filter (Expired, Near Expiry, Valid), SA select | Key Age meter (days), Creation timestamp, Expiration date, Status badges | Alerts `CRITICAL_EXPIRED` with glowing red pulsing badge | `ORIGINAL_REQUEST.md:137`, `iam.serviceAccounts.keys` |
| 15 | R4-LEAK | Public Compromise Threat Detection & Instant Revocation | Flags compromised service account keys detected on public repositories (e.g. Git Secret Scanning) with one-click "Instant Revoke / Delete Key". | Click "🚨 Instant Revoke Key" button | Permanently destroys key (`serviceAccountKeys.delete`), invalidates active JWT tokens, updates status to `REVOKED` | Prevents subsequent unauthorized API access attempts | `ORIGINAL_REQUEST.md:137`, GCP Security Command Center |
| 16 | R4-ROTATE | Zero-Downtime Service Account Key Rotation Engine | Automates multi-step key rotation: creates new key version `v2`, updates Secret Manager vault, verifies heartbeat, and disables old key `v1`. | Click "Rotate Key" button | Step-by-step progress stepper, new Key ID generated, old key deactivated safely | Reverts to old key if verification probe fails | `ORIGINAL_REQUEST.md:137`, `iam.googleapis.com` / `secretmanager.googleapis.com` |
| 17 | R4-SECRET | Secret Version Lifecycle Timeline & Version Controller | Interactive visual node timeline displaying states of secrets (`Active`, `Deprecated / Disabled`, `Destroyed`) across versions with rotation countdowns. | Version node click, "Create Version", "Destroy Version" | Visual version timeline track, secret payload metadata, rotation countdown timer | Blocked if attempting to access `Destroyed` version (returns 404/410) | `ORIGINAL_REQUEST.md:138`, `secretmanager.googleapis.com` |
| 18 | R4-KMS | Cloud KMS Key Auto-Rotation & HSM Status Dial | Displays KMS key ring status, symmetric/asymmetric algorithms, HSM protection level, and animated circular countdown to next auto-rotation. | Key Ring selector, Force Rotation button | Circular rotation progress dial, Next rotation date, CryptoKeyVersion state list | Displays warning if rotation period exceeds 90 days | `ORIGINAL_REQUEST.md:134`, `cloudkms.googleapis.com` |
| 19 | R4-QUOTA | Service Usage API Quota Consumption Gauges | Real-time multi-gauge dashboard showing requests-per-second (RPS) vs quota limits for `iam`, `secretmanager`, `cloudkms`, and `cloudresourcemanager`. | Quota service tabs, "Simulate Rate Spike" trigger | Live RPS gauges, Saturation % meters, Quota ceiling lines, Latency impact sparklines | Over-quota (>100%) triggers `HTTP 429 RESOURCE_EXHAUSTED` alerts & backoff | `ORIGINAL_REQUEST.md:139`, `serviceusage.googleapis.com` |
| 20 | R4-SPIKE | API Rate Spike & Exponential Backoff Simulator | Interactive control to spike Secret Manager traffic above quota, demonstrating rate limiting, exponential backoff with jitter, and automatic recovery. | Click "Simulate Secret Manager Fetch Spike" | Spikes RPS from 245 to 320, triggers 429 warnings, activates backoff algorithm, restores green status | Recovers smoothly without browser freeze or thread blocking | `ORIGINAL_REQUEST.md:139`, SRE Resilience |
| 21 | SHARED-LOG | Real-Time Streaming Cloud Audit & Operations Console | Collapsible terminal rendering live ANSI-colored audit logs, IAM changes, Cloud SQL failover events, and KMS cryptographic verifications. | Log level filter (ALL, INFO, WARN, ERROR, SEC_ALERT), Pause/Play, Clear | Monospace streaming log feed with ISO timestamps, trace IDs, and severity tags | Handles high log throughput (100+ msgs/sec) with ring buffer cap | `ORIGINAL_REQUEST.md:95`, `logging.googleapis.com` |
| 22 | SHARED-GLOW | Permanent Luminous Icon Glow & Status Indicator System | Visual engine ensuring all emojis and status icons remain visible with domain-tailored color luminescence across pending, active, and error states. | Status change events | CSS filter glow, drop-shadow neon accents, zero icon disappearance | Fallback to high-contrast unicode glyphs if webfonts fail | `ORIGINAL_REQUEST.md:162`, Visual Spec |
| 23 | SHARED-RESP | High-Framerate Canvas & Responsive CSS Layout (400px–4K) | Dynamic layout grid adapting from mobile screens (400px) to ultra-wide displays (3840px 4K) with smooth high-DPI Canvas scaling. | Viewport resize, orientation change | Fluid grid reflow, responsive font scaling, touch-friendly tap targets | Automatic Canvas `devicePixelRatio` scaling prevents blurriness | `ORIGINAL_REQUEST.md:14, 166`, Layout Spec |
| 24 | SHARED-EXP | Compliance & Telemetry JSON Report Exporter | Generates and downloads a complete, timestamped JSON security audit / database networking telemetry report for external compliance. | Click "Export Telemetry / JSON Report" | Triggered browser file download (`gcp-sql-telemetry.json` / `gcp-iam-audit.json`) | Validates complete schema before file trigger | `ORIGINAL_REQUEST.md:33, 95`, Tooling Spec |

---

## 3. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | R3 Failover Engine | User clicks "Simulate Primary Node Crash" while a failover sequence is already executing (e.g. step 3 of 7). | The system ignores duplicate triggers, maintains atomic state transition lock, and displays a subtle notification "Failover sequence in progress (Step 3/7)..." without resetting the stopwatch or corrupting state. |
| 2 | R3 Connection Pool | Pool reaches 100/100 active connections under extreme traffic burst. | Pool gauge turns pulsing crimson red (>95%), new incoming connection attempts receive simulated PostgreSQL error `FATAL: 53300: remaining connection slots are reserved for non-replication superuser connections`, and client wait times surge to >500ms until idle connections are flushed. |
| 3 | R3 Crash with Active Locks | Primary node crashes while a heavy `UPDATE` transaction holds an `ExclusiveLock` on PID 14829. | Failover controller detects uncommitted transaction in WAL, executes automated crash recovery roll-forward/roll-back during standby promotion, releases the lock, and logs `RECOVERY_TRANSACTION_ROLLBACK` in the streaming console. |
| 4 | R3 CMEK Revocation | KMS key version is disabled while database is actively writing WAL records. | Database enters read-only emergency lock mode, IO operations stall with error `KMS_KEY_DISABLED: Permission denied on resource key-cloudsql-postgres-cmek`, and network topology flashes key vault connection in red warning state. |
| 5 | R3 Viewport Resize During Animation | Window is resized rapidly between 3840px (4K) and 400px (Mobile) while Canvas packet router is rendering. | Canvas dynamically recalculates bounding boxes and node anchor positions, adjusts `devicePixelRatio`, and keeps packet particles perfectly aligned on the connecting vector tracks without visual artifacting or memory leaks. |
| 6 | R4 Instant Key Revocation | User triggers "Instant Revoke Key" on `sa-ci-cd-deployer` while deployment pipeline is running. | Key state immediately flips to `REVOKED (Destroyed)`, subsequent API calls with old JWT tokens fail with `UNAUTHENTICATED: 401 Invalid Credentials`, risk score for the principal drops to 0%, and alert banner turns green. |
| 7 | R4 API Quota Spike | User triggers rate spike exceeding 100% of Secret Manager quota (e.g. 320 RPS vs 300 RPS limit). | Quota gauge overflows into red warning zone, live telemetry graphs record spike, simulated client receives `429 RESOURCE_EXHAUSTED: Quota exceeded for quota metric 'Read requests'`, and system demonstrates exponential backoff with jitter restoring normal throughput within 4.5 seconds. |
| 8 | R4 Version Destruction | User attempts to access or enable a Secret Version in state `Destroyed`. | Interface displays disabled action buttons with tooltip "Destroyed versions are permanently irreversible per Google Cloud Secret Manager specification", preventing invalid state mutation. |
| 9 | R4 Least-Privilege Multi-Filter | User applies multiple simultaneous filters (e.g. `Severity: CRITICAL` + `Type: SERVICE_ACCOUNT` + `Excess: >90%`) when only 1 item matches. | Grid displays exactly 1 matching card with correct counter "Showing 1 of 12 principals", maintaining responsive table rendering and providing a "Clear Filters" shortcut button. |
| 10 | R4 Secret Version Creation | User creates a new secret version with multi-line payload containing special characters, JSON strings, and emoji bytes. | Secret Manager visualizer correctly encodes metadata, increments version to `v4`, sets state to `ACTIVE`, marks `v3` as `DEPRECATED`, and triggers an audit log entry with SHA256 checksum verification. |

---

## 4. Logic Chain

1. **Premise 1 (Mission Requirements)**: The user specification in `ORIGINAL_REQUEST.md` requires 5 standalone, single-file applications in `sistemas/`, specifically R3 (`gcp-sql-networking/index.html`) and R4 (`gcp-iam-security/index.html`), representing realistic Google Cloud enterprise workloads across 18 APIs.
2. **Premise 2 (R3 Technical Fidelity)**: To deliver authentic Cloud SQL & Private VPC Peering observability, the application must integrate exact GCP service naming conventions (`servicenetworking.googleapis.com`, `sqladmin.googleapis.com`, `compute.googleapis.com`, `cloudkms.googleapis.com`), private CIDR blocks (`10.140.0.0/16` workload VPC, `10.200.0.0/20` PSA range), CMEK cryptographic protection, a live interactive Canvas packet router, a connection pool saturation gauge, a slow query/lock table (`pg_stat_statements` / `pg_locks`), and a high-availability primary failover state machine.
3. **Premise 3 (R4 Technical Fidelity)**: To deliver authentic IAM Governance & Secret Vault auditing, the application must integrate exact GCP resource hierarchy scanning (`cloudresourcemanager.googleapis.com`), service account key lifecycles with threat detection (`iam.googleapis.com`), least-privilege over-privilege analysis with AI downscoping recommendations, Secret Manager version lifecycles (`Active` -> `Deprecated` -> `Destroyed`), Cloud KMS key rotation, and Service Usage API quota saturation gauges with 429 rate spike simulation.
4. **Premise 4 (Visual & Architectural Consistency)**: All files must be zero-dependency single-file applications (`index.html`) using Google Fonts (`Inter` + `JetBrains Mono` / `Cascadia Code`), the cyberpunk mission control dark theme (`#030812` / `#060d1b`), domain-specific accent colors (Emerald/Cyan for Cloud SQL, Crimson/Ruby for IAM), permanent luminous icon glow (emojis never replaced with plain tickmarks), and robust responsive design from 400px mobile to 4K displays.
5. **Conclusion**: The specification mined above captures every single requirement, interface contract, telemetry metric, interactive control, edge case, and error state needed for complete, high-fidelity implementation of R3 and R4.

---

## 5. Caveats

1. **Zero External Runtime Dependency**: No third-party JavaScript libraries (such as React, Vue, D3.js, Chart.js, or Lodash) are to be imported via CDN or npm at runtime. All Canvas animations, SVG gauges, sparklines, state machines, and data structures must be natively implemented in pure vanilla modern JavaScript (ES6+).
2. **Mock Simulation Fidelity**: Since the application runs locally in a standalone browser without active GCP cloud credentials, all GCP API responses, background telemetry, metrics, and logs must be deterministically simulated with high technical realism and randomized jitter to reflect authentic cloud telemetry.
3. **Audio API**: Web Audio API synthesized sound effects (alert pulses, click chimes) should be subtly integrated with an explicit user Mute/Unmute toggle, defaulting to safe audio context initialization on first user interaction.

---

## 6. Conclusion

The specification mining for **R3 (Private VPC Peering & Cloud SQL High-Availability Hub)** and **R4 (Identity & Access Governance & Secret Vault Auditor)** is complete and fully documented. All 24 core features, 10 edge cases, 10 Google Cloud APIs, and interactive UI components have been specified with maximum technical precision.

The implementation team (workers and test writers) can proceed directly with these specifications to build `sistemas/gcp-sql-networking/index.html` and `sistemas/gcp-iam-security/index.html` with zero ambiguity.

---

## 7. Verification Method

To independently verify the implementation against this specification:

1. **File Existence & Integrity Check**:
   - Inspect `sistemas/gcp-sql-networking/index.html` (R3) and `sistemas/gcp-iam-security/index.html` (R4).
   - Ensure both files load directly in Chromium / Firefox without build steps and throw zero uncaught JavaScript errors in DevTools console.
2. **Automated Headless Browser Testing**:
   - Run the E2E test runner:
     `node tests/runner.js` or `node tests/run_all.js`
3. **Interactive Control Verification**:
   - **R3**: Click "Simulate Primary Node Crash" -> verify failover timer triggers, route updates from Zone A to Zone B, standby is promoted, and degraded mode warning renders.
   - **R3**: Click "Inject Lock Contention" -> verify lock contention table populates with blocked PIDs and pool saturation increases.
   - **R4**: Click "🚨 Instant Revoke Key" on compromised SA -> verify key status updates to `REVOKED` and risk score decreases.
   - **R4**: Click "Simulate Secret Manager Fetch Spike" -> verify Quota gauge exceeds 100%, 429 warning renders, and exponential backoff recovers.
4. **Visual & Responsive Verification**:
   - Resize browser window across 400px (mobile), 768px (tablet), 1280px (desktop), and 3840px (4K) to confirm responsive layout integrity and Canvas rendering.
   - Verify all emojis and status icons have luminous CSS drop-shadow glows and remain visible across all state transitions.
