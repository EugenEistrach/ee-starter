import type { Id } from '@workspace/backend/convex/_generated/dataModel'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { api } from '@workspace/backend/convex/_generated/api'

export function useOrganization() {
  const { organizationSlug } = useParams({ from: '/o/$organizationSlug' })

  const { data: organization } = useSuspenseQuery(convexQuery(api.organizations.get, { slug: organizationSlug }))
  return {
    ...organization,
    id: organization.id as Id<'organization'>,
  }
}
