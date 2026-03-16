# PROPATI — Next.js Rewrite Prompt for Claude Code

Copy everything below this line and paste it as your first message to Claude Code.

---

## THE PROMPT

You are rebuilding PROPATI — Nigeria's verified property platform — from scratch using Next.js 14. The existing product is live at https://propati-frontend.vercel.app with a backend at https://propati-backend-production.up.railway.app. We are doing a full rewrite, not a migration patch.

Read all the `.md` files in this directory before writing any code. They are the source of truth for everything — features, flows, schema, API design, and build sequence. Do not guess or invent anything not in those documents.

---

## TECH STACK — EXACT VERSIONS

Install these exact packages. No substitutions without asking first.

```bash
# Create project
npx create-next-app@14.2.0 propati --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core
npm install prisma@5.14.0 @prisma/client@5.14.0
npm install @clerk/nextjs@5.2.0
npm install resend@3.3.0
npm install @sentry/nextjs@8.13.0
npm install cloudinary@2.0.1
npm install @paystack/inline-js@2.0.0
npm install axios@1.7.2
npm install zod@3.23.8
npm install @tanstack/react-query@5.48.0
npm install uploadthing@6.13.0   # for file uploads
npm install date-fns@3.6.0
npm install lucide-react@0.400.0

# shadcn/ui (run after project creation)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card badge dialog sheet tabs select textarea toast avatar dropdown-menu separator skeleton progress

# Dev
npm install -D @types/node@20 tsx@4.15.0
```

---

## PROJECT STRUCTURE

Create exactly this structure:

```
propati/
├── src/
│   ├── app/
│   │   ├── (marketing)/          ← public pages, SSR, SEO
│   │   │   ├── page.tsx          ← landing/marketplace
│   │   │   ├── listings/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  ← listing detail (SSR for SEO)
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/          ← authenticated, client-rendered
│   │   │   ├── layout.tsx        ← Clerk auth guard
│   │   │   ├── landlord/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── listings/page.tsx
│   │   │   │   ├── rent/page.tsx
│   │   │   │   ├── agreements/page.tsx
│   │   │   │   ├── messages/page.tsx
│   │   │   │   ├── verify/page.tsx
│   │   │   │   └── profile/page.tsx
│   │   │   ├── tenant/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── search/page.tsx
│   │   │   │   ├── agreements/page.tsx
│   │   │   │   ├── payments/page.tsx
│   │   │   │   ├── receipts/page.tsx
│   │   │   │   ├── messages/page.tsx
│   │   │   │   └── profile/page.tsx
│   │   │   ├── agent/
│   │   │   │   └── page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── verification/page.tsx
│   │   │   │   ├── flags/page.tsx
│   │   │   │   ├── disputes/page.tsx
│   │   │   │   └── users/page.tsx
│   │   │   └── estate-manager/
│   │   │       ├── page.tsx
│   │   │       ├── portfolio/page.tsx
│   │   │       ├── rent/page.tsx
│   │   │       ├── maintenance/page.tsx
│   │   │       ├── team/page.tsx
│   │   │       └── billing/page.tsx
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
│   │   │   │       └── sign/route.ts
│   │   │   ├── messages/
│   │   │   │   └── route.ts
│   │   │   ├── users/
│   │   │   │   ├── profile/route.ts
│   │   │   │   ├── tenant-profile/route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── payments/
│   │   │   │   ├── initiate/route.ts
│   │   │   │   └── webhook/route.ts   ← raw body
│   │   │   ├── orgs/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── portfolio/route.ts
│   │   │   │       ├── tickets/route.ts
│   │   │   │       ├── ledger/route.ts
│   │   │   │       └── team/route.ts
│   │   │   └── webhooks/
│   │   │       └── clerk/route.ts     ← sync Clerk user to DB
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                   ← shadcn components (auto-generated)
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
│   │   │   ├── VerificationWizard.tsx
│   │   │   ├── IdentityVerify.tsx
│   │   │   └── AdminQueue.tsx
│   │   ├── agreements/
│   │   │   ├── AgreementCard.tsx
│   │   │   └── SignatureBlock.tsx
│   │   └── shared/
│   │       ├── TrustBadge.tsx
│   │       ├── VerifiedBadge.tsx
│   │       ├── NairaCurrency.tsx
│   │       ├── Toast.tsx
│   │       └── EmptyState.tsx
│   ├── lib/
│   │   ├── prisma.ts             ← Prisma client singleton
│   │   ├── auth.ts               ← Clerk helpers
│   │   ├── cloudinary.ts         ← upload helper
│   │   ├── resend.ts             ← email service
│   │   ├── paystack.ts           ← Paystack API wrapper
│   │   ├── prembly.ts            ← NIN/BVN verification
│   │   ├── termii.ts             ← SMS service
│   │   ├── encryption.ts         ← AES-256-GCM for NIN/BVN
│   │   ├── fees.ts               ← platform fee calculation
│   │   └── utils.ts              ← cn(), formatNaira(), timeAgo()
│   ├── hooks/
│   │   ├── useListings.ts
│   │   ├── useMessages.ts
│   │   ├── useConversations.ts
│   │   └── useUserRole.ts
│   └── types/
│       ├── index.ts              ← shared TypeScript types
│       └── api.ts                ← API request/response types
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── middleware.ts                 ← Clerk auth middleware
├── next.config.ts
├── tailwind.config.ts
├── .env.local
└── sentry.config.ts
```

---

## ENVIRONMENT VARIABLES

Create `.env.local` with these (I will fill in values):

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=PROPATI <hello@propati.ng>

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...

# Prembly (Identity verification)
PREMBLY_API_KEY=
PREMBLY_APP_ID=

