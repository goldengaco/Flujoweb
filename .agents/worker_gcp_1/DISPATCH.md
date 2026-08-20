## 2026-08-20T00:16:00Z

You are Worker GCP 1.
Your working directory is c:\DevWork\Depredador\Flujoweb\.agents\worker_gcp_1/
You have exclusive write ownership of: c:\DevWork\Depredador\Flujoweb\sistemas\gcp-serverless-pipeline\index.html

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Authoritative Documents to Read First:
- c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md (lines 84-110, 153-167)
- c:\DevWork\Depredador\Flujoweb\PROJECT.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_gcp_1\survey.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_gcp_1\handoff.md

Your Task:
Build the complete, self-contained single-file application `sistemas/gcp-serverless-pipeline/index.html` (R1: Serverless Microservice Pipeline & Zero-Downtime Deployer).
Requirements:
1. Core GCP APIs: cloudbuild.googleapis.com, artifactregistry.googleapis.com, secretmanager.googleapis.com, cloudkms.googleapis.com, run.googleapis.com, logging.googleapis.com.
2. 5-Stage Stepper:
   - 📦 Commit & Cloud Build container compilation
   - 🛡️ Artifact Registry vulnerability scanning & Cloud KMS container signing
   - 🔑 Secret Manager injection (decrypted with KMS IAM credentials)
   - 🚀 Cloud Run revision spin-up (v42 stable vs v43 canary) with instance scaling & cold-start monitoring
   - 🔀 Blue/Green & Canary Traffic Splitting (interactive slider 0% to 100%)
3. Observability Telemetry:
   - Real-time cold-start latency gauge (ms) with multi-phase breakdown (gVisor, image pull, secret decrypt, runtime init)
   - Active container instance counter & scaling graphs
   - Traffic split visualizer with 60fps Canvas particle beam routing
   - Streaming Cloud Logging console with severity filters (INFO, WARN, ERROR, CRITICAL)
4. Design & Polish:
   - Cyberpunk Mission Control aesthetic (#030812 / #060d1b base, Cyan #00e5ff accent, glowing borders, Inter + JetBrains Mono/Cascadia Code typography)
   - Permanent luminous icon visibility (emojis and icons NEVER disappear or turn into plain checkmarks)
   - Responsive from 400px mobile to 4K displays
   - Expose window.__GCP_SERVERLESS_PIPELINE__ and data-testid attributes for automated testing.

Implement the file completely, test it, and write your handoff report to c:\DevWork\Depredador\Flujoweb\.agents\worker_gcp_1\handoff.md. Report back when done.
