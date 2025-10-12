# Context: Authentication & Organization System

## Overview

This document provides comprehensive context about the authentication system and organization implementation in the ee-starter codebase. The authentication uses Better Auth with Convex integration, featuring email/password, magic link authentication, and a multi-organization system with role-based access control.

## How Authentication Works

The authentication system is built on Better Auth, a flexible authentication framework integrated with Convex. The architecture follows a layered pattern where the `convex/` layer exposes API endpoints, `shared/auth/` contains reusable authentication logic, and Better Auth manages the core authentication tables and operations.

### Authentication Flow

When a user signs up or signs in, the request flows through multiple layers. First, the frontend auth client (`apps/web/src/shared/auth/lib/auth-client.ts`) makes a request to Better Auth. The auth client is configured with plugins for Convex integration, magic links, and organization management. This client communicates with the backend through the Better Auth component.

On the backend, the Better Auth component is set up as a local component in `packages/backend/convex/components/betterAuth/`. This component manages the authentication schema and provides the adapter for database operations. The `createAuth` function in `packages/backend/shared/auth/auth.ts` configures Better Auth with multiple authentication methods:

1. **Email/Password Authentication**: Users can sign up with email and password. Email verification is currently disabled (`requireEmailVerification: false`), but the infrastructure supports it.

2. **Magic Link Authentication**: Users can request a magic link sent to their email. When they click the link (valid for 5 minutes), they're automatically signed in without needing a password. The magic link flow uses the email system to send the link.

3. **Password Reset**: Users can request a password reset link via email. The link is valid for 1 hour and allows them to set a new password.

The authentication configuration also includes:
- Base URL and trusted origins for CORS handling
- Email callbacks that integrate with the internal email system
- Organization plugin with role-based access control
- Triggers for lifecycle events (onCreate, onUpdate, onDelete)

### Session Management

When authentication succeeds, Better Auth creates a session token stored in the `session` table. This token is set as an HTTP-only cookie named based on the application domain. The session contains:
- User ID reference
- Expiration timestamp
- IP address and user agent for security tracking
- Optional active organization ID (though the app uses URL-based org selection instead)

The session is validated on every request through the root route's `beforeLoad` hook (`apps/web/src/app/__root.tsx`). This hook:
1. Calls the server function `fetchAuth` to retrieve session data
2. Extracts the user ID and session token
3. Sets the auth token on the Convex query client for authenticated requests
4. Returns the user ID to the route context, making it available to all child routes

If authentication fails (expired token, invalid session), the user is redirected to the login page. Individual routes can check `context.userId` to determine if a user is authenticated.

### User Data Structure

The user data is managed by Better Auth and stored in the `user` table (defined in `packages/backend/convex/components/betterAuth/schema.ts`):

```typescript
user: defineTable({
  name: v.string(),
  email: v.string(),
  emailVerified: v.boolean(),
  image: v.optional(v.union(v.null(), v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
  userId: v.optional(v.union(v.null(), v.string())),
})
```

This table is read-only from the application's perspective - Better Auth manages it entirely. To extend user data, you must create a separate table linked via user ID (see Backend Guidelines).

The `getUserOrNull` function in `packages/backend/shared/auth/validations.ts` returns the authenticated user from Better Auth, or undefined if not authenticated.

## Organization System

The organization system provides multi-tenancy capabilities where users can be members of multiple organizations with different roles and permissions.

### Organization Schema

Organizations are defined in the Better Auth schema with the following structure:

```typescript
organization: defineTable({
  name: v.string(),
  slug: v.string(),
  logo: v.optional(v.union(v.null(), v.string())),
  createdAt: v.number(),
  metadata: v.optional(v.union(v.null(), v.string())),
})
  .index('name', ['name'])
  .index('slug', ['slug'])
```

The `slug` field is critical - it's used in URLs (e.g., `/o/acme-corp/todos`) for clean, human-readable organization routing. Slugs are automatically generated from organization names using the `generateSlug` function in `packages/backend/shared/auth/slug.ts`.

