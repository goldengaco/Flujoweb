"""
Verification and Quality Assurance test suite for:
sistemas/mulesoft_80_ideas_observabilidad.md
"""

import re
import sys

TARGET_PATH = r"c:\DevWork\Depredador\Flujoweb\sistemas\mulesoft_80_ideas_observabilidad.md"

def test_catalog_structure():
    with open(TARGET_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    errors = []
    
    # 1. Check Domain headers
    domain_matches = re.findall(r"^## Domain ([1-8]): (.*?)$", content, re.MULTILINE)
    if len(domain_matches) != 8:
        errors.append(f"Expected exactly 8 domain headers, found {len(domain_matches)}: {domain_matches}")
    else:
        print(f"[PASS] Found exactly 8 domain headers.")
        for d_num, d_name in domain_matches:
            print(f"       Domain {d_num}: {d_name}")

    # 2. Check Idea headers
    idea_matches = re.findall(r"^### ([0-9]{2})\. (.*?)$", content, re.MULTILINE)
    if len(idea_matches) != 80:
        errors.append(f"Expected exactly 80 idea headers, found {len(idea_matches)}")
    else:
        print(f"[PASS] Found exactly 80 numbered idea headers.")

    # 3. Check continuous numbering from 01 to 80
    expected_nums = [f"{i:02d}" for i in range(1, 81)]
    actual_nums = [num for num, title in idea_matches]
    if actual_nums != expected_nums:
        errors.append(f"Idea numbering sequence mismatch! Missing or duplicate numbers.")
    else:
        print(f"[PASS] Numbering is continuous and strictly sequential from 01 to 80.")

    # 4. Check Mandatory sections per idea
    required_sections = [
        "Domain & Sub-domain",
        "Business Problem & Opportunity",
        "End-to-End Architectural Data Flow",
        "Core Observability Metrics, KPIs & SLO Targets",
        "Commercial Monetization Model / ROI Impact",
        "Implementation Blueprint & Policy Stack"
    ]

    for req in required_sections:
        matches = re.findall(re.escape(f"- **{req}**:"), content)
        if len(matches) != 80:
            errors.append(f"Section '{req}' appeared {len(matches)} times, expected 80.")
        else:
            print(f"[PASS] Section '{req}' verified 80/80 times.")

    # 5. Check forbidden shortcut tokens
    forbidden_tokens = ["TODO", "FIXME", "[TBD]", "placeholder", "lorem ipsum"]
    for token in forbidden_tokens:
        found_matches = [m.start() for m in re.finditer(re.escape(token), content, re.IGNORECASE)]
        if found_matches:
            # Let's see if it's within instructions or actual content
            for idx in found_matches:
                snippet = content[max(0, idx-50):min(len(content), idx+50)]
                errors.append(f"Found token '{token}' at position {idx}: ...{snippet}...")

    # 6. Check size and line count
    line_count = len(content.splitlines())
    byte_count = len(content.encode("utf-8"))
    print(f"[INFO] Document stats: {line_count} lines, {byte_count} bytes.")
    if line_count < 1000:
        errors.append(f"Document line count too low ({line_count} < 1000).")
    if byte_count < 150000:
        errors.append(f"Document byte count too low ({byte_count} < 150KB).")

    if errors:
        print("\n--- AUDIT VERIFICATION FAILED ---")
        for err in errors:
            print(f"[FAIL] {err}")
        sys.exit(1)
    else:
        print("\n========================================================")
        print("[SUCCESS] ALL 80 IDEAS & ARCHITECTURAL SPECS FULLY VERIFIED!")
        print("========================================================")
        sys.exit(0)

if __name__ == "__main__":
    test_catalog_structure()
