import os
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

systems = [
    'tv-diagnostic',
    'network-health',
    'security-audit',
    'server-status',
    'transaction-flow',
    'gcp-serverless-pipeline',
    'gcp-event-pubsub'
]

test_dir = 'tests'
test_files = [os.path.join(dp, f) for dp, dn, fn in os.walk(test_dir) for f in fn if f.endswith(('.js', '.py', '.json'))]

report = {}

for sys_name in systems:
    sys_dir = os.path.join('sistemas', sys_name)
    files = os.listdir(sys_dir)
    main_file = os.path.join(sys_dir, 'index.html')
    with open(main_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # 1. Structure / Elements
    cards = re.findall(r'<[a-z0-9]+[^>]*(?:class|id)=["\'][^"\']*(?:card|panel|section|container|view|tab|drawer|modal)[^"\']*["\'][^>]*>', content, re.IGNORECASE)
    
    # 2. Fixed Heights & Layout Quirks
    fixed_h = re.findall(r'([.#a-zA-Z0-9_-]+\s*\{[^}]*?(?:(?<!min-|max-)height:\s*\d+px)[^}]*\})', content, re.DOTALL)
    clean_fixed_h = [' '.join(fh.split()) for fh in fixed_h]
    
    clamps = re.findall(r'clamp\([^)]+\)', content)
    
    z_rules = re.findall(r'([.#a-zA-Z0-9_-]+\s*\{[^}]*?z-index:\s*(-?\d+)[^}]*\})', content, re.DOTALL)
    clean_z_rules = [{'rule': ' '.join(zr[0].split())[:120], 'z': int(zr[1])} for zr in z_rules]
    
    canvas_matches = re.findall(r'<canvas[^>]*id=["\']([^"\']+)["\'][^>]*>', content)
    svg_matches = re.findall(r'<svg[^>]*id=["\']([^"\']+)["\'][^>]*>', content)
    resize_handlers = re.findall(r'window\.addEventListener\(["\']resize["\']|window\.onresize|ResizeObserver', content)
    
    # 3. Log / Terminal Details
    has_log_search = bool(re.search(r'type=["\']search["\']|id=["\'][^"\']*(?:search|filter)[^"\']*log|placeholder=["\'][^"\']*(?:search|filter)', content, re.I))
    has_log_export = bool(re.search(r'export.*json|json.*export|download.*log|exportLog', content, re.I))
    has_log_clear = bool(re.search(r'clear.*log|log.*clear|btn-clear|btnClear', content, re.I))
    
    # Find specific IDs and classes in log panels
    log_inputs = re.findall(r'<input[^>]*(?:id|class)=["\'][^"\']*(?:log|search|filter)[^"\']*["\'][^>]*>', content, re.I)
    log_buttons = re.findall(r'<button[^>]*(?:id|class)=["\'][^"\']*(?:log|export|clear|pause)[^"\']*["\'][^>]*>', content, re.I)
    
    # 4. Audio Synthesizers & Sound Mute
    audio_code = re.findall(r'(class\s+[A-Za-z0-9_]*Audio[A-Za-z0-9_]*|class\s+[A-Za-z0-9_]*Sound[A-Za-z0-9_]*|class\s+[A-Za-z0-9_]*Synth[A-Za-z0-9_]*|function\s+[A-Za-z0-9_]*(?:audio|sound|beep|tone|synth)[A-Za-z0-9_]*|new\s+(?:window\.)?(?:AudioContext|webkitAudioContext))', content, re.I)
    mute_button = re.findall(r'<button[^>]*(?:id|class|title|aria-label)=["\'][^"\']*(?:sound|mute|audio)[^"\']*["\'][^>]*>', content, re.I)
    
    # 5. Visual Aesthetics & Ambient Flow
    glow_shadows = [s for s in re.findall(r'box-shadow:\s*([^;]+);', content) if 'rgba' in s and ('0.' in s or '0,' in s)]
    ambient_fading = re.findall(r'(?:opacity:\s*0\.\d+|filter:\s*blur|data-done)', content)
    
    # 6. Matching tests
    matching_tests = []
    for tf in test_files:
        try:
            with open(tf, 'r', encoding='utf-8', errors='ignore') as tf_f:
                tf_c = tf_f.read()
            if sys_name in tf_c:
                matching_tests.append(tf)
        except Exception:
            pass
            
    report[sys_name] = {
        'files': files,
        'line_count': len(content.splitlines()),
        'byte_size': len(content.encode('utf-8')),
        'fixed_height_count': len(fixed_h),
        'fixed_height_samples': clean_fixed_h[:8],
        'clamp_usage': clamps,
        'z_index_declarations': clean_z_rules,
        'canvas_ids': canvas_matches,
        'svg_ids': svg_matches,
        'resize_handlers_count': len(resize_handlers),
        'log_search_present': has_log_search,
        'log_export_present': has_log_export,
        'log_clear_present': has_log_clear,
        'log_inputs': log_inputs,
        'log_buttons': log_buttons,
        'audio_synth_present': len(audio_code) > 0,
        'audio_synth_details': audio_code,
        'sound_mute_button_present': len(mute_button) > 0,
        'sound_mute_buttons': mute_button,
        'glow_box_shadows_count': len(glow_shadows),
        'ambient_fading_patterns': len(ambient_fading),
        'matching_tests': matching_tests
    }

with open('.agents/survey_explorer_1/survey_summary.json', 'w', encoding='utf-8') as out_f:
    json.dump(report, out_f, indent=2, ensure_ascii=False)

print("Survey summary saved to .agents/survey_explorer_1/survey_summary.json")
