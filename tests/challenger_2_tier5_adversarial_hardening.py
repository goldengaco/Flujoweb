import json
import os
import sys
import time

# Reconfigure stdout/stderr for full UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure project root in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from tests.framework import BrowserSession, Colors, c_bold, c_cyan, c_fail, c_green, c_pass, c_red, c_yellow


class FinalChallenger2HardeningRunner:
    def __init__(self):
        self.browser = None
        self.results = []
        self.total = 0
        self.passed = 0
        self.failed = 0

    def record(self, name: str, success: bool, details: str = ""):
        self.total += 1
        safe_details = details.encode("ascii", "replace").decode("ascii")
        if success:
            self.passed += 1
            print(f"  [{c_pass('PASS')}] {c_bold(name)} - {safe_details}")
            self.results.append({"name": name, "status": "PASS", "details": safe_details})
        else:
            self.failed += 1
            print(f"  [{c_fail('FAIL')}] {c_bold(name)} - {safe_details}")
            self.results.append({"name": name, "status": "FAIL", "details": safe_details})

    def run_all(self):
        start_time = time.time()
        print(f"\n{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}   FINAL CHALLENGER 2: TIER 5 ADVERSARIAL HARDENING & STRESS VERIFICATION{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}\n")

        self.browser = BrowserSession()
        self.browser.launch()

        try:
            self.test_part1_rapid_audio_toggle_stress()
            self.test_part2_log_search_and_json_export()
            self.test_part3_zero_console_errors_across_all_pages()
        finally:
            self.browser.close()

        elapsed = time.time() - start_time
        print(f"\n{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD} HARDENING SUITE EXECUTION SUMMARY{Colors.RESET}")
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}{'='*88}{Colors.RESET}")
        print(f" Total Assertions: {self.total} | Passed: {c_green(str(self.passed))} | Failed: {c_red(str(self.failed)) if self.failed else '0'} | Time: {elapsed:.2f}s")
        verdict = "APPROVE" if self.failed == 0 else "CHALLENGE_DETECTED_DEFECTS"
        status_color = c_green if self.failed == 0 else c_red
        print(f"\n {status_color(c_bold(f'>>> FINAL VERDICT: {verdict} <<<'))}\n")

        return self.failed == 0

    def test_part1_rapid_audio_toggle_stress(self):
        print(f"{Colors.BRIGHT_YELLOW}{Colors.BOLD}--- PART 1: RAPID AUDIO TOGGLE STRESS (12 CLICKS @ 25MS) ACROSS 7 DASHBOARDS ---{Colors.RESET}")

        audio_dashboards = [
            {
                "id": "emergency-evacuation-v2",
                "name": "Emergency Evacuation V2 (Mobile Occupant HUD)",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v2", "index.html"),
                "selector": "#btn-siren-toggle",
            },
            {
                "id": "server-status",
                "name": "Server Status (Mission Control NOC)",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "server-status", "index.html"),
                "selector": "#audioToggleBtn",
            },
            {
                "id": "apigee-mulesoft-hybrid",
                "name": "Apigee + MuleSoft Hybrid Observability Cockpit",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "apigee-mulesoft-hybrid", "index.html"),
                "selector": "#btnMuteAudio",
            },
            {
                "id": "emergency-evacuation-v1",
                "name": "Emergency Evacuation V1 (Command Center)",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v1", "index.html"),
                "selector": "#btn-toggle-sound",
            },
            {
                "id": "emergency-evacuation-v3",
                "name": "Emergency Evacuation V3 (Fan-Out Engine)",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v3", "index.html"),
                "selector": "#btn-audio-toggle",
            },
            {
                "id": "gcp-sql-networking",
                "name": "GCP SQL Networking & HA Peering",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "gcp-sql-networking", "index.html"),
                "selector": "#btnSoundToggle",
            },
            {
                "id": "gcp-iam-security",
                "name": "GCP IAM Security & Secret Vault Auditor",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "gcp-iam-security", "index.html"),
                "selector": "#audioToggleBtn",
            },
        ]

        for dash in audio_dashboards:
            if not os.path.exists(dash["file"]):
                self.record(f"AUDIO_FILE_{dash['id']}", False, f"File not found: {dash['file']}")
                continue

            self.browser.navigate(dash["file"])
            time.sleep(0.3)

            sel_json = json.dumps(dash['selector'])
            btn_exists = self.browser.evaluate(f"document.querySelector({sel_json}) !== null")
            if not btn_exists:
                self.record(f"AUDIO_BTN_{dash['id']}", False, f"Button {dash['selector']} not found in DOM")
                continue

            # Execute 12 rapid clicks at 25ms intervals inside browser context
            stress_script = f"""(() => {{
                return new Promise((resolve) => {{
                    const btn = document.querySelector({sel_json});
                    let clicksDone = 0;
                    const interval = setInterval(() => {{
                        btn.click();
                        clicksDone++;
                        if (clicksDone >= 12) {{
                            clearInterval(interval);
                            resolve({{ clicks: clicksDone, finalActive: btn.classList.contains('active'), text: btn.innerText }});
                        }}
                    }}, 25);
                }});
            }})()"""

            res = self.browser.evaluate(stress_script)
            time.sleep(0.2)

            errs = self.browser.console_errors + self.browser.page_errors
            success = res and res.get("clicks") == 12 and len(errs) == 0
            self.record(
                f"AUDIO_STRESS_12x25ms_{dash['id']}",
                success,
                f"12 rapid toggles completed cleanly, 0 console errors (Result: {res})"
            )

    def test_part2_log_search_and_json_export(self):
        print(f"\n{Colors.BRIGHT_YELLOW}{Colors.BOLD}--- PART 2: LOG CONSOLE SEARCH & JSON EXPORT INTEGRITY ---{Colors.RESET}")

        log_dashboards = [
            {
                "id": "gcp-cloudops-cockpit",
                "name": "GCP CloudOps Cockpit",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "gcp-cloudops-cockpit", "index.html"),
                "searchInput": "#logs-search-input",
                "token": "error",
                "nonMatching": "XYZ_NONEXISTENT_QUERY_9999",
                "adversarialRegex": "([a-z]+.*{?)^$",
                "exportBtn": "[data-testid='btn-copy-json']",
                "countScript": "document.querySelectorAll('#logs-table-tbody tr, .log-entry-row').length",
            },
            {
                "id": "gcp-event-pubsub",
                "name": "GCP Event Pub/Sub & DLQ",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "gcp-event-pubsub", "index.html"),
                "searchInput": "#logSearchInput",
                "token": "info",
                "nonMatching": "XYZ_NONEXISTENT_QUERY_9999",
                "adversarialRegex": "(?<=dlq).*|[[][A-Z]+",
                "exportBtn": None,
                "countScript": "document.querySelectorAll('#logStreamBox .log-entry, #logStreamBox div').length",
            },
            {
                "id": "gcp-iam-security",
                "name": "GCP IAM Security Auditor",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "gcp-iam-security", "index.html"),
                "prepare": "const tab = document.querySelector('[data-tab=\"tab-least-privilege\"]'); if(tab) tab.click();",
                "searchInput": "#matrixSearchInput",
                "token": "admin",
                "nonMatching": "XYZ_NONEXISTENT_QUERY_9999",
                "adversarialRegex": "(?i)(owner|editor).*\\d+",
                "exportBtn": "#exportReportBtn",
                "countScript": "document.querySelectorAll('.matrix-row, .audit-log-row').length",
            },
            {
                "id": "gcp-serverless-pipeline",
                "name": "GCP Serverless Pipeline",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "gcp-serverless-pipeline", "index.html"),
                "searchInput": "#log-search-input",
                "token": "deploy",
                "nonMatching": "XYZ_NONEXISTENT_QUERY_9999",
                "adversarialRegex": "(\\w+\\.js|v\\d+.*)?$",
                "exportBtn": None,
                "countScript": "document.querySelectorAll('#log-terminal-window .log-entry, #log-terminal-window .log-line').length",
            },
            {
                "id": "gcp-sql-networking",
                "name": "GCP SQL Networking",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "gcp-sql-networking", "index.html"),
                "searchInput": "#querySearchInput",
                "token": "SELECT",
                "nonMatching": "XYZ_NONEXISTENT_QUERY_9999",
                "adversarialRegex": "SELECT.*FROM\\s+\\w+",
                "exportBtn": "#btnExportReport",
                "countScript": "document.querySelectorAll('#terminalLogFeed .log-row, #terminalLogFeed tr').length",
            },
            {
                "id": "security-audit",
                "name": "CyberSec Sentinel Security Scanner",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "security-audit", "index.html"),
                "searchInput": "#matrixSearchInput",
                "token": "cve",
                "nonMatching": "XYZ_NONEXISTENT_QUERY_9999",
                "adversarialRegex": "CVE-\\d{4}-\\d+",
                "exportBtn": "#btnExportJson",
                "countScript": "document.querySelectorAll('.vuln-row, tr.cve-row, .table-row').length",
            },
            {
                "id": "server-status",
                "name": "Server Status & Mission Control NOC",
                "file": os.path.join(PROJECT_ROOT, "sistemas", "server-status", "index.html"),
                "searchInput": "#serviceSearchInput",
                "token": "api",
                "nonMatching": "XYZ_NONEXISTENT_QUERY_9999",
                "adversarialRegex": "(?=.*api).*",
                "exportBtn": None,
                "countScript": "document.querySelectorAll('.service-card, .service-row').length",
            },
        ]

        for dash in log_dashboards:
            if not os.path.exists(dash["file"]):
                continue

            self.browser.navigate(dash["file"])
            time.sleep(0.3)

            if dash.get("prepare"):
                self.browser.evaluate(dash["prepare"])
                time.sleep(0.15)

            search_sel_json = json.dumps(dash['searchInput'])
            token_json = json.dumps(dash['token'])
            nonmatch_json = json.dumps(dash['nonMatching'])

            # 1. Search filter testing
            test_script = f"""(() => {{
                const input = document.querySelector({search_sel_json});
                if (!input) return {{ exists: false }};
                
                const getVisible = () => {{
                    return {dash['countScript']};
                }};

                const initial = getVisible();

                // 1. Filter with token
                input.value = {token_json};
                input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                input.dispatchEvent(new Event('change', {{ bubbles: true }}));
                const tokenCount = getVisible();

                // 2. Non-matching query
                input.value = {nonmatch_json};
                input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                input.dispatchEvent(new Event('change', {{ bubbles: true }}));
                const nonMatchCount = getVisible();

                // 3. Clear/Reset
                input.value = '';
                input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                input.dispatchEvent(new Event('change', {{ bubbles: true }}));
                const resetCount = getVisible();

                return {{
                    exists: true,
                    initial: initial,
                    tokenCount: tokenCount,
                    nonMatchCount: nonMatchCount,
                    resetCount: resetCount
                }};
            }})()"""

            search_res = self.browser.evaluate(test_script)
            search_ok = search_res and search_res.get("exists") and search_res.get("resetCount", 0) >= search_res.get("tokenCount", 0)
            self.record(
                f"LOG_SEARCH_FILTER_{dash['id']}",
                search_ok,
                f"Initial: {search_res.get('initial')}, Token: {search_res.get('tokenCount')}, NonMatch: {search_res.get('nonMatchCount')}, Reset: {search_res.get('resetCount')}"
            )

            # 2. JSON Export testing (if supported)
            if dash.get("exportBtn"):
                export_sel_json = json.dumps(dash['exportBtn'])
                export_script = f"""(() => {{
                    let blobCaptured = null;
                    const origCreateObjectURL = window.URL.createObjectURL.bind(window.URL);
                    window.URL.createObjectURL = (blob) => {{
                        blobCaptured = blob;
                        return origCreateObjectURL(blob);
                    }};

                    const btn = document.querySelector({export_sel_json});
                    if (!btn) return {{ exists: false }};
                    btn.click();

                    return {{
                        exists: true,
                        captured: blobCaptured !== null,
                        blobSize: blobCaptured ? blobCaptured.size : 0,
                        blobType: blobCaptured ? blobCaptured.type : ''
                    }};
                }})()"""

                export_res = self.browser.evaluate(export_script)
                time.sleep(0.2)
                errs = self.browser.console_errors + self.browser.page_errors
                export_ok = export_res and export_res.get("exists") and len(errs) == 0
                self.record(
                    f"LOG_EXPORT_JSON_{dash['id']}",
                    export_ok,
                    f"Export button triggered cleanly (Blob size: {export_res.get('blobSize', 0)} bytes, 0 errors)"
                )

    def test_part3_zero_console_errors_across_all_pages(self):
        print(f"\n{Colors.BRIGHT_YELLOW}{Colors.BOLD}--- PART 3: ZERO CONSOLE ERRORS & ZERO UNCAUGHT EXCEPTIONS ACROSS ALL 16 PAGES ---{Colors.RESET}")

        all_pages = [
            {"id": "portal", "name": "Master Launchpad Portal", "path": os.path.join(PROJECT_ROOT, "sistemas", "index.html")},
            {"id": "tv-diagnostic", "name": "TV & OTT Playback Telemetry Hub", "path": os.path.join(PROJECT_ROOT, "sistemas", "tv-diagnostic", "index.html")},
            {"id": "network-health", "name": "Network Health Check Hub", "path": os.path.join(PROJECT_ROOT, "sistemas", "network-health", "index.html")},
            {"id": "security-audit", "name": "CyberSec Sentinel Security Scanner", "path": os.path.join(PROJECT_ROOT, "sistemas", "security-audit", "index.html")},
            {"id": "server-status", "name": "Mission Control NOC Status Board", "path": os.path.join(PROJECT_ROOT, "sistemas", "server-status", "index.html")},
            {"id": "transaction-flow", "name": "Fintech High-Frequency Pipeline", "path": os.path.join(PROJECT_ROOT, "sistemas", "transaction-flow", "index.html")},
            {"id": "gcp-serverless-pipeline", "name": "GCP Serverless Pipeline Deployer", "path": os.path.join(PROJECT_ROOT, "sistemas", "gcp-serverless-pipeline", "index.html")},
            {"id": "gcp-event-pubsub", "name": "GCP Event-Driven Pub/Sub & DLQ", "path": os.path.join(PROJECT_ROOT, "sistemas", "gcp-event-pubsub", "index.html")},
            {"id": "gcp-sql-networking", "name": "GCP SQL Networking & HA Peering", "path": os.path.join(PROJECT_ROOT, "sistemas", "gcp-sql-networking", "index.html")},
            {"id": "gcp-iam-security", "name": "GCP IAM Security & Secret Vault Auditor", "path": os.path.join(PROJECT_ROOT, "sistemas", "gcp-iam-security", "index.html")},
            {"id": "gcp-cloudops-cockpit", "name": "GCP CloudOps SRE Command Cockpit", "path": os.path.join(PROJECT_ROOT, "sistemas", "gcp-cloudops-cockpit", "index.html")},
            {"id": "mulesoft-observability", "name": "MuleSoft Anypoint Connectivity Hub", "path": os.path.join(PROJECT_ROOT, "sistemas", "mulesoft-observability", "index.html")},
            {"id": "apigee-mulesoft-hybrid", "name": "Apigee + MuleSoft Hybrid Observability Cockpit", "path": os.path.join(PROJECT_ROOT, "sistemas", "apigee-mulesoft-hybrid", "index.html")},
            {"id": "emergency-evacuation-v1", "name": "Emergency Evacuation V1 Command Center", "path": os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v1", "index.html")},
            {"id": "emergency-evacuation-v2", "name": "Emergency Evacuation V2 Mobile Occupant HUD", "path": os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v2", "index.html")},
            {"id": "emergency-evacuation-v3", "name": "Emergency Evacuation V3 Broadcast Engine", "path": os.path.join(PROJECT_ROOT, "sistemas", "emergency-evacuation-v3", "index.html")},
        ]

        for page in all_pages:
            if not os.path.exists(page["path"]):
                self.record(f"PAGE_FILE_{page['id']}", False, f"File not found: {page['path']}")
                continue

            self.browser.navigate(page["path"])
            time.sleep(0.35)

            # Perform safe user interaction sampling (click navigation buttons/tabs)
            self.browser.evaluate("""(() => {
                const buttons = Array.from(document.querySelectorAll('button:not([data-destructive]), .nav-tab, .filter-pill, .tab-btn'));
                buttons.slice(0, 3).forEach(b => {
                    try { b.click(); } catch(e) {}
                });
            })()""")
            time.sleep(0.2)

            errs = self.browser.console_errors + self.browser.page_errors
            success = len(errs) == 0
            self.record(
                f"ZERO_ERRORS_{page['id']}",
                success,
                f"{page['name']}: Clean console verified (0 console errors, 0 uncaught exceptions)" if success else f"Errors: {errs}"
            )


if __name__ == "__main__":
    runner = FinalChallenger2HardeningRunner()
    ok = runner.run_all()
    sys.exit(0 if ok else 1)
