import re
from pathlib import Path

def dump_script_structure(name, path):
    content = Path(path).read_text(encoding="utf-8")
    scripts = re.findall(r"<script[\s\S]*?>([\s\S]*?)</script>", content, re.IGNORECASE)
    print(f"=== {name} ===")
    script = scripts[0]
    lines = script.split("\n")
    print(f"Total script lines: {len(lines)}")
    # Find functions, objects, event handlers, window properties
    for i, line in enumerate(lines):
        line_str = line.strip()
        if (line_str.startswith("function ") or 
            line_str.startswith("const ") or 
            line_str.startswith("let ") or 
            line_str.startswith("var ") or
            line_str.startswith("class ") or
            line_str.startswith("window.") or
            "addEventListener" in line_str or
            "document.getElementById" in line_str or
            "document.querySelector" in line_str):
            if any(k in line_str for k in ["class ", "window.", "state", "State", "engine", "Engine", "App", "broadcast", "Hazard", "Brigade", "census", "headcount", "burst", "carrier", "Circuit", "policy", "spike", "token", "sap", "worker"]):
                print(f"L{i+1}: {line_str[:120]}")

dump_script_structure("R1: Hybrid", r"c:\DevWork\Depredador\Flujoweb\sistemas\apigee-mulesoft-hybrid\index.html")
dump_script_structure("R2: Evac V1", r"c:\DevWork\Depredador\Flujoweb\sistemas\emergency-evacuation-v1\index.html")
dump_script_structure("R3: Evac V3", r"c:\DevWork\Depredador\Flujoweb\sistemas\emergency-evacuation-v3\index.html")