### Membership and Roles

User-organization relationships are tracked in the `member` table:

```typescript
member: defineTable({
  organizationId: v.string(),
  userId: v.string(),
  role: v.string(),
  createdAt: v.number(),
})
  .index('organizationId', ['organizationId'])
  .index('userId', ['userId'])
  .index('role', ['role'])
```

Three roles are defined in `packages/backend/shared/auth/permissions.ts`:
- **member**: Can create and update todos
- **admin**: Can create, update, and delete todos, plus admin-level permissions
- **owner**: Full permissions for all operations

The role system uses Better Auth's access control plugin with custom statements. Permissions are checked using the `hasPermission` API before operations.

### Organization Invitations

Invitations allow existing members to invite new users to join their organization:

```typescript
invitation: defineTable({
  organizationId: v.string(),
  email: v.string(),
  role: v.optional(v.union(v.null(), v.string())),
  status: v.string(),
  expiresAt: v.number(),
  inviterId: v.string(),
})
```

When an invitation is created, Better Auth triggers the `sendInvitationEmail` callback, which schedules an email with an invitation link. The invitation link includes the invitation ID and directs to `/accept-invite/{id}` (route not yet implemented in the UI).

### Slug Generation

The slug generation algorithm in `packages/backend/shared/auth/slug.ts` ensures unique, URL-safe organization slugs:

1. Sanitizes the name by converting to lowercase and removing special characters
2. Replaces spaces with hyphens and normalizes multiple hyphens
3. Ensures minimum length (defaults to "org" if too short)
4. Truncates to 45 characters to leave room for collision suffixes
5. Checks database for existing slug
6. If collision detected, appends a 4-character random suffix
7. Retries up to 10 times with different suffixes
8. Falls back to UUID fragment if all attempts fail (should never happen)

This ensures slugs like `acme-corp`, `my-startup-x7k2` are generated reliably.

### Backend Organization API

The organization API in `packages/backend/convex/organizations.ts` provides three operations:

**1. create** - Creates a new organization:
```typescript
export const create = mutation({
  args: { name: v.string(), logo: v.string() },
  returns: v.null(),
  handler: async (ctx, { name, logo }) => {
    await ensureUser(ctx)
    const { auth, headers } = await getAuth(ctx)
    const slug = await generateSlug(ctx, name)

    await auth.api.createOrganization({
      body: { name, slug, logo },
      headers,
    })
  },
})
```

This mutation:
- Ensures the user is authenticated
- Generates a unique slug from the organization name
- Calls Better Auth's `createOrganization` API with the sanitized data
- Better Auth automatically creates the organization and adds the creator as an owner

**2. listAll** - Lists all organizations for the current user:
```typescript
export const listAll = query({
  args: {},
  returns: v.array(OrganizationSchema),
  handler: async (ctx) => {
    await ensureUser(ctx)
    const { auth, headers } = await getAuth(ctx)
    const organizations = await auth.api.listOrganizations({ headers })

    return organizations.map(organization => ({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    }))
  },
})
```

This query returns all organizations where the user is a member.

**3. get** - Gets organization details by slug:
```typescript
export const get = query({
  args: { slug: v.string() },
  returns: OrganizationSchema,
  handler: async (ctx, { slug }) => {
    await ensureUser(ctx)
    const { auth, headers } = await getAuth(ctx)
    const organization = await auth.api.getFullOrganization({
      query: { organizationSlug: slug },
      headers,
    })

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      members: organization.members.map(member => ({
        id: member.userId,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
      })),
    }
  },
})
```

This query returns the organization with its members. Note: The return type declares `OrganizationSchema` but actually includes a `members` array.

### Frontend Organization Implementation

The frontend organization support includes complete routing infrastructure and data fetching patterns.

