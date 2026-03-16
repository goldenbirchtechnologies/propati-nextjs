# PROPATI — App Flow & Navigation

## Entry Points

### First Visit (not logged in)
```
URL loads → render() → STATE.view === 'landing' → renderLanding()
```
Landing page shows: sticky nav, hero search, property type filters, listing grid

### Return Visit (logged in)
```
URL loads → render() → checkSession() runs →
  Auth.isLoggedIn() === true →
  STATE restored from localStorage (role, purpose) →
  GET /api/auth/me →
  enterDashboard(user) → correct dashboard
```

---

## Landing Page

### Nav bar
- Logo → stays on landing
- Search bar → filters listings inline
- Type tabs: All / Buy / Rent / Short-let / Commercial
- **If logged in**: avatar + "My Dashboard →" button
- **If not logged in**: "Sign in" + "List property →" → both go to login

### Listing card click
- "Apply Now" / "Book Now" / "Request Viewing" → `data-action="goto-login"` → login page

### Landing search
- Input triggers `STATE.landingQuery` update
- Filters apply locally against `DATA.listings` array
- "Search" button calls `loadListings()` with query params

---

## Auth Flow

### Login
```
goto-login action →
STATE.view = 'login', STATE.authMode = 'login' →
renderLogin() →
  Role picker (landlord | tenant | agent | estate_manager)
  Email + password fields
  "Sign in →" → doLogin()
    POST /api/auth/login →
    Auth.save(access, refresh, user) →
    If tenant: authStep = 2 (purpose picker)
    Else: enterDashboard(user)
```

### Purpose Picker (tenants only)
```
authStep === 2 →
  4 options: Rent / Buy / Short-let / Share →
  User picks →
  loginWithPurpose(purpose) →
  localStorage.setItem('propati_purpose', purpose) →
  enterDashboard(user)
```

### Signup
```
"Create one →" → STATE.authMode = 'signup' →
  Role picker
  Full name + email + phone (optional) + password + confirm password
  "Create Account →" → doSignup()
    POST /api/auth/signup →
    Welcome email sent (async) →
    Phone OTP sent if phone provided (async) →
    Auth.save() →
    enterDashboard(user)
```

### Forgot Password
```
"Forgot password?" → STATE.authMode = 'forgot' →
  Email field →
  "Send Reset Link →" → doForgotPassword()
    POST /api/auth/forgot-password →
    Success message shown (always, prevents enumeration)
    Email sent with link: ?reset=TOKEN&uid=USER_ID
```

### enterDashboard(user)
```
Sets: STATE.view = 'dashboard', STATE.role = user.role
If tenant: STATE.purpose = savedPurpose || 'rent'
If estate_manager: emPage = 'home', loads emOrg
Pre-loads: landlord → loadMyListings(), tenant/agent → loadListings()
```

---

## Landlord Dashboard

### Sidebar navigation
```
Dashboard (home) → renderLandlordScreen('home')
My Properties → renderLandlordScreen('properties')
Rent Collection → renderLandlordScreen('rent')
Add Listing → renderLandlordScreen('listing')
Screening Calls → renderLandlordScreen('screening')
Agreements → renderLandlordScreen('agreements') → renderAgreementsScreen('landlord')
Messages → renderLandlordScreen('messages')
Verify Property → renderLandlordScreen('verify')
My Profile → renderLandlordScreen('profile')
Sign Out → logout()
```

### Add Listing flow
```
Fill form (title, type, property type, address, price, beds, baths, sqm, description, amenities)
Pick photos (up to 10, preview shown)
"Submit Listing" → submitListing()
  1. POST /api/listings (creates draft record, returns listing.id)
  2. POST /api/listings/:id/images (FormData multipart, photos to Cloudinary)
  → navigate('properties')
```

### Property Verification wizard
```
Step 1 — Documents: upload C of O / Deed / Survey / Governor's Consent
  POST /api/verification/upload-doc (each file)
  POST /api/verification/submit-layer1
Step 2 — Identity: Prembly NIN/BVN lookup
  POST /api/verification/verify-identity
  User confirms → POST /api/verification/confirm-identity
Step 3 — Live Proof: upload video with QR code
  QR code displayed (unique per user)
  Upload video → POST (pending)
Step 4 — Inspection: schedule agent visit
  POST /api/verification/inspection
Step 5 — Certified: awaiting admin final review
```

### Tenant Screening
```
Tenant applies → conversation starts →
Landlord views messages →
"View Profile" → viewTenantProfile(tenantId)
  GET /api/users/tenant-profile/:userId →
  Bottom sheet modal: name, employment, income band, verification score, bio, guarantor
  "Message Tenant" → navigate('messages')
```

---

## Tenant Dashboard

### Purpose Switcher
```
4 buttons at top of home screen: Rent / Buy / Short-let / Share
Click → STATE.purpose = key, localStorage updated, render()
Changes: sidebar nav items, welcome card context, quick actions
```

### Sidebar (Rent mode — default)
```
Dashboard → home
Find Property → search
Rent & Payments → payments (loadTransactions)
My Agreements → agreements (loadAgreements)
Maintenance → maintenance
Screening Call → screening
My Profile → profile (loadTenantProfile)
Receipts → receipts (loadReceipts)
Messages → messages
Sign Out → logout()
```

### Search & Apply flow
```
navigate('search') → loadListings() →
Grid of listing cards →
"Apply & Message" → openConversation(landlordId, listingId, title)
  POST /api/messages/conversations (idempotent)
  navigate('messages')
  Opens conversation with initial message
```

