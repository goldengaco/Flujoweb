import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
base = Path(r"c:\DevWork\Depredador\Flujoweb\sistemas")
dirs = [d for d in base.iterdir() if d.is_dir()]

for d in sorted(dirs):
    html_file = d / "index.html"
    if not html_file.exists():
        continue
    content = html_file.read_text(encoding="utf-8")
    
    # search for log search input
    log_search = re.findall(r'<input[^>]*?(?:log|search|filter)[^>]*?>', content, re.I)
    export_json = re.findall(r'<button[^>]*?(?:export|json|download)[^>]*?>[\s\S]*?</button>', content, re.I)
    log_handlers = re.findall(r'(?:onLogSearchInput|onSearchInput|filterLogs|searchLogs|exportLogs|exportToJson|exportAuditReport|exportReport)[\s\S]{0,100}', content)
    
    print(f"\n==================== {d.name} ====================")
    print("Log Inputs:", log_search)
    print("Export Buttons:", export_json)
    print("Handler names found:", list(set(log_handlers))[:5])
