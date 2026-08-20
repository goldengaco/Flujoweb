import re
from pathlib import Path

files = [
    Path(r"c:\DevWork\Depredador\Flujoweb\sistemas\apigee-mulesoft-hybrid\index.html"),
    Path(r"c:\DevWork\Depredador\Flujoweb\sistemas\emergency-evacuation-v1\index.html"),
    Path(r"c:\DevWork\Depredador\Flujoweb\sistemas\emergency-evacuation-v3\index.html"),
]

for f in files:
    content = f.read_text(encoding="utf-8")
    scripts = re.findall(r"<script[\s\S]*?>([\s\S]*?)</script>", content, re.IGNORECASE)
    print(f"=== {f.name} ===")
    print(f"HTML size: {len(content)} bytes, Script blocks: {len(scripts)}")
    # Print function declarations and global state variables
    for i, s in enumerate(scripts):
        functions = re.findall(r"function\s+([a-zA-Z0-9_$]+)\s*\(", s)
        const_vars = re.findall(r"(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=", s)
        classes = re.findall(r"class\s+([a-zA-Z0-9_$]+)", s)
        print(f"  Script {i}: {len(functions)} funcs, {len(const_vars)} vars, {len(classes)} classes")
        print(f"    Key funcs: {functions[:15]}")
        print(f"    Key vars: {const_vars[:15]}")
        print(f"    Key classes: {classes}")