**Organization Routing Structure** (`apps/web/src/app/o.$organizationSlug.tsx`):
The main organization layout provides:
- Sidebar with organization branding and navigation
- Navigation menu with Todos and Settings links
- User dropdown menu with logout functionality
- Layout wraps all organization routes
- Route guard that fetches organizations via `api.organizations.listAll` and redirects if user doesn't have access

**Organization Context Hooks**:
- `useOrganization()` (`apps/web/src/shared/auth/hooks/useOrganizationSlug.ts`): Extracts organization slug from URL params and fetches organization data directly via `api.organizations.get` using `useSuspenseQuery`. Returns organization object with `id` field casted to `Id<'organization'>`.
- `useCurrentUser()`: Returns the authenticated user via `api.users.getCurrentUser` query. Organizations are fetched separately via `api.organizations.listAll`.

**Organization Selection Logic** (`apps/web/src/shared/auth/lib/organization.ts`):
- `getFirstOrganization()`: Fetches organizations via `api.organizations.listAll` and returns the first one
- `redirectToFirstOrganization()`: Redirects to the user's first organization
- Used by the `/o` route to automatically select an organization if none is specified

**Organization Routes**:
- `/o` - Redirects to first organization
- `/o/$organizationSlug` - Organization layout wrapper with sidebar
- `/o/$organizationSlug/` - Redirects to todos
- `/o/$organizationSlug/todos` - Todo list for the organization (complete implementation)
- `/o/$organizationSlug/settings` - Settings page (placeholder - shows "Settings Coming Soon")
- `/new-organization` - Create new organization (placeholder - shows "Hello /new-organization!")

**Data Fetching Patterns**:
- **Queries**: Use existing Convex query wrappers (`api.organizations.listAll`, `api.organizations.get`) with `useSuspenseQuery` and `convexQuery` from `@convex-dev/react-query`
- **Mutations**: Use Better Auth client directly (`authClient.organization.*`) - no Convex wrappers needed
- **Route Loaders**: For Better Auth-specific data (e.g., invitations), use `authClient` in TanStack Router loaders and pass to components via route context

**Better Auth Client Integration**:
The `authClient` from `apps/web/src/shared/auth/lib/auth-client.ts` provides direct access to Better Auth organization methods:
- `authClient.organization.create()` - Create organization
- `authClient.organization.update()` - Update organization details
- `authClient.organization.delete()` - Delete organization
- `authClient.organization.inviteMember()` - Invite user to organization
- `authClient.organization.listMembers()` - List organization members
- `authClient.organization.updateMemberRole()` - Change member role
- `authClient.organization.removeMember()` - Remove member from organization
- `authClient.organization.acceptInvitation()` - Accept invitation
- `authClient.organization.rejectInvitation()` - Reject invitation
- `authClient.organization.getInvitation()` - Get invitation details
- `authClient.organization.leave()` - Leave organization
- `authClient.organization.hasPermission()` - Check permissions for conditional rendering

See `docs/research/better-auth.md` for complete Better Auth client API reference.

### What Needs to Be Built

Four UI components need to be implemented to complete the organization feature:

**1. Organization Switcher**
Location: In sidebar (enhance `ChevronsUpDown` button area in `o.$organizationSlug.tsx`)
- Dropdown showing current organization
- List all user organizations (use existing `api.organizations.listAll` query)
- Click organization → navigate to `/o/{slug}`
- "+ New Organization" option → navigate to `/new-organization`

**2. New Organization Form**
Location: `apps/web/src/app/new-organization.tsx` (replace placeholder)
- TanStack Form with name and logo fields
- Call `authClient.organization.create({ name, slug, logo })` on submit
- Redirect to `/o/{slug}` on success

**3. Settings Page**
Location: `apps/web/src/app/o.$organizationSlug.settings.tsx` (replace placeholder)
- Tabs component with three tabs:
  - **General Tab**: Edit organization name and logo using `authClient.organization.update()`
  - **Members Tab**:
    - List members table using `authClient.organization.listMembers()`
    - Invite button opening dialog with email + role fields using `authClient.organization.inviteMember()`
    - Role dropdown per member using `authClient.organization.updateMemberRole()`
    - Remove button per member using `authClient.organization.removeMember()`
  - **Danger Zone Tab**:
    - Delete organization button using `authClient.organization.delete()`
    - Leave organization button using `authClient.organization.leave()`

