# Comprehensive Technical Specification & Architecture Blueprint: Emergency Tri-Screen Multi-Device Simulator

**Author**: Explorer Survey 2  
**Target Milestone**: Survey Phase -- Emergency Tri-Screen Multi-Device Simulator  
**Working Directory**: `c:\DevWork\Depredador\Flujoweb\`  
**Target Output Artifacts**:
1. `sistemas/emergency-tri-screen-a/index.html` (Variant A: Tactical Cyberpunk Tri-Panel)
2. `sistemas/emergency-tri-screen-b/index.html` (Variant B: Clean Minimalist Linear Dark Tri-Panel)
3. `sistemas/emergency-tri-screen-c/index.html` (Variant C: 2.5D Isometric Mission Control Tri-Panel)
4. `sistemas/index.html` (Master Portal Launchpad Registration & Preview Canvases)

---

## 1. Observation

Direct examination of `c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md`, `sistemas/index.html`, and existing emergency systems (`emergency-evacuation-v1`, `emergency-evacuation-v2`, `emergency-evacuation-v3`, `emergency-clean-evacuation`) revealed the following baseline:

1. **Architecture Model in Repo**:
   - Every system under `sistemas/` is structured as a **self-contained single-file web application (`index.html`)** containing embedded CSS `<style>` and vanilla JavaScript `<script>`.
   - Fonts used across the suite are Google Fonts: `Inter` (weights 300 to 900) and `JetBrains Mono` (weights 300 to 800).
   - Zero external runtime framework dependencies (no React, Vue, or Webpack bundlers); high-performance vanilla DOM and HTML5 2D Canvas APIs are leveraged for 60 FPS animation loops.

2. **Master Portal Integration (`sistemas/index.html`)**:
   - Lines 1079-1150 in `sistemas/index.html` host `SYSTEMS_MANIFEST`, an array of system descriptor objects with fields: `id`, `name`, `subtitle`, `category: "emergencia"`, `categoryLabel: "🚨 Emergencia"`, `badges`, `description`, `href`, `metrics: { latency, sla, rps }`, and `visType`.
   - Portal cards render live interactive canvas previews based on `visType` (e.g., `heatmap`, `path`, `histogram`, `flow`, `canary`).

3. **Audio & Voice Precedents**:
   - `emergency-evacuation-v1` (lines 1660-1780) uses a procedural `CommandAudioEngine` with Web Audio API oscillators, LFO modulation, and gain nodes without requiring external audio asset files.
   - `emergency-evacuation-v2` (lines 1678-1727) implements `TacticalVoiceAlert` wrapping native browser `window.speechSynthesis` with `SpeechSynthesisUtterance` configured for Spanish (`es-ES`/`es-MX`) with toast HUD fallback.

4. **Functional Scope for the 3 Tri-Panel Variants**:
   - **Variant A (`emergency-tri-screen-a/index.html`)**: Tactical Cyberpunk aesthetic with high-contrast neon cyan, crimson, amber; Left Phone A with slide-to-activate trigger & countdown; Center 2D Blueprint with 40-50 particle occupants navigating hallways with dynamic smoke/fire hazard rerouting to Exits A & B; Right Phones B, C, D with strobe alerts, Web Speech voice navigation, Brigade radio stairwell toggles, and front-desk headcount.
   - **Variant B (`emergency-tri-screen-b/index.html`)**: Clean Minimalist Linear Dark aesthetic (`#090d16`); Left Phone A with haptic pulse & severity selector; Center CAD-style floorplan with fluid particle velocity streams, velocity gauges, and bottleneck heatmaps; Right Phones B, C, D with floating cards, live dynamic escape compass, and one-tap safety tally sync.
   - **Variant C (`emergency-tri-screen-c/index.html`)**: 2.5D Isometric Mission Control aesthetic; Left Phone A with ruggedized tactical tablet frame, rotary incident level dials, and PA broadcast toggle; Center 2.5D isometric floorplan with 3D walls, glowing directional LED floor arrows, and outdoor assembly zone; Right Phones B, C, D tracking BLE beacon telemetry, battery levels, and survivor check-ins.

---

## 2. Logic Chain & Comprehensive Architecture Design

