#!/usr/bin/env python3
import os
import re
import math

base_dir = r"c:\DevWork\Depredador\Flujoweb\sistemas"

def audit_r1():
    path = os.path.join(base_dir, "apigee-mulesoft-hybrid", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print("=== AUDIT R1: Apigee-MuleSoft Hybrid ===")
    # Check Web Audio API
    audio_nodes = re.findall(r'(AudioContext|createOscillator|createGain|createBiquadFilter|gain\.setValueAtTime|frequency\.setValueAtTime)', content)
    print(f"Audio API references count: {len(audio_nodes)}")
    
    # Check Canvas and charts
    canvas_matches = re.findall(r'(\.getContext\s*\(\s*["\']2d["\']\s*\)|requestAnimationFrame)', content)
    print(f"Canvas & rAF calls: {len(canvas_matches)}")
    
    # Check DataWeave logic
    has_dw = "DataWeave" in content or "%dw 2.0" in content
    print(f"DataWeave 2.0 present: {has_dw}")
    
    # Check Latency Waterfall / Multi-cloud routing
    has_waterfall = "waterfall" in content.lower() or "latency" in content.lower()
    has_aws_gcp_sap = all(k in content for k in ["AWS", "GCP", "SAP"])
    print(f"Latency telemetry: {has_waterfall}, AWS/GCP/SAP routing: {has_aws_gcp_sap}")
    
    # Check Policy toggles
    policies = ["spike_arrest", "cache", "jwt", "waf"]
    found_policies = [p for p in policies if p in content.lower()]
    print(f"Policy toggles implemented: {found_policies}")
    
    # Check vCore gauges
    vcores = ["vcore", "heap", "gc", "object_store"]
    found_vcores = [v for v in vcores if v in content.lower()]
    print(f"vCore metrics implemented: {found_vcores}")

def audit_r2():
    path = os.path.join(base_dir, "emergency-evacuation-v1", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print("\n=== AUDIT R2: Emergency Evacuation V1 (Command Center) ===")
    # Check 12 floors
    floors = re.findall(r'Piso\s*(\d{1,2})', content, re.IGNORECASE)
    floor_nums = sorted(list(set(int(x) for x in floors if int(x) <= 12)))
    print(f"Floors mapped (1-12): {floor_nums}")
    
    # Check Evacuation decay math
    has_decay = "decay" in content.lower() or "evacuat" in content.lower()
    print(f"Evacuation simulation logic: {has_decay}")
    
    # Check Master Broadcast
    has_broadcast = "DESPLEGAR ALERTA DE EVACUACIÓN" in content or "broadcast" in content.lower()
    print(f"Master Broadcast button: {has_broadcast}")
    
    # Check Brigade Dispatcher
    has_brigade = "brigade" in content.lower() or "brigada" in content.lower() or "bombero" in content.lower()
    print(f"Brigade dispatching: {has_brigade}")
    
    # Check Audio synthesis
    audio_calls = re.findall(r'(createOscillator|createGain|AudioContext)', content)
    print(f"Web Audio API calls: {len(audio_calls)}")

def audit_r3():
    path = os.path.join(base_dir, "emergency-evacuation-v2", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print("\n=== AUDIT R3: Emergency Evacuation V2 (Mobile Occupant HUD) ===")
    # Check A* pathfinding
    has_astar = "astar" in content.lower() or "heuristic" in content.lower() or "findpath" in content.lower() or "openlist" in content.lower()
    astar_matches = re.findall(r'(heuristic|manhattan|euclidean|openList|closedList|neighbor|astar|pathfinding)', content, re.IGNORECASE)
    print(f"A* Pathfinding indicators ({len(astar_matches)} matches): {set(astar_matches)}")
    
    # Check Dynamic Escape Blueprint
    has_canvas_svg = bool(re.search(r'<canvas|<svg', content))
    print(f"Dynamic blueprint canvas/svg: {has_canvas_svg}")
    
    # Check Audio siren & TTS SpeechSynthesis
    has_speech = "speechSynthesis" in content or "SpeechSynthesisUtterance" in content
    audio_calls = re.findall(r'(createOscillator|createGain|AudioContext)', content)
    print(f"Web Audio API siren calls: {len(audio_calls)}, Web Speech API TTS: {has_speech}")
    
    # Check Estoy a salvo / SOS
    has_sos = "ESTOY A SALVO" in content or "REPORTAR EMERGENCIA" in content or "sos" in content.lower()
    print(f"SOS / Estoy a salvo action bar: {has_sos}")
    
    # Check Mesh Network simulator
    has_mesh = "mesh" in content.lower() or "bluetooth" in content.lower() or "p2p" in content.lower()
    print(f"Offline mesh simulation: {has_mesh}")

def audit_r4():
    path = os.path.join(base_dir, "emergency-evacuation-v3", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print("\n=== AUDIT R4: Emergency Evacuation V3 (Fan-Out Telemetry) ===")
    # Check 5000+ devices
    has_5000 = "5000" in content or "5,000" in content or "5000+" in content
    print(f"5,000+ devices reference/scale: {has_5000}")
    
    # Check 4 Carrier channels
    carriers = ["fcm", "push", "sms", "pa", "lora", "radio", "mesh"]
    found_carriers = [c for c in carriers if c in content.lower()]
    print(f"Carrier channels detected: {found_carriers}")
    
    # Check Latency distribution histogram & percentiles (p50, p95, p99)
    percentiles = ["p50", "p95", "p99", "histogram", "sla", "latency"]
    found_pct = [p for p in percentiles if p in content.lower()]
    print(f"Histogram & percentile metrics: {found_pct}")
    
    # Check Carrier failure injection & auto-retry / circuit breaker
    has_failover = "failover" in content.lower() or "retry" in content.lower() or "circuit" in content.lower() or "chaos" in content.lower()
    print(f"Failover & auto-retry logic: {has_failover}")

def audit_r5():
    path = os.path.join(base_dir, "mulesoft_80_ideas_observabilidad.md")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print("\n=== AUDIT R5: Master Innovation Catalog (80 Ideas) ===")
    # Parse ideas and check completeness
    ideas = re.split(r'\n(?=#{1,3}\s*(?:Idea\s*)?\d{1,3}[\.\:\s\-])', content)
    print(f"Total top-level markdown segments split by idea: {len(ideas)}")
    
    # Inspect all 80 ideas
    idea_dict = {}
    pattern = re.compile(r'#{1,3}\s*(?:Idea\s*)?(\d{1,3})[\.\:\s\-]+([^\n]+)', re.IGNORECASE)
    for seg in ideas:
        m = pattern.search(seg)
        if m:
            num = int(m.group(1))
            title = m.group(2).strip()
            word_count = len(seg.split())
            has_arch = bool(re.search(r'arquitectura|flujo|integraci[oó]n|componente', seg, re.IGNORECASE))
            has_slo = bool(re.search(r'slo|sli|latencia|throughput|m[eé]trica|kpi|sla', seg, re.IGNORECASE))
            has_roi = bool(re.search(r'monetiz|roi|costo|ahorro|beneficio|valor|f[oó]rmula', seg, re.IGNORECASE))
            has_dw = bool(re.search(r'dataweave|dw\s*2\.0|%\s*dw', seg, re.IGNORECASE))
            idea_dict[num] = {
                "title": title,
                "words": word_count,
                "has_arch": has_arch,
                "has_slo": has_slo,
                "has_roi": has_roi,
                "has_dw": has_dw
            }
            
    print(f"Successfully parsed {len(idea_dict)} ideas.")
    missing_nums = [i for i in range(1, 81) if i not in idea_dict]
    print(f"Missing idea numbers between 1 and 80: {missing_nums}")
    
    min_words = min(data["words"] for data in idea_dict.values()) if idea_dict else 0
    max_words = max(data["words"] for data in idea_dict.values()) if idea_dict else 0
    avg_words = sum(data["words"] for data in idea_dict.values()) / len(idea_dict) if idea_dict else 0
    print(f"Word counts per idea: min={min_words}, max={max_words}, avg={avg_words:.1f}")
    
    no_arch = [k for k, v in idea_dict.items() if not v["has_arch"]]
    no_slo = [k for k, v in idea_dict.items() if not v["has_slo"]]
    no_roi = [k for k, v in idea_dict.items() if not v["has_roi"]]
    print(f"Ideas lacking architecture section: {no_arch}")
    print(f"Ideas lacking SLO/metrics section: {no_slo}")
    print(f"Ideas lacking Monetization/ROI section: {no_roi}")

if __name__ == "__main__":
    audit_r1()
    audit_r2()
    audit_r3()
    audit_r4()
    audit_r5()
