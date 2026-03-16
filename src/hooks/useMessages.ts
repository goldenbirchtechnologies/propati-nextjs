'use client'

import { useQuery } from '@tanstack/react-query'

export interface MessageData {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: string | null
  createdAt: string | null
  sender: {
    id: string
    fullName: string
    avatarUrl: string | null
  }
}

export function useMessages(conversationId: string) {
  return useQuery<{ success: boolean; messages: MessageData[] }>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${conversationId}/messages`)
      return res.json()
    },
    enabled: !!conversationId,
    refetchInterval: 4000, // poll every 4s for new messages
  })
}
