import type { StaticImageData } from "next/image"

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string | StaticImageData
  content: string
  timestamp: Date
  status: "sent" | "delivered" | "read"
}

export interface Chat {
  id: string
  name: string
  avatar?: string | StaticImageData
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
  role?: string
}
