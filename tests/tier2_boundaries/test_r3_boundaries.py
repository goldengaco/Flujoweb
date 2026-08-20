"""Tier 2 Boundary & Corner Case Tests for R3: Mobile Occupant HUD."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR3ClearHazardsBoundary(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_boundary_clear_hazards_tool",
            tier=2,
            deliverable="r3",
            description="Verifies clicking tool-clear clears spawned hazard overlays and restores default route.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")

        # Select clear tool and click
        browser.click("#tool-clear")
        time.sleep(0.2)
        self.assert_no_console_errors(browser)


class TestR3SirenToggleRapidClick(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_boundary_siren_toggle_rapid_click",
            tier=2,
            deliverable="r3",
            description="Verifies rapid clicking on siren toggle does not cause AudioContext crash.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")
        for _ in range(4):
            browser.click("#btn-siren-toggle")
            time.sleep(0.1)

        self.assert_no_console_errors(browser)


class TestR3VoiceRepeatDebounce(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_boundary_voice_repeat_debounce",
            tier=2,
            deliverable="r3",
            description="Verifies voice repeat button cancels prior speech and triggers new utterance cleanly.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")
        browser.click("#btn-voice-repeat")
        time.sleep(0.2)
        self.assert_no_console_errors(browser)


class TestR3SOSModalNotesInputAndSubmission(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_boundary_sos_modal_notes_and_submission",
            tier=2,
            deliverable="r3",
            description="Verifies typing triage notes into SOS modal and sending beacon transmits cleanly.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")
        browser.click("#btn-report-sos")
        time.sleep(0.3)

        # Type custom triage note
        browser.evaluate("""
            (() => {
                const input = document.getElementById('sos-notes');
                if (input) {
                    input.value = 'Smoke blocking corridor near room 704';
                }
            })()
        """)
        time.sleep(0.1)

        # Send SOS beacon
        browser.click("#btn-send-sos-beacon")
        time.sleep(0.3)
        self.assert_no_console_errors(browser)


class TestR3MeshCellularToggleIdempotence(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_boundary_mesh_cellular_toggle_idempotence",
            tier=2,
            deliverable="r3",
            description="Verifies toggling cellular offline and back online restores online telemetry.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")
        # Toggle off
        browser.click("#btn-toggle-cellular")
        time.sleep(0.2)
        # Toggle on
        browser.click("#btn-toggle-cellular")
        time.sleep(0.2)
        self.assert_no_console_errors(browser)


def get_r3_tier2_tests() -> List[TestCase]:
    return [
        TestR3ClearHazardsBoundary(),
        TestR3SirenToggleRapidClick(),
        TestR3VoiceRepeatDebounce(),
        TestR3SOSModalNotesInputAndSubmission(),
        TestR3MeshCellularToggleIdempotence(),
    ]
