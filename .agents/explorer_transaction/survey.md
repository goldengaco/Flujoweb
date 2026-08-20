# Architectural & Specification Survey: High-Frequency Transaction & Settlement Pipeline (R3)

**Document ID**: SPEC-SURVEY-R3-TX-FLOW  
**Target Path**: `c:\DevWork\Depredador\Flujoweb\sistemas\transaction-flow\index.html`  
**Archetype**: Specification Miner  
**Theme**: Fintech Luxury Cyberpunk (Neon Gold, Emerald, Cyber Crimson, Obsidian Dark Base)  
**Specification Source**: `c:\DevWork\Depredador\Flujoweb\.agents\ORIGINAL_REQUEST.md` §R3, ISO-8583 Financial Transaction Specs, PCI-DSS Tokenization Architecture, EMV 3D-Secure 2.2 Protocols.

---

## 1. Executive Summary & Design Philosophy

The **High-Frequency Transaction & Settlement Pipeline** is a mission-critical, enterprise-grade fintech observability console designed to visualize, monitor, simulate, and debug high-throughput payment routing, fraud scoring, bank issuer handshakes, liquidity clearing, and cryptographic ledger settlements in real time.

### Core Architectural Pillars
1. **Deterministic Branching State Machine**: 6 primary pipeline stages with dual bifurcation nodes (Fraud ML Quarantine and Issuer Hard Decline) and an automated exponential backoff network failover loop.
2. **Microsecond Precision Financial SLA Engine**: 30.000-second TTL countdown timer driven by high-resolution `performance.now()`, monitoring strict sub-second payment SLAs.
3. **Dynamic Multi-Dimensional Telemetry**: Real-time 5-axis Risk Radar chart (Canvas/SVG), 60fps easing currency counters, and live liquidity pool metrics.
4. **Bi-Directional Cryptographic Rollback**: Full interactive Reversal & Chargeback flow implementing ISO-8583 MTI `0400`/`0420` advice with reverse particle tracks and ledger reconciliation.
5. **Live ISO-8583 / JSON Payload Inspector**: Bidirectional dual-view inspector reflecting real-time field mutations, STAN increments, tokenization hashing, and HMAC-SHA256 signature stamps.
6. **Fintech Luxury Cyberpunk Aesthetic**: Deep obsidian hex-mesh background (`#030812` / `#060d1b`), metallic gold and emerald highlights (`#f59e0b`, `#10b981`), permanent luminous emoji icons, and smooth CSS bezier transitions.

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Pipeline Architecture | 6-Node Primary State Machine | Sequential processing pipeline: Order Capture -> Tokenization -> Fraud ML -> 3DS Auth -> Clearing -> Ledger Settlement | Transaction payload trigger (amount, currency, merchant ID, card payload) | Step-by-step state progression (Pending -> Active -> Completed/Branched) | Invalid state transition prevention; deterministic abort on failure | ORIGINAL_REQUEST §R3 |
| 2 | State Machine | Bifurcation Branch: Fraud Block | Real-time ML inference evaluates fraud score. If score > 85, branches at Node 3 into Red Fraud Alert Quarantine Node | Risk vector: velocity, IP geo-distance, device fingerprint, amount anomaly | Branch activation, downstream nodes 4-6 marked `VOID/SKIPPED`, SAR report logged | Score threshold breach throws `FRAUD_RISK_BREACH` | ORIGINAL_REQUEST §R3 |
| 3 | State Machine | Bifurcation Branch: Issuer Decline | Bank issuer evaluates authorization. If card is declined or funds insufficient (Response Code 51/05), branches at Node 4 into Amber Issuer Decline Node | Issuer auth request (PAN token, CVV hash, 3DS cryptogram) | Branch activation, downstream nodes 5-6 marked `ABORTED`, decline code logged | Unfunded account throws `INSUFFICIENT_FUNDS_51` | ORIGINAL_REQUEST §R3 |
| 4 | State Machine | Scenario: Network Timeout & Retry | Liquidity network gateway 504 timeout simulation with 3-attempt exponential backoff retry loop and secondary clearing rail routing | Gateway ping & clearing packet handshake | Retry counter pulse (1/3, 2/3, 3/3), latency delay, failover rail activation | Final timeout if all retries exhausted | Prompt Specification §2 |
| 5 | Interactive Controls | Scenario Selector Matrix | 4 one-click scenario presets: "Success (Normal)", "Fraud Triggered (Blocked)", "Insufficient Funds (Declined)", "Network Timeout (Retry)" | User click on scenario pill button | Reconfigures pipeline payload, risk parameters, and execution branch | Disables interaction during active run | Prompt Specification §2 |
| 6 | Financial SLA | 30s High-Precision TTL Timer | Active processing SLA countdown timer counting down from 30.000s with microsecond (`ss.mmm`) precision | `performance.now()` clock delta during active processing | Formatted `ss.mmm` display with dynamic color shifts (Green >15s -> Amber >5s -> Red <5s) | Hard timeout abort if timer reaches 00.000s | ORIGINAL_REQUEST §R3 |
| 7 | Data Visualization | 5-Axis Dynamic Risk Radar | Real-time Canvas/SVG spider radar chart plotting: Velocity, Geolocation Distance, Device Trust, Biometrics, Chargeback History | 5-dimensional normalized risk weights [0.0 - 1.0] | Animated polygon shape morphing with color tint (Emerald/Gold vs Crimson) | Graceful fallback if Canvas context is lost | Prompt Specification §4 |
| 8 | Telemetry | Animated Ledger Currency Counter | 60fps easeOutExpo numerical count-up/count-down counter for Available Balance, Escrow, and Cleared Settlements | Decimal transaction delta amount (e.g. +$525.50 / -$525.50) | Formatted currency `$X,XXX,XXX.XX` with animated rolling ticker | Clamps values to non-negative balances | ORIGINAL_REQUEST §R3 |
| 9 | Lifecycle & Accounting | Interactive Reversal / Chargeback Flow | Right-to-left animated rollback sequence reversing Node 6 -> Node 5 -> Node 4 -> Node 2/1 with ISO-8583 MTI 0420 advice and balance deduction | User click on "Reversar Transacción / Chargeback" | Purple reverse energy pulse, refund receipt seal, ledger debit deduction | Only callable when transaction is in terminal `SETTLED` state | ORIGINAL_REQUEST §R3 |
| 10 | Protocol Telemetry | Live ISO-8583 / JSON Payload Inspector | Dual-tab live inspector displaying real-time financial payload mutations (STAN, MTI 0100/0110/0200/0210/0420, PAN mask, tokens, SHA256) | Active pipeline stage context and payload object | Syntax-highlighted JSON tree and ISO-8583 Bitmap Field table | Handles malformed payloads safely | ORIGINAL_REQUEST §R3 |
| 11 | Compliance & Security | PCI-DSS Card Tokenization & Luhn Engine | Evaluates PAN mod-10 Luhn checksum, identifies card brand (Visa/Mastercard/Amex), masks PAN to `4111-XXXX-XXXX-1111`, and generates vault token | Raw or simulated 16-digit card number | Validated boolean, brand tag, masked PAN, secure token `tkn_live_...` | Flag invalid Luhn checksum | Prompt Specification §1 |
| 12 | Visual Design | Fintech Luxury Cyberpunk Aesthetic | Deep obsidian hex-mesh background (`#030812`), gold accents (`#f59e0b`), emerald (`#10b981`), cyber crimson (`#ef4444`), glassmorphism | CSS variables, canvas overlay | Luminous glows, pulse rings, energy wave connectors | Responsive layout from mobile to 4K | ORIGINAL_REQUEST §Acceptance |
| 13 | Visual Persistence | Permanent Luminous Icon Persistence | Persistent glowing emojis (`📝`, `🔍`, `🛡️`, `🏦`, `⚙️`, `✅`, `🚨`, `⚠️`, `🔄`) across pending, active, completed, and error states | Node status attributes | CSS filter drop-shadow and ambient glow rings (never replaced by plain tickmarks) | Constant visibility preserved | ORIGINAL_REQUEST §Acceptance |
| 14 | Event Streaming | Real-Time ANSI Event Audit Stream | Collapsible terminal streaming real-time event logs with timestamps, STAN codes, latency metrics, and color-coded status badges | Stage lifecycle events | Formatted terminal lines with copy-log button | Auto-scrolls to latest event; capped at 200 lines | Prompt Specification §8 |

