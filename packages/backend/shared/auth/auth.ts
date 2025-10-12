import type { AuthFunctions, GenericCtx } from '@convex-dev/better-auth'
import type { DataModel } from '../../convex/_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server'
import { createClient } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { requireActionCtx } from '@convex-dev/better-auth/utils'
import { betterAuth } from 'better-auth'
import { magicLink, organization } from 'better-auth/plugins'
import { components, internal } from '../../convex/_generated/api'
// eslint-disable-next-line boundaries/element-types
import betterAuthSchema from '../../convex/components/betterAuth/schema'

import { createMagicLinkEmail } from './emails/magic-link'
import { createOrganizationInviteEmail } from './emails/organization-invite'
import { createPasswordResetEmail } from './emails/password-reset'
import { ac, admin, member, owner } from './permissions'

const authFunctions: AuthFunctions = internal.auth

export const authComponent = createClient<DataModel, typeof betterAuthSchema>(components.betterAuth, {
  authFunctions,
  local: {

    schema: betterAuthSchema,
  },

})

export function createAuth(ctx: GenericCtx<DataModel>, { optionsOnly } = { optionsOnly: false }) {
  const urlToUse = process.env.SITE_URL!

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
        expiresIn: 60 * 5,
        disableSignUp: false,
      }),
      organization({
        ac,
        roles: {
          owner,
          admin,
          member,
        },
        teams: {
          enabled: false,
        },
        allowUserToCreateOrganization: async _user => true,
        async sendInvitationEmail(data) {
          const inviteLink = `${process.env.SITE_URL}/accept-invite/${data.id}`

          const template = createOrganizationInviteEmail({
            inviterName: data.inviter.user.name,
            organizationName: data.organization.name,
            inviteUrl: inviteLink,
            role: data.role,
          })

          await requireActionCtx(ctx).scheduler.runAfter(0, internal.emails.send, {
            to: data.email,
            template,
            metadata: { triggeredBy: 'organization-invite' },
          })
        },
      }),
    ],

  })
}

export async function getAuth(ctx: GenericCtx<DataModel>) {
  return authComponent.getAuth(createAuth, ctx)
}

export type AuthCtx = QueryCtx | MutationCtx
