# PROPATI — Implementation Plan

## Current Status (March 2026)

The platform is **live and deployed**. This plan covers what's remaining to reach launch-ready status.

**Live:** https://propati-frontend.vercel.app
**API:** https://propati-backend-production.up.railway.app

---

## Phase 1 — Critical Bugs & Stability
*Complete these before any new features. Estimated: 1–2 days.*

### 1.1 Fix remaining 404s
- [ ] `GET /api/listings/my` → was wrong endpoint (now fixed to `/owner/mine`)
- [ ] Verify all nav items load without console errors
- [ ] Test each role dashboard: landlord, tenant, agent, admin, estate_manager

### 1.2 Fix infinite loops
- [ ] `loadEmOrg()` loop fixed (DATA.emOrg = false, not null when no org)
- [ ] Verify estate_manager dashboard loads without runaway API calls
- [ ] Add `loading` guard to all load functions that call `render()`

### 1.3 Console error audit
- Run each dashboard, note every console error
- Fix `role is not defined` in renderLandlordScreen agreements
- Fix any remaining undefined variable references
- Run `node --check src/**/*.js` on backend

### 1.4 Mobile audit
- Test on real iPhone (Safari) and Android (Chrome)
- Verify hamburger sidebar opens/closes
- Verify modals show as bottom sheets
- Fix any touch target issues < 44px

---

## Phase 2 — Paystack Rent Collection
*Highest revenue impact. Estimated: 2–3 days.*

### 2.1 Backend: initiate payment
- [ ] `POST /api/payments/initiate` → already exists, wire frontend
- [ ] Returns Paystack `authorization_url`
- [ ] Store pending transaction in DB

### 2.2 Frontend: Pay Rent button
- [ ] Tenant payments screen — "Pay Now" button calls `/api/payments/initiate`
- [ ] Open returned `authorization_url` in new tab (or Paystack inline popup)
- [ ] Show pending state while waiting

### 2.3 Backend: Paystack webhook
- [ ] `POST /api/payments/webhook` — already exists
- [ ] Verify HMAC-SHA512 signature with raw body
- [ ] Handle `charge.success`: update transaction status → `in_escrow`
- [ ] Schedule escrow release after 7 days (or landlord confirms move-in)

### 2.4 Escrow release
- [ ] Admin UI: release escrow button calls `POST /api/payments/release-escrow/:id`
- [ ] Transfer funds to landlord (Paystack Transfer API)
- [ ] Notify landlord via email + SMS

### 2.5 Receipt generation
- [ ] After payment confirmed, create transaction record
- [ ] Show in tenant `/receipts` page (already built)
- [ ] Send email receipt (template already exists: `payment_confirmed`)

---

## Phase 3 — Agent Listings Screen
*Estimated: 1 day.*

### 3.1 Load agent's managed listings
- [ ] `GET /api/listings?agent_id=:uid` — add agent filter to listings query
- [ ] Agent dashboard → Managed Listings screen loads real data
- [ ] Show: listing title, type, status, commission earned, last activity

### 3.2 Agent deal pipeline
- [ ] Create `deals` table (or use `agreements` table with agent_id filter)
- [ ] Pipeline stages: Enquiry → Viewing → Offer → Agreement → Completed
- [ ] `GET /api/agreements?agent_id=:uid` filter

---

## Phase 4 — Admin Console Real Data
*Estimated: 2 days.*

### 4.1 Platform stats (real)
- [ ] `GET /api/users/admin/stats` — already implemented
- [ ] Wire admin Overview screen to real endpoint (currently mock data)
- [ ] Show: total users by role, active listings, GMV, platform revenue

### 4.2 Live activity feed
- [ ] `GET /api/notifications?admin=true&limit=20` — create admin feed endpoint
- [ ] Or: poll recent transactions + verifications + flags

### 4.3 User management UI
- [ ] Admin → Users screen calls `GET /api/users/admin/all`
- [ ] Suspend/unsuspend: `POST /api/users/admin/:id/suspend`
- [ ] Approve agent: `POST /api/users/admin/:id/approve-agent`

### 4.4 Disputes UI
- [ ] Load real disputes from DB
- [ ] Rule in favour of tenant/landlord buttons
- [ ] Schedule mediation (creates screening_call record)

---

## Phase 5 — PDF Reports & Agreements
*Estimated: 2 days.*

### 5.1 Lease PDF generation
- [ ] `src/services/pdf.js` already has PDFKit setup
- [ ] Add `generateLeasePDF(agreement)` function
- [ ] Upload generated PDF to Cloudinary
- [ ] Store URL in `agreements.pdf_url` column (add column)
- [ ] Serve via `GET /api/agreements/:id/pdf` → redirect to Cloudinary URL

### 5.2 Estate Manager monthly reports
- [ ] `GET /api/orgs/:id/reports/:month` — currently returns JSON
- [ ] Render JSON data into PDF using PDFKit
- [ ] Upload to Cloudinary with org_id + month in filename
- [ ] Return Cloudinary signed URL
- [ ] Add "Download PDF" button in EM reports screen

### 5.3 Receipt PDF
- [ ] Generate payment receipt PDF on transaction completion
- [ ] Email PDF attachment with payment_confirmed template

---

## Phase 6 — Notifications System
*Estimated: 1 day.*

### 6.1 Notification bell (frontend)
- [ ] Topbar bell icon: click → load notifications dropdown
- [ ] `GET /api/users/notifications` — already exists
- [ ] Mark as read on open: `POST /api/users/notifications/read-all`
- [ ] Show unread count badge on bell

