"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Smile, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Message } from "./types"

interface MessageInputProps {
  onSendMessage: (message: Omit<Message, "id" | "timestamp">) => void
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const handleSendMessage = () => {
    if (!message.trim()) return

    onSendMessage({
      senderId: "current",
      senderName: "You",
      content: message.trim(),
      status: "sent",
    })

    setMessage("")

    toast({
      title: "Message sent",
      description: "Your message has been delivered.",
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="p-4 border-t bg-card flex-shrink-0">
      <div className="flex items-end gap-2 max-w-4xl mx-auto w-full">
        <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative min-w-0">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
          />
          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8">
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={handleSendMessage} disabled={!message.trim()} className="h-10 w-10 p-0 flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
