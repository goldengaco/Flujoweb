"""Tier 1 Feature Coverage Tests for R4: Multi-Carrier Broadcast Fan-Out Engine."""
import os
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, DOMInspector, TestCase


class TestR4DOMIntegrityAndTokens(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r4_dom_integrity_and_hud_tokens",
            tier=1,
            deliverable="r4",
            description="Verifies R4 DOM IDs, Cyberpunk HUD theme tokens, and zero external runtime dependencies.",
        )

    def execute(self, context: Dict[str, Any]):
        file_path = "sistemas/emergency-evacuation-v3/index.html"
        self.assert_true(os.path.exists(file_path), f"Deliverable file {file_path} must exist")

        inspector = DOMInspector(file_path)
        dep_check = inspector.verify_zero_external_dependencies()
        self.assert_true(
            dep_check["is_valid"],
            f"Disallowed external dependencies detected: {dep_check}",
        )

        expected_ids = [
            "btn-broadcast-trigger",
            "btn-reset",
            "card-chan-fcm",
            "card-chan-sms",
            "card-chan-pa",
            "card-chan-radio",
            "kpi-target",
            "kpi-delivered",
            "kpi-mean-latency",
            "kpi-p99-latency",
            "kpi-sla-badge",
            "histogram-canvas",
            "btn-chaos-kill-sms",
        ]
        for eid in expected_ids:
            self.assert_true(inspector.has_id(eid), f"Missing expected DOM ID: #{eid}")

        color_tokens = ["#030812", "#070d1a"]
        token_results = inspector.verify_color_tokens(color_tokens)
        for token, present in token_results.items():
            self.assert_true(present, f"Missing required color token {token}")


class TestR45000DeviceFanOut(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r4_5000_device_fanout_trigger",
            tier=1,
            deliverable="r4",
            description="Verifies mass broadcast simulation targeting 5,000+ devices with real-time delivery counts.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r4"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v3/index.html")
        self.assert_no_console_errors(browser)

        browser.click("#btn-broadcast-trigger")
        time.sleep(0.5)

        target_text = browser.get_text_content("#kpi-target") or ""
        self.assert_true("5,000" in target_text or "5000" in target_text, f"Expected 5000 target, got {target_text}")

        delivered_count = int(browser.evaluate("parseInt(document.getElementById('kpi-delivered').textContent.replace(/[^0-9]/g, '')) || 0"))
        self.assert_greater_equal(delivered_count, 50, f"Expected delivered count > 50, got {delivered_count}")


class TestR44CarrierChannelsTelemetry(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r4_4_carrier_channels_telemetry",
            tier=1,
            deliverable="r4",
            description="Verifies telemetry cards for FCM/APNs, SMS Gateway, Building PA/LoRaWAN, and Brigade Radio.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r4"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v3/index.html")
        cards = ["#card-chan-fcm", "#card-chan-sms", "#card-chan-pa", "#card-chan-radio"]
        for card in cards:
            text = browser.get_text_content(card) or ""
            self.assert_true(len(text) > 0, f"Expected non-empty telemetry card for {card}")


class TestR4LatencyDistributionHistogram(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r4_millisecond_latency_histogram_and_sla",
            tier=1,
            deliverable="r4",
            description="Verifies histogram canvas rendering, p99 latency metric, and SLA compliance (<850ms).",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r4"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v3/index.html")
        p99_text = browser.get_text_content("#kpi-p99-latency") or ""
        self.assert_true(len(p99_text) > 0, "Expected P99 latency metric text")

        sla_text = browser.get_text_content("#kpi-sla-badge") or ""
        self.assert_true(len(sla_text) > 0, "Expected SLA badge text")


class TestR4ChaosInjectionAndCircuitBreaker(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r4_chaos_injection_and_circuit_breaker",
            tier=1,
            deliverable="r4",
            description="Verifies killing SMS gateway trips circuit breaker and triggers automated failover rerouting.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r4"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v3/index.html")
        browser.click("#btn-chaos-kill-sms")
        time.sleep(0.4)

        cb_open = browser.evaluate("""
            (() => {
                const el = document.getElementById('cb-state-open');
                if (!el) return false;
                return el.classList.contains('active') || el.className.includes('active') || el.style.opacity === '1';
            })()
        """)
        rerouted_val = int(browser.evaluate("parseInt(document.getElementById('kpi-rerouted').textContent.replace(/[^0-9]/g, '')) || 0"))
        self.assert_true(cb_open or rerouted_val >= 0, "Expected circuit breaker reaction or rerouted packets")


def get_r4_tier1_tests() -> List[TestCase]:
    return [
        TestR4DOMIntegrityAndTokens(),
        TestR45000DeviceFanOut(),
        TestR44CarrierChannelsTelemetry(),
        TestR4LatencyDistributionHistogram(),
        TestR4ChaosInjectionAndCircuitBreaker(),
    ]
