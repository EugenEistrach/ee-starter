# Better Auth Local Component

Local Better Auth component for schema control and plugin support.

## Schema Files

- `packages/backend/convex/components/betterAuth/generatedSchema.ts` - Auto-generated, never edit manually
- `packages/backend/convex/components/betterAuth/schema.ts` - Custom indexes and extensions

## Schema Generation

**Generate schema (run from project root):**
```bash
npx @better-auth/cli generate -y \
  --output packages/backend/convex/components/betterAuth/generatedSchema.ts \
  --config packages/backend/convex/components/betterAuth/auth.ts
```

**Regenerate when:**
- Adding/removing Better Auth plugins
- Changing auth providers
- Modifying auth configuration

## Custom Indexes

Add custom indexes in `packages/backend/convex/components/betterAuth/schema.ts`:

```typescript
// packages/backend/convex/components/betterAuth/schema.ts
import { tables } from './generatedSchema'

const schema = defineSchema({
  ...tables,
  member: tables.member.index('organizationId_userId', ['organizationId', 'userId']),
})
```

## Extending User Data

**User-related features:** Create separate table in feature slice, link via `userId`
```typescript
// packages/backend/features/profiles/schema.ts
profiles: defineTable({
  userId: v.string(),
  bio: v.string(),
}).index('userId', ['userId'])
```

**Auth-specific capabilities:** Add new table in `packages/backend/convex/components/betterAuth/schema.ts`
```typescript
// packages/backend/convex/components/betterAuth/schema.ts
const schema = defineSchema({
  ...tables,
  customAuthTable: defineTable({...}),
})
```

## Type Utilities

When using Better Auth callbacks (e.g., `sendResetPassword`), use type guards to ensure correct context:

```typescript
import { requireActionCtx, requireRunMutationCtx } from '@convex-dev/better-auth/utils'

// For scheduler access (mutations/actions)
requireRunMutationCtx(ctx)

// For action-specific features
requireActionCtx(ctx)
```

Reference: https://convex-better-auth.netlify.app/api/type-utilities
