"use client"
import { useState } from "react"
import type { Chat, Message } from "./types"
import user6 from "@/public/user6.png"
import user7 from "@/public/user7.png"
import user8 from "@/public/user8.png"
import user9 from "@/public/user9.png"
import user10 from "@/public/user10.png"
import user11 from "@/public/user11.png"

export function useChatData() {
  const [chats] = useState<Chat[]>([
    {
      id: "1",
      name: "Sarah Wilson",
      avatar: user6,
      lastMessage: "I'll check the shipment records for any issues with the delivery tracking system",
      lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
      unreadCount: 2,
      isOnline: true,
      role: "Fleet Manager",
    },
    {
      id: "2",
      name: "Mike Johnson",
      avatar: user7,
      lastMessage: "The delivery route has been optimized successfully and all vehicles are on schedule",
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
      unreadCount: 0,
      isOnline: false,
      role: "Route Coordinator",
    },
    {
      id: "3",
      name: "Operations Team",
      avatar: user8,
      lastMessage: "Team meeting scheduled for tomorrow at 10 AM to discuss quarterly performance",
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 1,
      isOnline: true,
      role: "Operations",
    },
    {
      id: "4",
      name: "Emma Davis",
      avatar: user9,
      lastMessage: "Please update the delivery status in the system for all pending shipments",
      lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      unreadCount: 0,
      isOnline: true,
      role: "Customer Support",
    },
    {
      id: "5",
      name: "Tom Brown",
      avatar: user10,
      lastMessage: "When should I start the next delivery route? Need confirmation for timing",
      lastMessageTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
      unreadCount: 0,
      isOnline: false,
      role: "Driver",
    },
    {
      id: "6",
      name: "Alex Chen",
      avatar: user11,
      lastMessage: "Vehicle maintenance has been completed and all trucks are ready for operation",
      lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unreadCount: 0,
      isOnline: false,
      role: "Maintenance",
    },
  ])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "sarah",
      senderName: "Sarah Wilson",
      senderAvatar: user6,
      content:
        "Hello! I need to discuss the shipment tracking issues we've been experiencing with our fleet management system.",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: "read",
    },
    {
      id: "2",
      senderId: "current",
      senderName: "You",
      content: "Hi Sarah! I'd be happy to help. What specific issues are you seeing with the tracking system?",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      status: "read",
    },
    {
      id: "3",
      senderId: "sarah",
      senderName: "Sarah Wilson",
      senderAvatar: user8,
      content:
        "We're getting intermittent GPS signals on several vehicles, but the delivery schedules show normal progress. There's also elevated fuel consumption across the fleet.",
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      status: "read",
    },
    {
      id: "4",
      senderId: "current",
      senderName: "You",
      content:
        "That's interesting. Have you checked for route deviations? Sometimes vehicles take alternate routes which can cause higher fuel usage while maintaining delivery times.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: "delivered",
    },
    {
      id: "5",
      senderId: "sarah",
      senderName: "Sarah Wilson",
      senderAvatar: user10,
      content:
        "Good point! I hadn't considered that. I'll run a comprehensive route analysis to check for any deviations from the planned routes.",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      status: "sent",
    },
    {
      id: "6",
      senderId: "sarah",
      senderName: "Sarah Wilson",
      senderAvatar: user11,
      content: "I'll also check the shipment records for any history of route optimization issues and driver feedback.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: "sent",
    },
  ])

  const addMessage = (newMessage: Omit<Message, "id" | "timestamp">) => {
    const message: Message = {
      ...newMessage,
      id: Date.now().toString(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, message])

    // Simulate delivery status update
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)
  }

  return {
    chats,
    messages,
    addMessage,
  }
}
