import { convexClient } from '@convex-dev/better-auth/client/plugins'
import { ac, admin, member, owner } from '@workspace/backend/shared/auth/permissions'
import { magicLinkClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    magicLinkClient(),
    organizationClient(
      {
        ac,
        roles: {
          owner,
          admin,
          member,
        },
      },
    ),
  ],

})
