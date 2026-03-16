export type UserRole = 'landlord' | 'tenant' | 'agent' | 'admin' | 'estate_manager'

export type ListingType = 'rent' | 'sale' | 'short-let' | 'share' | 'commercial'

export type ListingStatus = 'draft' | 'active' | 'suspended' | 'deleted'

export type VerificationTier = 'basic' | 'verified' | 'inspected' | 'certified'

export type AgreementStatus =
  | 'draft'
  | 'pending_landlord'
  | 'pending_tenant'
  | 'tenant_signed'
  | 'landlord_signed'
  | 'fully_signed'
  | 'terminated'
  | 'expired'

export interface User {
  id: string
  clerkUserId: string | null
  email: string
  phone: string | null
  fullName: string
  avatarUrl: string | null
  role: UserRole
  ninVerified: boolean
  idVerified: boolean
  phoneVerified: boolean
  isActive: boolean
  createdAt: string
}

export interface Listing {
  id: string
  ownerId: string
  title: string
  description: string | null
  listingType: ListingType
  propertyType: string | null
  address: string
  area: string
  state: string
  price: number
  pricePeriod: string
  bedrooms: number | null
  bathrooms: number | null
  sizeSqm: number | null
  furnished: boolean
  amenities: string[] | null
  status: ListingStatus
  isFeatured: boolean
  verificationTier: VerificationTier
  viewsCount: number
  images: ListingImage[]
  owner?: { fullName: string; avatarUrl?: string | null }
  createdAt: string
}

export interface ListingImage {
  id: string
  url: string
  isCover: boolean
  sortOrder: number
}

export interface Conversation {
  id: string
  listingId: string | null
  landlordId: string
  tenantId: string
  subject: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  unreadTenant: number
  unreadLandlord: number
  status: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  attachmentUrl: string | null
  isRead: boolean
  createdAt: string
}

export interface Agreement {
  id: string
  listingId: string
  landlordId: string
  tenantId: string
  type: string
  status: AgreementStatus
  startDate: string | null
  endDate: string | null
  rentAmount: number | null
  rentPeriod: string | null
  createdAt: string
}
