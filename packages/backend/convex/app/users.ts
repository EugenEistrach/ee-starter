import { v } from 'convex/values'
import { query } from '../_generated/server'
import { getUserOrNull } from '../shared/auth'

export const getCurrentUser = query({
  returns: v.union(
    v.object({
      _id: v.id('user'),
      _creationTime: v.number(),
      userId: v.optional(v.union(v.string(), v.null())),
      image: v.optional(v.union(v.string(), v.null())),
      twoFactorEnabled: v.optional(v.union(v.boolean(), v.null())),
      isAnonymous: v.optional(v.union(v.boolean(), v.null())),
      username: v.optional(v.union(v.string(), v.null())),
      displayUsername: v.optional(v.union(v.string(), v.null())),
      phoneNumber: v.optional(v.union(v.string(), v.null())),
      phoneNumberVerified: v.optional(v.union(v.boolean(), v.null())),
      createdAt: v.number(),
      updatedAt: v.number(),
      email: v.string(),
      emailVerified: v.boolean(),
      name: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    return getUserOrNull(ctx)
  },
})
