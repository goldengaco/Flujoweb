# Project: Emergency Tri-Screen Multi-Device Simulator & Portal Integration

## Architecture
Three self-contained single-file interactive web applications (index.html) under `sistemas/` implementing a 3-column synchronized layout:
- **Left Column**: Master Dispatcher Phone A (Activation trigger, channel/severity selector, threat dials)
- **Center Column**: 60 FPS HTML5 Canvas Floorplan Simulation (Autonomous occupant particles, collision-aware pathfinding, dynamic smoke/fire hazard rerouting, 2.5D isometric projection)
- **Right Column**: Synchronized Recipient Mobile Devices (Phones B, C, D receiving alerts, audio-visual strobes, Web Speech directions, brigade status, "ESTOY A SALVO" headcount check-in)
- **State Synchronization Bus**: In-page reactive event dispatcher + Web `BroadcastChannel('flujoweb_emergency_tri_screen')` for instant cross-panel and cross-tab state mirroring.
- **Audio/Voice Synthesis**: Procedural Web Audio API sound generator (warble siren, LoRa horn, haptic pulse, radio squelch) + Web Speech API for emergency voice navigation (zero external sound files).
- **Master Portal Integration**: Registration in `sistemas/index.html` under `🚨 Emergencia` with live animated canvas previews.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | E2E Test Runner & Harness | Native Node 24 CDP test runner for headless Chrome/Edge with Tiers 1-4 tests | M1 | Survey |
| 2 | Variant A - Phone A Dispatcher | Slide-to-activate trigger, countdown confirmation, broadcast channel selector, hazard injector | M2 | R1 |
| 3 | Variant A - 2D Blueprint Floorplan | Top-down blueprint, 40-50 particle occupants, collision-aware pathfinding to Exits A & B | M2 | R1 |
| 4 | Variant A - Hazard Rerouting | Dynamic smoke/fire propagation in Breakroom/Server room with real-time repathfinding | M2 | R1 |
| 5 | Variant A - Recipient Phones B, C, D | Phone B strobe & voice alert, Phone C brigade stairwell toggle, Phone D safe tally ticker | M2 | R1 |
| 6 | Variant A - Audio & State Sync | Procedural warble siren, radio squelch, Web Speech engine, BroadcastChannel bus | M2 | R1 |
| 7 | Variant B - Phone A Dispatcher | Apple/Linear dark style smartphone mockup, haptic pulse trigger, severity level selector | M3 | R2 |
| 8 | Variant B - CAD Floorplan & Streams | Architectural CAD floorplan (#090d16), fluid particle streams with velocity vectors | M3 | R2 |
| 9 | Variant B - Velocity & Bottleneck Heatmap | Real-time evacuation velocity gauges (m/s) and egress bottleneck heatmap overlay | M3 | R2 |
| 10 | Variant B - Recipient Floating Cards | Phones B, C, D floating cards, lock-screen push alerts, live rotating escape compass | M3 | R2 |
| 11 | Variant B - Live Headcount Sync | One-tap safety confirmation syncing live safe percentage tally to Phone A HUD | M3 | R2 |
| 12 | Variant C - Phone A Tactical Tablet | Ruggedized tablet mockup, rotating incident level dial (LVL 1-4), PA broadcast toggle | M4 | R3 |
| 13 | Variant C - 2.5D Isometric Floorplan | 2.5D isometric projection with 3D extruded walls, glowing floor guide LED arrows, assembly zone | M4 | R3 |
| 14 | Variant C - Telemetry & Check-Ins | Recipient Phones B, C, D tracking BLE beacon proximity (dBm), battery levels, survivor triage | M4 | R3 |
| 15 | Master Portal Registration | Add 3 variants to SYSTEMS_MANIFEST in sistemas/index.html under 🚨 Emergencia | M5 | R4 |
| 16 | Master Portal Visualizers & Counters | Update static counters (#count-emergencia to 7, #count-all to 21) and preview canvases | M5 | R4 |
| 17 | Final E2E Verification & Tier 5 Hardening | 100% pass on Tiers 1-4 E2E tests + Tier 5 adversarial white-box coverage hardening | M6 | Acceptance Criteria |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | E2E Testing Infrastructure & Suite | `tests/tri_screen_e2e_suite.js`, `TEST_INFRA.md`, `TEST_READY.md` | none | DONE |
| M2 | Variant A: Tactical Cyberpunk Tri-Panel | `sistemas/emergency-tri-screen-a/index.html` | none | DONE |
| M3 | Variant B: Clean Minimalist Linear Dark | `sistemas/emergency-tri-screen-b/index.html` | none | DONE |
| M4 | Variant C: 2.5D Isometric Mission Control | `sistemas/emergency-tri-screen-c/index.html` | none | DONE |
| M5 | Master Portal Integration | `sistemas/index.html` registration and counter updates | M2, M3, M4 | DONE |
| M6 | Final Verification & Adversarial Hardening | Run 100% E2E test suite (Tiers 1-4) + Tier 5 white-box challenger loop | M1, M2, M3, M4, M5 | DONE |

---

## Interface Contracts

### Global Programmatic Test Automation Harnesses
Each variant implements a globally accessible window interface to allow deterministic headless E2E verification:

- **Variant A**: `window.__EMERGENCY_TRI_A__`
- **Variant B**: `window.__EMERGENCY_TRI_B__`
- **Variant C**: `window.__EMERGENCY_TRI_C__`

Contract Interface:
```typescript
interface EmergencyTriSimulatorHarness {
  getState(): {
    alarmState: 'STANDBY' | 'COUNTDOWN' | 'ACTIVE' | 'RESET';
    channel: string;
    severity?: string;
    incidentLevel?: number;
    occupantsTotal: number;
    occupantsSafe: number;
    occupantsEvacuating: number;
    hazards: Array<{ id: string; zone: string; radius: number; blocked: boolean }>;
    stairwells: Record<string, 'CLEAR' | 'BLOCKED'>;
    particles: Array<{ id: number; x: number; y: number; state: 'working' | 'evacuating' | 'safe'; exitId: string }>;
  };
  triggerAlarm(options?: { channel?: string; severity?: string; incidentLevel?: number }): void;
  resetSimulation(): void;
  injectHazard(zone: string): void;
  checkInSafe(phoneId: 'PHONE_B' | 'PHONE_C' | 'PHONE_D'): void;
  toggleStairwell(stairwellId: string, status?: 'CLEAR' | 'BLOCKED'): void;
  setOccupantCount(count: number): void;
}
```

### State Synchronization Event Bus Protocol
BroadcastChannel name: `'flujoweb_emergency_tri_screen'`
Message Schema:
```typescript
interface EmergencyBusMessage {
  id: string;
  type: string; // 'ALARM_TRIGGERED', 'OCCUPANT_CHECKIN_SAFE', 'HAZARD_SPAWNED', 'STAIRWELL_STATUS_CHANGED', 'ALARM_RESET'
  timestamp: number;
  origin: 'PHONE_A' | 'PHONE_B' | 'PHONE_C' | 'PHONE_D' | 'CANVAS_SIMULATOR' | 'PORTAL';
  payload: Record<string, any>;
}
```

---

## Code Layout
- `sistemas/emergency-tri-screen-a/index.html`: Variant A (Tactical Cyberpunk Tri-Panel)
- `sistemas/emergency-tri-screen-b/index.html`: Variant B (Clean Minimalist Linear Dark Tri-Panel)
- `sistemas/emergency-tri-screen-c/index.html`: Variant C (2.5D Isometric Mission Control Tri-Panel)
- `sistemas/index.html`: Master Launchpad Portal
- `tests/tri_screen_e2e_suite.js`: 4-Tier E2E Test Runner & Assertion Suite
- `TEST_INFRA.md`: Test infrastructure and tier breakdown documentation
- `TEST_READY.md`: Signal published when E2E test suite is ready for execution
