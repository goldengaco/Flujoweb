import json
import os
import sys
import time

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from tests.framework.browser import BrowserSession

browser = BrowserSession()
browser.launch()

try:
    print("=== DEBUGGING R1 TIMING ===")
    r1_path = os.path.join(PROJECT_ROOT, "sistemas", "apigee-mulesoft-hybrid", "index.html")
    browser.navigate(r1_path)
    time.sleep(0.5)

    # Disable cache to guarantee path reaches Mule & SAP
    browser.evaluate("state.cacheEnabled = false; state.consecutiveLagCount = 0; state.circuitState = 'CLOSED';")
    
    # Trigger SAP Lag #1
    browser.evaluate("state.activeScenario = 'SAP_LAG'; triggerNominalE2E();")
    print("Triggered SAP Lag #1. Waiting for particle arrival (4.0s)...")
    time.sleep(4.2)
    
    lag1_state = browser.evaluate("({ cb: state.circuitState, lagCount: state.consecutiveLagCount, lat: document.getElementById('e2eLatencyDisplay').textContent })")
    print(f"Lag #1 result: {lag1_state}")

    # Trigger SAP Lag #2 to trip circuit breaker (requires >= 2 consecutive)
    browser.evaluate("state.activeScenario = 'SAP_LAG'; triggerNominalE2E();")
    print("Triggered SAP Lag #2. Waiting for particle arrival (4.0s)...")
    time.sleep(4.2)

    lag2_state = browser.evaluate("({ cb: state.circuitState, lagCount: state.consecutiveLagCount, lat: document.getElementById('e2eLatencyDisplay').textContent })")
    print(f"Lag #2 result: {lag2_state}")

    print("\n=== DEBUGGING R2 EVACUATION DYNAMICS ===")
    r2_path = os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v1", "index.html")
    browser.navigate(r2_path)
    time.sleep(0.5)

    print("Initial headcount:", browser.evaluate("({ totalCensus: document.getElementById('metric-total-census').textContent, safe: document.getElementById('metric-safe-count').textContent, transit: document.getElementById('metric-transit-count').textContent, trapped: document.getElementById('metric-trapped-count').textContent })"))

    # Turn on evacuation broadcast at 5x speed
    browser.evaluate("""
        window.app.simSpeed = 5.0;
        window.app.toggleMasterBroadcast();
    """)
    print("Activated broadcast at 5.0x speed. Stepping 8 seconds...")

    for sec in range(1, 9):
        time.sleep(1.0)
        hc = browser.evaluate("({ sec: window.app.elapsedSeconds, safe: window.app.floors.reduce((a,f)=>a+f.safe,0), transit: window.app.floors.reduce((a,f)=>a+f.transit,0), trapped: window.app.floors.reduce((a,f)=>a+f.occupants,0) })")
        print(f"t={sec}s (sim t={hc['sec']}s): Safe={hc['safe']}, Transit={hc['transit']}, Trapped={hc['trapped']}, Total={hc['safe']+hc['transit']+hc['trapped']}")

finally:
    browser.close()
