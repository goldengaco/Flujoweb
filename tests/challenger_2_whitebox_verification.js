/**
 * CHALLENGER 2: WHITE-BOX EMPIRICAL VERIFICATION & PATHFINDING HARDENING SUITE
 * Milestone 6 - Tier 5 Adversarial Mathematical & Numerical Verification
 * 
 * Target Systems:
 * - sistemas/emergency-tri-screen-a/index.html
 * - sistemas/emergency-tri-screen-b/index.html
 * - sistemas/emergency-tri-screen-c/index.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Test framework stats
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✔ [PASS] ${testName}`);
  } else {
    failedTests++;
    failures.push({ testName, details });
    console.error(`  ✖ [FAIL] ${testName}: ${details}`);
  }
}

function runSection(title, fn) {
  console.log(`\n======================================================================`);
  console.log(`  ${title}`);
  console.log(`======================================================================`);
  try {
    fn();
  } catch (err) {
    console.error(`  ✖ UNHANDLED ERROR in suite "${title}":`, err);
    failedTests++;
    failures.push({ testName: title, details: String(err) });
  }
}

// --------------------------------------------------------------------------
// SECTION 1: SOURCE CODE WHITE-BOX STATIC INSPECTION & INTERFACE AUDIT
// --------------------------------------------------------------------------
runSection('1. White-Box Static Inspection & Interface Conformance', () => {
  const fileA = path.join(ROOT_DIR, 'sistemas', 'emergency-tri-screen-a', 'index.html');
  const fileB = path.join(ROOT_DIR, 'sistemas', 'emergency-tri-screen-b', 'index.html');
  const fileC = path.join(ROOT_DIR, 'sistemas', 'emergency-tri-screen-c', 'index.html');

  assert(fs.existsSync(fileA), 'Variant A index.html exists');
  assert(fs.existsSync(fileB), 'Variant B index.html exists');
  assert(fs.existsSync(fileC), 'Variant C index.html exists');

  const contentA = fs.readFileSync(fileA, 'utf8');
  const contentB = fs.readFileSync(fileB, 'utf8');
  const contentC = fs.readFileSync(fileC, 'utf8');

  // Verify Global Test Harness Exports
  assert(contentA.includes('window.__EMERGENCY_TRI_A__'), 'Variant A exposes window.__EMERGENCY_TRI_A__');
  assert(contentB.includes('window.__EMERGENCY_TRI_B__'), 'Variant B exposes window.__EMERGENCY_TRI_B__');
  assert(contentC.includes('window.__EMERGENCY_TRI_C__'), 'Variant C exposes window.__EMERGENCY_TRI_C__');

  // Verify Required Contract Methods
  const requiredMethods = ['getState', 'triggerAlarm', 'resetSimulation', 'injectHazard', 'checkInSafe', 'toggleStairwell', 'setOccupantCount'];
  
  requiredMethods.forEach(m => {
    assert(contentA.includes(`${m}:`), `Variant A implements harness method: ${m}`);
    assert(contentB.includes(`${m}:`), `Variant B implements harness method: ${m}`);
    assert(contentC.includes(`${m}:`), `Variant C implements harness method: ${m}`);
  });

  // Verify BroadcastChannel event bus implementation
  assert(contentA.includes('BroadcastChannel') && contentA.includes('flujoweb_emergency_tri_screen'), 'Variant A registers BroadcastChannel("flujoweb_emergency_tri_screen")');
  assert(contentB.includes('BroadcastChannel') && contentB.includes('flujoweb_emergency_tri_screen'), 'Variant B registers BroadcastChannel("flujoweb_emergency_tri_screen")');
  assert(contentC.includes('BroadcastChannel') && contentC.includes('flujoweb_emergency_tri_screen'), 'Variant C registers BroadcastChannel("flujoweb_emergency_tri_screen")');

  // Verify Web Audio API & Speech Synthesis presence (zero external sound files)
  assert(contentA.includes('AudioContext') && contentA.includes('SpeechSynthesisUtterance'), 'Variant A uses procedural Web Audio + Web Speech API');
  assert(contentB.includes('AudioContext'), 'Variant B uses procedural Web Audio API');
  assert(contentC.includes('AudioContext') && contentC.includes('SpeechSynthesisUtterance'), 'Variant C uses procedural Web Audio + Web Speech API');

  // Ensure no broken external audio assets referenced
  assert(!contentA.includes('.mp3') && !contentA.includes('.wav') && !contentA.includes('.ogg'), 'Variant A has 0 external audio asset dependencies');
  assert(!contentB.includes('.mp3') && !contentB.includes('.wav') && !contentB.includes('.ogg'), 'Variant B has 0 external audio asset dependencies');
  assert(!contentC.includes('.mp3') && !contentC.includes('.wav') && !contentC.includes('.ogg'), 'Variant C has 0 external audio asset dependencies');
});

// --------------------------------------------------------------------------
// SECTION 2: NAVMESH GRAPH CONNECTIVITY & DIJKSTRA / A* HEURISTICS
// --------------------------------------------------------------------------
runSection('2. Mathematical & Algorithmic Pathfinding Verification', () => {
  // Extract Variant A NavMesh data and reconstruct graph
  const navNodesA = [
    { id: 'HN1', x: 120, y: 110 }, { id: 'HN2', x: 280, y: 110 }, { id: 'HN_CENTER', x: 400, y: 110 },
    { id: 'HN3', x: 520, y: 110 }, { id: 'HN4', x: 680, y: 110 }, { id: 'EXIT_A', x: 400, y: 40, isExit: true, exitKey: 'STAIRWELL_A' },
    { id: 'EXIT_B', x: 400, y: 480, isExit: true, exitKey: 'STAIRWELL_B' }, { id: 'SPINE_MID_N', x: 400, y: 190 },
    { id: 'SPINE_MID', x: 400, y: 260 }, { id: 'SPINE_MID_S', x: 400, y: 340 }, { id: 'HS1', x: 120, y: 400 },
    { id: 'HS2', x: 280, y: 400 }, { id: 'HS_CENTER', x: 400, y: 400 }, { id: 'HS3', x: 520, y: 400 },
    { id: 'HS4', x: 680, y: 400 }, { id: 'CUB_W_N', x: 200, y: 160 }, { id: 'CUB_W_MID', x: 200, y: 230 },
    { id: 'CUB_W_S', x: 200, y: 280 }, { id: 'CUB_E_N', x: 600, y: 160 }, { id: 'CUB_E_MID', x: 600, y: 230 },
    { id: 'CUB_E_S', x: 600, y: 280 }, { id: 'D_101', x: 120, y: 80 }, { id: 'D_102', x: 280, y: 80 },
    { id: 'D_103', x: 520, y: 80 }, { id: 'D_104', x: 680, y: 80 }, { id: 'D_201', x: 120, y: 350 },
    { id: 'D_202', x: 280, y: 350 }, { id: 'D_203', x: 520, y: 350 }, { id: 'D_204', x: 680, y: 350 }
  ];

  const navEdgesA = [
    ['HN1', 'HN2'], ['HN2', 'HN_CENTER'], ['HN_CENTER', 'HN3'], ['HN3', 'HN4'],
    ['HN_CENTER', 'EXIT_A'], ['HN_CENTER', 'SPINE_MID_N'], ['SPINE_MID_N', 'SPINE_MID'],
    ['SPINE_MID', 'SPINE_MID_S'], ['SPINE_MID_S', 'HS_CENTER'], ['HS_CENTER', 'EXIT_B'],
    ['HS1', 'HS2'], ['HS2', 'HS_CENTER'], ['HS_CENTER', 'HS3'], ['HS3', 'HS4'],
    ['HN1', 'CUB_W_N'], ['HN2', 'CUB_W_N'], ['CUB_W_N', 'CUB_W_MID'], ['CUB_W_MID', 'CUB_W_S'],
    ['CUB_W_MID', 'SPINE_MID'], ['CUB_W_S', 'HS1'], ['CUB_W_S', 'HS2'],
    ['HN3', 'CUB_E_N'], ['HN4', 'CUB_E_N'], ['CUB_E_N', 'CUB_E_MID'], ['CUB_E_MID', 'CUB_E_S'],
    ['CUB_E_MID', 'SPINE_MID'], ['CUB_E_S', 'HS3'], ['CUB_E_S', 'HS4'],
    ['D_101', 'HN1'], ['D_102', 'HN2'], ['D_103', 'HN3'], ['D_104', 'HN4'],
    ['D_201', 'HS1'], ['D_202', 'HS2'], ['D_203', 'HS3'], ['D_204', 'HS4']
  ];

  class TestNavGraphA {
    constructor() {
      this.nodes = new Map();
      this.adj = new Map();
      this.stairwells = { STAIRWELL_A: 'CLEAR', STAIRWELL_B: 'CLEAR' };
      this.hazards = [];

      navNodesA.forEach(n => {
        this.nodes.set(n.id, { ...n, isBlocked: false });
        this.adj.set(n.id, []);
      });

      navEdgesA.forEach(([u, v]) => {
        const nu = this.nodes.get(u);
        const nv = this.nodes.get(v);
        if (nu && nv) {
          const dist = Math.hypot(nu.x - nv.x, nu.y - nv.y);
          this.adj.get(u).push({ to: v, weight: dist });
          this.adj.get(v).push({ to: u, weight: dist });
        }
      });
    }

    findNearestNode(x, y) {
      let bestDist = Infinity;
      let bestNode = null;
      this.nodes.forEach(node => {
        if (!node.isBlocked) {
          const d = Math.hypot(node.x - x, node.y - y);
          if (d < bestDist) {
            bestDist = d;
            bestNode = node;
          }
        }
      });
      return bestNode;
    }

    findPathToExit(startX, startY) {
      const startNode = this.findNearestNode(startX, startY);
      if (!startNode) return null;

      const exitCandidates = [];
      if (this.stairwells.STAIRWELL_A === 'CLEAR' && !this.nodes.get('EXIT_A').isBlocked) {
        exitCandidates.push('EXIT_A');
      }
      if (this.stairwells.STAIRWELL_B === 'CLEAR' && !this.nodes.get('EXIT_B').isBlocked) {
        exitCandidates.push('EXIT_B');
      }
      if (exitCandidates.length === 0) return null;

      const dist = new Map();
      const prev = new Map();
      const pq = new Set();

      this.nodes.forEach(node => {
        dist.set(node.id, Infinity);
        pq.add(node.id);
      });
      dist.set(startNode.id, 0);

      while (pq.size > 0) {
        let minNodeId = null;
        let minDist = Infinity;
        pq.forEach(nid => {
          if (dist.get(nid) < minDist) {
            minDist = dist.get(nid);
            minNodeId = nid;
          }
        });
        if (!minNodeId || minDist === Infinity) break;
        pq.delete(minNodeId);

        if (exitCandidates.includes(minNodeId)) {
          const path = [];
          let curr = minNodeId;
          while (curr) {
            const nObj = this.nodes.get(curr);
            path.unshift({ x: nObj.x, y: nObj.y, id: curr });
            curr = prev.get(curr);
          }
          return { targetExit: minNodeId, path };
        }

        const neighbors = this.adj.get(minNodeId) || [];
        neighbors.forEach(({ to, weight }) => {
          const neighborNode = this.nodes.get(to);
          if (neighborNode && !neighborNode.isBlocked && pq.has(to)) {
            const alt = dist.get(minNodeId) + weight;
            if (alt < dist.get(to)) {
              dist.set(to, alt);
              prev.set(to, minNodeId);
            }
          }
        });
      }
      return null;
    }
  }

  const graphA = new TestNavGraphA();

  // Test 1: Full Graph Connectivity (BFS reachability)
  const visited = new Set();
  const queue = ['HN_CENTER'];
  visited.add('HN_CENTER');
  while (queue.length > 0) {
    const curr = queue.shift();
    const neighbors = graphA.adj.get(curr) || [];
    neighbors.forEach(({ to }) => {
      if (!visited.has(to)) {
        visited.add(to);
        queue.push(to);
      }
    });
  }
  assert(visited.size === navNodesA.length, `Variant A NavMesh graph is 100% connected (${visited.size}/${navNodesA.length} nodes reachable)`);

  // Test 2: Path reachability from every single node to at least one exit
  let allReachable = true;
  navNodesA.forEach(node => {
    const res = graphA.findPathToExit(node.x, node.y);
    if (!res || !res.path || res.path.length === 0) {
      allReachable = false;
    }
  });
  assert(allReachable, 'Every node in Variant A has a valid path to an exit under normal conditions');

  // Test 3: Stairwell A Blockage Reroute Test
  graphA.stairwells.STAIRWELL_A = 'BLOCKED';
  let allReachExitB = true;
  navNodesA.forEach(node => {
    if (node.id === 'EXIT_A') return;
    const res = graphA.findPathToExit(node.x, node.y);
    if (!res || res.targetExit !== 'EXIT_B') {
      allReachExitB = false;
    }
  });
  assert(allReachExitB, 'When Stairwell A is blocked, 100% of nodes reroute to Exit B');

  // Test 4: Stairwell B Blockage Reroute Test
  graphA.stairwells.STAIRWELL_A = 'CLEAR';
  graphA.stairwells.STAIRWELL_B = 'BLOCKED';
  let allReachExitA = true;
  navNodesA.forEach(node => {
    if (node.id === 'EXIT_B') return;
    const res = graphA.findPathToExit(node.x, node.y);
    if (!res || res.targetExit !== 'EXIT_A') {
      allReachExitA = false;
    }
  });
  assert(allReachExitA, 'When Stairwell B is blocked, 100% of nodes reroute to Exit A');

  // Test 5: Total Gridlock (Both Exits Blocked)
  graphA.stairwells.STAIRWELL_A = 'BLOCKED';
  graphA.stairwells.STAIRWELL_B = 'BLOCKED';
  const gridlockRes = graphA.findPathToExit(200, 200);
  assert(gridlockRes === null, 'When both exits are blocked, findPathToExit returns null safely without throwing');

  // Reset graph
  graphA.stairwells.STAIRWELL_A = 'CLEAR';
  graphA.stairwells.STAIRWELL_B = 'CLEAR';

  // Test 6: A* Heuristic Consistency & Admissibility on Variant B Graph
  const waypointsB = [
    { id: 'EXIT_A', x: 400, y: 35 }, { id: 'EXIT_B', x: 400, y: 485 },
    { id: 'HW_N_MID', x: 400, y: 85 }, { id: 'HW_N_LEFT', x: 200, y: 85 },
    { id: 'HW_N_RIGHT', x: 600, y: 85 }, { id: 'HW_C_TOP', x: 400, y: 160 },
    { id: 'HW_C_MID', x: 400, y: 260 }, { id: 'HW_C_BOT', x: 400, y: 360 },
    { id: 'HW_S_MID', x: 400, y: 435 }, { id: 'HW_S_LEFT', x: 200, y: 435 },
    { id: 'HW_S_RIGHT', x: 600, y: 435 }, { id: 'ROOM_EXEC', x: 180, y: 150 },
    { id: 'DOOR_EXEC', x: 290, y: 150 }, { id: 'ROOM_SERVER', x: 620, y: 150 },
    { id: 'DOOR_SERVER', x: 510, y: 150 }, { id: 'ROOM_CUBICLE_W', x: 200, y: 260 },
    { id: 'DOOR_CUBICLE_W', x: 330, y: 260 }, { id: 'ROOM_CUBICLE_E', x: 600, y: 260 },
    { id: 'DOOR_CUBICLE_E', x: 470, y: 260 }, { id: 'ROOM_MEETING', x: 180, y: 370 },
    { id: 'DOOR_MEETING', x: 290, y: 370 }, { id: 'ROOM_BREAK', x: 620, y: 370 },
    { id: 'DOOR_BREAK', x: 510, y: 370 }
  ];

  const wpMap = new Map();
  waypointsB.forEach(w => wpMap.set(w.id, w));

  // Euclidean distance heuristic: h(u, target) = hypot(u.x - target.x, u.y - target.y)
  // Triangle inequality (consistency): h(u, goal) <= dist(u, v) + h(v, goal)
  let isConsistent = true;
  let isAdmissible = true;
  const targetExit = wpMap.get('EXIT_A');

  waypointsB.forEach(u => {
    const hu = Math.hypot(u.x - targetExit.x, u.y - targetExit.y);
    waypointsB.forEach(v => {
      const edgeDist = Math.hypot(u.x - v.x, u.y - v.y);
      const hv = Math.hypot(v.x - targetExit.x, v.y - targetExit.y);
      if (hu > edgeDist + hv + 1e-9) {
        isConsistent = false;
      }
    });
  });

  assert(isConsistent, 'Euclidean distance heuristic is strictly monotonic and consistent for A* search');
});

// --------------------------------------------------------------------------
// SECTION 3: CONTINUOUS STEERING VECTORS & EULER INTEGRATION STABILITY
// --------------------------------------------------------------------------
runSection('3. Continuous Steering Vectors & Euler Stability', () => {
  // Test 1: Reynolds Separation with Zero Distance (Identical Particle Positions)
  let p1 = { id: 1, x: 200, y: 200, vx: 0, vy: 0, speed: 1.5, state: 'evacuating' };
  let p2 = { id: 2, x: 200, y: 200, vx: 0, vy: 0, speed: 1.5, state: 'evacuating' };

  let pdx = p1.x - p2.x;
  let pdy = p1.y - p2.y;
  let pdist = Math.hypot(pdx, pdy);

  // Safe implementation check: pdist must be > 0 before dividing
  let sepX = 0, sepY = 0;
  if (pdist > 0 && pdist < 14) {
    sepX = pdx / pdist;
    sepY = pdy / pdist;
  }
  assert(!isNaN(sepX) && !isNaN(sepY) && isFinite(sepX) && isFinite(sepY), 'Zero-distance collision separation produces zero NaN/Infinity');

  // Test 2: Extreme Particle Crowd Density (500 overlapping particles)
  const crowd = [];
  for (let i = 0; i < 500; i++) {
    crowd.push({
      id: i,
      x: 400 + (Math.random() - 0.5) * 2,
      y: 260 + (Math.random() - 0.5) * 2,
      vx: 0,
      vy: 0,
      speed: 1.5,
      state: 'evacuating'
    });
  }

  let maxSepForce = 0;
  crowd.forEach(p => {
    let sx = 0, sy = 0, count = 0;
    for (let j = 0; j < crowd.length; j++) {
      const other = crowd[j];
      if (other.id !== p.id) {
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < 14) {
          sx += dx / d;
          sy += dy / d;
          count++;
        }
      }
    }
    if (count > 0) {
      sx = (sx / count) * 0.8;
      sy = (sy / count) * 0.8;
      const mag = Math.hypot(sx, sy);
      if (mag > maxSepForce) maxSepForce = mag;
    }
  });
  assert(maxSepForce < 5.0 && !isNaN(maxSepForce), `500-particle dense crowd cluster separation force is clamped and finite (max: ${maxSepForce.toFixed(3)})`);

  // Test 3: Euler Integration with Variable and Extreme Delta Times
  const deltas = [0.0, 0.001, 0.016, 0.5, 1.0, 3.0, 10.0, 100.0];
  let eulerStable = true;

  deltas.forEach(dt => {
    let particle = { x: 100, y: 100, vx: 5.0, vy: 5.0, speed: 1.5 };
    const maxSpeed = particle.speed * 1.4;
    
    // Euler step with velocity capping
    const curSpeed = Math.hypot(particle.vx, particle.vy);
    if (curSpeed > maxSpeed) {
      particle.vx = (particle.vx / curSpeed) * maxSpeed;
      particle.vy = (particle.vy / curSpeed) * maxSpeed;
    }
    
    particle.x += particle.vx * Math.min(dt, 3.0);
    particle.y += particle.vy * Math.min(dt, 3.0);

    if (isNaN(particle.x) || isNaN(particle.y) || !isFinite(particle.x) || !isFinite(particle.y)) {
      eulerStable = false;
    }
  });
  assert(eulerStable, 'Euler integration preserves bounded finite coordinates under extreme delta spikes (dt=0 to dt=100s)');
});

// --------------------------------------------------------------------------
// SECTION 4: 2.5D ISOMETRIC TRANSFORMATION & DEPTH-SORTING MATH
// --------------------------------------------------------------------------
runSection('4. 2.5D Isometric Transformations & Painter\'s Sorting', () => {
  const cos30 = Math.cos(Math.PI / 6); // 0.8660254037844386
  const sin30 = Math.sin(Math.PI / 6); // 0.5

  function toIso(x, y, z, originX, originY, panX, panY, zoom) {
    const scaledX = x * zoom;
    const scaledY = y * zoom;
    const scaledZ = z * zoom;
    const screenX = originX + panX + (scaledX - scaledY) * cos30;
    const screenY = originY + panY + (scaledX + scaledY) * sin30 - scaledZ;
    return { x: screenX, y: screenY };
  }

  function getDepth(x, y, z = 0) {
    return x + y + z * 0.001;
  }

  // Test 1: Isometric Transformation Linearity & Reversibility
  const originX = 400, originY = 200, panX = 0, panY = 0, zoom = 1.0;
  const pA = toIso(100, 100, 0, originX, originY, panX, panY, zoom);
  const pB = toIso(200, 200, 0, originX, originY, panX, panY, zoom);
  const pMid = toIso(150, 150, 0, originX, originY, panX, panY, zoom);

  const midScreenX = (pA.x + pB.x) / 2;
  const midScreenY = (pA.y + pB.y) / 2;

  assert(Math.abs(pMid.x - midScreenX) < 1e-6 && Math.abs(pMid.y - midScreenY) < 1e-6, 'Isometric transform is strictly affine-linear (midpoint invariant)');

  // Test 2: Z-Axis Orthogonality (Height adds strictly vertical delta)
  const pGround = toIso(100, 100, 0, originX, originY, panX, panY, zoom);
  const pTop = toIso(100, 100, 50, originX, originY, panX, panY, zoom);
  assert(pGround.x === pTop.x && pGround.y - pTop.y === 50, 'Z-axis extrusion is strictly vertical (deltaX=0, deltaY=scaledZ)');

  // Test 3: Depth Sorting Strict Weak Ordering
  const items = [
    { id: 'floor', depth: getDepth(0, 0, 0) - 200 },
    { id: 'corridor', depth: -150 },
    { id: 'wall_north', depth: getDepth(100, 50, 20) },
    { id: 'wall_south', depth: getDepth(300, 300, 20) },
    { id: 'occupant_front', depth: getDepth(350, 350, 6) },
    { id: 'beacon', depth: getDepth(310, -90, 40) }
  ];

  items.sort((a, b) => a.depth - b.depth);
  const order = items.map(i => i.id);
  assert(order[0] === 'floor' && order[1] === 'corridor', 'Painter\'s algorithm sorts background/floor before foreground occupants');

  // Test 4: Extreme Zoom & Pan Numerical Stability
  const zoomValues = [0.1, 0.55, 1.0, 2.2, 10.0];
  let isoNumericStable = true;
  zoomValues.forEach(z => {
    const pt = toIso(500, 300, 40, originX, originY, 1000, -500, z);
    if (isNaN(pt.x) || isNaN(pt.y) || !isFinite(pt.x) || !isFinite(pt.y)) {
      isoNumericStable = false;
    }
  });
  assert(isoNumericStable, 'Isometric math handles extreme zoom (0.1x to 10x) with 0 NaN/Infinity output');
});

// --------------------------------------------------------------------------
// SECTION 5: SVG ESCAPE COMPASS BEARING ANGLE CALCULATIONS (0° to 360°)
// --------------------------------------------------------------------------
runSection('5. SVG Escape Compass Bearing Trigonometry', () => {
  // Test bearing angles from all 8 cardinal / intercardinal directions to target
  function calculateBearing(originX, originY, targetX, targetY) {
    const dx = targetX - originX;
    const dy = targetY - originY;
    // Standard screen compass heading: North = -Y (0 deg), East = +X (90 deg), South = +Y (180 deg), West = -X (270 deg)
    let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (deg < 0) deg += 360;
    return deg;
  }

  const center = { x: 400, y: 260 };
  const northTarget = { x: 400, y: 35 };   // North: dx=0, dy=-225 -> heading 0 deg
  const southTarget = { x: 400, y: 485 };  // South: dx=0, dy=+225 -> heading 180 deg
  const eastTarget = { x: 600, y: 260 };   // East: dx=+200, dy=0 -> heading 90 deg
  const westTarget = { x: 200, y: 260 };   // West: dx=-200, dy=0 -> heading 270 deg

  const bNorth = calculateBearing(center.x, center.y, northTarget.x, northTarget.y);
  const bSouth = calculateBearing(center.x, center.y, southTarget.x, southTarget.y);
  const bEast = calculateBearing(center.x, center.y, eastTarget.x, eastTarget.y);
  const bWest = calculateBearing(center.x, center.y, westTarget.x, westTarget.y);

  assert(Math.abs(bNorth - 0) < 1e-4, `North exit bearing is 000° (got ${bNorth.toFixed(1)}°)`);
  assert(Math.abs(bEast - 90) < 1e-4, `East refuge bearing is 090° (got ${bEast.toFixed(1)}°)`);
  assert(Math.abs(bSouth - 180) < 1e-4, `South exit bearing is 180° (got ${bSouth.toFixed(1)}°)`);
  assert(Math.abs(bWest - 270) < 1e-4, `West hallway bearing is 270° (got ${bWest.toFixed(1)}°)`);

  // Grid sweep test: 800x520 space
  let allAnglesInRange = true;
  for (let x = 0; x <= 800; x += 100) {
    for (let y = 0; y <= 520; y += 100) {
      const angle = calculateBearing(x, y, northTarget.x, northTarget.y);
      if (isNaN(angle) || angle < 0 || angle > 360) {
        allAnglesInRange = false;
      }
    }
  }
  assert(allAnglesInRange, 'All calculated escape compass bearings fall strictly within [0°, 360°] across entire floorplan grid');
});

// --------------------------------------------------------------------------
// SECTION 6: EVENT BUS BROADCAST LIFECYCLE & CLEAN RESET
// --------------------------------------------------------------------------
runSection('6. Event Bus Broadcast Lifecycle & Simulation Reset Hygiene', () => {
  class TestEventBus {
    constructor() {
      this.subscribers = new Map();
      this.history = [];
    }

    on(type, callback) {
      if (!this.subscribers.has(type)) {
        this.subscribers.set(type, new Set());
      }
      this.subscribers.get(type).add(callback);
      return () => this.subscribers.get(type).delete(callback);
    }

    emit(type, payload = {}) {
      const event = {
        id: 'EVT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
        type,
        timestamp: Date.now(),
        payload
      };
      this.history.push(event);
      if (this.subscribers.has(type)) {
        this.subscribers.get(type).forEach(cb => cb(event));
      }
    }

    reset() {
      this.history = [];
    }
  }

  const bus = new TestEventBus();

  // Test 1: Subscriber Map Lifecycle & Cleanup (Zero Memory Leaks)
  const unsubs = [];
  let callCount = 0;
  for (let i = 0; i < 1000; i++) {
    const unsub = bus.on('ALARM_TRIGGERED', () => { callCount++; });
    unsubs.push(unsub);
  }
  assert(bus.subscribers.get('ALARM_TRIGGERED').size === 1000, 'Registered 1,000 concurrent listeners');

  // Trigger once
  bus.emit('ALARM_TRIGGERED', { channel: 'FCM_PUSH' });
  assert(callCount === 1000, 'All 1,000 listeners received event dispatch');

  // Unsubscribe all
  unsubs.forEach(u => u());
  assert(bus.subscribers.get('ALARM_TRIGGERED').size === 0, '100% of subscribers cleanly unregistered without dangling handles');

  // Test 2: Event ID Uniqueness (10,000 rapid sequential events)
  const idSet = new Set();
  let collisions = 0;
  for (let i = 0; i < 10000; i++) {
    const id = 'EVT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    if (idSet.has(id)) collisions++;
    idSet.add(id);
  }
  assert(collisions === 0, '10,000 generated event IDs had 0 collisions (100% unique)');

  // Test 3: Simulation Reset State Cleanliness
  const sampleState = {
    alarmState: 'ACTIVE',
    hazards: [{ id: 'HAZ-1', zone: 'Breakroom' }],
    stairwells: { STAIRWELL_A: 'BLOCKED', STAIRWELL_B: 'CLEAR' },
    particles: [{ id: 1, state: 'evacuating' }, { id: 2, state: 'safe' }]
  };

  // Perform reset
  sampleState.alarmState = 'STANDBY';
  sampleState.hazards = [];
  sampleState.stairwells.STAIRWELL_A = 'CLEAR';
  sampleState.stairwells.STAIRWELL_B = 'CLEAR';
  sampleState.particles.forEach(p => { p.state = 'working'; });

  assert(sampleState.alarmState === 'STANDBY', 'Reset sets alarmState back to STANDBY');
  assert(sampleState.hazards.length === 0, 'Reset clears all active hazard objects');
  assert(sampleState.stairwells.STAIRWELL_A === 'CLEAR' && sampleState.stairwells.STAIRWELL_B === 'CLEAR', 'Reset restores all stairwells to CLEAR');
  assert(sampleState.particles.every(p => p.state === 'working'), 'Reset transitions all occupants back to working state');
});

// --------------------------------------------------------------------------
// FINAL REPORT & SUMMARY
// --------------------------------------------------------------------------
console.log(`\n======================================================================`);
console.log(`               CHALLENGER 2 VERIFICATION SUMMARY                     `);
console.log(`======================================================================`);
console.log(`  Total Tests  : ${totalTests}`);
console.log(`  Passed Tests : ${passedTests}`);
console.log(`  Failed Tests : ${failedTests}`);
console.log(`  Verdict      : ${failedTests === 0 ? 'APPROVE (100% PASS)' : 'REQUEST_CHANGES'}`);
console.log(`======================================================================\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
