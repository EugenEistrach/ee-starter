import { v } from 'convex/values'
import { isDebugEnabled } from '../shared/debug'
import { query } from './_generated/server'

export const isActive = query({
  returns: v.boolean(),
  handler: async () => {
    return isDebugEnabled()
  },
})
