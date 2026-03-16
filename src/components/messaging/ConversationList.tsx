'use client'

import { formatDistanceToNow } from 'date-fns'
import type { Conversation } from '@/hooks/useConversations'

interface Props {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  currentUserId: string
}

export default function ConversationList({ conversations, selectedId, onSelect, currentUserId }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-gray-500">No conversations yet</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {conversations.map((conv) => {
        const isLandlord = conv.landlordId === currentUserId
        const otherParty = isLandlord ? conv.tenant : conv.landlord
        const unread = isLandlord ? (conv.unreadLandlord ?? 0) : (conv.unreadTenant ?? 0)
        const isSelected = conv.id === selectedId

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50 ${
              isSelected ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              {otherParty.avatarUrl ? (
                <img src={otherParty.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-blue-700">
                  {otherParty.fullName?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium">{otherParty.fullName}</p>
                {conv.lastMessageAt && (
                  <span className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-gray-400">
                {conv.listing?.title ?? 'General'}
              </p>
              {conv.lastMessage && (
                <p className="mt-0.5 truncate text-xs text-gray-500">{conv.lastMessage}</p>
              )}
            </div>
            {unread > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
