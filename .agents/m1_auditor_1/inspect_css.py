import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r"c:\DevWork\Depredador\Flujoweb\.agents\m1_auditor_1\detailed_css_analysis.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for fpath, details in data.items():
    print(f"==================================================")
    print(f"FILE: {fpath}")
    print(f"Clamps count: {len(details['clamp_rules'])}")
    for c in details['clamp_rules']:
        print(f"  - [{c['selector']}] {c['property']}: {c['value']}")
    print(f"Z-indices count: {len(details['z_rules'])}")
    for z in details['z_rules']:
        print(f"  - [{z['selector']}] z-index: {z['z_index']}")
