import re
from pathlib import Path

def inspect_file(filepath):
    content = Path(filepath).read_text(encoding="utf-8")
    print("=" * 60)
    print(f"FILE: {filepath}")
    print("=" * 60)
    
    # Find DOM elements with IDs
    ids = re.findall(r'id=["\']([^"\']+)["\']', content)
    print(f"DOM IDs ({len(ids)}): {ids[:30]}")
    
    # Extract script section
    scripts = re.findall(r"<script[\s\S]*?>([\s\S]*?)</script>", content, re.IGNORECASE)
    for i, s in enumerate(scripts):
        print(f"\n--- Script {i} (length {len(s)}) ---")
        # Find methods in classes
        class_blocks = re.findall(r"class\s+([a-zA-Z0-9_$]+)[^{]*\{([\s\S]*?)\n\}", s)
        for cname, cbody in class_blocks:
            methods = re.findall(r"^\s*([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{", cbody, re.MULTILINE)
            print(f"Class {cname} methods: {methods}")
            
inspect_file(r"c:\DevWork\Depredador\Flujoweb\sistemas\apigee-mulesoft-hybrid\index.html")
inspect_file(r"c:\DevWork\Depredador\Flujoweb\sistemas\emergency-evacuation-v1\index.html")
inspect_file(r"c:\DevWork\Depredador\Flujoweb\sistemas\emergency-evacuation-v3\index.html")
