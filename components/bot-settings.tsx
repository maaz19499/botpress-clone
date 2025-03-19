"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Palette, MessageSquare, Image } from "lucide-react"

type Theme = {
  primaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: string
  headerColor: string
}

type BotSettingsProps = {
  botId: string
  theme: Theme
  setTheme: (theme: Theme) => void
  botName: string
  setBotName: (name: string) => void
}

export default function BotSettings({ botId, theme, setTheme, botName, setBotName }: BotSettingsProps) {
  const [description, setDescription] = useState("Providing professional assistance and comprehensive solutions.")
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=80&width=80")
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?")
  const [placeholderText, setPlaceholderText] = useState("Type your message here...")

  const handleThemeChange = (key: keyof Theme, value: string) => {
    setTheme({
      ...theme,
      [key]: value,
    })
  }

  const predefinedThemes = [
    {
      name: "Light",
      theme: {
        primaryColor: "#0ea5e9",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        fontFamily: "Inter, sans-serif",
        borderRadius: "8px",
        headerColor: "#f8fafc",
      },
    },
    {
      name: "Dark",
      theme: {
        primaryColor: "#3b82f6",
        backgroundColor: "#1e293b",
        textColor: "#ffffff",
        fontFamily: "Inter, sans-serif",
        borderRadius: "8px",
        headerColor: "#0f172a",
      },
    },
    {
      name: "Minimal",
      theme: {
        primaryColor: "#64748b",
        backgroundColor: "#f8fafc",
        textColor: "#334155",
        fontFamily: "Inter, sans-serif",
        borderRadius: "4px",
        headerColor: "#f1f5f9",
      },
    },
    {
      name: "Vibrant",
      theme: {
        primaryColor: "#8b5cf6",
        backgroundColor: "#ffffff",
        textColor: "#1e293b",
        fontFamily: "Inter, sans-serif",
        borderRadius: "12px",
        headerColor: "#f3e8ff",
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Bot className="mr-2 h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="mr-2 h-4 w-4" /> Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot Information</CardTitle>
              <CardDescription>Configure your bot's basic information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bot-name">Bot Name</Label>
                <Input id="bot-name" value={botName} onChange={(e) => setBotName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bot-description">Description</Label>
                <Textarea
                  id="bot-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">This description will be displayed in the chat header.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bot-avatar">Bot Avatar</Label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden border">
                    <img
                      src={avatarUrl || "/placeholder.svg"}
                      alt="Bot avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Image className="mr-2 h-4 w-4" /> Upload Image
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize your bot's appearance.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {predefinedThemes.map((predefinedTheme) => (
                  <Button
                    key={predefinedTheme.name}
                    variant="outline"
                    className="h-auto p-4 justify-start flex-col items-start"
                    onClick={() => setTheme(predefinedTheme.theme)}
                  >
                    <div
                      className="w-full h-12 rounded mb-2"
                      style={{ backgroundColor: predefinedTheme.theme.primaryColor }}
                    />
                    <span>{predefinedTheme.name}</span>
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex">
                      <Input
                        id="primary-color"
                        value={theme.primaryColor}
                        onChange={(e) => handleThemeChange("primaryColor", e.target.value)}
                      />
                      <div className="w-10 h-10 border rounded ml-2" style={{ backgroundColor: theme.primaryColor }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex">
                      <Input
                        id="background-color"
                        value={theme.backgroundColor}
                        onChange={(e) => handleThemeChange("backgroundColor", e.target.value)}
                      />
                      <div
                        className="w-10 h-10 border rounded ml-2"
                        style={{ backgroundColor: theme.backgroundColor }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex">
                      <Input
                        id="text-color"
                        value={theme.textColor}
                        onChange={(e) => handleThemeChange("textColor", e.target.value)}
                      />
                      <div className="w-10 h-10 border rounded ml-2" style={{ backgroundColor: theme.textColor }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="header-color">Header Color</Label>
                    <div className="flex">
                      <Input
                        id="header-color"
                        value={theme.headerColor}
                        onChange={(e) => handleThemeChange("headerColor", e.target.value)}
                      />
                      <div className="w-10 h-10 border rounded ml-2" style={{ backgroundColor: theme.headerColor }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="border-radius">Border Radius</Label>
                  <Input
                    id="border-radius"
                    value={theme.borderRadius}
                    onChange={(e) => handleThemeChange("borderRadius", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <select
                    id="font-family"
                    className="w-full p-2 border rounded"
                    value={theme.fontFamily}
                    onChange={(e) => handleThemeChange("fontFamily", e.target.value)}
                  >
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Poppins, sans-serif">Poppins</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="'Segoe UI', sans-serif">Segoe UI</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Settings</CardTitle>
              <CardDescription>Configure your bot's messages and interactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Textarea
                  id="welcome-message"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  This message will be displayed when a user first opens the chat.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeholder-text">Input Placeholder</Label>
                <Input
                  id="placeholder-text"
                  value={placeholderText}
                  onChange={(e) => setPlaceholderText(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  This text will be shown in the chat input field when it's empty.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  )
}

