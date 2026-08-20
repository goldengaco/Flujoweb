# BRIEFING — 2026-08-20T04:46:15Z

## Mission
Build the complete, self-contained single-file web application `sistemas/emergency-tri-screen-a/index.html` (Tactical Cyberpunk Tri-Panel Evacuation Simulator) according to specifications, interface contract, and responsive design standards.

## 🔒 My Identity
- Archetype: Worker (implementer / qa / specialist)
- Roles: implementer, qa, specialist
- Working directory: c:\DevWork\Depredador\Flujoweb\.agents\worker_m2
- Original parent: 3398daff-2739-419e-acef-14c5ebfb7753
- Milestone: M2 - Variant A (Tactical Cyberpunk Tri-Panel)

## 🔒 Key Constraints
- Exclusive write ownership: `sistemas/emergency-tri-screen-a/index.html` and `.agents/worker_m2/`
- Zero external JS/CSS dependencies (Google Fonts allowed: Inter, JetBrains Mono)
- 100% self-contained single-file HTML application
- Real implementation (DO NOT CHEAT, no mock facades or hardcoded values)
- Programmatic interface: `window.__EMERGENCY_TRI_A__` matching `PROJECT.md` contract
- Zero console errors, fully responsive (360px to 4K), 60 FPS Canvas loop with `devicePixelRatio`
- Procedural Web Audio API sound generator + Web Speech API voice synthesis
- Dual-layer state sync: fast local Pub/Sub + Web `BroadcastChannel('flujoweb_emergency_tri_screen')`

## Current Parent
- Conversation ID: 3398daff-2739-419e-acef-14c5ebfb7753
- Updated: not yet

## Task Summary
- **What to build**: Variant A: Tactical Cyberpunk Tri-Panel Evacuation Simulator (`sistemas/emergency-tri-screen-a/index.html`)
- **Success criteria**:
  1. Left Panel (Phone A): Modern smartphone CSS frame, slide-to-activate trigger with 3s countdown/abort ring, channel selector chips, manual hazard injection.
  2. Center Panel: 2D top-down office blueprint on HTML5 Canvas, 40-50 particle occupants (blue -> amber -> green) with collision-aware NavMesh/A* pathfinding, dynamic smoke/fire hazard propagation and rerouting to Exits A & B.
  3. Right Panel: Synchronized recipient phones (Phone B: strobe alert, voice directions, 'ESTOY A SALVO' check-in; Phone C: Safety brigade VHF console, Stairwell A/B status toggles; Phone D: Front Desk assembly headcount ticker and survivor stream).
  4. Audio & State Sync: Procedural Web Audio warble siren, LoRa horn, VHF squelch, Web Speech voice synthesis, and BroadcastChannel.
  5. Programmatic Test Harness `window.__EMERGENCY_TRI_A__` adhering to the interface contract.
- **Interface contracts**: `c:\DevWork\Depredador\Flujoweb\PROJECT.md`
- **Code layout**: `sistemas/emergency-tri-screen-a/index.html`

## Change Tracker
- **Files modified**: `sistemas/emergency-tri-screen-a/index.html` (to create)
- **Build status**: pending implementation
- **Pending issues**: none

## Quality Status
- **Build/test result**: pending
- **Lint status**: clean
- **Tests added/modified**: programmatic validation suite

## Loaded Skills
- **Source**: N/A
- **Local copy**: N/A
- **Core methodology**: Single-file responsive Canvas simulation + Web Audio/Speech + reactive UI

## Key Decisions Made
- Cyberpunk Tactical HUD aesthetic with glowing neon cyan (`#00f0ff`), tactical amber (`#f59e0b`), emergency crimson (`#ef4444`), and deep obsidian grid backdrop (`#030712`).
- 2D Canvas NavMesh graph with 30+ waypoints, wall obstacles, room definitions, and door nodes for real-time Dijkstra/A* routing.
- Occupant flocking with continuous Reynolds collision avoidance (separation, alignment, wall repulsion).
- Dynamic hazard growth with circular bounding masks blocking graph nodes and triggering live path recalculation.
- CSS pure smartphone frames with realistic camera notch/island, status bar, side physical buttons, and glass sheen.
- Web Audio API procedural synthesis with LFO-modulated dual-tone siren and bandpass noise bursts for VHF radio squelch.
- Full programmatic API `window.__EMERGENCY_TRI_A__` for automated headless testing.

## Artifact Index
- `sistemas/emergency-tri-screen-a/index.html` — Production single-file Tactical Cyberpunk Tri-Panel Simulator
- `.agents/worker_m2/handoff.md` — Final milestone handoff report
