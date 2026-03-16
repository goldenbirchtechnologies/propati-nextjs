# PROPATI — Tech Stack

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| HTML5 | — | Single file app (`index.html`) |
| Vanilla JavaScript | ES2022 | State machine, DOM rendering, API calls |
| CSS3 | — | Custom properties, Grid, Flexbox |
| Google Fonts | — | Bricolage Grotesque, Outfit, DM Serif Display, DM Mono |

**No framework. No build step. No npm.**

The entire frontend is one HTML file (~420KB, ~7000 lines). It renders by setting `innerHTML` on `#app` via a central `render()` function. All state lives in a `STATE` object.

### Frontend Architecture Pattern
```
STATE (global object) →
setState(updates) →
render() →
  switch(STATE.view):
    'landing' → renderLanding()
    'login'   → renderLogin()
    'dashboard' → switch(STATE.role):
      'landlord'        → renderDashboard() → renderLandlordScreen(page)
      'tenant'          → renderDashboard() → renderTenantScreen(page)
      'agent'           → renderDashboard() → renderAgentScreen(page)
      'admin'           → renderAdmin() → renderAdminScreen(pg)
      'estate_manager'  → renderEstateManager() → renderEstateManagerScreen(page)
→ bindEvents() (data-action delegated event handling)
```

---

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22.x (Railway default) | Runtime |
| Express | 4.18.2 | HTTP framework |
| pg | 8.11.3 | PostgreSQL client |
| pg-pool | 3.6.1 | Connection pooling (max 20 connections) |
| bcryptjs | 2.4.3 | Password hashing (cost 12) + OTP hashing (cost 8) |
| jsonwebtoken | 9.0.2 | JWT access (15min) + refresh (7d) tokens |
| multer | 1.4.5-lts.2 | Multipart form parsing (memory storage) |
| cloudinary | 2.0.1 | Image/document storage via upload_stream |
| nodemailer | 6.9.9 | Email sending (Gmail SMTP or custom SMTP) |
| axios | 1.6.7 | HTTP client for Termii SMS + Prembly API |
| uuid | 9.0.0 | ID generation (all IDs prefixed: usr_, lst_, cnv_, etc.) |
| express-validator | 7.0.1 | Request validation |
| helmet | 7.1.0 | Security headers (CSP, HSTS, noSniff, frameguard) |
| cors | 2.8.5 | Cross-origin (origin: true in production) |
| express-rate-limit | 7.2.0 | Global: 300/15min, Auth: 10/15min |
| express-slow-down | 1.6.0 | Progressive delay after 50 req/15min |
| express-mongo-sanitize | 2.2.0 | Strip $ from inputs |
| hpp | 0.2.3 | HTTP Parameter Pollution protection |
| compression | 1.7.4 | Gzip responses |
| morgan | 1.10.0 | HTTP request logging to Winston |
| winston | 3.11.0 | Structured logging |
| winston-daily-rotate-file | 4.7.1 | Log rotation |
| pdfkit | 0.14.0 | PDF generation (lease agreements) |
| csv-parse | 5.5.5 | Estate manager bulk upload |
| node-cron | 3.0.3 | Daily rent reminders (07:00 UTC) |
| dotenv | 16.4.1 | Environment variable loading |

---

## Database

| Technology | Version | Notes |
|-----------|---------|-------|
| PostgreSQL | 15.x | Hosted on Supabase |
| Supabase | — | Cloud PostgreSQL, connection pooler at port 5432 |

Connection: `DATABASE_URL` (pooler URL format: `aws-0-eu-west-2.pooler.supabase.com`)

Query pattern: parameterised `$1, $2` placeholders (NOT SQLite `?`)

---

## Infrastructure

