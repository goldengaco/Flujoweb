import os

docs = [
    r'c:\DevWork\Depredador\Flujoweb\sistemas\manual_observabilidad_cloud_sre.md',
    r'c:\DevWork\Depredador\Flujoweb\sistemas\mulesoft_y_arquitectura_sistemas.md',
    r'c:\DevWork\Depredador\Flujoweb\sistemas\mulesoft_80_ideas_observabilidad.md'
]

for doc_path in docs:
    fname = os.path.basename(doc_path)
    if not os.path.exists(doc_path):
        print(f'ERROR: {fname} does not exist!')
        continue
    with open(doc_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.splitlines()
    words = content.split()
    h1 = [l for l in lines if l.startswith('# ')]
    h2 = [l for l in lines if l.startswith('## ')]
    h3 = [l for l in lines if l.startswith('### ')]
    code_blocks = content.count('```') // 2
    tables = content.count('|---|') + content.count('|:---|') + content.count('|:---:|')
    
    print(f'=== {fname} ===')
    print(f'  Size: {len(content):,} bytes | Lines: {len(lines):,} | Words: {len(words):,}')
    print(f'  H1: {len(h1)} | H2: {len(h2)} | H3: {len(h3)}')
    print(f'  Code Blocks: {code_blocks} | Tables: {tables}')
    print(f'  Top H2 Headings:')
    for h in h2[:8]:
        print(f'    - {h.replace("## ", "")}')
    print()
