"""Tier 1 Feature Coverage Tests for R1: Apigee Multi-Cloud Gateway & MuleSoft Cockpit."""
import os
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, DOMInspector, TestCase


class TestR1DOMIntegrityAndTokens(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_dom_integrity_and_color_tokens",
            tier=1,
            deliverable="r1",
            description="Verifies DOM element IDs, color palette tokens, and zero external runtime dependencies.",
        )

    def execute(self, context: Dict[str, Any]):
        file_path = "sistemas/apigee-mulesoft-hybrid/index.html"
        self.assert_true(os.path.exists(file_path), f"Deliverable file {file_path} must exist")

        inspector = DOMInspector(file_path)
        dep_check = inspector.verify_zero_external_dependencies()
        self.assert_true(
            dep_check["is_valid"],
            f"Disallowed external dependencies detected: {dep_check}",
        )

        expected_ids = [
            "packetCanvas",
            "btnRunE2E",
            "btnToggleCache",
            "btnInjectSpike",
            "btnExpireToken",
            "btnInjectWAF",
            "btnInjectLag",
            "btnScaleWorkers",
            "btnMuteAudio",
            "corrIdDisplay",
            "e2eLatencyDisplay",
            "cacheStatusBadge",
            "circuitStatusBadge",
            "vcoreGaugeVal",
            "heapGaugeVal",
            "gcPauseGaugeVal",
            "osHitGaugeVal",
            "logList",
            "dwCode",
        ]
        for eid in expected_ids:
            self.assert_true(inspector.has_id(eid), f"Missing expected DOM ID: #{eid}")

        color_tokens = ["#00e5ff", "#f59e0b", "#8b5cf6", "#00ff88", "#ff0055", "#030812"]
        token_results = inspector.verify_color_tokens(color_tokens)
        for token, present in token_results.items():
            self.assert_true(present, f"Missing required color token {token}")


class TestR1SpikeArrestPolicy(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_spike_arrest_policy_and_429",
            tier=1,
            deliverable="r1",
            description="Verifies Spike Arrest 10,000 RPS policy enforcement and HTTP 429 rate limit injection.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        self.assert_no_console_errors(browser)

        browser.click("#btnInjectSpike")
        time.sleep(0.2)

        spike_badge = browser.get_text_content("#spikePolicyBadge") or ""
        self.assert_true(
            "429" in spike_badge or "THROTTLE" in spike_badge,
            f"Expected 429 THROTTLED badge, got: {spike_badge}",
        )


class TestR1OAuth2JWTVerification(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_oauth2_jwt_verification_and_401",
            tier=1,
            deliverable="r1",
            description="Verifies OAuth2 JWT RS256 token verification and expired token 401 handling.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        browser.click("#btnExpireToken")
        time.sleep(0.2)

        jwt_badge = browser.get_text_content("#jwtPolicyBadge") or ""
        self.assert_true(
            "401" in jwt_badge or "EXPIRED" in jwt_badge or "REJECT" in jwt_badge,
            f"Expected 401 EXPIRED badge, got: {jwt_badge}",
        )


class TestR1ResponseCacheAtEdge(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_response_cache_toggle_and_hit_status",
            tier=1,
            deliverable="r1",
            description="Verifies Response Cache toggle, cachePolicyBadge state, and edge cache activation.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        initial_badge = browser.get_text_content("#cachePolicyBadge") or ""

        browser.click("#btnToggleCache")
        time.sleep(0.2)
        toggled_badge = browser.get_text_content("#cachePolicyBadge") or ""
        self.assert_not_equal(initial_badge, toggled_badge, "Expected cache policy badge to change on toggle")

        browser.click("#btnToggleCache")
        time.sleep(0.2)
        restored_badge = browser.get_text_content("#cachePolicyBadge") or ""
        self.assert_equal(initial_badge, restored_badge, "Expected cache policy badge to restore on second toggle")


class TestR1WAFThreatInspection(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_waf_threat_inspection_and_403",
            tier=1,
            deliverable="r1",
            description="Verifies Cloud Armor / CRS 3.3 WAF inspection and 403 Forbidden blocking.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        browser.click("#btnInjectWAF")
        time.sleep(0.2)

        waf_badge = browser.get_text_content("#wafPolicyBadge") or ""
        self.assert_true(
            "403" in waf_badge or "BLOCK" in waf_badge or "THREAT" in waf_badge,
            f"Expected 403 BLOCKED badge, got: {waf_badge}",
        )


class TestR1DataWeaveMappingEngine(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_dataweave_mapping_engine_and_preview",
            tier=1,
            deliverable="r1",
            description="Verifies DataWeave 2.0 transformation code display and settlement schema mappings.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        dw_code = browser.get_text_content("#dwCode") or ""
        self.assert_true(
            "%dw 2.0" in dw_code or "DataWeave" in dw_code or "payload" in dw_code,
            f"Expected DataWeave 2.0 code preview, got: {dw_code[:200]}",
        )


class TestR1WorkerVCorePoolTelemetry(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_worker_vcore_and_jvm_gauges",
            tier=1,
            deliverable="r1",
            description="Verifies vCore CPU utilization, JVM Heap memory, G1GC pauses, and Object Store hit ratio.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        vcore_val = browser.get_text_content("#vcoreGaugeVal") or ""
        heap_val = browser.get_text_content("#heapGaugeVal") or ""
        gc_val = browser.get_text_content("#gcPauseGaugeVal") or ""
        os_val = browser.get_text_content("#osHitGaugeVal") or ""

        self.assert_true(len(vcore_val) > 0, "Expected vCore gauge value")
        self.assert_true(len(heap_val) > 0, "Expected JVM Heap gauge value")
        self.assert_true(len(gc_val) > 0, "Expected G1GC gauge value")
        self.assert_true(len(os_val) > 0, "Expected Object Store gauge value")


class TestR1MultiCloudDownstreamAndWaterfall(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_multicloud_downstream_and_latency_waterfall",
            tier=1,
            deliverable="r1",
            description="Verifies downstream fan-out to AWS, GCP, SAP and latency decomposition waterfall segments.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        browser.click("#btnRunE2E")
        time.sleep(0.4)

        corr_id = browser.get_text_content("#corrIdDisplay") or ""
        self.assert_true(len(corr_id) > 0, "Expected non-empty correlation ID")

        segments = ["#waterfallBarApigee", "#waterfallBarMule", "#waterfallBarAWS", "#waterfallBarGCP", "#waterfallBarSAP"]
        for seg in segments:
            self.assert_true(browser.wait_for_selector(seg, timeout=2.0), f"Missing waterfall segment: {seg}")


def get_r1_tier1_tests() -> List[TestCase]:
    return [
        TestR1DOMIntegrityAndTokens(),
        TestR1SpikeArrestPolicy(),
        TestR1OAuth2JWTVerification(),
        TestR1ResponseCacheAtEdge(),
        TestR1WAFThreatInspection(),
        TestR1DataWeaveMappingEngine(),
        TestR1WorkerVCorePoolTelemetry(),
        TestR1MultiCloudDownstreamAndWaterfall(),
    ]
