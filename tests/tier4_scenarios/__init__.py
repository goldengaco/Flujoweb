"""Tier 4 Real-World Scenarios test package."""
from typing import List
from tests.framework import TestCase
from .test_r1_scenario_multicloud import get_r1_tier4_tests
from .test_r2_scenario_command_evacuation import get_r2_tier4_tests
from .test_r3_scenario_mobile_escape import get_r3_tier4_tests
from .test_r4_scenario_fanout_blackout import get_r4_tier4_tests
from .test_r5_scenario_80_ideas_audit import get_r5_tier4_tests


def get_all_tier4_tests() -> List[TestCase]:
    return [
        *get_r1_tier4_tests(),
        *get_r2_tier4_tests(),
        *get_r3_tier4_tests(),
        *get_r4_tier4_tests(),
        *get_r5_tier4_tests(),
    ]
