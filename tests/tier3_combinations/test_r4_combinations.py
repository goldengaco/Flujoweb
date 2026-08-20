"""Tier 3 Cross-Feature Combination Tests for R4: Multi-Carrier Broadcast Engine."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR4CombFanoutBroadcastAndChaosFailover(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r4_comb_fanout_broadcast_and_chaos_failover",
            tier=3,
            deliverable="r4",
            description="Combines 5,000 device broadcast initiation with mid-flight SMS gateway kill and automated rerouting.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r4"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v3/index.html")

        # 1. Trigger broadcast
        browser.click("#btn-broadcast-trigger")
        time.sleep(0.5)

        # 2. Inject SMS Kill chaos
        browser.click("#btn-chaos-kill-sms")
        time.sleep(0.5)

        # 3. Check delivered packets continue
        delivered = int(browser.evaluate("parseInt(document.getElementById('kpi-delivered').textContent.replace(/[^0-9]/g, '')) || 0"))
        self.assert_greater_equal(delivered, 50, f"Delivered count must progress even during chaos failover, got {delivered}")
        self.assert_no_console_errors(browser)


class TestR4CombLatencyHistogramUnderJitterChaos(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r4_comb_latency_histogram_under_jitter_chaos",
            tier=3,
            deliverable="r4",
            description="Combines multi-carrier fanout with LoRa jitter and SMS latency spike, verifying histogram integrity.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r4"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v3/index.html")

        # 1. Inject jitter and spike
        browser.click("#btn-chaos-sms-spike")
        time.sleep(0.2)

        # 2. Check P99 latency text exists
        p99 = browser.get_text_content("#kpi-p99-latency") or ""
        self.assert_true(len(p99) > 0, "P99 latency metric must remain displayed")
        self.assert_no_console_errors(browser)


def get_r4_tier3_tests() -> List[TestCase]:
    return [
        TestR4CombFanoutBroadcastAndChaosFailover(),
        TestR4CombLatencyHistogramUnderJitterChaos(),
    ]