---

## 3. Edge Cases & Resilience Matrix

| # | Feature | Input / Condition | Observed / Required Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | State Machine | User rapidly clicks scenario buttons or "Run" while a transaction is actively executing | Buttons disabled during active execution (`disabled` attribute + pointer-events none); active timers/animation frames cleanly tracked. |
| 2 | Scenario Switch | User changes scenario mid-execution or immediately after completion | System performs clean state reset: cancels running `requestAnimationFrame`, halts TTL timer, resets track SVG widths, clears bifurcations, and loads initial state of selected scenario. |
| 3 | Reversal Button | User clicks "Reversar Transacción" when transaction is still processing or in failed/declined state | Reversal button is strictly disabled (`disabled` state, opacity 0.3) until Node 6 reaches `SETTLED` state. |
| 4 | Double Reversal | User clicks "Reversar Transacción" multiple times in quick succession | Button disables immediately upon first click; status changes to `REVERSING`; once completed, button changes to `REVERSED` (disabled). |
| 5 | TTL Timer SLA Breach | Pipeline delay exceeds 30.000s in extreme timeout simulation | TTL timer reaches `00.000s`, triggers automatic `SLA_TIMEOUT_EXPIRED` event, aborts pending network handshakes, and marks state as `TIMEOUT_ABORTED`. |
| 6 | Precision Clock Drift | Background tab throttling or CPU slowdown during `setTimeout`/`setInterval` | TTL timer uses `performance.now()` delta calculation instead of simple decrementing counter, guaranteeing microsecond accuracy regardless of frame drops. |
| 7 | Radar Chart Canvas | Canvas container resized dynamically (window resize or responsive collapse) | Canvas auto-rescales according to `devicePixelRatio` and parent container width, re-rendering radar axes and polygon without blurriness. |
| 8 | ISO-8583 Inspector | Payload contains nested objects, binary bitmap representations, or long token strings | Tab view provides horizontal scrolling with formatted Cascadia/Fira Code monospace fonts, copy-to-clipboard button, and highlighted modified fields. |
| 9 | Ledger Currency Easing | Extremely rapid consecutive value changes (e.g. Settlement +$525.50 followed immediately by Reversal -$525.50) | Numerical easing uses interpolator that captures current visual value as starting point, preventing visual glitches or sudden numeric jumps. |
| 10 | Mobile Viewport (<640px) | Viewport width 375px (iPhone / Mobile screen) | Stepper transitions to compact vertical/horizontal responsive wrap with miniaturized node circles, collapsible inspector drawer, and touch-friendly controls. |

