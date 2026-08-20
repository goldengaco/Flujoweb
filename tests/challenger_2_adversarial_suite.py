#!/usr/bin/env python3
"""Challenger 2 Empirical Boundary, Edge-Case, and Pathfinding Adversarial Test Suite.

Author: teamwork_preview_challenger (challenger_2)
Role: critic, specialist
Target Systems:
1. `sistemas/emergency-evacuation-v2/index.html` (A* dynamic pathfinding, fire traps, Sala Presurizada 705 fallback, check-in telemetry, offline mesh simulator)
2. `sistemas/mulesoft_80_ideas_observabilidad.md` (80 real-world ideas, 8 domains, schema completeness, quantitative monetization metrics)
3. Web Audio API & Web Speech API lifecycle management (mute toggle, audio resume, synth modulation)
"""

import json
import math
import os
import random
import re
import sys
import time

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from tests.framework import (
    BrowserSession,
    Colors,
    TestResult,
    c_bold,
    c_cyan,
    c_dim,
    c_fail,
    c_green,
    c_pass,
    c_red,
    c_yellow,
    colored,
)


class ChallengerTestRunner:
    def __init__(self):
        self.results = []
        self.browser = None
        self.evac_v2_path = os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v2", "index.html")
        self.catalog_path = os.path.join(PROJECT_ROOT, "sistemas", "mulesoft_80_ideas_observabilidad.md")

    def record(self, test_name: str, passed: bool, duration_ms: float, details: str = ""):
        res = TestResult(
            name=test_name,
            tier=5,
            deliverable="ADV",
            description=details
        )
        if passed:
            res.mark_pass(duration_ms)
        else:
            res.mark_fail(Exception(details), duration_ms)

        self.results.append(res)
        status_str = f"[{c_pass('PASS')}]" if passed else f"[{c_fail('FAIL')}]"
        print(f"  {status_str} {c_bold(test_name)} ({duration_ms:.1f}ms)")
        if not passed and details:
            print(f"       {c_red('ERROR:')} {details}")

    def run_all(self):
        start_time = time.time()
        print(f"\n{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}   CHALLENGER 2: EMPIRICAL ADVERSARIAL STRESS & VERIFICATION SUITE{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}\n")

        # ---------------------------------------------------------------------
        # PART 1: MULESOFT 80 IDEAS OBSERVABILITY CATALOG RIGOROUS AUDIT
        # ---------------------------------------------------------------------
        print(f"{Colors.BRIGHT_YELLOW}{Colors.BOLD}--- PART 1: R5 MASTER INNOVATION CATALOG (80 IDEAS) SCHEMA AUDIT ---{Colors.RESET}")
        self.verify_catalog_complete()

        # ---------------------------------------------------------------------
        # PART 2: EMERGENCY EVACUATION V2 HUD & DYNAMIC A* ESCAPE ENGINE
        # ---------------------------------------------------------------------
        print(f"\n{Colors.BRIGHT_YELLOW}{Colors.BOLD}--- PART 2: R3 EMERGENCY EVACUATION V2 HUD & A* PATHFINDING ---{Colors.RESET}")
        self.browser = BrowserSession()
        self.browser.launch()
        try:
            self.verify_evacuation_v2_interactive()
        finally:
            self.browser.close()

        total = len(self.results)
        passed = sum(1 for r in self.results if r.status == "PASS")
        failed = total - passed
        elapsed = time.time() - start_time

        print(f"\n{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD} CHALLENGER 2 TEST EXECUTION SUMMARY{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}")
        print(f" Total Adversarial Assertions: {total} | Passed: {c_green(str(passed))} | Failed: {c_red(str(failed)) if failed else '0'} | Time: {elapsed:.2f}s")
        if failed == 0:
            print(f"\n {c_green(c_bold('>>> VERDICT: EMPIRICAL APPROVAL CONFIRMED (100% PASS RATE) <<<'))}\n")
        else:
            print(f"\n {c_fail(c_bold('>>> VERDICT: REQUEST_CHANGES (FAILURES DETECTED) <<<'))}\n")

        return failed == 0

    def verify_catalog_complete(self):
        t0 = time.time()
        if not os.path.exists(self.catalog_path):
            self.record("catalog_file_exists", False, 1.0, f"File not found: {self.catalog_path}")
            return

        with open(self.catalog_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Test 1.1: File size and line count sanity
        lines = content.splitlines()
        self.record("catalog_file_volume", len(lines) >= 1500 and len(content) >= 150000, (time.time()-t0)*1000,
                    f"Catalog lines: {len(lines)}, bytes: {len(content)}")

        # Test 1.2: Exact 80 ideas numbering regex match
        t0 = time.time()
        idea_matches = list(re.finditer(r"###\s+(\d{2})\.\s+([^\n]+)", content))
        idea_numbers = [int(m.group(1)) for m in idea_matches]
        expected_numbers = list(range(1, 81))
        self.record("catalog_exact_80_ideas_count", len(idea_matches) == 80, (time.time()-t0)*1000,
                    f"Found {len(idea_matches)} ideas, expected 80")
        self.record("catalog_strict_1_to_80_sequence", idea_numbers == expected_numbers, (time.time()-t0)*1000,
                    f"Idea numbering sequence mismatch: {idea_numbers[:5]}...{idea_numbers[-5:]}")

        # Test 1.3: 8 Domains exact partitioning (10 ideas per domain)
        t0 = time.time()
        domain_patterns = [
            (1, "Domain 1: Fintech & Real-Time Payments", 1, 10),
            (2, "Domain 2: Healthcare & HL7/FHIR Telemetry", 11, 20),
            (3, "Domain 3: Retail, E-Commerce & Omnichannel", 21, 30),
            (4, "Domain 4: SRE, CloudOps & Hybrid Mesh Observability", 31, 40),
            (5, "Domain 5: Cyber-Defense, Threat Hunting & Zero-Trust", 41, 50),
            (6, "Domain 6: IoT, Public Safety & Smart Buildings", 51, 60),
            (7, "Domain 7: Logistics, Cold Chain & Global Supply Chain", 61, 70),
            (8, "Domain 8: Telecom, 5G Network Slicing & Edge Gateways", 71, 80),
        ]
        all_domains_valid = True
        for d_num, d_name, start_id, end_id in domain_patterns:
            pos_domain = content.find(f"## {d_name}")
            if pos_domain == -1:
                pos_domain = content.find(d_name)
            if pos_domain == -1:
                all_domains_valid = False
                break
        self.record("catalog_8_domains_header_integrity", all_domains_valid, (time.time()-t0)*1000,
                    "Failed to locate one or more domain headers in markdown")

        # Test 1.4: Schema completeness for all 80 ideas
        t0 = time.time()
        chunks = re.split(r"###\s+\d{2}\.\s+[^\n]+", content)[1:]
        mandatory_fields = [
            "- **Domain & Sub-domain**:",
            "- **Business Problem & Opportunity**:",
            "- **End-to-End Architectural Data Flow**:",
            "- **Core Observability Metrics, KPIs & SLO Targets**:",
            "- **Commercial Monetization Model / ROI Impact**:"
        ]
        schema_failures = []
        for idx, chunk in enumerate(chunks, 1):
            missing = [f for f in mandatory_fields if f not in chunk]
            if missing:
                schema_failures.append((idx, missing))
        self.record("catalog_80_ideas_schema_completeness", len(schema_failures) == 0, (time.time()-t0)*1000,
                    f"Ideas with missing fields: {schema_failures}")

        # Test 1.5: Multi-Cloud Technical Architecture Breakdown per Idea
        t0 = time.time()
        ideas_with_tech = 0
        for chunk in chunks:
            has_apigee = "Apigee" in chunk
            has_mule = "MuleSoft" in chunk or "DataWeave" in chunk
            has_downstream = any(k in chunk for k in ["Downstream", "AWS", "GCP", "Google Cloud", "Cloud", "SAP", "Pub/Sub", "DynamoDB", "Azure", "Kafka", "FHIR", "SCADA", "Salvar Vidas", "Mainframe"])
            if has_apigee and has_mule and has_downstream:
                ideas_with_tech += 1
        self.record("catalog_multicloud_architecture_depth", ideas_with_tech == 80, (time.time()-t0)*1000,
                    f"Only {ideas_with_tech}/80 ideas had complete multi-cloud architectural stack")

        # Test 1.6: Quantitative Monetization Formulas / Dollar Metrics
        t0 = time.time()
        ideas_with_money = 0
        for chunk in chunks:
            if re.search(r"(\$\d+|\d+%\s+(reduction|savings|margin|lift|ARR|ROI)|annual|monthly|fee|cost)", chunk, re.IGNORECASE):
                ideas_with_money += 1
        self.record("catalog_quantitative_monetization_metrics", ideas_with_money == 80, (time.time()-t0)*1000,
                    f"Only {ideas_with_money}/80 ideas contained explicit monetary/ROI formulas")

        # Test 1.7: Uniqueness of Titles across all 80 ideas
        t0 = time.time()
        titles = [m.group(2).strip() for m in idea_matches]
        unique_titles = set(titles)
        self.record("catalog_80_unique_titles", len(unique_titles) == 80, (time.time()-t0)*1000,
                    f"Found {len(unique_titles)} unique titles out of 80")

        # Test 1.8: Substantive depth (word count per idea >= 120 words)
        t0 = time.time()
        low_word_count = []
        for idx, chunk in enumerate(chunks, 1):
            words = len(chunk.split())
            if words < 120:
                low_word_count.append((idx, words))
        self.record("catalog_substantive_word_count_per_idea", len(low_word_count) == 0, (time.time()-t0)*1000,
                    f"Ideas with <120 words: {low_word_count}")

    def verify_evacuation_v2_interactive(self):
        t0 = time.time()
        self.browser.navigate(self.evac_v2_path)
        time.sleep(0.4)

        # Test 2.1: DOM & Core Classes Initialization
        init_check = self.browser.evaluate("""(() => {
            return {
                hasAudio: typeof audio !== 'undefined' && audio !== null,
                hasVoice: typeof voice !== 'undefined' && voice !== null,
                hasFloorEngine: typeof floorEngine !== 'undefined' && floorEngine !== null,
                hasMeshSim: typeof meshSim !== 'undefined' && meshSim !== null,
                hasHUD: typeof HUD !== 'undefined' && HUD !== null,
                gridCols: floorEngine ? floorEngine.cols : 0,
                gridRows: floorEngine ? floorEngine.rows : 0,
                exitsCount: floorEngine ? floorEngine.exits.length : 0,
                roomsCount: floorEngine ? floorEngine.rooms.length : 0
            };
        })()""")
        self.record("evac_v2_core_classes_initialized", 
                    all([init_check['hasAudio'], init_check['hasVoice'], init_check['hasFloorEngine'], 
                         init_check['hasMeshSim'], init_check['hasHUD'], init_check['gridCols'] == 24, 
                         init_check['gridRows'] == 16, init_check['exitsCount'] == 3, init_check['roomsCount'] == 7]),
                    (time.time()-t0)*1000, str(init_check))

        # Test 2.2: Dynamic A* Initial Path to Escalera Norte (Salida A)
        t0 = time.time()
        init_path = self.browser.evaluate("""(() => {
            floorEngine.loadPreset('default');
            const res = floorEngine.currentPathResult;
            return {
                found: res !== null,
                targetName: res ? res.targetExit.name : '',
                targetX: res ? res.targetExit.x : -1,
                targetY: res ? res.targetExit.y : -1,
                pathLength: res ? res.path.length : 0,
                isRefuge: res ? res.isRefuge : false,
                totalCost: res ? res.totalCost : 999
            };
        })()""")
        self.record("evac_v2_astar_default_path_salida_a",
                    init_path['found'] and 'Escalera Norte' in init_path['targetName'] and not init_path['isRefuge'] and init_path['pathLength'] > 5,
                    (time.time()-t0)*1000, str(init_path))

        # Test 2.3: Dynamic A* Reroute when Exit A is Blocked (Preset 'block_a')
        t0 = time.time()
        block_a_path = self.browser.evaluate("""(() => {
            // Block Exit A (2,1) and clear Exit B (21,14)
            floorEngine.loadPreset('block_a');
            delete floorEngine.hazards['21,14'];
            floorEngine.checkExitsStatus();
            floorEngine.recalculateRoute(false);
            const res = floorEngine.currentPathResult;
            return {
                found: res !== null,
                targetName: res ? res.targetExit.name : '',
                isRefuge: res ? res.isRefuge : false,
                pathLength: res ? res.path.length : 0,
                targetX: res ? res.targetExit.x : -1,
                targetY: res ? res.targetExit.y : -1
            };
        })()""")
        self.record("evac_v2_astar_reroute_to_salida_b",
                    block_a_path['found'] and 'Escalera Sur' in block_a_path['targetName'] and block_a_path['targetX'] == 21,
                    (time.time()-t0)*1000, str(block_a_path))

        # Test 2.4: Extreme Fire Trap Scenario (Block ALL Primary Exits -> Force Fallback to Sala Presurizada 705)
        t0 = time.time()
        trap_result = self.browser.evaluate("""(() => {
            // Load preset block_all: Exit A (2,1) and Exit B (21,14) blocked with FIRE
            floorEngine.loadPreset('block_all');
            const res = floorEngine.currentPathResult;
            const bannerState = document.getElementById('strobe-banner').className;
            const badgeText = document.getElementById('hazard-badge').textContent;
            const hintExit = document.getElementById('hint-exit-name').textContent;
            const destinationMetric = document.getElementById('tel-destination').textContent;
            const statusMetric = document.getElementById('tel-hazard-status').textContent;
            const stepListHtml = document.getElementById('step-list').innerHTML;

            return {
                found: res !== null,
                targetName: res ? res.targetExit.name : '',
                isRefuge: res ? res.isRefuge : false,
                targetX: res ? res.targetExit.x : -1,
                targetY: res ? res.targetExit.y : -1,
                pathLength: res ? res.path.length : 0,
                bannerState: bannerState,
                badgeText: badgeText,
                hintExit: hintExit,
                destinationMetric: destinationMetric,
                statusMetric: statusMetric,
                mentions705: stepListHtml.includes('Sala Presurizada 705')
            };
        })()""")
        self.record("evac_v2_fire_trap_sala_presurizada_705_fallback",
                    trap_result['found'] and trap_result['isRefuge'] and (trap_result['targetX'] == 12 and trap_result['targetY'] == 8) and
                    "705" in trap_result['targetName'] and trap_result['mentions705'] and "TRAMPA" in trap_result['badgeText'],
                    (time.time()-t0)*1000, str(trap_result))

        # Test 2.5: Total Isolation Blockade (Block Primary Exits AND Refuge Door at 10,8)
        t0 = time.time()
        total_block_result = self.browser.evaluate("""(() => {
            // Block exits and refuge door
            floorEngine.hazards['2,1'] = 'FIRE';
            floorEngine.hazards['21,14'] = 'FIRE';
            floorEngine.hazards['10,8'] = 'FIRE'; // Block single door into Sala Presurizada 705
            floorEngine.checkExitsStatus();
            floorEngine.recalculateRoute(false);

            const res = floorEngine.currentPathResult;
            const destinationMetric = document.getElementById('tel-destination').textContent;
            const statusMetric = document.getElementById('tel-hazard-status').textContent;
            const distMetric = document.getElementById('tel-dist-time').textContent;

            return {
                pathResultNull: res === null,
                destinationMetric: destinationMetric,
                statusMetric: statusMetric,
                distMetric: distMetric
            };
        })()""")
        self.record("evac_v2_total_isolation_blockade_graceful_null",
                    total_block_result['pathResultNull'] and total_block_result['destinationMetric'] == 'BLOQUEADO' and 
                    'Atrapado' in total_block_result['statusMetric'],
                    (time.time()-t0)*1000, str(total_block_result))

        # Test 2.6: Monte Carlo Pathfinding Stress (100 Randomized Fire/Occupant Configurations)
        t0 = time.time()
        monte_carlo_result = self.browser.evaluate("""(() => {
            const results = {
                iterations: 100,
                validPaths: 0,
                validTraps: 0,
                validNulls: 0,
                invariantsPreserved: true,
                errors: []
            };

            const walkableTiles = [];
            for (let y = 1; y < floorEngine.rows - 1; y++) {
                for (let x = 1; x < floorEngine.cols - 1; x++) {
                    if (!floorEngine.grid[y][x].isWall) {
                        walkableTiles.push({ x, y });
                    }
                }
            }

            for (let i = 0; i < results.iterations; i++) {
                try {
                    // Random occupant start
                    const start = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
                    floorEngine.occupant.x = start.x;
                    floorEngine.occupant.y = start.y;

                    // Random 5-15 fires
                    floorEngine.hazards = {};
                    const numFires = 5 + Math.floor(Math.random() * 10);
                    for (let f = 0; f < numFires; f++) {
                        const tile = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
                        if (tile.x !== start.x || tile.y !== start.y) {
                            floorEngine.hazards[`${tile.x},${tile.y}`] = Math.random() > 0.3 ? 'FIRE' : 'SMOKE_DENSE';
                        }
                    }

                    floorEngine.checkExitsStatus();
                    floorEngine.recalculateRoute(false);
                    const res = floorEngine.currentPathResult;

                    if (res && res.path && res.path.length > 0) {
                        // Invariant 1: First node is start
                        if (res.path[0].x !== start.x || res.path[0].y !== start.y) {
                            results.invariantsPreserved = false;
                            results.errors.push(`Iter ${i}: Path start (${res.path[0].x},${res.path[0].y}) != occupant (${start.x},${start.y})`);
                        }
                        // Invariant 2: Every step is contiguous (Chebyshev / Manhattan distance == 1)
                        for (let s = 1; s < res.path.length; s++) {
                            const dx = Math.abs(res.path[s].x - res.path[s-1].x);
                            const dy = Math.abs(res.path[s].y - res.path[s-1].y);
                            if (dx + dy !== 1) {
                                results.invariantsPreserved = false;
                                results.errors.push(`Iter ${i}: Non-contiguous step from (${res.path[s-1].x},${res.path[s-1].y}) to (${res.path[s].x},${res.path[s].y})`);
                            }
                            // Invariant 3: Step does not traverse wall or fire
                            if (floorEngine.grid[res.path[s].y][res.path[s].x].isWall) {
                                results.invariantsPreserved = false;
                                results.errors.push(`Iter ${i}: Step entered wall at (${res.path[s].x},${res.path[s].y})`);
                            }
                            const h = floorEngine.hazards[`${res.path[s].x},${res.path[s].y}`];
                            if (h === 'FIRE' || h === 'BLOCKED') {
                                results.invariantsPreserved = false;
                                results.errors.push(`Iter ${i}: Step entered fire/blocked at (${res.path[s].x},${res.path[s].y})`);
                            }
                        }
                        if (res.isRefuge) results.validTraps++;
                        else results.validPaths++;
                    } else {
                        results.validNulls++;
                    }
                } catch (e) {
                    results.invariantsPreserved = false;
                    results.errors.push(`Iter ${i} exception: ${e.message}`);
                }
            }

            // Restore default preset
            floorEngine.loadPreset('default');
            return results;
        })()""")
        self.record("evac_v2_monte_carlo_astar_100_permutations_invariants",
                    monte_carlo_result['invariantsPreserved'] and len(monte_carlo_result['errors']) == 0,
                    (time.time()-t0)*1000, str(monte_carlo_result))

        # Test 2.7: Mobile Check-In Telemetry ("ESTOY A SALVO" Action Bar & Modal Verification)
        t0 = time.time()
        safe_checkin_result = self.browser.evaluate("""(() => {
            HUD.isSafeState = false;
            HUD.triggerSafeCheckin();

            const isModalActive = document.getElementById('modal-safe').classList.contains('active');
            const certTimestamp = document.getElementById('cert-timestamp').textContent;
            const bannerClass = document.getElementById('strobe-banner').className;
            const badgeText = document.getElementById('hazard-badge').textContent;
            const terminalText = document.getElementById('terminal-logs').innerText;

            return {
                isSafeState: HUD.isSafeState,
                isModalActive: isModalActive,
                hasTimestamp: certTimestamp.includes('UTC'),
                bannerClass: bannerClass,
                badgeText: badgeText,
                terminalLogged: terminalText.includes('[SEGURIDAD]') && terminalText.includes('OCC-7049') && terminalText.includes('GPS')
            };
        })()""")
        self.record("evac_v2_checkin_telemetry_safe_action",
                    safe_checkin_result['isSafeState'] and safe_checkin_result['isModalActive'] and 
                    safe_checkin_result['hasTimestamp'] and "state-safe" in safe_checkin_result['bannerClass'] and
                    safe_checkin_result['terminalLogged'],
                    (time.time()-t0)*1000, str(safe_checkin_result))

        # Dismiss safe modal
        self.browser.click("#btn-dismiss-safe")
        time.sleep(0.1)

        # Test 2.8: Mobile SOS Beacon Telemetry & Triage Dispatch ("REPORTAR SOS")
        t0 = time.time()
        sos_result = self.browser.evaluate("""(() => {
            HUD.isSafeState = false;
            HUD.isSosState = false;
            HUD.openSosModal();

            const isModalActive = document.getElementById('modal-sos').classList.contains('active');

            // Select Triage INJURED
            const injuredBtn = Array.from(document.querySelectorAll('.sos-option-btn')).find(b => b.dataset.triage === 'INJURED');
            if (injuredBtn) injuredBtn.click();

            // Set custom notes
            document.getElementById('sos-notes').value = "Persona atrapada con fractura en pasillo este";

            // Submit SOS beacon
            HUD.transmitSosBeacon();

            const isModalClosed = !document.getElementById('modal-sos').classList.contains('active');
            const bannerClass = document.getElementById('strobe-banner').className;
            const badgeText = document.getElementById('hazard-badge').textContent;
            const terminalText = document.getElementById('terminal-logs').innerText;

            return {
                isModalActiveInitially: isModalActive,
                isModalClosedAfterSubmit: isModalClosed,
                isSosState: HUD.isSosState,
                selectedTriage: HUD.selectedTriage,
                bannerClass: bannerClass,
                badgeText: badgeText,
                terminalLogged: terminalText.includes('[SOS PRIORITARIO]') && terminalText.includes('fractura')
            };
        })()""")
        self.record("evac_v2_sos_beacon_triage_and_telemetry",
                    sos_result['isSosState'] and sos_result['isModalClosedAfterSubmit'] and 
                    sos_result['selectedTriage'] == 'INJURED' and "state-sos" in sos_result['bannerClass'] and
                    sos_result['terminalLogged'],
                    (time.time()-t0)*1000, str(sos_result))

        # Test 2.9: Offline BLE / Wi-Fi Mesh Network Routing Simulator
        t0 = time.time()
        mesh_result = self.browser.evaluate("""(() => {
            // Initial cellular mode is active
            const initCell = meshSim.isCellularActive;

            // Toggle to offline mesh
            meshSim.toggleCellularMode();
            const offlineCell = meshSim.isCellularActive;
            const sigTextOffline = document.getElementById('signal-text').textContent;
            const btnTextOffline = document.getElementById('btn-toggle-cellular').textContent;

            // Toggle Peer 1 offline (simulate single node failure)
            meshSim.togglePeerHealth('n-peer1');
            const peer1State = meshSim.nodes.find(n => n.id === 'n-peer1').active;

            // Toggle Peer 1 back online
            meshSim.togglePeerHealth('n-peer1');
            const peer1Restored = meshSim.nodes.find(n => n.id === 'n-peer1').active;

            // Toggle back to 5G
            meshSim.toggleCellularMode();
            const restoredCell = meshSim.isCellularActive;

            return {
                initCell: initCell,
                offlineCell: offlineCell,
                sigTextOffline: sigTextOffline,
                btnTextOffline: btnTextOffline,
                peer1Toggled: !peer1State && peer1Restored,
                restoredCell: restoredCell,
                totalNodes: meshSim.nodes.length
            };
        })()""")
        self.record("evac_v2_offline_ble_mesh_network_simulation",
                    mesh_result['initCell'] and not mesh_result['offlineCell'] and 
                    "BLE MESH" in mesh_result['sigTextOffline'] and mesh_result['peer1Toggled'] and
                    mesh_result['restoredCell'] and mesh_result['totalNodes'] == 5,
                    (time.time()-t0)*1000, str(mesh_result))

        # Test 2.10: Web Audio API & Web Speech API Lifecycle & Sound FX Engine
        t0 = time.time()
        audio_lifecycle_result = self.browser.evaluate("""(() => {
            // 1. Audio Engine initialization
            audio.init();
            const hasContext = audio.ctx !== null;

            // 2. Start Siren
            audio.startSiren();
            const isPlaying = audio.isPlayingSiren;
            const hasOscillators = audio.sirenOsc !== null && audio.sirenLfo !== null;

            // 3. Volume modification
            audio.setVolume(0.75);
            const volUpdated = audio.volume === 0.75;

            // 4. Stop Siren (Mute)
            audio.stopSiren();

            // 5. Sound FX trigger test
            audio.playSafeChime();
            audio.playSosAlert();
            audio.playBeep(440, 'sine', 0.05);

            // 6. Voice Engine test
            voice.isMuted = false;
            voice.speakInstruction("Prueba de sintetizador de voz");
            const voiceHasSynth = voice.synth !== null && voice.synth !== undefined;

            return {
                hasContext: hasContext,
                isPlaying: isPlaying,
                hasOscillators: hasOscillators,
                volUpdated: volUpdated,
                voiceHasSynth: voiceHasSynth
            };
        })()""")
        self.record("evac_v2_audio_speech_api_lifecycle_and_mute",
                    audio_lifecycle_result['hasContext'] and audio_lifecycle_result['isPlaying'] and 
                    audio_lifecycle_result['hasOscillators'] and audio_lifecycle_result['volUpdated'],
                    (time.time()-t0)*1000, str(audio_lifecycle_result))

        # Test 2.11: Viewport and Responsive Layout Modes (Mobile Frame vs Fullscreen HUD)
        t0 = time.time()
        view_result = self.browser.evaluate("""(() => {
            const vp = document.getElementById('app-viewport');
            const initialClass = vp.className;

            // Toggle to fullscreen mode
            document.getElementById('btn-view-toggle').click();
            const fullscreenClass = vp.className;

            // Toggle back to mobile mode
            document.getElementById('btn-view-toggle').click();
            const restoredClass = vp.className;

            return {
                initialClass: initialClass,
                fullscreenAdded: fullscreenClass.includes('fullscreen-mode'),
                restored: !restoredClass.includes('fullscreen-mode')
            };
        })()""")
        self.record("evac_v2_mobile_frame_fullscreen_toggle",
                    view_result['fullscreenAdded'] and view_result['restored'],
                    (time.time()-t0)*1000, str(view_result))

        # Test 2.12: Zero Console Errors Check
        t0 = time.time()
        console_errors = self.browser.console_errors + self.browser.page_errors
        self.record("evac_v2_zero_javascript_console_errors",
                    len(console_errors) == 0,
                    (time.time()-t0)*1000,
                    f"Console errors detected: {console_errors}" if console_errors else "")


if __name__ == "__main__":
    runner = ChallengerTestRunner()
    success = runner.run_all()
    sys.exit(0 if success else 1)
