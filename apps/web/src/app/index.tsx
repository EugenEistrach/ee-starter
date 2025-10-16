import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Check, Copy, Github } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

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
            Claude Code optimized full-stack starter with exceptional developer experience
          </p>

          {/* Install Command Generator */}
          <InstallCommandInput />

          {/* CTAs */}
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link to="/o">
                View Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
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
              <CardTitle>Developer Experience</CardTitle>
              <CardDescription>
                Built for productivity and clarity
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Custom devtools panels & inspectors, comprehensive documentation, clean patterns
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>LLM Optimized</CardTitle>
              <CardDescription>
                Built for AI-assisted development
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Claude Code: agents, slash commands, hooks. CLAUDE.md files for context. Automated guardrails.
            </CardContent>
          </Card>
        </div>

        {/* Production Features */}
        <div className="mt-20 max-w-4xl w-full">
          <h2 className="text-2xl font-bold text-center mb-8">Production Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Included
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <div className="font-medium">Email System</div>
                  <div className="text-muted-foreground">
                    Template-based emails, local/Resend switching, devtools integration, full audit trail
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-muted-foreground">Coming Soon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <div>• User onboarding flows</div>
                <div>• Organization management</div>
                <div>• Admin UIs</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function InstallCommandInput() {
  const [projectName, setProjectName] = useState('')
  const [copied, setCopied] = useState(false)

  const command = `bunx giget@latest gh:eugeneistrach/ee-starter ${projectName || 'my-app-name'} --install`

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      copyCommand()
    }
  }

  return (
    <div className="flex flex-col gap-3 max-w-xl mx-auto pt-4">
      <div className="flex gap-2">
        <Input
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="my-app-name"
          className="flex-1"
        />
        <Button
          onClick={copyCommand}
          variant="outline"
          size="icon"
          title={copied ? 'Copied!' : 'Copy command'}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <code className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded">
        {command}
      </code>
    </div>
  )
}
