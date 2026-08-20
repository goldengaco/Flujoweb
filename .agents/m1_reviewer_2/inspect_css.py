import re
import os

systems = [
    "gcp-iam-security",
    "gcp-cloudops-cockpit",
    "mulesoft-observability",
    "apigee-mulesoft-hybrid",
    "emergency-evacuation-v1",
    "emergency-evacuation-v2",
    "emergency-evacuation-v3"
]

base_dir = r"c:\DevWork\Depredador\Flujoweb\sistemas"

for sys_name in systems:
    path = os.path.join(base_dir, sys_name, "index.html")
    if not os.path.exists(path):
        print(f"ERROR: {path} not found!")
        continue
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print("=" * 60)
    print(f"SYSTEM: {sys_name} ({len(content)} bytes, {len(content.splitlines())} lines)")
    print("=" * 60)
    
    # 1. Check clamp usage
    clamps = re.findall(r'font-size:\s*clamp\([^)]+\)', content)
    print(f"  [Clamp Font-Sizes]: {len(clamps)} found")
    for c in clamps[:5]:
        print(f"    - {c}")
    
    # 2. Check z-index values
    z_indices = re.findall(r'z-index:\s*(\d+)', content)
    unique_z = sorted(list(set(map(int, z_indices))))
    print(f"  [Z-Index Set]: {unique_z}")
    
    # List z-index occurrences with selector context
    z_matches = re.findall(r'([^{}]*)\{[^}]*z-index:\s*(\d+)[^}]*\}', content)
    for sel, z in z_matches[:10]:
        clean_sel = sel.strip().split("\n")[-1].strip()
        print(f"    - z-index {z}: {clean_sel[:50]}")
    
    # 3. Check fixed heights on containers/cards
    # Look for height: <number>px (excluding small icons/buttons/borders <= 40px)
    fixed_heights = re.findall(r'([.#][\w\-]+)\s*\{[^}]*?\bheight:\s*([4-9]\d{2,}|\d{3,})px', content, re.DOTALL)
    print(f"  [Large Fixed Heights (>400px)]: {len(fixed_heights)}")
    for sel, h in fixed_heights[:5]:
        print(f"    - {sel}: height: {h}px")
        
    # Check media queries
    medias = re.findall(r'@media\s*\([^\)]+\)', content)
    print(f"  [Media Queries]: {len(medias)}")
    for m in set(medias):
        print(f"    - {m}")
        
    # Check sound toggle elements if present
    audio_hits = re.findall(r'(toggleSound|SoundSynth|TacticalAudioEngine|TacticalVoiceAlert|soundEnabled|audioMuted|speechSynthesis)', content)
    print(f"  [Audio references]: {len(audio_hits)} found ({set(audio_hits)})")

