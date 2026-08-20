## 2026-08-19T18:03:51Z
You are teamwork_preview_worker.
Working directory: c:\DevWork\Depredador\Flujoweb\.agents\worker_evac_v1\
Read the authoritative requirements at: c:\DevWork\Depredador\Flujoweb\ORIGINAL_REQUEST.md
Read the project architecture at: c:\DevWork\Depredador\Flujoweb\PROJECT.md
Read the technical specification survey at: c:\DevWork\Depredador\Flujoweb\.agents\explorer_evac_1\survey.md

Your exclusive target file to create: `sistemas/emergency-evacuation-v1/index.html`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Key Requirements:
1. Complete, self-contained single-file HTML/CSS/JS application with zero runtime dependencies beyond Google Fonts.
2. Tactical Command Center for Building Safety Directors and Fire Chiefs:
   - Floor-by-Floor Interactive Building Matrix (Piso 1 al Piso 12): Visual occupancy heatmap (1,240 baseline occupants), smoke/heat/CO sensor readings per floor, fire alert state (NORMAL, PRE-ALERT, EVACUATION, CRITICAL).
   - Master Broadcast Button ("DESPLEGAR ALERTA DE EVACUACIÓN"): Triggers instant broadcast to all occupant devices with animated audio/visual strobe pulse and siren synthesizer (Web Audio API).
   - Real-Time Evacuation Headcount Tracker: Live tally of "Occupants Safe at Assembly Point", "Pending / Trapped", "Evacuating in Stairs" with dynamic fluid evacuation decay and room-level drilldown (Rooms 701-708).
   - Brigade Dispatcher Console: Assigns 5 brigade teams (Alfa, Bravo, Charlie, Delta, Eco) to stairwells, elevators, or hazard zones, tracking SCBA oxygen PSI and thermal feeds.
3. Visuals & Polish:
   - Dark Tactical HUD theme (#030812 base, #ef4444 red, #f97316 orange, #10b981 emerald, #facc15 yellow).
   - Real-time Canvas/SVG building cross-section and floorplan matrix.
   - Interactive drilldown modals and brigade assignment controls.
   - Procedural Web Audio API alert sound effects and siren synthesizer with mute toggle.
   - Zero console errors and fully responsive layout (400px to 4K).

Deliverable: Save complete code in `sistemas/emergency-evacuation-v1/index.html`, write `handoff.md` in your working directory, and report completion via send_message.
