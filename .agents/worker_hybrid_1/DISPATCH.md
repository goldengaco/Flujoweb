## 2026-08-20T01:03:51Z
You are teamwork_preview_worker.
Working directory: c:\DevWork\Depredador\Flujoweb\.agents\worker_hybrid_1\
Read the authoritative requirements at: c:\DevWork\Depredador\Flujoweb\ORIGINAL_REQUEST.md
Read the project architecture at: c:\DevWork\Depredador\Flujoweb\PROJECT.md
Read the technical specification survey at: c:\DevWork\Depredador\Flujoweb\.agents\explorer_hybrid_1\survey.md

Your exclusive target file to create: `sistemas/apigee-mulesoft-hybrid/index.html`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Key Requirements:
1. Complete, self-contained single-file HTML/CSS/JS application with zero runtime npm/CDN dependencies beyond Google Fonts.
2. Architecture modeling:
   - Apigee Edge Gateway (GCP): Ingress proxy, Spike Arrest (10k RPS), OAuth2 JWT verification (RS256 & claims validation), Edge Response Cache (300s TTL), WAF Threat Inspection.
   - MuleSoft Runtime Fabric (RTF): DataWeave 2.0 mapping engine, async batch pipelines, worker vCore pool (0.2-2.0 vCores), Heap Memory (Eden/Survivor/Tenured), G1GC pause duration & frequency telemetry, Object Store hit ratio, Circuit Breaker state machine (CLOSED/OPEN/HALF-OPEN).
   - Downstream Multi-Cloud Routing: AWS (Lambda Risk Scorer, DynamoDB Global Orders), GCP (Cloud SQL HA PostgreSQL, Cloud Pub/Sub), SAP Legacy Core (RFC/BAPI).
3. Visuals & Polish:
   - Dark Cyberpunk NOC/SRE HUD theme (#030812 base, #00e5ff cyan, #f59e0b amber, #8b5cf6 purple, #00ff88 emerald).
   - 60fps HTML5 Canvas particle stream visualizer with glowing packet trails and ripple impacts.
   - Interactive policy toggle controls: Enable/Disable Cache, Inject Rate Limiting (429 Too Many Requests), Simulate Token Expiry (401), Inject WAF Attack (403), Inject SAP Lag (800ms), Worker Autoscaler (Scale Up/Down).
   - Latency Waterfall Decomposition chart comparing Apigee Edge vs MuleSoft RTF vs Downstream Clouds.
   - 4 Worker Telemetry Dials & SVG circular gauges.
   - Procedural Web Audio API sound synthesizer for packet chirps, cache chimes, DataWeave sweeps, and error alarms with audio mute toggle.
   - Zero console errors and fully responsive layout (400px to 4K).

Deliverable: Save complete code in `sistemas/apigee-mulesoft-hybrid/index.html`, write `handoff.md` in your working directory, and report completion via send_message.
