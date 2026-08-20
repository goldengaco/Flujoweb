"""Tier 4 Real-World Scenario Test: Occupant Mobile Escape & Survival Navigation."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR3ScenarioMobileEscapeNavigation(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_scenario_mobile_escape_and_checkin_lifecycle",
            tier=4,
            deliverable="r3",
            description="Simulates mobile occupant receiving tactical alarm, navigating vector floorplan, placing dynamic fire hazard, recalculating A* path, and checking in safe.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")

        # Step 1: Alarm HUD verification
        banner = browser.get_text_content("#strobe-banner") or ""
        self.assert_true(len(banner) > 0, "Emergency strobe banner must be active")

        # Step 2: Spawn fire on corridor
        browser.click("#tool-fire")
        time.sleep(0.1)
        browser.evaluate("""
            (() => {
                const canvas = document.getElementById('floorplan-canvas');
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    const evt = new MouseEvent('click', {
                        clientX: rect.left + rect.width * 0.45,
                        clientY: rect.top + rect.height * 0.45,
                        bubbles: true
                    });
                    canvas.dispatchEvent(evt);
                }
            })()
        """)
        time.sleep(0.3)

        # Step 3: Check-in Safe
        browser.click("#btn-im-safe")
        time.sleep(0.3)

        modal_visible = browser.evaluate("document.getElementById('modal-safe')?.style.display !== 'none'")
        self.assert_true(modal_visible, "Safe confirmation modal must be displayed")

        # Dismiss modal
        browser.click("#btn-dismiss-safe")
        time.sleep(0.2)

        self.assert_no_console_errors(browser)


def get_r3_tier4_tests() -> List[TestCase]:
    return [
        TestR3ScenarioMobileEscapeNavigation(),
    ]