# Termii (SMS)
TERMII_API_KEY=
TERMII_SENDER_ID=PROPATI

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=+14155238886

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Encryption
ENCRYPTION_KEY=   # 64-char hex
```

---

## PRISMA SCHEMA

Create `prisma/schema.prisma` with this exact schema. Do not change field names without asking — the existing database uses these exact names and we are connecting to live Supabase data.

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

  // KYC
  ninEncrypted          String?   @map("nin_encrypted")
  ninHash               String?   @map("nin_hash")
  ninVerified           Boolean   @default(false) @map("nin_verified")
  idVerified            Boolean   @default(false) @map("id_verified")
  phoneVerified         Boolean   @default(false) @map("phone_verified")

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

  // Status
  isActive              Boolean   @default(true) @map("is_active")
  isBanned              Boolean   @default(false) @map("is_banned")
  banReason             String?   @map("ban_reason")

  // Agent
  agentTier             String    @default("standard") @map("agent_tier")
  agentApproved         Boolean   @default(false) @map("agent_approved")
  agentBio              String?   @map("agent_bio")
  agentAreas            Json?     @map("agent_areas")

  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  lastLogin             DateTime? @map("last_login")

  // Relations
  listings              Listing[]         @relation("OwnerListings")
  agentListings         Listing[]         @relation("AgentListings")
  landlordConversations Conversation[]    @relation("LandlordConversations")
  tenantConversations   Conversation[]    @relation("TenantConversations")
  sentMessages          Message[]
  landlordAgreements    Agreement[]       @relation("LandlordAgreements")
  tenantAgreements      Agreement[]       @relation("TenantAgreements")
  notifications         Notification[]
  savedListings         SavedListing[]
  orgMemberships        OrgMember[]
  ownedOrgs             Organisation[]

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
  serviceCharge    Decimal?         @map("service_charge") @db.Decimal(15, 2)
  bedrooms         Int?
  bathrooms        Int?
  sizeSqm          Decimal?         @map("size_sqm") @db.Decimal(10, 2)
  furnished        Boolean          @default(false)
  amenities        Json?
  status           ListingStatus    @default(draft)
  verificationTier VerificationTier @default(basic) @map("verification_tier")
  isFeatured       Boolean          @default(false) @map("is_featured")
  viewsCount       Int              @default(0) @map("views_count")
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")

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
  id         String   @id @default(cuid())
  listingId  String   @map("listing_id")
  url        String
  publicId   String?  @map("public_id")
  isCover    Boolean  @default(false) @map("is_cover")
  sortOrder  Int      @default(0) @map("sort_order")
  createdAt  DateTime @default(now()) @map("created_at")

  listing    Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

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
  id            String   @id @default(cuid())
  listingId     String   @unique @map("listing_id")
  ownerId       String   @map("owner_id")
  l1Status      String   @default("pending") @map("l1_status")
  l1DocUrl      String?  @map("l1_doc_url")
  l2Status      String   @default("pending") @map("l2_status")
  l2IdType      String?  @map("l2_id_type")
  l2VerifiedAt  DateTime? @map("l2_verified_at")
  l3Status      String   @default("pending") @map("l3_status")
  l4Status      String   @default("pending") @map("l4_status")
  l5Status      String   @default("pending") @map("l5_status")
  currentLayer  Int      @default(1) @map("current_layer")
  overallStatus String   @default("not_started") @map("overall_status")
  adminNotes    String?  @map("admin_notes")
  reviewedBy    String?  @map("reviewed_by")
  reviewedAt    DateTime? @map("reviewed_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  listing       Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@map("verifications")
}

model Conversation {
  id              String    @id @default(cuid())
  listingId       String?   @map("listing_id")
  landlordId      String    @map("landlord_id")
  tenantId        String    @map("tenant_id")
  subject         String?
  lastMessage     String?   @map("last_message")
  lastMessageAt   DateTime? @map("last_message_at")
  unreadTenant    Int       @default(0) @map("unread_tenant")
  unreadLandlord  Int       @default(0) @map("unread_landlord")
  status          String    @default("active")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  listing         Listing?  @relation(fields: [listingId], references: [id], onDelete: SetNull)
  landlord        User      @relation("LandlordConversations", fields: [landlordId], references: [id])
  tenant          User      @relation("TenantConversations", fields: [tenantId], references: [id])
  messages        Message[]

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
  id                String          @id @default(cuid())
  listingId         String          @map("listing_id")
  landlordId        String          @map("landlord_id")
  tenantId          String          @map("tenant_id")
  agentId           String?         @map("agent_id")
  type              String
  status            AgreementStatus @default(draft)
  startDate         DateTime?       @map("start_date") @db.Date
  endDate           DateTime?       @map("end_date") @db.Date
  rentAmount        Decimal?        @map("rent_amount") @db.Decimal(15, 2)
  rentPeriod        String?         @map("rent_period")
  cautionDeposit    Decimal?        @map("caution_deposit") @db.Decimal(15, 2)
  specialClauses    String?         @map("special_clauses")
  landlordSignedAt  DateTime?       @map("landlord_signed_at")
  tenantSignedAt    DateTime?       @map("tenant_signed_at")
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")

  listing           Listing         @relation(fields: [listingId], references: [id])
  landlord          User            @relation("LandlordAgreements", fields: [landlordId], references: [id])
  tenant            User            @relation("TenantAgreements", fields: [tenantId], references: [id])
  signatures        AgreementSignature[]
  rentSchedule      RentSchedule[]

  @@map("agreements")
}

model AgreementSignature {
  id          String    @id @default(cuid())
  agreementId String    @map("agreement_id")
  signerId    String    @map("signer_id")
  role        String
  ipAddress   String?   @map("ip_address")
  userAgent   String?   @map("user_agent")
  consentText String?   @map("consent_text")
  signedAt    DateTime  @default(now()) @map("signed_at")
  checksum    String?

  agreement   Agreement @relation(fields: [agreementId], references: [id], onDelete: Cascade)

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
  id               String   @id @default(cuid())
  reference        String?  @unique
  listingId        String?  @map("listing_id")
  payerId          String?  @map("payer_id")
  payeeId          String?  @map("payee_id")
  agentId          String?  @map("agent_id")
  type             String
  status           String
  amount           BigInt
  platformFee      BigInt   @default(0) @map("platform_fee")
  agentCommission  BigInt   @default(0) @map("agent_commission")
  payeeAmount      BigInt?  @map("payee_amount")
  description      String?
  paystackData     Json?    @map("paystack_data")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

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
  id                  String    @id @default(cuid())
  name                String
  ownerId             String    @map("owner_id")
  billingEmail        String?   @map("billing_email")
  address             String?
  cacNumber           String?   @map("cac_number")
  planTier            String    @default("starter") @map("plan_tier")
  maxUnits            Int       @default(20) @map("max_units")
  maxSeats            Int       @default(1) @map("max_seats")
  paystackCustomerId  String?   @map("paystack_customer_id")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime? @updatedAt @map("updated_at")

  owner               User      @relation(fields: [ownerId], references: [id])
  members             OrgMember[]
  listings            OrgListing[]
  tickets             MaintenanceTicket[]
  subscriptions       OrgSubscription[]

  @@map("organisations")
}

model OrgMember {
  id           String    @id @default(cuid())
  orgId        String    @map("org_id")
  userId       String?   @map("user_id")
  email        String?
  role         String
  status       String    @default("pending")
  invitedBy    String?   @map("invited_by")
  inviteToken  String?   @map("invite_token")
  joinedAt     DateTime? @map("joined_at")
  createdAt    DateTime  @default(now()) @map("created_at")

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
  id             String       @id @default(cuid())
  orgId          String       @map("org_id")
  listingId      String?      @map("listing_id")
  tenantId       String?      @map("tenant_id")
  raisedBy       String?      @map("raised_by")
  title          String
  description    String?
  category       String?
  priority       TicketPriority @default(medium)
  status         TicketStatus   @default(open)
  assignedTo     String?      @map("assigned_to")
  resolutionNote String?      @map("resolution_note")
  resolvedAt     DateTime?    @map("resolved_at")
  closedAt       DateTime?    @map("closed_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime?    @updatedAt @map("updated_at")

  organisation   Organisation @relation(fields: [orgId], references: [id])

  @@map("maintenance_tickets")
}

model OrgSubscription {
  id                 String       @id @default(cuid())
  orgId              String       @map("org_id")
  paystackSubId      String?      @unique @map("paystack_sub_id")
  plan               String
  status             String       @default("active")
  amount             BigInt
  currentPeriodStart DateTime?    @map("current_period_start")
  currentPeriodEnd   DateTime?    @map("current_period_end")
  nextBillingDate    DateTime?    @map("next_billing_date")
  createdAt          DateTime     @default(now()) @map("created_at")

  organisation       Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@map("org_subscriptions")
}
```

---

## MIDDLEWARE (Clerk Auth)

Create `middleware.ts` in project root:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/listings(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/payments/webhook',
  '/api/listings(.*)',   // public listing search
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

---

## KEY IMPLEMENTATION RULES

Follow these without deviation:

### 1. API Route Pattern
Every API route must follow this exact pattern:

```typescript
// src/app/api/listings/route.ts
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(request.url)

    const schema = z.object({
      type: z.enum(['rent','sale','short-let','share','commercial']).optional(),
      area: z.string().optional(),
      minPrice: z.coerce.number().optional(),
      maxPrice: z.coerce.number().optional(),
      page: z.coerce.number().default(1),
      limit: z.coerce.number().max(50).default(20),
    })

    const params = schema.parse(Object.fromEntries(searchParams))

    const listings = await prisma.listing.findMany({
      where: {
        status: 'active',
        ...(params.type && { listingType: params.type }),
        ...(params.area && { area: { contains: params.area, mode: 'insensitive' } }),
        ...(params.minPrice && { price: { gte: params.minPrice } }),
        ...(params.maxPrice && { price: { lte: params.maxPrice } }),
      },
      include: {
        images: { where: { isCover: true }, take: 1 },
        owner: { select: { fullName: true } },
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, listings })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ success: false, error: 'Failed to load listings' }, { status: 500 })
  }
}
```

### 2. Prisma Client Singleton
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3. Auth Helper
```typescript
// src/lib/auth.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getDbUser() {
  const { userId } = await auth()
  if (!userId) return null

  return prisma.user.findUnique({
    where: { clerkUserId: userId },
  })
}

export async function requireDbUser() {
  const user = await getDbUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireRole(...roles: string[]) {
  const user = await requireDbUser()
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: requires role ${roles.join(' or ')}`)
  }
  return user
}
```

### 4. Paystack Webhook (raw body — critical)
```typescript
// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const body = await request.text()  // raw body for signature verification
  const signature = request.headers.get('x-paystack-signature')
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  // handle event.event types
  return NextResponse.json({ received: true })
}

