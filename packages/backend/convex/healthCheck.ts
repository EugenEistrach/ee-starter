import { v } from 'convex/values'
import { query } from './_generated/server'

export const get = query({
  returns: v.string(),
  handler: async () => {
    return 'OK'
  },
})
