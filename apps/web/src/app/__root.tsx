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
  Scripts,
  useRouteContext,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, getRequest } from '@tanstack/react-start/server'
import { createAuth } from '@workspace/backend/convex/shared/auth'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Toaster } from '@workspace/ui/components/sonner'
import { useEffect } from 'react'
import { authClient } from '@/shared/auth/lib/auth-client'
import Header from '@/shared/ui/components/header'
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
  beforeLoad: async (ctx) => {
    try {
      const { userId, token } = await fetchAuth()
      if (token) {
        ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
      }
      return { userId, token }
    }
    catch (error) {
      console.error('Failed to fetch auth session:', error)
      throw parseAuthError(error)
    }
  },

  errorComponent: ({ error }) => {
    const isBackendDown = error.message.includes('connection refused') || error.message.includes('ECONNREFUSED')

    return (
      <>
        <link rel="stylesheet" href={appCss} />
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
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.location.reload()
                }}
                className="w-full"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  },

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
    <ProgressProvider>
      <ConvexBetterAuthProvider
        client={context.convexClient}
        authClient={authClient}
      >
        <html lang="en" className="dark">
          <head>
            <HeadContent />
          </head>
          <body>
            <RouterProgressSync />
            <div className="grid h-svh grid-rows-[auto_1fr]">
              <Header />
              <Outlet />
            </div>
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
              ]}
            />
            <Scripts />
          </body>
        </html>
      </ConvexBetterAuthProvider>
    </ProgressProvider>
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
