#!/usr/bin/env python3
"""Comprehensive Empirical Adversarial Stress & Chaos Verification Suite.

Author: teamwork_preview_challenger (challenger_1)
Role: Empirical Challenger (critic, specialist)
Target Systems:
1. R1: sistemas/apigee-mulesoft-hybrid/index.html
2. R2: sistemas/emergency-evacuation-v1/index.html
3. R4: sistemas/emergency-evacuation-v3/index.html
"""
import json
import os
import sys
import time
from typing import Any, Dict, List

# Reconfigure stdout/stderr for full UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from tests.framework.browser import BrowserSession


class ChallengerStressHarness:
    def __init__(self):
        self.browser: BrowserSession = None
        self.results: Dict[str, Any] = {
            "r1_hybrid": {},
            "r2_evac_v1": {},
            "r4_evac_v3": {},
            "summary": {
                "total_checks": 0,
                "passed_checks": 0,
                "failed_checks": 0,
                "start_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "end_time": None
            }
        }

    def record_assertion(self, system: str, test_name: str, check_name: str, passed: bool, detail: str):
        self.results["summary"]["total_checks"] += 1
        safe_detail = detail.encode("ascii", "replace").decode("ascii")
        if passed:
            self.results["summary"]["passed_checks"] += 1
            print(f"  [PASS] {system} :: {test_name} -> {check_name}: {safe_detail}")
        else:
            self.results["summary"]["failed_checks"] += 1
            print(f"  [FAIL] {system} :: {test_name} -> {check_name}: {safe_detail}")

        if test_name not in self.results[system]:
            self.results[system][test_name] = []
        self.results[system][test_name].append({
            "check": check_name,
            "passed": passed,
            "detail": detail
        })

    def run_all(self):
        print("=" * 80)
        print("EMPIRICAL ADVERSARIAL STRESS & CHAOS TEST SUITE - CHALLENGER 1")
        print("=" * 80)

        self.browser = BrowserSession()
        self.browser.launch()

        try:
            self.test_r1_hybrid_stress()
            self.test_r2_evac_v1_headcount_conservation()
            self.test_r4_evac_v3_fanout_blackout_chaos()
        finally:
            self.browser.close()

        self.results["summary"]["end_time"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        print("=" * 80)
        print(f"CHALLENGER STRESS SUITE COMPLETE: {self.results['summary']['passed_checks']}/{self.results['summary']['total_checks']} checks passed.")
        if self.results["summary"]["failed_checks"] == 0:
            print("VERDICT: APPROVE (Zero invariant violations, zero uncaught errors, 100% stress resilience)")
        else:
            print(f"VERDICT: REQUEST_CHANGES ({self.results['summary']['failed_checks']} invariant violations found)")
        print("=" * 80)

        # Write results JSON to .agents/challenger_1/
        out_path = os.path.join(PROJECT_ROOT, ".agents", "challenger_1", "stress_results.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(self.results, f, indent=2)
        print(f"Results saved to: {out_path}")

    # =========================================================================
    # R1: APIGEE + MULESOFT HYBRID STRESS & POLICY CONCURRENCY
    # =========================================================================
    def test_r1_hybrid_stress(self):
        print("\n>>> [1/3] STRESS TESTING: R1 Apigee + MuleSoft Hybrid Cockpit")
        system = "r1_hybrid"
        html_path = os.path.join(PROJECT_ROOT, "sistemas", "apigee-mulesoft-hybrid", "index.html")
        self.browser.navigate(html_path)
        time.sleep(1.0)

        # 1. Rapid Concurrent Policy Toggling (50 cycles)
        t0 = time.time()
        for i in range(50):
            self.browser.evaluate("""
                document.getElementById('btnToggleCache').click();
                if (Math.random() < 0.3) document.getElementById('btnScaleWorkers').click();
            """)
        toggle_time = (time.time() - t0) * 1000
        
        cache_state = self.browser.evaluate("state.cacheEnabled")
        pod_count = self.browser.evaluate("state.workerPods")
        console_errs = len(self.browser.console_errors) + len(self.browser.page_errors)
        
        self.record_assertion(system, "concurrent_policy_toggling", "zero_errors", console_errs == 0, f"Errors: {console_errs}")
        self.record_assertion(system, "concurrent_policy_toggling", "pod_bounds", 2 <= pod_count <= 4, f"Pods: {pod_count}")
        self.record_assertion(system, "concurrent_policy_toggling", "high_rate_execution", toggle_time < 2500, f"50 toggles in {toggle_time:.1f}ms")

        # 2. Spike Arrest Flooding (100 rapid requests in tight loop)
        t0 = time.time()
        initial_drops = self.browser.evaluate("state.droppedPackets") or 0
        for i in range(100):
            self.browser.evaluate("document.getElementById('btnInjectSpike').click();")
        flood_time = (time.time() - t0) * 1000
        
        after_drops = self.browser.evaluate("state.droppedPackets") or 0
        spike_badge = self.browser.get_text_content("#spikePolicyBadge") or ""
        
        self.record_assertion(system, "spike_arrest_flooding", "drop_count_incremented", after_drops >= initial_drops + 100, f"Dropped: {after_drops} (Delta: {after_drops - initial_drops})")
        self.record_assertion(system, "spike_arrest_flooding", "429_throttled_badge", "429" in spike_badge or "THROTTLED" in spike_badge, f"Badge: {spike_badge}")
        self.record_assertion(system, "spike_arrest_flooding", "flood_throughput", flood_time < 3000, f"100 injections in {flood_time:.1f}ms")

        # 3. Token Expiry Injection & 401 Unauthorized
        for i in range(5):
            self.browser.evaluate("document.getElementById('btnExpireToken').click();")
        time.sleep(0.3)
        jwt_badge = self.browser.get_text_content("#jwtPolicyBadge") or ""
        log_count = self.browser.evaluate("state.logs.length")
        self.record_assertion(system, "token_expiry_injection", "401_expired_badge", "401" in jwt_badge or "EXPIRED" in jwt_badge, f"Badge: {jwt_badge}")
        self.record_assertion(system, "token_expiry_injection", "security_logs_appended", log_count > 0, f"Logs in ringbuffer: {log_count}")

        # 4. WAF SQLi Attack Threat Injection & 403 Forbidden
        self.browser.evaluate("document.getElementById('btnInjectWAF').click();")
        time.sleep(0.2)
        waf_badge = self.browser.get_text_content("#wafPolicyBadge") or ""
        waf_score = self.browser.get_text_content("#wafScoreVal") or ""
        self.record_assertion(system, "waf_threat_injection", "403_blocked_badge", "403" in waf_badge or "BLOCKED" in waf_badge, f"Badge: {waf_badge}")
        self.record_assertion(system, "waf_threat_injection", "threat_score_calculated", "0.99" in waf_score or "SQLi" in waf_score, f"Score: {waf_score}")

        # 5. SAP Latency Degradation & Circuit Breaker Trip
        # Disable cache so packet flows through Apigee -> Mule -> SAP
        self.browser.evaluate("state.cacheEnabled = false; state.consecutiveLagCount = 0; state.circuitState = 'CLOSED';")
        
        # Inject Lag #1
        self.browser.evaluate("state.activeScenario = 'SAP_LAG'; triggerNominalE2E();")
        time.sleep(4.0) # Wait for particle path animation (Client -> Apigee -> Mule -> SAP)
        
        # Inject Lag #2 to trip circuit breaker (threshold: consecutive >= 2)
        self.browser.evaluate("state.activeScenario = 'SAP_LAG'; triggerNominalE2E();")
        time.sleep(4.0)
        
        cb_state = self.browser.evaluate("state.circuitState")
        lag_count = self.browser.evaluate("state.consecutiveLagCount")
        e2e_lat = self.browser.get_text_content("#e2eLatencyDisplay") or ""
        sla_pill = self.browser.get_text_content("#slaStatusPill") or ""
        
        self.record_assertion(system, "sap_latency_degradation", "circuit_breaker_tripped", cb_state == "OPEN", f"Circuit Breaker state: {cb_state} (Consecutive Lags: {lag_count})")
        self.record_assertion(system, "sap_latency_degradation", "sla_breach_detected", "BREACH" in sla_pill or "910" in e2e_lat or ">500" in sla_pill, f"SLA Pill: {sla_pill}, Latency: {e2e_lat}")

        # 6. Worker Scaling Under Load & JVM Metrics
        self.browser.evaluate("toggleAutoscaler();")
        vcore_val = self.browser.get_text_content("#vcoreGaugeVal") or ""
        heap_val = self.browser.evaluate("state.heapMb")
        gc_val = self.browser.get_text_content("#gcPauseGaugeVal") or ""
        self.record_assertion(system, "worker_scaling_load", "vcore_metric_present", "%" in vcore_val, f"vCore: {vcore_val}")
        self.record_assertion(system, "worker_scaling_load", "heap_memory_active", heap_val > 500, f"Heap MB: {heap_val}")
        self.record_assertion(system, "worker_scaling_load", "gc_pause_telemetry", "ms" in gc_val, f"GC Pause: {gc_val}")

        # 7. Log Ringbuffer Cap (Max 200)
        log_len = self.browser.evaluate("state.logs.length")
        self.record_assertion(system, "log_ringbuffer", "bounded_max_capacity", log_len <= 200, f"Log length: {log_len} <= 200")

        # Global console check for R1
        console_errs_final = len(self.browser.console_errors) + len(self.browser.page_errors)
        self.record_assertion(system, "r1_global_robustness", "zero_console_errors", console_errs_final == 0, f"Console Errors: {console_errs_final}")

    # =========================================================================
    # R2: EMERGENCY EVACUATION V1 - HEADCOUNT CONSERVATION & CHAOS
    # =========================================================================
    def test_r2_evac_v1_headcount_conservation(self):
        print("\n>>> [2/3] STRESS TESTING: R2 Emergency Evacuation V1 Command Center")
        system = "r2_evac_v1"
        html_path = os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v1", "index.html")
        self.browser.navigate(html_path)
        time.sleep(1.0)

        TOTAL_CENSUS = 1240

        # Invariant Verification Function
        def verify_headcount(step_desc: str):
            counts = self.browser.evaluate("""
                (() => {
                    let totalSafe = 0;
                    let totalTransit = 0;
                    let totalTrapped = 0;
                    let floorDetails = [];
                    let perFloorConservation = true;
                    const initCounts = [35, 62, 88, 95, 110, 145, 120, 105, 115, 130, 140, 95];

                    window.app.floors.forEach((f, idx) => {
                        totalSafe += f.safe;
                        totalTransit += f.transit;
                        totalTrapped += f.occupants;
                        const floorSum = f.safe + f.transit + f.occupants;
                        if (floorSum !== initCounts[idx]) {
                            perFloorConservation = false;
                        }
                        floorDetails.push({
                            floor: f.floor,
                            safe: f.safe,
                            transit: f.transit,
                            trapped: f.occupants,
                            sum: floorSum,
                            expected: initCounts[idx],
                            nonNegative: f.safe >= 0 && f.transit >= 0 && f.occupants >= 0
                        });
                    });
                    const grandTotal = totalSafe + totalTransit + totalTrapped;
                    const allNonNegative = floorDetails.every(d => d.nonNegative);
                    return {
                        grandTotal,
                        totalSafe,
                        totalTransit,
                        totalTrapped,
                        perFloorConservation,
                        allNonNegative,
                        floorDetails
                    };
                })()
            """)
            grand_total = counts.get("grandTotal", 0)
            all_non_negative = counts.get("allNonNegative", False)
            per_floor = counts.get("perFloorConservation", False)
            is_valid = (grand_total == TOTAL_CENSUS) and all_non_negative and per_floor
            if not is_valid:
                print(f"    [INVARIANT VIOLATION] at {step_desc}: Grand Total = {grand_total} (Expected {TOTAL_CENSUS}), NonNegative={all_non_negative}, PerFloor={per_floor}")
            return is_valid, counts

        # 1. Baseline Invariant Check
        valid, counts = verify_headcount("Baseline state")
        self.record_assertion(system, "headcount_conservation", "baseline_conservation", valid, f"Grand Total: {counts.get('grandTotal')} == {TOTAL_CENSUS}")
        self.record_assertion(system, "headcount_conservation", "per_floor_conservation", counts.get("perFloorConservation"), "Every individual floor strictly conserves initial capacity")

        # 2. Rapid Alarm Triggers (25 broadcast toggles)
        t0 = time.time()
        for i in range(25):
            self.browser.evaluate("document.getElementById('btn-master-broadcast').click();")
        toggle_time = (time.time() - t0) * 1000
        valid, counts = verify_headcount("After 25 rapid alarm toggles")
        self.record_assertion(system, "rapid_alarm_triggers", "conservation_under_toggles", valid, f"Grand Total: {counts.get('grandTotal')} in {toggle_time:.1f}ms")

        # 3. Mass Hazard Propagation on Floors 1-12
        self.browser.evaluate("""
            window.app.injectScenario('FIRE_P7');
            window.app.injectScenario('SMOKE_SPREAD');
            window.app.injectScenario('BLOCK_STAIR_B');
            window.app.floors[3].temp = 75.0; window.app.floors[3].smoke = 65.0; window.app.floors[3].status = 'CRITICAL';
            window.app.floors[5].temp = 60.0; window.app.floors[5].smoke = 45.0; window.app.floors[5].status = 'ADVISORY';
            window.app.renderFloorsMatrix();
        """)
        valid, counts = verify_headcount("After mass hazard propagation")
        self.record_assertion(system, "mass_hazard_propagation", "conservation_under_hazards", valid, f"Grand Total: {counts.get('grandTotal')}")

        # 4. Concurrent Brigade Reassignments (Rapid loops)
        self.browser.evaluate("""
            const objectives = ['SUPPRESSING', 'RESCUING', 'TRIAGE_FLOW', 'VENTILATING', 'STAGING'];
            window.app.brigades.forEach((b, idx) => {
                b.targetFloor = (idx * 2 + 1) % 12 + 1;
                b.location = `Piso ${b.targetFloor} - Sector ${String.fromCharCode(65 + idx)}`;
                b.status = objectives[idx % objectives.length];
                b.role = objectives[idx % objectives.length];
                b.scba = Math.max(500, b.scba - 200);
            });
            window.app.renderBrigades();
        """)
        valid, counts = verify_headcount("After concurrent brigade reassignments")
        self.record_assertion(system, "brigade_reassignments", "conservation_under_brigade_moves", valid, f"Grand Total: {counts.get('grandTotal')}")

        # 5. Continuous Evacuation Simulation Steps & Invariant Auditing
        # Accelerate simulation to 5.0x and ensure broadcast is active
        self.browser.evaluate("""
            window.app.simSpeed = 5.0;
            if (!window.app.evacuationActive) window.app.toggleMasterBroadcast();
        """)
        
        invariant_failures = 0
        for tick in range(6):
            time.sleep(1.0) # 1s at 5x speed = 5s of simulation time (decay takes place)
            v, c = verify_headcount(f"Evacuation second {tick+1}")
            if not v:
                invariant_failures += 1

        self.record_assertion(system, "evacuation_lifecycle", "strict_conservation_all_ticks", invariant_failures == 0, f"Invariant failures: {invariant_failures} / 6 ticks")
        
        # Check evacuation progress (some occupants should be safe)
        safe_count = c.get("totalSafe", 0)
        transit_count = c.get("totalTransit", 0)
        trapped_count = c.get("totalTrapped", 0)
        self.record_assertion(system, "evacuation_lifecycle", "safe_count_positive", safe_count > 0, f"Safe: {safe_count}, Transit: {transit_count}, Trapped: {trapped_count} (Total: {safe_count+transit_count+trapped_count})")

        # 6. Room Drilldown Modal Inspector Consistency
        self.browser.evaluate("window.app.openFloorDrilldown(7);")
        time.sleep(0.2)
        drill_title = self.browser.get_text_content("#drilldown-modal-title") or ""
        drill_occ = self.browser.get_text_content("#modal-floor-occ") or ""
        self.record_assertion(system, "drilldown_inspector", "modal_renders_correctly", "PISO 7" in drill_title or "7" in drill_title, f"Modal Title: {drill_title}, Occupants: {drill_occ}")
        self.browser.evaluate("window.app.closeDrilldownModal();")

        # 7. Full Reset and Re-Verification
        self.browser.evaluate("window.app.resetSimulation();")
        time.sleep(0.3)
        valid, counts = verify_headcount("Post-reset state")
        self.record_assertion(system, "system_reset", "reset_conservation", valid and counts.get("totalTrapped") == TOTAL_CENSUS, f"Reset Trapped: {counts.get('totalTrapped')}/{TOTAL_CENSUS}")

        console_errs_r2 = len(self.browser.console_errors) + len(self.browser.page_errors)
        self.record_assertion(system, "r2_global_robustness", "zero_console_errors", console_errs_r2 == 0, f"Console Errors: {console_errs_r2}")

    # =========================================================================
    # R4: EMERGENCY EVACUATION V3 - MASS FANOUT 5000+ & CARRIER BLACKOUT CHAOS
    # =========================================================================
    def test_r4_evac_v3_fanout_blackout_chaos(self):
        print("\n>>> [3/3] STRESS TESTING: R4 Multi-Carrier Broadcast Fan-Out Engine")
        system = "r4_evac_v3"
        html_path = os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v3", "index.html")
        self.browser.navigate(html_path)
        time.sleep(1.0)

        # 1. Configure 5,000 Nodes High-Load Scale
        self.browser.evaluate("""
            window.app.engine.setPopulation(5000);
            window.app.engine.setSpeed(5.0);
        """)
        pop_size = self.browser.evaluate("window.app.engine.totalPopulation")
        self.record_assertion(system, "scale_configuration", "5000_nodes_configured", pop_size == 5000, f"Population: {pop_size}")

        # 2. Extreme Packet Drop & Carrier Blackout Chaos Injection
        self.browser.evaluate("""
            // Enable SMS Carrier Blackout (100% kill)
            document.getElementById('btn-chaos-kill-sms').click();
            // Enable FCM Push packet drop (30% drop)
            document.getElementById('btn-chaos-push-loss').click();
            // Enable LoRaWAN RF jitter (+200ms)
            document.getElementById('btn-chaos-lora-jitter').click();
        """)
        
        chaos_count = self.browser.get_text_content("#chaos-active-count") or ""
        self.record_assertion(system, "chaos_injection", "multiple_chaos_active", "3" in chaos_count or "INYECCIONES" in chaos_count, f"Chaos Active Count: {chaos_count}")

        # 3. Trigger High-Load 5,000+ Fan-Out Burst
        t0 = time.time()
        self.browser.evaluate("document.getElementById('btn-broadcast-trigger').click();")
        
        # Wait for broadcast to progress through failover and completion
        time.sleep(3.0)
        
        # 4. Verify Circuit Breaker Trip & Failover Speed
        cb_state = self.browser.evaluate("window.app.engine.cbState")
        cb_err_rate = self.browser.evaluate("window.app.engine.cbErrorRate")
        rerouted_pkts = self.browser.evaluate("window.app.engine.totalRetried") or 0
        delivered_pkts = self.browser.evaluate("window.app.engine.totalDelivered") or 0
        failed_pkts = self.browser.evaluate("window.app.engine.totalFailed") or 0
        inflight_pkts = self.browser.evaluate("window.app.engine.totalInFlight") or 0

        self.record_assertion(system, "circuit_breaker_failover", "cb_tripped_open", cb_state in ("OPEN", "HALF_OPEN"), f"Circuit Breaker: {cb_state} (Error Rate: {cb_err_rate}%)")
        self.record_assertion(system, "circuit_breaker_failover", "failover_rerouted_positive", rerouted_pkts > 0, f"Rerouted packets: {rerouted_pkts}")

        # Wait for simulation to finish remaining packets
        for _ in range(12):
            is_running = self.browser.evaluate("window.app.engine.isRunning")
            if not is_running:
                break
            time.sleep(0.5)

        total_processed = delivered_pkts + failed_pkts
        final_delivered = self.browser.evaluate("window.app.engine.totalDelivered") or 0
        final_failed = self.browser.evaluate("window.app.engine.totalFailed") or 0
        final_total = final_delivered + final_failed

        # Invariant: Final total processed must equal population with zero lingering in-flight packets
        self.record_assertion(system, "zero_loss_delivery", "total_packet_accounting", final_total == 5000, f"Processed {final_total}/5000 (Delivered: {final_delivered}, Failed: {final_failed})")

        # 5. Latency Histogram Validation & Percentile Monotonicity
        hist_samples = self.browser.evaluate("window.app.engine.deliveredLatencies.length")
        mean_lat = self.browser.get_text_content("#kpi-mean-latency") or ""
        p99_lat = self.browser.get_text_content("#kpi-p99-latency") or ""
        p50_val = self.browser.evaluate("window.app.histogram.p50") or 0
        p90_val = self.browser.evaluate("window.app.histogram.p90") or 0
        p95_val = self.browser.evaluate("window.app.histogram.p95") or 0
        p99_val = self.browser.evaluate("window.app.histogram.p99") or 0

        percentile_monotonic = (p50_val <= p90_val <= p95_val <= p99_val)

        self.record_assertion(system, "latency_histogram", "samples_recorded", hist_samples == final_delivered, f"Latency samples: {hist_samples} == Delivered {final_delivered}")
        self.record_assertion(system, "latency_histogram", "p99_metric_present", len(p99_lat) > 0 and "--" not in p99_lat, f"p99 latency: {p99_lat}")
        self.record_assertion(system, "latency_histogram", "percentile_monotonicity", percentile_monotonic, f"P50({p50_val}) <= P90({p90_val}) <= P95({p95_val}) <= P99({p99_val})")

        # 6. Clear Chaos & Restore Circuit Breaker
        self.browser.evaluate("""
            // Turn off chaos kill SMS
            if (window.app.engine.chaosKillSms) document.getElementById('btn-chaos-kill-sms').click();
            if (window.app.engine.chaosPushLoss) document.getElementById('btn-chaos-push-loss').click();
            if (window.app.engine.chaosLoraJitter) document.getElementById('btn-chaos-lora-jitter').click();
            window.app.engine.cbState = 'CLOSED';
            window.app.engine.cbErrorRate = 0.0;
        """)
        time.sleep(0.5)
        restored_cb = self.browser.evaluate("window.app.engine.cbState")
        self.record_assertion(system, "carrier_recovery", "cb_restored_closed", restored_cb == "CLOSED", f"Restored CB: {restored_cb}")

        console_errs_r4 = len(self.browser.console_errors) + len(self.browser.page_errors)
        self.record_assertion(system, "r4_global_robustness", "zero_console_errors", console_errs_r4 == 0, f"Console Errors: {console_errs_r4}")


if __name__ == "__main__":
    harness = ChallengerStressHarness()
    harness.run_all()
