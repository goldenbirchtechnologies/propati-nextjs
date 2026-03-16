# PROPATI — Full Rebuild Prompt for Claude Code
# Copy everything below this line and paste as your first message

---

You are rebuilding PROPATI — Nigeria's verified property platform — from scratch.
Read every section of this document before writing a single line of code.
When done reading, confirm you understand the full scope, then wait for me to say "begin Phase 1".

---

## WHAT YOU ARE BUILDING

PROPATI is a Nigerian property marketplace + property management platform with 5 user roles:

| Role | What they do |
|------|-------------|
| Landlord | Lists properties, screens tenants, collects rent, signs agreements |
| Tenant | Searches, applies, pays rent, signs agreements |
| Agent | Manages listings on behalf of landlords, earns commissions |
| Admin | Approves verifications, resolves disputes, manages platform |
| Estate Manager | B2B SaaS — manages entire property portfolios for companies |

Core differentiator: **5-layer property verification** + **government identity verification via Dojah** + **legally-binding e-signatures with verified identity**.

---

## DECISIONS MADE — DO NOT CHANGE THESE

| Decision | Choice |
|----------|--------|
| Framework | Next.js 14 App Router |
| Language | TypeScript strict mode |
| Database ORM | Prisma 5 → Supabase PostgreSQL |
| Auth | Clerk (headless, no Clerk UI) |
| Email | Resend |
| Identity Verification | Dojah only (NO Prembly, NO BVN) |
| E-Signature | Custom built (NO DocuSign, NO HelloSign) |
| Identity in E-Signature | Dojah verification required before signing |
| i18n | next-intl, 5 languages, AI-generated translations |
| File Storage | Cloudinary |
| Payments | Paystack |
| SMS | Termii |
| WhatsApp OTP | Twilio |
| Error Tracking | Sentry |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Vercel |

---

## EXACT PACKAGE VERSIONS

```bash
# Create project
npx create-next-app@14.2.0 propati \
  --typescript --tailwind --eslint \
  --app --src-dir --import-alias "@/*"

cd propati

# Core packages
npm install \
  prisma@5.14.0 \
  @prisma/client@5.14.0 \
  @clerk/nextjs@5.2.0 \
  resend@3.3.0 \
  @sentry/nextjs@8.13.0 \
  cloudinary@2.0.1 \
  axios@1.7.2 \
  zod@3.23.8 \
  @tanstack/react-query@5.48.0 \
  next-intl@3.17.0 \
  pdfkit@0.14.0 \
  bcryptjs@2.4.3 \
  date-fns@3.6.0 \
  lucide-react@0.400.0 \
  svix@1.21.0

npm install -D \
  @types/bcryptjs@2.4.6 \
  @types/pdfkit@0.13.4 \
  @types/node@20 \
  tsx@4.15.0

# shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add \
  button input label card badge dialog \
  sheet tabs select textarea toast avatar \
  dropdown-menu separator skeleton progress \
  alert form
```

---

## PROJECT STRUCTURE

Create exactly this. Every file listed must exist.

```
propati/
├── src/
│   ├── app/
│   │   ├── [locale]/                         ← next-intl locale wrapper
│   │   │   ├── (marketing)/                  ← public, SSR, SEO-indexed
│   │   │   │   ├── page.tsx                  ← landing + marketplace
│   │   │   │   ├── listings/
│   │   │   │   │   └── [id]/page.tsx         ← listing detail (SSR for Google)
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/                  ← authenticated, client-rendered
│   │   │   │   ├── layout.tsx                ← Clerk auth guard
│   │   │   │   ├── onboarding/page.tsx       ← role picker for new users
│   │   │   │   ├── landlord/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── listings/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── new/page.tsx
│   │   │   │   │   ├── rent/page.tsx
│   │   │   │   │   ├── agreements/page.tsx
│   │   │   │   │   ├── messages/page.tsx
│   │   │   │   │   ├── screening/page.tsx
│   │   │   │   │   ├── verify/page.tsx
│   │   │   │   │   └── profile/page.tsx
│   │   │   │   ├── tenant/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── search/page.tsx
│   │   │   │   │   ├── agreements/page.tsx
│   │   │   │   │   ├── payments/page.tsx
│   │   │   │   │   ├── receipts/page.tsx
│   │   │   │   │   ├── messages/page.tsx
│   │   │   │   │   ├── maintenance/page.tsx
│   │   │   │   │   └── profile/page.tsx
│   │   │   │   ├── agent/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── listings/page.tsx
│   │   │   │   │   ├── pipeline/page.tsx
│   │   │   │   │   ├── commissions/page.tsx
│   │   │   │   │   └── profile/page.tsx
│   │   │   │   ├── admin/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── verification/page.tsx
│   │   │   │   │   ├── flags/page.tsx
│   │   │   │   │   ├── disputes/page.tsx
│   │   │   │   │   └── users/page.tsx
│   │   │   │   └── estate-manager/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── portfolio/page.tsx
│   │   │   │       ├── rent/page.tsx
│   │   │   │       ├── maintenance/page.tsx
│   │   │   │       ├── team/page.tsx
│   │   │   │       ├── billing/page.tsx
│   │   │   │       └── reports/page.tsx
│   │   │   ├── sign/
│   │   │   │   └── [token]/
│   │   │   │       ├── page.tsx              ← public signing page
│   │   │   │       └── SigningForm.tsx        ← client component
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── listings/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── images/route.ts
│   │   │   ├── verification/
│   │   │   │   ├── route.ts
│   │   │   │   └── admin/route.ts
│   │   │   ├── agreements/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── send-for-signing/route.ts
│   │   │   │       ├── audit/route.ts
│   │   │   │       └── download/route.ts
│   │   │   ├── sign/
│   │   │   │   ├── verify-identity/route.ts  ← Dojah check (public)
│   │   │   │   └── [token]/route.ts          ← submit signature (public)
│   │   │   ├── messages/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── messages/route.ts
│   │   │   ├── users/
│   │   │   │   ├── profile/route.ts
│   │   │   │   ├── tenant-profile/route.ts
│   │   │   │   ├── notifications/route.ts
│   │   │   │   ├── receipts/route.ts
│   │   │   │   └── admin/
│   │   │   │       ├── route.ts
│   │   │   │       └── [id]/route.ts
│   │   │   ├── payments/
│   │   │   │   ├── initiate/route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   ├── orgs/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── portfolio/route.ts
│   │   │   │       ├── tickets/route.ts
│   │   │   │       ├── ledger/route.ts
│   │   │   │       ├── team/route.ts
│   │   │   │       ├── subscribe/route.ts
│   │   │   │       └── reports/[month]/route.ts
│   │   │   └── webhooks/
│   │   │       └── clerk/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx                        ← root (no locale)
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                               ← shadcn (auto-generated)
│   │   ├── layout/
│   │   │   ├── DashboardShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── listings/
│   │   │   ├── ListingCard.tsx
│   │   │   ├── ListingGrid.tsx
│   │   │   ├── ListingFilters.tsx
│   │   │   └── ListingForm.tsx
│   │   ├── messaging/
│   │   │   ├── ConversationList.tsx
│   │   │   ├── MessageThread.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── verification/
│   │   │   ├── PropertyVerifyWizard.tsx
│   │   │   ├── IdentityVerifyBlock.tsx       ← reusable Dojah widget
│   │   │   └── AdminVerifQueue.tsx
│   │   ├── esignature/
│   │   │   ├── SigningPage.tsx
│   │   │   ├── IdentityStep.tsx              ← Step 1: Dojah verify
│   │   │   └── SignStep.tsx                  ← Step 2: sign document
│   │   ├── agreements/
│   │   │   ├── AgreementCard.tsx
│   │   │   └── AuditTrail.tsx
│   │   └── shared/
│   │       ├── LanguageSwitcher.tsx
│   │       ├── TrustBadge.tsx
│   │       ├── VerifiedBadge.tsx
│   │       ├── NairaCurrency.tsx
│   │       └── EmptyState.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── dojah.ts                          ← identity verification
│   │   ├── cloudinary.ts
│   │   ├── resend.ts                         ← all email templates
│   │   ├── paystack.ts
│   │   ├── termii.ts
│   │   ├── twilio.ts
│   │   ├── encryption.ts                     ← AES-256-GCM
│   │   ├── pdf.ts                            ← PDFKit agreement generation
│   │   ├── fees.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useListings.ts
│   │   ├── useMessages.ts
│   │   ├── useConversations.ts
│   │   └── useUserRole.ts
│   ├── messages/                             ← i18n translation files
│   │   ├── en.json                           ← master (AI generates others from this)
│   │   ├── yo.json                           ← Yoruba (AI generated)
│   │   ├── ig.json                           ← Igbo (AI generated)
│   │   ├── ha.json                           ← Hausa (AI generated)
│   │   └── fr.json                           ← French (AI generated)
│   ├── i18n/
│   │   ├── routing.ts
│   │   └── request.ts
│   └── types/
│       ├── index.ts
│       └── api.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── scripts/
│   └── generate-translations.ts             ← AI translation script
├── public/
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
└── .env.local
```

