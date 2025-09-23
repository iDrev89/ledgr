"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Circle } from "lucide-react"
import Image from "next/image"
import type { Chat } from "./types"

interface ChatListProps {
  chats: Chat[]
  activeChat: string
  onChatSelect: (chatId: string) => void
  showChatList: boolean
  isMobile: boolean
}

export function ChatList({ chats, activeChat, onChatSelect, showChatList, isMobile }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatChatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays}d`
    return date.toLocaleDateString()
  }

  return (
    <div
      className={`
        ${isMobile ? "w-full" : "w-96"} 
        border-r bg-card flex flex-col
        ${isMobile ? (showChatList ? "block" : "hidden") : "flex-shrink-0"}
      `}
      style={!isMobile ? { width: "384px", minWidth: "384px", maxWidth: "384px" } : {}}
    >
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`
                flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors
                ${activeChat === chat.id ? "bg-accent" : ""}
              `}
            >
              <div className="relative flex-shrink-0 mt-1">
                <Avatar className="h-12 w-12">
                  <Image src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(chat.name)}
                  </AvatarFallback>
                </Avatar>
                {chat.isOnline && (
                  <Circle className="absolute -bottom-1 -right-1 h-4 w-4 fill-green-500 text-green-500 border-2 border-background rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-sm leading-tight">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2 mt-0.5">
                    {formatChatTime(chat.lastMessageTime)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-1">{chat.lastMessage}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{chat.role}</p>
                  {chat.unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 w-5 p-0 flex items-center justify-center text-xs flex-shrink-0"
                    >
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
