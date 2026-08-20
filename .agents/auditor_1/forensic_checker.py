#!/usr/bin/env python3
import os
import re
import sys
import json

def check_html_file(filepath, name):
    print(f"\n=======================================================")
    print(f"AUDITING DELIVERABLE: {name} ({filepath})")
    print(f"=======================================================")
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    print(f"File size: {len(content)} bytes, {len(content.splitlines())} lines.")
    
    # 1. Check external dependencies
    script_srcs = re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']', content, re.IGNORECASE)
    link_hrefs = re.findall(r'<link\b[^>]*\bhref=["\']([^"\']+)["\']', content, re.IGNORECASE)
    
    print(f"\n[1] External Dependency Analysis:")
    print(f"  Script tags with src: {script_srcs}")
    external_scripts = [s for s in script_srcs if not s.startswith("data:")]
    if external_scripts:
        print(f"  [FAIL] Detected external scripts: {external_scripts}")
    else:
        print(f"  [PASS] Zero external script dependencies.")
        
    print(f"  Link stylesheets:")
    external_links = []
    for href in link_hrefs:
        print(f"    - {href}")
        if "fonts.googleapis.com" not in href and "fonts.gstatic.com" not in href and not href.startswith("data:"):
            external_links.append(href)
    if external_links:
        print(f"  [FAIL] Detected non-Google-Fonts external stylesheets: {external_links}")
    else:
        print(f"  [PASS] Only Google Fonts / local styles present.")

    # 2. Check for external audio files (mp3, wav, ogg)
    audio_files = re.findall(r'["\']([^"\']+\.(?:mp3|wav|ogg|aac|m4a|flac))["\']', content, re.IGNORECASE)
    print(f"\n[2] Audio Asset Analysis:")
    if audio_files:
        print(f"  [FAIL] External audio files referenced: {audio_files}")
    else:
        print(f"  [PASS] Zero external audio files referenced.")

    # 3. Check Web Audio API synthesis
    has_audio_ctx = bool(re.search(r'AudioContext|webkitAudioContext', content))
    has_oscillator = bool(re.search(r'createOscillator|OscillatorNode', content))
    has_gain = bool(re.search(r'createGain|GainNode', content))
    has_biquad = bool(re.search(r'createBiquadFilter|BiquadFilterNode', content))
    print(f"\n[3] Web Audio API Synthesis:")
    print(f"  AudioContext present: {has_audio_ctx}")
    print(f"  createOscillator present: {has_oscillator}")
    print(f"  createGain present: {has_gain}")
    print(f"  createBiquadFilter present: {has_biquad}")

    # 4. Check Canvas 2D & Animation Loop
    has_canvas = bool(re.search(r'<canvas\b', content, re.IGNORECASE))
    has_getContext = bool(re.search(r'getContext\s*\(\s*["\']2d["\']\s*\)', content))
    has_raf = bool(re.search(r'requestAnimationFrame', content))
    print(f"\n[4] Canvas 2D & Animation Loop:")
    print(f"  Canvas element: {has_canvas}")
    print(f"  getContext('2d'): {has_getContext}")
    print(f"  requestAnimationFrame: {has_raf}")

    # 5. Check anti-cheat: Mock facades / hardcoded bypasses
    print(f"\n[5] Anti-Cheat Facade & Hardcoding Inspection:")
    facade_patterns = [
        r'function\s+\w+\s*\([^)]*\)\s*\{\s*return\s+(?:true|false|1|0|"[^"]*");?\s*\}',
        r'TODO|FIXME|NOT_IMPLEMENTED|mock|placeholder',
    ]
    for pat in facade_patterns:
        matches = re.findall(pat, content, re.IGNORECASE)
        print(f"  Pattern '{pat}' matches count: {len(matches)}")
        if matches and "mock" in pat:
            # show snippet
            for m in matches[:5]:
                print(f"    sample: {m}")

    return {
        "external_scripts": external_scripts,
        "external_links": external_links,
        "audio_files": audio_files,
        "has_audio_ctx": has_audio_ctx,
        "has_oscillator": has_oscillator,
        "has_gain": has_gain,
        "has_biquad": has_biquad,
        "has_canvas": has_canvas,
        "has_getContext": has_getContext,
        "has_raf": has_raf,
    }

def check_catalog(filepath):
    print(f"\n=======================================================")
    print(f"AUDITING DELIVERABLE: R5 CATALOG ({filepath})")
    print(f"=======================================================")
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    print(f"File size: {len(content)} bytes, {len(content.splitlines())} lines.")
    
    # Check headers matching "Idea XX" or "## [0-9]+" or "### [0-9]+"
    idea_headers = re.findall(r'(?:^|\n)#{1,4}\s*(?:Idea\s*)?(\d{1,3})[\.\:\s\-]+([^\n]+)', content, re.IGNORECASE)
    print(f"Detected Idea headers count: {len(idea_headers)}")
    
    # Check unique numbers
    numbers = [int(h[0]) for h in idea_headers if int(h[0]) <= 80]
    unique_numbers = sorted(list(set(numbers)))
    print(f"Unique idea numbers (1-80): {len(unique_numbers)} (min={min(unique_numbers) if unique_numbers else 0}, max={max(unique_numbers) if unique_numbers else 0})")
    
    # Check domains
    domains = [
        "Fintech", "Healthcare", "Retail", "SRE", "Cyber-Defense", "IoT Public Safety", "Logistics", "Telco"
    ]
    print("\nDomain presence checks:")
    for dom in domains:
        count = len(re.findall(re.escape(dom), content, re.IGNORECASE))
        print(f"  Domain '{dom}': {count} occurrences")

    # Check key sections required: Arquitectura, Métricas Clave / SLOs, Fórmulas de Monetización / ROI
    print("\nStructural Sections Analysis across ideas:")
    arch_count = len(re.findall(r'Arquitectura|Architecture|Flujo', content, re.IGNORECASE))
    slo_count = len(re.findall(r'SLO|Métricas|KPI|SLA', content, re.IGNORECASE))
    roi_count = len(re.findall(r'Monetización|ROI|Costos|Ahorro|Valor', content, re.IGNORECASE))
    print(f"  Architecture sections/keywords: {arch_count}")
    print(f"  SLO/Metrics keywords: {slo_count}")
    print(f"  Monetization/ROI keywords: {roi_count}")

def main():
    base_dir = r"c:\DevWork\Depredador\Flujoweb\sistemas"
    
    check_html_file(os.path.join(base_dir, "apigee-mulesoft-hybrid", "index.html"), "R1: Apigee-MuleSoft Hybrid")
    check_html_file(os.path.join(base_dir, "emergency-evacuation-v1", "index.html"), "R2: Emergency Evacuation V1 (Command)")
    check_html_file(os.path.join(base_dir, "emergency-evacuation-v2", "index.html"), "R3: Emergency Evacuation V2 (Mobile HUD)")
    check_html_file(os.path.join(base_dir, "emergency-evacuation-v3", "index.html"), "R4: Emergency Evacuation V3 (Fan-Out)")
    check_catalog(os.path.join(base_dir, "mulesoft_80_ideas_observabilidad.md"))

if __name__ == "__main__":
    main()
