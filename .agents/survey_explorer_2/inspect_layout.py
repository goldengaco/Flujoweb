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

print("=== CSS / LAYOUT / RESPONSIVENESS DEEP DIVE ===")

for sys_name in systems:
    path = os.path.join('sistemas', sys_name, 'index.html')
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()

    css_match = re.search(r'<style[^>]*>([\s\S]*?)</style>', html, re.IGNORECASE)
    css = css_match.group(1) if css_match else ""

    print(f"\n==========================================")
    print(f"SYSTEM: {sys_name}")
    print(f"==========================================")

    # Main container layout
    main_containers = re.findall(r'(\.(?:app|cockpit|tactical|container|dashboard|wrapper|grid|main)[^{]*)\{([^}]*)\}', css)
    print("Main layout containers:")
    for sel, rules in main_containers[:6]:
        clean_rules = " ".join([r.strip() for r in rules.split(';') if any(k in r for k in ['display', 'grid', 'flex', 'height', 'width', 'max-width', 'min-height'])])
        if clean_rules:
            print(f"  {sel.strip()}: {clean_rules}")

    # Fixed height rules on cards / containers / text / panels
    fixed_height_rules = re.findall(r'([^{}\n]+)\s*\{([^}]*?(?<!min-|max-)height:\s*\d+px[^}]*?)\}', css)
    print(f"\nFixed height rules ({len(fixed_height_rules)}):")
    for sel, rules in fixed_height_rules:
        h_match = re.search(r'(?<!min-|max-)height:\s*(\d+px)', rules)
        h_val = h_match.group(0) if h_match else ""
        print(f"  {sel.strip()} -> {h_val}")

    # Typography & clamp()
    clamp_rules = re.findall(r'([^{}\n]+)\s*\{([^}]*?clamp\([^)]+\)[^}]*?)\}', css)
    print(f"\nclamp() rules ({len(clamp_rules)}):")
    for sel, rules in clamp_rules:
        print(f"  {sel.strip()} -> {rules.strip()}")

    # Font sizes without clamp in h1/h2/h3/header/title
    heading_font_sizes = re.findall(r'([^{}\n]*(?:h1|h2|h3|title|brand|header)[^{}\n]*)\s*\{([^}]*?font-size:[^;]+;[^}]*)\}', css, re.IGNORECASE)
    print(f"\nHeading / Title font sizes ({len(heading_font_sizes)}):")
    for sel, rules in heading_font_sizes[:8]:
        fs_match = re.search(r'font-size:\s*([^;]+);', rules)
        if fs_match and 'clamp' not in fs_match.group(1):
            print(f"  {sel.strip()} -> {fs_match.group(0)}")

    # z-index hierarchy
    z_rules = re.findall(r'([^{}\n]+)\s*\{([^}]*?z-index:\s*[^;]+;[^}]*)\}', css)
    print(f"\nz-index hierarchy ({len(z_rules)}):")
    for sel, rules in z_rules:
        z_match = re.search(r'z-index:\s*([^;]+);', rules)
        print(f"  {sel.strip()} -> {z_match.group(0) if z_match else ''}")

    # Overflow rules
    overflow_rules = re.findall(r'([^{}\n]+)\s*\{([^}]*?overflow[^;]*:[^;]+;[^}]*)\}', css)
    print(f"\nOverflow rules ({len(overflow_rules)}):")
    for sel, rules in overflow_rules[:8]:
        of_match = re.search(r'overflow[^;]*:\s*([^;]+);', rules)
        print(f"  {sel.strip()} -> {of_match.group(0) if of_match else ''}")
