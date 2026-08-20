## 2026-08-20T01:03:51Z
You are teamwork_preview_worker.
Working directory: c:\DevWork\Depredador\Flujoweb\.agents\worker_evac_v2\
Read the authoritative requirements at: c:\DevWork\Depredador\Flujoweb\ORIGINAL_REQUEST.md
Read the project architecture at: c:\DevWork\Depredador\Flujoweb\PROJECT.md
Read the technical specification survey at: c:\DevWork\Depredador\Flujoweb\.agents\explorer_evac_1\survey.md

Your exclusive target file to create: `sistemas/emergency-evacuation-v2/index.html`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Key Requirements:
1. Complete, self-contained single-file HTML/CSS/JS application with zero runtime dependencies beyond Google Fonts.
2. Personal mobile phone interface for building occupants receiving the emergency signal:
   - Tactical Alarm Screen: Pulsing high-visibility emergency strobe banner, audible siren synthesizer (Web Audio API dual-tone warble/yelp), and text-to-speech synthesized audio alert directions in Spanish (Web Speech API with graceful visual fallback).
   - Dynamic Floorplan & Escape Pathfinding: Interactive vector 2D Canvas/SVG blueprint (24x16 grid) showing current user location, safe emergency exit routes, blocked hazard zones (flames/smoke), and nearest fire extinguishers / first aid kits with dynamic real-time A* path calculation.
   - "ESTOY A SALVO / REPORTAR EMERGENCIA" Action Bar: One-tap confirmation button transmitting GPS / beacon coordinates to the Master Command console with instant visual feedback and telemetry stream.
   - Offline Mesh Network Simulator: Visualizes Bluetooth Low Energy (BLE) & Wi-Fi Direct peer multi-hop mesh routing when cellular towers fail.
3. Visuals & Polish:
   - Ultra-tactical high-visibility mobile HUD framed design (and responsive fullscreen mode) with glowing emergency red (#ff003c), neon yellow (#facc15), and safe emerald (#00ff88).
   - Procedural Web Audio API siren & feedback generator with mute toggle.
   - Zero console errors and responsive layout.

Deliverable: Save complete code in `sistemas/emergency-evacuation-v2/index.html`, write `handoff.md` in your working directory, and report completion via send_message.
