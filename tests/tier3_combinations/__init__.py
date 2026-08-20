"""Tier 3 Cross-Feature Combinations test package."""
from typing import List
from tests.framework import TestCase
from .test_r1_combinations import get_r1_tier3_tests
from .test_r2_combinations import get_r2_tier3_tests
from .test_r3_combinations import get_r3_tier3_tests
from .test_r4_combinations import get_r4_tier3_tests
from .test_r5_combinations import get_r5_tier3_tests


def get_all_tier3_tests() -> List[TestCase]:
    return [
        *get_r1_tier3_tests(),
        *get_r2_tier3_tests(),
        *get_r3_tier3_tests(),
        *get_r4_tier3_tests(),
        *get_r5_tier3_tests(),
    ]
