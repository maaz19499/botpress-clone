import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Workflow, MessageSquare, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <span className="text-xl font-bold">PyBotBuilder</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Platform
            </Link>
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Docs
            </Link>
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary">
              Log in
            </Link>
            <Button>Sign up</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl">The Complete AI Bot Platform</h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl text-gray-300">
            PyBotBuilder is an all-in-one platform for building AI-powered bots with Python and modern LLMs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Get started for free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
              <Link href="/docs">Learn more</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Flow Builder</h3>
              <p className="text-gray-600">
                Create complex conversation flows with our intuitive drag-and-drop interface.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Responses</h3>
              <p className="text-gray-600">Leverage the latest LLMs to create natural and contextual bot responses.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Python Extensibility</h3>
              <p className="text-gray-600">Extend your bot's capabilities with custom Python code and integrations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">PyBotBuilder</span>
            </div>
            <div className="text-sm text-gray-500">© {new Date().getFullYear()} PyBotBuilder. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

