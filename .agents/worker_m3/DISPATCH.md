## 2026-08-19T21:46:15Z

You are the Worker for Milestone 3: Variant B (Clean Minimalist Linear Dark Tri-Panel) of the Emergency Tri-Screen Multi-Device Simulator project.

Read the following documents:
- c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md
- c:\DevWork\Depredador\Flujoweb\PROJECT.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_survey_1\handoff.md
- c:\DevWork\Depredador\Flujoweb\.agents\explorer_survey_2\handoff.md

Your exclusive write ownership:
- `sistemas/emergency-tri-screen-b/index.html`

Your tasks:
Create the complete, 100% self-contained single-file web application `sistemas/emergency-tri-screen-b/index.html` (Clean Minimalist Linear Dark Tri-Panel):
1. **Design Aesthetic**:
   - Apple / Linear minimalist slate dark (`#090d16`), card backgrounds (`#0f1523`), subtle 1px borders (`rgba(255,255,255,0.07)`), airy whitespace, Inter and JetBrains Mono typography.
2. **Left Panel (Phone A)**:
   - Sleek modern smartphone mockup with haptic pulse activation button and alarm severity selector pills (Simulacro / Fuego Real / Evacuación Sísmica).
   - Real-time egress protocol switches and evacuation progress donut tally.
3. **Center Panel**:
   - Architectural CAD-style floorplan with fine hairline grid, room area tags ($m^2$), and fluid particle streams with velocity vectors.
   - Real-time evacuation velocity gauges ($m/s$) and egress bottleneck doorway congestion heatmaps.
   - 60 FPS requestAnimationFrame loop with high-DPI scaling (`devicePixelRatio`).
4. **Right Panel (Phones B, C & D)**:
   - Clean floating mobile cards with lock-screen push notifications.
   - Live dynamic rotating escape compass pointing toward the nearest clear exit bearing.
   - One-tap safety confirmation ("Estoy a Salvo") syncing live safe percentage tally to Phone A without layout shift.
5. **Audio, State Sync & Test Harness**:
   - Minimalist haptic click procedural audio using Web Audio API + synchronized event bus.
   - Implement global `window.__EMERGENCY_TRI_B__` matching the interface contract in `PROJECT.md` (`getState()`, `triggerAlarm()`, `resetSimulation()`, `injectHazard()`, `checkInSafe()`, `toggleStairwell()`, `setOccupantCount()`).
   - Ensure responsive layout from 360px mobile to 4K displays with zero horizontal overflow (`scrollWidth <= clientWidth`). 0 console errors.
