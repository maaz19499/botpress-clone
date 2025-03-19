import { NextResponse } from "next/server"

// This would connect to your database in a real application
const bots = [
  {
    id: "1",
    name: "Customer Support Bot",
    description: "Handles customer inquiries and support tickets",
    lastEdited: "2 days ago",
    system_prompt:
      "You are a helpful customer support assistant. Answer questions based on the knowledge base provided.",
  },
  {
    id: "2",
    name: "Lead Generation Bot",
    description: "Qualifies leads and collects contact information",
    lastEdited: "1 week ago",
    system_prompt:
      "You are a lead generation assistant. Help qualify potential customers and collect their information.",
  },
]

export async function GET() {
  return NextResponse.json(bots)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: "Bot name is required" }, { status: 400 })
    }

    // Create a new bot (in a real app, this would save to a database)
    const newBot = {
      id: (bots.length + 1).toString(),
      name: body.name,
      description: body.description || "",
      system_prompt:
        body.systemPrompt || "You are a helpful assistant that answers questions based on the provided knowledge base.",
      lastEdited: "Just now",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    bots.push(newBot)

    return NextResponse.json(newBot, { status: 201 })
  } catch (error) {
    console.error("Error creating bot:", error)
    return NextResponse.json({ error: "Failed to create bot" }, { status: 500 })
  }
}