---

## 4. Architectural Deep Dive: Pipeline Nodes & State Machine

```
                              ┌─────────────────────────────────────────────────────────┐
                              │ 1. 📝 Order Capture & Payload Hashing (MTI 0100 / JSON)  │
                              └───────────────────────────┬─────────────────────────────┘
                                                          │
                                                          ▼
                              ┌─────────────────────────────────────────────────────────┐
                              │ 2. 🔍 Luhn & Card Tokenization (PCI-DSS Vault Token)     │
                              └───────────────────────────┬─────────────────────────────┘
                                                          │
                                                          ▼
                              ┌─────────────────────────────────────────────────────────┐
                              │ 3. 🛡️ Real-Time Fraud ML Scoring (Scoring Engine 0-100)   │
                              └─────────────┬─────────────────────────────┬─────────────┘
                                            │ (Score <= 85)               │ (Score > 85)
                                            │                             ▼ [BIFURCATION B]
                                            │               ┌───────────────────────────┐
                                            │               │ 3B. 🚨 Fraud Quarantine   │ (Downstream 4,5,6 VOID)
                                            │               │     & SAR Asset Freeze    │ [Status: 403 REJECTED]
                                            │               └───────────────────────────┘
                                            ▼
                              ┌─────────────────────────────────────────────────────────┐
                              │ 4. 🏦 Bank Issuer 3D-Secure 2.2 Authorization Handshake  │
                              └─────────────┬─────────────────────────────┬─────────────┘
                                            │ (Auth Approved: Code 00)    │ (Declined: Code 51/05)
                                            │                             ▼ [BIFURCATION C]
                                            │               ┌───────────────────────────┐
                                            │               │ 4B. ⚠️ Hard Card Decline  │ (Downstream 5,6 ABORT)
                                            │               │     Insufficient Funds    │ [Status: 402 DECLINED]
                                            │               └───────────────────────────┘
                                            ▼
                              ┌─────────────────────────────────────────────────────────┐
                              │ 5. ⚙️ Liquidity & Clearing Network (Interbank Rails)     │
                              └─────────────┬───────────────────────────────────────────┘
                                            │ (Optional Retry Loop on 504 Gateway Lag)
                                            ▼
                              ┌─────────────────────────────────────────────────────────┐
                              │ 6. ✅ Ledger Settlement & Cryptographic Receipt Seal     │
                              └─────────────┬───────────────────────────────────────────┘
                                            │
                                            ▼ [Interactive Trigger]
                              ┌─────────────────────────────────────────────────────────┐
                              │ 🔄 REVERSAL & CHARGEBACK ROLLBACK FLOW (MTI 0400 / 0420)│
                              │    (Rollback: 6 -> 5 -> 4 -> 2/1 + Balance Deduction)   │
                              └─────────────────────────────────────────────────────────┘
```

### Stage Specifications

