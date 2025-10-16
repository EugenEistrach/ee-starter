import type { ConvexQueryClient } from '@convex-dev/react-query'

import type { QueryClient } from '@tanstack/react-query'
import type { ConvexReactClient } from 'convex/react'
import { ProgressProvider, useProgress } from '@bprogress/react'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import {
  fetchSession,
  getCookieName,
} from '@convex-dev/better-auth/react-start'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { FormDevtoolsPlugin } from '@tanstack/react-form-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  redirect,
  retainSearchParams,
  Scripts,
  useLocation,
  useRouteContext,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, getRequest } from '@tanstack/react-start/server'
import { createAuth } from '@workspace/backend/shared/auth/auth'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Toaster } from '@workspace/ui/components/sonner'
import { ThemeProvider } from '@workspace/ui/components/theme-provider'
import { useEffect } from 'react'
import z from 'zod'
import { EmailPanel } from '@/features/dev-tools/views/email-panel'
import { authClient } from '@/shared/auth/lib/auth-client'
import appCss from '../index.css?url'

const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { session } = await fetchSession(getRequest())

  const sessionCookieName = getCookieName(createAuth)
  const token = getCookie(sessionCookieName)

  return {
    userId: session?.user.id,
    token,
  }
})

interface RouterAppContext {
  queryClient: QueryClient
  convexClient: ConvexReactClient
  convexQueryClient: ConvexQueryClient
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  validateSearch: z.object({
    redirectTo: z.string().optional(),
  }),
  search: {
    middlewares: [
      retainSearchParams(['redirectTo']),
    ],
  },
  notFoundComponent: () => {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <Card className="max-w-2xl w-full border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Page Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  },
  beforeLoad: async (ctx) => {
    try {
      const { userId, token } = await fetchAuth()
      if (token) {
        // Ensure SSR and CSR both have the Convex identity set before any queries run
        ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
      }

      if (userId && !token && ctx.location.pathname !== '/recover') {
        throw redirect({ to: '/recover' })
      }

      return { userId, token }
    }
    catch (error) {
      throw parseAuthError(error)
    }
  },
  errorComponent: ErrorComponent,

  component: RootDocument,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'EE Starter',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
})

function RootDocument() {
  const context = useRouteContext({ from: Route.id })
  return (

    <ConvexBetterAuthProvider
      client={context.convexClient}
      authClient={authClient}
    >

      <html lang="en" suppressHydrationWarning>

        <head>
          <HeadContent />
        </head>

        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ProgressProvider>
              <RouterProgressSync />

              <Outlet />
              <Toaster richColors />
              <TanStackDevtools
                plugins={[
                  {
                    name: 'TanStack Query',
                    render: <ReactQueryDevtoolsPanel />,
                  },
                  {
                    name: 'TanStack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                  FormDevtoolsPlugin(),
                  ...(import.meta.env.DEV
                    ? [
                        {
                          name: 'Emails',
                          render: <EmailPanel />,
                        },
                      ]
                    : []),
                ]}
              />

            </ProgressProvider>
          </ThemeProvider>
          <Scripts />
        </body>

      </html>

    </ConvexBetterAuthProvider>

  )
}

function RouterProgressSync() {
  const { start, stop } = useProgress()
  const isLoading = useRouterState({ select: s => s.isLoading })

  useEffect(() => {
    if (isLoading) {
      start()
    }
    else {
      stop()
    }
  }, [isLoading, start, stop])

  return null
}

function parseAuthError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return error as Error
  }

  const errorStr = error.message + (error.cause?.toString() || '')

  if (errorStr.includes('ECONNREFUSED')) {
    return new Error('Backend connection refused. Is Convex running?')
  }

  if (errorStr.includes('fetch failed')) {
    return new Error(`Auth service unreachable: ${error.message}`)
  }

  return error
}

function ErrorComponent({ error }: { error: Error }) {
  const isBackendDown = error.message.includes('connection refused') || error.message.includes('ECONNREFUSED')
  const location = useLocation()
  const path = location.pathname

  return (
    <>
      <link rel="stylesheet" href={appCss} />
      {/* eslint-disable-next-line react-dom/no-dangerously-set-innerhtml */}
      <script dangerouslySetInnerHTML={{ __html: `
        const timeOut = setTimeout(() => {
          window.location.reload()
        }, 1000)
      ` }}
      />
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <Card className="max-w-2xl w-full border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              {isBackendDown ? 'Backend Not Running' : 'Application Error'}
            </CardTitle>
            <CardDescription className="font-mono text-sm">{error.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isBackendDown && (
              <div className="bg-muted p-3 rounded text-sm">
                <p className="font-medium mb-1">Start the backend:</p>
                <code>bun run dev:server</code>
              </div>
            )}
            <Button
              className="w-full"
              asChild
            >
              <a href={path}>Retry</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
