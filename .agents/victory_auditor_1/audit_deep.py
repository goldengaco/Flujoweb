import os, sys, re

print("=== DEEP FORENSIC AUDIT OF DELIVERABLES ===")

# --- Check 1: R1 Apigee + MuleSoft ---
r1_path = r"sistemas/apigee-mulesoft-hybrid/index.html"
with open(r1_path, "r", encoding="utf-8", errors="ignore") as f:
    r1 = f.read()

print("\n[R1] Apigee MuleSoft Hybrid:")
print(" - Size:", len(r1), "chars")
print(" - Has AudioContext:", bool(re.search(r"AudioContext|webkitAudioContext", r1)))
print(" - Has Canvas / RAF:", bool(re.search(r"getContext\(['\"]2d['\"]\)|requestAnimationFrame", r1)))
print(" - Has Spike Arrest / Rate Limit (429):", bool(re.search(r"Spike\s*Arrest|429", r1, re.I)))
print(" - Has OAuth2 / JWT / Token:", bool(re.search(r"OAuth|JWT|Token", r1, re.I)))
print(" - Has WAF / Threat Inspection:", bool(re.search(r"WAF|Threat|SQLi|XSS", r1, re.I)))
print(" - Has DataWeave 2.0 Mapping:", bool(re.search(r"DataWeave|dw::", r1, re.I)))
print(" - Has Worker vCore / Heap / GC telemetry:", bool(re.search(r"vCore|Heap|Garbage|GC\s*pause|Object\s*Store", r1, re.I)))
print(" - Has Downstream fanout (AWS Lambda/DynamoDB, GCP Cloud SQL/PubSub, SAP):", bool(re.search(r"Lambda|DynamoDB|Cloud\s*SQL|Pub\/?Sub|SAP", r1, re.I)))

# --- Check 2: R2 Evacuation V1 ---
r2_path = r"sistemas/emergency-evacuation-v1/index.html"
with open(r2_path, "r", encoding="utf-8", errors="ignore") as f:
    r2 = f.read()

print("\n[R2] Evacuation V1 (Command Center):")
print(" - Size:", len(r2), "chars")
print(" - Has AudioContext / Alarm Synthesizer:", bool(re.search(r"AudioContext|webkitAudioContext", r2)))
print(" - Has Floors (Piso 1 - 12):", len(re.findall(r"Piso\s*\d+|Floor\s*\d+", r2, re.I)))
print(" - Has Evacuation Broadcast trigger:", bool(re.search(r"DESPLEGAR\s+ALERTA\s+DE\s+EVACUACI|broadcast|evacuat", r2, re.I)))
print(" - Has Headcount Safe vs Trapped/Pending:", bool(re.search(r"Safe|Salvo|Atrapad|Pending|Headcount", r2, re.I)))
print(" - Has Brigade Dispatcher Console:", bool(re.search(r"Brigad|Bomberos|Firefighter|Dispatch", r2, re.I)))
print(" - Has Canvas / Heatmap rendering:", bool(re.search(r"getContext\(['\"]2d['\"]\)|requestAnimationFrame|heat", r2, re.I)))

# --- Check 3: R3 Evacuation V2 ---
r3_path = r"sistemas/emergency-evacuation-v2/index.html"
with open(r3_path, "r", encoding="utf-8", errors="ignore") as f:
    r3 = f.read()

print("\n[R3] Evacuation V2 (Mobile Occupant HUD):")
print(" - Size:", len(r3), "chars")
print(" - Has AudioContext (Siren Synthesizer):", bool(re.search(r"AudioContext|webkitAudioContext", r3)))
print(" - Has Web Speech API (speechSynthesis / SpeechSynthesisUtterance):", bool(re.search(r"speechSynthesis|SpeechSynthesisUtterance", r3)))
print(" - Has A* Pathfinding (openSet, closedSet / gScore, fScore, heuristic, neighbors):", bool(re.search(r"aStar|astar|openSet|closedSet|gScore|fScore|heuristic", r3, re.I)))
print(" - Has Dynamic floorplan / escape routing / vector blueprint:", bool(re.search(r"canvas|svg|route|path|blueprint", r3, re.I)))
print(" - Has 'Estoy a Salvo / Reportar Emergencia':", bool(re.search(r"ESTOY\s*A\s*SALVO|Reportar\s*Emergencia|beacon|gps", r3, re.I)))
print(" - Has Mesh network simulation (Bluetooth / Wi-Fi Direct / Mesh):", bool(re.search(r"Mesh|Bluetooth|Wi-Fi\s*Direct|BLE", r3, re.I)))

# --- Check 4: R4 Evacuation V3 ---
r4_path = r"sistemas/emergency-evacuation-v3/index.html"
with open(r4_path, "r", encoding="utf-8", errors="ignore") as f:
    r4 = f.read()

print("\n[R4] Evacuation V3 (Multi-Carrier Broadcast Fan-Out):")
print(" - Size:", len(r4), "chars")
print(" - Has 5000+ simulated devices / fan-out:", bool(re.search(r"5000|5,000|fan-?out|devices", r4, re.I)))
print(" - Has 4 carrier channels (FCM/APNs, SMS, PA/LoRaWAN, Two-Way Radio):", bool(re.search(r"FCM|APNs", r4) and re.search(r"SMS", r4) and re.search(r"PA|LoRaWAN|Strobe", r4) and re.search(r"Radio", r4)))
print(" - Has Latency Distribution Histogram:", bool(re.search(r"Histogram|Latency|Distribution|Percentile|p99|p95", r4, re.I)))
print(" - Has Carrier Failure & Auto-Retry simulation:", bool(re.search(r"Failover|Retry|Failure|Fallback", r4, re.I)))
print(" - Has Web Audio API synthesizer:", bool(re.search(r"AudioContext|webkitAudioContext", r4)))
print(" - Has Canvas real-time rendering:", bool(re.search(r"getContext\(['\"]2d['\"]\)|requestAnimationFrame", r4)))

# --- Check 5: R5 80 Ideas Markdown Catalog ---
r5_path = r"sistemas/mulesoft_80_ideas_observabilidad.md"
with open(r5_path, "r", encoding="utf-8", errors="ignore") as f:
    r5 = f.read()

print("\n[R5] Master Innovation Catalog:")
print(" - Size:", len(r5), "chars /", len(r5.splitlines()), "lines")
# Count distinct idea entries
idea_headers = re.findall(r"^###?\s+(?:Idea\s+)?(\d+)[\.:\s\-]+", r5, re.M)
print(" - Number of structured idea headers found with numbers:", len(idea_headers))
print(" - Sample first 5 numbers:", idea_headers[:5])
print(" - Sample last 5 numbers:", idea_headers[-5:])
unique_nums = sorted(list(set([int(x) for x in idea_headers])))
print(f" - Range of idea numbers: {unique_nums[0]} to {unique_nums[-1]}, count unique: {len(unique_nums)}")
assert len(unique_nums) == 80 and unique_nums[0] == 1 and unique_nums[-1] == 80, "Expected exactly 80 numbered ideas from 1 to 80"

