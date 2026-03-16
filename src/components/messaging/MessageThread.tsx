'use client'

import { useEffect, useRef } from 'react'
import type { MessageData } from '@/hooks/useMessages'

interface Props {
  messages: MessageData[]
  currentUserId: string
}

export default function MessageThread({ messages, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => {
        const isMe = msg.senderId === currentUserId
        return (
          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
              {!isMe && (
                <p className="mb-0.5 text-[10px] font-medium text-gray-400">
                  {msg.sender.fullName}
                </p>
              )}
              <div
                className={`rounded-2xl px-3.5 py-2 text-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
              {msg.createdAt && (
                <p className={`mt-0.5 text-[10px] text-gray-400 ${isMe ? 'text-right' : ''}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-NG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
