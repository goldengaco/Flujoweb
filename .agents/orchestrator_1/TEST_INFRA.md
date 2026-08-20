# Test Infrastructure & E2E Verification Methodology

**Document ID**: TEST-INFRA-FLUJOWEB-2026  
**Architect**: `test_writer` (E2E Test Architect)  
**Target Systems**:
1. `sistemas/security-audit/index.html` (R1: Defensive Security Audit & Vulnerability Scanner)
2. `sistemas/server-status/index.html` (R2: Mission Control NOC & Multi-Service Status Board)
3. `sistemas/transaction-flow/index.html` (R3: High-Frequency Transaction & Settlement Pipeline)

---

## 1. Test Philosophy & Architectural Principles

### 1.1 Zero-Dependency Native Chromium/Edge CDP Engine
To guarantee 100% reproducible, ultra-fast, and standalone execution in any developer or CI environment without heavy npm installations or flaky webdrivers, the testing framework utilizes a **Native Chrome DevTools Protocol (CDP)** test engine built on Node.js 24's native `WebSocket` and `fetch` APIs.
- **Direct Engine Integration**: Spawns local headless Chromium or Microsoft Edge (`msedge.exe` / `chrome.exe`).
- **Precision Event Dispatch**: Communicates over low-latency JSON-RPC 2.0 WebSockets directly to the browser runtime.
- **Deep Runtime Introspection**: Hooks directly into `Runtime.consoleAPICalled`, `Runtime.exceptionThrown`, `DOM.getDocument`, `Emulation.setDeviceMetricsOverride`, and CSS computed style trees.
- **True Engine Fidelity**: Executes real JavaScript engines (V8), Canvas 2D contexts, SVG rasterization, CSS keyframe animations, and DOM reflows.

### 1.2 Zero Facade Tests Policy
Every test case must assert observable, non-trivial behavior:
- Tests must inspect the actual DOM tree, element styles, SVG geometries, attribute mutations, and computed color/box-shadow values.
- Tests must evaluate asynchronous state transitions over real time, simulating user clicks, form submissions, filter changes, and chaos injections.
- Mocking or stubbing internal business logic is strictly prohibited — all tests run against the live single-file HTML5/CSS3/JS dashboards.

### 1.3 Strict Failure Criteria
- **Zero Console Error Tolerance**: Any uncaught exception (`window.onerror`, unhandled promise rejection) or `console.error` call immediately fails the test run.
- **Permanent Icon & Emoji Visibility**: Emojis (🔒, 🛡️, 🌐, 💉, 📜, 🔑, 📋, 🌍, ⚡, 🐘, 💳, 📦, 📧, 📝, 🔍, 🏦, ✅) must remain visible across all states (`pending`, `active`, `done`, `warning`, `critical`, `patched`, `reversing`, `settled`) and never get stripped or replaced by empty boxes or generic ASCII ticks.
- **Responsive Layout Compliance**: All 3 dashboards must render without horizontal overflow (`scrollWidth <= clientWidth`) and maintain full interactive capability at:
  - Mobile: `375px × 667px`
  - Tablet: `768px × 1024px`
  - Desktop: `1440px × 900px`

---

## 2. The 4-Tier Test Methodology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     TIER 4: REAL-WORLD SCENARIOS                        │
│   Full End-to-End Lifecycles (Scan->Patch->Audit, Chaos->Heal, Tx Flow) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────┴────────────────────────────────────┐
│                  TIER 3: CROSS-FEATURE COMBINATIONS                     │
│    Pairwise Interactions, Rapid State Switching, Concurrent Operations  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────┴────────────────────────────────────┐
│                 TIER 2: BOUNDARY & CORNER CASES                         │
│  Extreme Numeric Limits, Rapid Double-Clicks, Zero-States, Clock Drifts │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────┴────────────────────────────────────┐
│                    TIER 1: FEATURE COVERAGE MATRIX                      │
│     >=5 Exhaustive Tests Per Feature (All 16 PROJECT.md Features)       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tier 1: Feature Coverage (>=5 Tests Per Feature)
Systematically validates that every single feature from the `PROJECT.md` Feature Inventory is present, functioning according to specification, and exposing expected telemetry data models.

