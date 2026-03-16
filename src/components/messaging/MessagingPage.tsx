'use client'

import { useState, useCallback } from 'react'
import { useConversations } from '@/hooks/useConversations'
import { useMessages } from '@/hooks/useMessages'
import ConversationList from './ConversationList'
import MessageThread from './MessageThread'
import MessageInput from './MessageInput'
import { MessageSquare, ArrowLeft } from 'lucide-react'

interface Props {
  currentUserId: string
}

export default function MessagingPage({ currentUserId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: convData, isLoading: loadingConvs } = useConversations()
  const { data: msgData, isLoading: loadingMsgs } = useMessages(selectedId ?? '')

  const conversations = convData?.conversations ?? []
  const messages = msgData?.messages ?? []

  // When a conversation is selected, mark it as read
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    // Trigger the mark-as-read endpoint
    fetch(`/api/messages/${id}`).catch(() => {})
  }, [])

  const handleSend = useCallback(async (content: string) => {
    if (!selectedId) return
    await fetch(`/api/messages/${selectedId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
  }, [selectedId])

  const selectedConv = conversations.find((c) => c.id === selectedId)

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-white overflow-hidden">
      {/* Conversation list — hidden on mobile when a conversation is selected */}
      <div
        className={`w-full border-r sm:w-80 sm:flex-shrink-0 ${
          selectedId ? 'hidden sm:block' : 'block'
        }`}
      >
        <div className="border-b p-3">
          <h2 className="font-semibold text-sm">Conversations</h2>
        </div>
        {loadingConvs ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelect}
            currentUserId={currentUserId}
          />
        )}
      </div>

      {/* Message thread */}
      <div
        className={`flex flex-1 flex-col ${
          selectedId ? 'block' : 'hidden sm:flex'
        }`}
      >
        {selectedId && selectedConv ? (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <button
                onClick={() => setSelectedId(null)}
                className="sm:hidden rounded-lg p-1 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {selectedConv.landlordId === currentUserId
                    ? selectedConv.tenant.fullName
                    : selectedConv.landlord.fullName}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {selectedConv.listing?.title ?? 'General'}
                </p>
              </div>
            </div>

            {loadingMsgs ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : (
              <MessageThread messages={messages} currentUserId={currentUserId} />
            )}

            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <MessageSquare className="h-12 w-12 text-gray-200" />
            <p className="text-sm text-gray-400">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
