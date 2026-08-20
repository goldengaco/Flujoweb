import re
import json
import sys
from pathlib import Path

# Force UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

base = Path(r"c:\DevWork\Depredador\Flujoweb\sistemas")
dirs = [d for d in base.iterdir() if d.is_dir()]

print(f"Total directories in sistemas: {len(dirs)}")
for d in sorted(dirs):
    html_file = d / "index.html"
    if not html_file.exists():
        print(f"[{d.name}] index.html NOT FOUND")
        continue
    content = html_file.read_text(encoding="utf-8")
    
    # Audio patterns
    audio_ids = re.findall(r'id=["\']([^"\']*(?:audio|sound|mute|siren|voice)[^"\']*)["\']', content, re.I)
    audio_classes = re.findall(r'class=["\']([^"\']*(?:audio|sound|mute|siren|voice)[^"\']*)["\']', content, re.I)
    
    # Log patterns
    log_inputs = re.findall(r'id=["\']([^"\']*(?:log|search|filter)[^"\']*)["\']', content, re.I)
    export_buttons = re.findall(r'id=["\']([^"\']*(?:export|json|download)[^"\']*)["\']', content, re.I)
    
    # Check clamp usage
    clamp_count = len(re.findall(r'clamp\(', content, re.I))
    
    print(f"\n=== {d.name} ===")
    print(f"  Size: {len(content)} bytes")
    print(f"  Audio IDs: {list(set(audio_ids))}")
    print(f"  Audio Classes: {list(set(audio_classes))}")
    print(f"  Log/Search IDs: {list(set(log_inputs))}")
    print(f"  Export/JSON IDs: {list(set(export_buttons))}")
    print(f"  CSS clamp() usages: {clamp_count}")
