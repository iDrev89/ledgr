"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, CheckCheck } from "lucide-react"
import Image from "next/image"
import type { Message } from "./types"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
    }
  }

  return (
    <div className="flex gap-3">
      {message.senderId !== "current" && (
        <Avatar className="h-6 sm:h-8 w-6 sm:w-8 mt-1 flex-shrink-0">
          <Image src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(message.senderName)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex-1 min-w-0 ${message.senderId === "current" ? "ml-12" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{message.senderName}</span>
          <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
        </div>

        <div
          className={`inline-block sm:max-w-[85%] p-3 rounded-lg break-words ${
            message.senderId === "current" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.senderId === "current" && (
          <div className="flex items-center justify-end gap-1 mt-1">{getStatusIcon(message.status)}</div>
        )}
      </div>

      {message.senderId === "current" && <div className="w-8 flex-shrink-0" />}
    </div>
  )
}