### Tier 2: Boundary & Corner Cases (>=5 Tests Per Feature)
Subjects each feature to stress and edge conditions:
- Rapid button spamming (debounce protection).
- Empty, special-character, or extreme search query inputs.
- Minimum (0) and maximum (100, 999999) numeric values.
- Window resizing during active animation cycles.
- Background clock drift / microsecond timestamp jitter.

### Tier 3: Cross-Feature Combinations
Tests complex interactions between distinct system modules:
- Filtering vulnerability tables while an active scan is progressing.
- Simulating a patch while the deep inspection drawer is open.
- Triggering Chaos Injection while terminal logs are streaming at high frequency.
- Switching transaction scenarios while a 30s TTL countdown is in flight.
- Opening ISO-8583 payload inspector during a live card decline bifurcation.

### Tier 4: Real-World Scenarios
Executes multi-step, real-world operational user journeys:
1. **Scenario R1-A (Full Security Hardening Lifecycle)**:
   - Load dashboard in `STANDBY` -> Click "Iniciar Auditoría" -> Verify 7-stage sequential scan -> Assert baseline score `42/100 (Grade F)` -> Open telemetry drawer for SQL Injection (`sqli_audit`) and CORS (`cors_audit`) -> Inspect CVEs -> Sequentially apply all 7 patches -> Verify dynamic score climbs to `100/100 (Grade A+)` -> Export JSON report and validate compliance structure.
2. **Scenario R2-B (Critical NOC Outage & Auto-Healing Sequence)**:
   - Monitor 9-service baseline telemetry -> Select `PostgreSQL 16 HA` -> Click "Inject Chaos" -> Assert service status flips to `CRITICAL / OUTAGE` -> Verify alert banner and ANSI terminal incident logs -> Observe auto-remediation playbook trigger -> Verify gradual latency/error rate recovery -> Confirm restored `OPERATIONAL` state.
3. **Scenario R3-C (End-to-End Fintech Pipeline & Reversal)**:
   - **Path 1 (Happy Settlement & Rollback)**: Run Normal Transaction ($1,250.00) -> 6-node progression -> verify Receipt Seal -> Click "Reversar Transacción" -> verify reverse particle track -> verify refund receipt & balance adjustment.
   - **Path 2 (ML Fraud Quarantine)**: Select Fraud Scenario -> observe ML Risk Score >85 -> confirm bifurcation at Node 3 into Red Quarantine Node -> verify nodes 4-6 aborted.
   - **Path 3 (Issuer Card Decline)**: Select Insufficient Funds -> confirm bifurcation at Node 4 with Decline Code 51.

---

## 3. Comprehensive Feature Matrix (16 Features)

| Feature # | Feature Name | Target Dashboard | Tier 1 Tests | Tier 2 Tests | Tier 3 Tests | Tier 4 Scenarios | Total Tests |
|---|---|---|---|---|---|---|---|
| **F01** | 7-Node Security Stepper | `security-audit` | 6 | 5 | 3 | 2 | **16** |
| **F02** | Telemetry Drawer & CVEs | `security-audit` | 5 | 5 | 3 | 2 | **15** |
| **F03** | Dynamic Circular Score Gauge | `security-audit` | 5 | 5 | 3 | 2 | **15** |
| **F04** | Vulnerability Matrix & Patching | `security-audit` | 6 | 5 | 4 | 2 | **17** |
| **F05** | JSON Export & Summary Modal | `security-audit` | 5 | 5 | 2 | 2 | **14** |
| **F06** | 9-Service Mesh NOC Grid | `server-status` | 6 | 5 | 3 | 2 | **16** |
| **F07** | Per-Service Telemetry & Sparklines | `server-status` | 5 | 5 | 3 | 2 | **15** |
| **F08** | 90-Day SLA Uptime Bar | `server-status` | 5 | 5 | 3 | 2 | **15** |
| **F09** | Chaos Injection & Auto-Healing | `server-status` | 6 | 5 | 4 | 2 | **17** |
| **F10** | ANSI Live Terminal Console | `server-status` | 5 | 5 | 3 | 2 | **15** |
| **F11** | 6-Node Branching Pipeline | `transaction-flow` | 6 | 5 | 3 | 2 | **16** |
| **F12** | Scenario Selector & Bifurcations | `transaction-flow` | 6 | 5 | 4 | 2 | **17** |
| **F13** | 30s TTL Microsecond Timer | `transaction-flow` | 5 | 5 | 3 | 2 | **15** |
| **F14** | Dynamic Ledger & Risk Radar | `transaction-flow` | 5 | 5 | 3 | 2 | **15** |
| **F15** | Reversal & Chargeback Flow | `transaction-flow` | 5 | 5 | 3 | 2 | **15** |
| **F16** | ISO-8583 / JSON Inspector | `transaction-flow` | 5 | 5 | 3 | 2 | **15** |
| **VIS** | Viewport & Visual Integrity | All 3 Dashboards | 6 | 6 | 4 | 3 | **19** |
| **TOTAL** | | | **86** | **81** | **47** | **33** | **247** |