---

## ENVIRONMENT VARIABLES

Create `.env.local`:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Supabase)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-2.supabase.com:5432/postgres"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="PROPATI <hello@propati.ng>"
RESEND_FROM_AGREEMENTS="PROPATI Agreements <agreements@propati.ng>"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...

# Dojah (identity verification — FREE TIER: 100/month free)
DOJAH_APP_ID=
DOJAH_SECRET_KEY=

# Termii (Nigerian SMS)
TERMII_API_KEY=
TERMII_SENDER_ID=PROPATI

# Twilio (WhatsApp OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=+14155238886

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Encryption (generate: openssl rand -hex 32)
ENCRYPTION_KEY=

# Anthropic (for AI translation script only)
ANTHROPIC_API_KEY=
```

---

## PRISMA SCHEMA

Create `prisma/schema.prisma` exactly as follows:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole {
  landlord
  tenant
  agent
  admin
  estate_manager
}

enum ListingType {
  rent
  sale
  short_let  @map("short-let")
  share
  commercial
}

enum ListingStatus {
  draft
  active
  suspended
  deleted
}

enum VerificationTier {
  basic
  verified
  inspected
  certified
}

enum AgreementStatus {
  draft
  pending_landlord
  pending_tenant
  tenant_signed
  landlord_signed
  fully_signed
  terminated
  expired
}

enum TicketStatus {
  open
  assigned
  in_progress
  resolved
  closed
}

enum TicketPriority {
  low
  medium
  high
  urgent
}

model User {
  id                    String    @id @default(cuid())
  clerkUserId           String?   @unique @map("clerk_user_id")
  email                 String    @unique
  phone                 String?   @unique
  fullName              String    @map("full_name")
  avatarUrl             String?   @map("avatar_url")
  role                  UserRole  @default(tenant)

  // Identity (Dojah verified)
  idType                String?   @map("id_type")
  idNumberMasked        String?   @map("id_number_masked")
  idVerifiedName        String?   @map("id_verified_name")
  ninVerified           Boolean   @default(false) @map("nin_verified")
  idVerified            Boolean   @default(false) @map("id_verified")
  phoneVerified         Boolean   @default(false) @map("phone_verified")
  dojahRef              String?   @map("dojah_ref")
  identityVerifiedAt    DateTime? @map("identity_verified_at")

  // Tenant employment profile
  employmentStatus      String?   @map("employment_status")
  employmentType        String?   @map("employment_type")
  employerName          String?   @map("employer_name")
  jobTitle              String?   @map("job_title")
  yearlyIncome          BigInt?   @map("yearly_income")
  incomeVerified        Boolean   @default(false) @map("income_verified")
  profileBio            String?   @map("profile_bio")
  profileCompleted      Boolean   @default(false) @map("profile_completed")
  guarantorName         String?   @map("guarantor_name")
  guarantorPhone        String?   @map("guarantor_phone")
  guarantorRelationship String?   @map("guarantor_relationship")

  // Account status
  isActive              Boolean   @default(true)  @map("is_active")
  isBanned              Boolean   @default(false) @map("is_banned")
  banReason             String?   @map("ban_reason")

  // Agent fields
  agentTier             String    @default("standard") @map("agent_tier")
  agentApproved         Boolean   @default(false) @map("agent_approved")
  agentBio              String?   @map("agent_bio")
  agentAreas            Json?     @map("agent_areas")

  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt      @map("updated_at")
  lastLogin             DateTime?                 @map("last_login")

  listings              Listing[]          @relation("OwnerListings")
  agentListings         Listing[]          @relation("AgentListings")
  landlordConversations Conversation[]     @relation("LandlordConvs")
  tenantConversations   Conversation[]     @relation("TenantConvs")
  sentMessages          Message[]
  landlordAgreements    Agreement[]        @relation("LandlordAgreements")
  tenantAgreements      Agreement[]        @relation("TenantAgreements")
  notifications         Notification[]
  savedListings         SavedListing[]
  orgMemberships        OrgMember[]
  ownedOrgs             Organisation[]
  transactions          Transaction[]      @relation("PayerTransactions")

  @@map("users")
}

model Listing {
  id               String           @id @default(cuid())
  ownerId          String           @map("owner_id")
  agentId          String?          @map("agent_id")
  title            String
  description      String?
  listingType      ListingType      @map("listing_type")
  propertyType     String?          @map("property_type")
  address          String
  area             String
  state            String           @default("Lagos")
  price            Decimal          @db.Decimal(15, 2)
  pricePeriod      String           @map("price_period")
  cautionDeposit   Decimal?         @map("caution_deposit") @db.Decimal(15, 2)
  serviceCharge    Decimal?         @map("service_charge")  @db.Decimal(15, 2)
  bedrooms         Int?
  bathrooms        Int?
  sizeSqm          Decimal?         @map("size_sqm") @db.Decimal(10, 2)
  furnished        Boolean          @default(false)
  amenities        Json?
  status           ListingStatus    @default(draft)
  verificationTier VerificationTier @default(basic) @map("verification_tier")
  isFeatured       Boolean          @default(false) @map("is_featured")
  viewsCount       Int              @default(0)     @map("views_count")
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt      @map("updated_at")

  owner            User             @relation("OwnerListings", fields: [ownerId], references: [id])
  agent            User?            @relation("AgentListings", fields: [agentId], references: [id])
  images           ListingImage[]
  savedBy          SavedListing[]
  flags            ListingFlag[]
  verification     Verification?
  conversations    Conversation[]
  agreements       Agreement[]
  orgListings      OrgListing[]

  @@map("listings")
}

model ListingImage {
  id        String   @id @default(cuid())
  listingId String   @map("listing_id")
  url       String
  publicId  String?  @map("public_id")
  isCover   Boolean  @default(false) @map("is_cover")
  sortOrder Int      @default(0)     @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("listing_images")
}

model SavedListing {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  listingId String   @map("listing_id")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([userId, listingId])
  @@map("saved_listings")
}

model ListingFlag {
  id          String   @id @default(cuid())
  listingId   String   @map("listing_id")
  flaggedById String   @map("flagged_by")
  type        String
  description String?
  status      String   @default("open")
  createdAt   DateTime @default(now()) @map("created_at")

  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("listing_flags")
}

model Verification {
  id            String    @id @default(cuid())
  listingId     String    @unique @map("listing_id")
  ownerId       String    @map("owner_id")
  l1Status      String    @default("pending") @map("l1_status")
  l1DocUrl      String?   @map("l1_doc_url")
  l1SubmittedAt DateTime? @map("l1_submitted_at")
  l2Status      String    @default("pending") @map("l2_status")
  l2IdType      String?   @map("l2_id_type")
  l2VerifiedAt  DateTime? @map("l2_verified_at")
  l3Status      String    @default("pending") @map("l3_status")
  l4Status      String    @default("pending") @map("l4_status")
  l5Status      String    @default("pending") @map("l5_status")
  currentLayer  Int       @default(1)         @map("current_layer")
  overallStatus String    @default("not_started") @map("overall_status")
  adminNotes    String?   @map("admin_notes")
  reviewedBy    String?   @map("reviewed_by")
  reviewedAt    DateTime? @map("reviewed_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  listing       Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("verifications")
}

model Conversation {
  id             String    @id @default(cuid())
  listingId      String?   @map("listing_id")
  landlordId     String    @map("landlord_id")
  tenantId       String    @map("tenant_id")
  subject        String?
  lastMessage    String?   @map("last_message")
  lastMessageAt  DateTime? @map("last_message_at")
  unreadTenant   Int       @default(0) @map("unread_tenant")
  unreadLandlord Int       @default(0) @map("unread_landlord")
  status         String    @default("active")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt      @map("updated_at")

  listing        Listing?  @relation(fields: [listingId], references: [id], onDelete: SetNull)
  landlord       User      @relation("LandlordConvs", fields: [landlordId], references: [id])
  tenant         User      @relation("TenantConvs",   fields: [tenantId],   references: [id])
  messages       Message[]

  @@map("conversations")
}

model Message {
  id             String       @id @default(cuid())
  conversationId String       @map("conversation_id")
  senderId       String       @map("sender_id")
  content        String
  attachmentUrl  String?      @map("attachment_url")
  attachmentType String?      @map("attachment_type")
  isRead         Boolean      @default(false) @map("is_read")
  readAt         DateTime?    @map("read_at")
  createdAt      DateTime     @default(now()) @map("created_at")

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         User         @relation(fields: [senderId], references: [id])

  @@map("messages")
}

model Agreement {
  id                   String          @id @default(cuid())
  listingId            String          @map("listing_id")
  landlordId           String          @map("landlord_id")
  tenantId             String          @map("tenant_id")
  agentId              String?         @map("agent_id")
  type                 String
  status               AgreementStatus @default(draft)
  startDate            DateTime?       @map("start_date") @db.Date
  endDate              DateTime?       @map("end_date")   @db.Date
  rentAmount           Decimal?        @map("rent_amount")      @db.Decimal(15, 2)
  rentPeriod           String?         @map("rent_period")
  cautionDeposit       Decimal?        @map("caution_deposit")  @db.Decimal(15, 2)
  specialClauses       String?         @map("special_clauses")
  landlordSignedAt     DateTime?       @map("landlord_signed_at")
  tenantSignedAt       DateTime?       @map("tenant_signed_at")

  // E-signature tokens (hashed — raw tokens sent in email only, never stored)
  landlordTokenHash    String?         @map("landlord_token_hash")
  landlordTokenExpires DateTime?       @map("landlord_token_expires")
  tenantTokenHash      String?         @map("tenant_token_hash")
  tenantTokenExpires   DateTime?       @map("tenant_token_expires")

  // PDFs on Cloudinary
  draftPdfUrl          String?         @map("draft_pdf_url")
  signedPdfUrl         String?         @map("signed_pdf_url")
  documentHash         String?         @map("document_hash")    // SHA256 of draft PDF

  createdAt            DateTime        @default(now()) @map("created_at")
  updatedAt            DateTime        @updatedAt      @map("updated_at")

  listing              Listing         @relation(fields: [listingId],  references: [id])
  landlord             User            @relation("LandlordAgreements", fields: [landlordId], references: [id])
  tenant               User            @relation("TenantAgreements",   fields: [tenantId],   references: [id])
  signatures           AgreementSignature[]
  rentSchedule         RentSchedule[]

  @@map("agreements")
}

model AgreementSignature {
  id                  String    @id @default(cuid())
  agreementId         String    @map("agreement_id")
  signerId            String    @map("signer_id")
  role                String

  // Signing metadata
  ipAddress           String?   @map("ip_address")
  userAgent           String?   @map("user_agent")
  consentText         String?   @map("consent_text")
  signedAt            DateTime  @default(now()) @map("signed_at")
  checksum            String?

  // Dojah identity verification (required before signing)
  idType              String?   @map("id_type")               // nin | drivers_license | voters_card
  idNumberMasked      String?   @map("id_number_masked")      // ****3421
  verifiedName        String?   @map("verified_name")         // name from Dojah
  verifiedDob         String?   @map("verified_dob")
  dojahRef            String?   @map("dojah_ref")
  identityVerifiedAt  DateTime? @map("identity_verified_at")

  agreement           Agreement @relation(fields: [agreementId], references: [id], onDelete: Cascade)

  @@map("agreement_signatures")
}

model RentSchedule {
  id            String    @id @default(cuid())
  agreementId   String    @map("agreement_id")
  dueDate       String    @map("due_date")
  amount        Decimal   @db.Decimal(15, 2)
  status        String    @default("upcoming")
  paidAt        DateTime? @map("paid_at")
  transactionId String?   @map("transaction_id")
  reminderSent  Int       @default(0) @map("reminder_sent")

  agreement     Agreement @relation(fields: [agreementId], references: [id], onDelete: Cascade)

  @@map("rent_schedule")
}

model Transaction {
  id              String   @id @default(cuid())
  reference       String?  @unique
  listingId       String?  @map("listing_id")
  payerId         String?  @map("payer_id")
  payeeId         String?  @map("payee_id")
  agentId         String?  @map("agent_id")
  type            String
  status          String
  amount          BigInt
  platformFee     BigInt   @default(0) @map("platform_fee")
  agentCommission BigInt   @default(0) @map("agent_commission")
  payeeAmount     BigInt?  @map("payee_amount")
  description     String?
  paystackData    Json?    @map("paystack_data")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt      @map("updated_at")

  payer           User?    @relation("PayerTransactions", fields: [payerId], references: [id])

  @@map("transactions")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  type      String
  title     String
  body      String?
  data      Json?
  read      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model Organisation {
  id                 String    @id @default(cuid())
  name               String
  ownerId            String    @map("owner_id")
  billingEmail       String?   @map("billing_email")
  address            String?
  cacNumber          String?   @map("cac_number")
  planTier           String    @default("starter") @map("plan_tier")
  maxUnits           Int       @default(20)  @map("max_units")
  maxSeats           Int       @default(1)   @map("max_seats")
  paystackCustomerId String?   @map("paystack_customer_id")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime? @updatedAt      @map("updated_at")

  owner              User              @relation(fields: [ownerId], references: [id])
  members            OrgMember[]
  listings           OrgListing[]
  tickets            MaintenanceTicket[]
  subscriptions      OrgSubscription[]

  @@map("organisations")
}

model OrgMember {
  id           String       @id @default(cuid())
  orgId        String       @map("org_id")
  userId       String?      @map("user_id")
  email        String?
  role         String
  status       String       @default("pending")
  invitedBy    String?      @map("invited_by")
  inviteToken  String?      @map("invite_token")
  joinedAt     DateTime?    @map("joined_at")
  createdAt    DateTime     @default(now()) @map("created_at")

  organisation Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)
  user         User?        @relation(fields: [userId], references: [id])

  @@unique([orgId, userId])
  @@map("org_members")
}

model OrgListing {
  id        String       @id @default(cuid())
  orgId     String       @map("org_id")
  listingId String       @map("listing_id")
  createdAt DateTime     @default(now()) @map("created_at")

  org       Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)
  listing   Listing      @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([orgId, listingId])
  @@map("org_listings")
}

model MaintenanceTicket {
  id             String         @id @default(cuid())
  orgId          String         @map("org_id")
  listingId      String?        @map("listing_id")
  tenantId       String?        @map("tenant_id")
  raisedBy       String?        @map("raised_by")
  title          String
  description    String?
  category       String?
  priority       TicketPriority @default(medium)
  status         TicketStatus   @default(open)
  assignedTo     String?        @map("assigned_to")
  resolutionNote String?        @map("resolution_note")
  resolvedAt     DateTime?      @map("resolved_at")
  closedAt       DateTime?      @map("closed_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime?      @updatedAt      @map("updated_at")

  organisation   Organisation   @relation(fields: [orgId], references: [id])

  @@map("maintenance_tickets")
}

model OrgSubscription {
  id                  String       @id @default(cuid())
  orgId               String       @map("org_id")
  paystackSubId       String?      @unique @map("paystack_sub_id")
  plan                String
  status              String       @default("active")
  amount              BigInt
  currentPeriodStart  DateTime?    @map("current_period_start")
  currentPeriodEnd    DateTime?    @map("current_period_end")
  nextBillingDate     DateTime?    @map("next_billing_date")
  createdAt           DateTime     @default(now()) @map("created_at")

  organisation        Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@map("org_subscriptions")
}
```

