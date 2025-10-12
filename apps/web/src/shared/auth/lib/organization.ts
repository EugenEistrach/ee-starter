import type { QueryClient } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { redirect } from '@tanstack/react-router'
import { api } from '@workspace/backend/convex/_generated/api'

async function getFirstOrganization(queryClient: QueryClient) {
  const organizations = await queryClient.ensureQueryData(convexQuery(api.organizations.listAll, {}))

  if (!organizations.length) {
    return undefined
  }

  return organizations[0]
}

export async function redirectToFirstOrganization(queryClient: QueryClient) {
  const firstOrganization = await getFirstOrganization(queryClient)

  if (!firstOrganization) {
    throw redirect({ to: '/new-organization' })
  }

  throw redirect({ to: '/o/$organizationSlug', params: { organizationSlug: firstOrganization.slug } })
}
