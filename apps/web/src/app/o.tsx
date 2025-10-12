import { createFileRoute, redirect } from '@tanstack/react-router'
import { redirectToFirstOrganization } from '@/shared/auth/lib/organization'

export const Route = createFileRoute('/o')({
  beforeLoad: async ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: '/login' })
    }
    throw redirectToFirstOrganization(context.queryClient)
  },
})
