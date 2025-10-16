import type { AuthCtx } from './auth'
import type { Permissions } from './permissions'
import { ensure } from '@workspace/utils'
import { authComponent, getAuth } from './auth'

/**
 * Ensures a user is authenticated and returns the user document.
 * Throws if not authenticxated or user not found.
 */
export async function ensureUser(ctx: AuthCtx) {
  const user = await authComponent.getAuthUser(ctx)
  return { user }
}

export async function ensureUserWithOrganization(ctx: AuthCtx, { organizationId }: { organizationId: string }) {
  const { user } = await ensureUser(ctx)
  const { auth, headers } = await getAuth(ctx)
  const organizations = await auth.api.listOrganizations({

    headers,
  })

  ensure(organizations.some(organization => organization.id === organizationId), `User does not have access to this organization`)

  return {
    user,
  }
}

export async function ensureUserWithPermissions(ctx: AuthCtx, { permissions, organizationId }: { permissions: Permissions, organizationId: string }) {
  const { user } = await ensureUserWithOrganization(ctx, { organizationId })

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
  }
}

/**
 * Returns the authenticated user or undefined if not authenticated.
 */
export async function getUserOrNull(ctx: AuthCtx) {
  const user = await authComponent.safeGetAuthUser(ctx)
  return { user }
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
