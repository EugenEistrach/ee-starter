import { convexClient } from '@convex-dev/better-auth/client/plugins'
import { ac, roles } from '@workspace/backend/shared/auth/permissions'
import { anonymousClient, magicLinkClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  plugins: [
    anonymousClient(),
    convexClient(),
    magicLinkClient(),
    organizationClient(
      {
        ac,
        roles,
      },
    ),
  ],

})