---

## MIDDLEWARE

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const isPublicRoute = createRouteMatcher([
  '/:locale',
  '/:locale/listings(.*)',
  '/:locale/sign-in(.*)',
  '/:locale/sign-up(.*)',
  '/:locale/sign/(.*)',           // signing page is public — token is the auth
  '/api/listings(.*)',
  '/api/sign(.*)',                 // Dojah verify + submit signature
  '/api/payments/webhook',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect()
  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/'],
}
```

---

## I18N SETUP

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'yo', 'ig', 'ha', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})
```

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !(routing.locales as string[]).includes(locale)) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

### Master translation file

Create `src/messages/en.json` with exactly these keys:

```json
{
  "meta": {
    "title": "PROPATI — Nigeria's Verified Property Platform",
    "description": "Find verified properties to rent, buy, or short-let across Nigeria."
  },
  "nav": {
    "search": "Find Property", "dashboard": "My Dashboard",
    "signIn": "Sign In", "signUp": "Sign Up",
    "listProperty": "List Property", "signOut": "Sign Out",
    "myProfile": "My Profile", "messages": "Messages",
    "all": "All", "buy": "Buy", "rent": "Rent",
    "shortlet": "Short-let", "commercial": "Commercial", "share": "Share"
  },
  "landing": {
    "badge": "Nigeria's most trusted property marketplace",
    "heroTitle": "Find your next home in Nigeria.",
    "heroHighlight": "Verified. Trusted. Fast.",
    "heroBody": "Every listing screened with our 5-layer verification system.",
    "searchPlaceholder": "Search area, street, type (e.g. 3-bed Lekki rent)…",
    "searchButton": "Search",
    "noListings": "No listings yet",
    "listFirst": "List a Property →"
  },
  "listing": {
    "applyNow": "Apply Now", "bookNow": "Book Now",
    "requestViewing": "Request Viewing",
    "perYear": "/yr", "perMonth": "/mo",
    "perNight": "/night", "total": "total",
    "bedrooms": "{count} bed", "bathrooms": "{count} bath",
    "sqm": "{size}m²", "new": "NEW",
    "verified": "Verified", "inspected": "Inspected",
    "certified": "Certified", "basic": "Basic"
  },
  "auth": {
    "signInTitle": "Sign in to PROPATI",
    "signUpTitle": "Join PROPATI",
    "email": "Email Address", "password": "Password",
    "fullName": "Full Name", "phone": "Phone Number",
    "phoneOptional": "Phone (optional)",
    "role": "I am a",
    "roles": {
      "landlord": "Landlord",
      "tenant": "Tenant / Buyer",
      "agent": "Property Agent",
      "estate_manager": "Estate Manager"
    },
    "forgotPassword": "Forgot password?",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "purpose": {
      "title": "What are you looking for?",
      "rent": "Rent", "buy": "Buy",
      "shortlet": "Short-let", "share": "Share / Roommate"
    }
  },
  "identity": {
    "title": "Verify Your Identity",
    "subtitle": "One-time verification — shows ✅ Verified on your profile",
    "idType": "ID Type",
    "idTypes": {
      "nin": "NIN — National Identity Number",
      "drivers_license": "Driver's License (FRSC)",
      "voters_card": "Voter's Card / PVC (INEC)"
    },
    "idNumber": "ID Number",
    "verifyButton": "Verify Identity",
    "verifying": "Verifying...",
    "matchFound": "Match found — Is this you?",
    "confirmYes": "Yes, that's me",
    "confirmNo": "Not me",
    "verifiedTitle": "Identity Verified",
    "verifiedBadge": "VERIFIED ✓",
    "unverified": "UNVERIFIED",
    "privacy": "🔒 Verified via Dojah · AES-256 encrypted · NDPR compliant"
  },
  "esign": {
    "step1Title": "Verify Your Identity",
    "step1Sub": "Required before signing",
    "step2Title": "Sign Document",
    "identityVerified": "Identity Verified",
    "signingAs": "SIGNING AS (GOVERNMENT VERIFIED)",
    "confirmName": "Confirm your full legal name",
    "consent": "I have read and agree to the terms of this tenancy agreement. I understand this is a legally binding electronic signature tied to my verified government identity.",
    "signButton": "Sign Agreement →",
    "signing": "Signing...",
    "successTitle": "Agreement Signed! ✅",
    "successBody": "A signed copy has been emailed to all parties.",
    "expired": "This signing link has expired. Please contact the property owner.",
    "alreadySigned": "You have already signed this agreement.",
    "reviewDoc": "View Full Agreement PDF",
    "legalNote": "Valid under Nigeria Cybercrimes Act 2015 · Identity verified via Dojah IdentityPass"
  },
  "agreements": {
    "title": "Agreements",
    "sendForSigning": "Send for Signing",
    "status": {
      "draft": "Draft",
      "pending_landlord": "Awaiting Landlord",
      "pending_tenant": "Awaiting Tenant",
      "tenant_signed": "Tenant Signed",
      "landlord_signed": "Landlord Signed",
      "fully_signed": "Fully Signed",
      "terminated": "Terminated",
      "expired": "Expired"
    },
    "downloadSigned": "Download Signed Agreement",
    "viewAudit": "View Audit Trail"
  },
  "profile": {
    "title": "My Profile",
    "employment": "Employment Details",
    "employmentStatus": "Employment Status",
    "employmentType": "Employment Type",
    "employer": "Employer / Company",
    "jobTitle": "Job Title",
    "annualIncome": "Annual Income (₦)",
    "bio": "Personal Bio",
    "guarantor": "Guarantor Details",
    "saveProfile": "Save Profile",
    "phoneSend": "Send OTP via WhatsApp",
    "phoneVerified": "Phone verified ✓",
    "security": {
      "title": "How we protect your data",
      "encryption": "AES-256-GCM encryption for all ID numbers",
      "masking": "Only last 4 digits stored after verification",
      "income": "Landlords see income band only, never exact figure",
      "sharing": "Zero third-party data sharing",
      "transit": "All connections encrypted with HTTPS/TLS"
    }
  },
  "messages": {
    "title": "Messages",
    "noConversations": "No conversations yet",
    "typeMessage": "Type a message...",
    "send": "Send",
    "you": "You"
  },
  "payments": {
    "title": "Rent & Payments",
    "payNow": "Pay Rent",
    "history": "Payment History",
    "status": {
      "upcoming": "Upcoming",
      "paid": "Paid",
      "overdue": "Overdue"
    }
  },
  "common": {
    "loading": "Loading...", "error": "Something went wrong",
    "retry": "Try again", "save": "Save",
    "cancel": "Cancel", "close": "Close",
    "back": "Back", "next": "Next",
    "submit": "Submit", "delete": "Delete",
    "edit": "Edit", "view": "View",
    "yes": "Yes", "no": "No",
    "confirm": "Confirm", "required": "Required",
    "optional": "Optional", "naira": "₦",
    "noResults": "No results found",
    "emptyState": "Nothing here yet",
    "bedrooms": "Bedrooms", "bathrooms": "Bathrooms",
    "location": "Location", "price": "Price",
    "type": "Type", "status": "Status",
    "date": "Date", "name": "Name",
    "email": "Email", "phone": "Phone"
  }
}
```

