## 2026-08-20T04:46:15Z

You are the Worker for Milestone 2: Variant A (Tactical Cyberpunk Tri-Panel) of the Emergency Tri-Screen Multi-Device Simulator project.

Read the following documents:
- c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md
- c:\DevWork\Depredador\Flujoweb\PROJECT.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_survey_1\handoff.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_survey_2\handoff.md

Your exclusive write ownership:
- `sistemas/emergency-tri-screen-a/index.html`

Your tasks:
Create the complete, 100% self-contained single-file web application `sistemas/emergency-tri-screen-a/index.html` (Tactical Cyberpunk Tri-Panel):
1. **Left Panel (Phone A - Command Master)**:
   - Modern smartphone frame in pure CSS (notch/dynamic island, tactile buttons, status bar, screen reflection).
   - High-security slide-to-activate emergency trigger with 3-second countdown confirmation ring and cancel/abort capability.
   - Broadcast channel selector chips (FCM Push, LoRaWAN Siren, Brigade Radio).
   - Manual hazard injection controls ("Inyectar Fuego en Breakroom / Server Room").
2. **Center Panel (Interactive 2D Office Floorplan Blueprint)**:
   - 2D top-down office blueprint on HTML5 Canvas: executive suites, cubicle zones, meeting rooms, central hallways, Emergency Exits A (North) & B (South).
   - 40–50 animated occupant dots (particles): Blue (working at desks) -> Amber (evacuating along hallways via collision-aware pathfinding) -> Green (safe outside exits).
   - Dynamic smoke/fire hazard propagation with visual flame/smoke particle effects, blocking adjacent waypoints and triggering real-time repathfinding/rerouting to alternative exit.
   - 60 FPS requestAnimationFrame loop with high-DPI scaling (`devicePixelRatio`).
3. **Right Panel (Phones B, C & D - Synchronized Recipients)**:
   - Phone B (Floor Resident): Flashing red/amber tactical strobe alert overlay, dynamic route directions, Web Speech voice navigation, and "ESTOY A SALVO" action.
   - Phone C (Safety Brigade Lead): Two-way communication console, VHF radio squelch, interactive Stairwell A/B status toggles (CLEAR / BLOCKED) which update floorplan pathfinding.
   - Phone D (Front Desk / Security): Assembly point safe headcount ticker and survivor stream syncing in real time with Phone A HUD.
4. **Audio & State Sync**:
   - Procedural Web Audio API sound generator (dual-tone warble siren, LoRa horn, radio squelch) + Web Speech API voice synthesis.
   - State synchronization bus with in-page pub/sub and Web `BroadcastChannel('flujoweb_emergency_tri_screen')`.
5. **Programmatic Test Harness & Layout**:
   - Implement global `window.__EMERGENCY_TRI_A__` matching the interface contract in `PROJECT.md` (`getState()`, `triggerAlarm()`, `resetSimulation()`, `injectHazard()`, `checkInSafe()`, `toggleStairwell()`, `setOccupantCount()`).
   - Ensure responsive layout from 360px mobile to 4K displays with zero horizontal overflow (`scrollWidth <= clientWidth`). 0 console errors.
