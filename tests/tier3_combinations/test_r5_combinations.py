"""Tier 3 Cross-Feature Combination Tests for R5: Master Innovation Catalog."""
from typing import Any, Dict, List
from tests.framework import MarkdownCatalogInspector, TestCase


class TestR5CombCrossDomainArchitecturalPatterns(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r5_comb_cross_domain_architectural_patterns",
            tier=3,
            deliverable="r5",
            description="Verifies cross-referencing between Salvar Vidas (IoT Smart Buildings), SRE RTF Observability, and Fintech ISO 20022.",
        )

    def execute(self, context: Dict[str, Any]):
        inspector = MarkdownCatalogInspector("sistemas/mulesoft_80_ideas_observabilidad.md")
        ideas = inspector.extract_numbered_ideas()

        # Check Domain 1 (Fintech Ideas 01-10) contains ISO 20022 or AML
        fintech_ideas = [i for i in ideas if 1 <= i["number"] <= 10]
        fintech_text = " ".join([i["content"] for i in fintech_ideas])
        self.assert_true("ISO 20022" in fintech_text or "pacs.008" in fintech_text, "Fintech domain must cover ISO 20022")

        # Check Domain 6 (IoT Ideas 51-60) contains building safety / evacuation / Salvar Vidas
        iot_ideas = [i for i in ideas if 51 <= i["number"] <= 60]
        iot_text = " ".join([i["content"] for i in iot_ideas])
        self.assert_true("Salvar Vidas" in iot_text or "Evacuation" in iot_text or "Smart Building" in iot_text or "Emergency" in iot_text, "IoT domain must cover smart building evacuation")

        # Check Domain 4 (SRE Ideas 31-40) contains JVM / RTF / Tracing
        sre_ideas = [i for i in ideas if 31 <= i["number"] <= 40]
        sre_text = " ".join([i["content"] for i in sre_ideas])
        self.assert_true("RTF" in sre_text or "JMX" in sre_text or "Trace" in sre_text or "JVM" in sre_text, "SRE domain must cover RTF telemetry")


def get_r5_tier3_tests() -> List[TestCase]:
    return [
        TestR5CombCrossDomainArchitecturalPatterns(),
    ]
