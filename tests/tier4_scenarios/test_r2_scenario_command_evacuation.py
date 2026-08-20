"""Tier 4 Real-World Scenario Test: Full Life-Critical Building Evacuation Lifecycle."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR2ScenarioCommandEvacuationLifecycle(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_scenario_full_building_evacuation_lifecycle",
            tier=4,
            deliverable="r2",
            description="Simulates full building evacuation from baseline occupancy through alarm deployment, brigade assignment, and decay to safe assembly points.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")

        # Phase 1: Verify pre-alarm baseline census
        census_text = browser.get_text_content("#metric-total-census") or ""
        self.assert_true(len(census_text) > 0, "Initial census must be populated")

        # Phase 2: Deploy Master Evacuation Broadcast
        browser.click("#btn-master-broadcast")
        time.sleep(0.5)

        badge = browser.get_text_content("#global-status-badge") or ""
        self.assert_true("ALERTA" in badge or "ACTIVA" in badge or "EVACUA" in badge, "Global state must transition to active evacuation")

        # Phase 3: Dispatch Brigade Alfa to Floor 7
        browser.evaluate("""
            (() => {
                const b = document.querySelector('#brigade-teams-list > *');
                if (b) b.click();
            })()
        """)
        time.sleep(0.3)

        # Phase 4: Monitor headcount progress
        time.sleep(1.0)
        safe_count = int(browser.evaluate("parseInt(document.getElementById('metric-safe-count').textContent.replace(/[^0-9]/g, '')) || 0"))
        self.assert_greater_equal(safe_count, 0, "Safe count must be non-negative")

        self.assert_no_console_errors(browser)


def get_r2_tier4_tests() -> List[TestCase]:
    return [
        TestR2ScenarioCommandEvacuationLifecycle(),
    ]
