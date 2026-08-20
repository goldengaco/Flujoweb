import re
import os

with open(r'c:\DevWork\Depredador\Flujoweb\sistemas\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'const SYSTEMS_MANIFEST = (\[.*?\]);', text, re.DOTALL)
if m:
    manifest_raw = m.group(1)
    ids = re.findall(r'id:\s*[\'\"]([^\'\"]+)[\'\"]', manifest_raw)
    print(f'Total systems in manifest: {len(ids)}')
    print('IDs:', ids)
    
    base = r'c:\DevWork\Depredador\Flujoweb\sistemas'
    for item_id in ids:
        target = os.path.join(base, item_id, 'index.html')
        exists = os.path.exists(target)
        print(f'  - {item_id}: {"EXISTS" if exists else "MISSING"} ({target})')
else:
    print('Manifest not found')