### Profile completion flow
```
Home banner: "Complete your profile" (if employment or income missing) →
"Complete →" → navigate('profile')
  renderTenantProfilePage() →
  Identity section (renderIdentitySection('tenant'))
  Edit form: full name, phone, bio, employment, income, guarantor
  "💾 Save Profile" → saveTenantProfile()
    PATCH /api/users/profile (name/phone)
    PATCH /api/users/tenant-profile (employment, income, etc.)
  Phone verification widget (if phone not verified)
    "Send OTP via WhatsApp" → sendPhoneOTP()
    Enter 6-digit code → verifyPhoneOTP()
```

### Agreements flow
```
navigate('agreements') → loadAgreements() →
renderAgreementsScreen('tenant') →
List of agreements with status badges →
"📄 View / Download" → viewAgreementPDF(id) (opens new tab)
"✍️ Sign Agreement" → signAgreement(id)
  POST /api/agreements/:id/sign {consent: true} →
  Records: signer_id, timestamp, IP, consent_text, checksum →
  Status updated: tenant_signed or fully_signed
```

---

## Agent Dashboard

```
Dashboard → home (pipeline stats)
Deal Pipeline → pipeline
Managed Listings → listings
Inspections → inspections
Commissions → commissions
My Clients → clients
Reputation → reputation
My Profile → profile (identity verification)
Messages → messages
Sign Out → logout()
```

---

## Admin Console

```
Admin logs in → STATE.role = 'admin' → renderAdmin() →
Sidebar: Overview / Verification Queue / Flags / Disputes / Users / Revenue / Settings

Verification Queue:
  loadAdminVerifQueue() → GET /api/verification/admin/queue →
  renderAdminVerifQueue() →
  Per listing: layer badges, doc links, approve/reject buttons →
  "✅ Approve Layer N" → adminReviewLayer(listingId, layer, 'approved', '') →
    POST /api/verification/admin/review →
    Owner notified by email/SMS
  "❌ Reject" → prompt for reason → adminReviewLayer(..., 'rejected', reason)
  "⭐ Grant Certified" → approves Layer 5
```

---

## Estate Manager Dashboard

### First login (no org)
```
loadEmOrg() → GET /api/orgs/mine → 404 (no org) →
DATA.emOrg = false →
renderEstateManager() → onboarding wizard

Step 1: Create Org
  name, billing_email, address, cac_number →
  POST /api/orgs → org created, user added as manager member

Step 2: Choose Plan
  Starter / Growth / Enterprise cards →
  POST /api/orgs/:id/subscribe →
  Paystack checkout URL opened

Step 3: Done → emPage = 'home'
```

### EM Sidebar
```
Home (overview KPIs)
Portfolio → loadEmPortfolio() → GET /api/orgs/:id/portfolio
Rent Ledger → loadEmLedger() → GET /api/orgs/:id/ledger
Maintenance → loadEmTickets() → GET /api/orgs/:id/tickets
Bulk Import → bulk-upload screen
Agreements → org agreements
Team → loadEmTeam() → GET /api/orgs/:id/team
Billing → loadEmSubscription() → GET /api/orgs/:id/subscription
Reports → month picker → GET /api/orgs/:id/reports/:month
Sign Out → logout()
```

### Maintenance ticket flow
```
Filter tabs: All / Open / Assigned / In Progress / Resolved →
Create ticket: title, category, priority, property, tenant →
  POST /api/orgs/:id/tickets →
Update ticket: click status → emUpdateTicket(orgId, ticketId, {status}) →
  PATCH /api/orgs/:id/tickets/:tid →
  If resolved: SMS sent to tenant
```

---

## Messaging System

```
loadConversations() → GET /api/messages/conversations →
Left panel: conversation list with unread badges
Click conversation → DATA.activeConv = conv
  GET /api/messages/conversations/:id (marks read) →
  startMsgPolling(convId):
    every 4s: GET /api/messages/conversations/:id/messages?since=LAST_TIMESTAMP
    New messages appended, scroll to bottom

Send message:
  Type in input → Enter or Send button →
  POST /api/messages/conversations/:id/messages {content: '...'} →
  Optimistic UI: message added immediately, then confirmed by poll

Start new conversation (from listing):
  openConversation(landlordId, listingId, title) →
  POST /api/messages/conversations {landlord_id, listing_id, initial_message} →
  navigate('messages')
```

---

## Session Management

```
On every page load:
  render() called →
  checkSession():
    1. Restore role from localStorage immediately (no flash)
    2. GET /api/auth/me →
       If OK: Auth.save(tokens, user) → enterDashboard(user)
       If 401: apiCall retries with refresh token →
         POST /api/auth/refresh → new tokens → retry original request
       If refresh fails: Auth.clear() → STATE.view = 'landing'

Token refresh (automatic):
  Any API call returns 401 →
  apiCall() catches it →
  POST /api/auth/refresh →
  New access token stored →
  Original request retried once
```

---

## Error States

| Situation | What Happens |
|-----------|-------------|
| API unreachable | toast "Connection failed" |
| 401 (expired token) | silent refresh + retry |
| 401 (refresh expired) | logout → landing |
| 403 (wrong role) | toast error message |
| 404 (not found) | inline empty state in component |
| 422 (validation) | inline error below form |
| 500 (server error) | toast "Something went wrong" |
| EM org not found | show onboarding wizard |
| No listings | empty state card with CTA |
