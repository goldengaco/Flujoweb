#!/usr/bin/env python3
import os
import re

base_dir = r"c:\DevWork\Depredador\Flujoweb\sistemas"

files = {
    "R1": os.path.join(base_dir, "apigee-mulesoft-hybrid", "index.html"),
    "R2": os.path.join(base_dir, "emergency-evacuation-v1", "index.html"),
    "R3": os.path.join(base_dir, "emergency-evacuation-v2", "index.html"),
    "R4": os.path.join(base_dir, "emergency-evacuation-v3", "index.html"),
}

for name, path in files.items():
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    print(f"=== {name} ({os.path.basename(path)}) Line matches for keywords ===")
    for i, line in enumerate(lines, 1):
        if re.search(r'\b(todo|fixme|not_implemented|mock|placeholder)\b', line, re.IGNORECASE):
            print(f"  Line {i}: {line.strip()[:120]}")
