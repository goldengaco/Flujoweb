#!/usr/bin/env python3
import os
import re

base_dir = r"c:\DevWork\Depredador\Flujoweb\sistemas"

files = [
    ("R1", os.path.join(base_dir, "apigee-mulesoft-hybrid", "index.html")),
    ("R2", os.path.join(base_dir, "emergency-evacuation-v1", "index.html")),
    ("R3", os.path.join(base_dir, "emergency-evacuation-v2", "index.html")),
    ("R4", os.path.join(base_dir, "emergency-evacuation-v3", "index.html")),
]

for name, path in files:
    print(f"\n=======================================================")
    print(f"DELIVERABLE: {name} ({path})")
    print(f"=======================================================")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    scripts = re.findall(r'<script\b[^>]*>([\s\S]*?)<\/script>', content, re.IGNORECASE)
    print(f"Number of <script> blocks: {len(scripts)}")
    for i, s in enumerate(scripts):
        print(f"\n--- Script Block #{i+1} ({len(s.splitlines())} lines) ---")
        # Find classes, functions, object declarations, const/let
        funcs = re.findall(r'(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>|async\s*\([^)]*\)\s*=>)|class\s+([a-zA-Z0-9_$]+))', s)
        flat_funcs = [f[0] or f[1] or f[2] for f in funcs]
        print(f"Declared functions/classes ({len(flat_funcs)} total): {flat_funcs[:25]}...")
