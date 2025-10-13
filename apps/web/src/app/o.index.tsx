import { createFileRoute, redirect } from '@tanstack/react-router'
import { redirectToFirstOrganization } from '@/shared/auth/lib/organization'

export const Route = createFileRoute('/o/')({
  beforeLoad: async ({ context, search }) => {
    if (!context.userId) {
      throw redirect({ to: '/login' })
    }

    if (search.redirectTo) {
      throw redirect({ to: decodeURIComponent(search.redirectTo), search: { redirectTo: undefined }, replace: true })
    }

    await redirectToFirstOrganization(context.queryClient)
  },
})
