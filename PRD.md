# PROPATI — Product Requirements Document

## What We're Building

PROPATI is Nigeria's verified property platform. It combines a **marketplace** (buy, rent, short-let, share, commercial) with **property management** (rent collection, tenant screening, digital agreements, maintenance tracking) and a **B2B SaaS layer** for estate management companies.

The core differentiator is a **5-layer trust verification system** that certifies properties and identities — solving Nigeria's #1 property problem: fraud and misrepresentation.

---

## The 5 Roles

| Role | What They Do |
|------|-------------|
| **Landlord** | Lists properties, screens tenants, collects rent, manages agreements |
| **Tenant/Buyer** | Searches listings, applies, pays rent, manages tenancy |
| **Agent** | Manages listings on behalf of landlords, earns commissions |
| **Admin** | Approves verifications, resolves disputes, manages platform |
| **Estate Manager** | B2B SaaS — manages entire property portfolios for companies |

---

## Features IN SCOPE

### Marketplace
- Property listings: rent, sale, short-let, room share, commercial
- Search filters: location (ILIKE), price range, bedrooms, property type, verification tier
- Listing cards: cover photo, price, specs, trust badge (Basic/Verified/Inspected/Certified)
- Save/favourite listings (toggle)
- Flag fraudulent listings (auto-suspend at 10+ open flags)
- Sort: newest, price asc/desc, most verified

### Authentication
- Email + password signup (min 8 chars, 1 uppercase, 1 number)
- Role selected at signup: landlord | tenant | agent | estate_manager
- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- Silent token refresh on 401 (apiCall retry)
- Session persistence: role/purpose stored to localStorage, restored on refresh
- Forgot password: email link with 1-hour bcrypt-hashed token
- Phone verification: 6-digit OTP via WhatsApp (Twilio) with Termii SMS fallback

### Identity Verification (Personal — all roles)
- Provider: Prembly IdentityPass API
- Supported: NIN, BVN, Driver's License, Voter's Card (PVC)
- Flow: enter number → API returns name/DOB/gender/photo → user confirms → account marked verified
- Stored: encrypted with AES-256-GCM, never in plaintext
- HMAC hash stored for deduplication lookups
- Mock mode: returns fake data when PREMBLY_API_KEY not set

### Property Verification (5 Layers — landlords only)
- Layer 1: Document upload (C of O, Deed of Assignment, Survey Plan, Governor's Consent)
- Layer 2: Identity match via Prembly (NIN/BVN)
- Layer 3: Live video proof (landlord records video inside property with unique QR code)
- Layer 4: Physical agent inspection (PROPATI agent visits on-site)
- Layer 5: Admin final review → Certified badge
- Admin queue: live list of pending verifications with approve/reject per layer

### Tenant Profile
- Fields: employment_status, employment_type, employer_name, job_title, yearly_income, profile_bio, guarantor_name, guarantor_phone, guarantor_relationship
- Verification score: 0–4 (NIN verified + ID verified + income verified + profile completed)
- Income privacy: exact figure stored encrypted, landlords only see band (e.g. ₦3M–₦6M/yr)
- Profile completion banner on home screen if incomplete

### Landlord Dashboard
- Portfolio KPI overview
- Add listing: form + multi-photo upload (Cloudinary, max 10)
- Rent collection: per-tenant tracking (paid/due/overdue)
- Tenant screening calls
- Agreements management
- Property verification wizard (5 steps)
- Real-time messaging

### Tenant Dashboard
- Purpose switcher: Rent / Buy / Short-let / Share (changes nav + context)
- Property search and apply (starts conversation with landlord)
- Agreements: view, e-sign, download PDF
- Rent & Payments history
- Maintenance requests
- Receipts (transaction history)
- Profile: employment, identity verification, phone OTP
- Screening calls

### Agent Dashboard
- Managed listings
- Deal pipeline
- Commissions tracker
- Client management
- Inspection calendar
- Reputation score

### Admin Console
- Verification queue (real data from DB)
- Flagged listings review
- Dispute resolution
- User management: suspend/ban, approve agents
- Platform stats: users by role, listing counts, GMV, revenue

### Estate Manager B2B
- Org setup wizard: name + billing email + address + CAC number
- Plan selection: Starter/Growth/Enterprise via Paystack
- 9 screens: home, portfolio, rent ledger, maintenance, bulk-upload, agreements, team, billing, reports
- Maintenance ticket system: create, assign, filter by status/priority
- Bulk CSV import (validates columns, checks unit limits)
- Team: invite by email, roles (manager/accountant/maintenance/owner_view), seat limits per plan
- Monthly reports: JSON data (PDF rendering pending)

### Digital Agreements
- Created by landlord with listing + tenant + financial terms
- HTML preview at GET /api/agreements/:id/preview
- E-signature: records signer_id, timestamp, IP, user-agent, consent_text, SHA256 checksum
- Status machine: draft → pending → tenant_signed/landlord_signed → fully_signed
- Both parties get email notification when agreement is ready

### Messaging
- Conversation per listing pair (landlord + tenant + listing)
- Idempotent conversation creation
- Polling every 4 seconds for new messages
- Unread counts tracked per party (unread_tenant, unread_landlord columns)
- SMS notification on first unread message (not spamming)

### Payments
- Paystack inline checkout
- Escrow hold until move-in confirmed
- Platform fee: 10% rent, 2% sale (>₦20M) or 1% (≤₦20M)
- Webhook signature verification (raw body middleware)
- Transaction history with receipts

### Notifications
- In-app: stored in notifications table, badge count
- Email templates: welcome, rent_due, payment_confirmed, agreement_ready, verification_update, new_message, org_invite, password_reset
- SMS: OTP, rent reminders (7/3/1 day before due), urgent maintenance
- Daily cron: rent reminders at 08:00 WAT (07:00 UTC)

---

## Features OUT OF SCOPE

- Native mobile app
- WebSockets (polling only)
- CAC API integration (manual number entry)
- Credit score
- Property valuation AI
- Virtual tours
- In-app video calling
- Foreign currency
- Subletting
- Utility tracking
- Tenant insurance
- Mortgage origination
- Agent licensing API
- Government API (LIRS, LASAA)
- White-label (Enterprise tier — designed but not built)

---

## Revenue Model

| Stream | Rate |
|--------|------|
| Platform fee — rent | 10% first payment |
| Platform fee — sale >₦20M | 2% |
| Platform fee — sale ≤₦20M | 1% |
| Agent commission — rent | 10% of platform fee |
| Agent commission — sale | 1.5% of platform fee |
| EM Starter | ₦25,000/mo (20 units, 1 seat) |
| EM Growth | ₦60,000/mo (100 units, 5 seats) |
| EM Enterprise | ₦150,000/mo (unlimited) |

---

## Success Metrics (6 months)

- Verified listings: 40% reach Certified tier
- Dispute rate: < 5% of transactions
- Payment success: > 99%
- Application-to-approval: < 48 hours
- MAU: 10,000
- B2B clients: 25 (₦1.6M MRR)
