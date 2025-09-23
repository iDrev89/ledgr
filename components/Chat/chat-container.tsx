"use client"

import { useState, useEffect } from "react"
import { ChatList } from "./chat-list"
import { ChatView } from "./chat-view"
import { useChatData } from "./use-chat-data"

export function ChatContainer() {
  const [activeChat, setActiveChat] = useState<string>("1")
  const [showChatList, setShowChatList] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { chats, messages, addMessage } = useChatData()

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1200
      setIsMobile(mobile)
      if (!mobile) {
        setShowChatList(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId)
    if (isMobile) {
      setShowChatList(false)
    }
  }

  const handleBackToChats = () => {
    if (isMobile) {
      setShowChatList(true)
    }
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <ChatList
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        showChatList={showChatList}
        isMobile={isMobile}
      />
      <ChatView
        activeChat={activeChat}
        chats={chats}
        messages={messages}
        onAddMessage={addMessage}
        onBackToChats={handleBackToChats}
        showChatList={showChatList}
        isMobile={isMobile}
      />
    </div>
  )
}
