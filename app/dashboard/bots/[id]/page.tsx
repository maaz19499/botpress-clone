"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Play, Code, MessageSquare, Settings, Database, Globe } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import WorkflowEditor from "@/components/workflow-editor"
import ChatEmulator from "@/components/chat-emulator"
import KnowledgeBase from "@/components/knowledge-base"
import BotSettings from "@/components/bot-settings"
import EmbedCode from "@/components/embed-code"

export default function BotEditorPage({ params }: { params: { id: string } }) {
  const [botName, setBotName] = useState("Customer Support Bot")
  const [activeTab, setActiveTab] = useState("workflow")
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant that answers questions based on the provided knowledge base. If you don't know the answer, say so instead of making up information.",
  )
  const [theme, setTheme] = useState({
    primaryColor: "#0ea5e9",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontFamily: "Inter, sans-serif",
    borderRadius: "8px",
    headerColor: "#f8fafc",
  })

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{botName}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/dashboard/bots/${params.id}/preview`} target="_blank" rel="noreferrer">
              <Play className="mr-2 h-4 w-4" /> Test
            </a>
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="workflow">
            <Code className="mr-2 h-4 w-4" /> Workflow
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <Database className="mr-2 h-4 w-4" /> Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="mr-2 h-4 w-4" /> Messages
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </TabsTrigger>
          <TabsTrigger value="embed">
            <Globe className="mr-2 h-4 w-4" /> Embed
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Play className="mr-2 h-4 w-4" /> Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="border rounded-lg p-4 min-h-[600px]">
          <WorkflowEditor botId={params.id} systemPrompt={systemPrompt} />
        </TabsContent>

        <TabsContent value="knowledge" className="border rounded-lg p-4 min-h-[600px]">
          <KnowledgeBase botId={params.id} />
        </TabsContent>

        <TabsContent value="messages" className="border rounded-lg p-4 min-h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">System Prompt</h3>
              <p className="text-sm text-gray-500">Define how your bot should behave and respond to user queries.</p>
              <textarea
                className="w-full h-40 p-3 border rounded-md"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant..."
              />
              <Button>Save System Prompt</Button>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Default Responses</h3>
              <p className="text-sm text-gray-500">
                Configure fallback responses for when your bot doesn't understand a user's input.
              </p>
              {/* Default responses would go here */}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="border rounded-lg p-4 min-h-[600px]">
          <BotSettings botId={params.id} theme={theme} setTheme={setTheme} botName={botName} setBotName={setBotName} />
        </TabsContent>

        <TabsContent value="embed" className="border rounded-lg p-4 min-h-[600px]">
          <EmbedCode botId={params.id} theme={theme} botName={botName} />
        </TabsContent>

        <TabsContent value="preview" className="border rounded-lg p-4 min-h-[600px]">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-md">
              <ChatEmulator botId={params.id} theme={theme} botName={botName} systemPrompt={systemPrompt} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