### AI Translation Script

Create `scripts/generate-translations.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LANGUAGES = [
  { code: 'yo', name: 'Yoruba', instruction: 'Use standard Yoruba with tone marks. Use natural conversational Yoruba, not stiff or overly formal.' },
  { code: 'ig', name: 'Igbo',   instruction: 'Use Central Igbo dialect. Natural and conversational.' },
  { code: 'ha', name: 'Hausa',  instruction: 'Use standard Hausa (Kano dialect). Natural and conversational.' },
  { code: 'fr', name: 'French', instruction: 'Use standard French. Natural and conversational, not overly formal.' },
]

async function translateJSON(sourceObj: any, language: { code: string; name: string; instruction: string }): Promise<any> {
  const sourceJSON = JSON.stringify(sourceObj, null, 2)

  const message = await client.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `Translate the following JSON values into ${language.name}.

Rules — follow exactly:
1. Translate ONLY the values, NEVER the keys
2. Keep {placeholders} exactly as-is (e.g. {count}, {name}, {size})
3. Keep these brand names unchanged: PROPATI, Dojah, Paystack, Cloudinary, Clerk, Termii, Twilio, Resend
4. Keep these Nigerian abbreviations unchanged: NIN, BVN, PVC, FRSC, INEC, NIMC, CAC, NGN
5. Keep the ₦ symbol as-is
6. Keep emojis as-is
7. Keep → arrows as-is
8. ${language.instruction}
9. Return ONLY valid JSON — no explanation, no markdown code blocks, no preamble

JSON to translate:
${sourceJSON}`,
    }],
  })

  const responseText = (message.content[0] as { type: string; text: string }).text.trim()

  // Strip markdown code blocks if present
  const clean = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  return JSON.parse(clean)
}

async function main() {
  const messagesDir = path.join(process.cwd(), 'src', 'messages')
  const enPath = path.join(messagesDir, 'en.json')

  if (!fs.existsSync(enPath)) {
    console.error('en.json not found at', enPath)
    process.exit(1)
  }

  const enSource = JSON.parse(fs.readFileSync(enPath, 'utf-8'))
  console.log(`Loaded en.json with ${Object.keys(enSource).length} top-level keys\n`)

  for (const lang of LANGUAGES) {
    const outPath = path.join(messagesDir, `${lang.code}.json`)

    // Skip if already exists
    if (fs.existsSync(outPath)) {
      console.log(`⏭  ${lang.name} (${lang.code}.json) already exists — skipping`)
      continue
    }

    console.log(`🔄 Translating to ${lang.name}...`)

    try {
      // Translate section by section to stay within token limits
      const translated: any = {}
      for (const [section, content] of Object.entries(enSource)) {
        process.stdout.write(`   ${section}... `)
        translated[section] = await translateJSON(content, lang)
        console.log('✓')
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500))
      }

      fs.writeFileSync(outPath, JSON.stringify(translated, null, 2), 'utf-8')
      console.log(`✅ ${lang.name} saved to ${lang.code}.json\n`)
    } catch (err) {
      console.error(`❌ Failed to translate ${lang.name}:`, err)
    }
  }

  console.log('Done! All translation files generated.')
}

main()
```

Run it once after setting up en.json:
```bash
ANTHROPIC_API_KEY=your_key npx tsx scripts/generate-translations.ts
```

### Language Switcher Component

