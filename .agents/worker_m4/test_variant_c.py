import sys
import os
import time

sys.path.insert(0, os.path.abspath('.'))
from tests.framework.browser import BrowserSession

def run_tests():
    print("=" * 70)
    print("  AUTOMATED VERIFICATION SUITE: VARIANT C (2.5D ISOMETRIC)")
    print("=" * 70)

    browser = BrowserSession()
    browser.launch()
    print(f"[LAUNCH] Headless Browser connected via CDP on port {browser.port}")

    html_path = os.path.abspath("sistemas/emergency-tri-screen-c/index.html")
    browser.navigate(html_path)
    time.sleep(1.0)

    title = browser.evaluate("document.title")
    print(f"[TEST 1] Page Title: '{title}'")
    assert "ISO-COMMAND" in title, f"Unexpected title: {title}"

    # 1. Console Errors & Page Errors Check
    print(f"[TEST 2] Console Errors Check...")
    assert len(browser.console_errors) == 0, f"Found console errors: {browser.console_errors}"
    assert len(browser.page_errors) == 0, f"Found page errors: {browser.page_errors}"
    print("   -> 0 console errors, 0 page errors. PASSED.")

    # 2. DOM Elements Check
    print("[TEST 3] Verifying DOM Elements across 3 columns...")
    has_header = browser.evaluate("document.querySelector('.top-command-header') !== null")
    has_tablet = browser.evaluate("document.querySelector('.tablet-chassis') !== null")
    has_rotary = browser.evaluate("document.querySelector('#rotary-canvas') !== null")
    has_ptt = browser.evaluate("document.querySelector('#ptt-canvas') !== null")
    has_iso_canvas = browser.evaluate("document.querySelector('#iso-canvas') !== null")
    has_phone_b = browser.evaluate("document.querySelector('#card-phone-b') !== null")
    has_phone_c = browser.evaluate("document.querySelector('#card-phone-c') !== null")
    has_phone_d = browser.evaluate("document.querySelector('#card-phone-d') !== null")

    assert has_header and has_tablet and has_rotary and has_ptt and has_iso_canvas and has_phone_b and has_phone_c and has_phone_d, "Missing DOM components"
    print("   -> All DOM components present across 3 columns. PASSED.")

    # 3. Global Harness Verification
    print("[TEST 4] Programmatic Test Harness `window.__EMERGENCY_TRI_C__`...")
    harness_type = browser.evaluate("typeof window.__EMERGENCY_TRI_C__")
    assert harness_type == "object", f"Expected object, got {harness_type}"

    # Initial State
    state = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    print(f"   -> Initial state: alarmState={state['alarmState']}, total={state['occupantsTotal']}, safe={state['occupantsSafe']}, evacuating={state['occupantsEvacuating']}")
    assert state["alarmState"] == "STANDBY", f"Expected STANDBY, got {state['alarmState']}"
    assert state["occupantsTotal"] == 45, f"Expected 45 occupants, got {state['occupantsTotal']}"
    assert state["occupantsSafe"] == 0, f"Expected 0 safe, got {state['occupantsSafe']}"
    assert state["occupantsEvacuating"] == 0, f"Expected 0 evacuating, got {state['occupantsEvacuating']}"
    assert len(state["particles"]) == 45, f"Expected 45 particle objects"

    # Trigger Alarm via Harness
    print("[TEST 5] Triggering alarm via harness...")
    browser.evaluate("window.__EMERGENCY_TRI_C__.triggerAlarm({ incidentLevel: 3, channel: 'LORAWAN_SIREN' })")
    time.sleep(0.5)

    state_alarm = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    print(f"   -> Alarm state: {state_alarm['alarmState']}, incidentLevel: {state_alarm['incidentLevel']}, channel: {state_alarm['channel']}")
    assert state_alarm["alarmState"] == "ACTIVE"
    assert state_alarm["incidentLevel"] == 3
    assert state_alarm["channel"] == "LORAWAN_SIREN"
    assert state_alarm["occupantsEvacuating"] == 45

    # Check Strobe and Badge classes
    has_strobe = browser.evaluate("document.querySelector('#strobe-overlay').classList.contains('active')")
    has_badge_alarm = browser.evaluate("document.querySelector('#header-incident-badge').classList.contains('alarm-active')")
    assert has_strobe, "Strobe overlay should be active"
    assert has_badge_alarm, "Header badge should indicate alarm"

    # 4. Simulation Physics & Autonomous Navigation
    print("[TEST 6] Verifying autonomous particle physics over 2.0s...")
    p_init = state_alarm["particles"][0]
    time.sleep(2.0)
    state_physics = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    p_after = state_physics["particles"][0]
    print(f"   -> Particle #1 movement: ({p_init['x']:.1f}, {p_init['y']:.1f}) -> ({p_after['x']:.1f}, {p_after['y']:.1f})")
    assert (p_init["x"] != p_after["x"] or p_init["y"] != p_after["y"]), "Particle position should update dynamically via physics"

    # 5. Dynamic Hazard Injection
    print("[TEST 7] Dynamic Hazard Injection ('SERVER_ROOM')...")
    browser.evaluate("window.__EMERGENCY_TRI_C__.injectHazard('SERVER_ROOM')")
    time.sleep(0.5)
    state_hazard = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert len(state_hazard["hazards"]) == 1, f"Expected 1 hazard, got {len(state_hazard['hazards'])}"
    assert state_hazard["hazards"][0]["zone"] == "ROOM_VAULT"
    print("   -> Hazard successfully registered and active. PASSED.")

    # 6. Stairwell Toggle
    print("[TEST 8] Stairwell Controls Toggle...")
    browser.evaluate("window.__EMERGENCY_TRI_C__.toggleStairwell('STAIRWELL_A', 'BLOCKED')")
    time.sleep(0.3)
    state_stair = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert state_stair["stairwells"]["STAIRWELL_A"] == "BLOCKED"
    stair_text = browser.evaluate("document.querySelector('#status-stairwell-a').textContent")
    assert "[BLOCKED]" in stair_text, f"Expected [BLOCKED], got {stair_text}"

    browser.evaluate("window.__EMERGENCY_TRI_C__.toggleStairwell('STAIRWELL_A', 'CLEAR')")
    time.sleep(0.2)
    state_stair2 = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert state_stair2["stairwells"]["STAIRWELL_A"] == "CLEAR"
    print("   -> Stairwell toggle verified. PASSED.")

    # 7. Recipient Check-In & Headcount Tally
    print("[TEST 9] Survivor Check-In & Headcount Tally...")
    browser.evaluate("window.__EMERGENCY_TRI_C__.checkInSafe('PHONE_B')")
    time.sleep(0.3)
    state_checkin = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert state_checkin["occupantsSafe"] >= 1, "Occupant count safe should increment"

    triage_count = browser.evaluate("document.querySelectorAll('#triage-log-feed .triage-log-item').length")
    assert triage_count >= 2, f"Triage log should have new entries, found {triage_count}"
    print(f"   -> Check-in safe verified. Total Safe: {state_checkin['occupantsSafe']}, Triage entries: {triage_count}. PASSED.")

    # 8. Dynamic Occupant Count
    print("[TEST 10] Dynamic Occupant Count Resize...")
    browser.evaluate("window.__EMERGENCY_TRI_C__.setOccupantCount(30)")
    time.sleep(0.3)
    state_resize = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert state_resize["occupantsTotal"] == 30, f"Expected 30, got {state_resize['occupantsTotal']}"

    browser.evaluate("window.__EMERGENCY_TRI_C__.setOccupantCount(45)")
    time.sleep(0.3)
    state_resize2 = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert state_resize2["occupantsTotal"] == 45, f"Expected 45, got {state_resize2['occupantsTotal']}"
    print("   -> Occupant count resizing verified. PASSED.")

    # 9. Simulation Reset
    print("[TEST 11] Simulation Reset...")
    browser.evaluate("window.__EMERGENCY_TRI_C__.resetSimulation()")
    time.sleep(0.5)
    state_reset = browser.evaluate("window.__EMERGENCY_TRI_C__.getState()")
    assert state_reset["alarmState"] == "STANDBY"
    assert state_reset["incidentLevel"] == 1
    assert len(state_reset["hazards"]) == 0
    assert state_reset["occupantsSafe"] == 0
    print("   -> Simulation successfully reset to peace-time STANDBY. PASSED.")

    # 10. UI User Interaction Tests (DOM Clicks)
    print("[TEST 12] Interactive DOM Click Tests...")
    # Click level pill 4
    browser.evaluate('document.querySelector(".level-pill-btn[data-lvl=\\"4\\"]").click()')
    time.sleep(0.2)
    lvl_after_click = browser.evaluate("window.__EMERGENCY_TRI_C__.getState().incidentLevel")
    assert lvl_after_click == 4, f"Expected LVL 4, got {lvl_after_click}"

    # Click channel chip
    browser.evaluate('document.querySelector(".channel-chip[data-channel=\\"5G_PUSH\\"]").click()')
    time.sleep(0.2)
    chan_after_click = browser.evaluate("window.__EMERGENCY_TRI_C__.getState().channel")
    assert chan_after_click == "5G_PUSH", f"Expected 5G_PUSH, got {chan_after_click}"

    # Click Dispatch Alarm button
    browser.evaluate('document.querySelector("#btn-dispatch-alarm").click()')
    time.sleep(0.3)
    alarm_after_click = browser.evaluate("window.__EMERGENCY_TRI_C__.getState().alarmState")
    assert alarm_after_click == "ACTIVE", f"Expected ACTIVE, got {alarm_after_click}"

    # Click Reset button in header
    browser.evaluate('document.querySelector("#btn-master-reset").click()')
    time.sleep(0.3)
    reset_after_click = browser.evaluate("window.__EMERGENCY_TRI_C__.getState().alarmState")
    assert reset_after_click == "STANDBY", f"Expected STANDBY, got {reset_after_click}"
    print("   -> All DOM click interactions verified. PASSED.")

    # 11. Responsive Viewports & Zero Horizontal Overflow
    print("[TEST 13] Responsive Viewport & Overflow Tests...")
    viewports = [
        {"w": 1920, "h": 1080, "name": "4K / Desktop 1080p"},
        {"w": 1366, "h": 768, "name": "Laptop 1366x768"},
        {"w": 1024, "h": 768, "name": "Tablet Landscape"},
        {"w": 768, "h": 1024, "name": "Tablet Portrait"},
        {"w": 390, "h": 844, "name": "iPhone 14/15"},
        {"w": 360, "h": 740, "name": "Compact Mobile 360px"}
    ]

    for vp in viewports:
        browser.send_command("Emulation.setDeviceMetricsOverride", {
            "width": vp["w"],
            "height": vp["h"],
            "deviceScaleFactor": 1,
            "mobile": vp["w"] <= 768
        })
        time.sleep(0.3)

        overflow_check = browser.evaluate("""
            (() => {
                const scrollW = document.documentElement.scrollWidth;
                const clientW = document.documentElement.clientWidth;
                return {
                    scrollW,
                    clientW,
                    hasOverflow: scrollW > clientW + 2
                };
            })()
        """)

        print(f"   -> Viewport {vp['name']} ({vp['w']}x{vp['h']}): scrollWidth={overflow_check['scrollW']}, clientWidth={overflow_check['clientW']}")
        assert not overflow_check["hasOverflow"], f"Horizontal overflow detected on {vp['name']}: {overflow_check}"

        # If on mobile viewport, test mobile tabs
        if vp["w"] <= 768:
            browser.evaluate('document.querySelector(".mobile-tab-btn[data-tab=\\"left\\"]").click()')
            time.sleep(0.1)
            left_visible = browser.evaluate("document.querySelector('#col-left').classList.contains('active-mobile-tab')")
            assert left_visible, "Mobile tab Left should be active"

            browser.evaluate('document.querySelector(".mobile-tab-btn[data-tab=\\"right\\"]").click()')
            time.sleep(0.1)
            right_visible = browser.evaluate("document.querySelector('#col-right').classList.contains('active-mobile-tab')")
            assert right_visible, "Mobile tab Right should be active"

            browser.evaluate('document.querySelector(".mobile-tab-btn[data-tab=\\"center\\"]").click()')
            time.sleep(0.1)

    print("   -> Zero horizontal overflow on all viewports from 360px to 1920px. PASSED.")

    # Check for any remaining errors
    assert len(browser.console_errors) == 0, f"Console errors encountered: {browser.console_errors}"
    assert len(browser.page_errors) == 0, f"Page errors encountered: {browser.page_errors}"

    browser.close()

    print("\n" + "=" * 70)
    print("  ALL 13 VERIFICATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
