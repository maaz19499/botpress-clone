"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Globe, Trash2, Upload, RefreshCw, Check, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type Source = {
  id: string
  name: string
  type: "file" | "website"
  status: "processing" | "ready" | "error"
  url?: string
  size?: string
  lastUpdated: string
}

export default function KnowledgeBase({ botId }: { botId: string }) {
  const [activeTab, setActiveTab] = useState("files")
  const [sources, setSources] = useState<Source[]>([
    {
      id: "1",
      name: "Company FAQ.pdf",
      type: "file",
      status: "ready",
      size: "2.4 MB",
      lastUpdated: "2 days ago",
    },
    {
      id: "2",
      name: "Product Documentation.docx",
      type: "file",
      status: "ready",
      size: "1.8 MB",
      lastUpdated: "1 week ago",
    },
    {
      id: "3",
      name: "https://example.com/blog",
      type: "website",
      status: "ready",
      url: "https://example.com/blog",
      lastUpdated: "3 days ago",
    },
  ])
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // Add the new files to sources
          const newSources: Source[] = Array.from(files).map((file, index) => ({
            id: Date.now().toString() + index,
            name: file.name,
            type: "file",
            status: "processing",
            size: formatFileSize(file.size),
            lastUpdated: "Just now",
          }))

          setSources((prev) => [...prev, ...newSources])

          // Simulate processing completion after 2 seconds
          setTimeout(() => {
            setSources((prev) =>
              prev.map((source) => (source.status === "processing" ? { ...source, status: "ready" } : source)),
            )
          }, 2000)

          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleAddWebsite = () => {
    if (!websiteUrl) return

    // Add the website to sources
    const newSource: Source = {
      id: Date.now().toString(),
      name: websiteUrl,
      type: "website",
      status: "processing",
      url: websiteUrl,
      lastUpdated: "Just now",
    }

    setSources((prev) => [...prev, newSource])
    setWebsiteUrl("")

    // Simulate processing completion after 2 seconds
    setTimeout(() => {
      setSources((prev) => prev.map((source) => (source.id === newSource.id ? { ...source, status: "ready" } : source)))
    }, 2000)
  }

  const handleDeleteSource = (id: string) => {
    setSources((prev) => prev.filter((source) => source.id !== id))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Knowledge Base</h2>
        <Button variant="outline" onClick={() => setSources([])}>
          Clear All
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="files">
            <FileText className="mr-2 h-4 w-4" /> Files
          </TabsTrigger>
          <TabsTrigger value="websites">
            <Globe className="mr-2 h-4 w-4" /> Websites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>Upload PDF, DOCX, TXT, or CSV files to build your bot's knowledge base.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-2">Drag and drop files here or click to browse</p>
                <Input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  multiple
                  accept=".pdf,.docx,.txt,.csv"
                  onChange={handleFileUpload}
                />
                <Button asChild>
                  <label htmlFor="file-upload">Select Files</label>
                </Button>
              </div>

              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Uploaded Files</h3>
            {sources.filter((source) => source.type === "file").length === 0 ? (
              <p className="text-sm text-gray-500">No files uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {sources
                  .filter((source) => source.type === "file")
                  .map((source) => (
                    <Card key={source.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium">{source.name}</p>
                              <p className="text-xs text-gray-500">
                                {source.size} • Last updated: {source.lastUpdated}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {source.status === "processing" ? (
                              <div className="flex items-center text-amber-500">
                                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                                <span className="text-xs">Processing</span>
                              </div>
                            ) : source.status === "ready" ? (
                              <div className="flex items-center text-green-500">
                                <Check className="h-4 w-4 mr-1" />
                                <span className="text-xs">Ready</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-500">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span className="text-xs">Error</span>
                              </div>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSource(source.id)}>
                              <Trash2 className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="websites" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Website</CardTitle>
              <CardDescription>Add website URLs to crawl and include in your bot's knowledge base.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
                <Button onClick={handleAddWebsite}>Add</Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Note: Only publicly accessible websites can be crawled.</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Added Websites</h3>
            {sources.filter((source) => source.type === "website").length === 0 ? (
              <p className="text-sm text-gray-500">No websites added yet.</p>
            ) : (
              <div className="space-y-3">
                {sources
                  .filter((source) => source.type === "website")
                  .map((source) => (
                    <Card key={source.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Globe className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">{source.name}</p>
                              <p className="text-xs text-gray-500">Last updated: {source.lastUpdated}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {source.status === "processing" ? (
                              <div className="flex items-center text-amber-500">
                                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                                <span className="text-xs">Processing</span>
                              </div>
                            ) : source.status === "ready" ? (
                              <div className="flex items-center text-green-500">
                                <Check className="h-4 w-4 mr-1" />
                                <span className="text-xs">Ready</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-500">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span className="text-xs">Error</span>
                              </div>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSource(source.id)}>
                              <Trash2 className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

