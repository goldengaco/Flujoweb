import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
base = Path(r"c:\DevWork\Depredador\Flujoweb\sistemas")

targets = [
    'emergency-evacuation-v2',
    'server-status',
    'apigee-mulesoft-hybrid',
    'emergency-evacuation-v1',
    'emergency-evacuation-v3',
    'gcp-sql-networking',
    'gcp-iam-security'
]

for t in targets:
    html_file = base / t / "index.html"
    content = html_file.read_text(encoding="utf-8")
    print(f"\n==================== {t} ====================")
    # find audio buttons
    buttons = re.findall(r'<button[^>]*?(?:audio|sound|mute|siren|voice)[^>]*?>[\s\S]*?</button>', content, re.I)
    print("Buttons:", buttons)
    # find audio state vars/functions
    snippets = re.findall(r'(\b(?:soundEnabled|audioMuted|isMuted|muted|audioEnabled|toggleSound|toggleAudio|toggleSiren|SoundSynth|TacticalAudioEngine)\b[\s\S]{1,100})', content)
    print("State Snippets:", snippets[:5])
