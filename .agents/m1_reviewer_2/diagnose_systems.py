import os
import re

systems_to_check = [
    ("gcp-iam-security", r"c:\DevWork\Depredador\Flujoweb\sistemas\gcp-iam-security\index.html"),
    ("gcp-cloudops-cockpit", r"c:\DevWork\Depredador\Flujoweb\sistemas\gcp-cloudops-cockpit\index.html"),
    ("mulesoft-observability", r"c:\DevWork\Depredador\Flujoweb\sistemas\mulesoft-observability\index.html"),
    ("apigee-mulesoft-hybrid", r"c:\DevWork\Depredador\Flujoweb\sistemas\apigee-mulesoft-hybrid\index.html"),
    ("emergency-evacuation-v1", r"c:\DevWork\Depredador\Flujoweb\sistemas\emergency-evacuation-v1\index.html"),
    ("emergency-evacuation-v2", r"c:\DevWork\Depredador\Flujoweb\sistemas\emergency-evacuation-v2\index.html"),
    ("emergency-evacuation-v3", r"c:\DevWork\Depredador\Flujoweb\sistemas\emergency-evacuation-v3\index.html")
]

for name, path in systems_to_check:
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    
    print(f"================== {name} ==================")
    # Check font-size occurrences
    font_sizes = re.findall(r'font-size:\s*([^;}\n]+)', html)
    clamps = [fs for fs in font_sizes if 'clamp' in fs]
    non_clamps = [fs for fs in font_sizes if 'clamp' not in fs]
    print(f"Total font-sizes: {len(font_sizes)}, Clamps: {len(clamps)}, Non-clamps: {len(non_clamps)}")
    print(f"Sample clamps: {clamps[:4]}")
    
    # Check fixed widths or min-widths that could cause 800+ px overflow on mobile
    min_widths = re.findall(r'min-width:\s*([4-9]\d{2,}|\d{4,})px', html)
    widths = re.findall(r'(?<!max-)\bwidth:\s*([4-9]\d{2,}|\d{4,})px', html)
    grid_cols = re.findall(r'grid-template-columns:\s*([^;}\n]+)', html)
    
    print(f"Large min-widths (>400px): {min_widths}")
    print(f"Large fixed widths (>400px): {widths}")
    print(f"Grid template columns: {grid_cols[:4]}")
    
    # Check z-index
    z_indices = re.findall(r'z-index:\s*([^;}\n]+)', html)
    print(f"Z-indices: {set(z_indices)}")
