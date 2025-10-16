import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/o/$organizationSlug/')({
  beforeLoad: async ({ params }) => {
    throw redirect({ to: '/o/$organizationSlug/todos', params })
  },
})
