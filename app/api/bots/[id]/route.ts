import { NextResponse } from "next/server"

// This would connect to your database in a real application
const bots = [
  {
    id: "1",
    name: "Customer Support Bot",
    description: "Handles customer inquiries and support tickets",
    lastEdited: "2 days ago",
  },
  {
    id: "2",
    name: "Lead Generation Bot",
    description: "Qualifies leads and collects contact information",
    lastEdited: "1 week ago",
  },
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const bot = bots.find((b) => b.id === params.id)

  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 })
  }

  return NextResponse.json(bot)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const botIndex = bots.findIndex((b) => b.id === params.id)

    if (botIndex === -1) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    // Update bot (in a real app, this would update a database record)
    const updatedBot = {
      ...bots[botIndex],
      name: body.name || bots[botIndex].name,
      description: body.description || bots[botIndex].description,
      lastEdited: "Just now",
    }

    bots[botIndex] = updatedBot

    return NextResponse.json(updatedBot)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update bot" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const botIndex = bots.findIndex((b) => b.id === params.id)

  if (botIndex === -1) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 })
  }

  // Delete bot (in a real app, this would delete from a database)
  bots.splice(botIndex, 1)

  return new NextResponse(null, { status: 204 })
}

