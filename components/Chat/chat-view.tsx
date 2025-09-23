"use client"

import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { Search } from "lucide-react"
import type { Chat, Message } from "./types"

interface ChatViewProps {
  activeChat: string
  chats: Chat[]
  messages: Message[]
  onAddMessage: (message: Omit<Message, "id" | "timestamp">) => void
  onBackToChats: () => void
  showChatList: boolean
  isMobile: boolean
}

export function ChatView({
  activeChat,
  chats,
  messages,
  onAddMessage,
  onBackToChats,
  showChatList,
  isMobile,
}: ChatViewProps) {
  const selectedChat = chats.find((chat) => chat.id === activeChat)

  return (
    <div
      className={`
        ${isMobile ? "w-full" : "flex-1"} 
        flex flex-col min-w-0
        ${isMobile ? (showChatList ? "hidden" : "block") : ""}
      `}
    >
      {selectedChat ? (
        <>
          <ChatHeader chat={selectedChat} onBackToChats={onBackToChats} isMobile={isMobile} />
          <MessageList messages={messages} />
          <MessageInput onSendMessage={onAddMessage} />
        </>
      ) : (
        !isMobile && (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a chat to start messaging</p>
            </div>
          </div>
        )
      )}
    </div>
  )
}
