import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/shared/auth/lib/auth-client'

export const Route = createFileRoute('/recover')({
  ssr: false,
  beforeLoad: async () => {
    const token = await authClient.convex.token()
    if (token) {
      throw redirect({ to: '/o' })
    }
  },
})
