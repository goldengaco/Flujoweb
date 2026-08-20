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
    # find click handlers on audio buttons
    matches = re.findall(r'(?:addEventListener|onclick|querySelector)[\s\S]{0,100}(?:audio|sound|mute|siren|voice)[\s\S]{0,250}', content, re.I)
    for m in matches[:3]:
        print("  Snippet:", m.strip()[:180].replace('\n', ' '))
