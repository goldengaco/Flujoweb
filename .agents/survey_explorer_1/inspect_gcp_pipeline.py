import os
import re

with open('sistemas/gcp-serverless-pipeline/index.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

print("=== GCP-SERVERLESS-PIPELINE ANALYSIS ===")
classes = re.findall(r'class\s+([A-Za-z0-9_]+)\s*\{', content)
print('Classes:', classes)

# Log panel
log_elements = re.findall(r'id=["\']([^"\']*(?:log|terminal|console|filter|search)[^"\']*)["\']', content, re.I)
print('Log DOM IDs:', set(log_elements))

# Pipeline nodes
nodes = re.findall(r'data-node-id=["\']([^"\']+)["\']|id=["\']node-[^"\']+["\']', content)
print('Pipeline Nodes:', set(nodes))

# Controls & Deployment
strategies = re.findall(r'(?:canary|blue-green|rolling|chaos|rollback)', content, re.I)
print('Deployment strategies detected:', set(strategies))

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
