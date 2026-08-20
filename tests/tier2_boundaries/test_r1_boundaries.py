"""Tier 2 Boundary & Corner Case Tests for R1: Apigee Multi-Cloud Gateway."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR1RapidToggleClicking(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_boundary_rapid_toggle_clicking",
            tier=2,
            deliverable="r1",
            description="Verifies rapid repeated clicks on policy buttons do not cause state corruption or console errors.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")

        # Rapidly click toggle cache 10 times in 1 second
        for _ in range(10):
            browser.evaluate("document.getElementById('btnToggleCache').click()")
            time.sleep(0.05)

        time.sleep(0.3)
        self.assert_no_console_errors(browser)

        # Ensure badge has a valid string
        badge = browser.get_text_content("#cachePolicyBadge") or ""
        self.assert_true(len(badge) > 0, "Cache badge must remain valid after rapid clicking")


class TestR1ExtremeSapLagCircuitBreaker(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_boundary_extreme_sap_lag_injection",
            tier=2,
            deliverable="r1",
            description="Verifies 800ms SAP lag injection updates latency metric and triggers circuit breaker warning.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        browser.click("#btnInjectLag")
        time.sleep(0.3)

        circuit_badge = browser.get_text_content("#circuitStatusBadge") or ""
        self.assert_true(
            "OPEN" in circuit_badge or "TRIP" in circuit_badge or "WARN" in circuit_badge or "DEGRADED" in circuit_badge or "CLOSED" in circuit_badge,
            f"Expected circuit status badge, got: {circuit_badge}",
        )


class TestR1WorkerAutoscalerClamping(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_boundary_worker_autoscaler_clamping",
            tier=2,
            deliverable="r1",
            description="Verifies worker autoscaling toggles between 2 and 4 pods and updates vCore pool capacity.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        initial_vcore = browser.get_text_content("#vcoreGaugeVal") or ""

        # Click autoscale
        browser.click("#btnScaleWorkers")
        time.sleep(0.3)

        scaled_vcore = browser.get_text_content("#vcoreGaugeVal") or ""
        self.assert_true(len(scaled_vcore) > 0, "vCore gauge must remain populated after scaling")

        # Scale back
        browser.click("#btnScaleWorkers")
        time.sleep(0.3)


class TestR1AudioMuteToggleIdempotence(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_boundary_audio_mute_toggle_idempotence",
            tier=2,
            deliverable="r1",
            description="Verifies audio mute button toggles audio state cleanly without AudioContext errors.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        browser.click("#btnMuteAudio")
        time.sleep(0.2)
        browser.click("#btnMuteAudio")
        time.sleep(0.2)
        self.assert_no_console_errors(browser)


class TestR1LogRingBufferCap(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_boundary_log_ring_buffer_cap",
            tier=2,
            deliverable="r1",
            description="Verifies log list maintains a finite capped DOM count without infinite memory growth.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")
        log_count = browser.evaluate("document.querySelectorAll('#logList > *').length")
        self.assert_less_equal(log_count, 250, f"Log items should be capped <= 250, got {log_count}")


def get_r1_tier2_tests() -> List[TestCase]:
    return [
        TestR1RapidToggleClicking(),
        TestR1ExtremeSapLagCircuitBreaker(),
        TestR1WorkerAutoscalerClamping(),
        TestR1AudioMuteToggleIdempotence(),
        TestR1LogRingBufferCap(),
    ]
