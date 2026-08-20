"""Tier 2 Boundary & Corner Case Tests for R5: Master Innovation Catalog."""
import re
from typing import Any, Dict, List
from tests.framework import MarkdownCatalogInspector, TestCase


class TestR5StrictAscendingOrder(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r5_boundary_strict_ascending_numbering",
            tier=2,
            deliverable="r5",
            description="Verifies all 80 ideas appear in strictly ascending sequence (01, 02, ..., 80).",
        )

    def execute(self, context: Dict[str, Any]):
        inspector = MarkdownCatalogInspector("sistemas/mulesoft_80_ideas_observabilidad.md")
        ideas = inspector.extract_numbered_ideas()
        numbers = [i["number"] for i in ideas]

        self.assert_equal(numbers, list(range(1, 81)), "Idea numbers must be strictly sequential 1 through 80")


class TestR5MinimumWordCountPerIdea(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r5_boundary_minimum_word_count_per_idea",
            tier=2,
            deliverable="r5",
            description="Verifies each of the 80 ideas has deep technical substance (>100 words per idea).",
        )

    def execute(self, context: Dict[str, Any]):
        inspector = MarkdownCatalogInspector("sistemas/mulesoft_80_ideas_observabilidad.md")
        ideas = inspector.extract_numbered_ideas()

        for idea in ideas:
            word_count = len(re.findall(r"\b\w+\b", idea["content"]))
            self.assert_greater_equal(
                word_count,
                100,
                f"Idea #{idea['number']:02d} '{idea['title']}' is too sparse ({word_count} words)",
            )


class TestR5UniqueTitlesBoundary(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r5_boundary_unique_titles_across_catalog",
            tier=2,
            deliverable="r5",
            description="Verifies all 80 idea titles are unique with zero copy-pasted duplicates.",
        )

    def execute(self, context: Dict[str, Any]):
        inspector = MarkdownCatalogInspector("sistemas/mulesoft_80_ideas_observabilidad.md")
        ideas = inspector.extract_numbered_ideas()
        titles = [i["title"].lower().strip() for i in ideas]

        unique_titles = set(titles)
        self.assert_equal(
            len(unique_titles),
            80,
            f"Detected duplicate titles in catalog: {len(titles) - len(unique_titles)} duplicate(s)",
        )


class TestR5DataWeaveCodeSnippetPresence(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r5_boundary_dataweave_code_snippet_presence",
            tier=2,
            deliverable="r5",
            description="Verifies catalog contains concrete DataWeave 2.0 / XML / JSON code blocks.",
        )

    def execute(self, context: Dict[str, Any]):
        inspector = MarkdownCatalogInspector("sistemas/mulesoft_80_ideas_observabilidad.md")
        code_blocks = re.findall(r"```(?:dataweave|json|xml|yaml|typescript)?(.*?)```", inspector.raw_text, re.DOTALL)
        self.assert_greater_equal(len(code_blocks), 5, f"Expected >= 5 concrete code blocks, got {len(code_blocks)}")


class TestR5NoMarkdownSyntaxErrors(TestCase):
    def __init__(self):
        super().__init__(
            name="test_r5_boundary_no_unclosed_code_blocks",
            tier=2,
            deliverable="r5",
            description="Verifies balanced markdown code fences and clean formatting across the 80 ideas.",
        )

    def execute(self, context: Dict[str, Any]):
        inspector = MarkdownCatalogInspector("sistemas/mulesoft_80_ideas_observabilidad.md")
        fence_count = inspector.raw_text.count("```")
        self.assert_equal(fence_count % 2, 0, f"Unbalanced markdown code blocks: {fence_count} fences found")


def get_r5_tier2_tests() -> List[TestCase]:
    return [
        TestR5StrictAscendingOrder(),
        TestR5MinimumWordCountPerIdea(),
        TestR5UniqueTitlesBoundary(),
        TestR5DataWeaveCodeSnippetPresence(),
        TestR5NoMarkdownSyntaxErrors(),
    ]