```typescript
// src/components/shared/LanguageSwitcher.tsx
'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'yo', label: 'Yorùbá',   flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo',     flag: '🇳🇬' },
  { code: 'ha', label: 'Hausa',    flag: '🇳🇬' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0]

  function switchLocale(code: string) {
    const nonDefaultLocales = ['yo', 'ig', 'ha', 'fr']
    const segments = pathname.split('/')
    const hasLocale = nonDefaultLocales.includes(segments[1])
    const basePath = hasLocale ? '/' + segments.slice(2).join('/') : pathname
    const newPath = code === 'en' ? basePath || '/' : `/${code}${basePath}`
    router.push(newPath)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-black/5 transition-colors">
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="text-xs opacity-50">▾</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 min-w-[150px]">
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => switchLocale(lang.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  locale === lang.code ? 'font-bold text-teal-600' : 'text-gray-700'}`}>
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {locale === lang.code && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

---

## DOJAH IDENTITY VERIFICATION

```typescript
// src/lib/dojah.ts
const DOJAH_APP_ID    = process.env.DOJAH_APP_ID
const DOJAH_SECRET    = process.env.DOJAH_SECRET_KEY

export type DojahIdType = 'nin' | 'drivers_license' | 'voters_card'

export interface DojahResult {
  firstName:  string
  lastName:   string
  fullName:   string
  dob:        string
  gender:     string
  phone?:     string
  photo?:     string     // base64, NIN only
  dojahRef:   string
}

export async function verifyIdentity(type: DojahIdType, number: string): Promise<DojahResult> {
  // Dev/test mock — returns realistic fake data
  if (!DOJAH_APP_ID || !DOJAH_SECRET) {
    console.log(`[DOJAH MOCK] Verifying ${type}: ${number}`)
    return {
      firstName: 'ADAEZE',
      lastName:  'OKONKWO',
      fullName:  'ADAEZE CHIOMA OKONKWO',
      dob:       '1990-05-15',
      gender:    'Female',
      dojahRef:  `mock_${Date.now()}`,
    }
  }

  const endpoints: Record<DojahIdType, string> = {
    nin:             'https://api.dojah.io/api/v1/kyc/nin',
    drivers_license: 'https://api.dojah.io/api/v1/kyc/dl',
    voters_card:     'https://api.dojah.io/api/v1/kyc/vin',
  }

  const paramKeys: Record<DojahIdType, string> = {
    nin:             'nin',
    drivers_license: 'license_number',
    voters_card:     'vin',
  }

  const url = `${endpoints[type]}?${paramKeys[type]}=${encodeURIComponent(number)}`

  const res = await fetch(url, {
    headers: {
      'AppId':         DOJAH_APP_ID,
      'Authorization': DOJAH_SECRET,
      'Content-Type':  'application/json',
    },
  })

  const data = await res.json()

  if (!res.ok || data.error) {
    throw new Error(data.error ?? `Verification failed: ${res.status}`)
  }

  const e = data.entity ?? data
  const firstName = (e.firstname  ?? e.first_name  ?? '').toUpperCase().trim()
  const lastName  = (e.surname    ?? e.last_name   ?? '').toUpperCase().trim()

  return {
    firstName,
    lastName,
    fullName:  `${firstName} ${lastName}`.trim(),
    dob:       e.birthdate    ?? e.date_of_birth ?? '',
    gender:    e.gender       ?? '',
    phone:     e.mobile       ?? e.phone         ?? undefined,
    photo:     e.photo        ?? undefined,
    dojahRef:  data.entity?.ref ?? `dojah_${Date.now()}`,
  }
}

// Mask ID — show only last 4 digits
export function maskId(id: string): string {
  const clean = id.replace(/\s/g, '')
  if (clean.length <= 4) return clean
  return '*'.repeat(clean.length - 4) + clean.slice(-4)
}
```

### Reusable Identity Verification Component

```typescript
// src/components/verification/IdentityVerifyBlock.tsx
// Used in: user profile AND as Step 1 in e-signature flow
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { DojahIdType } from '@/lib/dojah'

interface VerifyResult {
  idType:        DojahIdType
  idNumber:      string        // raw — for passing to sign API, never stored
  idNumberMasked: string
  verifiedName:  string
  verifiedDob:   string
  dojahRef:      string
}

interface Props {
  onVerified: (result: VerifyResult) => void
  onReset?:   () => void
  compact?:   boolean          // true for signing page, false for profile page
}

export function IdentityVerifyBlock({ onVerified, onReset, compact = false }: Props) {
  const t = useTranslations('identity')
  const [idType,      setIdType]      = useState<DojahIdType>('nin')
  const [idNumber,    setIdNumber]    = useState('')
  const [verifying,   setVerifying]   = useState(false)
  const [error,       setError]       = useState('')
  const [result,      setResult]      = useState<VerifyResult | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleVerify() {
    if (!idNumber.trim()) { setError('Please enter your ID number'); return }
    setVerifying(true); setError(''); setShowConfirm(false)

    const res = await fetch('/api/sign/verify-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idType, idNumber: idNumber.trim() }),
    })
    const data = await res.json()
    setVerifying(false)

    if (!data.success) {
      setError(data.error ?? t('verifying'))
      return
    }
    setResult(data.result)
    setShowConfirm(true)
  }

  function handleConfirm() {
    if (result) onVerified(result)
  }

  function handleReset() {
    setIdNumber(''); setResult(null); setShowConfirm(false); setError('')
    onReset?.()
  }

  return (
    <div className={compact ? '' : 'bg-white rounded-xl border border-gray-200 p-5'}>
      {!compact && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-xl">🪪</div>
          <div>
            <div className="font-bold text-sm">{t('title')}</div>
            <div className="text-xs text-gray-500">{t('subtitle')}</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('idType')}</label>
          <select value={idType}
            onChange={e => { setIdType(e.target.value as DojahIdType); setShowConfirm(false); setError('') }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500">
            <option value="nin">{t('idTypes.nin')}</option>
            <option value="drivers_license">{t('idTypes.drivers_license')}</option>
            <option value="voters_card">{t('idTypes.voters_card')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('idNumber')}</label>
          <input type="text" value={idNumber}
            onChange={e => { setIdNumber(e.target.value); setShowConfirm(false); setError('') }}
            placeholder={idType === 'nin' ? '12345678901' : 'Enter your ID number'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono tracking-wider focus:outline-none focus:border-teal-500" />
        </div>

        {/* Dojah match result */}
        {showConfirm && result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="font-bold text-green-800 text-sm mb-3">✅ {t('matchFound')}</div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Full Name</div>
                <div className="font-bold text-gray-900">{result.verifiedName}</div>
              </div>
              {result.verifiedDob && (
                <div>
                  <div className="text-xs text-gray-500">Date of Birth</div>
                  <div className="font-bold text-gray-900">{result.verifiedDob}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500">ID Number</div>
                <div className="font-bold text-gray-900 font-mono">{result.idNumberMasked}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleConfirm}
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg font-bold text-sm hover:bg-teal-700 transition-colors">
                ✅ {t('confirmYes')}
              </button>
              <button onClick={handleReset}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                {t('confirmNo')}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium">
            ❌ {error}
          </div>
        )}

        {!showConfirm && (
          <button onClick={handleVerify} disabled={verifying || !idNumber.trim()}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors">
            {verifying ? `🔍 ${t('verifying')}` : `🔍 ${t('verifyButton')}`}
          </button>
        )}

        <p className="text-xs text-gray-400 text-center">{t('privacy')}</p>
      </div>
    </div>
  )
}
```

---

## E-SIGNATURE SYSTEM

The complete custom e-signature system. No third-party signing services.

### Dojah verify route (public — used by both profile page and signing page)

```typescript
// src/app/api/sign/verify-identity/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyIdentity, maskId } from '@/lib/dojah'
import type { DojahIdType } from '@/lib/dojah'

export async function POST(request: NextRequest) {
  try {
    const { idType, idNumber } = await request.json()

    if (!idNumber?.trim()) {
      return NextResponse.json({ success: false, error: 'ID number required' }, { status: 400 })
    }

    const result = await verifyIdentity(idType as DojahIdType, idNumber.trim())

    return NextResponse.json({
      success: true,
      result: {
        idType,
        idNumber:       idNumber.trim(),      // raw — client holds temporarily, never stored in DB
        idNumberMasked: maskId(idNumber.trim()),
        verifiedName:   result.fullName,
        verifiedDob:    result.dob,
        dojahRef:       result.dojahRef,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message ?? 'Verification failed. Please check your ID number.' },
      { status: 422 }
    )
  }
}
```

### Send for signing route

```typescript
// src/app/api/agreements/[id]/send-for-signing/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateAgreementPDF, hashDocument } from '@/lib/pdf'
import { uploadBuffer } from '@/lib/cloudinary'
import { sendAgreementSigningEmail } from '@/lib/resend'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole('landlord', 'agent', 'admin')

    const agreement = await prisma.agreement.findUnique({
      where: { id: params.id },
      include: {
        landlord: true, tenant: true,
        listing: { select: { title: true, address: true } },
      },
    })

    if (!agreement)
      return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })
    if (agreement.landlordId !== user.id && user.role !== 'admin')
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    // 1. Generate unsigned PDF
    const pdfBuffer = await generateAgreementPDF({
      id:              agreement.id,
      propertyTitle:   agreement.listing.title,
      propertyAddress: agreement.listing.address,
      landlordName:    agreement.landlord.fullName,
      tenantName:      agreement.tenant.fullName,
      startDate:       agreement.startDate?.toLocaleDateString('en-NG') ?? '',
      endDate:         agreement.endDate?.toLocaleDateString('en-NG') ?? '',
      rentAmount:      Number(agreement.rentAmount),
      rentPeriod:      agreement.rentPeriod ?? 'year',
      cautionDeposit:  agreement.cautionDeposit ? Number(agreement.cautionDeposit) : undefined,
      specialClauses:  agreement.specialClauses ?? undefined,
    })

    const documentHash = hashDocument(pdfBuffer)

    // 2. Upload draft PDF
    const { secure_url: draftPdfUrl } = await uploadBuffer(pdfBuffer, {
      subfolder:     'agreements',
      resource_type: 'raw',
      public_id:     `agreement_${agreement.id}_draft`,
    })

    // 3. Generate signing tokens
    const landlordRawToken = crypto.randomBytes(32).toString('hex')
    const tenantRawToken   = crypto.randomBytes(32).toString('hex')
    const tokenExpiry      = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const [landlordTokenHash, tenantTokenHash] = await Promise.all([
      bcrypt.hash(landlordRawToken, 8),
      bcrypt.hash(tenantRawToken, 8),
    ])

    await prisma.agreement.update({
      where: { id: agreement.id },
      data: {
        status: 'pending_landlord',
        draftPdfUrl,
        documentHash,
        landlordTokenHash,
        tenantTokenHash,
        landlordTokenExpires: tokenExpiry,
        tenantTokenExpires:   tokenExpiry,
      },
    })

    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://propati.ng'

    // 4. Email both parties
    await Promise.all([
      sendAgreementSigningEmail({
        to:            agreement.landlord.email,
        recipientName: agreement.landlord.fullName,
        role:          'landlord',
        propertyTitle: agreement.listing.title,
        signingUrl:    `${base}/sign/${landlordRawToken}?role=landlord&id=${agreement.id}`,
        pdfUrl:        draftPdfUrl,
        otherPartyName: agreement.tenant.fullName,
        rentAmount:    Number(agreement.rentAmount),
        rentPeriod:    agreement.rentPeriod ?? 'year',
      }),
      sendAgreementSigningEmail({
        to:            agreement.tenant.email,
        recipientName: agreement.tenant.fullName,
        role:          'tenant',
        propertyTitle: agreement.listing.title,
        signingUrl:    `${base}/sign/${tenantRawToken}?role=tenant&id=${agreement.id}`,
        pdfUrl:        draftPdfUrl,
        otherPartyName: agreement.landlord.fullName,
        rentAmount:    Number(agreement.rentAmount),
        rentPeriod:    agreement.rentPeriod ?? 'year',
      }),
    ])

    return NextResponse.json({ success: true, message: 'Signing emails sent to both parties', draftPdfUrl })
  } catch (error) {
    console.error('Send for signing error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send for signing' }, { status: 500 })
  }
}
```

### Submit signature route

```typescript
// src/app/api/sign/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSignedPDF } from '@/lib/pdf'
import { uploadBuffer } from '@/lib/cloudinary'
import { sendSignedAgreementEmail } from '@/lib/resend'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const ip        = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'
    const body      = await request.json()
    const { agreementId, role, signerName, consent, identity } = body

    // Validate inputs
    if (!consent)           return NextResponse.json({ success: false, error: 'Consent required' }, { status: 400 })
    if (!signerName?.trim()) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 })
    if (!identity?.verifiedName) return NextResponse.json({ success: false, error: 'Identity verification required before signing' }, { status: 400 })

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: {
        landlord: true, tenant: true,
        listing: { select: { title: true, address: true } },
      },
    })

    if (!agreement) return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })

    // Verify token matches the correct party
    const tokenHash    = role === 'landlord' ? agreement.landlordTokenHash    : agreement.tenantTokenHash
    const tokenExpires = role === 'landlord' ? agreement.landlordTokenExpires : agreement.tenantTokenExpires

    if (!tokenHash || !tokenExpires || new Date() > tokenExpires)
      return NextResponse.json({ success: false, error: 'Signing link has expired' }, { status: 400 })

    const tokenValid = await bcrypt.compare(params.token, tokenHash)
    if (!tokenValid)
      return NextResponse.json({ success: false, error: 'Invalid signing link' }, { status: 400 })

    // Check not already signed
    const alreadySigned = role === 'landlord' ? !!agreement.landlordSignedAt : !!agreement.tenantSignedAt
    if (alreadySigned)
      return NextResponse.json({ success: false, error: 'Already signed' }, { status: 400 })

    const now      = new Date()
    const checksum = crypto
      .createHash('sha256')
      .update(`${agreementId}|${role}|${identity.verifiedName}|${identity.idNumberMasked}|${now.toISOString()}`)
      .digest('hex')

    // Record signature with full Dojah identity data
    await prisma.agreementSignature.create({
      data: {
        id:          `sig_${crypto.randomBytes(8).toString('hex')}`,
        agreementId,
        signerId:    role === 'landlord' ? agreement.landlordId : agreement.tenantId,
        role,
        ipAddress:   ip,
        userAgent,
        consentText: `I, ${signerName}, have read and agree to the terms of this tenancy agreement. Identity verified via ${identity.idType.toUpperCase()} (${identity.idNumberMasked}). Signed electronically: ${now.toISOString()}.`,
        signedAt:    now,
        checksum,
        // Dojah identity fields
        idType:             identity.idType,
        idNumberMasked:     identity.idNumberMasked,
        verifiedName:       identity.verifiedName,
        verifiedDob:        identity.verifiedDob,
        dojahRef:           identity.dojahRef,
        identityVerifiedAt: now,
      },
    })

    // Update agreement status
    const bothAlreadySigned = role === 'landlord' ? !!agreement.tenantSignedAt : !!agreement.landlordSignedAt
    const newStatus = bothAlreadySigned
      ? 'fully_signed'
      : role === 'landlord' ? 'landlord_signed' : 'tenant_signed'

    await prisma.agreement.update({
      where: { id: agreementId },
      data: {
        status: newStatus,
        ...(role === 'landlord' ? { landlordSignedAt: now } : { tenantSignedAt: now }),
      },
    })

    // If both parties signed → generate final PDF and email everyone
    if (bothAlreadySigned) {
      const [landlordSig, tenantSig] = await Promise.all([
        prisma.agreementSignature.findFirst({ where: { agreementId, role: 'landlord' } }),
        prisma.agreementSignature.findFirst({ where: { agreementId, role: 'tenant'   } }),
      ])

      const signedPdfBuffer = await generateSignedPDF(
        {
          id:              agreement.id,
          propertyTitle:   agreement.listing.title,
          propertyAddress: agreement.listing.address,
          landlordName:    agreement.landlord.fullName,
          tenantName:      agreement.tenant.fullName,
          startDate:       agreement.startDate?.toLocaleDateString('en-NG') ?? '',
          endDate:         agreement.endDate?.toLocaleDateString('en-NG')   ?? '',
          rentAmount:      Number(agreement.rentAmount),
          rentPeriod:      agreement.rentPeriod ?? 'year',
          cautionDeposit:  agreement.cautionDeposit ? Number(agreement.cautionDeposit) : undefined,
          specialClauses:  agreement.specialClauses ?? undefined,
        },
        {
          landlord: landlordSig ? {
            verifiedName: landlordSig.verifiedName ?? '',
            verifiedDob:  landlordSig.verifiedDob  ?? '',
            idType:       landlordSig.idType        ?? '',
            idNumberMasked: landlordSig.idNumberMasked ?? '',
            signedAt:     landlordSig.signedAt,
            ipAddress:    landlordSig.ipAddress ?? 'unknown',
          } : undefined,
          tenant: tenantSig ? {
            verifiedName: tenantSig.verifiedName ?? '',
            verifiedDob:  tenantSig.verifiedDob  ?? '',
            idType:       tenantSig.idType        ?? '',
            idNumberMasked: tenantSig.idNumberMasked ?? '',
            signedAt:     tenantSig.signedAt,
            ipAddress:    tenantSig.ipAddress ?? 'unknown',
          } : undefined,
        },
        agreement.documentHash ?? ''
      )

      const { secure_url: signedPdfUrl } = await uploadBuffer(signedPdfBuffer, {
        subfolder:     'agreements',
        resource_type: 'raw',
        public_id:     `agreement_${agreementId}_signed`,
      })

      await prisma.agreement.update({ where: { id: agreementId }, data: { signedPdfUrl } })

      await Promise.all([
        sendSignedAgreementEmail({ to: agreement.landlord.email, recipientName: agreement.landlord.fullName, propertyTitle: agreement.listing.title, signedPdfUrl, otherPartyName: agreement.tenant.fullName }),
        sendSignedAgreementEmail({ to: agreement.tenant.email,   recipientName: agreement.tenant.fullName,   propertyTitle: agreement.listing.title, signedPdfUrl, otherPartyName: agreement.landlord.fullName }),
      ])
    }

    return NextResponse.json({
      success: true,
      message: bothAlreadySigned
        ? 'Agreement fully signed. Signed copies emailed to all parties.'
        : 'Signature recorded. Waiting for the other party to sign.',
      status: newStatus,
    })
  } catch (error) {
    console.error('Sign error:', error)
    return NextResponse.json({ success: false, error: 'Signing failed' }, { status: 500 })
  }
}
```

### Signing Page (server component + client form)

```typescript
// src/app/[locale]/sign/[token]/page.tsx
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import bcrypt from 'bcryptjs'
import { SigningForm } from './SigningForm'

export default async function SigningPage({
  params,
  searchParams,
}: {
  params: { token: string; locale: string }
  searchParams: { role: 'landlord' | 'tenant'; id: string }
}) {
  const t    = await getTranslations('esign')
  const { role, id } = searchParams

  if (!id || !role) return <ErrorCard message={t('expired')} />

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: {
      landlord: { select: { fullName: true } },
      tenant:   { select: { fullName: true } },
      listing:  { select: { title: true, address: true } },
    },
  })

  if (!agreement) return <ErrorCard message={t('expired')} />

  const tokenHash    = role === 'landlord' ? agreement.landlordTokenHash    : agreement.tenantTokenHash
  const tokenExpires = role === 'landlord' ? agreement.landlordTokenExpires : agreement.tenantTokenExpires

  if (!tokenHash || !tokenExpires || new Date() > tokenExpires)
    return <ErrorCard message={t('expired')} />

  const tokenValid = await bcrypt.compare(params.token, tokenHash)
  if (!tokenValid) return <ErrorCard message={t('expired')} />

  const alreadySigned = role === 'landlord' ? !!agreement.landlordSignedAt : !!agreement.tenantSignedAt
  if (alreadySigned) return <SuccessCard message={t('alreadySigned')} />

  const signer = role === 'landlord' ? agreement.landlord : agreement.tenant

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="text-2xl font-black mb-1">
            <span className="text-amber-600">P</span>ROPATI
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t('step1Title')}</h1>
        </div>

        {/* Agreement summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Property',   agreement.listing.title],
              ['Landlord',   agreement.landlord.fullName],
              ['Tenant',     agreement.tenant.fullName],
              ['Rent',       `₦${Number(agreement.rentAmount ?? 0).toLocaleString('en-NG')}/${agreement.rentPeriod}`],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className="font-semibold text-gray-900 text-sm">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF link */}
        {agreement.draftPdfUrl && (
          <a href={agreement.draftPdfUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 mb-4 transition-colors">
            📄 {t('reviewDoc')}
          </a>
        )}

        {/* Two-step signing form */}
        <SigningForm
          token={params.token}
          agreementId={id}
          role={role}
          defaultName={signer.fullName}
        />

        <p className="text-xs text-gray-400 text-center mt-4">{t('legalNote')}</p>
      </div>
    </div>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <div className="font-bold text-gray-900 text-lg">{message}</div>
      </div>
    </div>
  )
}

function SuccessCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-3">✅</div>
        <div className="font-bold text-green-800 text-lg">{message}</div>
      </div>
    </div>
  )
}
```

```typescript
// src/app/[locale]/sign/[token]/SigningForm.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { IdentityVerifyBlock } from '@/components/verification/IdentityVerifyBlock'
import type { DojahIdType } from '@/lib/dojah'

interface VerifyResult {
  idType: DojahIdType; idNumber: string; idNumberMasked: string
  verifiedName: string; verifiedDob: string; dojahRef: string
}

interface Props {
  token: string; agreementId: string
  role: 'landlord' | 'tenant'; defaultName: string
}

export function SigningForm({ token, agreementId, role, defaultName }: Props) {
  const t = useTranslations('esign')
  const [step,       setStep]       = useState<'verify' | 'sign'>('verify')
  const [identity,   setIdentity]   = useState<VerifyResult | null>(null)
  const [nameInput,  setNameInput]  = useState('')
  const [consented,  setConsented]  = useState(false)
  const [signing,    setSigning]    = useState(false)
  const [signError,  setSignError]  = useState('')
  const [success,    setSuccess]    = useState(false)

  function handleVerified(result: VerifyResult) {
    setIdentity(result)
    setNameInput(result.verifiedName)
    setStep('sign')
  }

  async function handleSign() {
    if (!nameInput.trim()) { setSignError('Please enter your name'); return }
    if (!consented)        { setSignError('Please accept the agreement terms'); return }
    if (!identity)         { setSignError('Identity verification required'); return }

    setSigning(true); setSignError('')

    const res = await fetch(`/api/sign/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agreementId, role,
        signerName: nameInput.trim(),
        consent: true,
        identity: {
          idType:         identity.idType,
          idNumberMasked: identity.idNumberMasked,
          verifiedName:   identity.verifiedName,
          verifiedDob:    identity.verifiedDob,
          dojahRef:       identity.dojahRef,
        },
      }),
    })

    const data = await res.json()
    setSigning(false)
    if (data.success) setSuccess(true)
    else setSignError(data.error ?? 'Signing failed')
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <div className="font-bold text-green-800 text-lg">{t('successTitle')}</div>
        <div className="text-green-700 text-sm mt-1">{t('successBody')}</div>
      </div>
    )
  }

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-lg">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
        step === 'verify' ? 'bg-teal-600 text-white' : 'bg-green-500 text-white'}`}>
        {step === 'sign' ? '✓' : '1'}
      </div>
      <div className="flex-1">
        <div className={`text-xs font-bold ${step === 'sign' ? 'text-green-700' : 'text-gray-900'}`}>
          {t('step1Title')}
        </div>
        {step === 'sign' && identity && (
          <div className="text-xs text-green-600">{identity.verifiedName}</div>
        )}
      </div>
      <div className="text-gray-300">→</div>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
        step === 'sign' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
        2
      </div>
      <div className={`text-xs font-bold ${step === 'sign' ? 'text-gray-900' : 'text-gray-400'}`}>
        {t('step2Title')}
      </div>
    </div>
  )

  if (step === 'verify') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <StepIndicator />
        <IdentityVerifyBlock onVerified={handleVerified} compact />
      </div>
    )
  }

  // Step 2 — Sign
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <StepIndicator />

      {/* Identity confirmed summary */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
        <div className="text-xs font-bold text-teal-700 mb-1">{t('signingAs')}</div>
        <div className="text-sm font-bold text-teal-900">{identity?.verifiedName}</div>
        <div className="text-xs text-teal-700 font-mono mt-0.5">
          {identity?.idType.replace('_', ' ').toUpperCase()}: {identity?.idNumberMasked}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('confirmName')}</label>
        <input type="text" value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer mb-4">
        <input type="checkbox" checked={consented} onChange={e => setConsented(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600" />
        <span className="text-xs text-gray-600 leading-relaxed">{t('consent')}</span>
      </label>

      {signError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium mb-3">
          {signError}
        </div>
      )}

      <button onClick={handleSign}
        disabled={signing || !nameInput.trim() || !consented}
        className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {signing ? `⏳ ${t('signing')}` : t('signButton')}
      </button>
    </div>
  )
}
```

