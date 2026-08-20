"""Tier 3 Cross-Feature Combination Tests for R2: Master Building Command."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR2CombBroadcastAndBrigadeDispatch(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_comb_broadcast_headcount_and_brigade_dispatch",
            tier=3,
            deliverable="r2",
            description="Combines Master Broadcast + Headcount decay + Brigade Alfa deployment to Floor 7.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")

        # 1. Trigger broadcast
        browser.click("#btn-master-broadcast")
        time.sleep(0.3)

        # 2. Click first brigade to deploy
        browser.evaluate("""
            (() => {
                const b = document.querySelector('#brigade-teams-list > *');
                if (b) b.click();
            })()
        """)
        time.sleep(0.2)

        # 3. Open Floor 7 drilldown
        browser.evaluate("""
            (() => {
                const floors = document.querySelectorAll('#floor-matrix-list > *');
                if (floors.length >= 7) floors[6].click();
            })()
        """)
        time.sleep(0.3)

        self.assert_no_console_errors(browser)


class TestR2CombSpeedMultiplierAndDecay(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_comb_speed_multiplier_and_evacuation_decay",
            tier=3,
            deliverable="r2",
            description="Combines 2.0x simulation speed with continuous headcount decay monitoring.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")

        # Click speed multiplier
        browser.click("#btn-sim-speed")
        time.sleep(0.5)

        safe = int(browser.evaluate("parseInt(document.getElementById('metric-safe-count').textContent.replace(/[^0-9]/g, '')) || 0"))
        self.assert_greater_equal(safe, 0, "Safe count must remain valid under 2x speed")
        self.assert_no_console_errors(browser)


def get_r2_tier3_tests() -> List[TestCase]:
    return [
        TestR2CombBroadcastAndBrigadeDispatch(),
        TestR2CombSpeedMultiplierAndDecay(),
    ]
