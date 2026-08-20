import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

test_dir = 'tests'
systems = [
    'gcp-sql-networking',
    'gcp-iam-security',
    'gcp-cloudops-cockpit',
    'mulesoft-observability',
    'apigee-mulesoft-hybrid',
    'emergency-evacuation-v1',
    'emergency-evacuation-v2',
    'emergency-evacuation-v3'
]

print("=== INSPECTING TESTS FOR SYSTEMS 8-15 ===")

test_files = []
for root, dirs, files in os.walk(test_dir):
    for file in files:
        if file.endswith('.js') or file.endswith('.py') or file.endswith('.json'):
            test_files.append(os.path.join(root, file))

print(f"Total test files in {test_dir}: {len(test_files)}")

system_test_map = {sys: [] for sys in systems}

for tf in test_files:
    try:
        with open(tf, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        for sys in systems:
            if sys in content:
                system_test_map[sys].append(tf)
    except Exception as e:
        pass

for sys, matches in system_test_map.items():
    print(f"\n--- {sys} ({len(matches)} test references) ---")
    for m in matches[:10]:
        print(f"  {m}")