---

## KEY IMPLEMENTATION PATTERNS

### Prisma singleton

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query','error','warn'] : ['error'],
})
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Auth helpers

```typescript
// src/lib/auth.ts
import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getDbUser() {
  const { userId } = await auth()
  if (!userId) return null
  return prisma.user.findUnique({ where: { clerkUserId: userId } })
}

export async function requireDbUser() {
  const user = await getDbUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireRole(...roles: string[]) {
  const user = await requireDbUser()
  if (!roles.includes(user.role)) throw new Error('Forbidden')
  return user
}
```

### API route pattern

```typescript
// Template for every API route
import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const user = await requireDbUser()

    // Parse + validate query params
    const schema = z.object({ page: z.coerce.number().default(1) })
    const params = schema.parse(Object.fromEntries(new URL(request.url).searchParams))

    const data = await prisma.something.findMany({ where: { userId: user.id } })
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 422 })
    if (error.message === 'Unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (error.message === 'Forbidden')
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
```

### Paystack webhook (raw body — critical)

```typescript
// src/app/api/payments/webhook/route.ts
export const runtime = 'nodejs'   // must be nodejs, not edge

import crypto from 'crypto'
export async function POST(request: NextRequest) {
  const rawBody  = await request.text()   // RAW — do not use request.json()
  const sig      = request.headers.get('x-paystack-signature')
  const expected = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!).update(rawBody).digest('hex')
  if (expected !== sig)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  const event = JSON.parse(rawBody)
  // handle event.event
  return NextResponse.json({ received: true })
}
```

