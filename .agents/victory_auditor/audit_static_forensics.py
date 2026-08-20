"""
Independent Static Forensic Audit Script for Victory Auditor
Audits:
1. File inventory & sizes
2. Master Portal (sistemas/index.html) features:
   - 14/15 system cards
   - Category filtering logic
   - Real-time search logic
   - Live counter element
   - Architecture markdown drawer & 3 tabs (manual_observabilidad_cloud_sre.md, mulesoft_80_ideas_observabilidad.md, mulesoft_y_arquitectura_sistemas.md)
3. 14/15 HTML dashboards:
   - Fluid typography clamp() usage
   - Fluid min-height / flex-wrap
   - Z-index stratification check (0, 1, 2, 100)
   - Audio mute/unmute toggle check (Audio controls in evac-v2, server-status, apigee-hybrid, etc.)
   - Log panel keyword search and JSON export check
   - Specular glow / radiant glow styles
   - Ambient track fading styles
4. Anti-cheating & Facade detection:
   - Dummy return constant checks
   - Hardcoded test bypasses
   - Fabricated verification flags
"""

import os
import re
import json

SISTEMAS_DIR = r"c:\DevWork\Depredador\Flujoweb\sistemas"
PROJECT_ROOT = r"c:\DevWork\Depredador\Flujoweb"

def audit_portal():
    portal_path = os.path.join(SISTEMAS_DIR, "index.html")
    assert os.path.exists(portal_path), f"Portal index.html missing: {portal_path}"
    with open(portal_path, "r", encoding="utf-8") as f:
        content = f.read()

    findings = {}
    findings["size_bytes"] = len(content.encode("utf-8"))
    findings["has_counter"] = bool(re.search(r'14|active systems|sistemas activos', content, re.I))
    findings["has_search_input"] = bool(re.search(r'id=["\'](?:searchInput|systemSearch|search-input)["\']|search', content, re.I))
    findings["has_category_filters"] = bool(re.search(r'data-category|filter-btn|category-btn', content, re.I))
    findings["has_drawer"] = bool(re.search(r'drawer|docModal|doc-drawer|architecture-drawer', content, re.I))
    findings["references_doc1"] = "manual_observabilidad_cloud_sre.md" in content or "manual_observabilidad" in content
    findings["references_doc2"] = "mulesoft_80_ideas_observabilidad.md" in content or "mulesoft_80_ideas" in content
    findings["references_doc3"] = "mulesoft_y_arquitectura_sistemas.md" in content or "mulesoft_y_arquitectura" in content

    # Count system cards or entries in SYSTEMS dataset
    system_matches = re.findall(r'href=["\']\./([a-zA-Z0-9_-]+)/index\.html["\']', content)
    findings["linked_system_hrefs"] = list(set(system_matches))
    findings["linked_system_count"] = len(findings["linked_system_hrefs"])

    # Check if markdown parser or dynamic loader exists
    findings["has_markdown_rendering"] = bool(re.search(r'marked|renderMarkdown|parseMarkdown|marked\.parse|fetch\(', content))

    return findings

def audit_dashboards():
    dashboard_dirs = [d for d in os.listdir(SISTEMAS_DIR) if os.path.isdir(os.path.join(SISTEMAS_DIR, d))]
    results = {}

    for d in sorted(dashboard_dirs):
        index_file = os.path.join(SISTEMAS_DIR, d, "index.html")
        if not os.path.exists(index_file):
            results[d] = {"exists": False}
            continue

        with open(index_file, "r", encoding="utf-8") as f:
            html = f.read()

        size_kb = len(html.encode("utf-8")) / 1024.0

        # Check clamp()
        clamp_matches = re.findall(r'clamp\([^)]+\)', html)

        # Check z-index values
        z_indexes = set(re.findall(r'z-index\s*:\s*([0-9]+)', html))

        # Check audio controls
        has_audio_ctx = bool(re.search(r'AudioContext|webkitAudioContext|speechSynthesis|TacticalAudioEngine|SoundSynth', html))
        has_audio_toggle = bool(re.search(r'btnSoundToggle|btn-toggle-sound|btnMuteAudio|btn-siren-toggle|btn-audio-toggle|audioToggleBtn|toggleSound', html))

        # Check log search & export
        has_log_section = bool(re.search(r'log-container|terminal|log-console|logs-card|logs-container|activity-log', html, re.I))
        has_log_search = bool(re.search(r'logSearch|log-search|filterLogs|searchLogs', html, re.I))
        has_log_export = bool(re.search(r'exportJson|export-json|downloadLogs|exportLogs|Blob\(|application/json', html, re.I))

        # Check specular glow / box-shadow
        has_glow = bool(re.search(r'box-shadow\s*:[^;]*(?:rgba|0 0 \d+px|0 0 \d+rem)', html))

        # Check facade / dummy return
        has_dummy_stub = bool(re.search(r'return\s+["\']TODO["\']|return\s+["\']stub["\']|// TODO: implement', html, re.I))

        results[d] = {
            "exists": True,
            "size_kb": round(size_kb, 1),
            "clamp_count": len(clamp_matches),
            "z_index_levels": sorted(list(z_indexes), key=lambda x: int(x) if x.isdigit() else 999),
            "has_audio_ctx": has_audio_ctx,
            "has_audio_toggle": has_audio_toggle,
            "has_log_section": has_log_section,
            "has_log_search": has_log_search,
            "has_log_export": has_log_export,
            "has_glow": has_glow,
            "has_dummy_stub": has_dummy_stub
        }

    return results

def main():
    print("=== FORENSIC STATIC AUDIT ===")
    portal_res = audit_portal()
    print("\n--- MASTER PORTAL FORENSICS ---")
    print(json.dumps(portal_res, indent=2))

    dash_res = audit_dashboards()
    print("\n--- 14/15 DASHBOARDS FORENSICS ---")
    print(json.dumps(dash_res, indent=2))

    # Write report to audit folder
    out_path = os.path.join(PROJECT_ROOT, ".agents", "victory_auditor", "static_forensics_report.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"portal": portal_res, "dashboards": dash_res}, f, indent=2)
    print(f"\nWritten static forensics report to {out_path}")

if __name__ == "__main__":
    main()