**4. Accept Invitation Route**
Location: Create `apps/web/src/app/accept-invite.$invitationId.tsx`
- Fetch invitation in route loader using `authClient.organization.getInvitation({ id: invitationId })`
- Pass invitation data to component via route context
- Display organization name, role, and inviter information
- Accept button calling `authClient.organization.acceptInvitation({ invitationId })`
- Reject button calling `authClient.organization.rejectInvitation({ invitationId })`
- Redirect to organization (`/o/{slug}`) on accept

All UI components are available from `@workspace/ui`. Use `authClient.organization.hasPermission()` for conditional rendering based on user permissions.

## Authentication Validation Helpers

The `packages/backend/shared/auth/validations.ts` file provides critical helpers for protecting backend operations:

### ensureUser(ctx)
The most basic protection - ensures a user is authenticated. Throws an error if not authenticated or if the user document doesn't exist. Use this for any operation that requires authentication but doesn't need organization-level permissions.

```typescript
const { user } = await ensureUser(ctx)
// user is guaranteed to exist here
```

### ensureUserWithOrganization(ctx, { organizationId })
Ensures the user is authenticated AND is a member of the specified organization. It:
1. Calls `ensureUser` to verify authentication
2. Queries the `member` table for a membership record
3. Throws if no membership exists
4. Returns both the user and their membership record

This is used when you need to verify organization access but don't need to check specific permissions. For example, viewing organization data.

```typescript
const { user, membership } = await ensureUserWithOrganization(ctx, {
  organizationId
})
// user is a member of this organization
```

### ensureUserWithPermissions(ctx, { permissions, organizationId })
The most restrictive validation - ensures the user is authenticated, is a member, AND has specific permissions. It:
1. Calls `ensureUserWithOrganization` to verify membership
2. Calls Better Auth's `hasPermission` API with the required permissions
3. Throws if the user lacks permissions
4. Returns user and membership

This is used for operations that require specific role-based permissions, like deleting todos.

```typescript
const { user, membership } = await ensureUserWithPermissions(ctx, {
  permissions: {
    todo: ['delete'],
  },
  organizationId
})
// user can delete todos in this organization
```

### getUserOrNull(ctx)
Returns the authenticated user or undefined if not authenticated. This is used for operations where authentication is optional.

```typescript
const { user } = await getUserOrNull(ctx)
if (user) {
  // user is authenticated
}
```

## Email System Integration

The authentication system integrates tightly with the internal email system for sending authentication-related emails.

### Email Templates

Three email templates exist in `packages/backend/shared/auth/emails/`:

1. **Magic Link** (`magic-link.ts`): Sends a sign-in link that expires in 5 minutes
2. **Password Reset** (`password-reset.ts`): Sends a password reset link that expires in 1 hour
3. **Organization Invite** (`organization-invite.ts`): Sends an invitation to join an organization

Each template uses the email design system (`packages/backend/shared/email/components.ts`) for consistent styling with:
- Card layout with header, content, and footer
- Primary action buttons
- Muted text for secondary information
- Both HTML and plain text versions

### Email Sending Flow

When Better Auth needs to send an email (magic link, password reset, invitation), it:
1. Calls the appropriate callback in `createAuth`
2. The callback generates an email template with the required data
3. Schedules the `internal.emails.send` mutation using `ctx.scheduler.runAfter(0, ...)`
4. The email system handles actual delivery (Resend in production, console in development)
5. All emails are tracked in the `emails` table for audit trail

The email system automatically switches between:
- **Local Development**: Logs to console and devtools panel
- **Production**: Sends via Resend API

## Frontend Authentication Implementation

### Auth Client Configuration

The frontend auth client (`apps/web/src/shared/auth/lib/auth-client.ts`) is configured with three plugins:

