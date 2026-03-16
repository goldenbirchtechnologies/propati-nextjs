export interface ApiResponse<T = unknown> {
  success: boolean
  error?: string
  details?: unknown[]
  data?: T
}

export interface PaginatedResponse<T> extends ApiResponse {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface ListingsResponse {
  success: boolean
  listings: import('./index').Listing[]
}

export interface ConversationsResponse {
  success: boolean
  conversations: import('./index').Conversation[]
}

export interface MessagesResponse {
  success: boolean
  messages: import('./index').Message[]
}
