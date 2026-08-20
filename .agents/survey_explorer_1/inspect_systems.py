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

results = {}

for s in systems:
    path = os.path.join('sistemas', s, 'index.html')
    if not os.path.exists(path):
        results[s] = {'error': 'file not found'}
        continue
        
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Title
    m_title = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    title = m_title.group(1).strip() if m_title else 'No Title'
    
    # AudioContext / Web Audio / Speech
    audio_hits = list(set(re.findall(r'(AudioContext|webkitAudioContext|speechSynthesis|createOscillator|createGain|playTone|beep|playSiren|synthesizer)', content, re.IGNORECASE)))
    mute_hits = list(set(re.findall(r'(mute|unmute|sound-toggle|audio-toggle|toggleSound|isMuted|muted)', content, re.IGNORECASE)))
    
    # Log panel features
    log_export = list(set(re.findall(r'(export.*json|json.*export|download.*log|exportLog|saveLogs|exportLogs)', content, re.IGNORECASE)))
    log_filter = list(set(re.findall(r'(filter.*log|search.*log|log.*filter|log.*search|logFilter|logSearch)', content, re.IGNORECASE)))
    log_elements = re.findall(r'<[a-z0-9]+[^>]*(?:id|class)=["\'][^"\']*(?:log|console|terminal|audit-feed|event-stream|telemetry-feed)[^"\']*["\'][^>]*>', content, re.IGNORECASE)
    
    # Clamp usage
    clamp_hits = re.findall(r'clamp\([^)]+\)', content)
    
    # Fixed heights
    fixed_heights = re.findall(r'(?:height|min-height|max-height):\s*[^;]+;', content)
    fixed_px_heights = [h for h in fixed_heights if 'px' in h and not 'min-height' in h and not 'max-height' in h]
    
    # z-indices
    z_indices = [int(z) for z in re.findall(r'z-index:\s*(-?\d+)', content)]
    
    # Canvas / SVG
    canvas_tags = re.findall(r'<canvas[^>]*>', content, re.IGNORECASE)
    svg_tags = re.findall(r'<svg[^>]*>', content, re.IGNORECASE)
    
    # Responsive flex / grid
    flex_wrap = re.findall(r'flex-wrap:\s*wrap', content, re.IGNORECASE)
    grid_autofit = re.findall(r'repeat\(\s*auto-(?:fit|fill)[^)]+\)', content, re.IGNORECASE)
    media_queries = re.findall(r'@media[^{]+{', content, re.IGNORECASE)
    
    # Box shadows / glows
    box_shadows = re.findall(r'box-shadow:\s*([^;]+);', content, re.IGNORECASE)
    
    # Connections / lines / animations
    canvas_anim = re.findall(r'(requestAnimationFrame|strokePath|beginPath|arc\(|lineTo|bezierCurveTo)', content)
    svg_paths = re.findall(r'<path[^>]*>', content, re.IGNORECASE)
    
    results[s] = {
        'title': title,
        'line_count': len(content.splitlines()),
        'byte_size': len(content.encode('utf-8')),
        'audio_features': audio_hits,
        'mute_controls': mute_hits,
        'log_elements': log_elements[:5],
        'log_export': log_export,
        'log_filter': log_filter,
        'clamp_usage': clamp_hits,
        'fixed_px_heights_count': len(fixed_px_heights),
        'fixed_px_heights_samples': fixed_px_heights[:8],
        'z_indices': sorted(list(set(z_indices))),
        'canvas_count': len(canvas_tags),
        'svg_count': len(svg_tags),
        'flex_wrap_count': len(flex_wrap),
        'grid_autofit_count': len(grid_autofit),
        'media_queries_count': len(media_queries),
        'media_queries': [mq.strip() for mq in media_queries[:5]],
        'box_shadow_count': len(box_shadows),
        'canvas_anim_calls': len(canvas_anim),
        'svg_paths_count': len(svg_paths)
    }

print(json.dumps(results, indent=2))