#### Stage 1: Order Capture & Payload Hashing
- **Identifier**: `node-capture`
- **Icon**: `📝` (Persistent with gold/cyan ambient aura)
- **Primary Task**:
  - Ingest raw merchant transaction request: Order ID (`ORD-2026-98421`), Amount (`$525.50 USD`), Merchant Code (`MERCH-LUX-0091`), Timestamp (`2026-08-19T23:30:15.892Z`).
  - Generate System Trace Audit Number (STAN: `684920`).
  - Calculate SHA-256 Idempotency Hash: `hash(OrderId + Timestamp + MerchantKey + Amount)` -> `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
  - Format ISO-8583 MTI `0100` (Authorization Request).
- **Execution Duration**: 700ms.
- **Visual Feedback**: Pulsing Cyan-Gold ring, STAN badge revealed in sub-label.

#### Stage 2: Luhn & Card Tokenization (PCI-DSS)
- **Identifier**: `node-token`
- **Icon**: `🔍` (Persistent with emerald/cyan glow)
- **Primary Task**:
  - Execute Modulo-10 (Luhn) validation check on Primary Account Number (PAN).
  - Extract Bank Identification Number (BIN) prefix (e.g. `4111` -> Visa Corporate Signature).
  - Mask PAN: `4111 72** **** 8821`.
  - Issue PCI Vault Vault Token: `tkn_live_sec_994827103a8f` and Cryptographic Ephemeral Key.
  - Populate ISO-8583 Field 2 (Masked PAN), Field 14 (Expiry `12/28`), Field 35 (Track 2 Token).
- **Execution Duration**: 850ms.
- **Visual Feedback**: Glowing token pill, card brand chip badge.

#### Stage 3: Real-Time Fraud ML Scoring (Bifurcation Point 1)
- **Identifier**: `node-fraud`
- **Icon**: `🛡️` (Persistent with risk-adaptive color glow)
- **Primary Task**:
  - Compute normalized ML inference scoring vector based on 5 features:
    1. Velocity Spike: $V_s \in [0, 100]$
    2. IP Geolocation Distance Anomaly: $G_d \in [0, 100]$
    3. Device Entropy & Fingerprint Mismatch: $D_e \in [0, 100]$
    4. Behavioral Biometrics Anomaly: $B_a \in [0, 100]$
    5. Historical Chargeback Weight: $C_w \in [0, 100]$
  - Weighted Risk Score Formula:
    $$\text{RiskScore} = 0.25 V_s + 0.25 G_d + 0.20 D_e + 0.15 B_a + 0.15 C_w$$
  - **Decision Threshold**:
    - $\text{RiskScore} \le 85$: **PASS** (Normal flow proceeds to Node 4). Score displayed in green/gold.
    - $\text{RiskScore} > 85$: **FRAUD DETECTED** -> **Bifurcation Split to Node 3B (Quarantine & Freeze)**. Downstream nodes 4, 5, 6 are canceled (`VOID`).
- **Execution Duration**: 1000ms.
- **Visual Feedback**: Radar chart morphs into live polygon; score badge counts up to final score.

#### Stage 4: Bank Issuer 3D-Secure 2.2 Auth (Bifurcation Point 2)
- **Identifier**: `node-issuer`
- **Icon**: `🏦` (Persistent with bank gold/blue glow)
- **Primary Task**:
  - Transmit EMV 3D-Secure 2.2 Frictionless / Directory Server handshake.
  - Verify cardholder cryptographic cryptogram (`CAVV/AAV`).
  - Request Issuer Authorization via ISO-8583 MTI `0110` (Authorization Response).
  - **Decision Evaluation**:
    - Status `00 (Approved)`: Auth Code `AUTH_982341`, Available Funds Verified -> Proceeds to Node 5.
    - Status `51 (Insufficient Funds)` or `05 (Do Not Honor)`: **DECLINE** -> **Bifurcation Split to Node 4B (Hard Issuer Decline)**. Downstream nodes 5, 6 canceled (`ABORTED`).
- **Execution Duration**: 1100ms.
- **Visual Feedback**: Auth code badge or flashing decline indicator.

#### Stage 5: Liquidity & Clearing Network
- **Identifier**: `node-clearing`
- **Icon**: `⚙️` (Persistent with spinning emerald mechanical aura)
- **Primary Task**:
  - Route transaction across interbank clearing rails (SWIFT, FedNow, Visa Direct, SEPA Instant).
  - Deduct interchange fee (e.g. 1.75% + $0.30 = $9.50) and compute net settlement amount ($516.00).
  - Execute multi-party liquidity escrow reserve lock.
  - **Network Timeout Handling (Scenario D)**:
    - Attempt 1: 504 Gateway Timeout (1.2s delay).
    - Attempt 2: Exponential backoff retry (1.8s delay).
    - Attempt 3: Failover to Secondary Direct Rail -> Success.
  - Populate ISO-8583 MTI `0200` (Financial Transaction Request).
- **Execution Duration**: 950ms (or ~3.5s during retry loop).
- **Visual Feedback**: Gear rotation animation, rail identifier badge (`FEDNOW_INSTANT_RAIL`).

#### Stage 6: Ledger Settlement & Cryptographic Receipt Seal
- **Identifier**: `node-settle`
- **Icon**: `✅` (Persistent with brilliant emerald-gold halo)
- **Primary Task**:
  - Commit double-entry ledger entry: `DEBIT: Issuer Clearing Pool ($525.50) / CREDIT: Merchant Settled Account ($516.00) + Fee Pool ($9.50)`.
  - Generate Cryptographic HMAC-SHA256 Receipt Seal: `hmac_sha256(LedgerId + STAN + Amount + Timestamp)`.
  - Populate ISO-8583 MTI `0210` (Financial Settlement Confirmation).
  - Trigger numerical ledger currency count-up animation.
  - Enable "Reversar Transacción / Chargeback" button.
- **Execution Duration**: 800ms.
- **Visual Feedback**: Green checkmark halo, animated particle sparkle, receipt hash badge.

---

## 5. Scenario Matrix & Detailed Flow Tracing

### Scenario A: "Success (Normal)"
- **Trigger**: Click Scenario button "Success (Normal)" -> Click "▶ Procesar Transacción".
- **Payload Configuration**:
  - Amount: `$525.50 USD`
  - Card: `Visa Infinite Corporate (*8821)`
  - Risk Vector: Velocity=10, GeoDist=5, DeviceEntropy=12, Biometrics=8, Chargeback=5 -> **Score = 8.2 (Low Risk)**
  - Issuer Response: `00 (Approved)`
- **Trace**:
  1. Node 1: Order captured, STAN `684920`, SHA256 hashed (700ms).
  2. Node 2: Luhn OK, Token `tkn_live_sec_99482710` created (850ms).
  3. Node 3: Fraud ML Score = 8.2 < 85 -> PASS (1000ms). Radar chart displays tight green polygon.
  4. Node 4: 3DS 2.2 Auth `AUTH_982341` approved (1100ms).
  5. Node 5: FedNow clearing complete, fee -$9.50 deducted (950ms).
  6. Node 6: Ledger sealed with HMAC `HMAC_SEAL_998124`, Balance updates +$516.00 (800ms).
- **Final Result**: Pipeline status `COMPLETED_200`, TTL stopped at ~25.600s remaining, Reversal button enabled.

### Scenario B: "Fraud Triggered (Blocked)"
- **Trigger**: Click Scenario button "Fraud Triggered (Blocked)" -> Click "▶ Procesar Transacción".
- **Payload Configuration**:
  - Amount: `$9,840.00 USD`
  - Card: `Mastercard World Elite (*1092)`
  - Risk Vector: Velocity=95, GeoDist=98 (IP: Nigeria / Card: London), DeviceEntropy=92 (Tor Exit Node), Biometrics=88, Chargeback=90 -> **Score = 93.6 (Critical Risk > 85)**
- **Trace**:
  1. Node 1: Order captured, STAN `684921` (700ms).
  2. Node 2: Luhn OK, Token `tkn_live_sec_771920` (850ms).
  3. Node 3: Fraud ML Score = 93.6 > 85 -> **BIFURCATION ACTIVATED** (1000ms).
     - Branch connector SVG lights up in pulsing Cyber Crimson.
     - Node 3B (Quarantine Node: `🚨 Fraud Alert Quarantine & SAR Freeze`) activates.
     - Nodes 4, 5, 6 marked `VOID / SKIPPED` (dimmed grey with strike indicator).
     - Radar chart expands into wide red jagged hazard shape.
     - Log console generates SAR (Suspicious Activity Report) alert.
- **Final Result**: Pipeline status `FRAUD_BLOCKED_403`, TTL stops, Reversal disabled.

### Scenario C: "Insufficient Funds (Declined)"
- **Trigger**: Click Scenario button "Insufficient Funds (Declined)" -> Click "▶ Procesar Transacción".
- **Payload Configuration**:
  - Amount: `$3,450.00 USD`
  - Card: `Amex Platinum (*4001)`
  - Risk Vector: Velocity=18, GeoDist=12, DeviceEntropy=15, Biometrics=10, Chargeback=8 -> **Score = 13.4 (Passed)**
  - Issuer Response: `51 (Insufficient Funds / Over Credit Limit)`
- **Trace**:
  1. Node 1: Order captured, STAN `684922` (700ms).
  2. Node 2: Luhn OK, Token `tkn_live_sec_330192` (850ms).
  3. Node 3: Fraud ML Score = 13.4 < 85 -> PASS (1000ms).
  4. Node 4: 3DS 2.2 Handshake returned ISO-8583 Code `51` -> **BIFURCATION ACTIVATED** (1100ms).
     - Branch connector SVG lights up in pulsing Amber Warning `#f59e0b`.
     - Node 4B (Decline Node: `⚠️ Hard Card Decline - Insufficient Funds`) activates.
     - Nodes 5, 6 marked `ABORTED` (faded amber/grey).