---

## 4. Test Suite Architecture & Directory Layout

```
c:\DevWork\Depredador\Flujoweb\
├── tests\
│   ├── runner.js                      # Core Native CDP Chrome/Edge test harness
│   ├── fixtures\
│   │   ├── helpers.js                 # DOM selector, assertion, style, and sleep helpers
│   │   └── mock_data.js               # Expected data fixtures, CVE schemas, ISO payloads
│   ├── tier1_features\
│   │   ├── test_security_features.js  # Features 1 - 5 coverage suite
│   │   ├── test_server_features.js    # Features 6 - 10 coverage suite
│   │   └── test_transaction_features.js # Features 11 - 16 coverage suite
│   ├── tier2_boundaries\
│   │   ├── test_security_boundaries.js
│   │   ├── test_server_boundaries.js
│   │   └── test_transaction_boundaries.js
│   ├── tier3_combinations\
│   │   ├── test_security_combinations.js
│   │   ├── test_server_combinations.js
│   │   └── test_transaction_combinations.js
│   ├── tier4_scenarios\
│   │   ├── test_security_scenarios.js
│   │   ├── test_server_scenarios.js
│   │   └── test_transaction_scenarios.js
│   ├── visual_responsiveness\
│   │   └── test_visual_and_responsiveness.js # Mobile 375px, Tablet 768px, Desktop 1440px, Glow
│   └── run_all.js                     # Master test runner with colorized output & reporting
└── .agents\
    ├── orchestrator_1\
    │   ├── TEST_INFRA.md              # This specification
    │   └── TEST_READY.md              # Test execution results and compliance report
    └── test_writer\
        ├── BRIEFING.md
        ├── progress.md
        └── handoff.md
```

---

## 5. Test Execution Commands

### 5.1 Run Full Comprehensive E2E Suite
```bash
node tests/run_all.js
```

### 5.2 Run Specific Tiers
```bash
node tests/run_all.js --tier=1      # Run Tier 1 Feature Coverage
node tests/run_all.js --tier=2      # Run Tier 2 Boundaries
node tests/run_all.js --tier=3      # Run Tier 3 Combinations
node tests/run_all.js --tier=4      # Run Tier 4 Real-World Scenarios
node tests/run_all.js --tier=visual # Run Visual & Responsive Viewport Suite
```

### 5.3 Run Specific Dashboard Target
```bash
node tests/run_all.js --target=security     # Test Security Audit only
node tests/run_all.js --target=server       # Test Server Status only
node tests/run_all.js --target=transaction  # Test Transaction Flow only
```

### 5.4 Command Line Options
- `--browser=chrome|edge` — Select browser executable (defaults to auto-detect).
- `--headless=true|false` — Toggle headless mode (default: `true`).
- `--verbose` — Print full trace logs and DOM snapshots.
- `--output=json` — Output test summary in structured JSON format.

---

## 6. Continuous Verification & Audit Standards

1. **Deterministic Assertions**: All tests wait for specific DOM state transitions (using polling loops with safety timeouts) rather than arbitrary hardcoded sleep delays.
2. **State Isolation**: Every test either refreshes the page or invokes an isolated session to prevent cascading state pollution.
3. **Artifact Recording**: Any failing assertion captures the full DOM innerHTML, console error logs, and computed element styles for immediate developer debugging.