```
 ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   TRI-PANEL SYNCHRONIZED ARCHITECTURE OVERVIEW                                   │
 └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
   ┌────────────────────────┐         ┌─────────────────────────────────────┐         ┌────────────────────────┐
   │      LEFT COLUMN       │         │            CENTER COLUMN            │         │      RIGHT COLUMN      │
   │  Master Phone A        │         │   60 FPS Floorplan Simulation       │         │  Recipient Devices     │
   │  (Command & Dispatch)  │         │   (Collision-Aware Pathfinding)     │         │  (Phones B, C & D)     │
   │                        │         │                                     │         │                        │
   │ • Emergency Trigger    │ ──────▶ │ • 40-50 Autonomous Occupants        │ ◀────── │ • Phone B (Resident)   │
   │ • Threat Level Dials   │         │ • Dynamic Fire/Smoke Rerouting      │         │ • Phone C (Brigade)    │
   │ • Channel Fan-Out      │ ◀────── │ • Waypoint / NavMesh Graph / A*     │ ──────▶ │ • Phone D (Security)   │
   │ • Manual Hazard Inject │         │ • Bottleneck Heatmaps / LED Guides  │         │ • "ESTOY A SALVO" Sync │
   └───────────┬────────────┘         └──────────────────┬──────────────────┘         └───────────┬────────────┘
               │                                         │                                        │
               └─────────────────────────────────────────┼────────────────────────────────────────┘
                                                         ▼
                                 ┌───────────────────────────────────────────────┐
                                 │       STATE SYNCHRONIZATION EVENT BUS         │
                                 │   • In-Memory Fast PubSub Event Target        │
                                 │   • Web BroadcastChannel ('emergency_bus')    │
                                 │   • Procedural Web Audio + Web Speech Synth   │
                                 └───────────────────────────────────────────────┘
```

### 2.1 3-Column Synchronized Responsive Layout & CSS Mobile Frames

#### A. CSS Grid Layout System
The viewport layout must display all three functional domains simultaneously without layout overlapping or unexpected window scrollbars on desktop displays.

```css
/* Master Grid Layout Container */
.tri-screen-layout {
  display: grid;
  grid-template-columns: 320px 1fr 340px;
  gap: 20px;
  width: 100vw;
  height: calc(100vh - 64px); /* Subtract header bar */
  max-width: 1920px;
  margin: 0 auto;
  padding: 16px 24px 24px 24px;
  box-sizing: border-box;
  overflow: hidden;
}

/* Responsive Breakpoint Adaptations */
@media (max-width: 1440px) {
  .tri-screen-layout {
    grid-template-columns: 290px 1fr 310px;
    gap: 14px;
    padding: 12px 16px;
  }
}

@media (max-width: 1180px) {
  .tri-screen-layout {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    height: auto;
    overflow-y: auto;
  }
  .center-panel-wrapper {
    grid-column: 1 / -1;
    order: -1;
    min-height: 480px;
  }
}

@media (max-width: 768px) {
  .tri-screen-layout {
    display: flex;
    flex-direction: column;
    height: auto;
    overflow-y: auto;
  }
  .mobile-tab-selector {
    display: flex;
    position: sticky;
    bottom: 0;
    z-index: 100;
  }
}
```

#### B. Pure CSS Mobile Device Mockup Frame Specifications
Mobile frames are constructed purely with CSS3 without external images or SVG dependencies, ensuring instant rendering and crisp vectors on retina screens.

```css
/* Reusable Modern Smartphone Chassis (Phone A & Phone B) */
.device-mockup-frame {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 640px;
  background: #000000;
  border-radius: 44px;
  border: 4px solid #232b3e;
  box-shadow: 
    0 0 0 2px rgba(255, 255, 255, 0.08),
    0 25px 50px -12px rgba(0, 0, 0, 0.75),
    0 0 30px rgba(0, 240, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
}

/* Dynamic Island / Camera Notch */
.device-notch {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 96px;
  height: 24px;
  background: #000;
  border-radius: 20px;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
}
.device-notch .camera-lens {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #1e293b, #020617);
  border: 1px solid rgba(255,255,255,0.1);
}
.device-notch .sensor-led {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

/* Device Status Bar */
.device-status-bar {
  position: relative;
  z-index: 30;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px 0 20px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
}

/* Screen Glass Reflection Gradient */
.device-screen-inner {
  position: relative;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.03), transparent 60%);
}

/* Tactile Physical Side Buttons */
.device-mockup-frame::before {
  content: "";
  position: absolute;
  left: -7px;
  top: 110px;
  width: 4px;
  height: 48px;
  background: #334155;
  border-radius: 2px 0 0 2px;
}
.device-mockup-frame::after {
  content: "";
  position: absolute;
  right: -7px;
  top: 130px;
  width: 4px;
  height: 64px;
  background: #334155;
  border-radius: 0 2px 2px 0;
}
```

