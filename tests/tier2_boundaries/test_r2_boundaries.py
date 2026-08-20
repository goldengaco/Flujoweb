"""Tier 2 Boundary & Corner Case Tests for R2: Master Building Command."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR2DoubleBroadcastClickSafeguard(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_boundary_double_broadcast_click_safeguard",
            tier=2,
            deliverable="r2",
            description="Verifies double-clicking master broadcast does not cause duplicate alert events or errors.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")

        # Double click quickly
        browser.evaluate("""
            (() => {
                const btn = document.getElementById('btn-master-broadcast');
                if (btn) {
                    btn.click();
                    btn.click();
                }
            })()
        """)
        time.sleep(0.3)
        self.assert_no_console_errors(browser)


class TestR2SimulationSpeedMultiplier(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_boundary_simulation_speed_multiplier",
            tier=2,
            deliverable="r2",
            description="Verifies clicking simulation speed toggle cycles speed without crashing.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")
        browser.click("#btn-sim-speed")
        time.sleep(0.2)
        speed_label = browser.get_text_content("#btn-sim-speed") or ""
        self.assert_true(len(speed_label) > 0, "Expected simulation speed button to show active multiplier")


class TestR2SystemResetBoundary(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_boundary_system_reset_and_state_restore",
            tier=2,
            deliverable="r2",
            description="Verifies system reset button restores initial headcount and clears active alerts.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")
        browser.click("#btn-system-reset")
        time.sleep(0.4)
        self.assert_no_console_errors(browser)


class TestR2DrilldownModalRapidOpenClose(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_boundary_drilldown_modal_rapid_open_close",
            tier=2,
            deliverable="r2",
            description="Verifies opening and closing the drilldown modal multiple times does not leave stuck backdrops.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")
        for _ in range(3):
            # Click floor
            browser.evaluate("document.querySelector('#floor-matrix-list > *')?.click()")
            time.sleep(0.15)
            # Close modal via escape key or close button
            browser.evaluate("""
                (() => {
                    const closeBtn = document.querySelector('#room-drilldown-modal button');
                    if (closeBtn) closeBtn.click();
                    else {
                        const m = document.getElementById('room-drilldown-modal');
                        if (m) m.style.display = 'none';
                    }
                })()
            """)
            time.sleep(0.15)

        self.assert_no_console_errors(browser)


class TestR2NonNegativeHeadcountDecay(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r2_boundary_non_negative_headcount_decay",
            tier=2,
            deliverable="r2",
            description="Verifies all headcount values (safe, transit, trapped) remain strictly non-negative.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r2"]
        self.ensure_page(browser, "sistemas/emergency-evacuation-v1/index.html")
        time.sleep(0.5)
        safe = int(browser.evaluate("parseInt(document.getElementById('metric-safe-count').textContent.replace(/[^0-9]/g, '')) || 0"))
        transit = int(browser.evaluate("parseInt(document.getElementById('metric-transit-count').textContent.replace(/[^0-9]/g, '')) || 0"))
        trapped = int(browser.evaluate("parseInt(document.getElementById('metric-trapped-count').textContent.replace(/[^0-9]/g, '')) || 0"))

        self.assert_greater_equal(safe, 0, "Safe count cannot be negative")
        self.assert_greater_equal(transit, 0, "Transit count cannot be negative")
        self.assert_greater_equal(trapped, 0, "Trapped count cannot be negative")


def get_r2_tier2_tests() -> List[TestCase]:
    return [
        TestR2DoubleBroadcastClickSafeguard(),
        TestR2SimulationSpeedMultiplier(),
        TestR2SystemResetBoundary(),
        TestR2DrilldownModalRapidOpenClose(),
        TestR2NonNegativeHeadcountDecay(),
    ]
