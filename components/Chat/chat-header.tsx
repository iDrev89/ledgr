"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Phone, Video, MoreVertical, Circle } from "lucide-react"
import Image from "next/image"
import type { Chat } from "./types"

interface ChatHeaderProps {
  chat: Chat
  onBackToChats: () => void
  isMobile: boolean
}

export function ChatHeader({ chat, onBackToChats, isMobile }: ChatHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="p-4 border-b bg-card flex flex-wrap gap-3 items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onBackToChats} className="h-8 w-8 flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="relative flex-shrink-0">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <Image src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials(chat.name)}</AvatarFallback>
          </Avatar>
          {chat.isOnline && (
            <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500 border-2 border-background rounded-full" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold truncate">{chat.name}</h2>
            {chat.isOnline && <span className="text-xs text-green-600 font-medium flex-shrink-0">Online</span>}
          </div>
          <p className="text-sm text-muted-foreground truncate">{chat.role}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