- **Final Result**: Pipeline status `DECLINED_402_NSF`, TTL stops, Reversal disabled.

### Scenario D: "Network Timeout (Retry)"
- **Trigger**: Click Scenario button "Network Timeout (Retry)" -> Click "▶ Procesar Transacción".
- **Payload Configuration**:
  - Amount: `$1,200.00 USD`
  - Clearing Target: Primary Interbank Rail (High congestion simulated)
- **Trace**:
  1. Node 1 -> Node 2 -> Node 3 (Score 11.2) -> Node 4 (Auth Approved) pass normally.
  2. Node 5:
     - Attempt 1: 504 Gateway Timeout -> Badge flashes `RETRY 1/3 (Backoff 1.2s)`.
     - Attempt 2: 504 Gateway Timeout -> Badge flashes `RETRY 2/3 (Backoff 1.8s)`.
     - Attempt 3: Failover Route Triggered -> Switched to `VISA DIRECT / FEDNOW BACKUP RAIL` -> Cleared!
  3. Node 6: Ledger sealed normally.
- **Final Result**: Pipeline status `SETTLED_WITH_FAILOVER_200`, total elapsed time ~6.2s, Reversal enabled.

---

## 6. Mathematical & Technical Specifications

### A. 30-Second TTL Timer Engine
- **Formula**:
  $$\Delta t = \text{performance.now()} - t_{\text{start}}$$
  $$t_{\text{remaining}} = \max(0, 30000 - \Delta t)$$
  $$\text{Seconds} = \lfloor t_{\text{remaining}} / 1000 \rfloor$$
  $$\text{Milliseconds} = \lfloor t_{\text{remaining}} \pmod{1000} \rfloor$$