### Clerk webhook — sync user to DB

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.text()
  const wh   = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  const event = wh.verify(body, {
    'svix-id':        request.headers.get('svix-id')!,
    'svix-timestamp': request.headers.get('svix-timestamp')!,
    'svix-signature': request.headers.get('svix-signature')!,
  }) as any

  if (event.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = event.data
    await prisma.user.upsert({
      where:  { clerkUserId: id },
      create: {
        clerkUserId: id,
        email:    email_addresses[0].email_address,
        phone:    phone_numbers?.[0]?.phone_number ?? null,
        fullName: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
        role:     (public_metadata?.role as any) ?? 'tenant',
      },
      update: {
        email:    email_addresses[0].email_address,
        fullName: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
      },
    })
  }

  return new Response('OK')
}
```

---

## DESIGN SYSTEM

### Tailwind config tokens

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold:  '#c9952a',
        rust:  '#d4622a',
        teal:  '#0e7c6a',
        navy:  '#0B1220',
        sand:  '#f5f3ee',
      },
      fontFamily: {
        sans:    ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'sans-serif'],
        serif:   ['DM Serif Display', 'serif'],
        mono:    ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

### Google Fonts (add to root layout)

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Outfit:wght@400;500;600;700;800&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

### Role colour map

| Role | Background | Accent | Text |
|------|-----------|--------|------|
| Landing | `#f5f3ee` sand | `#c9952a` gold | `#1a1a1a` |
| Landlord | `#0f0f0f` | `#d4622a` rust | `#f8f6f0` |
| Tenant | `#f7f5f0` | `#0e7c6a` teal | `#111110` |
| Agent | `#060d18` | `#c9952a` gold | `#e8eef8` |
| Admin | `#0c0e12` | `#00d4c8` cyan | `#e8eef8` |
| Estate Mgr | `#080E18` | `#6EA8FE` blue | `#C8D8E8` |

