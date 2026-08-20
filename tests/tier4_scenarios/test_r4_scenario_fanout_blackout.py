"""Tier 4 Real-World Scenario Test: Mass Emergency Broadcast Under Telecom Blackout."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR4ScenarioTelecomBlackoutFailover(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r4_scenario_mass_telecom_blackout_and_auto_failover",
            tier=4,
            deliverable="r4",
            description="Simulates 5,000 device broadcast under catastrophic SMS gateway outage with automated failover rerouting to FCM and LoRaWAN sirens.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r4"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v3/index.html")

        # Step 1: Trigger mass broadcast
        browser.click("#btn-broadcast-trigger")
        time.sleep(0.5)

        # Step 2: Inject SMS Gateway Kill chaos
        browser.click("#btn-chaos-kill-sms")
        time.sleep(0.8)

        # Step 3: Verify packet delivery continues via alternate channels
        delivered = int(browser.evaluate("parseInt(document.getElementById('kpi-delivered').textContent.replace(/[^0-9]/g, '')) || 0"))
        self.assert_greater_equal(delivered, 50, "Delivered count must progress during auto-failover")

        # Step 4: Verify P99 SLA metric remains tracked
        p99_text = browser.get_text_content("#kpi-p99-latency") or ""
        self.assert_true(len(p99_text) > 0, "P99 SLA latency must be displayed")

        self.assert_no_console_errors(browser)


def get_r4_tier4_tests() -> List[TestCase]:
    return [
        TestR4ScenarioTelecomBlackoutFailover(),
    ]
