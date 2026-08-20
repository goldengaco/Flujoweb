import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

systems = [
    'gcp-sql-networking',
    'gcp-iam-security',
    'gcp-cloudops-cockpit',
    'mulesoft-observability',
    'apigee-mulesoft-hybrid',
    'emergency-evacuation-v1',
    'emergency-evacuation-v2',
    'emergency-evacuation-v3'
]

print("=== VISUAL AESTHETICS & MICRO-INTERACTIONS SURVEY ===")

for sys_name in systems:
    path = os.path.join('sistemas', sys_name, 'index.html')
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()

    print(f"\n==========================================")
    print(f"SYSTEM: {sys_name}")
    print(f"==========================================")

    # Glows and box-shadows
    glows = re.findall(r'([^{}\n]*(?:glow|shadow|radiant|bloom|neon|luminous)[^{}\n]*)\s*\{([^}]*)\}', html, re.IGNORECASE)
    print(f"Glow/Shadow classes ({len(glows)}):")
    for sel, rules in glows[:5]:
        b_sh = re.findall(r'box-shadow:[^;]+', rules)
        d_sh = re.findall(r'filter:[^;]+', rules)
        print(f"  {sel.strip()}: {b_sh + d_sh}")

    # Animations & keyframes
    keyframes = re.findall(r'@keyframes\s+([a-zA-Z0-9_-]+)', html)
    print(f"Keyframe animations ({len(keyframes)}): {keyframes[:8]}")

    # Connection lines / particle / flow logic in JS
    lines_flow = re.findall(r'(\b(?:drawConnection|renderPackets|renderParticles|drawMesh|drawRoute|drawLinks|drawLines|animateFlow|packetLoop|particleLoop)\b[^\n;{]*)', html, re.IGNORECASE)
    print(f"Flow / Line rendering functions: {lines_flow[:5]}")

    # Ambient fading / completion handling
    completion_handlers = re.findall(r'(\b(?:onComplete|fadeAmbient|resetFlow|flowFinished|idleState|ambientMode|decayParticles)\b[^\n;{]*)', html, re.IGNORECASE)
    print(f"Completion / Ambient fading handlers: {completion_handlers[:5]}")
