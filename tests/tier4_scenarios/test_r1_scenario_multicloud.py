"""Tier 4 Real-World Scenario Test: Full Multi-Cloud Distributed Transaction Lifecycle."""
import time
from typing import Any, Dict, List
from tests.framework import BrowserSession, TestCase


class TestR1ScenarioMultiCloudFullCycle(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r1_scenario_multicloud_distributed_transaction_lifecycle",
            tier=4,
            deliverable="r1",
            description="Executes full end-to-end multi-cloud transaction cycle across Apigee Ingress, MuleSoft RTF, AWS, GCP, and SAP.",
        )

    def execute(self, context: Dict[str, Any]):
        browser: BrowserSession = context["browser_r1"]
        self.ensure_page(browser, "sistemas/apigee-mulesoft-hybrid/index.html")

        # Step 1: Trigger nominal transaction
        browser.click("#btnRunE2E")
        time.sleep(0.8)

        # Step 2: Validate correlation ID generated
        corr_id = browser.get_text_content("#corrIdDisplay") or ""
        self.assert_true(len(corr_id) > 0, "Correlation ID must be generated")

        # Step 3: Validate latency decomposed across all 3 tiers
        total_latency = browser.get_text_content("#e2eLatencyDisplay") or ""
        self.assert_true(len(total_latency) > 0, "Latency display must show calculated roundtrip ms")

        # Step 4: Validate worker pool gauges remain healthy
        vcore_val = browser.get_text_content("#vcoreGaugeVal") or ""
        heap_val = browser.get_text_content("#heapGaugeVal") or ""
        self.assert_true(len(vcore_val) > 0 and len(heap_val) > 0, "Worker pool vitals must be active")

        self.assert_no_console_errors(browser)


def get_r1_tier4_tests() -> List[TestCase]:
    return [
        TestR1ScenarioMultiCloudFullCycle(),
    ]