---

### 2.2 Particle Simulation & Pathfinding Algorithms

#### A. Topology & NavMesh Waypoint Graph Model
The office floorplan simulation runs on an explicit **Topological NavMesh / Waypoint Graph** combined with continuous steering behaviors.

```
 [ Room 101 (Offices) ] --(Door N1)--> [ North Hallway W1 ] --> [ Exit A Portal ] (Safe Zone North)
 [ Room 102 (Server)  ] --(Door N2)--> [ North Hallway W2 ] --> [ Exit A Portal ]
                                              │
                                        (Spine Choke)
                                              │
 [ Open Cubicle Bullpen] --(Door C1)--> [ Central Spine W3 ] --> [ Exit B Portal ] (Safe Zone South)
 [ Breakroom Hazard   ] --(Door S1)--> [ South Hallway W4 ] --> [ Exit B Portal ]
```

Each Node in the graph $G = (V, E)$ contains:
- `id`: Unique identifier (e.g. `'DOOR_OFFICE_1'`, `'HALL_NORTH_1'`, `'EXIT_A'`)
- `x, y`: Canvas coordinates in logical space ($800 \times 520$)
- `zone`: Room name or corridor identifier
- `neighbors`: Array of adjacent node IDs with distance costs $d(u, v)$
- `isBlocked`: Boolean flag set dynamically if fire or heavy smoke covers the node

#### B. Collision-Aware Particle Physics & Steering Vector Mathematics
Each occupant is modeled as an autonomous particle with state vector:
$$\mathbf{S}_i = \{ \mathbf{p}_i = (x_i, y_i), \, \mathbf{v}_i = (v_{x,i}, v_{y,i}), \, v_{max, i}, \, r_i, \, \text{state}_i, \, \text{path}_i, \, \text{targetNodeIndex} \}$$

1. **Target Seek Force**:
   $$\mathbf{F}_{seek} = \text{normalize}(\mathbf{p}_{target} - \mathbf{p}_i) \cdot v_{max} - \mathbf{v}_i$$
   When the particle gets within arrival radius $r_{arrival} = 12\text{px}$ of the target waypoint, it advances to the next waypoint in $\text{path}_i$.

2. **Occupant Separation Force (Reynolds Collision Avoidance)**:
   To prevent crowding dots from overlapping in narrow corridors and doors:
   $$\mathbf{F}_{sep} = \sum_{j \neq i, \|\mathbf{p}_i - \mathbf{p}_j\| < 2r_i + 4} \frac{\mathbf{p}_i - \mathbf{p}_j}{\|\mathbf{p}_i - \mathbf{p}_j\|^2} \cdot w_{sep}$$

3. **Wall Repulsion Force**:
   For each line segment wall $W_k$ within obstacle clearance distance $d_{wall} = 8\text{px}$:
   $$\mathbf{F}_{wall} = \mathbf{n}_{wall} \cdot \left(\frac{d_{wall} - d_k}{d_{wall}}\right) \cdot w_{wall}$$

4. **Integration Update (60 FPS Euler Integration)**:
   $$\mathbf{a}_i = \frac{\mathbf{F}_{seek} + \mathbf{F}_{sep} + \mathbf{F}_{wall}}{m_i}$$
   $$\mathbf{v}_i \leftarrow \text{truncate}(\mathbf{v}_i + \mathbf{a}_i \cdot \Delta t, \, v_{max, i})$$
   $$\mathbf{p}_i \leftarrow \mathbf{p}_i + \mathbf{v}_i \cdot \Delta t$$

