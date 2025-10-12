import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '@workspace/backend/convex/_generated/api'
import { ensure } from '@workspace/utils'

function useCurrentUseOrNull() {
  const { data: { user } } = useSuspenseQuery(convexQuery(api.users.getCurrentUser, {}))

  return user
}

export function useCurrentUser() {
  const user = useCurrentUseOrNull()
  ensure(!!user, 'User not found')
  return user
}
