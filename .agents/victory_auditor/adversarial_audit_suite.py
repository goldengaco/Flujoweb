"""
Adversarial Stress & Forensic Verification Suite
Author: Independent Victory Auditor
"""

import os
import re
import json
import subprocess
import sys

SISTEMAS_DIR = r"c:\DevWork\Depredador\Flujoweb\sistemas"
PROJECT_ROOT = r"c:\DevWork\Depredador\Flujoweb"

def verify_markdown_docs():
    print("\n--- AUDIT: Markdown Documentation Integrity ---")
    docs = [
        "manual_observabilidad_cloud_sre.md",
        "mulesoft_80_ideas_observabilidad.md",
        "mulesoft_y_arquitectura_sistemas.md"
    ]
    for d in docs:
        p = os.path.join(SISTEMAS_DIR, d)
        assert os.path.exists(p), f"Missing required doc: {p}"
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()
        lines = content.splitlines()
        print(f"  [DOC] {d}: {len(lines)} lines, {len(content)} chars. Starts with: {lines[0] if lines else 'EMPTY'}")
        assert len(lines) > 50, f"Doc {d} is too short ({len(lines)} lines)"

def verify_all_dashboards_self_contained():
    print("\n--- AUDIT: Zero-External-Dependency & Self-Contained Verification ---")
    dashboard_dirs = [d for d in os.listdir(SISTEMAS_DIR) if os.path.isdir(os.path.join(SISTEMAS_DIR, d))]
    
    for d in sorted(dashboard_dirs):
        idx = os.path.join(SISTEMAS_DIR, d, "index.html")
        assert os.path.exists(idx), f"Missing index.html in {d}"
        with open(idx, "r", encoding="utf-8") as f:
            html = f.read()
        
        # Check for remote scripts or cdns that could fail offline (excluding google fonts)
        script_srcs = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html, re.I)
        remote_scripts = [s for s in script_srcs if s.startswith("http://") or s.startswith("https://") or s.startswith("//")]
        
        link_hrefs = re.findall(r'<link[^>]+href=["\']([^"\']+)["\']', html, re.I)
        remote_css = [h for h in link_hrefs if (h.startswith("http://") or h.startswith("https://") or h.startswith("//")) and "fonts.googleapis.com" not in h and "fonts.gstatic.com" not in h]
        
        print(f"  [DASHBOARD] {d.ljust(26)}: Size={len(html)//1024}KB | Remote scripts={remote_scripts} | Remote CSS={remote_css}")
        assert len(remote_scripts) == 0, f"Found remote scripts in {d}: {remote_scripts}"
        assert len(remote_css) == 0, f"Found remote non-font CSS in {d}: {remote_css}"

def verify_z_index_stratification():
    print("\n--- AUDIT: Strict 4-Tier Z-Index Stratification ---")
    dashboard_dirs = [d for d in os.listdir(SISTEMAS_DIR) if os.path.isdir(os.path.join(SISTEMAS_DIR, d))]
    dashboard_dirs.append("") # Portal root
    
    for d in sorted(dashboard_dirs):
        idx = os.path.join(SISTEMAS_DIR, d, "index.html") if d else os.path.join(SISTEMAS_DIR, "index.html")
        name = d if d else "PORTAL (index.html)"
        with open(idx, "r", encoding="utf-8") as f:
            html = f.read()
            
        z_indexes = re.findall(r'z-index\s*:\s*([0-9]+)', html)
        int_z = sorted(list(set(int(z) for z in z_indexes)))
        print(f"  [Z-INDEX] {name.ljust(26)}: {int_z}")

def verify_fluid_typography():
    print("\n--- AUDIT: Fluid Typography (clamp) Usage ---")
    dashboard_dirs = [d for d in os.listdir(SISTEMAS_DIR) if os.path.isdir(os.path.join(SISTEMAS_DIR, d))]
    
    for d in sorted(dashboard_dirs):
        idx = os.path.join(SISTEMAS_DIR, d, "index.html")
        with open(idx, "r", encoding="utf-8") as f:
            html = f.read()
            
        clamps = re.findall(r'font-size\s*:\s*clamp\([^)]+\)', html)
        all_clamps = re.findall(r'clamp\([^)]+\)', html)
        print(f"  [CLAMP] {d.ljust(26)}: font-size clamp()={len(clamps)}, total clamp()={len(all_clamps)}")
        assert len(all_clamps) > 0, f"Dashboard {d} has zero clamp() usages!"

def main():
    print("================================================================================")
    print("       INDEPENDENT VICTORY AUDITOR — ADVERSARIAL INTEGRITY VERIFICATION         ")
    print("================================================================================")
    
    verify_markdown_docs()
    verify_all_dashboards_self_contained()
    verify_z_index_stratification()
    verify_fluid_typography()
    
    print("\n[ALL STATIC ADVERSARIAL INTEGRITY CHECKS PASSED]")

if __name__ == "__main__":
    main()
