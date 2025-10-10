import type { GenericCtx } from '@convex-dev/better-auth'
import type { DataModel } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { createClient } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth'
import { components } from '../_generated/api'

export const authComponent = createClient<DataModel>(components.betterAuth)

export function createAuth(ctx: GenericCtx<DataModel>, { optionsOnly } = { optionsOnly: false }) {
  const urlToUse = process.env.SITE_URL!

  // Support all production aliases from Vercel deployment
  const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',').filter(Boolean) || [urlToUse]

  return betterAuth({
    logger: {
      disabled: optionsOnly,
    },
    baseUrl: urlToUse,
    baseURL: urlToUse,
    trustedOrigins,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [convex()],
  })
}

type AuthCtx = QueryCtx | MutationCtx

/**
 * Ensures a user is authenticated and returns the user document.
 * Throws if not authenticated or user not found.
 */
export async function ensureUser(ctx: AuthCtx) {
  // @ts-expect-error bug will be fixed in some new version soon
  return authComponent.getAuthUser(ctx)
}

/**
 * Returns the authenticated user or undefined if not authenticated.
 */
export async function getUserOrNull(ctx: AuthCtx) {
  // @ts-expect-error bug will be fixed in some new version soon
  return authComponent.safeGetAuthUser(ctx)
}
