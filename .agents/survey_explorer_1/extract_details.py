import os
import re
import json

systems = [
    'tv-diagnostic',
    'network-health',
    'security-audit',
    'server-status',
    'transaction-flow',
    'gcp-serverless-pipeline',
    'gcp-event-pubsub'
]

details = {}

for s in systems:
    path = os.path.join('sistemas', s, 'index.html')
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    content = ''.join(lines)
    
    # Extract scripts
    script_blocks = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
    
    # Extract styles
    style_blocks = re.findall(r'<style>(.*?)</style>', content, re.DOTALL)
    
    # Find DOM IDs
    dom_ids = re.findall(r'id=["\']([^"\']+)["\']', content)
    data_testids = re.findall(r'data-testid=["\']([^"\']+)["\']', content)
    
    # Find buttons
    buttons = re.findall(r'<button[^>]*>.*?</button>', content, re.DOTALL | re.IGNORECASE)
    cleaned_buttons = [' '.join(b.split()) for b in buttons]
    
    # Find JS functions and classes
    js_classes = re.findall(r'class\s+([A-Za-z0-9_]+)', content)
    js_funcs = re.findall(r'function\s+([A-Za-z0-9_]+)', content)
    const_funcs = re.findall(r'const\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>', content)
    
    # Find CSS rules with fixed heights
    fixed_height_rules = []
    if style_blocks:
        style_content = '\n'.join(style_blocks)
        # Find selectors with height
        matches = re.finditer(r'([^{}]+)\{([^{}]*height:\s*\d+px[^{}]*)\}', style_content)
        for m in matches:
            sel = m.group(1).strip()
            body = ' '.join(m.group(2).split())
            fixed_height_rules.append(f"{sel} {{ {body} }}")
            
    # Find z-indices in CSS
    z_index_rules = []
    if style_blocks:
        matches = re.finditer(r'([^{}]+)\{([^{}]*z-index:\s*-?\d+[^{}]*)\}', style_content)
        for m in matches:
            sel = m.group(1).strip()
            body = ' '.join(m.group(2).split())
            z_index_rules.append(f"{sel} {{ {body} }}")

    details[s] = {
        'total_lines': len(lines),
        'dom_ids': sorted(list(set(dom_ids))),
        'data_testids': sorted(list(set(data_testids))),
        'buttons_count': len(buttons),
        'buttons_sample': cleaned_buttons[:10],
        'js_classes': list(set(js_classes)),
        'js_functions': list(set(js_funcs + const_funcs)),
        'fixed_height_rules': fixed_height_rules,
        'z_index_rules': z_index_rules
    }

with open('.agents/survey_explorer_1/system_details.json', 'w', encoding='utf-8') as f:
    json.dump(details, f, indent=2, ensure_ascii=False)

print("Saved system_details.json successfully")
