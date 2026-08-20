# DISPATCH LOG

## 2026-08-20T04:46:15Z

You are the Worker for Milestone 4: Variant C (2.5D Isometric Mission Control Tri-Panel) of the Emergency Tri-Screen Multi-Device Simulator project.

Read the following documents:
- c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md
- c:\DevWork\Depredador\Flujoweb\PROJECT.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_survey_1\handoff.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_survey_2\handoff.md

Your exclusive write ownership:
- sistemas/emergency-tri-screen-c/index.html

Your tasks:
Create the complete, 100% self-contained single-file web application sistemas/emergency-tri-screen-c/index.html (2.5D Isometric Mission Control Tri-Panel):
1. **Design Aesthetic**:
   - 2.5D Isometric perspective floorplan with 3D extruded room walls, depth shading, glowing floor guide LED arrows, dark industrial palette (#080c14).
2. **Left Panel (Phone A)**:
   - Ruggedized Tactical Tablet frame with corner shock bumpers, rotating incident level dial (Levels 1-4), Push-To-Talk PA broadcast toggle with live audio waveform canvas.
3. **Center Panel**:
   - 2.5D Isometric canvas projection (isoX = (x - y) * cos(30°), isoY = (x + y) * sin(30°) - z) with depth-sorted extruded walls, glowing directional LED floor exit chevrons, multi-room suites, and outdoor assembly zone.
   - 45 occupant dots navigating 3D suites along obstacle-free pathways to safe outdoor coordinates.
   - 60 FPS requestAnimationFrame loop with high-DPI scaling (devicePixelRatio).
4. **Right Panel (Phones B, C & D)**:
   - Recipient devices tracking real-time device telemetry: BLE beacon proximity signal strength (dBm RSSI), battery gauges, GPS coordinates, and survivor triage check-in logs.
5. **Audio, State Sync & Test Harness**:
   - Military warning horn burst + VHF radio squelch + Web Speech PA dispatcher.
   - Implement global window.__EMERGENCY_TRI_C__ matching the interface contract in PROJECT.md (getState(), 	riggerAlarm(), esetSimulation(), injectHazard(), checkInSafe(), 	oggleStairwell(), setOccupantCount()).
   - Ensure responsive layout from 360px mobile to 4K displays with zero horizontal overflow (scrollWidth <= clientWidth). 0 console errors.
