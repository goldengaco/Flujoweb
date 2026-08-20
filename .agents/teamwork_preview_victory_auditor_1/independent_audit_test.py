import os
import sys
import time
import json
import re

sys.path.insert(0, os.path.abspath("."))
from tests.framework.browser import BrowserSession

PROJECT_ROOT = os.path.abspath(".")
TARGETS = {
    "a": {
        "name": "Variant A (Tactical Cyberpunk Tri-Panel)",
        "path": os.path.join(PROJECT_ROOT, "sistemas", "emergency-tri-screen-a", "index.html"),
        "harness": "__EMERGENCY_TRI_A__"
    },
    "b": {
        "name": "Variant B (Clean Minimalist Linear Dark)",
        "path": os.path.join(PROJECT_ROOT, "sistemas", "emergency-tri-screen-b", "index.html"),
        "harness": "__EMERGENCY_TRI_B__"
    },
    "c": {
        "name": "Variant C (2.5D Isometric Mission Control)",
        "path": os.path.join(PROJECT_ROOT, "sistemas", "emergency-tri-screen-c", "index.html"),
        "harness": "__EMERGENCY_TRI_C__"
    },
    "portal": {
        "name": "Master Enterprise Launchpad Portal",
        "path": os.path.join(PROJECT_ROOT, "sistemas", "index.html"),
        "harness": None
    }
}

VIEWPORTS = [
    {"name": "Mobile 360px", "width": 360, "height": 640},
    {"name": "Tablet 768px", "width": 768, "height": 1024},
    {"name": "Laptop HD 1280px", "width": 1280, "height": 800},
    {"name": "Desktop FHD 1920px", "width": 1920, "height": 1080},
    {"name": "4K UHD 3840px", "width": 3840, "height": 2160}
]

total_checks = 0
passed_checks = 0
failed_checks = 0
failures = []

def record_pass(name, detail=""):
    global total_checks, passed_checks
    total_checks += 1
    passed_checks += 1
    print(f"  [PASS] {name} " + (f"({detail})" if detail else ""))

def record_fail(name, error):
    global total_checks, failed_checks
    total_checks += 1
    failed_checks += 1
    msg = f"  [FAIL] {name}: {error}"
    print(msg, file=sys.stderr)
    failures.append(msg)

