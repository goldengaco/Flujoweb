"""Tier 1 Feature Coverage test package."""
from typing import List
from tests.framework import TestCase
from .test_r1_hybrid_features import get_r1_tier1_tests
from .test_r2_evac_v1_features import get_r2_tier1_tests
from .test_r3_evac_v2_features import get_r3_tier1_tests
from .test_r4_evac_v3_features import get_r4_tier1_tests
from .test_r5_catalog_features import get_r5_tier1_tests


def get_all_tier1_tests() -> List[TestCase]:
    return [
        *get_r1_tier1_tests(),
        *get_r2_tier1_tests(),
        *get_r3_tier1_tests(),
        *get_r4_tier1_tests(),
        *get_r5_tier1_tests(),
    ]
