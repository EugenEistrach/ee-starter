import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { api } from '@workspace/backend/convex/_generated/api'
import { ensure } from '@workspace/utils'

export function useOrganization() {
  const { organizationSlug } = useParams({ from: '/o/$organizationSlug' })
  const { data: { user } } = useSuspenseQuery(convexQuery(api.users.getCurrentUser, {}))

  const organization = user?.organizations.find(organization => organization.slug === organizationSlug)

  ensure(organization !== undefined, 'Organization not found')

  return organization
}