#### C. Dynamic Smoke & Fire Hazard Propagation and Real-Time Rerouting
When a fire or smoke hazard is injected (via Phone A or interactive canvas click):
1. The hazard grows continuously: $r_{hazard}(t) = \min(R_{max}, \, r_0 + \gamma \cdot \Delta t)$.
2. Any waypoint node $u \in V$ whose distance to hazard center $\|\mathbf{p}_u - \mathbf{p}_{hazard}\| \le r_{hazard}$ is flagged as `isBlocked = true`.
3. An event `HAZARD_REROUTE_TRIGGERED` is fired through the event bus.
4. Each evacuating occupant queries the A* pathfinder from their current nearest waypoint to all reachable exits ($\text{Exit A}$ and $\text{Exit B}$).
5. If their previous target exit is blocked or if the path passes through an active hazard, the shortest unblocked path to the alternative exit is assigned.
6. The particle displays a visual alert (amber $\to$ pulsing red $\to$ redirected amber) and steers dynamically toward the new waypoint path.

#### D. 2.5D Isometric Projection Algorithm (Variant C)
For Variant C (`emergency-tri-screen-c`), world coordinates $(X, Y, Z)$ are mapped to screen space $(X_{iso}, Y_{iso})$ using isometric projection:

$$\begin{aligned}
X_{iso} &= X_{origin} + (X - Y) \cdot \cos(30^\circ) = X_{origin} + (X - Y) \cdot 0.866 \\
Y_{iso} &= Y_{origin} + (X + Y) \cdot \sin(30^\circ) - Z = Y_{origin} + (X + Y) \cdot 0.500 - Z
\end{aligned}$$

