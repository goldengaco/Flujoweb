## 2026-08-20T00:16:03Z
Task: Build the complete, self-contained single-file application `sistemas/gcp-iam-security/index.html` (R4: Identity & Access Governance IAM & Secret Vault Auditor).
Requirements:
1. Core GCP APIs: iam.googleapis.com, cloudresourcemanager.googleapis.com, secretmanager.googleapis.com, cloudkms.googleapis.com, serviceusage.googleapis.com.
2. Architecture & Posture Auditor:
   - Full-stack security posture auditor scanning project hierarchy (Org -> Folder -> Project), service account key lifecycles, over-privileged IAM bindings, and KMS key rotation status.
3. Observability Telemetry & Controls:
   - Least-Privilege Risk Matrix (Excessive permissions detector with granular downscoping recommendations and "Apply Recommended Policy" action).
   - Service Account Key Expiration & Compromise Alert panel with "Instant Revoke / Rotate Key" action.
   - Secret Version Lifecycle Timeline (Active, Deprecated, Destroyed) with version creation and destruction actions.
   - API Quota Consumption Gauges (Service Usage quota limits vs current RPS) with "Simulate Rate Spike & Backoff" trigger.
4. Design & Polish:
   - Cyberpunk Mission Control aesthetic (#030812 / #060d1b base, Crimson #ef4444 and Ruby #f43f5e accents)
   - Permanent luminous icon visibility (emojis and icons NEVER disappear or turn into plain checkmarks)
   - Responsive from 400px mobile to 4K displays
   - Expose window.__GCP_IAM_SECURITY__ and data-testid attributes for automated testing.