// Disable body parsing for this route
export const runtime = 'nodejs'
```

### 5. Clerk Webhook (sync user to DB)
```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.text()
  const svix_id = request.headers.get('svix-id')!
  const svix_ts = request.headers.get('svix-timestamp')!
  const svix_sig = request.headers.get('svix-signature')!

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  const event = wh.verify(body, { 'svix-id': svix_id, 'svix-timestamp': svix_ts, 'svix-signature': svix_sig }) as any

  if (event.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = event.data
    await prisma.user.create({
      data: {
        clerkUserId: id,
        email: email_addresses[0].email_address,
        phone: phone_numbers[0]?.phone_number ?? null,
        fullName: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
        role: (public_metadata?.role as any) ?? 'tenant',
      },
    })
  }

  if (event.type === 'user.updated') {
    await prisma.user.update({
      where: { clerkUserId: event.data.id },
      data: {
        email: event.data.email_addresses[0].email_address,
        fullName: `${event.data.first_name ?? ''} ${event.data.last_name ?? ''}`.trim(),
      },
    })
  }

  return new Response('OK')
}
```

### 6. Resend Email Service
```typescript
// src/lib/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html,
  })
  if (error) throw error
  return data
}

export async function sendWelcomeEmail(user: { email: string; fullName: string }) {
  return sendEmail(
    user.email,
    'Welcome to PROPATI 🏠',
    `<h2>Welcome, ${user.fullName.split(' ')[0]}!</h2>
     <p>You're now on Nigeria's most trusted property platform.</p>
     <a href="https://propati.ng/dashboard">Get Started →</a>`
  )
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail(
    email,
    'Reset your PROPATI password',
    `<h2>Reset your password</h2>
     <p>Click below to reset your password. This link expires in 1 hour.</p>
     <a href="${resetUrl}">Reset Password →</a>
     <p>If you didn't request this, ignore this email.</p>`
  )
}
```

### 7. Design Tokens (Tailwind)
Add these to `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        gold:     '#c9952a',
        rust:     '#d4622a',
        teal:     '#0e7c6a',
        // Landlord theme
        landlord: { bg: '#0f0f0f', surface: '#141414', accent: '#d4622a' },
        // Tenant theme
        tenant:   { bg: '#f7f5f0', surface: '#ffffff', accent: '#0e7c6a' },
        // Agent theme
        agent:    { bg: '#060d18', surface: '#0d1b2e', accent: '#c9952a' },
        // EM theme
        em:       { bg: '#080E18', surface: '#0d1825', accent: '#6EA8FE' },
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

### 8. Sentry Setup
Run `npx @sentry/wizard@latest -i nextjs` after initial setup. Then ensure:

```typescript
// src/app/layout.tsx — add to root layout
import * as Sentry from '@sentry/nextjs'

// In error boundary or global error handler:
Sentry.captureException(error)
```

---

## BUILD SEQUENCE

Build in this exact order. Do not skip ahead. Verify each phase works before moving to the next.

### Phase 1 — Foundation (do this first, ~2 hours)
1.1 Create Next.js project with all packages installed
1.2 Set up Prisma schema (copy from above), run `prisma generate`
1.3 Connect to existing Supabase database — run `prisma db pull` to verify schema matches
1.4 Create `src/lib/prisma.ts`, `src/lib/auth.ts`
1.5 Set up Clerk — install, add middleware.ts, add ClerkProvider to root layout
1.6 Create `/sign-in` and `/sign-up` pages using Clerk components
1.7 Create Clerk webhook handler at `/api/webhooks/clerk`
1.8 Test: sign up a new user, verify it appears in DB with clerkUserId populated

### Phase 2 — Marketplace (public, SSR)
2.1 Landing page (`/`) — search bar, listing type tabs, listing grid
2.2 `GET /api/listings` route with filters (type, area, price, bedrooms, q)
2.3 Listing card component with cover photo, price, trust badge
2.4 Listing detail page (`/listings/[id]`) with SSR — full details, images, map placeholder
2.5 Test: listing pages render server-side, visible in page source (for SEO)

### Phase 3 — Dashboard Shell
3.1 Dashboard layout (`/(dashboard)/layout.tsx`) — Clerk auth guard
3.2 Sidebar component — role-based nav items, sign out
3.3 Topbar component — page title, avatar → profile, notification bell
3.4 Mobile nav — hamburger, slide-in sidebar, overlay
3.5 Role routing — after Clerk sign-in, redirect to `/landlord`, `/tenant`, etc. based on DB role
3.6 Onboarding page (`/onboarding`) — role selector for new users, saves to Clerk metadata + DB

### Phase 4 — Landlord Dashboard
4.1 Home (`/landlord`) — portfolio KPIs from DB
4.2 Add Listing (`/landlord/listings/new`) — form + photo upload to Cloudinary
4.3 My Listings (`/landlord/listings`) — list with status, verification tier
4.4 Agreements (`/landlord/agreements`) — list, view HTML preview, sign
4.5 Messages (`/landlord/messages`) — conversation list + thread
4.6 Profile (`/landlord/profile`) — account details + identity verification (Prembly)
4.7 Verify Property (`/landlord/verify`) — 5-step wizard

### Phase 5 — Tenant Dashboard
5.1 Home (`/tenant`) — purpose switcher (Rent/Buy/Short-let/Share), completion banner
5.2 Search (`/tenant/search`) — same listing grid, apply button starts conversation
5.3 Agreements (`/tenant/agreements`) — list, sign, download
5.4 Payments (`/tenant/payments`) — Paystack integration
5.5 Receipts (`/tenant/receipts`) — transaction history
5.6 Profile (`/tenant/profile`) — employment form, identity verification, phone OTP

### Phase 6 — Messaging
6.1 `POST /api/messages/conversations` — idempotent create
6.2 `GET /api/messages/conversations` — list with unread counts
6.3 `GET /api/messages/conversations/[id]/messages` — with `since` param for polling
6.4 `POST /api/messages/conversations/[id]/messages` — send
6.5 Frontend: ConversationList + MessageThread components
6.6 Polling every 4 seconds using `setInterval` + React Query

### Phase 7 — Agent + Admin + Estate Manager
7.1 Agent dashboard — managed listings, commissions
7.2 Admin — verification queue (real data), flags, user management
7.3 Estate Manager — org setup wizard, portfolio, maintenance tickets, team, billing

### Phase 8 — Payments
8.1 `POST /api/payments/initiate` — Paystack transaction init
8.2 `POST /api/payments/webhook` — raw body, HMAC verification, update transaction status
8.3 Frontend: Pay button → Paystack popup → success redirect

### Phase 9 — Integrations
9.1 Resend — replace all email sending
9.2 Sentry — add to layout, capture errors, set user context on login
9.3 UptimeRobot — configure in dashboard (no code)
9.4 Cloudflare — DNS setup (no code)

### Phase 10 — Polish
10.1 Loading skeletons for all data-fetched components
10.2 Error boundaries per dashboard section
10.3 SEO metadata on listing pages (title, description, OG tags)
10.4 Mobile responsive audit
10.5 Performance audit — Lighthouse score > 90 on listing pages

---

## INTERNATIONALISATION (next-intl)

### Install
```bash
npm install next-intl@3.17.0
```

### Folder structure
```
src/
  messages/
    en.json    ← master file, all keys defined here
    yo.json    ← Yoruba
    ig.json    ← Igbo
    ha.json    ← Hausa
    fr.json    ← French
  i18n/
    routing.ts
    request.ts
```