- **Depth-Sorting (Painter's Algorithm)**:  
  All visual entities (ground tiles, 3D extruded wall prisms, LED arrows, furniture, particle dots, and smoke plumes) are sorted by render depth:
  $$\text{Depth} = X + Y + 0.001 \cdot Z$$
  before canvas rendering each frame to eliminate z-fighting or clipping artifacts.
- **3D Wall Extrusions**:  
  Walls of height $H = 28\text{px}$ are rendered as 3-polygon isometric blocks with directional shading:
  - Top Face: `#1e3a5f` (Light direct ambient)
  - Left Face: `#0f2137` (Mid shadow)
  - Right Face: `#0a1626` (Deep shadow)

---

### 2.3 State Synchronization Event Bus Architecture

To ensure 100% decoupling and bidirectional reactivity between Left Phone A, Center Canvas Floorplan, and Right Phones B, C, D, each variant features a dual-layer communication event bus.

```typescript
// Architectural Interface Definition for the Emergency Event Bus

interface EmergencyEvent<T = any> {
  id: string;             // UUID or monotonic timestamp
  type: EmergencyEventType;
  timestamp: number;      // Epoch ms
  origin: 'PHONE_A' | 'PHONE_B' | 'PHONE_C' | 'PHONE_D' | 'CANVAS_SIMULATOR' | 'PORTAL';
  payload: T;
}

type EmergencyEventType = 
  | 'ALARM_INITIALIZE'
  | 'ALARM_COUNTDOWN_TICK'
  | 'ALARM_COUNTDOWN_ABORT'
  | 'ALARM_TRIGGERED'
  | 'ALARM_RESET'
  | 'HAZARD_SPAWNED'
  | 'HAZARD_EXTINGUISHED'
  | 'STAIRWELL_STATUS_CHANGED'
  | 'OCCUPANT_CHECKIN_SAFE'
  | 'HEADCOUNT_UPDATE'
  | 'TELEMETRY_BEACON_UPDATE'
  | 'AUDIO_VOICE_BROADCAST';
```

#### Dual-Layer Implementation:
1. **Local Pub/Sub Dispatcher (`LocalEventBus`)**:
   - Uses a lightweight event dispatcher for sub-millisecond in-page message delivery between panels.
2. **Web `BroadcastChannel` API (`BroadcastChannel('flujoweb_emergency_tri_screen')`)**:
   - Enables real-time cross-tab / cross-window synchronization. A user can open Phone A in one browser window and the Floorplan on another monitor, and all state transitions, sirens, and headcount ticks mirror instantly across both tabs.

```javascript
class EmergencySyncBus {
  constructor(channelName = 'flujoweb_emergency_tri_screen') {
    this.channelName = channelName;
    this.subscribers = new Map();
    this.broadcastChannel = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(this.channelName);
        this.broadcastChannel.onmessage = (event) => {
          this.dispatchLocal(event.data.type, event.data, false);
        };
      } catch (e) {
        console.warn('[SyncBus] BroadcastChannel not available:', e);
      }
    }
  }

  on(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);
    return () => this.subscribers.get(eventType).delete(callback);
  }

  emit(eventType, payload = {}, broadcast = true) {
    const event = {
      id: 'EVT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      type: eventType,
      timestamp: Date.now(),
      origin: payload.origin || 'LOCAL',
      payload
    };

    this.dispatchLocal(eventType, event, true);

    if (broadcast && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event);
      } catch (e) {}
    }
  }

  dispatchLocal(eventType, eventData, isLocalOrigin) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).forEach(cb => {
        try { cb(eventData, isLocalOrigin); } catch (err) { console.error(err); }
      });
    }
  }
}
```

---

### 2.4 Procedural Web Audio Synthesizer & Web Speech Engine

To meet the zero-external-asset single-file requirement, all acoustic alarms, radio squelches, haptic ticks, and voice notifications are generated procedurally in the browser.

```javascript
class ProceduralEmergencyAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.sirenOsc = null;
    this.sirenLfo = null;
    this.sirenGain = null;
    this.isSirenActive = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Dual-Tone Modulated Tactical Siren (Variant A & C)
  startTacticalSiren(frequency = 880, modulationDepth = 320, lfoRate = 3.2) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.isSirenActive) return;

    const now = this.ctx.currentTime;
    this.sirenGain = this.ctx.createGain();
    this.sirenGain.gain.setValueAtTime(0.01, now);
    this.sirenGain.gain.linearRampToValueAtTime(0.22, now + 0.3);
    this.sirenGain.connect(this.ctx.destination);

    this.sirenOsc = this.ctx.createOscillator();
    this.sirenOsc.type = 'sawtooth';
    this.sirenOsc.frequency.setValueAtTime(frequency, now);

    this.sirenLfo = this.ctx.createOscillator();
    this.sirenLfo.type = 'sine';
    this.sirenLfo.frequency.setValueAtTime(lfoRate, now);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(modulationDepth, now);

    this.sirenLfo.connect(lfoGain);
    lfoGain.connect(this.sirenOsc.frequency);
    this.sirenOsc.connect(this.sirenGain);

    this.sirenOsc.start(now);
    this.sirenLfo.start(now);
    this.isSirenActive = true;
  }

  stopTacticalSiren() {
    if (!this.isSirenActive || !this.sirenGain) return;
    const now = this.ctx.currentTime;
    this.sirenGain.gain.cancelScheduledValues(now);
    this.sirenGain.gain.linearRampToValueAtTime(0.001, now + 0.35);
    setTimeout(() => {
      if (this.sirenOsc) {
        this.sirenOsc.stop();
        this.sirenLfo.stop();
        this.sirenOsc.disconnect();
        this.sirenLfo.disconnect();
        this.isSirenActive = false;
      }
    }, 400);
  }

  // 2. Minimalist Linear Dark Haptic Click Pulse (Variant B)
  playHapticPulse() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // 3. LoRaWAN ISO Emergency Buzzer Horn
  playLoRaHornBurst() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.18, 0.36].forEach(delay => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(960, now + delay);
      gain.gain.setValueAtTime(0.14, now + delay);
      gain.gain.linearRampToValueAtTime(0.01, now + delay + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.13);
    });
  }

  // 4. VHF Brigade Radio Squelch Burst
  playRadioSquelch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 3.0;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }
}
```

#### Web Speech API Dispatcher:
```javascript
class TacticalVoiceDispatcher {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isMuted = false;
  }

  speak(message, onEndCallback = null) {
    if (this.isMuted || !this.synth) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      this.synth.cancel(); // Flush queue
      if (this.audioEngine) this.audioEngine.playRadioSquelch();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'es-ES';
        utterance.rate = 1.04;
        utterance.pitch = 1.02;
        utterance.volume = 1.0;

        const voices = this.synth.getVoices();
        const esVoice = voices.find(v => v.lang.startsWith('es'));
        if (esVoice) utterance.voice = esVoice;

        if (onEndCallback) utterance.onend = onEndCallback;
        this.synth.speak(utterance);
      }, 120);
    } catch (e) {
      console.warn('[VoiceDispatcher] Speech failed:', e);
      if (onEndCallback) onEndCallback();
    }
  }
}
```

---

### 2.5 Detailed Design Specifications per Variant

| Feature Dimension | Variant A: Tactical Cyberpunk (`emergency-tri-screen-a`) | Variant B: Clean Minimalist Linear Dark (`emergency-tri-screen-b`) | Variant C: 2.5D Isometric Mission Control (`emergency-tri-screen-c`) |
|---|---|---|---|
| **Aesthetic Theme** | Tactical Cyberpunk / Sci-Fi HUD | Apple / Linear Minimalist Slate Dark | 2.5D Isometric Mission Control |
| **Color Palette** | Base: `#030712`, Cyan: `#00f0ff`, Crimson: `#ef4444`, Amber: `#f59e0b` | Base: `#090d16`, Sky: `#38bdf8`, Slate: `#1e293b`, Clean White: `#ffffff` | Base: `#050b14`, Electric Mint: `#00f5d4`, Cobalt: `#0d2238`, Laser Pink: `#ff0054` |
| **Left Panel (Phone A)** | Tactical Cyberpunk Phone: Slide-to-activate trigger with 3s abort ring, FCM/LoRaWAN/VHF channel selectors, manual hazard injector. | Sleek Smartphone (iPhone 16 / Linear style): Concentric haptic pulse trigger, severity pills (Simulacro / Fuego Real / Sismo), egress protocol toggle. | Ruggedized Tactical Tablet: Corner shock bumpers, rotary incident dial (LVL 1-3), Push-To-Talk PA toggle with audio visualizer, zone sequencer. |
| **Center Panel Floorplan** | 2D Top-Down Blueprint: 48 particle occupants, private offices, cubicle bullpen, Breakroom & Server Room hazard spawns with dynamic reroute to Exits A & B. | CAD-Style Vector Blueprint: Room dimensions ($m^2$), fluid particle streams with velocity vectors, live velocity gauges ($m/s$), bottleneck chokepoint heatmaps. | 2.5D Isometric Floorplan: 3D extruded room walls with ambient lighting, glowing directional LED floor guide arrows, outdoor assembly zone, 3D occupant dots. |
| **Right Panel (Phone B)** | Resident Phone: Pulsating red/amber tactical strobe alert, dynamic escape route text, Web Speech voice navigation, "ESTOY A SALVO" action. | Personal Egress Card: Floating card with live SVG rotating escape compass pointing to nearest open exit bearing ($135^\circ$ SE), one-tap safe check-in. | Occupant BLE HUD: Real-time BLE beacon proximity telemetry (`-52 dBm`), distance to exit, emergency SOS beacon broadcaster. |
| **Right Panel (Phone C)** | Safety Brigade Lead Phone: VHF Radio Channel 4, interactive Stairwell A/B status toggles (`CLEAR` / `BLOCKED`), SCBA air pressure telemetry ($4200\text{ PSI}$). | Floor Warden Card: Minimalist checklist of building wings (North, South, Meeting Pods) with one-tap status toggles (`Cleared` / `Searching`). | Brigade Tactical Tablet: Multi-room thermal telemetry, SCBA air gauge ($88\%$), interactive stairwell door pressure seal controls. |
| **Right Panel (Phone D)** | Front Desk / Security: Live assembly point headcount ticker, triage log, RFID/BLE badge stream, instant sync with Phone A. | Executive Safety Tally: Minimalist donut progress chart ($0\% \to 100\%$), real-time safe vs evacuating headcount breakdown. | Outdoor Assembly Hub: Biometric check-in radar scanner, battery telemetry table for all connected field devices, survivor tally. |
| **Acoustic Synthesizer** | Dual-Tone Modulated Warble Siren + LoRa Horn Bursts + Web Speech Alert. | Sub-bass Haptic Click Pulse + Gentle Notification Chimes + Ambient Drone. | Military Warning Horn + VHF Radio Squelch + Voice PA Dispatcher. |

---

### 2.6 Master Launchpad Portal Integration (`sistemas/index.html`)

The master launchpad (`sistemas/index.html`) will be updated by appending the 3 new tri-panel simulators to `SYSTEMS_MANIFEST` under the `🚨 Emergencia` category with live canvas visualizer hooks:

```javascript
// Additions to SYSTEMS_MANIFEST in sistemas/index.html:

{
  id: 'emergency-tri-screen-a',
  name: 'Tactical Cyberpunk Tri-Panel',
  subtitle: 'Slide Trigger • 2D Blueprint • Hazard Reroute • Recipient Strobe',
  category: 'emergencia',
  categoryLabel: '🚨 Emergencia',
  badges: ['Tri-Screen Sync', 'Slide-to-Activate', 'Dynamic Reroute', 'LoRaWAN Strobe', 'Web Speech'],
  description: 'Tactical Cyberpunk 3-panel command simulator. Features slide-to-activate emergency trigger on Phone A, 48 autonomous particle evacuees navigating hallway collisions on the center blueprint, dynamic smoke/fire rerouting, and synchronized recipient mobile alerts on Phones B, C, and D.',
  href: './emergency-tri-screen-a/index.html',
  metrics: { latency: '8ms', sla: '99.999%', rps: '6.4k ev/s' },
  visType: 'tri-panel-cyber'
},
{
  id: 'emergency-tri-screen-b',
  name: 'Clean Minimalist Linear Dark',
  subtitle: 'Haptic Pulse • CAD Blueprint • Fluid Velocity • Egress Compass',
  category: 'emergencia',
  categoryLabel: '🚨 Emergencia',
  badges: ['Linear Dark (#090d16)', 'Haptic Pulse', 'CAD Fluid Stream', 'Egress Compass', 'Tally Sync'],
  description: 'Ultra-refined Apple / Linear minimalist evacuation visualizer. Features haptic pulse activation, CAD architectural floorplan with fluid particle velocity streams, doorway bottleneck heatmaps, and floating mobile cards with live rotating escape compass.',
  href: './emergency-tri-screen-b/index.html',
  metrics: { latency: '6ms', sla: '99.999%', rps: '7.8k ev/s' },
  visType: 'tri-panel-linear'
},
{
  id: 'emergency-tri-screen-c',
  name: '2.5D Isometric Mission Control',
  subtitle: 'Tactical Tablet • 3D Walls • LED Arrows • BLE Beacon Telemetry',
  category: 'emergencia',
  categoryLabel: '🚨 Emergencia',
  badges: ['2.5D Isometric', 'Tactical Tablet', 'LED Floor Arrows', 'BLE Telemetry', 'Survivor Tally'],
  description: 'Next-generation 2.5D isometric emergency command center. Features ruggedized master tactical tablet, 3D extruded room walls with glowing LED floor guide chevrons, outdoor assembly zones, and recipient phones tracking live BLE beacon proximity and battery telemetry.',
  href: './emergency-tri-screen-c/index.html',
  metrics: { latency: '10ms', sla: '99.995%', rps: '5.9k ev/s' },
  visType: 'tri-panel-iso'
}
```

---

## 3. Caveats & Risk Mitigation

1. **Browser Autoplay & Web Audio Permission Policy**:
   - *Constraint*: Modern browsers (Chrome, Edge, Safari) block `AudioContext` from playing sound until a user gesture (click/touch) occurs on the document.
   - *Mitigation*: Audio initialization is deferred to the first user click (e.g. clicking the Emergency Trigger, Mute Toggle, or any UI button). A visual sound badge (`🔊 Audio Ready` / `🔇 Muted`) informs the user of sound status.
2. **Web Speech API Availability & Regional Voice Fallback**:
   - *Constraint*: `window.speechSynthesis` voices load asynchronously (`voiceschanged` event) and might not have a native Spanish voice on some lightweight Linux/Docker environments.
   - *Mitigation*: The voice engine checks `speechSynthesis.getVoices()` dynamically. If Spanish is unavailable, it defaults to the system default voice and always displays an animated tactical HUD voice caption bar as visual redundancy.
3. **Cross-Tab BroadcastChannel Security Boundary**:
   - *Constraint*: `BroadcastChannel` works strictly across tabs sharing the exact same origin (`http://localhost:port` or `file:///`).
   - *Mitigation*: The dual-layer event bus guarantees 100% functionality within the page via in-memory event dispatching while enriching multi-tab experiences whenever supported.
4. **Canvas Coordinate Scaling & High-DPI Displays**:
   - *Constraint*: On Retina / 4K screens, standard canvas elements can appear blurry if `devicePixelRatio` is ignored.
   - *Mitigation*: All canvas renderers must set `canvas.width = rect.width * window.devicePixelRatio` and `ctx.scale(devicePixelRatio, devicePixelRatio)` to ensure razor-sharp rendering.
5. **Mobile Viewport (<768px) Real Estate**:
   - *Constraint*: 3 physical phone mockups and a full floorplan cannot fit horizontally on a 390px mobile screen.
   - *Mitigation*: A responsive bottom navigation bar (`[ 📱 Phone A | 🗺️ Floorplan | 👥 Recipients B/C/D ]`) with smooth tab switching enables mobile users to test every component seamlessly.

---

## 4. Conclusion & Implementation Blueprint

All 3 Tri-Panel Emergency Evacuation variants have been rigorously architected to fulfill the user's vision:
- **Variant A (`emergency-tri-screen-a/index.html`)**: Tactical Cyberpunk command center featuring slide-to-activate trigger, 2D blueprint pathfinding with dynamic Breakroom/Server room fire rerouting, and Phones B/C/D with strobe audio-visual warnings and brigade radio toggles.
- **Variant B (`emergency-tri-screen-b/index.html`)**: Clean Minimalist Linear Dark simulator featuring haptic pulse trigger, CAD fluid velocity streams, doorway chokepoint heatmaps, and floating recipient cards with live dynamic escape compass.
- **Variant C (`emergency-tri-screen-c/index.html`)**: 2.5D Isometric Mission Control featuring tactical master tablet, 3D extruded isometric suites with directional LED guide arrows, and BLE beacon telemetry tracking.

Every variant is self-contained in a single production-ready HTML file with zero external runtime dependencies, 60 FPS Canvas performance, procedural Web Audio sirens, Web Speech voice navigation, and cross-panel BroadcastChannel synchronization.

---

## 5. Verification Method

To independently verify the technical specifications and subsequent implementations:

1. **Static Validation & File Presence**:
   - Verify that all three variant directories and files exist:
     - `sistemas/emergency-tri-screen-a/index.html`
     - `sistemas/emergency-tri-screen-b/index.html`
     - `sistemas/emergency-tri-screen-c/index.html`
   - Verify `sistemas/index.html` contains the 3 new manifest entries and live canvas preview handlers.

2. **Functional Execution & Behavioral Verification**:
   - Serve the directory using any static web server (e.g. `npx serve .` or Python `python -m http.server 8080`) or direct browser open.
   - Test Phone A Emergency Trigger on each variant:
     - *Variant A*: Drag slide trigger to 100% -> observe 3s countdown -> verify alarm broadcasts to Center canvas and Phones B, C, D.
     - *Variant B*: Tap Haptic Pulse button -> select "Fuego Real" -> observe instantaneous fluid particle evacuation and CAD velocity gauge rise.
     - *Variant C*: Rotate Incident Level Dial to LVL 3 -> toggle PA broadcast -> observe 2.5D isometric LED arrows illuminate and occupants evacuate to outdoor zone.
   - Test Dynamic Hazard Rerouting:
     - Click "Inyectar Fuego en Breakroom" -> verify active hazard circle expands -> verify hallway waypoint blocks -> observe evacuating particles recalculate path and divert toward Exit B.
   - Test Recipient Check-In & Headcount Tally:
     - Click "ESTOY A SALVO" on Phone B -> observe Phone D headcount ticker instantly increment and occupant turn green.
   - Test Audio & Voice Synthesizer:
     - Verify procedural siren generates clear dual-tone warble and Web Speech utters the Spanish evacuation advisory.
   - Test Responsive Scaling:
     - Resize browser viewport from 1920px down to 360px -> verify 3-column layout adapts smoothly to 2-column and mobile tabbed view without layout collisions or text clipping.