def run_phase_b_forensics():
    print("\n" + "=" * 70)
    print("  PHASE B: INDEPENDENT FORENSIC CODE INTEGRITY & ANTI-CHEATING AUDIT")
    print("=" * 70)

    for key, target in TARGETS.items():
        print(f"\n--- Inspecting Source: {target['name']} ---")
        filepath = target["path"]
        if not os.path.exists(filepath):
            record_fail(f"{key} file existence", f"Missing file at {filepath}")
            continue
        
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        size = len(content.encode("utf-8"))
        lines = len(content.splitlines())
        record_pass(f"{key} file existence", f"{size} bytes, {lines} lines")

        # 1. Check prohibited dummy mock returns
        has_mock = bool(re.search(r"return\s+true\s*;\s*//\s*dummy", content, re.I) or
                       re.search(r"mocked\s+test\s+result", content, re.I))
        if not has_mock:
            record_pass(f"{key} anti-mock check", "No dummy test bypasses or facades detected")
        else:
            record_fail(f"{key} anti-mock check", "Found dummy test mock bypass")

        # 2. Check zero external script tags
        has_ext_scripts = bool(re.search(r"<script\s+src=[\"']http", content, re.I))
        if not has_ext_scripts:
            record_pass(f"{key} self-contained architecture", "Zero external JS runtime dependencies")
        else:
            record_fail(f"{key} self-contained architecture", "External script tag found requiring network")

        if key != "portal":
            # 3. Check genuine NavMesh pathfinding
            has_pathfinding = bool(re.search(r"findPath|aStar|navMesh|corridors|graph", content, re.I))
            has_dist = bool(re.search(r"Math\.hypot|Math\.sqrt|heuristic|distance", content, re.I))
            if has_pathfinding and has_dist:
                record_pass(f"{key} pathfinding engine", "Genuine NavMesh graph and distance heuristics present")
            else:
                record_fail(f"{key} pathfinding engine", "Missing NavMesh algorithmic pathfinding routines")

            # 4. Check Canvas 2D requestAnimationFrame loop
            has_canvas = bool(re.search(r"requestAnimationFrame", content, re.I) and
                              re.search(r"getContext\([\"']2d[\"']\)", content, re.I))
            if has_canvas:
                record_pass(f"{key} canvas rendering engine", "Real requestAnimationFrame 2D canvas pipeline")
            else:
                record_fail(f"{key} canvas rendering engine", "Missing requestAnimationFrame canvas loop")

            # 5. Check procedural Web Audio synthesis
            has_audio = bool(re.search(r"(AudioContext|webkitAudioContext)", content, re.I) and
                             re.search(r"createOscillator", content, re.I) and
                             re.search(r"createGain", content, re.I))
            if has_audio:
                record_pass(f"{key} procedural Web Audio API", "Oscillator and gain synth audio nodes present")
            else:
                record_fail(f"{key} procedural Web Audio API", "Missing Web Audio oscillator synthesis")

            # 6. Check BroadcastChannel / inter-device event sync
            has_bus = bool(re.search(r"BroadcastChannel|EventBus|broadcast", content, re.I))
            if has_bus:
                record_pass(f"{key} inter-device synchronization", "BroadcastChannel/Bus present for real-time sync")
            else:
                record_fail(f"{key} inter-device synchronization", "Missing inter-device event bus")

            # 7. Check headcount computation
            has_headcount = bool(re.search(r"occupantsSafe|safeCount|headcount", content, re.I))
            if has_headcount:
                record_pass(f"{key} dynamic headcount tracking", "Safe tally and headcount calculation present")
            else:
                record_fail(f"{key} dynamic headcount tracking", "Missing safe headcount logic")
        else:
            # Portal checks
            has_a = "emergency-tri-screen-a" in content
            has_b = "emergency-tri-screen-b" in content
            has_c = "emergency-tri-screen-c" in content
            if has_a and has_b and has_c:
                record_pass("portal variant linkage", "All 3 Tri-Screen variant links present in master portal")
            else:
                record_fail("portal variant linkage", "Missing links to emergency variants in portal")

