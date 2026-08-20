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

print("=== AUDIO & SPEECH SYNTHESIS DEEP DIVE ===")
for sys_name in systems:
    path = os.path.join('sistemas', sys_name, 'index.html')
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        code = f.read()

    print(f"\n--- {sys_name} ---")
    
    # AudioContext
    audio_matches = re.findall(r'(class\s+\w*Audio\w*|class\s+\w*Sound\w*|function\s+\w*Sound\w*|const\s+audio\w*|new\s+(?:window\.)?AudioContext)', code)
    print(f"Audio classes/functions: {audio_matches}")
    
    # Web Speech API
    speech_matches = re.findall(r'(\b\w*speechSynthesis\w*|\bSpeechSynthesisUtterance\b|\b\w*speak\w*\s*\([^)]*\))', code)
    print(f"Speech API matches: {speech_matches}")
    
    # Audio toggle / Mute buttons in HTML
    btn_matches = re.findall(r'(<button[^>]*?(?:sound|audio|mute|speaker|vol)[^>]*?>[\s\S]*?</button>)', code, re.IGNORECASE)
    print(f"Mute/Audio buttons in HTML ({len(btn_matches)}):")
    for b in btn_matches:
        print(f"   {b.strip()[:150]}")
        
    # Check specifically how AudioContext and Speech are created and muted
    audio_class_block = re.findall(r'class\s+(?:SoundEngine|CyberAudio|WebAudioSynthesizer|AudioController|SoundManager|AudioFX)[\s\S]*?\n\}', code)
    if audio_class_block:
        print(f"Audio class preview ({len(audio_class_block[0])} chars):")
        print('\n'.join(audio_class_block[0].splitlines()[:20]))
    else:
        # Search for AudioContext initialization
        ctx_lines = [line for line in code.splitlines() if 'AudioContext' in line or 'speechSynthesis' in line]
        print(f"Context / Speech lines: {ctx_lines[:5]}")