### 6.2 Real-time badge update
- [ ] Poll `GET /api/messages/unread-count` every 30s
- [ ] Update badge without full re-render

### 6.3 Email template review
- [ ] Test all email templates (welcome, rent_due, payment_confirmed, agreement_ready)
- [ ] Set `GMAIL_APP_PASSWORD` in Railway
- [ ] Verify emails land in inbox (not spam)

### 6.4 SMS rent reminders
- [ ] Daily cron already runs at 07:00 UTC
- [ ] Set `TERMII_API_KEY` in Railway to activate
- [ ] Test: create rent_schedule row with due_date 7 days from now

---

## Phase 7 — Prembly NIN Verification (Production)
*Estimated: 0.5 days (just credentials + testing).*

### 7.1 Activate Prembly
- [ ] Sign up at https://identitypass.prembly.com
- [ ] Get `PREMBLY_API_KEY` + `PREMBLY_APP_ID`
- [ ] Set in Railway environment variables
- [ ] Test with real NIN in staging

### 7.2 Error handling review
- [ ] Handle: NIN not found, NIN mismatch, service timeout
- [ ] Add retry logic for 5xx responses
- [ ] Log all verification attempts (for audit trail)

---

## Phase 8 — Tenant Application Flow
*Estimated: 2 days.*

### 8.1 Formal application record
- [ ] Create `applications` table: listing_id, tenant_id, status, message, created_at
- [ ] `POST /api/applications` when tenant clicks "Apply & Message"
- [ ] Landlord sees applications list on each listing

### 8.2 Landlord application review
- [ ] Landlord: listing detail → Applications tab
- [ ] Shows: tenant name, verification score, employment, income band
- [ ] Actions: Approve (create agreement) / Reject / Message

### 8.3 Tenant application status
- [ ] Tenant: My Applications screen (shows status per listing)
- [ ] Notification when approved/rejected

---

## Phase 9 — Performance & Polish
*Estimated: 2 days.*

### 9.1 Image optimisation
- [ ] Cloudinary transformations: `quality: 'auto:good'`, `fetch_format: 'auto'`
- [ ] Listing cover images: 800×600 max on upload
- [ ] Avatar images: 200×200 max

### 9.2 Skeleton loading states
- [ ] Replace "⏳ Loading..." text with CSS skeleton placeholders
- [ ] Especially: listing grid, dashboard KPIs, messages list

### 9.3 CORS tighten
- [ ] Change `origin: true` back to allowlist: `[process.env.FRONTEND_URL]`
- [ ] Test from Vercel domain

### 9.4 Error boundary
- [ ] Wrap `render()` in try/catch
- [ ] Show friendly error card if render throws
- [ ] Log error details for debugging

### 9.5 SEO basics
- [ ] Update `<title>` to "PROPATI — Nigeria's Verified Property Platform"
- [ ] Add meta description
- [ ] Add Open Graph tags for social sharing

---

## Phase 10 — Launch Preparation
*Estimated: 2–3 days.*

### 10.1 CAC Registration
- [ ] Register PROPATI Technologies Ltd with CAC
- [ ] Required for Paystack live mode activation
- [ ] Required for WhatsApp Business API (Twilio)
- [ ] Required for NIMC/Prembly production access

### 10.2 Paystack live mode
- [ ] Submit business documents to Paystack
- [ ] Get `sk_live_` key
- [ ] Replace `sk_test_` in Railway vars
- [ ] Test full payment flow end-to-end

### 10.3 Custom domain
- [ ] Register `propati.ng` (or .com.ng)
- [ ] Point to Vercel (frontend)
- [ ] Set up `api.propati.ng` → Railway (backend)
- [ ] Update `FRONTEND_URL` + `PAYSTACK_CALLBACK_URL` in Railway
- [ ] Update CORS allowlist

### 10.4 Monitoring
- [ ] Set up Railway uptime alerts
- [ ] Add Sentry or similar for JS error tracking
- [ ] Set up Supabase connection monitoring

### 10.5 Data seeding (production)
- [ ] Create production admin account (don't use demo accounts)
- [ ] Upload 10–20 real verified listings for launch
- [ ] Set up initial agent accounts in target areas (Lekki, VI, Abuja)

---

## Pending Features (Post-Launch)

These are designed but not yet built:

| Feature | Effort | Priority |
|---------|--------|---------|
| Paystack escrow auto-release | 1 day | High |
| Agent commission auto-payout | 2 days | High |
| Tenant-to-tenant referral | 1 day | Medium |
| Landlord bulk rent collection | 2 days | Medium |
| EM white-label (Enterprise) | 3 days | Low |
| WebSockets for messaging | 2 days | Low |
| Property valuation tool | 3 days | Low |
| Mortgage calculator (real) | 2 days | Low |
| iOS/Android app (React Native) | 8 weeks | Future |

---

## File Change Reference

When building new features, these are the files most likely to be touched:

| Change Type | Files |
|-------------|-------|
| New API endpoint | `src/routes/[relevant].js` |
| New DB column | `src/db/migrate_v3.js` (or create v4) |
| New frontend screen | `index.html` — add case to renderScreen() |
| New nav item | `index.html` — NAV_CONFIG object |
| New action handler | `index.html` — bindEvents() switch statement |
| New data load | `index.html` — add to DATA object + loadX() function |
| Email template | `src/services/notifications.js` — TEMPLATES object |
| SMS message | `src/services/notifications.js` — sendSMS() calls |
