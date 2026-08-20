# Original User Request

## 2026-08-20T04:41:02Z

Build 3 distinct interactive Tri-Panel Emergency Evacuation & Multi-Device Simulators in c:\DevWork\Depredador\Flujoweb\sistemas\. Each system implements the user's vision: Left Panel (Master Dispatcher Phone A) -> Center Panel (Live 2D Office Floorplan with Animated Evacuating Occupant Particles) -> Right Panel (Recipient Mobile Phones B, C & D receiving the alert in real time).

Working directory: c:\DevWork\Depredador\Flujoweb\sistemas
Integrity mode: development

---

## Technical & Design Foundation

Each variant is a self-contained single-file web application (index.html) featuring a 3-column synchronized layout. High-framerate (60 FPS) Canvas particle physics for hallway/corridor pathfinding, realistic mobile device frames with audio-visual alarms (Web Audio API / Web Speech API), interactive "I am Safe" check-ins feeding back to the central headcount, and zero layout collisions.

---

## Requirements

### R1. Variant A: Tactical Cyberpunk Tri-Panel (sistemas/emergency-tri-screen-a/index.html)
- Left Panel (Phone A - Command Master):
  - High-security slide-to-activate emergency trigger with countdown confirmation.
  - Broadcast channel selector (FCM Push, LoRaWAN Siren, Brigade Radio).
- Center Panel (Interactive Office Floorplan Simulation):
  - 2D top-down office floor blueprint with private offices, open cubicle zones, meeting rooms, central hallways, and Emergency Exits A & B.
  - 40–50 animated occupant dots (particles): initially working at desks (blue), turning into evacuees (amber) when alarm triggers, navigating hallways via collision-aware pathfinding toward exits, and turning green (safe) once outside.
  - Dynamic smoke/fire hazard propagation in Breakroom/Server room forcing rerouting to alternative exits.
- Right Panel (Phones B, C & D - Synchronized Recipients):
  - Phone B (Floor Resident): High-priority strobe push alert with emergency voice directions.
  - Phone C (Safety Brigade Lead): Two-way channel with stairwell status toggle.
  - Phone D (Front Desk / Security): Assembly point headcount ticker and "ESTOY A SALVO" action.

### R2. Variant B: Clean Minimalist Linear Dark Tri-Panel (sistemas/emergency-tri-screen-b/index.html)
- Design Aesthetic: Apple / Linear minimalist slate dark (#090d16), airy whitespace, crystal-clear typography (Inter + JetBrains Mono), minimal visual noise.
- Left Panel (Phone A): Sleek modern smartphone mockup with haptic pulse activation and alarm severity selector (Simulacro / Fuego Real / Evacuación Sísmica).
- Center Panel: Architectural CAD-style floorplan with smooth fluid particle streams, evacuation velocity gauges, and egress bottleneck heatmaps.
- Right Panel (Phones B, C & D): Clean floating mobile cards with lock-screen push notifications, live escape compass, and one-tap safety confirmation feeding live data back to Phone A.

### R3. Variant C: 2.5D Isometric Mission Control Tri-Panel (sistemas/emergency-tri-screen-c/index.html)
- Design Aesthetic: Isometric 2.5D perspective floorplan with 3D walls, glowing floor guide LED arrows, and room depth.
- Left Panel (Phone A): Ruggedized Tactical Tablet with incident level dials and PA broadcast toggle.
- Center Panel: 2.5D Isometric rendering of the office floor with live occupant dots navigating multi-room suites and outdoor assembly zones.
- Right Panel (Phones B, C & D): Real-time device telemetry tracking BLE beacon proximity, battery levels, and confirmed survivor check-ins.

### R4. Master Portal Integration (sistemas/index.html)
- Integrate all 3 new Tri-Panel variants into the Master Launchpad Portal under the 🚨 Sistemas de Emergencia category with live preview wave canvases and launch buttons.

---

## Acceptance Criteria

### Functional & Visual
- [ ] All 3 files (emergency-tri-screen-a/index.html, emergency-tri-screen-b/index.html, emergency-tri-screen-c/index.html) load cleanly with 0 console errors.
- [ ] Activating the alarm on Phone A (Left) immediately broadcasts the alert to Phones B, C, D (Right) and triggers the particle evacuation on the Center Floorplan in real time.
- [ ] Occupant dots pathfind through hallways toward designated emergency exits without clipping through walls.
- [ ] Clicking "Estoy a Salvo" on any recipient phone updates the safe headcount tally in real time.
- [ ] Master portal (sistemas/index.html) is updated to link and launch all 3 new systems.
- [ ] Fully responsive on viewports from 360px to 4K displays with fluid layout wrapping.
