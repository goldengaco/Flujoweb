"""Tier 2 Boundary & Corner Case test package."""
from typing import List
from tests.framework import TestCase
from .test_r1_boundaries import get_r1_tier2_tests
from .test_r2_boundaries import get_r2_tier2_tests
from .test_r3_boundaries import get_r3_tier2_tests
from .test_r4_boundaries import get_r4_tier2_tests
from .test_r5_boundaries import get_r5_tier2_tests


def get_all_tier2_tests() -> List[TestCase]:
    return [
        *get_r1_tier2_tests(),
        *get_r2_tier2_tests(),
        *get_r3_tier2_tests(),
        *get_r4_tier2_tests(),
        *get_r5_tier2_tests(),
    ]
