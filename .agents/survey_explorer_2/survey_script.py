import os, glob, re, json

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

details = {}

for sys_name in systems:
    path = os.path.join('sistemas', sys_name, 'index.html')
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()

    css_blocks = re.findall(r'<style[^>]*>(.*?)</style>', html, re.DOTALL | re.IGNORECASE)
    full_css = '\n'.join(css_blocks)

    js_blocks = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL | re.IGNORECASE)
    full_js = '\n'.join(js_blocks)

    # Fixed heights in CSS
    fixed_h = re.findall(r'([^{}\n]+)\s*\{[^{}]*?(?<!min-|max-)height:\s*(\d+px)[^{}]*?\}', full_css)
    
    # z-indices
    z_rules = re.findall(r'([^{}\n]+)\s*\{[^{}]*?z-index:\s*(-?\d+)[^{}]*?\}', full_css)
    
    # clamp in CSS and HTML
    clamps = re.findall(r'([^{}\n]+)\s*\{[^{}]*?clamp\([^)]+\)[^{}]*?\}', full_css)

    # Audio details
    audio_ctx = bool(re.search(r'AudioContext|webkitAudioContext', full_js))
    speech_synth = bool(re.search(r'speechSynthesis|SpeechSynthesisUtterance', full_js))
    mute_buttons = re.findall(r'<button[^>]*?(?:mute|sound|audio|volume|speaker)[^>]*?>.*?</button>', html, re.IGNORECASE | re.DOTALL)
    mute_handlers = re.findall(r'(?:toggleSound|toggleMute|muteSound|soundEnabled|isMuted|audioEnabled|soundActive)[^;{\n]*', full_js, re.IGNORECASE)

    # Log panel details
    log_panel_match = re.findall(r'(?:class|id)=["\']([^"\']*(?:log|terminal|console|events|audit)[^"\']*)["\']', html, re.IGNORECASE)
    log_search = re.findall(r'<input[^>]*?(?:log|search|filter)[^>]*?>', html, re.IGNORECASE)
    log_export = re.findall(r'<button[^>]*?(?:export|download|json)[^>]*?>.*?</button>', html, re.IGNORECASE)

    # Canvas & SVG elements
    canvases = re.findall(r'<canvas[^>]*id=["\']([^"\']+)["\'][^>]*>', html)
    svgs = re.findall(r'<svg[^>]*id=["\']([^"\']+)["\'][^>]*>', html)

    # Fonts
    fonts = set(re.findall(r'font-family:\s*([^;}\n]+)', full_css, re.IGNORECASE))

    # Media queries
    media_queries = re.findall(r'@media[^{]+', full_css)

    title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)

    details[sys_name] = {
        'title': title_match.group(1) if title_match else '',
        'size_bytes': len(html),
        'lines': len(html.splitlines()),
        'fixed_heights': [(sel.strip(), val) for sel, val in fixed_h],
        'z_indexes': [(sel.strip(), val) for sel, val in z_rules],
        'clamps': [sel.strip() for sel in clamps],
        'audio_ctx': audio_ctx,
        'speech_synth': speech_synth,
        'mute_buttons': [b.strip() for b in mute_buttons],
        'mute_handlers': list(set([m.strip() for m in mute_handlers]))[:8],
        'log_panel_match': list(set(log_panel_match))[:10],
        'log_search': [s.strip() for s in log_search],
        'log_export': [e.strip() for e in log_export],
        'canvases': canvases,
        'svgs': svgs,
        'fonts': list(fonts),
        'media_queries_count': len(media_queries),
        'media_queries': [m.strip() for m in media_queries]
    }

with open('.agents/survey_explorer_2/system_details.json', 'w', encoding='utf-8') as f:
    json.dump(details, f, indent=2)

print('Detailed survey completed. Written to .agents/survey_explorer_2/system_details.json')