---

## BUILD SEQUENCE

Complete each phase fully before moving to the next. Say "Phase N complete" when done.

### Phase 1 — Foundation (2–3 hours)
- [ ] 1.1 Create Next.js project, install all packages
- [ ] 1.2 Set up Prisma schema → `prisma generate` → `prisma db push`
- [ ] 1.3 Create `src/lib/prisma.ts`, `src/lib/auth.ts`, `src/lib/dojah.ts`, `src/lib/resend.ts`
- [ ] 1.4 Set up Clerk → middleware.ts → ClerkProvider in root layout
- [ ] 1.5 Create `/sign-in` and `/sign-up` pages
- [ ] 1.6 Create Clerk webhook at `/api/webhooks/clerk`
- [ ] 1.7 Set up i18n routing + request config
- [ ] 1.8 Create `src/messages/en.json` (full master file as specified above)
- [ ] 1.9 Run AI translation script → generates yo/ig/ha/fr.json
- [ ] **Test:** Sign up a new user → confirm they appear in DB with clerkUserId

### Phase 2 — Marketplace (SSR, public, SEO)
- [ ] 2.1 `GET /api/listings` with filters (type, area, minPrice, maxPrice, bedrooms, q, page)
- [ ] 2.2 Landing page — search, type filter tabs, listing grid (SSR)
- [ ] 2.3 ListingCard component — cover photo, price, trust badge, specs
- [ ] 2.4 Listing detail page `/listings/[id]` — full details, photo gallery (SSR)
- [ ] 2.5 Add LanguageSwitcher to landing nav
- [ ] **Test:** Check listing detail page source — property data visible in HTML (SEO working)

### Phase 3 — Dashboard Shell
- [ ] 3.1 `/(dashboard)/layout.tsx` — Clerk auth guard
- [ ] 3.2 Onboarding page — role selector, saves role to Clerk metadata + DB
- [ ] 3.3 DashboardShell, Sidebar (role-based nav), Topbar (avatar → profile, LanguageSwitcher)
- [ ] 3.4 MobileNav — hamburger, slide-in sidebar, overlay close
- [ ] 3.5 Role routing — after onboarding → redirect to `/landlord`, `/tenant`, etc.
- [ ] **Test:** Log in → onboarding → landlord dashboard renders without errors

### Phase 4 — Landlord Dashboard
- [ ] 4.1 Home — portfolio KPI stats from DB
- [ ] 4.2 Add Listing — full form + multi-photo upload to Cloudinary
- [ ] 4.3 My Listings — real data from `GET /api/listings/owner/mine`
- [ ] 4.4 Agreements — list, send for signing button
- [ ] 4.5 Messages — conversation list + thread
- [ ] 4.6 Profile — account details + IdentityVerifyBlock (Dojah)
- [ ] 4.7 Verify Property — 5-step wizard

### Phase 5 — Tenant Dashboard
- [ ] 5.1 Home — purpose switcher (Rent/Buy/Short-let/Share), profile completion banner
- [ ] 5.2 Search — listing grid with "Apply & Message" button
- [ ] 5.3 Agreements — list with status, sign button
- [ ] 5.4 Payments — Paystack integration (Pay Rent button)
- [ ] 5.5 Receipts — transaction history
- [ ] 5.6 Profile — employment form + IdentityVerifyBlock + phone OTP

### Phase 6 — E-Signature System
- [ ] 6.1 `POST /api/agreements/[id]/send-for-signing` — generate PDF, tokens, send emails
- [ ] 6.2 Public signing page `/sign/[token]` — server renders agreement summary
- [ ] 6.3 `SigningForm.tsx` — Step 1 (IdentityVerifyBlock) → Step 2 (sign)
- [ ] 6.4 `POST /api/sign/verify-identity` — Dojah check (public)
- [ ] 6.5 `POST /api/sign/[token]` — record signature with identity data
- [ ] 6.6 `generateSignedPDF` — PDF with full signature certificate page
- [ ] 6.7 Email signed PDF to both parties via Resend
- [ ] 6.8 `GET /api/agreements/[id]/audit` — full audit trail
- [ ] **Test:** Full signing flow: send → landlord signs → tenant signs → signed PDF emailed

### Phase 7 — Messaging
- [ ] 7.1 `POST /api/messages/conversations` — idempotent create
- [ ] 7.2 `GET /api/messages/conversations` — list with unread counts
- [ ] 7.3 `GET /api/messages/conversations/[id]/messages?since=` — polling
- [ ] 7.4 `POST /api/messages/conversations/[id]/messages` — send
- [ ] 7.5 ConversationList + MessageThread components
- [ ] 7.6 Poll every 4s using React Query `refetchInterval`

### Phase 8 — Agent + Admin + Estate Manager
- [ ] 8.1 Agent — managed listings, commissions, profile with identity verify
- [ ] 8.2 Admin — real verification queue, flags, user management
- [ ] 8.3 Estate Manager — org setup wizard, portfolio, maintenance tickets, team, billing

### Phase 9 — Payments
- [ ] 9.1 `POST /api/payments/initiate` → Paystack transaction URL
- [ ] 9.2 `POST /api/payments/webhook` — raw body, HMAC, update transaction
- [ ] 9.3 Frontend: Pay button → Paystack popup → redirect to receipts

### Phase 10 — Polish
- [ ] 10.1 Sentry setup — `npx @sentry/wizard@latest -i nextjs`, add user context on login
- [ ] 10.2 Loading skeletons for all data-fetched sections
- [ ] 10.3 SEO metadata on listing pages (title, OG tags)
- [ ] 10.4 Mobile responsive audit — test on real devices
- [ ] 10.5 Tighten CORS if needed

---

## ABSOLUTE RULES — NEVER VIOLATE

- **No third-party signing** — build the custom system above
- **No BVN verification** — Dojah NIN / Driver's License / Voter's Card only
- **No raw SQL** — Prisma only
- **No Pages Router** — App Router only
- **No `useEffect` for data fetching** — React Query or Server Components
- **No hardcoded UI strings** — everything via `t('key')` from next-intl
- **No `any` type** without a comment explaining why
- **No Paystack webhook with JSON parsing** — must use `request.text()` for raw body
- **No raw ID number stored in DB** — only masked version (last 4 digits)
- **No signing without identity verification** — identity object required server-side
- **No signing page behind auth** — `/sign/[token]` is public, token IS the auth
- **No Google Translate API at runtime** — translations are static JSON files

---

## REFERENCE DOCUMENTS IN THIS FOLDER

- `PRD.md` — every feature, in/out of scope, revenue model
- `APP_FLOW.md` — every page, every user path, every state transition  
- `TECH_STACK.md` — versions, env vars, security setup
- `FRONTEND_GUIDELINES.md` — colours, typography, components, CSS patterns
- `BACKEND_STRUCTURE.md` — full DB schema, all API endpoints
- `IMPLEMENTATION_PLAN.md` — current status, what's pending
- `PROPATI_CLAUDE_CODE_CONTEXT.md` — full history of the existing system

---

Read all of the above. Then confirm you understand by listing:
1. The 5 user roles and what each does
2. The two-step signing flow (Dojah then sign)
3. The 5 languages and how translations are generated
4. Which identity provider is used and what ID types are supported

After confirming, wait for me to say "begin Phase 1".
