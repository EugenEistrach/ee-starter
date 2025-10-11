/* eslint-disable ts/no-unsafe-assignment */
/* eslint-disable ts/no-unsafe-member-access */
/* eslint-disable ts/strict-boolean-expressions */
/* eslint-disable @workspace/no-v-any */
import type { AuthFunctions, GenericCtx, Triggers } from '@convex-dev/better-auth'
import type { DataModel } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { createClient } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { requireActionCtx } from '@convex-dev/better-auth/utils'
import { betterAuth } from 'better-auth'
import { magicLink } from 'better-auth/plugins'
import { v } from 'convex/values'
import { createMagicLinkEmail } from '../features/email/templates/magic-link'
import { createPasswordResetEmail } from '../features/email/templates/password-reset'
import { createWelcomeEmail } from '../features/email/templates/welcome'
import { components, internal } from './_generated/api'
import { internalMutation } from './_generated/server'
import betterAuthSchema from './betterAuth/schema'

const triggers: Triggers<DataModel, any> = {
  user: {
    onCreate: async (ctx, user) => {
      if (user.email && user.name) {
        const template = createWelcomeEmail({
          name: user.name,
          email: user.email,
          dashboardUrl: `${process.env.SITE_URL}/dashboard`,
        })

        await ctx.scheduler.runAfter(0, internal.emails.send, {
          to: user.email,
          template,
          userId: user._id,
          metadata: { triggeredBy: 'signup' },
        })
      }
    },
  },
}

// Inline the logic from triggersApi() - these are the mutations that Better Auth will call
export const onCreate = internalMutation({
  args: {
    doc: v.any(),
    model: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await triggers[args.model]?.onCreate?.(ctx as any, args.doc)
  },
})

export const onUpdate = internalMutation({
  args: {
    oldDoc: v.any(),
    newDoc: v.any(),
    model: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await triggers[args.model]?.onUpdate?.(ctx as any, args.newDoc, args.oldDoc)
  },
})

export const onDelete = internalMutation({
  args: {
    doc: v.any(),
    model: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await triggers[args.model]?.onDelete?.(ctx as any, args.doc)
  },
})

const authFunctions = internal.auth as AuthFunctions

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  local: {

    schema: betterAuthSchema as any,
  },
  triggers,
})

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
      async sendResetPassword({ user, url }) {
        if (!user.email || !user.name)
          return

        const template = createPasswordResetEmail({
          name: user.name,
          resetUrl: url,
        })

        await requireActionCtx(ctx).scheduler.runAfter(0, internal.emails.send, {
          to: user.email,
          template,
          userId: user.id,
          metadata: { triggeredBy: 'password-reset-request' },
        })
      },
    },
    plugins: [
      convex(),
      magicLink({
        async sendMagicLink({ email, url }) {
          const template = createMagicLinkEmail({
            name: undefined,
            magicLink: url,
          })

          await requireActionCtx(ctx).scheduler.runAfter(0, internal.emails.send, {
            to: email,
            template,
            metadata: { triggeredBy: 'magic-link-request' },
          })
        },
        expiresIn: 60 * 5, // 5 minutes
        disableSignUp: false,
      }),
    ],

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
