import { query } from '../_generated/server'
import { getUserOrNull } from '../shared/auth'

// eslint-disable-next-line @workspace/convex-returns-required
export const getCurrentUser = query({
  handler: async (ctx) => {
    return getUserOrNull(ctx)
  },
})
