# PROPATI — Backend Structure

## Database Schema

All queries use PostgreSQL parameterised syntax: `$1`, `$2`, etc. Never string concatenation.

---

### `users`
```sql
CREATE TABLE users (
  id                TEXT PRIMARY KEY,           -- 'usr_' + 16 chars
  email             TEXT UNIQUE NOT NULL,
  phone             TEXT UNIQUE,
  password          TEXT NOT NULL,              -- bcrypt hash, cost 12
  role              TEXT NOT NULL CHECK(role IN ('landlord','tenant','agent','admin','estate_manager')),
  full_name         TEXT NOT NULL,
  avatar_url        TEXT,

  -- KYC (encrypted)
  nin_encrypted     TEXT,                       -- AES-256-GCM
  nin_hash          TEXT,                       -- HMAC-SHA256 for lookup
  nin_verified      BOOLEAN DEFAULT FALSE,
  bvn_encrypted     TEXT,
  id_type           TEXT CHECK(id_type IN ('nin','bvn','passport','drivers_licence','voters_card')),
  id_number_enc     TEXT,
  id_verified       BOOLEAN DEFAULT FALSE,
  id_doc_url        TEXT,
  phone_verified    BOOLEAN DEFAULT FALSE,

  -- Employment (tenant profile)
  employment_status TEXT CHECK(employment_status IN ('employed','self_employed','business_owner','student','retired','unemployed')),
  employment_type   TEXT CHECK(employment_type IN ('full_time','part_time','contract','freelance','internship')),
  employer_name     TEXT,
  job_title         TEXT,
  yearly_income     BIGINT,                     -- stored encrypted conceptually, never exposed directly
  income_verified   BOOLEAN DEFAULT FALSE,
  profile_bio       TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  guarantor_name    TEXT,
  guarantor_phone   TEXT,
  guarantor_relationship TEXT,

  -- Status
  is_active         BOOLEAN DEFAULT TRUE,
  is_banned         BOOLEAN DEFAULT FALSE,
  ban_reason        TEXT,

  -- Agent
  agent_tier        TEXT DEFAULT 'standard' CHECK(agent_tier IN ('standard','senior','probation')),
  agent_approved    BOOLEAN DEFAULT FALSE,
  agent_bio         TEXT,
  agent_areas       JSONB,                      -- array of area strings

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  last_login        TIMESTAMPTZ
);
```

