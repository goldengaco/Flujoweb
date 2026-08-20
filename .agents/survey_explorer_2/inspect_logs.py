import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

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

print("=== LOG PANEL IMPLEMENTATION DEEP DIVE ===")

for sys_name in systems:
    path = os.path.join('sistemas', sys_name, 'index.html')
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()

    print(f"\n==========================================")
    print(f"SYSTEM: {sys_name}")
    print(f"==========================================")

    # Search for log panel container in HTML
    log_containers = re.findall(r'(<(?:div|section|aside|footer)[^>]*?(?:terminal|log-panel|logs-container|log-stream|log-card|audit-console|event-log)[^>]*?>)', html, re.IGNORECASE)
    print(f"Log Containers ({len(log_containers)}):")
    for c in log_containers[:4]:
        print(f"  {c.strip()}")

    # Search for search/filter inputs in HTML
    inputs = re.findall(r'(<input[^>]*?(?:search|filter|query|keyword)[^>]*?>)', html, re.IGNORECASE)
    print(f"Search/Filter Inputs ({len(inputs)}):")
    for inp in inputs:
        print(f"  {inp.strip()}")

    # Search for filter buttons or dropdowns
    filter_elements = re.findall(r'(<(?:select|button)[^>]*?(?:filter|level|crit|all|warn|info|err|search)[^>]*?>[\s\S]*?</(?:select|button)>)', html, re.IGNORECASE)
    print(f"Filter buttons/selects ({len(filter_elements)}):")
    for fe in filter_elements[:6]:
        print(f"  {fe.strip()[:100]}")

    # Search for Export buttons in HTML
    export_buttons = re.findall(r'(<button[^>]*?(?:export|download|json|dump|save)[^>]*?>[\s\S]*?</button>)', html, re.IGNORECASE)
    print(f"Export buttons ({len(export_buttons)}):")
    for eb in export_buttons:
        print(f"  {eb.strip()}")

    # Search for JS export or search functions
    js_export_funcs = re.findall(r'(\b(?:exportLogs|downloadJSON|exportToJSON|exportJSON|filterLogs|searchLogs|filterTerminal)\b[^\n;{]*)', html, re.IGNORECASE)
    print(f"JS Export / Filter functions ({len(js_export_funcs)}):")
    for fn in js_export_funcs[:8]:
        print(f"  {fn.strip()}")