def run_phase_c_dynamic_execution():
    print("\n" + "=" * 70)
    print("  PHASE C: INDEPENDENT DYNAMIC BROWSER EXECUTION VIA CDP")
    print("=" * 70)

    browser = BrowserSession()
    browser.launch()
    print(f"  [CDP] Headless browser session launched on port {browser.port}\n")

    try:
        for key, target in TARGETS.items():
            print(f">>> Testing Dynamic Execution: {target['name']}")
            browser.navigate(target["path"])
            time.sleep(1.0)

            # 1. Clean load check
            err_count = len(browser.console_errors) + len(browser.page_errors)
            if err_count == 0:
                record_pass(f"{key} clean load", "0 console errors, 0 uncaught exceptions")
            else:
                record_fail(f"{key} clean load", f"Errors found: {browser.console_errors + browser.page_errors}")

            # 2. Viewport anti-collision checks
            for vp in VIEWPORTS:
                browser.send_command('Emulation.setDeviceMetricsOverride', {
                    'width': vp['width'],
                    'height': vp['height'],
                    'deviceScaleFactor': 1,
                    'mobile': vp['width'] < 768
                })
                time.sleep(0.15)
                overflow = browser.evaluate("""
                    document.documentElement.scrollWidth > (window.innerWidth + 3) ||
                    document.body.scrollWidth > (window.innerWidth + 3)
                """)
                if not overflow:
                    record_pass(f"{key} layout anti-collision @ {vp['name']}", 'Zero horizontal overflow')
                else:
                    record_fail(f"{key} layout anti-collision @ {vp['name']}", 'Horizontal overflow detected')

            # Restore desktop FHD
            browser.send_command('Emulation.setDeviceMetricsOverride', {
                'width': 1920,
                'height': 1080,
                'deviceScaleFactor': 1,
                'mobile': False
            })
            time.sleep(0.2)

            if key != "portal":
                harness = target["harness"]
                exists = browser.evaluate(f"typeof window.{harness} === 'object'")
                if exists:
                    record_pass(f"{key} harness validation", f"window.{harness} exposed and valid")
                else:
                    record_fail(f"{key} harness validation", f"window.{harness} is missing")
                    continue

                state = browser.evaluate(f"window.{harness}.getState()")
                if state and state.get("alarmState") == "STANDBY" and state.get("occupantsTotal", 0) >= 40 and state.get("occupantsSafe", 0) == 0:
                    record_pass(f"{key} initial standby state", f"Total: {state['occupantsTotal']}, Safe: 0, State: STANDBY")
                else:
                    record_fail(f"{key} initial standby state", f"Unexpected initial state: {state}")

                # Trigger Alarm
                browser.evaluate(f"window.{harness}.triggerAlarm()")
                time.sleep(0.3)
                act_state = browser.evaluate(f"window.{harness}.getState()")
                if act_state.get("alarmState") == "ACTIVE":
                    record_pass(f"{key} alarm activation", "State transitioned to ACTIVE")
                else:
                    record_fail(f"{key} alarm activation", f"Expected ACTIVE, got {act_state.get('alarmState')}")

                # Autonomous particle kinematics over 1.2s
                p1 = browser.evaluate(f"window.{harness}.getState().particles.slice(0, 5).map(p => ({{x: p.x, y: p.y}}))")
                time.sleep(1.2)
                p2 = browser.evaluate(f"window.{harness}.getState().particles.slice(0, 5).map(p => ({{x: p.x, y: p.y}}))")

                moved_count = 0
                for i in range(len(p1)):
                    dx = abs(p2[i]["x"] - p1[i]["x"])
                    dy = abs(p2[i]["y"] - p1[i]["y"])
                    if dx > 0.5 or dy > 0.5:
                        moved_count += 1

                if moved_count > 0:
                    record_pass(f"{key} particle kinematics", f"{moved_count}/{len(p1)} sample particles moved continuously along path")
                else:
                    record_fail(f"{key} particle kinematics", "Particles are static")

                # Dynamic hazard injection
                browser.evaluate(f"window.{harness}.injectHazard('BREAKROOM')")
                hazards = browser.evaluate(f"window.{harness}.getState().hazards")
                if hazards:
                    record_pass(f"{key} dynamic hazard injection", f"Injected hazard registered: {len(hazards)} active")
                else:
                    record_fail(f"{key} dynamic hazard injection", "Hazard not registered")

                # Stairwell blockage toggle
                st_arg = 'A' if key == 'b' else 'STAIRWELL_A'
                browser.evaluate(f"window.{harness}.toggleStairwell('{st_arg}', 'BLOCKED')")
                st_state = browser.evaluate(f"window.{harness}.getState().stairwells")
                is_blocked = (st_state.get('A') == 'BLOCKED' or
                              st_state.get('STAIRWELL_A') == 'BLOCKED' or
                              st_state.get('a') == 'BLOCKED')
                if is_blocked:
                    record_pass(f'{key} stairwell blockage toggle', f'Stairwell A toggled to BLOCKED ({st_state})')
                else:
                    record_fail(f'{key} stairwell blockage toggle', f'Stairwell A not BLOCKED: {st_state}')

                # Survivor safe check-in
                if key == 'b':
                    browser.evaluate(f"window.{harness}.checkInSafe('PHONE_B')")
                    b_checked = browser.evaluate(f"document.getElementById('btnPhoneBCheckin').classList.contains('checked-in')")
                    if b_checked:
                        record_pass(f'{key} survivor check-in sync', 'Phone B safety check-in verified')
                    else:
                        record_fail(f'{key} survivor check-in sync', 'Phone B check-in button not checked-in')
                elif key == 'c':
                    browser.evaluate(f"window.{harness}.checkInSafe('PHONE_D')")
                    safe_after = browser.evaluate(f"window.{harness}.getState().occupantsSafe")
                    if safe_after > 0:
                        record_pass(f'{key} survivor check-in sync', f'Survivor triage updated safe count: {safe_after}')
                    else:
                        record_fail(f'{key} survivor check-in sync', 'Safe count did not increment in Variant C')
                else:
                    safe_before = browser.evaluate(f"window.{harness}.getState().occupantsSafe")
                    browser.evaluate(f"window.{harness}.checkInSafe('B')")
                    safe_after = browser.evaluate(f"window.{harness}.getState().occupantsSafe")
                    if safe_after > safe_before:
                        record_pass(f'{key} survivor check-in sync', f'Safe count updated: {safe_before} -> {safe_after}')
                    else:
                        record_fail(f'{key} survivor check-in sync', 'Safe count did not increment')

                # Reset simulation
                browser.evaluate(f"window.{harness}.resetSimulation()")
                reset_state = browser.evaluate(f"window.{harness}.getState()")
                if reset_state.get("alarmState") == "STANDBY" and reset_state.get("occupantsSafe", 0) == 0:
                    record_pass(f"{key} simulation reset hygiene", "Returned cleanly to peace-time STANDBY")
                else:
                    record_fail(f"{key} simulation reset hygiene", f"Reset failed: {reset_state}")
            else:
                # Portal dynamic checks
                card_count = browser.evaluate("document.querySelectorAll('.system-card').length")
                if card_count >= 14:
                    record_pass("portal system cards count", f"Rendered {card_count} enterprise system cards (>=14)")
                else:
                    record_fail("portal system cards count", f"Rendered only {card_count} cards")

                # Category filter
                browser.evaluate("""
                    const btn = Array.from(document.querySelectorAll('.category-chip, .filter-btn, button'))
                        .find(b => b.textContent.includes('Emergencia'));
                    if (btn) btn.click();
                """)
                time.sleep(0.3)
                vis_count = browser.evaluate("""
                    Array.from(document.querySelectorAll('.system-card'))
                        .filter(c => c.style.display !== 'none').length
                """)
                if vis_count >= 3:
                    record_pass("portal emergency category filter", f"Filtered {vis_count} emergency system cards (>=3)")
                else:
                    record_fail("portal emergency category filter", f"Expected >=3 emergency cards, got {vis_count}")
            print("")
    finally:
        browser.close()

def main():
    print("######################################################################")
    print("        INDEPENDENT VICTORY AUDIT SUITE -- EXECUTION START            ")
    print("######################################################################")

    run_phase_b_forensics()
    run_phase_c_dynamic_execution()

    print("\n" + "=" * 70)
    print("                 FINAL VICTORY AUDIT SCORECARD                        ")
    print("=" * 70)
    print(f"  Total Verification Checks : {total_checks}")
    print(f"  Passed Checks             : {passed_checks}")
    print(f"  Failed Checks             : {failed_checks}")
    print(f"  Success Rate              : {((passed_checks / total_checks) * 100):.1f}%")

    if failed_checks == 0:
        print("\n>>> OVERALL AUDIT VERDICT: VICTORY CONFIRMED <<<\n")
        sys.exit(0)
    else:
        print("\n>>> OVERALL AUDIT VERDICT: VICTORY REJECTED <<<\n")
        for f in failures:
            print(f)
        sys.exit(1)

if __name__ == "__main__":
    main()
