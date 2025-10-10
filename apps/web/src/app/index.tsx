import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Github } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            ee-starter
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Full-stack TypeScript starter with opinionated architecture and comprehensive guardrails
          </p>

          {/* CTAs */}
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link to="/dashboard">
                View Demo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href="https://github.com/EugenEistrach/ee-starter"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 max-w-4xl w-full">
          <Card>
            <CardHeader>
              <CardTitle>TanStack Suite</CardTitle>
              <CardDescription>
                File-based routing, type-safe queries, and powerful forms
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Router, Query, and Form with unified devtools for seamless development experience
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Convex Backend</CardTitle>
              <CardDescription>
                Real-time database with type-safe operations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              End-to-end type safety with queries, mutations, and real-time subscriptions
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layered Architecture</CardTitle>
              <CardDescription>
                Enforced separation of concerns
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              ESLint boundaries plugin and custom architectural rules keep your codebase clean
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>LLM Friendly</CardTitle>
              <CardDescription>
                Built for AI-assisted development
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Claude.md files and automated guardrails to keep AI assistance on track
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
