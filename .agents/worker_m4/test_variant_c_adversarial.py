import sys
import os
import time

sys.path.insert(0, os.path.abspath('.'))
from tests.framework.browser import BrowserSession

def run_adversarial_tests():
    print("=" * 70)
    print("  ADVERSARIAL & STRESS VERIFICATION: VARIANT C")
    print("=" * 70)

    browser = BrowserSession()
    browser.launch()
    html_path = os.path.abspath("sistemas/emergency-tri-screen-c/index.html")
    browser.navigate(html_path)
    time.sleep(0.5)

    # 1. Stress Test: Rapid Alarm Trigger & Reset Cycles
    print("[STRESS 1] Rapid Alarm Trigger & Reset Cycles (10 iterations)...")
    for i in range(10):
        browser.evaluate(f"window.__EMERGENCY_TRI_C__.triggerAlarm({{ incidentLevel: {(i % 4) + 1} }})")
        browser.evaluate("window.__EMERGENCY_TRI_C__.resetSimulation()")
    
    final_state = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert final_state["alarmState"] == "STANDBY"
    assert final_state["incidentLevel"] == 1
    assert final_state["occupantsTotal"] == 45
    print("   -> 10 cycles executed cleanly with 0 desyncs. PASSED.")

    # 2. Stress Test: Multiple Hazards in All Zones
    print("[STRESS 2] Multiple Concurrent Hazard Injections...")
    browser.evaluate("window.__EMERGENCY_TRI_C__.triggerAlarm({ incidentLevel: 4 })")
    browser.evaluate("window.__EMERGENCY_TRI_C__.injectHazard('SERVER_ROOM')")
    browser.evaluate("window.__EMERGENCY_TRI_C__.injectHazard('BREAKROOM')")
    browser.evaluate("window.__EMERGENCY_TRI_C__.injectHazard('LABS')")
    
    state_multi_haz = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert len(state_multi_haz["hazards"]) == 3, f"Expected 3 active hazards, got {len(state_multi_haz['hazards'])}"
    print("   -> 3 active concurrent hazards registered and rendered without errors. PASSED.")

    # 3. Dual Stairwell Blockade & Reroute Resilience
    print("[STRESS 3] Dual Stairwell Blockade & Recovery...")
    browser.evaluate("window.__EMERGENCY_TRI_C__.toggleStairwell('STAIRWELL_A', 'BLOCKED')")
    browser.evaluate("window.__EMERGENCY_TRI_C__.toggleStairwell('STAIRWELL_B', 'BLOCKED')")
    state_stair_both = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert state_stair_both["stairwells"]["STAIRWELL_A"] == "BLOCKED"
    assert state_stair_both["stairwells"]["STAIRWELL_B"] == "BLOCKED"

    # Unblock Stairwell A
    browser.evaluate("window.__EMERGENCY_TRI_C__.toggleStairwell('STAIRWELL_A', 'CLEAR')")
    state_stair_recov = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert state_stair_recov["stairwells"]["STAIRWELL_A"] == "CLEAR"
    print("   -> Dual blockade and recovery verified. PASSED.")

    # 4. Check all occupants safe through Phone D triage sweeps
    print("[STRESS 4] Mass Triage Check-In Simulation (Evacuate -> All Safe)...")
    for _ in range(45):
        browser.evaluate("window.__EMERGENCY_TRI_C__.checkInSafe('PHONE_D')")
    
    state_all_safe = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    print(f"   -> Final Headcount: {state_all_safe['occupantsSafe']} / {state_all_safe['occupantsTotal']} Safe")
    assert state_all_safe["occupantsSafe"] == state_all_safe["occupantsTotal"], "All occupants should be marked safe"

    # 5. Zero Console Errors Check
    assert len(browser.console_errors) == 0, f"Errors found: {browser.console_errors}"
    assert len(browser.page_errors) == 0, f"Page errors found: {browser.page_errors}"

    browser.close()
    print("\n" + "=" * 70)
    print("  ALL ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_adversarial_tests()
