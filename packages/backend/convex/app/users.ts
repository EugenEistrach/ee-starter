import { query } from '../_generated/server'
import { getUserOrNull } from '../shared/auth'

export const getCurrentUser = query({
  handler: async (ctx) => {
    return getUserOrNull(ctx)
  },
})
