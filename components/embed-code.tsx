"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check } from "lucide-react"

type Theme = {
  primaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: string
  headerColor: string
}

type EmbedCodeProps = {
  botId: string
  theme: Theme
  botName: string
}

export default function EmbedCode({ botId, theme, botName }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false)
  const [embedType, setEmbedType] = useState("inline")

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://yourapp.com"

  const inlineEmbedCode = `<div id="chatbot-container"></div>
<script src="${baseUrl}/api/chatbot/${botId}/embed.js"></script>
<script>
  PyBotBuilder.init({
    containerId: 'chatbot-container',
    botId: '${botId}',
    theme: {
      primaryColor: '${theme.primaryColor}',
      backgroundColor: '${theme.backgroundColor}',
      textColor: '${theme.textColor}',
      fontFamily: '${theme.fontFamily}',
      borderRadius: '${theme.borderRadius}',
      headerColor: '${theme.headerColor}'
    },
    botName: '${botName}'
  });
</script>`

  const popupEmbedCode = `<script src="${baseUrl}/api/chatbot/${botId}/embed.js"></script>
<script>
  PyBotBuilder.init({
    botId: '${botId}',
    mode: 'popup',
    theme: {
      primaryColor: '${theme.primaryColor}',
      backgroundColor: '${theme.backgroundColor}',
      textColor: '${theme.textColor}',
      fontFamily: '${theme.fontFamily}',
      borderRadius: '${theme.borderRadius}',
      headerColor: '${theme.headerColor}'
    },
    botName: '${botName}'
  });
</script>`

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Embed Your Bot</h2>
        <p className="text-gray-500">Add your chatbot to any website by copying and pasting the code below.</p>
      </div>

      <Tabs value={embedType} onValueChange={setEmbedType}>
        <TabsList>
          <TabsTrigger value="inline">Inline Embed</TabsTrigger>
          <TabsTrigger value="popup">Popup Widget</TabsTrigger>
        </TabsList>

        <TabsContent value="inline" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inline Embed</CardTitle>
              <CardDescription>Embed your chatbot directly within a specific area of your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">{inlineEmbedCode}</pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(inlineEmbedCode)}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Preview</h4>
                <div className="border rounded-md p-4 h-80 bg-gray-50">
                  <div
                    className="w-full h-full rounded-md overflow-hidden border"
                    style={{
                      borderRadius: theme.borderRadius,
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    <div
                      className="p-3 flex items-center"
                      style={{
                        backgroundColor: theme.headerColor,
                        color: theme.textColor,
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
                      <div>
                        <div className="font-medium">{botName}</div>
                        <div className="text-xs opacity-70">Online</div>
                      </div>
                    </div>
                    <div
                      className="p-4 h-[calc(100%-64px)] overflow-y-auto"
                      style={{
                        backgroundColor: theme.backgroundColor,
                        color: theme.textColor,
                      }}
                    >
                      <div className="flex mb-4">
                        <div className="max-w-[80%] bg-gray-100 rounded-lg p-3 text-sm">
                          Hello! How can I help you today?
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popup" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Popup Widget</CardTitle>
              <CardDescription>Add a chat button that opens a popup chat window when clicked.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">{popupEmbedCode}</pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(popupEmbedCode)}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Preview</h4>
                <div className="border rounded-md p-4 h-80 bg-gray-50 relative">
                  <div className="absolute bottom-4 right-4">
                    <button
                      className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

