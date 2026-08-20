## 2026-08-19T23:33:11Z

You are worker_transaction.
Your working directory is: c:\DevWork\Depredador\Flujoweb\.agents\worker_transaction\
You exclusively own and must implement: c:\DevWork\Depredador\Flujoweb\sistemas\transaction-flow\index.html

You must read the original requirements at:
c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md
and the architectural specification at:
c:\DevWork\Depredador\Flujoweb\.agents\explorer_transaction\survey.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implementation Requirements for c:\DevWork\Depredador\Flujoweb\sistemas\transaction-flow\index.html:
1. Self-contained single-file HTML5 application (inline CSS, embedded SVGs/Canvas, pure ES6+ JS, zero build steps, zero external CDN dependencies).
2. Fintech Luxury Cyberpunk theme (Neon Gold #f59e0b / #eab308, Emerald #10b981, Cyber Crimson #ef4444) on dark base (#030812 / #060d1b), Inter + Cascadia/Fira Code fonts.
3. 6 Main Nodes & Branching Pipeline State Machine:
   - Node 1: 📝 Order Capture & Payload Hashing (SHA-256 integrity, nonce generation)
   - Node 2: 🔍 Luhn & Card Tokenization (PCI-DSS token vault, bin lookup)
   - Node 3: 🛡️ Real-Time Fraud ML Scoring (Dynamic risk vector, feature evaluation. Bifurcation: Score > 85 triggers Fraud Reject Branch)
   - Node 4: 🏦 Bank Issuer 3D-Secure Auth (Biometric/OTP challenge. Bifurcation: Insufficient Funds / Decline Branch)
   - Node 5: ⚙️ Liquidity & Clearing Network (ACH/SEPA/SWIFT routing, FX conversion)
   - Node 6: ✅ Ledger Settlement & Receipt Seal (Immutable cryptographic block seal, balance update)
   - Permanent luminous emoji icons with glow effects across all states.
   - Dynamic animated connection tracks between nodes that illuminate as transactions flow and fade to subtle ambient tracks upon completion.
4. Interactive Scenarios & Flow Controls:
   - Scenario Selector:
     * "Success (Normal Settlement)" — Happy path nodes 1-6 complete green.
     * "Fraud Triggered (Blocked)" — Bifurcates at Node 3 into Red Fraud Alert quarantine node.
     * "Insufficient Funds (Declined)" — Bifurcates at Node 4 into Amber Issuer Decline node.
     * "Network Timeout (Retry Flow)" — Demonstrates exponential backoff retry at Node 5 before fallback.
   - Step-by-step interactive manual mode, continuous auto-stream mode, and speed slider (0.5x, 1x, 2x, 5x).
5. High-Precision 30-Second TTL Countdown Timer:
   - Microsecond precision (`ss.mmm`) animated timer active during pipeline execution.
6. Animated Ledger & Dynamic Risk Radar:
   - Dynamic currency counter displaying transaction volume, settled amount, rolling reserve, and gas/clearing fees.
   - Interactive HTML5 Canvas / SVG dynamic Risk Radar chart visualizing multidimensional fraud vectors (Geo-IP anomaly, Device fingerprint, Velocity, Amount z-score, Merchant risk).
7. Interactive "Reversar Transacción / Chargeback" Engine:
   - "Reversar Transacción" button triggers an animated reverse rollback sequence through the pipeline nodes, crediting the customer ledger, decrementing merchant balance, and generating a Cryptographic Reversal Receipt.
8. Live ISO-8583 & JSON Payload Inspector:
   - Tabbed / split inspector showing live financial payloads (ISO-8583 bitmap fields MTI 0100/0200/0210 and modern REST JSON payloads) updating in real-time as the transaction progresses through each node.
9. Quality:
   - Fully responsive (400px to 4K).
   - Zero console errors / warnings. High-framerate 60fps animations.
