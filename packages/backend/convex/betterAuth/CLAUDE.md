# Better Auth Local Component

Local Better Auth component for schema control and plugin support.

## Schema Generation

**CLI Bug:** The Better Auth CLI outputs schema to `packages/backend/schema.ts` (root) instead of `convex/betterAuth/schema.ts`, regardless of working directory.

**Generate schema (run from `packages/backend/`):**
```bash
npx @better-auth/cli generate -y --config convex/betterAuth/auth.ts
mv schema.ts convex/betterAuth/schema.ts
```

**Regenerate when:**
- Adding/removing Better Auth plugins
- Changing auth providers
- Modifying auth configuration in `convex/auth.ts`

## Custom Indexes

Schema is auto-generated. Custom indexes added manually will be **overwritten** on regeneration.

If you need custom indexes:
1. Add after schema generation
2. Comment them clearly
3. Re-add after each regeneration

```typescript
// Custom index - re-add after regeneration
users: defineTable({...}).index('by_email_verified', ['email', 'emailVerified'])
```

## Generated Tables

- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth/social accounts
- `verification` - Email verification tokens

Do not rename or remove these tables.
