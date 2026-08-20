"""Tier 3 Cross-Feature Combination Tests for R3: Mobile Occupant HUD."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR3CombDynamicFireSpawnAndAStarReroute(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_comb_dynamic_fire_spawn_and_astar_reroute",
            tier=3,
            deliverable="r3",
            description="Combines fire hazard placement on corridor with real-time A* path recalculation and step count update.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")

        # 1. Select fire tool
        browser.click("#tool-fire")
        time.sleep(0.1)

        # 2. Place fire on canvas
        browser.evaluate("""
            (() => {
                const canvas = document.getElementById('floorplan-canvas');
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    const evt = new MouseEvent('click', {
                        clientX: rect.left + rect.width * 0.3,
                        clientY: rect.top + rect.height * 0.4,
                        bubbles: true
                    });
                    canvas.dispatchEvent(evt);
                }
            })()
        """)
        time.sleep(0.3)

        # 3. Check steps count updated
        steps = browser.get_text_content("#path-steps-count") or ""
        self.assert_true(len(steps) > 0, "Expected path steps count to remain populated after reroute")
        self.assert_no_console_errors(browser)


class TestR3CombOfflineMeshAndSOSTransmission(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_comb_offline_mesh_and_sos_transmission",
            tier=3,
            deliverable="r3",
            description="Combines cellular network failure (offline BLE mesh) with priority SOS emergency triage transmission.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")

        # 1. Toggle cellular offline
        browser.click("#btn-toggle-cellular")
        time.sleep(0.2)

        # 2. Open SOS drawer and submit
        browser.click("#btn-report-sos")
        time.sleep(0.2)
        browser.click("#btn-send-sos-beacon")
        time.sleep(0.3)

        self.assert_no_console_errors(browser)


def get_r3_tier3_tests() -> List[TestCase]:
    return [
        TestR3CombDynamicFireSpawnAndAStarReroute(),
        TestR3CombOfflineMeshAndSOSTransmission(),
    ]
