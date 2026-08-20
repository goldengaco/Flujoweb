import os, sys, re

deliverables = [
    r"sistemas/apigee-mulesoft-hybrid/index.html",
    r"sistemas/emergency-evacuation-v1/index.html",
    r"sistemas/emergency-evacuation-v2/index.html",
    r"sistemas/emergency-evacuation-v3/index.html"
]

print("=== CHECKING EXTERNAL DEPENDENCIES ===")
for path in deliverables:
    print(f"\n--- Checking {path} ---")
    assert os.path.exists(path), f"File {path} does not exist!"
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    # Check script src
    script_srcs = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', content, re.I)
    print("Script src tags:", script_srcs)
    
    # Check link href
    link_hrefs = re.findall(r'<link[^>]+href=["\']([^"\']+)["\']', content, re.I)
    print("Link href tags:", link_hrefs)
    for href in link_hrefs:
        if "fonts.googleapis.com" in href or "fonts.gstatic.com" in href:
            continue
        print("NON-FONT LINK TAG DETECTED:", href)
    
    # Check external CDN domains
    external_urls = re.findall(r'https?://([a-zA-Z0-9.-]+)', content)
    unique_domains = set(external_urls)
    print("Referenced domains:", unique_domains)