| Service | What |
|---------|------|
| **Railway** | Backend hosting (Node.js), auto-deploys on GitHub push |
| **Vercel** | Frontend hosting (static HTML), auto-deploys on GitHub push |
| **Supabase** | PostgreSQL database, UK region (West Europe) |
| **Cloudinary** | Image/document CDN, folder: `propati/images`, `propati/documents` |
| **GitHub** | Source control, two repos: `propati-backend` + `propati-frontend` |

---

## Third-Party APIs

| Service | SDK/Method | Purpose | Mock Mode |
|---------|-----------|---------|-----------|
| **Paystack** | Direct HTTP (axios) | Payments, subscriptions | Yes — no webhook |
| **Prembly IdentityPass** | Direct HTTP (axios) | NIN, BVN, DL, Voter's Card | Yes — `PREMBLY_API_KEY=mock` or unset |
| **Termii** | Direct HTTP (axios) | Nigerian SMS (OTP, alerts) | Yes — logs to console |
| **Twilio** | Direct HTTP (axios) | WhatsApp OTP | Yes — logs to console |
| **Nodemailer** | npm package | Email (Gmail SMTP) | Yes — logs to console |

All third-party services fail gracefully — if credentials not set, they log to console and return `{success: true, mock: true}`.

---

## Security

| Layer | Implementation |
|-------|---------------|
| Passwords | bcrypt, cost factor 12 |
| JWT access | HS256, 15-minute expiry |
| JWT refresh | HS256, 7-day expiry, stored in DB with bcrypt hash |
| NIN/BVN storage | AES-256-GCM, random IV per value, auth tag verification |
| NIN lookup | HMAC-SHA256 hash (separate from encrypted value) |
| Transport | HTTPS/TLS 1.3, HSTS with preload in production |
| Rate limiting | 300 req/15min global, 10 failed auth attempts/15min |
| Input sanitisation | express-mongo-sanitize (strips $), hpp (prevents array injection) |
| CORS | `origin: true` (open) — tighten before launch |
| Webhook verification | Paystack: HMAC-SHA512 of raw body |
| SQL injection | Parameterised queries only — no string concatenation |
| Helmet | CSP, noSniff, frameguard: deny, crossOriginResourcePolicy: cross-origin |

---

## Environment Variables

```bash
# Required
NODE_ENV=production
DATABASE_URL=postgresql://postgres.xxx:[password]@aws-0-eu-west-2.pooler.supabase.com:5432/postgres
JWT_SECRET=                    # 64-char hex (32 bytes)
JWT_REFRESH_SECRET=            # 64-char hex, different from JWT_SECRET
ENCRYPTION_KEY=                # 64-char hex (32 bytes for AES-256)
FRONTEND_URL=https://propati-frontend.vercel.app

# Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=propati      # optional, defaults to 'propati'

# Payments
PAYSTACK_SECRET_KEY=sk_live_... # or sk_test_ for development

# Email (one of these)
GMAIL_USER=hello@propati.ng
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
# OR
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# SMS (Nigerian gateway)
TERMII_API_KEY=
TERMII_SENDER_ID=PROPATI

# WhatsApp OTP
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=+14155238886  # Twilio sandbox number

# Identity verification
PREMBLY_API_KEY=               # Get from identitypass.prembly.com
PREMBLY_APP_ID=

# Optional tuning
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=10
MAX_FILE_SIZE_MB=10
MAX_VIDEO_SIZE_MB=100
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## ID Format Conventions

All IDs are prefixed strings:
```
usr_  → users
lst_  → listings
cnv_  → conversations
msg_  → messages
agr_  → agreements
txn_  → transactions
org_  → organisations
tkt_  → maintenance tickets
```
Generated: `'prefix_' + uuidv4().replace(/-/g,'').slice(0,12)`

---

## Logging

Winston logger with levels: `error`, `warn`, `info`, `debug`, `security`, `auth`

Log files (production):
- `logs/error.log` — errors only
- `logs/combined.log` — all levels
- Daily rotation, 14-day retention

Railway: logs stream to dashboard automatically via stdout.