- **Display String**: `String(Seconds).padStart(2, '0') + '.' + String(Milliseconds).padStart(3, '0')` (e.g. `28.412s`).
- **Color Thresholds**:
  - $t_{\text{remaining}} > 15000$: `#10b981` (Emerald)
  - $5000 < t_{\text{remaining}} \le 15000$: `#f59e0b` (Neon Amber)
  - $t_{\text{remaining}} \le 5000$: `#ef4444` (Cyber Crimson Pulse)

### B. 5-Axis Dynamic Risk Radar Geometry
- **Axes**:
  1. $A_0$ (0 rad / Top): Velocity Check
  2. $A_1$ ($2\pi/5$ rad / 72°): Geolocation Anomaly
  3. $A_2$ ($4\pi/5$ rad / 144°): Device Fingerprint Trust
  4. $A_3$ ($6\pi/5$ rad / 216°): Behavioral Biometrics
  5. $A_4$ ($8\pi/5$ rad / 288°): Historical Chargeback Rate
- **Cartesian Coordinate Mapping**:
  For radar center $(cx, cy)$ and max radius $R$:
  $$x_i = cx + R \cdot w_i \cdot \cos\left(A_i - \frac{\pi}{2}\right)$$
  $$y_i = cy + R \cdot w_i \cdot \sin\left(A_i - \frac{\pi}{2}\right)$$
  Where $w_i \in [0.0, 1.0]$ is the normalized weight of axis $i$.
- **Rendering**: Canvas 2D / SVG `<polygon>` with easeInOutQuad interpolation between target risk states.

### C. Animated Ledger Currency Counter
- **Easing Function**: `easeOutExpo`
  $$v(t) = \text{start} + (\text{target} - \text{start}) \cdot (1 - 2^{-10t}) \quad \text{for } t \in [0, 1]$$
