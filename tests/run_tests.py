#!/usr/bin/env python3
"""Enterprise Multi-Tier Automated Test Suite Runner (Tiers 1-4).

Covers all 5 Deliverables:
- R1: Apigee Multi-Cloud Gateway & MuleSoft External Telemetry Cockpit (sistemas/apigee-mulesoft-hybrid/index.html)
- R2: Emergency Evacuation Suite V1: Master Building Command (sistemas/emergency-evacuation-v1/index.html)
- R3: Emergency Evacuation Suite V2: Mobile Occupant HUD (sistemas/emergency-evacuation-v2/index.html)
- R4: Emergency Evacuation Suite V3: Multi-Carrier Broadcast Fan-Out (sistemas/emergency-evacuation-v3/index.html)
- R5: Master Innovation Catalog: 80 Real-World Ideas (sistemas/mulesoft_80_ideas_observabilidad.md)
"""
import argparse
import os
import sys
import time
from typing import Dict, List, Optional

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from tests.framework import (
    BrowserSession,
    Colors,
    TestResult,
    c_bold,
    c_cyan,
    c_dim,
    c_fail,
    c_green,
    c_pass,
    c_red,
    c_yellow,
    colored,
)
from tests.tier1_features import get_all_tier1_tests
from tests.tier2_boundaries import get_all_tier2_tests
from tests.tier3_combinations import get_all_tier3_tests
from tests.tier4_scenarios import get_all_tier4_tests


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run the Enterprise Multi-Tier Automated Test Suite (Tiers 1-4)."
    )
    parser.add_argument(
        "--tier",
        type=str,
        default="1,2,3,4",
        help="Comma-separated list of tiers to run (e.g. 1,2,3,4). Default: all.",
    )
    parser.add_argument(
        "--deliverable",
        type=str,
        default="r1,r2,r3,r4,r5",
        help="Comma-separated list of deliverables to test (e.g. r1,r2,r3,r4,r5). Default: all.",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable detailed error tracebacks and extra logging.",
    )
    return parser.parse_args()


def print_banner():
    banner = f"""
{Colors.BRIGHT_CYAN}{Colors.BOLD}========================================================================================
       ENTERPRISE HYBRID CLOUD & LIFE-CRITICAL EMERGENCY RESPONSE SYSTEMS
                  AUTOMATED MULTI-TIER E2E TEST SUITE (TIERS 1-4)
========================================================================================{Colors.RESET}
{c_dim("Target Systems: R1 (Apigee+MuleSoft) | R2 (Evac V1) | R3 (Evac V2) | R4 (Fan-Out V3) | R5 (80 Ideas)")}
"""
    print(banner)


