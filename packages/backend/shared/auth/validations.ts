import type { Id } from '../../convex/_generated/dataModel'
import type { AuthCtx } from './auth'
import type { Permissions } from './permissions'
import { ensure } from '@workspace/utils'
import { authComponent, getAuth } from './auth'

/**
 * Ensures a user is authenticated and returns the user document.
 * Throws if not authenticxated or user not found.
 */
export async function ensureUser(ctx: AuthCtx) {
  const { user } = await getUserOrNull(ctx)

  ensure(!!user, 'User not found')

  return { user }
}

export async function ensureUserWithOrganization(ctx: AuthCtx, { organizationId }: { organizationId: string }) {
  const { user } = await ensureUser(ctx)
  const membership = await ctx.db.query('member')
    .withIndex('userId', q => q.eq('userId', user._id))
    .filter(q => q.eq(q.field('organizationId'), organizationId))
    .first()

  ensure(membership !== null, `User does not have access to this organization`)

  return {
    user,
    membership,
  }
}

export async function ensureUserWithPermissions(ctx: AuthCtx, { permissions, organizationId }: { permissions: Permissions, organizationId: string }) {
  const { user, membership } = await ensureUserWithOrganization(ctx, { organizationId })

  const { auth, headers } = await getAuth(ctx)

  const hasPermissions = await auth.api.hasPermission({
    body: {
      organizationId,
      permissions,
    },
    headers,
  })

  ensure(hasPermissions.success, `User does not have the required permissions: ${JSON.stringify(permissions)}`)

  return {
    user,
    membership,
  }
}

/**
 * Returns the authenticated user or undefined if not authenticated.
 */
export async function getUserOrNull(ctx: AuthCtx) {
  const user = await authComponent.safeGetAuthUser(ctx)

  if (!user) {
    return { user: undefined }
  }

  const membeships = await ctx.db.query('member')
    .withIndex('userId', q => q.eq('userId', user._id))
    .collect()

  const organizations = await Promise.all(membeships.map(async (membership) => {
    const organization = await ctx.db.get(membership.organizationId as Id<'organization'>)
    ensure(organization !== null, 'Organization not found')
    return organization
  }))

  return { user: {
    ...user,
    organizations,
  } }
}

/**
 * Ensures that DEBUG mode is active.
 * Useful for protecting debug/development-only endpoints from being accessed in production.
 *
 * @throws {Error} If DEBUG environment variable is not set to "true"
 *
 */
export function ensureDebugActive(): void {
  if (process.env.DEBUG !== 'true') {
    throw new Error('This endpoint is only available in debug mode (local development)')
  }
}
