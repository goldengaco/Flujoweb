#!/usr/bin/env python3
import re

path = r"c:\DevWork\Depredador\Flujoweb\sistemas\mulesoft_80_ideas_observabilidad.md"

with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Match idea blocks
idea_blocks = re.split(r'\n(?=###\s*\d{2}\.)', text)
header_block = idea_blocks[0]
ideas = idea_blocks[1:]

print(f"Header length: {len(header_block)} chars")
print(f"Total idea blocks found: {len(ideas)}")

failures = []
for idx, idea in enumerate(ideas, 1):
    m = re.match(r'###\s*(\d{2})\.\s*(.+)', idea.strip())
    if not m:
        failures.append((idx, "Header regex mismatch"))
        continue
    num = int(m.group(1))
    title = m.group(2).strip()
    
    # Verify mandatory sections
    checks = {
        "Domain & Sub-domain": bool(re.search(r'\*\*Domain & Sub-domain\*\*', idea)),
        "Business Problem": bool(re.search(r'\*\*Business Problem', idea)),
        "Architectural Data Flow": bool(re.search(r'\*\*End-to-End Architectural Data Flow\*\*', idea)),
        "Apigee Ingress": bool(re.search(r'Apigee Ingress', idea)),
        "MuleSoft RTF Core": bool(re.search(r'MuleSoft RTF Core', idea)),
        "Multi-Cloud Downstream": bool(re.search(r'Multi-Cloud Downstream', idea)),
        "Observability Metrics / SLOs": bool(re.search(r'\*\*Core Observability Metrics', idea)),
        "Monetization Model / ROI": bool(re.search(r'\*\*Commercial Monetization Model', idea)),
        "Implementation Blueprint": bool(re.search(r'\*\*Implementation Blueprint', idea)),
    }
    
    missing = [k for k, v in checks.items() if not v]
    word_count = len(idea.split())
    
    if num != idx:
        failures.append((idx, f"Expected idea {idx} but found number {num}"))
    if missing:
        failures.append((idx, f"Idea {num} missing sections: {missing}"))
    if word_count < 100:
        failures.append((idx, f"Idea {num} word count too low: {word_count} words"))

if not failures:
    print("ALL 80 IDEAS FULLY COMPLIANT WITH ALL MANDATORY SECTIONS AND ZERO DEFECTS!")
else:
    print(f"Found {len(failures)} failures:")
    for f in failures:
        print(f"  - {f}")
