import type { QueryClient } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { redirect } from '@tanstack/react-router'
import { api } from '@workspace/backend/convex/_generated/api'

async function getFirstOrganization(queryClient: QueryClient) {
  const { user } = await queryClient.ensureQueryData(convexQuery(api.users.getCurrentUser, {}))

  if (!user?.organizations.length) {
    return undefined
  }

  return user.organizations[0]
}

export async function redirectToFirstOrganization(queryClient: QueryClient) {
  const firstOrganization = await getFirstOrganization(queryClient)

  if (!firstOrganization) {
    throw redirect({ to: '/new-organization' })
  }

  throw redirect({ to: '/o/$organizationSlug', params: { organizationSlug: firstOrganization.slug } })
}
