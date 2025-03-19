import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bot, Home, Users, Settings, LogOut } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50 hidden md:block">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-bold">PyBotBuilder</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/bots" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200">
              <Bot className="h-4 w-4" />
              <span>My Bots</span>
            </Link>
            <Link href="/dashboard/users" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200">
              <Users className="h-4 w-4" />
              <span>Team</span>
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/logout">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log out</span>
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="container mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}

