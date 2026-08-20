#!/usr/bin/env python3
import os
import re

base_dir = r"c:\DevWork\Depredador\Flujoweb\sistemas"

def inspect_r1():
    print("==================================================")
    print("DEEP CODE INSPECTION: R1 (Apigee-MuleSoft Hybrid)")
    print("==================================================")
    path = os.path.join(base_dir, "apigee-mulesoft-hybrid", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Find sound engine functions
    sound_funcs = re.findall(r'function\s+(?:play\w+|sound\w+|beep\w+|audio\w+)\s*\([^)]*\)\s*\{[^}]+\}', content, re.IGNORECASE)
    print(f"Sound functions found: {len(sound_funcs)}")
    for sf in sound_funcs[:3]:
        print(f"  Sample sound function:\n    {sf[:150]}...")
        
    # Find latency simulation and DataWeave logic
    has_dw_run = bool(re.search(r'function\s+runDataWeave|DataWeaveEngine', content))
    has_waterfall = bool(re.search(r'renderWaterfall|drawWaterfall|updateWaterfall', content))
    has_vcores = bool(re.search(r'updateVCore|vCorePool|renderJVM', content))
    print(f"DataWeave engine function: {has_dw_run}")
    print(f"Waterfall rendering function: {has_waterfall}")
    print(f"vCore / JVM metrics logic: {has_vcores}")

def inspect_r2():
    print("\n==================================================")
    print("DEEP CODE INSPECTION: R2 (Emergency Evacuation V1)")
    print("==================================================")
    path = os.path.join(base_dir, "emergency-evacuation-v1", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Check floor matrix generation & decay logic
    has_matrix_gen = bool(re.search(r'renderFloorMatrix|generateFloors|initFloors|updateFloors', content))
    has_broadcast_action = bool(re.search(r'triggerBroadcast|deployEvacuation|startEvacuation|broadcastAlert', content))
    has_brigade_logic = bool(re.search(r'dispatchBrigade|assignBrigade|brigadeTeams', content))
    print(f"Floor matrix generation logic: {has_matrix_gen}")
    print(f"Broadcast trigger logic: {has_broadcast_action}")
    print(f"Brigade dispatching logic: {has_brigade_logic}")
    
    # Check decay math
    decay_math = re.findall(r'(\bMath\.\w+\([^)]+\))', content)
    print(f"Math functions used: {len(decay_math)} (Unique: {len(set(decay_math))})")

def inspect_r3():
    print("\n==================================================")
    print("DEEP CODE INSPECTION: R3 (Emergency Evacuation V2)")
    print("==================================================")
    path = os.path.join(base_dir, "emergency-evacuation-v2", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Check A* implementation
    astar_snippet = re.search(r'(class\s+AStar|function\s+findPath|function\s+astar)[^\{]*\{[\s\S]{100,500}\}', content, re.IGNORECASE)
    if astar_snippet:
        print(f"A* Pathfinding implementation detected:\n  {astar_snippet.group(0)[:250]}...")
    else:
        print("A* Pathfinding implementation search via generic regex...")
        astar_code = [l for l in content.splitlines() if any(k in l for k in ["heuristic", "gScore", "fScore", "openList", "closedList", "neighbor"])]
        print(f"  A* algorithm lines found: {len(astar_code)}")
        for l in astar_code[:5]:
            print(f"    {l.strip()[:100]}")

    # Check TTS & Siren
    has_tts = bool(re.search(r'SpeechSynthesisUtterance|speechSynthesis\.speak', content))
    has_siren = bool(re.search(r'playSiren|startSiren|sirenOscillator', content))
    print(f"Text-To-Speech integration: {has_tts}")
    print(f"Web Audio Siren Synthesizer: {has_siren}")

def inspect_r4():
    print("\n==================================================")
    print("DEEP CODE INSPECTION: R4 (Emergency Evacuation V3)")
    print("==================================================")
    path = os.path.join(base_dir, "emergency-evacuation-v3", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Check 5000 device generation & Fan-out simulation
    has_fanout = bool(re.search(r'triggerFanout|broadcastTo5000|simulateFanout|devices\s*=\s*\[', content))
    has_histogram = bool(re.search(r'renderHistogram|drawHistogram|calculateLatencyDistribution', content))
    has_failover = bool(re.search(r'injectCarrierChaos|failoverCarrier|circuitBreaker', content))
    print(f"Fan-out simulation engine: {has_fanout}")
    print(f"Latency histogram drawing logic: {has_histogram}")
    print(f"Carrier chaos & failover circuit breaker: {has_failover}")

if __name__ == "__main__":
    inspect_r1()
    inspect_r2()
    inspect_r3()
    inspect_r4()
