import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

base_dir = r"c:\DevWork\Depredador\Flujoweb"

print("=== CHECK 1: PRE-POPULATED RESULT ARTIFACTS ===")
for root, dirs, files in os.walk(base_dir):
    if ".git" in root or "node_modules" in root or ".agents" in root:
        continue
    for f in files:
        if f.endswith('.log') or 'result' in f.lower() or 'output' in f.lower():
            p = os.path.join(root, f)
            print(f"Found artifact: {p} (size: {os.path.getsize(p)} bytes)")
sys.stdout.flush()

print("\n=== CHECK 2: DEEP SCAN FOR PROHIBITED PATTERNS IN ALL 15 FILES ===")
files = [
    'sistemas/tv-diagnostic/index.html',
    'sistemas/network-health/index.html',
    'sistemas/security-audit/index.html',
    'sistemas/server-status/index.html',
    'sistemas/transaction-flow/index.html',
    'sistemas/gcp-serverless-pipeline/index.html',
    'sistemas/gcp-event-pubsub/index.html',
    'sistemas/gcp-sql-networking/index.html',
    'sistemas/gcp-iam-security/index.html',
    'sistemas/gcp-cloudops-cockpit/index.html',
    'sistemas/mulesoft-observability/index.html',
    'sistemas/apigee-mulesoft-hybrid/index.html',
    'sistemas/emergency-evacuation-v1/index.html',
    'sistemas/emergency-evacuation-v2/index.html',
    'sistemas/emergency-evacuation-v3/index.html'
]

prohibited_regexes = [
    (r'return\s+["\'](?:PASS|OK|SUCCESS)["\']', "Hardcoded pass string return"),
    (r'isTest\s*\?\s*true\s*:', "Ternary test bypass"),
    (r'window\.__isTest', "Test bypass flag"),
    (r'window\.__mock', "Mock test hook"),
    (r'window\.__skip', "Test skip hook"),
    (r'dummy_implementation', "Dummy implementation"),
    (r'function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{\s*return\s+(?:true|false|null|undefined|0|1|""|\[\]|\{\})\s*;\s*\}', "Stub function"),
    (r'//\s*TODO', "Unimplemented TODO"),
    (r'//\s*FIXME', "Unresolved FIXME"),
    (r'NotImplementedError', "NotImplementedError")
]

for fpath in files:
    full = os.path.join(base_dir, fpath)
    with open(full, 'r', encoding='utf-8') as f:
        content = f.read()
    
    findings = []
    for pattern, desc in prohibited_regexes:
        matches = list(re.finditer(pattern, content, re.IGNORECASE))
        if matches:
            for m in matches:
                line_no = content[:m.start()].count('\n') + 1
                findings.append(f"Line {line_no}: {desc} -> '{m.group(0)}'")
                
    if findings:
        print(f"\n[FLAGGED] {fpath}:")
        for finding in findings:
            print(f"  - {finding}")
    else:
        print(f"[CLEAN] {fpath}")
sys.stdout.flush()

print("\n=== CHECK 3: SPECIFIC Z-INDEX STRATIFICATION INSPECTION ===")
for fpath in files:
    full = os.path.join(base_dir, fpath)
    with open(full, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # match any z-index declarations
    z_matches = re.finditer(r'([^{}]*)\{[^{}]*?z-index\s*:\s*([^;}\n]+)[^{}]*?\}', content)
    anomalous = []
    for m in z_matches:
        sel = m.group(1).strip()
        z_val = m.group(2).strip()
        try:
            val_int = int(z_val)
            if val_int > 100 or (val_int < 0 and val_int != -1):
                anomalous.append((sel, z_val))
        except ValueError:
            anomalous.append((sel, z_val))
    if anomalous:
        print(f"\n[ANOMALY] Non-standard z-index in {fpath}:")
        for sel, z_val in anomalous:
            # clean up selector
            clean_sel = ' '.join(sel.split())
            print(f"  Selector: {clean_sel} -> z-index: {z_val}")
    else:
        print(f"[NORMAL] {fpath} z-indices standard")
sys.stdout.flush()
