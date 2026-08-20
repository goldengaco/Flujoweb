const fs = require('fs');
const path = require('path');

const surveyPath = path.join(__dirname, 'survey.md');

const sections = [];

sections.push(`# Architectural & Technical Survey: Emergency Evacuation Suite ("Salvar Vidas") — R2, R3, R4

**Authoritative Explorer**: explorer_evac_1 (Specification Miner)  
**Target Systems**:
1. **R2**: Master Building Command & Floor Matrix (\`sistemas/emergency-evacuation-v1/index.html\`)
2. **R3**: Mobile Occupant HUD & Dynamic Escape Route (\`sistemas/emergency-evacuation-v2/index.html\`)
3. **R4**: Multi-Carrier Broadcast Fan-Out Engine (\`sistemas/emergency-evacuation-v3/index.html\`)  
**Date**: 2026-08-20  
**Status**: Authoritative Architectural Survey & Specification Complete

---

# SECTION 1: EXECUTIVE SUMMARY & ARCHITECTURAL FOUNDATION

The **Emergency Evacuation Suite ("Salvar Vidas")** is an enterprise-grade, life-critical trio of web applications designed to model, command, navigate, and broadcast emergency response operations during building-wide fires, structural hazards, and mass evacuations. Built to operate in extreme, zero-failure conditions, the suite spans three distinct operational tiers:

1. **Strategic Command Tier (R2 - Evacuation V1)**: Dedicated to Fire Chiefs, Incident Commanders, and Building Safety Directors. Provides macro-level building elevation matrix (Floors 1-12), real-time sensor telemetry (thermal, smoke obscuration, carbon monoxide), occupancy headcount decay tracking (Safe vs Trapped vs Evacuating), interactive room drilldown, and tactical brigade team dispatching.
2. **Tactical Occupant Tier (R3 - Evacuation V2)**: Dedicated to individual building occupants on mobile smartphones. Delivers an instant tactical alarm HUD, synthesized Web Audio sirens, dynamic text-to-speech voice directions in Spanish, an interactive vector blueprint with real-time A* pathfinding that avoids dynamically spawned fire and smoke zones, single-tap "Estoy a Salvo / SOS" beacon check-in, and an offline BLE/Wi-Fi Direct mesh hop simulator.
3. **Infrastructure Telemetry Tier (R4 - Evacuation V3)**: Dedicated to telecom resilience engineers and emergency broadcast operators. Simulates real-time mass broadcast distribution to 5,000+ devices across 4 concurrent carrier channels (FCM/APNs Push, SMS Gateway, Building PA/LoRaWAN Sirens, Brigade Radio Mesh), visualizes high-resolution delivery latency histograms (p50/p95/p99 breakdown with <850ms SLA), and executes real-time circuit breaker failover and exponential-jitter retry routines when carrier outages are injected.

All three systems are engineered as **100% self-contained single-file HTML5/CSS3/ES6+ applications (\`index.html\`)** with zero external JavaScript/CSS dependencies beyond Google Fonts, high-framerate Canvas/SVG visualizers, Web Audio API synthesizers, and zero browser console errors.
`);
sections.push(`---

# SECTION 2: R2 — MASTER BUILDING COMMAND & FLOOR MATRIX (\`sistemas/emergency-evacuation-v1/index.html\`)

## 2.1 UI Layout & High-Density Tactical Wireframe
The Command Center interface is structured as a high-density 4-panel Cyberpunk/Tactical HUD layout:

\`\`\`
+-------------------------------------------------------------------------------------------------------------------+
|  🚨 SALVAR VIDAS // CENTRO DE COMANDO Y CONTROL DE EVACUACIÓN (EDIFICIO TORRE CENTRAL - 12 PISOS)               |
|  [ESTADO GLOBAL: STANDBY / ALERTA ACTIVA] [TIEMPO TRANSCURRIDO: 00:00:00] [ALERTA GENERAL STROBE: OFF/ON]        |
+-------------------------------------------------------------------------------------------------------------------+
| [PANEL 1: MATRIZ DE ELEVACIÓN 12 PISOS] | [PANEL 2: TELEMETRÍA DE CONTEO Y EVACUACIÓN] | [PANEL 3: BRIGADAS]      |
| +-------------------------------------+ | +------------------------------------------+ | +----------------------+ |
| | PISO 12 [35 Pers] [24°C] [0.0% Humo]| | | 👥 CENSO TOTAL: 1,240 Ocupantes          | | | 🚒 BRIGADA ALFA (Fuego) |
| | PISO 11 [62 Pers] [25°C] [0.1% Humo]| | |                                          | | |    Piso 7 - Ala Este |
| | PISO 10 [88 Pers] [24°C] [0.0% Humo]| | | 🟢 A SALVO (Pto Encuentro): 840 (67.7%)  | | |    SCBA: 3,800 PSI   |
| | PISO 9  [95 Pers] [26°C] [0.2% Humo]| | | 🟠 EN EVACUACIÓN (Escaleras): 310 (25.0%) | | |    Estado: COMBATE   |
| | PISO 8  [110 Pers][38°C] [4.2% Humo]| | | 🔴 ATRAPADOS / SOS: 90 (7.3%)             | | +----------------------+ |
| | PISO 7  [145 Pers][92°C] [85.0%🔥 ]| | +------------------------------------------+ | | 🚒 BRIGADA BRAVO (Res) |
| | PISO 6  [120 Pers][42°C] [6.8% Humo]| | | [CURVA DE EVACUACIÓN EN TIEMPO REAL]     | | |    Escalera Norte    |
| | PISO 5  [105 Pers][25°C] [0.1% Humo]| | |  1200|---...                             | | |    SCBA: 4,100 PSI   |
| | PISO 4  [115 Pers][24°C] [0.0% Humo]| | |   800|     \\\\\\\\...                       | | |    Estado: EVACUANDO |
| | PISO 3  [130 Pers][23°C] [0.0% Humo]| | |   400|        \\\\\\\\___                    | | +----------------------+ |
| | PISO 2  [140 Pers][22°C] [0.0% Humo]| | |     0+--------------------------> t (min)| | | 🚒 BRIGADA CHARLIE   |
| | PISO 1  [95 Pers] [22°C] [0.0% Humo]| | +------------------------------------------+ | | 🚒 BRIGADA DELTA     |
| +-------------------------------------+ | | 🚨 BOTÓN MAESTRO DE BROADCAST:           | | | 🚒 BRIGADA ECO (Triage)|
| [🔍 CLICK EN PISO PARA DRILLDOWN ROOM]| | | [ DESPLEGAR ALERTA DE EVACUACIÓN ]       | | +----------------------+ |
+-------------------------------------------------------------------------------------------------------------------+
| [PANEL 4: CONSOLA DE AUDITORÍA Y REGISTRO CRONOLÓGICO DE EVENTOS EN VIVO (ANSI LIVE LOG STREAM)]                  |
+-------------------------------------------------------------------------------------------------------------------+
\`\`\`

## 2.2 12-Floor Building Elevation Matrix & Sensor Telemetry
The building model features 12 above-ground floors plus roof access and basement assembly exits.

### Floor Data Structure:
\`\`\`typescript
interface BuildingFloor {
  floorNumber: number;          // 1 to 12
  name: string;                 // 'Piso 1 - Lobby', 'Piso 7 - Finanzas / TI', etc.
  totalCapacity: number;        // Max capacity (e.g. 150)
  currentOccupants: number;     // Live active occupants (e.g. 145)
  safeOccupants: number;        // Occupants arrived at assembly point
  transitOccupants: number;     // Occupants in stairwells
  trappedOccupants: number;     // Occupants with SOS or blocked
  temperature: number;          // Mean floor temperature in °C (22°C to 120°C)
  smokeObscuration: number;     // Smoke optical density %/m (0.0% to 100.0%)
  coPpm: number;                // Carbon monoxide parts per million (0 to 500 ppm)
  status: FloorStatus;          // 'NORMAL' | 'ADVISORY' | 'EVACUATING' | 'CRITICAL_FIRE' | 'CLEARED'
  alarmActive: boolean;         // Siren & strobe active on floor
  sprinklersActive: boolean;    // Automatic fire suppression active
  stairwellAStatus: 'CLEAR' | 'SMOKE_WARNING' | 'BLOCKED';
  stairwellBStatus: 'CLEAR' | 'SMOKE_WARNING' | 'BLOCKED';
  elevatorStatus: 'LOCKED_GROUND' | 'OUT_OF_SERVICE';
  rooms: FloorRoom[];
}

interface FloorRoom {
  roomId: string;               // e.g. 'R701', 'R702', 'R703_SERVER', 'R704_RESTROOM'
  name: string;                 // 'Sala de Servidores', 'Open Space Este', 'Oficina Director'
  wing: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
  occupantsCount: number;
  temp: number;                 // °C
  smoke: number;                // %
  status: 'CLEAR' | 'ALERT' | 'HAZARD' | 'SOS_TRAPPED';
  occupants: OccupantRecord[];
}

interface OccupantRecord {
  id: string;
  name: string;
  deviceToken: string;
  status: 'SAFE' | 'EVACUATING' | 'SOS_TRAPPED' | 'SOS_INJURED' | 'UNREACHABLE';
  lastPing: number;
  coordinates: { x: number; y: number; room: string };
  batteryPct: number;
}
\`\`\`

### Floor Status State Machine:
1. \`NORMAL\` (Green glow \`#10b981\`, Temp 20-26°C, Smoke < 1%, CO < 10 ppm)
2. \`ADVISORY\` (Amber glow \`#f59e0b\`, Temp 27-45°C, Smoke 1-15%, CO 10-50 ppm)
3. \`EVACUATING\` (Orange glow \`#f97316\`, Evacuation order acknowledged, occupants moving toward stairwells)
4. \`CRITICAL_FIRE\` (Pulsing Crimson glow \`#ef4444\`, Temp > 60°C, Smoke > 30%, Sprinklers triggered)
5. \`CLEARED\` (Cyan glow \`#06b6d4\`, 0 remaining occupants on floor, inspected by brigade)

## 2.3 Evacuation Headcount Decay Physics & Real-Time Flow Dynamics
The simulation models realistic building evacuation kinetics through stairwell bottlenecks.

### Mathematical Evacuation Model:
The rate of people reaching the safe assembly point follows a multi-compartment fluid flow model:

$$\\frac{dN_{\\text{floor}}}{dt} = - \\sum_{s \\in \\{A, B\\}} Q_s(t) \\cdot \\Phi_s(\\text{hazard})$$

where:
- $Q_s(t)$ is the stairwell discharge flow capacity (typically 1.2 to 1.5 persons/second per meter width).
- $\\Phi_s(\\text{hazard})$ is the impedance factor (1.0 if clear, 0.4 if smoke warning, 0.0 if blocked).
- $N_{\\text{safe}}(t) = N_0 - N_{\\text{transit}}(t) - N_{\\text{trapped}}(t) - N_{\\text{floor}}(t)$.

### Interactive Decay Controls:
- **Evacuation Rate Multiplier Slider**: $0.5\\times$ (Slow/Elderly/Disabled), $1.0\\times$ (Standard Flow), $2.0\\times$ (Rapid/Drill).
- **Stairwell Failure Injection**: Clicking Stairwell A or B injects a smoke blockage, instantly halving egress capacity and increasing $N_{\\text{trapped}}$.

## 2.4 Master Broadcast Button & Strobe Synthesis
- **DOM Element**: \`<button id="btn-master-broadcast" class="tactical-broadcast-btn">\`
- **Master Activation Sequence**:
  1. Click triggers a tactical confirmation safeguard modal with a 3-second abort countdown.
  2. Upon confirmation, the entire Command Center enters \`STATE_ACTIVE_EVACUATION\`.
  3. Visual Strobe: Screen perimeter and floor cards flash with an intense synchronized emergency strobe (\`@keyframes tactical-strobe\` at 4 Hz).
  4. Audio Alarm Synthesis: Triggers the Web Audio API Command Siren synthesizer (see Section 2.7).
  5. WebSocket / Worker broadcast dispatch triggers all 12 floors into \`EVACUATING\` mode.

## 2.5 Brigade Dispatcher Console
The Incident Commander can assign 5 specialized Brigade Teams to floors, stairwells, or specific hazard zones:

| Brigade ID | Callsign | Specialization | Initial Assignment | Personnel | SCBA Air Supply | Thermal Reading | Status |
|---|---|---|---|---|---|---|---|
| \`brig-alpha\` | 🚒 **Brigada Alfa** | Fire Suppression & Hose Lines | Piso 7 - Ala Este | 4 Bomberos | 4,200 PSI | 88.5°C | \`SUPPRESSING\` |
| \`brig-bravo\` | 🦺 **Brigada Bravo** | Search & Rescue / Extraction | Piso 7 - Escalera Norte | 4 Rescatistas | 4,050 PSI | 42.0°C | \`SEARCH_RESCUE\` |
| \`brig-charlie\`| 🚪 **Brigada Charlie**| Stairwell Triage & Crowd Flow | Piso 4 - Escalera Sur | 3 Paramédicos | 4,400 PSI | 24.1°C | \`TRIAGE_FLOW\` |
| \`brig-delta\`  | 🚑 **Brigada Delta**  | Medical Staging & First Aid | Planta Baja / Punto A | 5 Médicos | N/A (Ground) | 22.0°C | \`STAGING\` |
| \`brig-echo\`   | 💨 **Brigada Eco**    | HazMat & Smoke Ventilation | Piso 8 - Techo Ductos | 3 Técnicos | 3,900 PSI | 35.8°C | \`VENTILATING\` |

### Interactive Actions:
- **Click-to-Reassign**: Select brigade -> Select Floor 1-12 or Stairwell A/B.
- **Status Toggle**: \`STANDBY\` $\\rightarrow$ \`EN ROUTE\` $\\rightarrow$ \`ON SCENE\` $\\rightarrow$ \`EVACUATING_CIVILIANS\` $\\rightarrow$ \`RETREAT\`.
- **Radio Telemetry Link**: Emits simulated encrypted voice transcripts in the live terminal log.

## 2.6 Floor Drilldown Modal & Room-Level Inspector
Clicking any floor in the matrix opens a high-resolution Vector/DOM Room Layout Modal:
- Shows Rooms 701, 702, 703 (Server Room), 704 (Restrooms), 705 (Executive Office), 706 (Open Space East), 707 (Open Space West), 708 (Kitchen).
- Real-time heat distribution gradient overlay across rooms.
- List of registered occupants with individual status badges:
  - 🟢 Juan Pérez (R702) - \`A SALVO\` (GPS Beacon verified at Punto Encuentro)
  - 🟠 María Gómez (R706) - \`EN ESCALERA B\` (BLE Beacon Floor 4)
  - 🔴 Carlos Vega (R703) - \`SOS ATRAPADO\` (Alerta: Humo bloquea puerta)

## 2.7 Web Audio API Siren Synthesizer for Command Center
\`\`\`javascript
class CommandSirenSynthesizer {
  constructor() {
    this.ctx = null;
    this.oscillator = null;
    this.lfo = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);
  }

  startAlarm() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.isPlaying) return;

    const now = this.ctx.currentTime;
    
    // Dual Tone Warble Siren
    this.oscillator = this.ctx.createOscillator();
    this.oscillator.type = 'sawtooth';
    this.oscillator.frequency.setValueAtTime(800, now);

    // LFO Modulation (Warble effect: 3.5 Hz oscillation between 700Hz and 1100Hz)
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(3.5, now);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, now);

    this.lfo.connect(this.oscillator.frequency);
    this.oscillator.connect(this.gainNode);

    // Fade in
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(0.01, now);
    this.gainNode.gain.linearRampToValueAtTime(0.25, now + 0.3);

    this.oscillator.start(now);
    this.lfo.start(now);
    this.isPlaying = true;
  }

  stopAlarm() {
    if (!this.isPlaying || !this.gainNode) return;
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.linearRampToValueAtTime(0.001, now + 0.4);
    setTimeout(() => {
      if (this.oscillator) {
        this.oscillator.stop();
        this.lfo.stop();
        this.oscillator.disconnect();
        this.lfo.disconnect();
        this.isPlaying = false;
      }
    }, 450);
  }
}
\`\`\`
`);
sections.push(`---

# SECTION 3: R3 — MOBILE OCCUPANT HUD & DYNAMIC ESCAPE ROUTE (\`sistemas/emergency-evacuation-v2/index.html\`)

## 3.1 Mobile Viewport & Tactical HUD Layout
The occupant mobile interface is designed as an ultra-high-contrast tactical mobile HUD optimized for low-light, smoky environments (390px $\\times$ 844px centered mobile container or responsive fullscreen):

\`\`\`
+-------------------------------------------------------------+
|  📶 MESH: 4 HOPS  | 📍 PISO 7 - ALA ESTE | 🔋 88% | 18:04:12 |
+-------------------------------------------------------------+
|  ⚠️ [ALERTA DE EMERGENCIA: EVACUACIÓN INMEDIATA] ⚠️        |
|  🔥 INCENDIO DETECTADO EN SECTOR ESTE - PISO 7               |
|  🚶 RUTA SUGERIDA: SALIDA NORTE (ESCALERA A)                |
+-------------------------------------------------------------+
|  [CANVAS VECTORIAL INTERACTIVO: PLANO DINÁMICO PISO 7]      |
|  +--------------------------------------------------------+ |
|  | [🚪 SALIDA A (LIBRE) 🟢]         [🚪 SALIDA B (HUMO) 🔴]| |
|  |     |                                                  | |
|  |     v [🟢 RUTA SEGURA CALCULADA POR A*]                | |
|  |   ┌───┐   ┌───┐   ┌───┐   ┌───┐                        | |
|  |   │701│   │702│   │703│🔥 │704│                        | |
|  |   └───┘   └───┘   └───┘   └───┘                        | |
|  |     ^               [💨 HUMO]                          | |
|  |     │                                                  | |
|  |   [🚶 TÚ ESTÁS AQUÍ] 🧯 [EXTINTOR] 🩹 [BOTIQUÍN]       | |
|  +--------------------------------------------------------+ |
|  [⚡ CLICK EN EL MAPA PARA GENERAR FUEGO/HUMO Y RE-CALCULAR]|
+-------------------------------------------------------------+
|  🔊 SIRENA: [ACTIVADA 🔊]   🗣️ VOZ: [REPETIR INSTRUCCIÓN 🔁]|
+-------------------------------------------------------------+
|  [BOTONES DE ACCIÓN RÁPIDA DE SUPERVIVENCIA]                |
|  +-----------------------------+ +------------------------+ |
|  |  🟢 ¡ESTOY A SALVO!         | |  🚨 REPORTAR SOS       | |
|  |  (Transmitir Coordenadas)   | |  (Atrapado / Herido)   | |
|  +-----------------------------+ +------------------------+ |
|  +--------------------------------------------------------+ |
|  |  📡 SIMULADOR DE MESH OFFLINE (BLE / WI-FI DIRECT)     | |
|  |  [Tu Móvil] -> [Nodo #704] -> [Relay A] -> [Master GW] | |
|  +--------------------------------------------------------+ |
+-------------------------------------------------------------+
\`\`\`

## 3.2 Dynamic Web Audio Siren & Text-to-Speech Voice Engine
Occupants receive dual sensory guidance: acoustic siren pulses and synthesized voice directions.

### Web Speech API Text-to-Speech Engine:
\`\`\`javascript
class TacticalVoiceAlert {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isMuted = false;
  }

  speakInstruction(text, priority = 'HIGH') {
    if (!this.synth || this.isMuted) return;
    this.synth.cancel(); // Abort previous speech immediately

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; // Spanish voice alert
    utterance.rate = 1.05;    // Urgent, clear pace
    utterance.pitch = 1.1;    // High intelligibility in noisy environments
    utterance.volume = 1.0;

    // Select Spanish voice if available
    const voices = this.synth.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es')) || voices[0];
    if (spanishVoice) utterance.voice = spanishVoice;

    this.synth.speak(utterance);
    this.currentUtterance = utterance;
  }

  repeatStandardEvacuation() {
    this.speakInstruction(
      "¡Atención! Alerta de emergencia en Piso 7. Fuego detectado en el Sector Este. " +
      "Siga la ruta verde hacia la Escalera Norte. No utilice los ascensores. Manténgase agachado para evitar el humo."
    );
  }

  speakRerouteAlert(blockedExitName, newExitName) {
    this.speakInstruction(
      \`¡Peligro! \${blockedExitName} ha sido bloqueada por humo denso. Re-calculando ruta. Diríjase inmediatamente a la \${newExitName}.\`
    );
  }
}
\`\`\`

## 3.3 Vector Blueprint Floorplan & Canvas Schema
The floorplan is rendered on an HTML5 \`<canvas id="floorplan-canvas">\` supporting high-DPI retina rendering, dynamic hazard particle emitters, glowing path strokes, and interactive click-to-hazard placement.

### Blueprint Grid Coordinate System:
- **Grid Dimensions**: 24 columns $\\times$ 16 rows (Grid cell size: $\\approx 20\\text{px} \\times 20\\text{px}$).
- **Walkable Corridors**: Defined as passable nodes in the navigation graph.
- **Static Obstacles**: Office walls, meeting rooms, structural columns, locked electrical closets.
- **Life Safety Assets**:
  - 🧯 Fire Extinguishers (\`type: 'EXTINGUISHER'\`, coords: \`[{x: 3, y: 5}, {x: 18, y: 11}]\`)
  - 🩹 First Aid Kits (\`type: 'FIRST_AID'\`, coords: \`[{x: 6, y: 2}, {x: 20, y: 8}]\`)
  - 🚨 Manual Pull Stations (\`type: 'PULL_STATION'\`, coords: \`[{x: 1, y: 1}, {x: 22, y: 1}]\`)
  - 🚪 Emergency Exits:
    - **Salida A (Escalera Norte)**: \`{x: 2, y: 1, name: 'Escalera Norte (Salida A)', status: 'CLEAR'}\`
    - **Salida B (Escalera Sur)**: \`{x: 21, y: 14, name: 'Escalera Sur (Salida B)', status: 'BLOCKED_SMOKE'}\`

## 3.4 Dynamic A* (A-Star) Pathfinding Algorithm with Hazard Cost Maps
When the occupant navigates the floor, the engine computes the optimal escape route. If a hazard (fire/smoke) appears or is clicked by the user, the path dynamically reroutes around the danger.

### Algorithm Formulation:
Each node $n = (x, y)$ in the grid has:
- $g(n)$: Exact path cost from user start node to $n$.
- $h(n)$: Euclidean heuristic distance to the target Exit $E = (x_e, y_e)$:
  $$h(n) = \\sqrt{(x - x_e)^2 + (y - y_e)^2}$$
- $f(n) = g(n) + h(n)$.
- $C_{\\text{hazard}}(n)$: Dynamic hazard penalty added to traversal cost:
  - Clear corridor: $C = 1.0$
  - Low smoke aura: $C = 15.0$
  - Dense smoke cloud: $C = 80.0$
  - Active flame / Structural collapse: $C = \\infty$ (Walkable = false)

### Complete A* Implementation Specification:
\`\`\`javascript
class DynamicAStarNavigator {
  constructor(gridWidth, gridHeight, gridMap) {
    this.width = gridWidth;
    this.height = gridHeight;
    this.grid = gridMap; // 2D array of Node objects
  }

  findOptimalPath(startX, startY, exits, hazardMap) {
    let bestPath = null;
    let lowestCost = Infinity;

    for (const exit of exits) {
      if (exit.status === 'BLOCKED') continue;

      const pathResult = this.computeAStar(startX, startY, exit.x, exit.y, hazardMap);
      if (pathResult && pathResult.totalCost < lowestCost) {
        lowestCost = pathResult.totalCost;
        bestPath = {
          exitTarget: exit,
          path: pathResult.path,
          cost: lowestCost
        };
      }
    }
    return bestPath;
  }

  computeAStar(startX, startY, targetX, targetY, hazardMap) {
    const openSet = [];
    const closedSet = new Set();
    const startNode = { x: startX, y: startY, g: 0, h: 0, f: 0, parent: null };

    openSet.push(startNode);
    const nodeKey = (x, y) => \`\${x},\${y}\`;

    while (openSet.length > 0) {
      // Find node with lowest f cost
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) currentIndex = i;
      }
      const current = openSet.splice(currentIndex, 1)[0];

      // Target reached?
      if (current.x === targetX && current.y === targetY) {
        const path = [];
        let curr = current;
        while (curr) {
          path.push({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        return { path: path.reverse(), totalCost: current.g };
      }

      closedSet.add(nodeKey(current.x, current.y));

      // 4-directional or 8-directional neighbors
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const neighbor of neighbors) {
        if (neighbor.x < 0 || neighbor.x >= this.width || neighbor.y < 0 || neighbor.y >= this.height) continue;
        if (closedSet.has(nodeKey(neighbor.x, neighbor.y))) continue;

        // Check if wall
        if (this.grid[neighbor.y][neighbor.x].isWall) continue;

        // Check hazard
        const hazard = hazardMap[neighbor.y]?.[neighbor.x] || { type: 'NONE', cost: 0 };
        if (hazard.type === 'FIRE' || hazard.type === 'BLOCKED') continue; // Impassable

        const stepCost = 1.0 + hazard.cost;
        const tentativeG = current.g + stepCost;

        let existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
        if (!existing) {
          const h = Math.hypot(neighbor.x - targetX, neighbor.y - targetY);
          const newNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h: h,
            f: tentativeG + h,
            parent: current
          };
          openSet.push(newNode);
        } else if (tentativeG < existing.g) {
          existing.g = tentativeG;
          existing.f = tentativeG + existing.h;
          existing.parent = current;
        }
      }
    }
    return null; // No safe path found
  }
}
\`\`\`

## 3.5 Beacon Check-in Telemetry ("Estoy a Salvo" / "SOS Emergency")
The mobile HUD provides two prominent life-critical action triggers:

### 1. "¡ESTOY A SALVO!" (I'm Safe) Action:
- Transmits an encrypted status payload to Master Command:
  \`\`\`json
  {
    "event": "OCCUPANT_CHECKIN_SAFE",
    "occupantId": "OCC-7049",
    "userName": "Dr. Elena Rostova",
    "deviceModel": "Pixel 8 Tactical Mesh Edition",
    "timestamp": 1771545852912,
    "verifiedLocation": {
      "status": "ASSEMBLY_POINT_A",
      "latitude": -12.046374,
      "longitude": -77.042793,
      "bleBeaconId": "BCN-EXT-NORTH-01",
      "rssi": -42
    },
    "batteryPct": 88
  }
  \`\`\`
- UI transitions into a serene Glowing Safe Emerald state with a digital check-in certificate and safe staging instructions.

### 2. "REPORTAR EMERGENCIA / SOS" Drawer:
- Clicking opens a high-contrast emergency triage sheet with 4 instantaneous one-tap report types:
  1. 🔴 **Fuego Directo**: "Fuego cortando el pasillo principal."
  2. 💨 **Humo Asfixiante**: "Visibilidad nula, incapacidad de avanzar."
  3. 🚑 **Persona Atrapada / Herida**: "Compañero inconsciente en Sala 703."
  4. 🚧 **Salida Colapsada**: "Escalera de emergencia bloqueada por escombros."
- Emits urgent priority SOS beacon with continuous GPS/BLE coordinate pings.

## 3.6 Offline Mesh Network Simulator (BLE / Wi-Fi Direct)
If the primary 5G/LTE cellular tower fails or is disabled via an interactive toggle, the HUD demonstrates offline peer-to-peer mesh survivability:
- **Mesh Topology**: 4 Multi-Hop nodes:
  1. \`[Tu Móvil (Nodo #7049)]\` — RSSI: \`-54 dBm\`
  2. \`[Dispositivo Par #7082]\` — BLE 5.3 Mesh Relay (Hop 1, +22ms)
  3. \`[Repetidor Escalera A (Nodo IoT)]\` — LoRa/Wi-Fi Direct (Hop 2, +45ms)
  4. \`[Pasarela Maestra / Antena Satelital Starlink]\` — (Hop 3, +85ms)
- **Visual Mesh Canvas / SVG**: Shows animated pulsing data packets traversing peer nodes with packet loss recovery and automatic routing around dropped peers.
`);
sections.push(`---

# SECTION 4: R4 — MULTI-CARRIER BROADCAST FAN-OUT ENGINE (\`sistemas/emergency-evacuation-v3/index.html\`)

## 4.1 UI Layout & Fan-Out Architecture
The Fan-Out Telemetry Cockpit monitors high-volume mass-notification distribution to 5,000+ simultaneous recipients across 4 parallel carrier networks:

\`\`\`
+-------------------------------------------------------------------------------------------------------------------+
|  📡 MOTOR DE BROADCAST MULTI-CARRIER // TELEMETRÍA DE FAN-OUT MASIVO (5,000+ DISPOSITIVOS)                       |
|  [TOTAL OBJETIVO: 5,000] [ENTREGADOS: 4,992 (99.84%)] [LATENCIA P99: 782 ms] [CIRCUIT BREAKER: CLOSED / HEALTHY] |
+-------------------------------------------------------------------------------------------------------------------+
| [PANEL 1: 4 CANALES DE TRANSMISIÓN]    | [PANEL 2: PARTÍCULAS CANVAS 5,000 DISPOSITIVOS] | [PANEL 3: HISTOGRAMA]   |
| +------------------------------------+ | +---------------------------------------------+ | +---------------------+ |
| | 📱 CANAL 1: FCM / APNS PUSH        | | | [CANVAS DE ALTA DENSIDAD 5,000 MICRONODOS]  | | | HISTOGRAMA DE       |
| |   Target: 2,400 | Delivered: 2,398 | | |   🟢 Delivered (4,992)                      | | | DISTRIBUCIÓN (ms)   |
| |   Latencia: 320 ms | SLA: 99.9%    | | |   🟠 In Flight (4)                          | | |   100ms: █ 450      |
| |   Estado: 🟢 ÓPTIMO                | | |   🔴 Failed (4)                             | | |   250ms: ████ 1820  |
| +------------------------------------+ | |   🔷 Retried / Failover (8)                 | | |   400ms: █████ 2100 |
| | 💬 CANAL 2: SMS GATEWAY (SMPP/SNS) | | +---------------------------------------------+ | |   650ms: █ 520      |
| |   Target: 1,800 | Delivered: 1,796 | | | [MÉTRICAS ESTADÍSTICAS EN TIEMPO REAL]      | | |   850ms: ▏ 92       |
| |   Latencia: 680 ms | SLA: 99.7%    | | |   Media (μ): 384 ms                         | | |  >1000ms: ▏ 18 (p99)|
| |   Estado: 🟢 ÓPTIMO                | | |   Desv. Est (σ): 142 ms                     | | +---------------------+ |
| +------------------------------------+ | |   P50: 310 ms  |  P90: 590 ms               | | | [CHAOS / FAILOVER]  |
| | 🔊 CANAL 3: MEGAFONÍA IP & LORAWAN | | |   P95: 680 ms  |  P99: 782 ms (SLA PASS ✅)  | | | [⚡ Inject Latency] |
| |   Target: 144 | Delivered: 144     | | +---------------------------------------------+ | | [💣 Kill SMS Gateway]|
| |   Latencia: 120 ms | SLA: 100.0%   | | | [⚡ DISPARAR SIMULACIÓN DE BROADCAST MASIVO]| | | [🔄 Trigger Failover]|
| |   Estado: 🟢 ÓPTIMO                | | +---------------------------------------------+ | +---------------------+ |
| +------------------------------------+ |                                                                           |
| | 📻 CANAL 4: RADIO BRIGADAS (P25)   | |                                                                           |
| |   Target: 32 | Delivered: 32       | |                                                                           |
| |   Latencia: 45 ms | SLA: 100.0%    | |                                                                           |
| |   Estado: 🟢 ÓPTIMO                | |                                                                           |
+-------------------------------------------------------------------------------------------------------------------+
| [PANEL 4: REGISTRO DE EVENTOS DE RED, REINTENTOS EXPONENCIALES Y CIRCUIT BREAKER FAILS]                          |
+-------------------------------------------------------------------------------------------------------------------+
\`\`\`

## 4.2 4-Channel Mass Alert Distribution Pipeline

| Canal # | Identificador | Protocolo & Backing Infra | Población Objetivo | Latencia Base (ms) | Jitter (ms) | Tasa de Éxito Base | Mecanismo de Failover |
|---|---|---|---|---|---|---|---|
| **Canal 1** | \`chan-fcm-apns\` | 📱 **FCM / APNs Push** (Google Cloud Pub/Sub $\\rightarrow$ HTTP/2 Push) | 2,400 Smartphones | 280 – 420 ms | $\\pm 60\\text{ ms}$ | 99.92% | Re-encolar a SMS si push token expira |
| **Canal 2** | \`chan-sms\` | 💬 **SMS Gateway Masivo** (SMPP v3.4 / AWS SNS / Twilio) | 1,800 Líneas Móviles | 450 – 850 ms | $\\pm 180\\text{ ms}$| 99.65% | Desvío automático a FCM + PA si latencia > 1.2s |
| **Canal 3** | \`chan-pa-lora\` | 🔊 **Megafonía IP & Sirenas LoRaWAN** (Multicast RTP / 868MHz LoRa) | 48 Zonas PA + 96 Balizas | 80 – 180 ms | $\\pm 25\\text{ ms}$ | 99.99% | Batería de respaldo y retransmisión RF |
| **Canal 4** | \`chan-radio-p25\`| 📻 **Radio Digital de Brigadas** (P25 Phase 2 / TETRA / DMR Trunking)| 32 Terminales Brigada | 25 – 65 ms | $\\pm 10\\text{ ms}$ | 100.00% | Canales tácticos directos punto a punto |

## 4.3 5,000+ Device Micro-Node Particle Canvas Visualizer
The dashboard uses an optimized HTML5 Canvas particle rendering engine to simulate 5,000 individual devices in real time at 60 FPS without memory leaks or frame drops.

### Visualizer Architecture:
- **Node Representation**: Array of 5,000 lightweight objects or typed Float32 arrays:
  \`\`\`typescript
  interface DeviceNode {
    id: number;
    channel: 0 | 1 | 2 | 3;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    status: 'QUEUED' | 'IN_FLIGHT' | 'DELIVERED' | 'FAILED' | 'RETRIED';
    sendTimestamp: number;
    deliveredTimestamp: number;
    latencyMs: number;
    retries: number;
  }
  \`\`\`
- **Spatial Arrangement**: 4 quadrant rings representing FCM/APNs (top-left), SMS (top-right), Building PA (bottom-left), and Brigade Radio (bottom-right).
- **Color Codes**:
  - \`QUEUED\`: Dim Slate \`#475569\`
  - \`IN_FLIGHT\`: Pulsing Amber \`#f59e0b\`
  - \`DELIVERED\`: Luminous Emerald \`#10b981\`
  - \`FAILED\`: Sharp Crimson \`#ef4444\`
  - \`RETRIED / FAILOVER\`: Cyber Cyan \`#06b6d4\`

## 4.4 Latency Distribution Histogram & Statistical Telemetry
The latency histogram decomposes delivery timing into 15 discrete bins ($0-100\\text{ms}$, $100-200\\text{ms}$, ..., $>1400\\text{ms}$) with dynamic percentile lines:

### Statistical Calculations:
- **Mean Latency**: $\\mu = \\frac{1}{N} \\sum_{i=1}^N L_i$
- **Standard Deviation**: $\\sigma = \\sqrt{\\frac{1}{N} \\sum_{i=1}^N (L_i - \\mu)^2}$
- **Percentiles ($p50, p90, p95, p99$)**: Calculated using nearest-rank or linear interpolation on sorted latency values.
- **SLA Target Verification**:
  $$\\text{SLA Compliance (\\%)} = \\frac{\\text{Count}(L_i \\le 850\\text{ ms})}{N_{\\text{delivered}}} \\times 100\\% \\ge 99.8\\%$$

## 4.5 Chaos Injection, Circuit Breaker & Failover Engine
The dashboard includes an interactive Chaos Engineering control deck to validate system resilience:

### Chaos Toggles:
1. **SMS Gateway Latency Spike (+1,500 ms)**: Simulates mobile carrier queuing congestion.
2. **Push Notification Droprate (30% Packet Loss)**: Simulates cloud APNs connection throttling.
3. **Severe Carrier Outage (Kill SMS Gateway)**: Simulates total SMPP carrier disconnect.

### Circuit Breaker State Machine:
\`\`\`
        [Normal Traffic]
               │
               ▼
      ┌─────────────────┐       Error Rate > 15% OR
      │     CLOSED      │ ────> Latency > 1,200 ms ────┐
      │  (All Normal)   │                              │
      └─────────────────┘                              ▼
               ▲                             ┌───────────────────┐
               │                             │       OPEN        │
       Trial Successful                      │ (Carrier Tripped /│
               │                             │ Instant Failover) │
               │                             └───────────────────┘
      ┌─────────────────┐                              │
      │    HALF-OPEN    │ <──── 3.0s Reset Timer ──────┘
      │ (Trial Packets) │
      └─────────────────┘
\`\`\`

### Automated Failover Routine:
When SMS trips into \`OPEN\` state:
1. Circuit breaker halts SMS pipeline within 150 ms.
2. 1,800 pending mobile messages are dynamically converted to high-priority FCM Push + LoRaWAN broadcast.
3. Failover latency increases by only $+45\\text{ ms}$ while preserving 100% message delivery.
4. Live ANSI log displays: \`[CIRCUIT_BREAKER_TRIP] Carrier 'SMS-SMPP' error rate exceeded threshold (24.2%). Rerouting 1,800 packets to FCM_PUSH & LORAWAN_PA.\`
`);
sections.push(`---

# SECTION 5: SHARED DESIGN TOKENS, HUD COLOR PALETTE & ASSETS

All three applications share a consistent, high-contrast Cyberpunk / Tactical HUD visual language:

## 5.1 Color Palette Tokens
\`\`\`css
:root {
  /* Core Backgrounds */
  --bg-primary: #0a0e17;
  --bg-secondary: #111827;
  --bg-panel: #161f30;
  --bg-card: #1e293b;
  --border-hud: #2a3b55;
  --border-active: #00e5ff;

  /* Tactical Alert Palette */
  --hazard-crimson: #ef4444;
  --hazard-fire-orange: #f97316;
  --hazard-amber-warn: #f59e0b;
  --safe-emerald: #10b981;
  --safe-bright-green: #00ff88;
  --cyber-cyan: #00e5ff;
  --matrix-teal: #06b6d4;
  --tactical-blue: #3b82f6;
  --mesh-purple: #a855f7;

  /* Typography */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}
\`\`\`

## 5.2 Glowing Effects & Visual Polishing
- **Permanent Glowing Accents**: \`box-shadow: 0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2);\`
- **Monospace Telemetry Counters**: Tabular numbers for jitter-free live metric rendering.
- **Glassmorphic Tactical Panels**: \`backdrop-filter: blur(8px); background: rgba(22, 31, 48, 0.85);\`
- **Strobe Keyframes**: Synchronized CSS animations with zero CPU/GPU overhead.

---

# SECTION 6: FEATURES DISCOVERED INVENTORY

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | R2 Command | 12-Floor Interactive Building Matrix | Visual occupancy heat map across floors 1-12 with thermal, smoke (%/m), and CO sensor telemetry | Floor click, zone filter | Active floor cards, color-coded alert status, occupancy count | Falls back to default floor 1 if invalid index | ORIGINAL_REQUEST.md & Spec Probe |
| 2 | R2 Command | Master Evacuation Broadcast Trigger | "DESPLEGAR ALERTA DE EVACUACIÓN" button with full-screen tactical strobe pulse and audio siren | User click, modal confirmation | Building-wide state transition to \`EVACUATING\`, strobe animation, siren start | Requires explicit modal confirmation to prevent accidental misfire | ORIGINAL_REQUEST.md & Spec Probe |
| 3 | R2 Command | Live Headcount Tracker & Decay Dynamics | Real-time tally of Safe at Assembly Point vs Evacuating in Stairs vs Trapped with room drilldown | Evacuation clock ticks, stairwell bottlenecks | Animated counter metrics, dynamic line graph curve | Clamps safe count $\\le$ initial population | ORIGINAL_REQUEST.md & Spec Probe |
| 4 | R2 Command | Brigade Dispatcher Console | Assigns 5 specialized Fire & Rescue brigades to specific floors and stairwells with SCBA telemetry | Drag/click brigade card to floor | Assigned status badge, route marker, live dispatch log | Prevents assigning multiple brigades to same exhausted zone without warning | ORIGINAL_REQUEST.md & Spec Probe |
| 5 | R2 Command | Room-Level Floor Drilldown Modal | High-density vector room inspector showing rooms 701-708, individual occupant statuses and BLE pings | Click on floor card | Modal overlay with room grid, temperature gradient, occupant list | Closes cleanly on Esc or backdrop click | ORIGINAL_REQUEST.md & Spec Probe |
| 6 | R3 Mobile | Tactical Mobile HUD & Strobe Banner | High-visibility mobile occupant interface with pulsing hazard chevron banner and floor badge | Device viewport, evacuation state | Fullscreen tactical alert HUD, status bar | Graceful scaling on mobile and desktop viewports | ORIGINAL_REQUEST.md & Spec Probe |
| 7 | R3 Mobile | Web Audio Dual-Tone Siren Synthesizer | Custom Web Audio API dual-oscillator warble siren with volume gain and start/stop toggle | Audio toggle button | Audible emergency acoustic alarm | Handles browser AudioContext autoplay policy gracefully | ORIGINAL_REQUEST.md & Spec Probe |
| 8 | R3 Mobile | Text-to-Speech Voice Alerts | Web Speech API speech synthesis directing occupants to safe exits in clear Spanish | Hazard updates, repeat button | Spoken audio instructions | Falls back to visual instructions if SpeechSynthesis is unavailable | ORIGINAL_REQUEST.md & Spec Probe |
| 9 | R3 Mobile | Vector Blueprint & Dynamic A* Pathfinding | Interactive 2D vector blueprint showing corridors, rooms, assets, and dynamic safe escape vector | User start pos, exit goals, dynamic hazard map | Rendered escape route with pulsing arrows, distance metric | If all exits blocked, calculates path to nearest refuge zone | ORIGINAL_REQUEST.md & Spec Probe |
| 10 | R3 Mobile | Interactive Hazard Injection Engine | Click on blueprint corridor cells to spawn fire 🔥 or smoke 💨 and trigger instant $<5\\text{ms}$ rerouting | Canvas click coordinate | Updated hazard map, recalculated path, voice alert reroute | Prevents placing hazards on top of user location | Spec Probe |
| 11 | R3 Mobile | One-Tap "Estoy a Salvo / SOS" Action Bar | Instant transmission of occupant safety confirmation or triage SOS request with GPS/BLE coordinates | Button tap, SOS drawer option | Telemetry payload emission, HUD transitions to green Safe state | Debounces duplicate clicks | ORIGINAL_REQUEST.md & Spec Probe |
| 12 | R3 Mobile | Offline Mesh Network Simulator | Simulates BLE / Wi-Fi Direct multi-hop packet routing when cellular connectivity is toggled off | Offline toggle, packet transmission | Animated multi-hop mesh graph, hop count, RSSI telemetry | Handles simulated dropped peer by rerouting through alternate node | ORIGINAL_REQUEST.md & Spec Probe |
| 13 | R4 Fan-Out | 5,000+ Device Mass Fan-Out Simulator | Real-time simulation of mass broadcast across 4 concurrent carrier channels | Start broadcast trigger, rate slider | 5,000 simulated packets, delivery progress bar | Memory-capped particle pool with zero garbage collection spikes | ORIGINAL_REQUEST.md & Spec Probe |
| 14 | R4 Fan-Out | 4-Carrier Channel Telemetry Grid | Dedicated telemetry cards for FCM/APNs Push, SMS Gateway, Building PA/Sirens, and Brigade Radio | Carrier telemetry stream | Per-channel delivered count, latency, error rate, status | Individual channel status degrades on injected faults | ORIGINAL_REQUEST.md & Spec Probe |
| 15 | R4 Fan-Out | 5,000 Micro-Node Particle Visualizer | High-framerate 60 FPS HTML5 Canvas particle swarm displaying device states | Device state updates | Canvas rendering of 5,000 nodes colored by lifecycle state | Batched Canvas draw calls to maintain 60 FPS | ORIGINAL_REQUEST.md & Spec Probe |
| 16 | R4 Fan-Out | Millisecond Latency Distribution Histogram | High-resolution SVG/Canvas histogram with 15 latency bins and live p50/p90/p95/p99 markers | Packet latency data | Binned bar chart, statistical summary (mean, std dev, p99) | Correctly handles empty data before broadcast start | ORIGINAL_REQUEST.md & Spec Probe |
| 17 | R4 Fan-Out | SLA Compliance Telemetry (<850ms) | Real-time calculation of percentage of packets delivered in $<850\\text{ms}$ (Goal: $\\ge 99.8\\%$) | Delivery timestamps | SLA badge (PASS 🟢 / FAIL 🔴), compliance percentage | Dynamically updates as tail latency increases | ORIGINAL_REQUEST.md & Spec Probe |
| 18 | R4 Fan-Out | Chaos Injection & Carrier Outage Engine | Interactive controls to inject latency (+1.5s), packet loss (30%), or kill SMS Gateway | Chaos sliders, kill buttons | Injected packet delay, dropped packets, circuit breaker trips | Reversible: resets instantly when chaos toggles are disabled | ORIGINAL_REQUEST.md & Spec Probe |
| 19 | R4 Fan-Out | Circuit Breaker & Automated Failover | Detects carrier degradation and reroutes pending payloads to alternative active channels | Error rate threshold ($>15\\%$) | State transition \`CLOSED\` $\\rightarrow$ \`OPEN\`, reroute to FCM + LoRaWAN | Automatically attempts \`HALF_OPEN\` recovery after 3s cooldown | ORIGINAL_REQUEST.md & Spec Probe |
| 20 | Global | Zero-Dependency Cyberpunk HUD Architecture | 100% self-contained single-file HTML5/CSS3/ES6+ applications with zero external libraries | Browser DOM/Canvas/WebAudio | Standalone running dashboards, zero console errors | Graceful degradation if Web Audio / Speech API restricted | ORIGINAL_REQUEST.md & Spec Probe |

---

# SECTION 7: EDGE CASES & BOUNDARY BEHAVIORS TABLE

## Edge Cases
| # | Feature | Input / Boundary Condition | Observed & Specified Behavior |
|---|---|---|---|
| 1 | R2 Command Matrix | Evacuation timer runs for extended duration ($t > 30\\text{ min}$) | Headcount decay asymptotes cleanly to remaining trapped occupants; does not produce negative occupant counts. |
| 2 | R2 Master Broadcast | User rapidly double-clicks "DESPLEGAR ALERTA" | Modal confirmation and trigger debounce ensure broadcast routine executes exactly once. |
| 3 | R2 Brigade Dispatch | All 5 brigades assigned to Floor 7 simultaneously | UI displays stacked brigade badges cleanly without layout overflow or text clipping. |
| 4 | R2 Floor Drilldown | Opening drilldown on floor with 0 occupants | Inspector displays "Piso Totalmente Despejado (0 Ocupantes)" with green verified status badge. |
| 5 | R3 A* Pathfinding | User places fire directly on ALL exits (Salida A & Salida B blocked) | Pathfinding detects complete entrapment, alerts user via voice "Todas las salidas bloqueadas", and highlights nearest Safe Refuge Zone (Sala Presurizada 705). |
| 6 | R3 A* Pathfinding | User places fire on occupant's current tile | Engine rejects invalid hazard placement on occupant position and displays tooltip "Ubicación del ocupante protegida". |
| 7 | R3 Web Audio Siren | AudioContext created before user interaction | Waits for first user gesture (click/tap) before calling \`audioCtx.resume()\` to comply with browser autoplay policies. |
| 8 | R3 Speech Synthesis | SpeechSynthesis called while previous utterance is speaking | Calls \`window.speechSynthesis.cancel()\` before triggering new emergency utterance to prevent queue buildup. |
| 9 | R3 Mesh Simulator | Cellular disabled and 2 mesh peers dropped | Simulator falls back to multi-hop LoRaWAN stairwell relay node (+65ms) with zero packet loss. |
| 10 | R4 Fan-Out Simulator | Broadcast triggered with 10,000 devices (2x load) | Canvas particle engine dynamically scales particle radius and maintains stable 60 FPS without memory leaks. |
| 11 | R4 Latency Histogram | 100% of packets delivered in identical latency (e.g. all in 300ms bin) | Histogram auto-scales Y-axis correctly without division-by-zero or SVG rendering glitches. |
| 12 | R4 Circuit Breaker | SMS Gateway killed during mid-flight transmission | Instant trip to \`OPEN\`; in-flight SMS packets redirected to FCM Push and PA LoRaWAN within 150ms. |

---

# SECTION 8: AUTOMATED VERIFICATION & E2E TESTING MATRIX

The specifications for R2, R3, and R4 will be verified against a comprehensive 5-Tier E2E automated test suite using Headless Chrome / Puppeteer:

- **Tier 1 (Core Functional Acceptance)**:
  - R2: Validates 12 floor cards exist, occupancy counts match 1,240 sum, broadcast button triggers \`EVACUATING\` state and strobe class.
  - R3: Validates mobile viewport renders, canvas blueprint exists, A* path calculates clear exit, "Estoy a Salvo" button triggers safe state.
  - R4: Validates 5,000 devices broadcast, 4 carrier cards render, histogram SVG bars exist, p99 latency calculates $<850\\text{ms}$.
- **Tier 2 (Boundary & Extreme Inputs)**:
  - R2: Floor matrix with 0 occupants, max occupancy (300/floor), high thermal values (>150°C).
  - R3: Complete exit blockage scenario, extreme hazard density on blueprint.
  - R4: 100% carrier packet loss injection, maximum latency jitter.
- **Tier 3 (Pairwise & Cross-Feature Interactions)**:
  - R2: Brigade assignment during active broadcast with simultaneous floor drilldown.
  - R3: Simultaneous siren synthesis + speech synthesis + A* path recalculation during active touch events.
  - R4: Mid-broadcast carrier failure injection with circuit breaker failover validation.
- **Tier 4 (Real-World Life-Safety Workloads)**:
  - End-to-end evacuation simulation from trigger to 95% headcount evacuation.
- **Tier 5 (Adversarial Robustness & Zero Errors)**:
  - Strict zero browser console error check (\`page.on('console', msg => ...)\`), zero unhandled promise rejections, and DOM layout integrity verification.
`);

fs.writeFileSync(surveyPath, sections.join('\n'), 'utf8');
console.log('survey.md successfully written. Total length:', sections.join('\n').length);