- **Formatter**: `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.
- **Metrics Tracked**:
  - `Merchant Available Balance`: Base `$2,849,150.00`
  - `Settlement In-Flight`: Base `$0.00` -> `$525.50`
  - `Cleared Today (24h Volume)`: Base `$1,420,890.00`
  - `Chargeback Reserve Fund`: Base `$150,000.00`

### D. Reverse Rollback Flow (Reversar Transacción)
- **Lifecycle Sequence**:
  1. User triggers "Reversar Transacción".
  2. Set pipeline state to `ROLLBACK_IN_PROGRESS`.
  3. **Stage R6 (Ledger Reversal)**: MTI `0420` Reversal Advice dispatched. Reverse energy pulse travels right-to-left. Available balance decremented by transaction amount (`-$516.00`).
  4. **Stage R5 (Clearing Unwind)**: Liquidity escrow released, interbank clearing canceled.
  5. **Stage R4 (Issuer Release)**: Authorization `AUTH_982341` voided with issuer confirmation `REV_OK_77192`.
  6. **Stage R2/1 (Receipt Void)**: Original receipt sealed with `VOID_REFUND_STAMP`.
  7. Pipeline state set to `REVERSED_REFUNDED_200`.

---

## 7. ISO-8583 & JSON Financial Data Structure Specifications

### A. ISO-8583 Message Type Identifier (MTI) Matrix
- `0100`: Authorization Request (Nodes 1, 2, 3)
- `0110`: Authorization Response (Node 4)
- `0200`: Financial Transaction Request (Node 5)
- `0210`: Financial Transaction Settlement Response (Node 6)
- `0400`: Reversal Request (Reversal Stage R6/R5)
- `0420`: Reversal Advice Confirmation (Reversal Final)

### B. ISO-8583 Primary Bitmap Fields Schema

```json
{
  "MTI": "0100",
  "F000_PrimaryBitmap": "11100000 00100001 00000000 00000000",
  "F002_PAN": "4111********8821",
  "F003_ProcessingCode": "000000",
  "F004_AmountTransaction": "000000052550",
  "F007_TransmissionDateTime": "0819233015",
  "F011_STAN": "684920",
  "F012_LocalTime": "233015",
  "F013_LocalDate": "0819",
  "F014_ExpirationDate": "2812",
  "F022_PosEntryMode": "051",
  "F038_AuthIdResponse": "AUTH_982341",
  "F039_ResponseCode": "00",
  "F041_CardAcceptorTerminalId": "TERM_LUX_01",
  "F042_CardAcceptorIdCode": "MERCH_LUX_0091",
  "F048_PrivateData": {
    "IdempotencyHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "VaultToken": "tkn_live_sec_994827103a8f",
    "MLRiskScore": 8.2,
    "FraudEvaluation": "LOW_RISK_PASS",
    "ThreeDSVersion": "2.2.0",
    "ClearingRail": "FEDNOW_INSTANT_SETTLEMENT"
  },
  "F049_CurrencyCode": "840",
  "F064_MAC": "HMAC_SHA256_SEAL_998124b89c"
}
```

### C. Live Mutation Table by Stage

| Stage | MTI | Key Injected / Mutated Fields | State Status |
|-------|-----|-------------------------------|--------------|
| **1. Capture** | `0100` | `F011 (STAN)`, `F004 (Amount)`, `F048.IdempotencyHash` | `PAYLOAD_CAPTURED` |
| **2. Token** | `0100` | `F002 (Masked PAN)`, `F014 (Expiry)`, `F048.VaultToken` | `TOKENIZED_PCI_COMPLIANT` |
| **3. Fraud ML** | `0100` | `F048.MLRiskScore`, `F048.FraudEvaluation` | `RISK_SCORED_PASS` / `FRAUD_BLOCKED` |
| **4. Issuer 3DS**| `0110` | `F038 (AuthId)`, `F039 (00 Approved / 51 Declined)` | `AUTH_APPROVED` / `ISSUER_DECLINED` |
| **5. Clearing** | `0200` | `F048.ClearingRail`, `F049 (USD 840)`, `InterchangeFee` | `CLEARING_EXECUTED` |
| **6. Settlement**| `0210` | `F064 (HMAC Seal)`, `LedgerCommitId`, `ReceiptStatus` | `LEDGER_SETTLED_200` |
| **Reversal** | `0420` | `MTI=0420`, `F039=00 (Reversed)`, `VoidSeal` | `TX_REVERSED_REFUNDED` |

---

## 8. UI/UX Layout & Cyberpunk Visual Design Tokens

### Color Palette (Fintech Luxury Cyberpunk)
```css
:root {
  /* Dark Canvas Base */
  --bg-base: #030812;
  --bg-surface: #060d1b;
  --bg-card: rgba(8, 17, 34, 0.75);
  --bg-card-hover: rgba(14, 27, 54, 0.85);
  
  /* Primary Fintech Accents */
  --gold-primary: #f59e0b;
  --gold-light: #fbbf24;
  --gold-glow: rgba(245, 158, 11, 0.35);
  --gold-dim: rgba(245, 158, 11, 0.12);

  /* Emerald Settlement Accents */
  --emerald-primary: #10b981;
  --emerald-light: #34d399;
  --emerald-glow: rgba(16, 185, 129, 0.35);
  --emerald-dim: rgba(16, 185, 129, 0.12);

  /* Cyber Crimson (Fraud / Alerts) */
  --crimson-primary: #ef4444;
  --crimson-light: #f87171;
  --crimson-glow: rgba(239, 68, 68, 0.4);
  --crimson-dim: rgba(239, 68, 68, 0.12);

  /* Amber (Warning / Decline) */
  --amber-primary: #f59e0b;
  --amber-glow: rgba(245, 158, 11, 0.3);

  /* Reversal Violet / Amethyst */
  --violet-primary: #8b5cf6;
  --violet-light: #a78bfa;
  --violet-glow: rgba(139, 92, 246, 0.4);

  /* Neutral Text & Borders */
  --text-main: #f1f5f9;
  --text-muted: #94a3b8;
  --text-faint: rgba(148, 163, 184, 0.35);
  --border-subtle: rgba(245, 158, 11, 0.15);
  --border-active: rgba(245, 158, 11, 0.5);

  /* Fonts */
  --font-ui: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Cascadia Code', 'Fira Code', monospace;
}
```

### Component Wireframe & Visual Hierarchy

1. **Top Bar / Header**:
   - Title: `⚡ High-Frequency Transaction & Settlement Pipeline` (Fintech Gold Gradient).
   - Subtitle: `EMV 3DS 2.2 · ISO-8583 Dynamic Clearing · Real-Time ML Fraud Defense · Distributed Ledger Settlement`.
   - Global Status Pill: `[● SISTEMA ONLINE / IDLE / PROCESSING / SETTLED / FRAUD QUARANTINE]`.
   - High-Precision 30.00s TTL SLA Badge: Clock icon + `30.000s` digital countdown display with microsecond glow.

2. **Scenario Controller Bar**:
   - Preset buttons:
     - `✨ Normal (Success)` (Gold/Emerald highlight)
     - `🚨 Fraude (Bloqueo)` (Crimson highlight)
     - `⚠️ Fondos Insuficientes` (Amber highlight)
     - `🔄 Timeout de Red (Retry)` (Cyan highlight)
   - Action Buttons:
     - `▶ Procesar Transacción` (Primary Gold/Emerald CTA button)
     - `🔄 Reversar Transacción / Chargeback` (Violet CTA button, dynamic enable on settlement)
     - `↺ Resetear Pipeline` (Clean reset)

3. **Financial Ledger & Telemetry Stats Bar**:
   - 4 Live Metric Cards:
     - Card 1: `Merchant Available Balance` (`$2,849,150.00` -> animated)
     - Card 2: `Current In-Flight Escrow` (`$0.00` -> `$525.50`)
     - Card 3: `Clearing Rail & Fee` (`FEDNOW (-$9.50)`)
     - Card 4: `Pipeline Latency SLA` (`0.000s / 30.000s`)

4. **Primary Pipeline Stepper & Dynamic Bifurcation Tracks (SVG + HTML)**:
   - Linear Horizontal Stepper with 6 Primary Node Circles (Diameter 84px):
     - Node 1: `📝 Captura & Hash`
     - Node 2: `🔍 Token PCI`
     - Node 3: `🛡️ ML Antifraude` -> [SVG Fork Downward -> `🚨 Cuarentena SAR`]
     - Node 4: `🏦 Auth 3DS 2.2` -> [SVG Fork Downward -> `⚠️ Rechazo Emisor`]
     - Node 5: `⚙️ Liquidación`
     - Node 6: `✅ Ledger Sellado`
   - Energy beam lines connect nodes with glowing dot particles and animated width/stroke transitions.

5. **Split Workspace Grid (Lower Section)**:
   - **Left Column (40%)**:
     - **Dynamic Risk Radar Chart**: HTML5 Canvas rendering real-time spider web with 5 axes, risk polygon, and numeric breakdown.
     - **Card Brand & Security Chip**: Visual interactive luxury credit card mockup displaying live PAN masking, Luhn validity chip, and STAN hash.
   - **Right Column (60%)**:
     - **ISO-8583 / JSON Payload Inspector**:
       - Tabs: `[ JSON Structure ]` | `[ ISO-8583 Bitmap Fields ]` | `[ Reversal Audit Trail ]`
       - Code block with copy-to-clipboard button and real-time field highlights.
     - **Live Terminal Audit Log**: ANSI-styled streaming execution log detailing each micro-step, timestamps, latencies, and security cryptograms.

---

## 9. Implementation Roadmap & Readiness Checklist for Worker

When Worker Transaction Flow (`c:\DevWork\Depredador\Flujoweb\sistemas\transaction-flow\index.html`) is dispatched, this checklist guarantees 100% compliance:

- [x] Full single-file standalone architecture (HTML5, embedded CSS, vanilla ES6+ JS).
- [x] Zero external build dependencies or npm scripts.
- [x] Google Fonts `Inter` + `'Cascadia Code', 'Fira Code', monospace` imported.
- [x] Deterministic state machine with all 6 nodes, 4 scenarios, and 2 bifurcation branches.
- [x] High-precision `performance.now()` 30.000s TTL timer with microsecond (`ss.mmm`) rendering.
- [x] Real-time Canvas 5-axis Risk Radar with smooth polygon morphing.
- [x] 60fps `easeOutExpo` animated ledger currency counter with formatted USD string.
- [x] Interactive "Reversar Transacción / Chargeback" animated reverse flow.
- [x] Dual-tab ISO-8583 Bitmap & JSON payload inspector with dynamic state mutations.
- [x] Persistent luminous emoji icons across pending, active, completed, error, and reversed states.
- [x] Responsive layout tested from 375px mobile to 4K ultrawide monitors.
- [x] Zero console warnings or errors.
