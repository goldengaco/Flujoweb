# Original User Request

## Initial Request — 2026-08-19T17:59:41-07:00

Build an advanced, high-stakes suite of Enterprise Hybrid Cloud & Life-Critical Emergency Response Systems in c:\DevWork\Depredador\Flujoweb\sistemas\. This project bridges Apigee (GCP) + MuleSoft (Runtime Fabric) + AWS Multi-Cloud Observability with a real-time Emergency Building Evacuation & Brigade Alert Broadcasting System ("Salvar Vidas") provided in multiple specialized versions.

Working directory: c:\DevWork\Depredador\Flujoweb\sistemas
Integrity mode: development

---

## Technical & Design Foundation

Every system must be an ultra-polished, self-contained single-file web application (index.html) with zero external runtime dependencies beyond Google Fonts. Designed with high-contrast Cyberpunk / Tactical HUD themes, high-framerate Canvas/SVG visualizers, real-time audio/visual alert pulses, and zero console errors.

---

## Requirements

### R1. Apigee Multi-Cloud Gateway & MuleSoft External Telemetry Cockpit (sistemas/apigee-mulesoft-hybrid/index.html)
- Architecture:
  - Apigee Edge Gateway (GCP): Ingress proxy enforcing Spike Arrest (10k RPS), OAuth2 JWT verification, Response Cache at the edge, and WAF threat inspection.
  - MuleSoft Runtime Fabric (RTF): Core integration layer executing DataWeave 2.0 mapping and async batch pipelines across workers (vCores, Heap Memory, GC pauses).
  - Downstream Multi-Cloud Routing: Parallel fan-out to AWS (Lambda, DynamoDB), Google Cloud (Cloud SQL HA, Pub/Sub), and Core SAP Legacy.
- Observability Telemetry:
  - Live Edge Latency (Apigee) vs Internal Integration Latency (MuleSoft) vs Downstream Cloud Response.
  - Interactive Policy Toggles: Enable/Disable Cache, Inject Rate Limiting (429 Too Many Requests), Simulate Token Expiry.
  - Worker vCore Pool Telemetry: Real-time CPU%, Heap Memory, Garbage Collection (GC) pauses, and Object Store hit ratio.

### R2. Emergency Evacuation Suite — Version 1: Master Building Command & Floor Heatmap (sistemas/emergency-evacuation-v1/index.html)
- Purpose: Tactical Command Center for Building Safety Directors and Fire Chiefs.
- Features:
  - Floor-by-Floor Interactive Building Matrix (Piso 1 al Piso 12): Visual occupancy heat map displaying active occupants per floor, smoke/heat sensor readings, and fire alert status.
  - Master Broadcast Button ("DESPLEGAR ALERTA DE EVACUACIÓN"): Triggers an instant broadcast to all occupant devices with audio/visual strobe pulse.
  - Real-Time Evacuation Headcount Tracker: Live tally of "Occupants Safe at Assembly Point" vs "Pending / Trapped" with room-level drilldown.
  - Brigade Dispatcher Console: Assigns firefighter/brigade teams to specific stairwells or hazard zones.

### R3. Emergency Evacuation Suite — Version 2: Mobile Occupant HUD & Dynamic Escape Route (sistemas/emergency-evacuation-v2/index.html)
- Purpose: Personal mobile phone interface for building occupants receiving the emergency signal.
- Features:
  - Tactical Alarm Screen: Pulsing high-visibility emergency strobe banner, audible siren synthesizer, and text-to-speech audio alert directions.
  - Dynamic Floorplan & Escape Pathfinding: Interactive vector blueprint showing current user location, safe emergency exit routes, blocked hazard zones (flames/smoke), and nearest fire extinguishers / first aid kits.
  - "ESTOY A SALVO / REPORTAR EMERGENCIA" Action Bar: One-tap confirmation button transmitting GPS / beacon coordinates to the Master Command console.
  - Offline Mesh Network Simulator: Shows communication routing via Bluetooth / Wi-Fi Direct mesh if cellular towers fail.

### R4. Emergency Evacuation Suite — Version 3: Multi-Carrier Broadcast Fan-Out Engine (sistemas/emergency-evacuation-v3/index.html)
- Purpose: Telemetry and latency analysis of mass-alert distribution infrastructure.
- Features:
  - Massive Fan-Out Telemetry: Simulates broadcasting to 5,000+ devices simultaneously across 4 carrier channels:
    1. 📱 FCM / Apple APNs Push Notifications (Cloud Pub/Sub backed)
    2. 💬 Emergency SMS Gateway (Twilio / AWS SNS)
    3. 🔊 Building PA System & LoRaWAN Strobe Sirens
    4. 📻 Brigade Two-Way Radio Mesh
  - Latency Distribution Histogram: Displays millisecond breakdown of packet delivery (e.g., 99.8% delivered in < 850 ms).
  - Carrier Failure & Auto-Retry Simulator: Demonstrates instant failover if SMS gateway latency spikes.

### R5. Master Innovation Catalog: 80 Real-World Monitoring & Commercial Ideas for MuleSoft (mulesoft_80_ideas_observabilidad.md)
- A comprehensive, categorized guide of 80 real-world use cases, monitoring tools, and monetization ideas for MuleSoft + Apigee + Cloud architectures (Fintech, Healthcare, Retail, SRE, Cyber-Defense, and IoT Public Safety).

---

## Acceptance Criteria

### Functional
- [ ] All 4 HTML applications and the markdown catalog are created in c:\DevWork\Depredador\Flujoweb\sistemas\.
- [ ] Apigee + MuleSoft Hub: Successfully visualizes the flow across Apigee -> MuleSoft -> AWS / GCP / SAP, allowing interactive policy toggles (cache, rate limit) and worker vCore inspection.
- [ ] Evacuation V1 (Command Center): Broadcast button triggers animated fire alert across building floors, updating the safe vs trapped occupant count in real time.
- [ ] Evacuation V2 (Mobile HUD): Displays realistic mobile emergency alert, interactive escape pathfinding blueprint, and "Estoy a Salvo" check-in telemetry.
- [ ] Evacuation V3 (Fan-Out Telemetry): Simulates 5,000+ message distribution across 4 channels with live delivery latency histograms and carrier failover.
- [ ] All components maintain permanent luminous glow and zero JavaScript console errors.
