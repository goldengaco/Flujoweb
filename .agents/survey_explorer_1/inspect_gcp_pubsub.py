import os
import re

with open('sistemas/gcp-event-pubsub/index.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

print("=== GCP-EVENT-PUBSUB ANALYSIS ===")
classes = re.findall(r'class\s+([A-Za-z0-9_]+)\s*\{', content)
print('Classes:', classes)

# Log panel
log_elements = re.findall(r'id=["\']([^"\']*(?:log|terminal|console|filter|search|stream|dlq)[^"\']*)["\']', content, re.I)
print('Log DOM IDs:', set(log_elements))

# Canvas
canvas_matches = re.findall(r'<canvas[^>]*id=["\']([^"\']+)["\'][^>]*>', content)
print('Canvas tags:', canvas_matches)

# Fixed height rules
fixed_h = re.findall(r'([.#a-zA-Z0-9_-]+\s*\{[^}]*?(?:(?<!min-|max-)height:\s*\d+px)[^}]*\})', content, re.DOTALL)
print('Fixed height rules count:', len(fixed_h))
for fh in fixed_h[:6]:
    print('  ', ' '.join(fh.split()))

# z-index rules
z_rules = re.findall(r'([.#a-zA-Z0-9_-]+\s*\{[^}]*?z-index:\s*(-?\d+)[^}]*\})', content, re.DOTALL)
print('z-index rules count:', len(z_rules))
for zr in z_rules:
    print(f"   z-index {zr[1]}: {' '.join(zr[0].split())[:100]}")
