"""Tier 3 Cross-Feature Combination Tests for R1: Apigee-MuleSoft Hybrid."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR1CombPolicyTogglesAndWorkerScaling(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_comb_policy_toggles_and_worker_scaling",
            tier=3,
            deliverable="r1",
            description="Combines Response Cache toggle + Worker autoscaling (4 pods) + Nominal E2E transaction.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")

        # 1. Scale workers
        browser.click("#btnScaleWorkers")
        time.sleep(0.2)

        # 2. Toggle cache
        browser.click("#btnToggleCache")
        time.sleep(0.2)

        # 3. Run E2E transaction
        browser.click("#btnRunE2E")
        time.sleep(0.5)

        # 4. Verify all components reacted
        corr_id = browser.get_text_content("#corrIdDisplay") or ""
        self.assert_true(len(corr_id) > 0, "Expected active correlation ID")
        self.assert_no_console_errors(browser)


class TestR1CombMultiThreatWafJwtSpike(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_comb_multi_threat_waf_jwt_spike_sequence",
            tier=3,
            deliverable="r1",
            description="Sequentially injects WAF SQLi threat, Expired JWT 401, and Spike 429 burst.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")

        # Sequential threat triggers
        browser.click("#btnInjectWAF")
        time.sleep(0.2)

        browser.click("#btnExpireToken")
        time.sleep(0.2)

        browser.click("#btnInjectSpike")
        time.sleep(0.2)

        self.assert_no_console_errors(browser)


class TestR1CombCircuitBreakerAndDataWeave(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_comb_circuit_breaker_and_dataweave_tabs",
            tier=3,
            deliverable="r1",
            description="Combines SAP lag injection (circuit breaker degradation) with DataWeave transformation preview.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")

        browser.click("#btnInjectLag")
        time.sleep(0.3)

        # Verify DataWeave preview is still accessible
        dw_code = browser.get_text_content("#dwCode") or ""
        self.assert_true(len(dw_code) > 0, "DataWeave code must remain visible during circuit degradation")
        self.assert_no_console_errors(browser)


def get_r1_tier3_tests() -> List[TestCase]:
    return [
        TestR1CombPolicyTogglesAndWorkerScaling(),
        TestR1CombMultiThreatWafJwtSpike(),
        TestR1CombCircuitBreakerAndDataWeave(),
    ]
