# Backend Guidelines

## Multi-Tenant Architecture

All features are organization-scoped. Every table needs:
- `organizationId: v.string()` - Links to organization
- `createdBy: v.string()` - Audit trail
- `.index('by_organization', ['organizationId'])` - For scoped queries

## Example: Complete Feature Pattern

```typescript
// features/items/schema.ts
export const itemsTable = defineTable({
  name: v.string(),
  status: v.string(),
  organizationId: v.string(),
  createdBy: v.string(),
})
  .index('by_organization', ['organizationId'])
  .index('by_organization_status', ['organizationId', 'status'])

// features/items/logic.ts
export async function getItems(ctx: QueryCtx, organizationId: string) {
  return ctx.db.query('items')
    .withIndex('by_organization', q => q.eq('organizationId', organizationId))
    .collect()
}

export async function createItem(
  ctx: MutationCtx,
  { name, status, organizationId, userId }: CreateItemArgs
) {
  return ctx.db.insert('items', {
    name,
    status,
    organizationId,
    createdBy: userId,
  })
}

// convex/items.ts
import { ensureUserWithOrganization, ensureUserWithPermissions } from '../shared/auth/validations'

export const getAll = query({
  args: { organizationId: v.string() },
  handler: async (ctx, { organizationId }) => {
    await ensureUserWithOrganization(ctx, { organizationId })
    return getItems(ctx, organizationId)
  }
})

export const create = mutation({
  args: {
    name: v.string(),
    status: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, { organizationId, ...data }) => {
    const { user } = await ensureUserWithPermissions(ctx, {
      permissions: { item: ['create'] },
      organizationId,
    })
    return createItem(ctx, { ...data, organizationId, userId: user._id })
  }
})
```

See `features/todos/` for complete working example.

## Permission Validation

Three levels from `shared/auth/validations.ts`:

```typescript
// User-only operations (not org-scoped)
const { user } = await ensureUser(ctx)

// Organization reads (membership check)
await ensureUserWithOrganization(ctx, { organizationId })

// Organization writes (permission check)
await ensureUserWithPermissions(ctx, {
  permissions: { item: ['create', 'update', 'delete'] },
  organizationId
})
```

Add feature permissions in `shared/auth/permissions.ts`

## Extending User Data

User table managed by Better Auth. Create separate table linked by user ID:

```typescript
export const userProfilesSchema = {
  userProfiles: defineTable({
    userId: v.id('users'),
    displayName: v.string(),
    bio: v.optional(v.string()),
  }).index('by_user', ['userId'])
}
```

## Sending Emails

Use `ctx.scheduler.runAfter(0, internal.emails.send, {...})` for template-based emails. See `docs/how-to/send-emails.md`.
