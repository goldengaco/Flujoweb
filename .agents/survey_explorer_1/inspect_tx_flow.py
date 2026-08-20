import os
import re

with open('sistemas/transaction-flow/index.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

print("=== TRANSACTION-FLOW ANALYSIS ===")
classes = re.findall(r'class\s+([A-Za-z0-9_]+)\s*\{', content)
print('Classes:', classes)

pipeline_nodes = re.findall(r'id=["\'](?:step|node)-[^"\']+["\']|class=["\'][^"\']*pipeline-step[^"\']*["\']', content)
print(f'Pipeline steps/nodes: {len(pipeline_nodes)}')

# Terminal & search
log_filter = re.findall(r'(?:logFilter|searchLog|exportJson|clearLog|btn-clear|search)', content, re.I)
print('Log keywords:', set(log_filter))

# Canvas & SVG tracks
canvas_hits = re.findall(r'<canvas[^>]*>', content)
svg_hits = re.findall(r'<svg[^>]*>', content)
print('Canvas tags:', canvas_hits)
print('SVG tags count:', len(svg_hits))

# Check fixed heights
fixed_h = re.findall(r'([.#a-zA-Z0-9_-]+\s*\{[^}]*?(?:(?<!min-|max-)height:\s*\d+px)[^}]*\})', content, re.DOTALL)
print('Fixed height rules count:', len(fixed_h))
for fh in fixed_h[:6]:
    print('  ', ' '.join(fh.split()))

# Check z-indexes
z_rules = re.findall(r'([.#a-zA-Z0-9_-]+\s*\{[^}]*?z-index:\s*(-?\d+)[^}]*\})', content, re.DOTALL)
print('z-index rules count:', len(z_rules))
for zr in z_rules:
    print(f"   z-index {zr[1]}: {' '.join(zr[0].split())[:100]}")
