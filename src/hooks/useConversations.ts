'use client'

import { useQuery } from '@tanstack/react-query'

interface ConversationUser {
  id: string
  fullName: string
  avatarUrl: string | null
}

export interface Conversation {
  id: string
  listingId: string | null
  landlordId: string
  tenantId: string
  subject: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  unreadLandlord: number | null
  unreadTenant: number | null
  landlord: ConversationUser
  tenant: ConversationUser
  listing: { id: string; title: string } | null
}

export function useConversations() {
  return useQuery<{ success: boolean; conversations: Conversation[] }>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/messages')
      return res.json()
    },
    refetchInterval: 10000, // poll every 10s for new conversations
  })
}
