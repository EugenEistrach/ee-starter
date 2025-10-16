import { getUserOrNull } from '../shared/auth/validations'
import { query } from './_generated/server'

// eslint-disable-next-line @workspace/convex-returns-required
export const getCurrentUser = query({
  handler: async (ctx) => {
    return getUserOrNull(ctx)
  },
})
