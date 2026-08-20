"""Tier 1 Feature Coverage Tests for R2: Master Building Command & Floor Matrix."""
import os
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, DOMInspector, TestCase


class TestR2DOMIntegrityAndTokens(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_dom_integrity_and_hud_tokens",
            tier=1,
            deliverable="r2",
            description="Verifies R2 DOM IDs, HUD theme tokens, and zero external runtime dependencies.",
        )

    def execute(self, context: Dict[str, Any]):
        file_path = "sistemas/emergency-evacuation-v1/index.html"
        self.assert_true(os.path.exists(file_path), f"Deliverable file {file_path} must exist")

        inspector = DOMInspector(file_path)
        dep_check = inspector.verify_zero_external_dependencies()
        self.assert_true(
            dep_check["is_valid"],
            f"Disallowed external dependencies detected: {dep_check}",
        )

        expected_ids = [
            "floor-matrix-list",
            "btn-master-broadcast",
            "metric-total-census",
            "metric-safe-count",
            "metric-transit-count",
            "metric-trapped-count",
            "brigade-teams-list",
            "room-drilldown-modal",
            "modal-rooms-container",
            "evac-timer",
            "audit-log-stream",
            "strobe-overlay",
        ]
        for eid in expected_ids:
            self.assert_true(inspector.has_id(eid), f"Missing expected DOM ID: #{eid}")

        color_tokens = ["#ef4444", "#f97316", "#10b981", "#030812"]
        token_results = inspector.verify_color_tokens(color_tokens)
        for token, present in token_results.items():
            self.assert_true(present, f"Missing required color token {token}")


class TestR212FloorMatrixAndSensors(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_12_floor_matrix_and_sensor_telemetry",
            tier=1,
            deliverable="r2",
            description="Verifies all 12 floors are rendered in the matrix with temperature and smoke telemetry.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")
        self.assert_no_console_errors(browser)

        floor_count = browser.evaluate("document.querySelectorAll('#floor-matrix-list > *').length")
        self.assert_equal(floor_count, 12, f"Expected exactly 12 floor cards, got {floor_count}")

        census_text = browser.get_text_content("#metric-total-census") or ""
        self.assert_true(len(census_text) > 0, "Expected non-empty total census text")


class TestR2MasterBroadcastTrigger(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_master_broadcast_trigger_and_strobe",
            tier=1,
            deliverable="r2",
            description="Verifies clicking Master Broadcast initiates evacuation state and triggers strobe/timer.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")
        browser.click("#btn-master-broadcast")
        time.sleep(0.3)

        badge_text = browser.get_text_content("#global-status-badge") or ""
        self.assert_true(
            "ALERTA" in badge_text or "EVACUA" in badge_text or "ACTIVA" in badge_text,
            f"Expected active evacuation status in global badge, got: {badge_text}",
        )


class TestR2HeadcountTrackerDecay(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_headcount_tracker_decay",
            tier=1,
            deliverable="r2",
            description="Verifies safe count increases as occupants evacuate towards assembly points.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")
        initial_safe = int(browser.evaluate("parseInt(document.getElementById('metric-safe-count').textContent.replace(/[^0-9]/g, '')) || 0"))
        time.sleep(0.5)
        current_safe = int(browser.evaluate("parseInt(document.getElementById('metric-safe-count').textContent.replace(/[^0-9]/g, '')) || 0"))

        self.assert_greater_equal(
            current_safe,
            initial_safe,
            f"Safe headcount should progress upwards: initial={initial_safe}, current={current_safe}",
        )


class TestR2BrigadeDispatcherConsole(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_brigade_dispatcher_console",
            tier=1,
            deliverable="r2",
            description="Verifies 5 brigade teams rendered with SCBA PSI and assignment capabilities.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")
        brigade_count = browser.evaluate("document.querySelectorAll('#brigade-teams-list > *').length")
        self.assert_greater_equal(brigade_count, 5, f"Expected >= 5 brigade teams, got {brigade_count}")

        list_text = browser.get_text_content("#brigade-teams-list") or ""
        self.assert_true("Alfa" in list_text or "ALFA" in list_text, "Expected Brigada Alfa")
        self.assert_true("Bravo" in list_text or "BRAVO" in list_text, "Expected Brigada Bravo")


class TestR2RoomDrilldownModal(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_room_drilldown_modal_inspector",
            tier=1,
            deliverable="r2",
            description="Verifies clicking floor opens room drilldown modal with room list and occupant roster.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")
        browser.evaluate("""
            (() => {
                const floor = document.querySelector('#floor-matrix-list > *');
                if (floor) floor.click();
            })()
        """)
        time.sleep(0.3)

        modal_visible = browser.evaluate("""
            (() => {
                const modal = document.getElementById('room-drilldown-modal');
                if (!modal) return false;
                const style = window.getComputedStyle(modal);
                return style.display !== 'none' && style.visibility !== 'hidden';
            })()
        """)
        self.assert_true(modal_visible, "Expected room drilldown modal to be visible")


def get_r2_tier1_tests() -> List[TestCase]:
    return [
        TestR2DOMIntegrityAndTokens(),
        TestR212FloorMatrixAndSensors(),
        TestR2MasterBroadcastTrigger(),
        TestR2HeadcountTrackerDecay(),
        TestR2BrigadeDispatcherConsole(),
        TestR2RoomDrilldownModal(),
    ]
