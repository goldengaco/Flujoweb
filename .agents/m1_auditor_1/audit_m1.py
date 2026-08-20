import os
import re
import json

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

base_dir = r"c:\DevWork\Depredador\Flujoweb"

report = {}

for rel_path in files:
    full_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(full_path):
        report[rel_path] = {"error": "File does not exist"}
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Clamps
    clamps = re.findall(r'clamp\s*\([^)]+\)', content)
    
    # Min-heights
    min_heights = re.findall(r'min-height\s*:\s*([^;}\n]+)', content)
    
    # Fixed heights on potentially text/content containers
    fixed_heights = re.findall(r'(\.[a-zA-Z0-9_-]+|\#[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+)\s*\{[^}]*?\bheight\s*:\s*(\d+px)[^}]*\}', content, re.DOTALL)
    
    # Z-index values
    z_indices = re.findall(r'z-index\s*:\s*([^;}\n]+)', content)
    
    # Grid auto-fit / auto-fill / repeat
    grids = re.findall(r'grid-template-columns\s*:\s*([^;}\n]+)', content)
    
    # Search for hardcoded suspicious patterns
    # e.g., dummy/fake test bypasses, hardcoded pass strings, window.__isTest
    suspicious = []
    suspicious_patterns = [
        r'return\s+true\s*;\s*//\s*bypass',
        r'window\.__test_override',
        r'if\s*\([^)]*window\.__isTest[^)]*\)\s*return',
        r'mock_pass',
        r'dummy_implementation',
        r'TODO:\s*implement',
        r'throw\s+new\s+Error\([\'"]NotImplemented',
    ]
    for sp in suspicious_patterns:
        matches = re.findall(sp, content, re.IGNORECASE)
        if matches:
            suspicious.append({"pattern": sp, "matches": matches})
            
    report[rel_path] = {
        "file_size": len(content),
        "clamp_count": len(clamps),
        "clamp_samples": clamps[:5],
        "min_height_count": len(min_heights),
        "min_height_samples": min_heights[:5],
        "fixed_heights_count": len(fixed_heights),
        "fixed_heights_samples": fixed_heights[:5],
        "z_indices_unique": sorted(list(set(z.strip() for z in z_indices))),
        "grid_templates": grids[:5],
        "suspicious_patterns": suspicious
    }

print(json.dumps(report, indent=2))
