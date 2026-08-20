import re

with open(r"sistemas/mulesoft_80_ideas_observabilidad.md", "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    m = re.match(r"^(#{1,4})\s+(.+)", line)
    if m:
        level, title = m.groups()
        if any(w in title.lower() for w in ["idea", "categor", "índice", "resumen", "bloque"]):
            print(f"Line {idx+1}: {level} {title}")
