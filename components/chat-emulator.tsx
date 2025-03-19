"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, RefreshCw } from "lucide-react"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

type Theme = {
  primaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: string
  headerColor: string
}

type ChatEmulatorProps = {
  botId: string
  theme?: Theme
  botName?: string
  systemPrompt?: string
}

export default function ChatEmulator({
  botId,
  theme = {
    primaryColor: "#0ea5e9",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontFamily: "Inter, sans-serif",
    borderRadius: "8px",
    headerColor: "#f8fafc",
  },
  botName = "AI Assistant",
  systemPrompt = "You are a helpful assistant.",
}: ChatEmulatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // In a real implementation, this would call your API
      // For now, we'll simulate a response
      const response = await simulateBotResponse(input, systemPrompt)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error getting bot response:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error while processing your request.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // This function simulates a bot response
  // In a real implementation, this would call your API
  const simulateBotResponse = async (message: string, systemPrompt: string): Promise<string> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple response logic based on keywords
    if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      return "Hello! How can I assist you today?"
    } else if (message.toLowerCase().includes("help")) {
      return "I'm here to help! You can ask me questions about our products, services, or anything else you need assistance with."
    } else if (message.toLowerCase().includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?"
    } else if (message.toLowerCase().includes("bye")) {
      return "Goodbye! Have a great day!"
    } else {
      return "I understand you're asking about that. In a real implementation, I would use the knowledge base and LangChain to provide a relevant answer. Is there anything specific you'd like to know?"
    }
  }

  return (
    <div
      className="flex flex-col h-[500px] border rounded-lg overflow-hidden"
      style={{
        fontFamily: theme.fontFamily,
        borderRadius: theme.borderRadius,
        color: theme.textColor,
        backgroundColor: theme.backgroundColor,
      }}
    >
      <div className="p-3 border-b flex items-center" style={{ backgroundColor: theme.headerColor }}>
        <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
        <div>
          <h3 className="text-sm font-medium">{botName}</h3>
          <p className="text-xs opacity-70">Online</p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4" style={{ backgroundColor: theme.backgroundColor }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user" ? "text-white" : "bg-gray-100 text-gray-800"
              }`}
              style={{
                backgroundColor: message.sender === "user" ? theme.primaryColor : "#f1f5f9",
                borderRadius: `calc(${theme.borderRadius} - 2px)`,
              }}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className="max-w-[80%] rounded-lg p-3 bg-gray-100"
              style={{
                borderRadius: `calc(${theme.borderRadius} - 2px)`,
              }}
            >
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin text-gray-500" />
                <p className="text-sm text-gray-500">Thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t" style={{ backgroundColor: theme.backgroundColor }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            style={{
              borderColor: theme.primaryColor + "40",
              borderRadius: `calc(${theme.borderRadius} - 2px)`,
            }}
          />
          <Button
            type="submit"
            size="icon"
            style={{
              backgroundColor: theme.primaryColor,
              borderRadius: `calc(${theme.borderRadius} - 2px)`,
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

