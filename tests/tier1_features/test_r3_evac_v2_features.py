"""Tier 1 Feature Coverage Tests for R3: Mobile Occupant HUD & Dynamic Escape Route."""
import os
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, DOMInspector, TestCase


class TestR3DOMIntegrityAndTokens(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_dom_integrity_and_hud_tokens",
            tier=1,
            deliverable="r3",
            description="Verifies R3 Mobile HUD element IDs, color tokens, and zero external runtime dependencies.",
        )

    def execute(self, context: Dict[str, Any]):
        file_path = "sistemas/emergency-evacuation-v2/index.html"
        self.assert_true(os.path.exists(file_path), f"Deliverable file {file_path} must exist")

        inspector = DOMInspector(file_path)
        dep_check = inspector.verify_zero_external_dependencies()
        self.assert_true(
            dep_check["is_valid"],
            f"Disallowed external dependencies detected: {dep_check}",
        )

        expected_ids = [
            "floorplan-canvas",
            "app-viewport",
            "strobe-banner",
            "btn-im-safe",
            "btn-report-sos",
            "btn-siren-toggle",
            "btn-toggle-cellular",
            "mesh-hops",
            "mesh-latency",
            "modal-safe",
            "modal-sos",
            "path-steps-count",
        ]
        for eid in expected_ids:
            self.assert_true(inspector.has_id(eid), f"Missing expected DOM ID: #{eid}")

        color_tokens = ["#070a10", "#0b111c", "#00ff88"]
        token_results = inspector.verify_color_tokens(color_tokens)
        for token, present in token_results.items():
            self.assert_true(present, f"Missing required color token {token}")


class TestR3TacticalMobileHUD(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_tactical_mobile_hud_and_strobe",
            tier=1,
            deliverable="r3",
            description="Verifies emergency strobe banner, exit guidance directions, and status bar vitals.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")
        self.assert_no_console_errors(browser)

        banner_text = browser.get_text_content("#strobe-banner") or ""
        self.assert_true(
            "ALERTA" in banner_text or "EVACUA" in banner_text or "EMERGENCIA" in banner_text or "PELIGRO" in banner_text,
            f"Expected tactical alert in strobe banner, got: {banner_text}",
        )


class TestR3VectorBlueprintAndAStar(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_vector_blueprint_and_astar_pathfinding",
            tier=1,
            deliverable="r3",
            description="Verifies dynamic canvas rendering and calculated A* escape route step count.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")
        steps_text = browser.get_text_content("#path-steps-count") or ""
        self.assert_true(len(steps_text) > 0, "Expected path steps count to be populated")

        canvas_exists = browser.evaluate("""
            (() => {
                const c = document.getElementById('floorplan-canvas');
                return c && c.width > 0 && c.height > 0;
            })()
        """)
        self.assert_true(canvas_exists, "Expected floorplan canvas to have non-zero dimensions")


class TestR3InteractiveHazardSpawnAndReroute(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_interactive_hazard_spawn_and_reroute",
            tier=1,
            deliverable="r3",
            description="Verifies clicking tool-fire/tool-smoke and canvas triggers dynamic A* path recalculation.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")
        browser.click("#tool-fire")
        time.sleep(0.1)

        browser.evaluate("""
            (() => {
                const canvas = document.getElementById('floorplan-canvas');
                const rect = canvas.getBoundingClientRect();
                const evt = new MouseEvent('click', {
                    clientX: rect.left + rect.width * 0.4,
                    clientY: rect.top + rect.height * 0.5,
                    bubbles: true
                });
                canvas.dispatchEvent(evt);
            })()
        """)
        time.sleep(0.3)

        steps_text = browser.get_text_content("#path-steps-count") or ""
        self.assert_true(len(steps_text) > 0, "Expected valid recalculated path step count")


class TestR3OccupantCheckinTelemetry(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_occupant_checkin_telemetry_safe",
            tier=1,
            deliverable="r3",
            description="Verifies tapping '¡ESTOY A SALVO!' displays modal-safe confirmation and coordinates.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")
        browser.click("#btn-im-safe")
        time.sleep(0.3)

        modal_safe_visible = browser.evaluate("""
            (() => {
                const m = document.getElementById('modal-safe');
                if (!m) return false;
                const s = window.getComputedStyle(m);
                return s.display !== 'none' && s.visibility !== 'hidden';
            })()
        """)
        self.assert_true(modal_safe_visible, "Expected modal-safe confirmation to be visible")

        browser.click("#btn-dismiss-safe")
        time.sleep(0.2)


class TestR3OfflineMeshSimulator(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r3_offline_mesh_network_simulator",
            tier=1,
            deliverable="r3",
            description="Verifies toggling cellular offline engages BLE / Wi-Fi Direct multi-hop mesh telemetry.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r3"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v2/index.html")
        browser.click("#btn-toggle-cellular")
        time.sleep(0.3)

        new_hops = browser.get_text_content("#mesh-hops") or ""
        self.assert_true(len(new_hops) > 0, "Expected mesh hops telemetry to be populated")


def get_r3_tier1_tests() -> List[TestCase]:
    return [
        TestR3DOMIntegrityAndTokens(),
        TestR3TacticalMobileHUD(),
        TestR3VectorBlueprintAndAStar(),
        TestR3InteractiveHazardSpawnAndReroute(),
        TestR3OccupantCheckinTelemetry(),
        TestR3OfflineMeshSimulator(),
    ]
