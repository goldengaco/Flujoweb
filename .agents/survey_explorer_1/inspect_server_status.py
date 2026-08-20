import os
import re

with open('sistemas/server-status/index.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

print("=== SERVER-STATUS ANALYSIS ===")
classes = re.findall(r'class\s+([A-Za-z0-9_]+)\s*\{', content)
print('Classes:', classes)

# Audio analysis
audio_blocks = re.findall(r'class\s+([A-Za-z0-9_]*Audio[A-Za-z0-9_]*|[A-Za-z0-9_]*Sound[A-Za-z0-9_]*)\s*\{.*?\}', content, re.DOTALL)
if audio_blocks:
    print('Audio Block:\n', audio_blocks[0][:400])

# Sound toggles
sound_btns = re.findall(r'<button[^>]*(?:sound|mute|audio)[^>]*>.*?</button>', content, re.I)
print('Sound buttons in HTML:', sound_btns)

# Terminal / log features
terminal_features = re.findall(r'(logFilter|filterLog|searchLog|exportJson|clearTerminal|downloadLog)', content, re.I)
print('Terminal feature keywords:', set(terminal_features))

# Layout / Grid
cards = re.findall(r'<[a-z0-9]+[^>]*(?:class|id)=["\'][^"\']*(?:service-card|node|sparkline|drawer|modal)[^"\']*["\'][^>]*>', content, re.I)
print(f'Service / Node / Card elements count: {len(cards)}')

# Fixed heights
fixed_h = re.findall(r'([.#a-zA-Z0-9_-]+\s*\{[^}]*?(?:(?<!min-|max-)height:\s*\d+px)[^}]*\})', content, re.DOTALL)
print('Fixed height rules count:', len(fixed_h))
for fh in fixed_h[:6]:
    print('  ', ' '.join(fh.split()))

# z-indices
z_rules = re.findall(r'([.#a-zA-Z0-9_-]+\s*\{[^}]*?z-index:\s*(-?\d+)[^}]*\})', content, re.DOTALL)
print('z-index rules count:', len(z_rules))
for zr in z_rules:
    print(f"   z-index {zr[1]}: {' '.join(zr[0].split())[:100]}")