### `refresh_tokens`
```sql
CREATE TABLE refresh_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,                   -- bcrypt hash of refresh token
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `password_resets`
```sql
CREATE TABLE password_resets (
  id          TEXT PRIMARY KEY,
  user_id     TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,            -- 1 hour
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `phone_otps`
```sql
CREATE TABLE phone_otps (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
  otp_hash    TEXT NOT NULL,                   -- bcrypt hash of 6-digit OTP
  expires_at  TIMESTAMPTZ NOT NULL,            -- 10 minutes
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `listings`
```sql
CREATE TABLE listings (
  id                TEXT PRIMARY KEY,           -- 'lst_' + 12 chars
  owner_id          TEXT REFERENCES users(id),
  agent_id          TEXT REFERENCES users(id),
  title             TEXT NOT NULL,
  description       TEXT,
  listing_type      TEXT NOT NULL CHECK(listing_type IN ('rent','sale','short-let','share','commercial')),
  property_type     TEXT CHECK(property_type IN ('apartment','house','duplex','land','office','shop','warehouse')),
  address           TEXT NOT NULL,
  area              TEXT NOT NULL,
  state             TEXT DEFAULT 'Lagos',
  price             NUMERIC NOT NULL,
  price_period      TEXT CHECK(price_period IN ('night','month','year','total')),
  caution_deposit   NUMERIC,
  service_charge    NUMERIC,
  bedrooms          INT,
  bathrooms         INT,
  toilets           INT,
  size_sqm          NUMERIC,
  floor_level       INT,
  furnished         BOOLEAN DEFAULT FALSE,
  parking_spaces    INT DEFAULT 0,
  amenities         JSONB,
  available_from    DATE,
  minimum_stay      INT,
  status            TEXT DEFAULT 'draft' CHECK(status IN ('draft','active','suspended','deleted')),
  verification_tier TEXT DEFAULT 'basic' CHECK(verification_tier IN ('basic','verified','inspected','certified')),
  is_featured       BOOLEAN DEFAULT FALSE,
  views_count       INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### `listing_images`
```sql
CREATE TABLE listing_images (
  id          TEXT PRIMARY KEY,
  listing_id  TEXT REFERENCES listings(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,                   -- Cloudinary secure_url
  public_id   TEXT,                            -- Cloudinary public_id for deletion
  is_cover    BOOLEAN DEFAULT FALSE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `saved_listings`
```sql
CREATE TABLE saved_listings (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
  listing_id  TEXT REFERENCES listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);
```

### `listing_flags`
```sql
CREATE TABLE listing_flags (
  id          TEXT PRIMARY KEY,
  listing_id  TEXT REFERENCES listings(id) ON DELETE CASCADE,
  flagged_by  TEXT REFERENCES users(id),
  type        TEXT CHECK(type IN ('fraud','duplicate','misleading','wrong_price','harassment','other')),
  description TEXT,
  status      TEXT DEFAULT 'open' CHECK(status IN ('open','reviewed','dismissed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `verifications`
```sql
CREATE TABLE verifications (
  id              TEXT PRIMARY KEY,
  listing_id      TEXT UNIQUE REFERENCES listings(id) ON DELETE CASCADE,
  owner_id        TEXT REFERENCES users(id),
  l1_status       TEXT DEFAULT 'pending' CHECK(l1_status IN ('pending','approved','rejected')),
  l1_doc_url      TEXT,
  l1_submitted_at TIMESTAMPTZ,
  l2_status       TEXT DEFAULT 'pending' CHECK(l2_status IN ('pending','approved','rejected')),
  l2_id_type      TEXT,
  l2_verified_at  TIMESTAMPTZ,
  l3_status       TEXT DEFAULT 'pending',
  l4_status       TEXT DEFAULT 'pending',
  l5_status       TEXT DEFAULT 'pending',
  current_layer   INT DEFAULT 1,
  overall_status  TEXT DEFAULT 'not_started' CHECK(overall_status IN ('not_started','in_progress','certified','rejected')),
  admin_notes     TEXT,
  reviewed_by     TEXT REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `transactions`
```sql
CREATE TABLE transactions (
  id                TEXT PRIMARY KEY,           -- 'txn_' + 12 chars
  reference         TEXT UNIQUE,               -- Paystack reference
  listing_id        TEXT REFERENCES listings(id),
  payer_id          TEXT REFERENCES users(id),
  payee_id          TEXT REFERENCES users(id),
  agent_id          TEXT REFERENCES users(id),
  type              TEXT CHECK(type IN ('rent','caution','sale','short_let','subscription')),
  status            TEXT CHECK(status IN ('pending','in_escrow','released','failed','refunded')),
  amount            BIGINT NOT NULL,            -- kobo
  platform_fee      BIGINT DEFAULT 0,
  agent_commission  BIGINT DEFAULT 0,
  payee_amount      BIGINT,
  description       TEXT,
  paystack_data     JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### `agreements`
```sql
CREATE TABLE agreements (
  id                  TEXT PRIMARY KEY,         -- 'agr_' + 12 chars
  listing_id          TEXT REFERENCES listings(id),
  landlord_id         TEXT REFERENCES users(id),
  tenant_id           TEXT REFERENCES users(id),
  agent_id            TEXT REFERENCES users(id),
  type                TEXT CHECK(type IN ('rental','sale','short_let','share')),
  status              TEXT DEFAULT 'draft' CHECK(status IN ('draft','pending_landlord','pending_tenant','tenant_signed','landlord_signed','fully_signed','terminated','expired')),
  start_date          DATE,
  end_date            DATE,
  rent_amount         NUMERIC,
  rent_period         TEXT CHECK(rent_period IN ('monthly','yearly')),
  caution_deposit     NUMERIC,
  service_charge      NUMERIC,
  notice_period_days  INT DEFAULT 30,
  special_clauses     TEXT,
  landlord_signed_at  TIMESTAMPTZ,
  tenant_signed_at    TIMESTAMPTZ,
  template_vars       JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### `agreement_signatures`
```sql
CREATE TABLE agreement_signatures (
  id            TEXT PRIMARY KEY,
  agreement_id  TEXT REFERENCES agreements(id) ON DELETE CASCADE,
  signer_id     TEXT REFERENCES users(id),
  role          TEXT CHECK(role IN ('landlord','tenant','agent')),
  ip_address    TEXT,
  user_agent    TEXT,
  consent_text  TEXT,
  signed_at     TIMESTAMPTZ DEFAULT NOW(),
  checksum      TEXT                           -- SHA256 of doc_url + signer_id + signed_at
);
```

### `rent_schedule`
```sql
CREATE TABLE rent_schedule (
  id              TEXT PRIMARY KEY,
  agreement_id    TEXT REFERENCES agreements(id) ON DELETE CASCADE,
  due_date        TEXT,                        -- 'YYYY-MM-DD'
  amount          NUMERIC,
  status          TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming','paid','overdue')),
  paid_at         TIMESTAMPTZ,
  transaction_id  TEXT REFERENCES transactions(id),
  reminder_sent   INT DEFAULT 0
);
```

### `conversations`
```sql
CREATE TABLE conversations (
  id              TEXT PRIMARY KEY,            -- 'cnv_' + 12 chars
  listing_id      TEXT REFERENCES listings(id) ON DELETE SET NULL,
  landlord_id     TEXT NOT NULL REFERENCES users(id),
  tenant_id       TEXT NOT NULL REFERENCES users(id),
  subject         TEXT,
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  unread_tenant   INT DEFAULT 0,
  unread_landlord INT DEFAULT 0,
  status          TEXT DEFAULT 'active' CHECK(status IN ('active','archived','blocked')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `messages`
```sql
CREATE TABLE messages (
  id              TEXT PRIMARY KEY,            -- 'msg_' + 12 chars
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL REFERENCES users(id),
  content         TEXT NOT NULL,
  attachment_url  TEXT,
  attachment_type TEXT CHECK(attachment_type IN ('image','document','voice')),
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `notifications`
```sql
CREATE TABLE notifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT,
  title       TEXT,
  body        TEXT,
  data        JSONB,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `organisations`
```sql
CREATE TABLE organisations (
  id                  TEXT PRIMARY KEY,        -- 'org_' + 12 chars
  name                TEXT NOT NULL,
  owner_id            TEXT REFERENCES users(id),
  billing_email       TEXT,
  address             TEXT,
  cac_number          TEXT,
  plan_tier           TEXT DEFAULT 'starter' CHECK(plan_tier IN ('starter','growth','enterprise')),
  max_units           INT DEFAULT 20,
  max_seats           INT DEFAULT 1,
  paystack_customer_id TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ
);
```

### `org_members`
```sql
CREATE TABLE org_members (
  id            TEXT PRIMARY KEY,
  org_id        TEXT REFERENCES organisations(id) ON DELETE CASCADE,
  user_id       TEXT REFERENCES users(id),
  email         TEXT,
  role          TEXT CHECK(role IN ('manager','accountant','maintenance','owner_view')),
  status        TEXT DEFAULT 'pending' CHECK(status IN ('pending','active','removed')),
  invited_by    TEXT REFERENCES users(id),
  invite_token  TEXT,
  joined_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);
```

### `org_listings`
```sql
CREATE TABLE org_listings (
  id          TEXT PRIMARY KEY,
  org_id      TEXT REFERENCES organisations(id) ON DELETE CASCADE,
  listing_id  TEXT REFERENCES listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, listing_id)
);
```

### `maintenance_tickets`
```sql
CREATE TABLE maintenance_tickets (
  id              TEXT PRIMARY KEY,            -- 'tkt_' + 12 chars
  org_id          TEXT REFERENCES organisations(id),
  listing_id      TEXT REFERENCES listings(id),
  tenant_id       TEXT REFERENCES users(id),
  raised_by       TEXT REFERENCES users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT CHECK(category IN ('plumbing','electrical','structural','security','cleaning','other')),
  priority        TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
  status          TEXT DEFAULT 'open' CHECK(status IN ('open','assigned','in_progress','resolved','closed')),
  assigned_to     TEXT REFERENCES users(id),
  photo_urls      TEXT[],
  resolution_note TEXT,
  resolved_at     TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ
);
```

### `org_subscriptions`
```sql
CREATE TABLE org_subscriptions (
  id                    TEXT PRIMARY KEY,
  org_id                TEXT REFERENCES organisations(id) ON DELETE CASCADE,
  paystack_sub_id       TEXT UNIQUE,
  plan                  TEXT,
  status                TEXT DEFAULT 'active' CHECK(status IN ('active','paused','cancelled')),
  amount                BIGINT,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  next_billing_date     TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);
```

### `disputes`
```sql
CREATE TABLE disputes (
  id          TEXT PRIMARY KEY,
  listing_id  TEXT REFERENCES listings(id),
  raised_by   TEXT REFERENCES users(id),
  type        TEXT,
  status      TEXT DEFAULT 'open',
  description TEXT,
  resolution  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `screening_calls`
```sql
CREATE TABLE screening_calls (
  id            TEXT PRIMARY KEY,
  listing_id    TEXT REFERENCES listings(id),
  landlord_id   TEXT REFERENCES users(id),
  tenant_id     TEXT REFERENCES users(id),
  scheduled_at  TIMESTAMPTZ,
  status        TEXT DEFAULT 'scheduled',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### `email_log`
```sql
CREATE TABLE email_log (
  id          TEXT PRIMARY KEY,
  to_email    TEXT,
  subject     TEXT,
  status      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes

```sql
CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_nin_hash     ON users(nin_hash);
CREATE INDEX idx_listings_owner     ON listings(owner_id);
CREATE INDEX idx_listings_status    ON listings(status);
CREATE INDEX idx_listings_type      ON listings(listing_type);
CREATE INDEX idx_listings_area      ON listings(area);
CREATE INDEX idx_conversations_landlord ON conversations(landlord_id);
CREATE INDEX idx_conversations_tenant   ON conversations(tenant_id);
CREATE INDEX idx_messages_conv      ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender    ON messages(sender_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
```

---

## All API Endpoints

### Auth — `/api/auth`
```
POST /signup              Body: {email, password, full_name, role, phone?}
POST /login               Body: {email, password}
POST /logout              Auth required
GET  /me                  Auth required
POST /refresh             Body: {refresh_token}
POST /forgot-password     Body: {email}
POST /reset-password      Body: {token, user_id, password}
POST /send-phone-otp      Auth required
POST /verify-phone        Auth required. Body: {otp}
```

### Listings — `/api/listings`
```
GET    /                  Query: type, area, min_price, max_price, bedrooms, verified, q, page, limit, sort
GET    /owner/mine        Auth required
GET    /:id               Optional auth
POST   /                  Auth (landlord|agent|admin|estate_manager). Body: listing fields
PATCH  /:id               Auth (owner|admin)
DELETE /:id               Auth (owner|admin)
POST   /:id/images        Auth (owner|admin). Multipart: images[] (max 10)
POST   /:id/save          Auth
POST   /:id/flag          Auth. Body: {type, description?}
```

### Verification — `/api/verification`
```
GET    /:listing_id           Auth
POST   /upload-doc            Auth (landlord|estate_manager). Multipart: document
POST   /submit-layer1         Auth (landlord|estate_manager). Body: {listing_id}
POST   /identity              Auth (landlord|estate_manager)
POST   /inspection            Auth (landlord|estate_manager). Body: {listing_id, preferred_date, preferred_time, address}
POST   /verify-identity       Auth. Body: {type, number, dob?}
POST   /confirm-identity      Auth. Body: {listing_id, type, confirmed}
GET    /admin/queue           Auth (admin)
POST   /admin/review          Auth (admin). Body: {listing_id, layer, decision, notes?}
```

### Agreements — `/api/agreements`
```
POST   /              Auth (landlord|agent|admin|estate_manager)
GET    /              Auth
GET    /:id           Auth
POST   /:id/sign      Auth. Body: {consent: true, consent_text?}
GET    /:id/preview   Auth. Returns HTML
PATCH  /:id           Auth (landlord|admin). Body: {status?, special_clauses?}
```

### Messages — `/api/messages`
```
GET    /conversations                     Auth
POST   /conversations                     Auth. Body: {landlord_id, listing_id?, subject?, initial_message?}
GET    /conversations/:id                 Auth
GET    /conversations/:id/messages        Auth. Query: since? (ISO8601), limit?
POST   /conversations/:id/messages        Auth. Body: {content, attachment_url?, attachment_type?}
PATCH  /conversations/:id/read            Auth
DELETE /conversations/:id                 Auth
GET    /unread-count                      Auth
```

### Users — `/api/users`
```
GET    /profile                   Auth
PATCH  /profile                   Auth. Multipart: {full_name?, phone?, avatar?}
PATCH  /tenant-profile            Auth (tenant). Body: employment fields
GET    /tenant-profile/:userId    Auth (landlord|agent|admin)
GET    /notifications             Auth
POST   /notifications/read-all    Auth
GET    /saved-listings            Auth
GET    /agents                    Public. Query: area?, page?, limit?
GET    /receipts                  Auth (tenant)
GET    /admin/all                 Auth (admin). Query: role?, q?, page?, limit?
GET    /admin/stats               Auth (admin)
POST   /admin/:userId/suspend     Auth (admin). Body: {reason}
POST   /admin/:userId/approve-agent Auth (admin). Body: {approved: bool}
```

### Payments — `/api/payments`
```
POST   /initiate              Auth. Body: {listing_id, agreement_id, amount, type}
POST   /webhook               No auth (Paystack webhook, raw body)
GET    /transactions          Auth
GET    /transactions/:id      Auth
POST   /release-escrow/:id    Auth (admin)
```

### Organisations — `/api/orgs`
```
POST   /                          Auth. Body: {name, billing_email, address?, cac_number?}
GET    /mine                      Auth
GET    /bulk-template.csv         Public
PATCH  /:id                       Auth (manager)
GET    /:id/portfolio             Auth (org member)
GET    /:id/team                  Auth (org member)
POST   /:id/invite                Auth (manager). Body: {email, role}
DELETE /:id/members/:uid          Auth (manager)
GET    /:id/tickets               Auth (org member). Query: status?, priority?, category?
POST   /:id/tickets               Auth (manager|maintenance). Body: {title, category?, priority?, property_id?, tenant_id?}
PATCH  /:id/tickets/:tid          Auth (manager|maintenance). Body: {status?, assigned_to?, resolution_note?, priority?}
GET    /:id/ledger                Auth (manager|accountant)
GET    /:id/subscription          Auth (manager|accountant)
POST   /:id/subscribe             Auth (manager). Body: {plan}
POST   /:id/bulk-upload           Auth (manager). Multipart: file (CSV)
GET    /:id/reports/:month        Auth (manager|accountant|owner_view). Param: YYYY-MM
```

---

## Middleware

### `authenticate` (auth.js)
Extracts JWT from `Authorization: Bearer TOKEN` header. Attaches `req.user` (full user row). Returns 401 if missing/invalid.

### `requireRole(...roles)` (auth.js)
```javascript
requireRole('landlord', 'admin')
// Returns 403 if req.user.role not in roles array
```

### `optionalAuth` (auth.js)
Attaches `req.user` if valid token present, continues without it if not.

### `requireOrgAccess(allowedRoles)` (orgs.js inline)
Checks `org_members` table. Falls back to checking `organisations.owner_id`. Attaches `req.orgRole`.

### `uploadImages` / `uploadDocument` / `uploadVideo` (upload.js)
Multer with memory storage. Max 10MB files (100MB video). Call `uploadToCloudinary(file.buffer, options)` after parsing.

### `uploadToCloudinary(buffer, options)`
```javascript
options = {
  subfolder: 'images' | 'documents' | 'videos' | 'avatars',
  resource_type: 'image' | 'raw' | 'video'
}
// Returns { secure_url, public_id }
// In dev (no Cloudinary env): returns placeholder URL
```

---

## Response Format

All endpoints return:
```json
// Success
{ "success": true, ...data }

// Error
{ "success": false, "error": "Human readable message", "details": [...] }
```

HTTP status codes:
- `200` — success
- `201` — created
- `400` — bad request
- `401` — unauthenticated
- `403` — forbidden
- `404` — not found
- `409` — conflict (duplicate)
- `422` — validation failed
- `500` — server error

---

## Fee Calculation

```javascript
function computeFees(type, amount) {
  const rates = {
    rent: 0.10, sale: amount > 20_000_000 ? 0.01 : 0.02,
    short_let: 0.05, commercial: 0.08, share: 0.05
  };
  const agentRate = {
    rent: 0.10, sale: amount > 20_000_000 ? 0.01 : 0.015, short_let: 0.03
  };
  const platformFee     = Math.round(amount * (rates[type] || 0.10));
  const agentCommission = Math.round(amount * (agentRate[type] || 0));
  const payeeAmount     = amount - platformFee;
  return { platformFee, agentCommission, payeeAmount };
}
```
