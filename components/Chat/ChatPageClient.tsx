"use client"
import type { StaticImageData } from "next/image"
import { ChatContainer } from "./chat-container"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string | StaticImageData
  content: string
  timestamp: Date
  status: "sent" | "delivered" | "read"
}

interface Chat {
  id: string
  name: string
  avatar?: string | StaticImageData
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
  role?: string
}

export default function ChatPageClient() {
  return <ChatContainer />
}