### Config files

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'yo', 'ig', 'ha', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // English has no prefix, others get /yo/, /ha/ etc
})
```

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

```typescript
// middleware.ts — add next-intl to existing Clerk middleware
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'
import { NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const isPublicRoute = createRouteMatcher([
  '/', '/(yo|ig|ha|fr)/',
  '/listings(.*)', '/(yo|ig|ha|fr)/listings(.*)',
  '/sign-in(.*)', '/sign-up(.*)',
  '/sign/(.*)',
  '/api/webhooks(.*)',
  '/api/payments/webhook',
  '/api/listings(.*)',
  '/api/sign(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const intlResponse = intlMiddleware(req)
  if (!isPublicRoute(req)) await auth.protect()
  return intlResponse
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

### Master translation file — create this exact file

```json
// src/messages/en.json
{
  "meta": {
    "title": "PROPATI — Nigeria's Verified Property Platform",
    "description": "Find verified properties to rent, buy, or short-let across Nigeria. Every listing screened with our 5-layer verification."
  },
  "nav": {
    "search": "Find Property",
    "dashboard": "My Dashboard",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "listProperty": "List Property",
    "signOut": "Sign Out",
    "myProfile": "My Profile",
    "messages": "Messages",
    "all": "All",
    "buy": "Buy",
    "rent": "Rent",
    "shortlet": "Short-let",
    "commercial": "Commercial",
    "share": "Share"
  },
  "landing": {
    "badge": "Nigeria's most trusted property marketplace",
    "heroTitle": "Find your next home in Nigeria.",
    "heroSubtitle": "Verified. Trusted. Fast.",
    "heroBody": "Every listing screened with our 5-layer verification — documents, identity, live proof, inspection and certification.",
    "searchPlaceholder": "Search area, street, type (e.g. 3-bed Lekki rent)…",
    "searchButton": "Search",
    "allTypes": "All Types",
    "noListings": "No listings yet",
    "noListingsBody": "Landlords haven't posted any properties yet.",
    "listFirst": "List a Property →",
    "loginToApply": "Sign in to apply"
  },
  "listing": {
    "applyNow": "Apply Now",
    "bookNow": "Book Now",
    "requestViewing": "Request Viewing",
    "perYear": "/yr",
    "perMonth": "/mo",
    "perNight": "/night",
    "total": "total",
    "bedrooms": "{count} bed",
    "bathrooms": "{count} bath",
    "sqm": "{size}m²",
    "new": "NEW",
    "saved": "Saved to favourites",
    "verified": "Verified",
    "inspected": "Inspected",
    "certified": "Certified",
    "basic": "Basic",
    "landlord": "Landlord",
    "postedBy": "Posted by"
  },
  "auth": {
    "welcomeBack": "Welcome back",
    "signInTitle": "Sign in to PROPATI",
    "signInSub": "Your verified property platform",
    "createAccount": "Create Account",
    "signUpTitle": "Join PROPATI",
    "signUpSub": "Nigeria's verified property platform",
    "email": "Email Address",
    "password": "Password",
    "fullName": "Full Name",
    "phone": "Phone Number",
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
    "signInLink": "Sign in →",
    "signUpLink": "Create one →",
    "continueAs": "Continue as {role} →",
    "purpose": {
      "title": "What are you looking for?",
      "rent": "Rent",
      "buy": "Buy",
      "shortlet": "Short-let",
      "share": "Share / Roommate"
    }
  },
  "dashboard": {
    "landlord": {
      "title": "Portfolio Overview",
      "properties": "My Properties",
      "rent": "Rent Collection",
      "addListing": "Add Listing",
      "screening": "Screening Calls",
      "agreements": "Agreements",
      "verify": "Verify Property",
      "collected": "Collected",
      "pending": "Pending",
      "overdue": "Overdue"
    },
    "tenant": {
      "title": "Welcome back, {name}!",
      "findProperty": "Find Property",
      "payments": "Rent & Payments",
      "agreements": "My Agreements",
      "maintenance": "Maintenance",
      "receipts": "Receipts",
      "completeProfile": "Complete your profile to get approved faster",
      "completeProfileBody": "Add employment details and verify your identity",
      "completeAction": "Complete →",
      "nextPayment": "Next Payment",
      "currentHome": "Current Home"
    },
    "agent": {
      "title": "Agent Dashboard",
      "pipeline": "Deal Pipeline",
      "listings": "Managed Listings",
      "commissions": "Commissions",
      "clients": "My Clients",
      "reputation": "Reputation"
    },
    "admin": {
      "title": "Admin Console",
      "verification": "Verification Queue",
      "flags": "Flagged Listings",
      "disputes": "Disputes",
      "users": "Users",
      "revenue": "Revenue"
    },
    "em": {
      "title": "Estate Manager",
      "portfolio": "Portfolio",
      "ledger": "Rent Ledger",
      "maintenance": "Maintenance",
      "team": "Team",
      "billing": "Billing",
      "reports": "Reports",
      "bulkUpload": "Bulk Import"
    }
  },
  "profile": {
    "title": "My Profile",
    "identityVerification": "Verify Your Identity",
    "identityVerified": "Identity Verified",
    "verifiedBadge": "VERIFIED ✓",
    "unverified": "UNVERIFIED",
    "idType": "ID Type",
    "idTypes": {
      "nin": "NIN — National ID",
      "bvn": "BVN — Bank Verification",
      "drivers_license": "Driver's License",
      "voters_card": "Voter's Card (PVC)"
    },
    "idNumber": "ID Number",
    "verifyButton": "Verify Identity",
    "verifying": "Verifying...",
    "confirmMatch": "Is this you?",
    "confirmYes": "Yes, that's me",
    "confirmNo": "Not me",
    "employment": "Employment Details",
    "employmentStatus": "Employment Status",
    "employmentType": "Employment Type",
    "employer": "Employer / Company Name",
    "jobTitle": "Job Title",
    "annualIncome": "Annual Income (₦)",
    "bio": "Personal Bio",
    "guarantor": "Guarantor Details",
    "guarantorName": "Guarantor Full Name",
    "guarantorPhone": "Guarantor Phone",
    "guarantorRelationship": "Relationship",
    "saveProfile": "Save Profile",
    "saving": "Saving...",
    "saved": "Profile saved!",
    "phoneVerification": "Phone Verification",
    "sendOTP": "Send OTP via WhatsApp",
    "enterOTP": "Enter 6-digit OTP",
    "verifyOTP": "Verify",
    "phoneVerified": "Phone verified ✓",
    "security": {
      "title": "How we protect your data",
      "encryption": "AES-256-GCM encryption — Your NIN and BVN are encrypted before storage",
      "hashing": "One-way hashing — ID numbers are never stored in plaintext",
      "income": "Income privacy — Landlords only see your income band, never exact figure",
      "sharing": "Zero third-party sharing — Your data is never sold or shared",
      "transit": "Encrypted in transit — All connections use HTTPS/TLS"
    }
  },
  "agreements": {
    "title": "Agreements",
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
    "sign": "Sign Agreement",
    "view": "View Document",
    "download": "Download PDF",
    "signed": "Signed",
    "signedAt": "Signed {date}",
    "awaitingYourSignature": "Awaiting your signature",
    "fullyExecuted": "Fully executed",
    "signingPage": {
      "title": "Sign Tenancy Agreement",
      "property": "Property",
      "landlord": "Landlord",
      "tenant": "Tenant",
      "period": "Tenancy Period",
      "rent": "Rent Amount",
      "reviewDoc": "Please review the complete agreement before signing",
      "fullName": "Type your full legal name to sign",
      "fullNamePlaceholder": "e.g. Adaeze Okonkwo",
      "consent": "I have read and agree to the terms of this tenancy agreement. I understand this is a legally binding electronic signature.",
      "signButton": "Sign Agreement →",
      "signing": "Signing...",
      "successTitle": "Agreement Signed! ✅",
      "successBody": "A signed copy has been emailed to all parties.",
      "expired": "This signing link has expired. Please contact the property owner.",
      "alreadySigned": "You have already signed this agreement.",
      "legalNote": "This electronic signature is legally valid under the Nigeria Cybercrimes Act 2015 and NITDA Electronic Signature Guidelines."
    }
  },
  "messages": {
    "title": "Messages",
    "noConversations": "No conversations yet",
    "noConversationsBody": "Apply for a property to start a conversation with a landlord",
    "typeMessage": "Type a message...",
    "send": "Send",
    "you": "You",
    "unread": "{count} unread"
  },
  "verification": {
    "title": "Verify Property",
    "layer1": "Documents",
    "layer2": "Identity",
    "layer3": "Live Proof",
    "layer4": "Inspection",
    "layer5": "Certification",
    "pending": "Pending",
    "approved": "Approved",
    "rejected": "Rejected",
    "uploadDoc": "Upload Document",
    "submit": "Submit for Review",
    "adminApprove": "Approve",
    "adminReject": "Reject"
  },
  "payments": {
    "title": "Rent & Payments",
    "payNow": "Pay Rent",
    "amount": "Amount",
    "dueDate": "Due Date",
    "status": {
      "upcoming": "Upcoming",
      "paid": "Paid",
      "overdue": "Overdue"
    },
    "history": "Payment History",
    "receipt": "Receipt",
    "reference": "Reference"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again",
    "save": "Save",
    "cancel": "Cancel",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "share": "Share",
    "copy": "Copy",
    "copied": "Copied!",
    "yes": "Yes",
    "no": "No",
    "confirm": "Confirm",
    "required": "Required",
    "optional": "Optional",
    "naira": "₦",
    "perYear": "per year",
    "perMonth": "per month",
    "perNight": "per night",
    "today": "Today",
    "yesterday": "Yesterday",
    "ago": "{time} ago",
    "justNow": "Just now",
    "bedrooms": "Bedrooms",
    "bathrooms": "Bathrooms",
    "size": "Size",
    "location": "Location",
    "price": "Price",
    "type": "Type",
    "status": "Status",
    "date": "Date",
    "name": "Name",
    "email": "Email",
    "phone": "Phone",
    "address": "Address",
    "noResults": "No results found",
    "emptyState": "Nothing here yet"
  }
}
```

### AI-generate the other 4 language files

When Claude Code sets up the project, it must generate all 4 translation files by calling the Anthropic API (or using Claude directly) to translate every key from `en.json`. Use this exact prompt for each language:

```
Translate the following JSON values into [LANGUAGE]. 
Rules:
- Translate ONLY the values, never the keys
- Keep {placeholders} exactly as they are — do not translate them  
- Keep ₦ symbol as-is
- Keep "PROPATI" as-is — it is a brand name
- Keep "NIN", "BVN", "PVC" as-is — they are Nigerian abbreviations
- Keep "Paystack", "Cloudinary", "Clerk" as-is — brand names
- Return ONLY valid JSON, no explanation
- Use natural, conversational [LANGUAGE] — not formal/stiff translation
- For Yoruba: use standard Yoruba with tone marks where appropriate
- For Igbo: use Central Igbo dialect
- For Hausa: use standard Hausa (Kano dialect)
- For French: use standard French (not Canadian French)

[paste en.json content here]
```

After generating, save as `src/messages/yo.json`, `ig.json`, `ha.json`, `fr.json`.

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

  function switchLocale(newLocale: string) {
    // Replace locale prefix in URL
    const segments = pathname.split('/')
    const locales = ['yo', 'ig', 'ha', 'fr']
    const hasLocale = locales.includes(segments[1])
    
    if (newLocale === 'en') {
      const path = hasLocale ? '/' + segments.slice(2).join('/') : pathname
      router.push(path || '/')
    } else {
      const path = hasLocale ? `/${newLocale}/${segments.slice(2).join('/')}` : `/${newLocale}${pathname}`
      router.push(path)
    }
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-black/5 transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span className="text-xs opacity-50">▾</span>
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 min-w-[140px]">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  locale === lang.code ? 'font-bold text-teal-600' : 'text-gray-700'
                }`}
              >
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

Add `<LanguageSwitcher />` to both the landing page nav and the dashboard Topbar.

### Usage pattern in every component

```typescript
// Always import from next-intl, never hardcode strings
import { useTranslations } from 'next-intl'

export function SomeComponent() {
  const t = useTranslations('common')
  const tListing = useTranslations('listing')
  
  return (
    <div>
      <span>{t('loading')}</span>
      <button>{tListing('applyNow')}</button>
    </div>
  )
}

// Server Components use getTranslations (async)
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('landing')
  return <h1>{t('heroTitle')}</h1>
}
```

---

## E-SIGNATURE SYSTEM

Build a complete custom e-signature system. Do NOT use DocuSign, HelloSign, or any third-party signing service.

### New DB columns — add to Prisma schema

```prisma
model Agreement {
  // ... existing fields ...
  
  // E-signature tokens
  landlordSigningToken  String?   @map("landlord_signing_token")   // raw token — NOT stored, sent in email only
  landlordTokenHash     String?   @map("landlord_token_hash")      // bcrypt hash stored in DB
  landlordTokenExpires  DateTime? @map("landlord_token_expires")
  tenantSigningToken    String?   @map("tenant_signing_token")     // same pattern
  tenantTokenHash       String?   @map("tenant_token_hash")
  tenantTokenExpires    DateTime? @map("tenant_token_expires")
  
  // PDF storage
  draftPdfUrl           String?   @map("draft_pdf_url")            // unsigned PDF on Cloudinary
  signedPdfUrl          String?   @map("signed_pdf_url")           // fully signed PDF on Cloudinary
  documentHash          String?   @map("document_hash")            // SHA256 of draft PDF content
}
```

Run `prisma migrate dev --name add_esignature_fields` after updating schema.

### New API routes to create

```
POST /api/agreements                          ← existing, add PDF generation + email
POST /api/agreements/[id]/send-for-signing    ← generate tokens, send emails
GET  /api/sign/[token]                        ← public: verify token, return agreement data
POST /api/sign/[token]                        ← public: submit signature
GET  /api/agreements/[id]/audit               ← full audit trail
GET  /api/agreements/[id]/download            ← redirect to signed PDF URL
```

### Complete implementation

#### 1. PDF Generation Service

```typescript
// src/lib/pdf.ts
import PDFDocument from 'pdfkit'
import { Readable } from 'stream'
import crypto from 'crypto'

interface AgreementData {
  id: string
  propertyTitle: string
  propertyAddress: string
  landlordName: string
  tenantName: string
  startDate: string
  endDate: string
  rentAmount: number
  rentPeriod: string
  cautionDeposit?: number
  specialClauses?: string
}

export async function generateAgreementPDF(agreement: AgreementData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('PROPATI', { align: 'center' })
    doc.fontSize(10).font('Helvetica').fillColor('#666')
      .text('Nigeria\'s Verified Property Platform — propati.ng', { align: 'center' })
    doc.moveDown(0.5)
    
    // Title
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb')
    doc.moveDown(0.5)
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#111')
      .text('TENANCY AGREEMENT', { align: 'center' })
    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb')
    doc.moveDown(1)

    // Agreement ID and Date
    doc.fontSize(9).font('Helvetica').fillColor('#666')
      .text(`Agreement Reference: ${agreement.id}`, { align: 'right' })
      .text(`Generated: ${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'right' })
    doc.moveDown(1)

    // Parties
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111').text('PARTIES')
    doc.moveDown(0.3)
    
    const tableData = [
      ['LANDLORD', agreement.landlordName],
      ['TENANT', agreement.tenantName],
    ]
    tableData.forEach(([label, value]) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#555').text(label, { continued: true, width: 150 })
      doc.font('Helvetica').fillColor('#111').text(`  ${value}`)
    })
    doc.moveDown(1)

    // Property details
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111').text('PROPERTY DETAILS')
    doc.moveDown(0.3)
    const propData = [
      ['Property', agreement.propertyTitle],
      ['Address', agreement.propertyAddress],
      ['Tenancy Start', agreement.startDate],
      ['Tenancy End', agreement.endDate],
      ['Rent Amount', `₦${agreement.rentAmount.toLocaleString('en-NG')} per ${agreement.rentPeriod}`],
      ...(agreement.cautionDeposit ? [['Caution Deposit', `₦${agreement.cautionDeposit.toLocaleString('en-NG')}`]] : []),
    ]
    propData.forEach(([label, value]) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#555').text(label, { continued: true, width: 150 })
      doc.font('Helvetica').fillColor('#111').text(`  ${value}`)
    })
    doc.moveDown(1)

    // Standard clauses
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111').text('TERMS AND CONDITIONS')
    doc.moveDown(0.3)
    const clauses = [
      '1. The Tenant agrees to pay rent as specified above on the due date each period.',
      '2. The Tenant shall maintain the property in good condition throughout the tenancy.',
      '3. The Tenant shall not sublet or assign the property without written consent from the Landlord.',
      '4. The Caution Deposit shall be refunded within 30 days of vacating, subject to property inspection.',
      '5. Either party may terminate this agreement with 30 days written notice.',
      '6. The Tenant shall allow the Landlord reasonable access for inspections with 24 hours notice.',
      '7. This agreement is governed by the laws of the Federal Republic of Nigeria.',
    ]
    clauses.forEach(clause => {
      doc.fontSize(9).font('Helvetica').fillColor('#333').text(clause, { lineGap: 3 })
      doc.moveDown(0.2)
    })

    if (agreement.specialClauses) {
      doc.moveDown(0.5)
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#111').text('SPECIAL CONDITIONS')
      doc.moveDown(0.3)
      doc.fontSize(9).font('Helvetica').fillColor('#333').text(agreement.specialClauses)
    }

    doc.moveDown(1.5)

    // Signature blocks (placeholders — filled after signing)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb')
    doc.moveDown(0.5)
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111').text('SIGNATURES')
    doc.moveDown(0.5)

    const sigY = doc.y
    // Landlord signature block
    doc.fontSize(9).font('Helvetica').fillColor('#666')
    doc.text('LANDLORD', 50, sigY)
    doc.moveTo(50, sigY + 30).lineTo(250, sigY + 30).stroke('#ccc')
    doc.text('Signature', 50, sigY + 35)
    doc.text('___________________________', 50, sigY + 48)
    doc.text('Date / Timestamp', 50, sigY + 63)

    // Tenant signature block
    doc.text('TENANT', 300, sigY)
    doc.moveTo(300, sigY + 30).lineTo(500, sigY + 30).stroke('#ccc')
    doc.text('Signature', 300, sigY + 35)
    doc.text('___________________________', 300, sigY + 48)
    doc.text('Date / Timestamp', 300, sigY + 63)

    doc.moveDown(5)

    // Legal footer
    doc.fontSize(7).fillColor('#999').font('Helvetica')
      .text('This is a legally binding electronic document. Electronic signatures on this document are valid under the Nigeria Cybercrimes Act 2015 and NITDA Electronic Signature Guidelines.', {
        align: 'center', lineGap: 2,
      })

    doc.end()
  })
}

export async function generateSignedPDF(
  agreement: AgreementData,
  signatures: {
    landlord?: { name: string; signedAt: Date; ipAddress: string }
    tenant?: { name: string; signedAt: Date; ipAddress: string }
  },
  documentHash: string
): Promise<Buffer> {
  // Generate base PDF first
  const basePdf = await generateAgreementPDF(agreement)

  // For simplicity, create a new PDF with signature data appended
  // In production, consider pdf-lib to overlay onto existing PDF
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Re-render the full agreement (same as above)
    // ... (call generateAgreementPDF logic here, then append signature block)

    // Signature verification block at end
    doc.addPage()
    doc.fontSize(14).font('Helvetica-Bold').text('ELECTRONIC SIGNATURE CERTIFICATE', { align: 'center' })
    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb')
    doc.moveDown(0.5)

    doc.fontSize(9).font('Helvetica').fillColor('#333')
      .text('This document certifies that the following parties have electronically signed the agreement above:')
    doc.moveDown(1)

    if (signatures.landlord) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0e7c6a').text('✓ LANDLORD SIGNATURE VERIFIED')
      doc.fontSize(9).font('Helvetica').fillColor('#333')
        .text(`Name: ${signatures.landlord.name}`)
        .text(`Signed: ${signatures.landlord.signedAt.toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT`)
        .text(`IP Address: ${signatures.landlord.ipAddress}`)
      doc.moveDown(0.8)
    }

    if (signatures.tenant) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0e7c6a').text('✓ TENANT SIGNATURE VERIFIED')
      doc.fontSize(9).font('Helvetica').fillColor('#333')
        .text(`Name: ${signatures.tenant.name}`)
        .text(`Signed: ${signatures.tenant.signedAt.toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT`)
        .text(`IP Address: ${signatures.tenant.ipAddress}`)
      doc.moveDown(0.8)
    }

    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb')
    doc.moveDown(0.5)

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#333').text('DOCUMENT INTEGRITY')
    doc.font('Helvetica').fillColor('#666')
      .text(`Document Hash (SHA-256): ${documentHash}`)
      .text('This hash can be used to verify the document has not been tampered with after signing.')
    doc.moveDown(0.5)

    doc.fontSize(8).fillColor('#999')
      .text('Valid under Nigeria Cybercrimes Act 2015 (Section 17) and NITDA Electronic Signature Guidelines.', { align: 'center' })
      .text('Issued by PROPATI — propati.ng', { align: 'center' })

    doc.end()
  })
}

export function hashDocument(pdfBuffer: Buffer): string {
  return crypto.createHash('sha256').update(pdfBuffer).digest('hex')
}
```

#### 2. Send for Signing API Route

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
        landlord: true,
        tenant: true,
        listing: true,
      },
    })

    if (!agreement) return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })
    if (agreement.landlordId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Generate PDF
    const pdfBuffer = await generateAgreementPDF({
      id: agreement.id,
      propertyTitle: agreement.listing.title,
      propertyAddress: agreement.listing.address,
      landlordName: agreement.landlord.fullName,
      tenantName: agreement.tenant.fullName,
      startDate: agreement.startDate?.toLocaleDateString('en-NG') ?? '',
      endDate: agreement.endDate?.toLocaleDateString('en-NG') ?? '',
      rentAmount: Number(agreement.rentAmount),
      rentPeriod: agreement.rentPeriod ?? 'year',
      cautionDeposit: agreement.cautionDeposit ? Number(agreement.cautionDeposit) : undefined,
      specialClauses: agreement.specialClauses ?? undefined,
    })

    const documentHash = hashDocument(pdfBuffer)

    // Upload draft PDF to Cloudinary
    const { secure_url: draftPdfUrl } = await uploadBuffer(pdfBuffer, {
      subfolder: 'agreements',
      resource_type: 'raw',
      public_id: `agreement_${agreement.id}_draft`,
    })

    // Generate unique signing tokens
    const landlordRawToken = crypto.randomBytes(32).toString('hex')
    const tenantRawToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const [landlordTokenHash, tenantTokenHash] = await Promise.all([
      bcrypt.hash(landlordRawToken, 8),
      bcrypt.hash(tenantRawToken, 8),
    ])

    // Update agreement with tokens and PDF
    await prisma.agreement.update({
      where: { id: agreement.id },
      data: {
        status: 'pending_landlord',
        draftPdfUrl,
        documentHash,
        landlordTokenHash,
        tenantTokenHash,
        landlordTokenExpires: tokenExpiry,
        tenantTokenExpires: tokenExpiry,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://propati.ng'

    // Send emails to both parties
    await Promise.all([
      sendAgreementSigningEmail({
        to: agreement.landlord.email,
        recipientName: agreement.landlord.fullName,
        role: 'landlord',
        propertyTitle: agreement.listing.title,
        signingUrl: `${baseUrl}/sign/${landlordRawToken}?role=landlord&id=${agreement.id}`,
        pdfUrl: draftPdfUrl,
        otherPartyName: agreement.tenant.fullName,
        rentAmount: Number(agreement.rentAmount),
        rentPeriod: agreement.rentPeriod ?? 'year',
      }),
      sendAgreementSigningEmail({
        to: agreement.tenant.email,
        recipientName: agreement.tenant.fullName,
        role: 'tenant',
        propertyTitle: agreement.listing.title,
        signingUrl: `${baseUrl}/sign/${tenantRawToken}?role=tenant&id=${agreement.id}`,
        pdfUrl: draftPdfUrl,
        otherPartyName: agreement.landlord.fullName,
        rentAmount: Number(agreement.rentAmount),
        rentPeriod: agreement.rentPeriod ?? 'year',
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Signing emails sent to both parties',
      draftPdfUrl,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send for signing' }, { status: 500 })
  }
}
```

#### 3. Signing Page (Public)

```typescript
// src/app/sign/[token]/page.tsx
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SigningForm } from './SigningForm'
import { getTranslations } from 'next-intl/server'

interface Props {
  params: { token: string }
  searchParams: { role: 'landlord' | 'tenant'; id: string }
}

export default async function SigningPage({ params, searchParams }: Props) {
  const t = await getTranslations('agreements.signingPage')
  const { role, id } = searchParams

  if (!id || !role) {
    return <ErrorPage message="Invalid signing link" />
  }

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: {
      landlord: { select: { fullName: true } },
      tenant: { select: { fullName: true } },
      listing: { select: { title: true, address: true } },
    },
  })

  if (!agreement) return <ErrorPage message={t('expired')} />

  // Verify token
  const tokenHash = role === 'landlord' ? agreement.landlordTokenHash : agreement.tenantTokenHash
  const tokenExpires = role === 'landlord' ? agreement.landlordTokenExpires : agreement.tenantTokenExpires

  if (!tokenHash || !tokenExpires) return <ErrorPage message={t('expired')} />
  if (new Date() > tokenExpires) return <ErrorPage message={t('expired')} />

  const tokenValid = await bcrypt.compare(params.token, tokenHash)
  if (!tokenValid) return <ErrorPage message={t('expired')} />

  // Check already signed
  const alreadySigned = role === 'landlord'
    ? !!agreement.landlordSignedAt
    : !!agreement.tenantSignedAt

  if (alreadySigned) return <AlreadySignedPage agreement={agreement} role={role} />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-2xl font-black mb-1">
            <span className="text-amber-600">P</span>ROPATI
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{agreement.listing.title}</p>
        </div>

        {/* Agreement summary card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              [t('property'), agreement.listing.title],
              [t('landlord'), agreement.landlord.fullName],
              [t('tenant'), agreement.tenant.fullName],
              [t('rent'), `₦${Number(agreement.rentAmount).toLocaleString('en-NG')}/${agreement.rentPeriod}`],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-xs text-gray-500 font-medium">{label}</div>
                <div className="font-semibold text-gray-900">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF viewer link */}
        {agreement.draftPdfUrl && (
          <a
            href={agreement.draftPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 mb-4 transition-colors"
          >
            📄 {t('reviewDoc')}
          </a>
        )}

        {/* Signing form (client component) */}
        <SigningForm
          token={params.token}
          agreementId={id}
          role={role}
          signerName={role === 'landlord' ? agreement.landlord.fullName : agreement.tenant.fullName}
        />

        <p className="text-xs text-gray-400 text-center mt-4">{t('legalNote')}</p>
      </div>
    </div>
  )
}
```

```typescript
// src/app/sign/[token]/SigningForm.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  token: string
  agreementId: string
  role: 'landlord' | 'tenant'
  signerName: string
}

export function SigningForm({ token, agreementId, role, signerName }: Props) {
  const t = useTranslations('agreements.signingPage')
  const [name, setName] = useState('')
  const [consented, setConsented] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSign() {
    if (!name.trim()) { setError('Please enter your full legal name'); return }
    if (!consented) { setError('Please read and accept the agreement terms'); return }

    setLoading(true)
    setError('')

    const res = await fetch(`/api/sign/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agreementId, role, signerName: name.trim(), consent: true }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.success) {
      setSuccess(true)
    } else {
      setError(data.error ?? 'Signing failed. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <div className="font-bold text-green-800 text-lg">{t('successTitle')}</div>
        <div className="text-green-700 text-sm mt-1">{t('successBody')}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('fullName')}</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={signerName}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 transition-colors"
        />
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={consented}
          onChange={e => setConsented(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
        />
        <span className="text-xs text-gray-600 leading-relaxed">{t('consent')}</span>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium mb-3">
          {error}
        </div>
      )}

      <button
        onClick={handleSign}
        disabled={loading || !name.trim() || !consented}
        className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('signing') : t('signButton')}
      </button>
    </div>
  )
}
```

#### 4. Sign Submission API Route

```typescript
// src/app/api/sign/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSignedPDF, hashDocument } from '@/lib/pdf'
import { uploadBuffer } from '@/lib/cloudinary'
import { sendSignedAgreementEmail } from '@/lib/resend'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  // Verify token validity (used by signing page server component — see above)
  return NextResponse.json({ valid: true })
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { agreementId, role, signerName, consent } = await request.json()
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    if (!consent) return NextResponse.json({ success: false, error: 'Consent required' }, { status: 400 })
    if (!signerName?.trim()) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 })

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: {
        landlord: true,
        tenant: true,
        listing: true,
      },
    })

    if (!agreement) return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })

    // Verify token
    const tokenHash = role === 'landlord' ? agreement.landlordTokenHash : agreement.tenantTokenHash
    const tokenExpires = role === 'landlord' ? agreement.landlordTokenExpires : agreement.tenantTokenExpires

    if (!tokenHash || !tokenExpires || new Date() > tokenExpires) {
      return NextResponse.json({ success: false, error: 'Signing link has expired' }, { status: 400 })
    }

    const tokenValid = await bcrypt.compare(params.token, tokenHash)
    if (!tokenValid) return NextResponse.json({ success: false, error: 'Invalid signing link' }, { status: 400 })

    // Check not already signed
    const alreadySigned = role === 'landlord' ? !!agreement.landlordSignedAt : !!agreement.tenantSignedAt
    if (alreadySigned) return NextResponse.json({ success: false, error: 'Already signed' }, { status: 400 })

    const now = new Date()
    const checksum = crypto
      .createHash('sha256')
      .update(`${agreementId}${role}${signerName}${now.toISOString()}`)
      .digest('hex')

    // Record signature
    await prisma.agreementSignature.create({
      data: {
        id: `sig_${crypto.randomBytes(8).toString('hex')}`,
        agreementId,
        signerId: role === 'landlord' ? agreement.landlordId : agreement.tenantId,
        role,
        ipAddress: ip,
        userAgent,
        consentText: `I, ${signerName}, have read and agree to the terms of this tenancy agreement. Signed electronically on ${now.toISOString()}.`,
        signedAt: now,
        checksum,
      },
    })

    // Update agreement status
    const updateData: any = role === 'landlord'
      ? { landlordSignedAt: now }
      : { tenantSignedAt: now }

    // Determine new status
    const bothSigned = role === 'landlord'
      ? !!agreement.tenantSignedAt
      : !!agreement.landlordSignedAt

    updateData.status = bothSigned ? 'fully_signed' : (role === 'landlord' ? 'landlord_signed' : 'tenant_signed')

    const updatedAgreement = await prisma.agreement.update({
      where: { id: agreementId },
      data: updateData,
    })

    // If both signed → generate final signed PDF
    if (bothSigned) {
      const landlordSig = await prisma.agreementSignature.findFirst({
        where: { agreementId, role: 'landlord' },
      })
      const tenantSig = await prisma.agreementSignature.findFirst({
        where: { agreementId, role: 'tenant' },
      })

      const signedPdfBuffer = await generateSignedPDF(
        {
          id: agreement.id,
          propertyTitle: agreement.listing.title,
          propertyAddress: agreement.listing.address,
          landlordName: agreement.landlord.fullName,
          tenantName: agreement.tenant.fullName,
          startDate: agreement.startDate?.toLocaleDateString('en-NG') ?? '',
          endDate: agreement.endDate?.toLocaleDateString('en-NG') ?? '',
          rentAmount: Number(agreement.rentAmount),
          rentPeriod: agreement.rentPeriod ?? 'year',
          cautionDeposit: agreement.cautionDeposit ? Number(agreement.cautionDeposit) : undefined,
          specialClauses: agreement.specialClauses ?? undefined,
        },
        {
          landlord: landlordSig ? { name: signerName, signedAt: landlordSig.signedAt, ipAddress: landlordSig.ipAddress ?? 'unknown' } : undefined,
          tenant: tenantSig ? { name: signerName, signedAt: tenantSig.signedAt, ipAddress: tenantSig.ipAddress ?? 'unknown' } : undefined,
        },
        agreement.documentHash ?? ''
      )

      const { secure_url: signedPdfUrl } = await uploadBuffer(signedPdfBuffer, {
        subfolder: 'agreements',
        resource_type: 'raw',
        public_id: `agreement_${agreementId}_signed`,
      })

      await prisma.agreement.update({
        where: { id: agreementId },
        data: { signedPdfUrl },
      })

      // Email signed PDF to both parties
      await Promise.all([
        sendSignedAgreementEmail({
          to: agreement.landlord.email,
          recipientName: agreement.landlord.fullName,
          propertyTitle: agreement.listing.title,
          signedPdfUrl,
          otherPartyName: agreement.tenant.fullName,
        }),
        sendSignedAgreementEmail({
          to: agreement.tenant.email,
          recipientName: agreement.tenant.fullName,
          propertyTitle: agreement.listing.title,
          signedPdfUrl,
          otherPartyName: agreement.landlord.fullName,
        }),
      ])
    }

    return NextResponse.json({
      success: true,
      message: bothSigned ? 'Agreement fully signed. Signed copy emailed to all parties.' : 'Signature recorded. Awaiting other party.',
      status: updateData.status,
    })
  } catch (error) {
    console.error('Sign error:', error)
    return NextResponse.json({ success: false, error: 'Signing failed' }, { status: 500 })
  }
}
```

#### 5. Resend Email Templates for Agreements

```typescript
// Add to src/lib/resend.ts

export async function sendAgreementSigningEmail(params: {
  to: string
  recipientName: string
  role: 'landlord' | 'tenant'
  propertyTitle: string
  signingUrl: string
  pdfUrl: string
  otherPartyName: string
  rentAmount: number
  rentPeriod: string
}) {
  const firstName = params.recipientName.split(' ')[0]
  const roleLabel = params.role === 'landlord' ? 'Landlord' : 'Tenant'
  const otherLabel = params.role === 'landlord' ? 'Tenant' : 'Landlord'

  return sendEmail(
    params.to,
    `Action Required: Sign your Tenancy Agreement — ${params.propertyTitle}`,
    `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#F5F3EE;font-family:Inter,system-ui,sans-serif">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
      <div style="background:#0B1220;padding:20px 28px;display:flex;align-items:center;gap:12px">
        <span style="font-size:18px;font-weight:900;color:#fff"><span style="color:#c9952a">P</span>ROPATI</span>
      </div>
      <div style="padding:28px">
        <h2 style="color:#0B1220;margin:0 0 8px;font-size:18px">Sign your Tenancy Agreement</h2>
        <p style="color:#4B5563;margin:0 0 16px">Hi ${firstName}, your tenancy agreement for <strong>${params.propertyTitle}</strong> is ready for your signature.</p>
        
        <div style="background:#f9f7f4;border-radius:8px;padding:14px 16px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:#6B7280">Property</span>
            <span style="font-size:13px;font-weight:600;color:#111">${params.propertyTitle}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:#6B7280">${otherLabel}</span>
            <span style="font-size:13px;font-weight:600;color:#111">${params.otherPartyName}</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="font-size:12px;color:#6B7280">Rent</span>
            <span style="font-size:13px;font-weight:600;color:#111">₦${params.rentAmount.toLocaleString('en-NG')}/${params.rentPeriod}</span>
          </div>
        </div>

        <a href="${params.signingUrl}" style="display:block;text-align:center;background:#0e7c6a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:14px">
          ✍️ Sign Agreement →
        </a>
        
        <a href="${params.pdfUrl}" style="display:block;text-align:center;color:#0e7c6a;padding:10px;border:1.5px solid #0e7c6a;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;margin-bottom:16px">
          📄 View Agreement PDF
        </a>
        
        <p style="color:#9CA3AF;font-size:11px;text-align:center;margin:0">
          This signing link expires in 7 days. Valid under Nigeria Cybercrimes Act 2015.
        </p>
      </div>
    </div></body></html>`
  )
}

export async function sendSignedAgreementEmail(params: {
  to: string
  recipientName: string
  propertyTitle: string
  signedPdfUrl: string
  otherPartyName: string
}) {
  const firstName = params.recipientName.split(' ')[0]

  return sendEmail(
    params.to,
    `✅ Signed Agreement — ${params.propertyTitle}`,
    `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#F5F3EE;font-family:Inter,system-ui,sans-serif">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
      <div style="background:#0B1220;padding:20px 28px">
        <span style="font-size:18px;font-weight:900;color:#fff"><span style="color:#c9952a">P</span>ROPATI</span>
      </div>
      <div style="padding:28px">
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:40px;margin-bottom:8px">✅</div>
          <h2 style="color:#0B1220;margin:0;font-size:20px">Agreement Fully Signed</h2>
          <p style="color:#4B5563;margin:8px 0 0">Both parties have signed. Your tenancy is confirmed.</p>
        </div>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:20px">
          <div style="font-weight:700;color:#15803d;margin-bottom:6px;font-size:13px">AGREEMENT DETAILS</div>
          <div style="font-size:13px;color:#166534">Property: <strong>${params.propertyTitle}</strong></div>
          <div style="font-size:13px;color:#166534">Other Party: <strong>${params.otherPartyName}</strong></div>
        </div>

        <a href="${params.signedPdfUrl}" style="display:block;text-align:center;background:#0e7c6a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:12px">
          📥 Download Signed Agreement
        </a>
        
        <p style="color:#9CA3AF;font-size:11px;text-align:center;margin:0">
          Keep this document safe. It is a legally binding agreement.
        </p>
      </div>
    </div></body></html>`
  )
}
```

#### 6. Audit Trail Route

```typescript
// src/app/api/agreements/[id]/audit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireDbUser()

    const agreement = await prisma.agreement.findUnique({
      where: { id: params.id },
      include: { signatures: true },
    })

    if (!agreement) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Only landlord, tenant, or admin can view audit
    const canView = [agreement.landlordId, agreement.tenantId].includes(user.id) || user.role === 'admin'
    if (!canView) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({
      success: true,
      audit: {
        agreementId: agreement.id,
        documentHash: agreement.documentHash,
        draftPdfUrl: agreement.draftPdfUrl,
        signedPdfUrl: agreement.signedPdfUrl,
        status: agreement.status,
        signatures: agreement.signatures.map(sig => ({
          role: sig.role,
          signedAt: sig.signedAt,
          ipAddress: sig.ipAddress,
          checksum: sig.checksum,
          consentText: sig.consentText,
        })),
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to load audit trail' }, { status: 500 })
  }
}
```

### Add to WHAT NOT TO DO section
- Do not integrate DocuSign, HelloSign, or any third-party signing service — the custom e-signature system above is complete and legally valid in Nigeria
- Do not use Google Translate API at runtime for i18n — all translations are static JSON files generated once
- Do not hardcode any UI strings — every user-facing string must use `t('key')` from next-intl

---

## WHAT NOT TO DO

- Do not use the Pages Router — App Router only
- Do not use `getServerSideProps` or `getStaticProps` — use Server Components
- Do not use `useEffect` for data fetching — use React Query or Server Components
- Do not write raw SQL — use Prisma only
- Do not store passwords — Clerk handles all auth
- Do not create custom JWT logic — Clerk handles sessions
- Do not use `any` TypeScript type without a comment explaining why
- Do not make the Paystack webhook route parse JSON automatically — it needs raw body
- Do not put secrets in frontend code — anything with `NEXT_PUBLIC_` is public

---

## REFERENCE DOCUMENTS

These files are in this directory and contain the full spec:
- `PRD.md` — every feature, in scope / out of scope
- `APP_FLOW.md` — every page, every user path, every API call
- `TECH_STACK.md` — exact versions, env vars, security setup
- `FRONTEND_GUIDELINES.md` — colours, typography, components, patterns
- `BACKEND_STRUCTURE.md` — full DB schema, all API endpoints
- `IMPLEMENTATION_PLAN.md` — what's built, what's pending, file change reference
- `PROPATI_CLAUDE_CODE_CONTEXT.md` — full history of existing system

Start with Phase 1. Tell me when each phase is complete and working before moving to the next.
