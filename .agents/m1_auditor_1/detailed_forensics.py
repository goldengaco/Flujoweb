import os
import re
import json

base_dir = r"c:\DevWork\Depredador\Flujoweb"
files = [
    'sistemas/tv-diagnostic/index.html',
    'sistemas/network-health/index.html',
    'sistemas/security-audit/index.html',
    'sistemas/server-status/index.html',
    'sistemas/transaction-flow/index.html',
    'sistemas/gcp-serverless-pipeline/index.html',
    'sistemas/gcp-event-pubsub/index.html',
    'sistemas/gcp-sql-networking/index.html',
    'sistemas/gcp-iam-security/index.html',
    'sistemas/gcp-cloudops-cockpit/index.html',
    'sistemas/mulesoft-observability/index.html',
    'sistemas/apigee-mulesoft-hybrid/index.html',
    'sistemas/emergency-evacuation-v1/index.html',
    'sistemas/emergency-evacuation-v2/index.html',
    'sistemas/emergency-evacuation-v3/index.html'
]

results = {}

for fpath in files:
    full = os.path.join(base_dir, fpath)
    with open(full, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Extract CSS style blocks
    styles = re.findall(r'<style[^>]*>(.*?)</style>', text, re.DOTALL | re.IGNORECASE)
    all_css = "\n".join(styles)
    
    # Check all z-index rules
    z_rules = []
    # match selector { ... z-index: X; ... }
    # simplistic css block parser
    css_rule_pattern = re.compile(r'([^{}]+)\{([^{}]+)\}')
    for match in css_rule_pattern.finditer(all_css):
        sel = match.group(1).strip()
        body = match.group(2)
        z_match = re.search(r'z-index\s*:\s*([^;}\n]+)', body)
        if z_match:
            z_val = z_match.group(1).strip()
            z_rules.append({"selector": sel, "z_index": z_val})
    
    # Check all clamp() usages
    clamp_rules = []
    for match in css_rule_pattern.finditer(all_css):
        sel = match.group(1).strip()
        body = match.group(2)
        c_matches = re.findall(r'([a-zA-Z0-9_-]+)\s*:\s*([^;}]*clamp\([^)]+\)[^;}]*)', body)
        for prop, val in c_matches:
            clamp_rules.append({"selector": sel, "property": prop.strip(), "value": val.strip()})
            
    # Check inline style clamps if any
    inline_clamps = re.findall(r'style="[^"]*clamp\([^)]+\)[^"]*"', text)
    
    results[fpath] = {
        "z_rules": z_rules,
        "clamp_rules": clamp_rules,
        "inline_clamps_count": len(inline_clamps)
    }

output_path = os.path.join(base_dir, ".agents", "m1_auditor_1", "detailed_css_analysis.json")
with open(output_path, "w", encoding="utf-8") as out:
    json.dump(results, out, indent=2)

print(f"Analysis saved to {output_path}")
