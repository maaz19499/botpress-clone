"use client"

import { useState, useCallback } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  addEdge,
  type Connection,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Plus, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Custom node components would be defined here
const StartNode = ({ data }: { data: any }) => (
  <Card className="w-48 bg-green-50 border-green-200">
    <CardHeader className="py-2 px-4">
      <CardTitle className="text-sm">Start</CardTitle>
    </CardHeader>
    <CardContent className="py-2 px-4">
      <p className="text-xs">{data.label}</p>
    </CardContent>
  </Card>
)

const MessageNode = ({ data }: { data: any }) => (
  <Card className="w-48 bg-blue-50 border-blue-200">
    <CardHeader className="py-2 px-4">
      <CardTitle className="text-sm">Message</CardTitle>
    </CardHeader>
    <CardContent className="py-2 px-4">
      <p className="text-xs">{data.label}</p>
    </CardContent>
  </Card>
)

const ConditionNode = ({ data }: { data: any }) => (
  <Card className="w-48 bg-yellow-50 border-yellow-200">
    <CardHeader className="py-2 px-4">
      <CardTitle className="text-sm">Condition</CardTitle>
    </CardHeader>
    <CardContent className="py-2 px-4">
      <p className="text-xs">{data.label}</p>
    </CardContent>
  </Card>
)

const AINode = ({ data }: { data: any }) => (
  <Card className="w-48 bg-purple-50 border-purple-200">
    <CardHeader className="py-2 px-4">
      <CardTitle className="text-sm">AI Response</CardTitle>
    </CardHeader>
    <CardContent className="py-2 px-4">
      <p className="text-xs">{data.label}</p>
    </CardContent>
  </Card>
)

// Node types mapping
const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  condition: ConditionNode,
  ai: AINode,
}

export default function WorkflowEditor({ botId }: { botId: string }) {
  // Initial nodes and edges
  const initialNodes: Node[] = [
    {
      id: "1",
      type: "start",
      position: { x: 250, y: 50 },
      data: { label: "Start Conversation" },
    },
    {
      id: "2",
      type: "message",
      position: { x: 250, y: 150 },
      data: { label: "Hello! How can I help you today?" },
    },
    {
      id: "3",
      type: "ai",
      position: { x: 250, y: 250 },
      data: { label: "Process user input with AI" },
    },
    {
      id: "4",
      type: "condition",
      position: { x: 250, y: 350 },
      data: { label: "Check user intent" },
    },
  ]

  const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
    { id: "e3-4", source: "3", target: "4" },
  ]

  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [])

  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])

  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge(connection, eds)), [])

  const addNode = (type: string) => {
    const newNode: Node = {
      id: (nodes.length + 1).toString(),
      type,
      position: { x: 250, y: (nodes.length + 1) * 100 },
      data: { label: `New ${type} node` },
    }
    setNodes([...nodes, newNode])
  }

  return (
    <div className="h-[600px] border rounded-lg">
      <div className="p-2 border-b flex justify-between items-center">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => addNode("message")}>
            <Plus className="h-3 w-3 mr-1" /> Message
          </Button>
          <Button size="sm" variant="outline" onClick={() => addNode("condition")}>
            <Plus className="h-3 w-3 mr-1" /> Condition
          </Button>
          <Button size="sm" variant="outline" onClick={() => addNode("ai")}>
            <Plus className="h-3 w-3 mr-1" /> AI Response
          </Button>
        </div>
        <Button size="sm">
          <Save className="h-3 w-3 mr-1" /> Save Flow
        </Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