```typescript
export const authClient = createAuthClient({
  plugins: [
    convexClient(),           // Convex integration
    magicLinkClient(),        // Magic link authentication
    organizationClient({      // Organization management
      ac,
      roles: { owner, admin, member },
    }),
  ],
})
```

This client provides React hooks and functions for all auth operations.

### Sign In Flow

The sign-in form (`apps/web/src/shared/auth/views/sign-in-form.tsx`) supports two authentication methods via tabs:

**Password Tab:**
- Email and password fields
- Validates email format and password length (8+ chars)
- Calls `authClient.signIn.email({ email, password })`
- On success: redirects to `/o` (which redirects to first organization)
- On error: shows error toast

**Magic Link Tab:**
- Email field only
- Calls `authClient.signIn.magicLink({ email, callbackURL: '/dashboard' })`
- Always shows success message (for security, even if email doesn't exist)
- Displays "Check your email" UI after submission
- User clicks link in email to sign in automatically

### Sign Up Flow

The sign-up form (`apps/web/src/shared/auth/views/sign-up-form.tsx`) collects:
- Name (2+ characters)
- Email (validated format)
- Password (8+ characters)

Calls `authClient.signUp.email({ email, password, name })` and redirects to `/o` on success.

### Password Reset Flow

Two forms handle password reset:

1. **Forgot Password** (`forgot-password-form.tsx`): User enters email, receives reset link
2. **Reset Password** (`reset-password-form.tsx`): User clicks link, enters new password

### Authentication State

The `useCurrentUser()` hook (`apps/web/src/shared/auth/hooks/useCurrentUser.ts`) provides access to the authenticated user:

```typescript
const user = useCurrentUser()
// user: {
//   _id: Id<'user'>,
//   name: string,
//   email: string,
//   emailVerified: boolean,
//   image?: string,
//   createdAt: number,
//   updatedAt: number,
// }
```

This hook uses `useSuspenseQuery` with the `api.users.getCurrentUser` query, which internally calls `getUserOrNull` on the backend.

## Example: How Todos Work with Organizations

The todos feature demonstrates the complete flow of organization-scoped data:

### Backend Protection

In `packages/backend/convex/todos.ts`, each operation validates organization access:

```typescript
// Viewing todos - just needs membership
export const getAll = query({
  args: { organizationId: v.id('organization') },
  handler: async (ctx, { organizationId }) => {
    await ensureUserWithOrganization(ctx, { organizationId })
    return getAllTodos(ctx, organizationId)
  },
})

// Creating todos - needs 'create' permission
export const create = mutation({
  args: { text: v.string(), organizationId: v.id('organization') },
  handler: async (ctx, { text, organizationId }) => {
    const { user } = await ensureUserWithPermissions(ctx, {
      permissions: { todo: ['create'] },
      organizationId
    })
    return createTodo(ctx, text, organizationId, user._id)
  },
})

// Deleting todos - needs 'delete' permission
export const deleteTodo = mutation({
  args: { id: v.id('todos'), organizationId: v.id('organization') },
  handler: async (ctx, { id, organizationId }) => {
    await ensureUserWithPermissions(ctx, {
      permissions: { todo: ['delete'] },
      organizationId
    })
    return removeTodo(ctx, id)
  },
})
```

### Frontend Organization Context

In the todos list (`apps/web/src/features/todos/views/todos-list.tsx`), the organization ID comes from the URL:

```typescript
const organization = useOrganization()  // Fetches org via api.organizations.get

// All operations include organizationId
const todosQuery = useSuspenseQuery(
  convexQuery(api.todos.getAll, { organizationId: organization.id })
)

await createTodo({ text, organizationId: organization.id })
await toggleTodo({ id, completed: !completed, organizationId: organization.id })
await removeTodo({ id, organizationId: organization.id })
```

### Data Isolation

Todos are scoped to organizations via the schema:

```typescript
export const todosTable = defineTable({
  text: v.string(),
  completed: v.boolean(),
  organizationId: v.id('organization'),  // Links to organization
  createdBy: v.id('user'),              // Tracks creator
})
  .index('by_organization', ['organizationId'])
  .index('by_organization_completed', ['organizationId', 'completed'])
```

Queries filter by organization ID to ensure data isolation:

```typescript
export async function getAllTodos(ctx: QueryCtx, organizationId: Id<'organization'>) {
  return ctx.db
    .query('todos')
    .withIndex('by_organization', q => q.eq('organizationId', organizationId))
    .collect()
}
```

## Current Implementation Status

**Complete - Backend:**
- Better Auth integration with Convex (local component)
- Email/password, magic link, and password reset authentication
- Session management with HTTP-only cookies
- Organization, member, and invitation schemas
- Role-based access control (owner, admin, member)
- Permission checking helpers (`ensureUser`, `ensureUserWithOrganization`, `ensureUserWithPermissions`)
- Slug generation for organizations
- Email integration for auth flows
- Organization API queries: `create`, `listAll`, `get`

**Complete - Frontend:**
- Sign-in form (password + magic link tabs)
- Sign-up form
- Password reset forms (forgot password + reset password)
- Auth state management hooks (`useCurrentUser`, `useOrganization`)
- Organization routing structure with URL-based org selection
- Organization context hooks that fetch data via API
- Protected route guards
- User menu with logout
- Sidebar navigation with Todos/Settings links
- Todos feature as example of organization-scoped data
- Better Auth client integration (`authClient.organization.*` methods)

**Needs Implementation - Frontend UI:**
1. Organization switcher in sidebar
2. New organization form (`/new-organization`)
3. Settings page with General/Members/Danger tabs (`/o/$organizationSlug/settings`)
4. Accept invitation route (`/accept-invite/$invitationId`)

All required backend functionality and data fetching patterns are in place. Only 4 UI components need to be built using existing tools (`authClient` for mutations, `api.organizations.*` for queries, `@workspace/ui` for components).

## Key Technical Patterns

### Authentication Pattern

1. **Server-Side Session Fetching**: The root route fetches auth on the server using `fetchSession` and sets the token on the Convex client
2. **Client-Side Auth Client**: The `authClient` provides React hooks for auth operations
3. **Context Propagation**: User ID flows through route context, available to all routes
4. **Protection Helpers**: Backend uses `ensureUser*` helpers to validate access

### Organization Pattern

1. **URL-Based Selection**: Organization is identified by slug in URL (`/o/acme-corp`)
2. **Route Guards**: Parent route validates organization access before loading children
3. **Context Hooks**: `useOrganization()` extracts from URL and validates membership
4. **Backend Validation**: Every operation includes `organizationId` and validates access

### Permission Pattern

1. **Declarative Permissions**: Permissions defined as objects (`{ todo: ['create', 'update'] }`)
2. **Role-Based Access**: Roles map to permission sets (member, admin, owner)
3. **Backend Enforcement**: `ensureUserWithPermissions` checks before operations
4. **Frontend Assumption**: Frontend assumes permissions, backend enforces them

## File Reference

### Backend Core Files

**Authentication:**
- `packages/backend/shared/auth/auth.ts` - Better Auth configuration and setup
- `packages/backend/shared/auth/permissions.ts` - Role definitions and access control
- `packages/backend/shared/auth/validations.ts` - Auth validation helpers
- `packages/backend/shared/auth/slug.ts` - Organization slug generation
- `packages/backend/convex/components/betterAuth/schema.ts` - Auth database schema
- `packages/backend/convex/components/betterAuth/auth.ts` - Auth component entry
- `packages/backend/convex/auth.ts` - Auth triggers export
- `packages/backend/convex/auth.config.ts` - Auth provider config

**Email Templates:**
- `packages/backend/shared/auth/emails/magic-link.ts` - Magic link email
- `packages/backend/shared/auth/emails/password-reset.ts` - Password reset email
- `packages/backend/shared/auth/emails/organization-invite.ts` - Invitation email

**Organizations:**
- `packages/backend/convex/organizations.ts` - Organization API endpoints (create, listAll, get)
- `packages/backend/convex/users.ts` - User query

**Email System:**
- `packages/backend/shared/email/logic.ts` - Email sending logic
- `packages/backend/shared/email/components.ts` - Email design components

### Frontend Core Files

**Auth UI:**
- `apps/web/src/shared/auth/views/sign-in-form.tsx` - Sign in with password/magic link
- `apps/web/src/shared/auth/views/sign-up-form.tsx` - Sign up form
- `apps/web/src/shared/auth/views/forgot-password-form.tsx` - Request reset link
- `apps/web/src/shared/auth/views/reset-password-form.tsx` - Set new password

**Auth Logic:**
- `apps/web/src/shared/auth/lib/auth-client.ts` - Auth client configuration
- `apps/web/src/shared/auth/lib/organization.ts` - Organization helpers
- `apps/web/src/shared/auth/hooks/useCurrentUser.ts` - Get current user hook
- `apps/web/src/shared/auth/hooks/useOrganizationSlug.ts` - Get organization from URL

**Routes:**
- `apps/web/src/app/__root.tsx` - Root layout with auth setup
- `apps/web/src/app/login.tsx` - Login page
- `apps/web/src/app/signup.tsx` - Signup page
- `apps/web/src/app/forgot-password.tsx` - Forgot password page
- `apps/web/src/app/reset-password.tsx` - Reset password page
- `apps/web/src/app/o.tsx` - Organization redirect
- `apps/web/src/app/o.$organizationSlug.tsx` - Organization layout
- `apps/web/src/app/o.$organizationSlug.index.tsx` - Organization index redirect
- `apps/web/src/app/o.$organizationSlug.todos.tsx` - Todos page
- `apps/web/src/app/o.$organizationSlug.settings.tsx` - Settings placeholder
- `apps/web/src/app/new-organization.tsx` - Create org placeholder

## Security Considerations

1. **Always validate organization access on backend**: Never trust frontend to enforce permissions
2. **Include organizationId in every operation**: Even if it seems redundant, it prevents mistakes
3. **Use appropriate validation level**: `ensureUser` < `ensureUserWithOrganization` < `ensureUserWithPermissions`
4. **Slug security**: Slugs are public identifiers - don't expose sensitive data in them
5. **Invitation expiration**: Invitations have expiration times - validate before accepting
6. **Session tokens**: HTTP-only cookies prevent XSS attacks on session tokens
7. **Email verification**: Currently disabled but infrastructure exists to enable it

## Performance Considerations

1. **Organization loading**: Organizations fetched via `api.organizations.listAll` query
2. **Member queries**: Indexed by `userId` and `organizationId` for efficient lookups
3. **Slug uniqueness**: Up to 10 random suffix attempts before falling back to UUID
4. **Email scheduling**: Emails scheduled with `runAfter(0, ...)` to avoid blocking mutations
5. **Session validation**: Happens on every route navigation - keep it fast

## Architecture Decisions

**Why URL-based organization selection?**
The codebase explicitly avoids session-based organization selection (note the removed `activeOrganizationId` field). URL-based selection provides:
- Shareable, bookmarkable links
- Clear context in the browser bar
- No session state to manage
- Easy multi-tab support for different organizations

**Why local Better Auth component?**
The codebase uses a local Better Auth component (`convex/components/betterAuth/`) instead of the hosted version. This provides:
- Full control over schema generation and modifications
- Support for triggers (onCreate, onUpdate, onDelete)
- Ability to customize the authentication flow
- No dependency on external services

**Why separate organization queries?**
Organizations are fetched separately via `api.organizations.listAll` and `api.organizations.get` rather than being embedded in the user object. This provides:
- Cleaner separation of concerns
- More flexible data fetching (only load orgs when needed)
- Better caching control per query
- Avoids loading unnecessary organization data on every auth check
