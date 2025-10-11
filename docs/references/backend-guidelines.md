# Backend Guidelines

## Protecting Queries & Mutations

Always use `ensureUser()` from `convex/shared/auth.ts` to verify authentication. This prevents users from accessing other users' data.

```typescript
import { ensureUser } from '../shared/auth'

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await ensureUser(ctx) // Throws if not authenticated

    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first()

    return { user, profile }
  }
})
```

## Extending User Data

User table is managed by Better Auth. To add user-related data, create a separate table and link via user ID.

```typescript
// convex/features/user-profiles/schema.ts
export const userProfilesSchema = {
  userProfiles: defineTable({
    userId: v.id('users'),
    displayName: v.string(),
    bio: v.optional(v.string()),
  }).index('by_user', ['userId'])
}
```

## Auth Helpers

- `ensureUser(ctx)` - Returns user or throws (use for protected endpoints)
- `getUserOrNull(ctx)` - Returns user or undefined (use for optional auth)
- Config: `convex/auth.config.ts`
