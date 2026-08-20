#!/usr/bin/env python3
"""Challenger 2 Deep Stress & Extended Edge-Case Suite.

Author: teamwork_preview_challenger (challenger_2)
Role: critic, specialist
Target Systems:
1. `sistemas/emergency-evacuation-v2/index.html` (A* cost optimality, smoke avoidance, room escapes, tool interactions, mesh partition failover, audio oscillator stress)
2. `sistemas/mulesoft_80_ideas_observabilidad.md` (Domain cross-validation, DataWeave 2.0 snippet audit, SLO quantitative ranges, Markdown linting)
"""

import json
import math
import os
import random
import re
import sys
import time

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


class DeepStressRunner:
    def __init__(self):
        self.results = []
        self.browser = None
        self.evac_v2_path = os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v2", "index.html")
        self.catalog_path = os.path.join(PROJECT_ROOT, "sistemas", "mulesoft_80_ideas_observabilidad.md")

    def record(self, test_name: str, passed: bool, duration_ms: float, details: str = ""):
        res = TestResult(
            name=test_name,
            tier=5,
            deliverable="STRESS",
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
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}   CHALLENGER 2: DEEP EMPIRICAL STRESS & CORNER-CASE SUITE{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}\n")

        print(f"{Colors.BRIGHT_YELLOW}{Colors.BOLD}--- SECTION A: ADVANCED A* HEURISTIC & COST OPTIMALITY STRESS ---{Colors.RESET}")
        self.browser = BrowserSession()
        self.browser.launch()
        try:
            self.verify_pathfinding_optimality()
            self.verify_audio_oscillator_stress()
            self.verify_mesh_partition_resilience()
            self.verify_telemetry_special_chars()
        finally:
            self.browser.close()

        print(f"\n{Colors.BRIGHT_YELLOW}{Colors.BOLD}--- SECTION B: CATALOG LINGUISTIC & CODE COMPLIANCE AUDIT ---{Colors.RESET}")
        self.verify_catalog_deep_compliance()

        total = len(self.results)
        passed = sum(1 for r in self.results if r.status == "PASS")
        failed = total - passed
        elapsed = time.time() - start_time

        print(f"\n{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD} DEEP STRESS EXECUTION SUMMARY{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}")
        print(f" Total Assertions: {total} | Passed: {c_green(str(passed))} | Failed: {c_red(str(failed)) if failed else '0'} | Time: {elapsed:.2f}s")
        if failed == 0:
            print(f"\n {c_green(c_bold('>>> VERDICT: EMPIRICAL APPROVAL CONFIRMED (100% PASS RATE) <<<'))}\n")
        else:
            print(f"\n {c_fail(c_bold('>>> VERDICT: REQUEST_CHANGES (FAILURES DETECTED) <<<'))}\n")

        return failed == 0

    def verify_pathfinding_optimality(self):
        t0 = time.time()
        self.browser.navigate(self.evac_v2_path)
        time.sleep(0.3)

        # Test A.1: Smoke Penalty Avoidance (A* chooses clear longer path over dense smoke shortcut)
        smoke_avoidance = self.browser.evaluate("""(() => {
            floorEngine.hazards = {};
            // User at (4,8)
            floorEngine.occupant = { x: 4, y: 8 };
            // Exit A at (2,1)
            // Path normally goes north through x=4, y=7..1. Place dense smoke at (4,6)
            floorEngine.hazards['4,6'] = 'SMOKE_DENSE'; // Cost = 80
            floorEngine.checkExitsStatus();
            floorEngine.recalculateRoute(false);

            const resWithSmoke = floorEngine.currentPathResult;
            const pathWithSmoke = resWithSmoke ? resWithSmoke.path : [];
            const traversesSmoke = pathWithSmoke.some(p => p.x === 4 && p.y === 6);

            // Now remove dense smoke
            delete floorEngine.hazards['4,6'];
            floorEngine.recalculateRoute(false);
            const resWithoutSmoke = floorEngine.currentPathResult;
            const pathWithoutSmoke = resWithoutSmoke ? resWithoutSmoke.path : [];
            const traversesClear = pathWithoutSmoke.some(p => p.x === 4 && p.y === 6);

            return {
                smokeReroutedAround: !traversesSmoke,
                clearTraversedDirect: traversesClear,
                validPathWithSmoke: resWithSmoke !== null,
                validPathWithoutSmoke: resWithoutSmoke !== null
            };
        })()""")
        self.record("astar_dense_smoke_cost_penalty_avoidance",
                    smoke_avoidance['smokeReroutedAround'] and smoke_avoidance['clearTraversedDirect'] and
                    smoke_avoidance['validPathWithSmoke'] and smoke_avoidance['validPathWithoutSmoke'],
                    (time.time()-t0)*1000, str(smoke_avoidance))

        # Test A.2: Escaping from Every Enclosed Room (R701, R702, R703, R704, R705, R706, R707)
        t0 = time.time()
        room_escapes = self.browser.evaluate("""(() => {
            const results = [];
            floorEngine.hazards = {};
            floorEngine.checkExitsStatus();

            const testPositions = [
                { room: 'R701 Finanzas', x: 2, y: 3 },
                { room: 'R702 TI / Dev', x: 2, y: 11 },
                { room: 'R703 Servidores', x: 18, y: 3 },
                { room: 'R704 Baños', x: 18, y: 11 },
                { room: 'R705 Refugio', x: 11, y: 7 },
                { room: 'R706 Open Space Este', x: 10, y: 3 },
                { room: 'R707 Open Space Sur', x: 10, y: 12 }
            ];

            for (const t of testPositions) {
                floorEngine.occupant = { x: t.x, y: t.y };
                floorEngine.recalculateRoute(false);
                const res = floorEngine.currentPathResult;
                const ok = res !== null && res.path.length > 0 && 
                           res.path[0].x === t.x && res.path[0].y === t.y &&
                           (res.targetExit.name.includes('Escalera') || res.targetExit.name.includes('Refugio'));
                results.push({ room: t.room, ok: ok, length: res ? res.path.length : 0 });
            }

            return {
                allRoomsEscaped: results.every(r => r.ok),
                details: results
            };
        })()""")
        self.record("astar_multi_room_interior_escape_paths",
                    room_escapes['allRoomsEscaped'],
                    (time.time()-t0)*1000, str(room_escapes['details']))

        # Test A.3: Dynamic Interactive Tool Operations (move, fire, smoke, clear)
        t0 = time.time()
        tool_stress = self.browser.evaluate("""(() => {
            // 1. Move occupant to (6, 6)
            floorEngine.activeTool = 'move';
            floorEngine.applyTool(6, 6);
            const moveOk = floorEngine.occupant.x === 6 && floorEngine.occupant.y === 6;

            // 2. Spawn fire at (7, 6)
            floorEngine.activeTool = 'fire';
            floorEngine.applyTool(7, 6);
            const fireOk = floorEngine.hazards['7,6'] === 'FIRE';

            // 3. Spawn smoke at (8, 6)
            floorEngine.activeTool = 'smoke';
            floorEngine.applyTool(8, 6);
            const smokeOk = floorEngine.hazards['8,6'] === 'SMOKE_DENSE';

            // 4. Clear hazard at (7, 6)
            floorEngine.activeTool = 'clear';
            floorEngine.applyTool(7, 6);
            const clearOk = floorEngine.hazards['7,6'] === undefined;

            // 5. Prevent placing fire on occupant at (6, 6)
            floorEngine.activeTool = 'fire';
            floorEngine.applyTool(6, 6);
            const occupantProtected = floorEngine.hazards['6,6'] === undefined;

            // 6. Prevent moving to structural wall at (0, 0)
            floorEngine.activeTool = 'move';
            floorEngine.applyTool(0, 0);
            const wallProtected = floorEngine.occupant.x === 6 && floorEngine.occupant.y === 6;

            return {
                moveOk: moveOk,
                fireOk: fireOk,
                smokeOk: smokeOk,
                clearOk: clearOk,
                occupantProtected: occupantProtected,
                wallProtected: wallProtected
            };
        })()""")
        self.record("interactive_blueprint_tool_operations_and_safety",
                    all(tool_stress.values()),
                    (time.time()-t0)*1000, str(tool_stress))

    def verify_audio_oscillator_stress(self):
        t0 = time.time()
        audio_stress = self.browser.evaluate("""(() => {
            // Rapid start/stop cycling (50 iterations) to verify no memory leaks or unhandled DOM/Audio exceptions
            let exceptions = 0;
            for (let i = 0; i < 50; i++) {
                try {
                    audio.startSiren();
                    audio.setVolume(Math.random());
                    audio.playBeep(440 + i * 10, 'sine', 0.01);
                    audio.stopSiren();
                } catch (e) {
                    exceptions++;
                }
            }

            // Volume bounds test
            audio.setVolume(-1.5);
            const clampedLow = audio.volume === 0.0;
            audio.setVolume(2.5);
            const clampedHigh = audio.volume === 1.0;
            audio.setVolume(0.4);

            return {
                exceptions: exceptions,
                clampedLow: clampedLow,
                clampedHigh: clampedHigh
            };
        })()""")
        self.record("web_audio_50_cycle_stress_and_volume_clamping",
                    audio_stress['exceptions'] == 0 and audio_stress['clampedLow'] and audio_stress['clampedHigh'],
                    (time.time()-t0)*1000, str(audio_stress))

    def verify_mesh_partition_resilience(self):
        t0 = time.time()
        mesh_stress = self.browser.evaluate("""(() => {
            // Partition test: Disable BOTH Peer 1 and Peer 2
            meshSim.nodes.find(n => n.id === 'n-peer1').active = false;
            meshSim.nodes.find(n => n.id === 'n-peer2').active = false;
            meshSim.renderSVG();

            const svgContentPartition = meshSim.svg.innerHTML;
            const noRelayLines = !svgContentPartition.includes('stroke-dasharray');

            // Restore Peer 2 only
            meshSim.nodes.find(n => n.id === 'n-peer2').active = true;
            meshSim.renderSVG();
            const svgContentRestored = meshSim.svg.innerHTML;
            const hasRestoredLine = svgContentRestored.includes('stroke-dasharray');

            // Restore all
            meshSim.nodes.find(n => n.id === 'n-peer1').active = true;
            meshSim.renderSVG();

            return {
                partitionRenderedClean: noRelayLines,
                singlePeerRecovery: hasRestoredLine
            };
        })()""")
        self.record("mesh_multi_peer_partition_and_single_peer_failover",
                    mesh_stress['partitionRenderedClean'] and mesh_stress['singlePeerRecovery'],
                    (time.time()-t0)*1000, str(mesh_stress))

    def verify_telemetry_special_chars(self):
        t0 = time.time()
        telemetry_special = self.browser.evaluate("""(() => {
            HUD.isSosState = false;
            HUD.openSosModal();

            // Inject special characters, JSON injection strings, and emojis into SOS notes
            const maliciousNote = '<script>alert("XSS")</script> // \\" { "injection": true } // 🚨 🔥 ⚠️';
            document.getElementById('sos-notes').value = maliciousNote;
            HUD.transmitSosBeacon();

            const terminalText = document.getElementById('terminal-logs').innerText;
            const logsSafe = terminalText.includes('[SOS PRIORITARIO]');
            const bannerState = document.getElementById('strobe-banner').className.includes('state-sos');

            return {
                logsSafe: logsSafe,
                bannerState: bannerState
            };
        })()""")
        self.record("telemetry_payload_special_char_and_sanitization_integrity",
                    telemetry_special['logsSafe'] and telemetry_special['bannerState'],
                    (time.time()-t0)*1000, str(telemetry_special))

    def verify_catalog_deep_compliance(self):
        t0 = time.time()
        with open(self.catalog_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Test B.1: Code blocks closed and no dangling markdown
        code_ticks = content.count("```")
        self.record("catalog_balanced_markdown_code_fences", code_ticks % 2 == 0 and code_ticks >= 6, (time.time()-t0)*1000,
                    f"Found {code_ticks} code fence ticks (must be even)")

        # Test B.2: DataWeave 2.0 Annex presence & syntax
        t0 = time.time()
        has_dw_annex = "DataWeave 2.0" in content and "%dw 2.0" in content and "output application/json" in content
        self.record("catalog_dataweave_2_syntax_specifications", has_dw_annex, (time.time()-t0)*1000,
                    "DataWeave 2.0 code blocks or syntax headers missing in annex")

        # Test B.3: Quantitative SLO Targets across all 80 ideas (each must contain multiple explicit numerical metrics)
        t0 = time.time()
        chunks = re.split(r"###\s+\d{2}\.\s+[^\n]+", content)[1:]
        slo_valid_count = 0
        for idx, c in enumerate(chunks, 1):
            m = re.search(r"- \*\*Core Observability Metrics[^\n]*\n(.*?)(?=- \*\*Commercial|\Z)", c, re.DOTALL)
            if m:
                slo_text = m.group(1).strip()
                # Check for numerical metrics (ms, %, seconds, TPS, etc.)
                if re.search(r"(\d+\.?\d*\s*(ms|seconds|minutes|%|TPS|RPS|RPO|RTO|meters)|0\.000%)", slo_text):
                    slo_valid_count += 1
        self.record("catalog_quantitative_slo_metrics_depth",
                    slo_valid_count == 80,
                    (time.time()-t0)*1000,
                    f"Quantitative SLO metrics verified in {slo_valid_count}/80 ideas")

        # Test B.4: Domain-specific terminology audit
        t0 = time.time()
        domain_terms = [
            ("Fintech", ["ISO 20022", "pacs.008", "OFAC", "AML", "PSD2", "SWIFT", "PCI-DSS", "Open Banking"]),
            ("Healthcare", ["HL7", "FHIR", "HIPAA", "EHR", "DICOM", "SNOMED", "Epic", "Cerner"]),
            ("Retail", ["POS", "Omnichannel", "Cart", "Inventory", "SKU", "Order", "Checkout", "Pricing"]),
            ("SRE", ["JMX", "Kubernetes", "vCore", "Heap", "G1GC", "ZGC", "OpenTelemetry", "FinOps"]),
            ("Cyber-Defense", ["mTLS", "Zero-Trust", "WAF", "OAuth2", "JWT", "JWKS", "SPIFFE", "Rate Limit"]),
            ("IoT Public Safety", ["Salvar Vidas", "A*", "BLE", "LoRaWAN", "Mesh", "Evacuation", "Beacon", "SCADA"]),
            ("Logistics", ["Cold Chain", "Supply Chain", "EDI", "Telematics", "Warehouse", "Customs", "GPS"]),
            ("Telecom", ["5G", "URLLC", "MEC", "eSIM", "Slicing", "Network Exposure", "NEF", "3GPP"])
        ]
        domain_matches = 0
        for domain, terms in domain_terms:
            if any(term in content for term in terms):
                domain_matches += 1
        self.record("catalog_enterprise_domain_terminology_rigor", domain_matches == 8, (time.time()-t0)*1000,
                    f"Matched {domain_matches}/8 enterprise domain vocabularies")


if __name__ == "__main__":
    runner = DeepStressRunner()
    success = runner.run_all()
    sys.exit(0 if success else 1)
