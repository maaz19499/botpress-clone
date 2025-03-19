import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Bot, ArrowRight } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

export default function DashboardPage() {
  const bots = [
    {
      id: 1,
      name: "Customer Support Bot",
      description: "Handles customer inquiries and support tickets",
      lastEdited: "2 days ago",
    },
    {
      id: 2,
      name: "Lead Generation Bot",
      description: "Qualifies leads and collects contact information",
      lastEdited: "1 week ago",
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Bots</h1>
        <Button asChild>
          <Link href="/dashboard/bots/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Bot
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <Card key={bot.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                {bot.name}
              </CardTitle>
              <CardDescription>Last edited: {bot.lastEdited}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{bot.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/bots/${bot.id}`}>Edit</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/dashboard/bots/${bot.id}/preview`}>
                  Preview <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-full py-10">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Create a new bot</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Start building your custom bot with our visual editor
            </p>
            <Button asChild>
              <Link href="/dashboard/bots/new">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