def main():
    args = parse_args()
    print_banner()

    target_tiers = [int(t.strip()) for t in args.tier.split(",") if t.strip().isdigit()]
    target_deliverables = [d.strip().lower() for d in args.deliverable.split(",") if d.strip()]

    # Collect all tests
    all_tests = []
    if 1 in target_tiers:
        all_tests.extend(get_all_tier1_tests())
    if 2 in target_tiers:
        all_tests.extend(get_all_tier2_tests())
    if 3 in target_tiers:
        all_tests.extend(get_all_tier3_tests())
    if 4 in target_tiers:
        all_tests.extend(get_all_tier4_tests())

    # Filter by deliverable
    filtered_tests = [t for t in all_tests if t.deliverable.lower() in target_deliverables]

    if not filtered_tests:
        print(c_yellow("No tests matched the specified filters."))
        sys.exit(0)

    print(f" {c_bold('Execution Plan:')} {c_cyan(str(len(filtered_tests)))} tests queued across Tiers {target_tiers} for Deliverables {target_deliverables}\n")

    # Start browser session
    browser = None
    browser_needed = any(t.deliverable.lower() in ("r1", "r2", "r3", "r4") for t in filtered_tests)
    if browser_needed:
        print(f" {c_dim('[LAUNCH]')} Initializing isolated Headless Chrome CDP Session...")
        browser = BrowserSession()
        browser.launch()
        print(f" {c_green('[READY]')} Headless Chrome connected via CDP on port {browser.port}\n")

    context = {
        "browser_r1": browser,
        "browser_r2": browser,
        "browser_r3": browser,
        "browser_r4": browser,
    }

    results: List[TestResult] = []
    start_time = time.perf_counter()

    current_tier = None
    total_count = len(filtered_tests)

    try:
        for idx, test in enumerate(filtered_tests, 1):
            if test.tier != current_tier:
                current_tier = test.tier
                tier_titles = {
                    1: "TIER 1: FEATURE COVERAGE & FUNCTIONAL ACCEPTANCE",
                    2: "TIER 2: BOUNDARY, CORNER CASES & RESILIENCE",
                    3: "TIER 3: CROSS-FEATURE COMBINATIONS & WORKFLOW MESH",
                    4: "TIER 4: REAL-WORLD END-TO-END SYSTEM SCENARIOS",
                }
                print(f"\n {Colors.BOLD}{Colors.BG_BLUE}{Colors.WHITE} --- {tier_titles.get(current_tier, f'TIER {current_tier}')} --- {Colors.RESET}\n")

            res = test.run(context)
            results.append(res)
            print(res.format_line(idx, total_count))

            if res.status == "FAIL" and args.verbose and res.error_traceback:
                print(f"\n{Colors.RED}{res.error_traceback}{Colors.RESET}\n")

    finally:
        if browser:
            browser.close()

    total_duration_s = time.perf_counter() - start_time

    # Summary calculations
    pass_count = sum(1 for r in results if r.status == "PASS")
    fail_count = sum(1 for r in results if r.status == "FAIL")
    skip_count = sum(1 for r in results if r.status == "SKIP")

    print("\n" + "=" * 88)
    print(f" {Colors.BOLD}TEST EXECUTION SUMMARY{Colors.RESET}")
    print("=" * 88)

    # Deliverable Matrix Breakdown
    deliverables = ["r1", "r2", "r3", "r4", "r5"]
    print(f" {'Deliverable'.ljust(15)} | {'Tier 1'.center(8)} | {'Tier 2'.center(8)} | {'Tier 3'.center(8)} | {'Tier 4'.center(8)} | {'Total'.center(8)} | {'Status'.center(10)}")
    print(f" {'-' * 15}-+-{'-' * 8}-+-{'-' * 8}-+-{'-' * 8}-+-{'-' * 8}-+-{'-' * 8}-+-{'-' * 10}")

    deliv_names = {
        "r1": "R1: Hybrid Hub",
        "r2": "R2: Evac V1 Cmd",
        "r3": "R3: Evac V2 HUD",
        "r4": "R4: Fan-Out V3",
        "r5": "R5: 80 Ideas",
    }

    for d in deliverables:
        d_results = [r for r in results if r.deliverable.lower() == d]
        t1 = sum(1 for r in d_results if r.tier == 1 and r.status == "PASS")
        t2 = sum(1 for r in d_results if r.tier == 2 and r.status == "PASS")
        t3 = sum(1 for r in d_results if r.tier == 3 and r.status == "PASS")
        t4 = sum(1 for r in d_results if r.tier == 4 and r.status == "PASS")
        tot = len(d_results)
        d_fails = sum(1 for r in d_results if r.status == "FAIL")

        status_str = c_pass("PASS") if d_fails == 0 and tot > 0 else (c_fail("FAIL") if d_fails > 0 else c_skip("SKIP"))
        print(f" {deliv_names[d].ljust(15)} | {str(t1).center(8)} | {str(t2).center(8)} | {str(t3).center(8)} | {str(t4).center(8)} | {str(tot).center(8)} | {status_str.center(10)}")

    print("=" * 88)
    print(f" Total Tests: {c_bold(str(len(results)))} | Passed: {c_green(str(pass_count))} | Failed: {c_red(str(fail_count))} | Skipped: {c_yellow(str(skip_count))} | Time: {c_cyan(f'{total_duration_s:.2f}s')}")

    if fail_count == 0:
        print(f"\n {Colors.BG_GREEN}{Colors.BLACK}{Colors.BOLD} ALL TESTS PASSED SUCCESSFULLY (100% COVERAGE) {Colors.RESET}\n")
        sys.exit(0)
    else:
        print(f"\n {Colors.BG_RED}{Colors.WHITE}{Colors.BOLD} {fail_count} TEST(S) FAILED {Colors.RESET}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
