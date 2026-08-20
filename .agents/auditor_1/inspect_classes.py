#!/usr/bin/env python3
import os
import re

base_dir = r"c:\DevWork\Depredador\Flujoweb\sistemas"

def inspect_classes():
    files = {
        "R1": ("apigee-mulesoft-hybrid/index.html", ["WebAudioSynthesizer", "ParticleTopologyVisualizer"]),
        "R2": ("emergency-evacuation-v1/index.html", ["CommandAudioEngine", "EvacuationMasterApp"]),
        "R3": ("emergency-evacuation-v2/index.html", ["TacticalAudioEngine", "TacticalVoiceAlert", "DynamicAStarNavigator", "FloorplanEngine", "MeshNetworkSimulator", "HUDAppController"]),
        "R4": ("emergency-evacuation-v3/index.html", ["ProceduralAudioEngine", "FanOutBroadcastEngine", "ParticleCanvasVisualizer", "LatencyHistogramEngine", "ApplicationController"]),
    }
    
    for deliverable, (rel_path, class_names) in files.items():
        path = os.path.join(base_dir, rel_path)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        print(f"\n=================================================================")
        print(f"DELIVERABLE: {deliverable} ({rel_path})")
        print(f"=================================================================")
        
        for cn in class_names:
            # Find class block
            pattern = re.compile(rf'class\s+{cn}\s*\{{', re.MULTILINE)
            m = pattern.search(content)
            if m:
                # Find matching closing brace
                start_idx = m.start()
                brace_count = 0
                end_idx = start_idx
                in_class = False
                for i in range(m.end() - 1, len(content)):
                    if content[i] == '{':
                        brace_count += 1
                        in_class = True
                    elif content[i] == '}':
                        brace_count -= 1
                        if in_class and brace_count == 0:
                            end_idx = i + 1
                            break
                class_code = content[start_idx:end_idx]
                methods = re.findall(r'^\s*([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{', class_code, re.MULTILINE)
                print(f"\nClass '{cn}' ({len(class_code.splitlines())} lines):")
                print(f"  Methods: {methods}")
            else:
                print(f"\nClass '{cn}' not found via standard regex.")

if __name__ == "__main__":
    inspect_classes()
