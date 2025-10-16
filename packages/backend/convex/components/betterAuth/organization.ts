import type { Id } from './_generated/dataModel'
import { ensure } from '@workspace/utils/ensure'
import { v } from 'convex/values'
import { ensureExistingRole, Role } from '../../../shared/auth/permissions'
import { query } from './_generated/server'

export const getInvitation = query({
  args: {
    invitationId: v.string(),
  },

  returns: v.union(v.null(), v.object({
    id: v.id('invitation'),
    email: v.string(),
    role: Role,
    status: v.string(),
    organizationName: v.string(),
    organizationSlug: v.string(),
    inviterEmail: v.string(),
    inviterName: v.string(),
    expiresAt: v.number(),
  })),

  handler: async (ctx, { invitationId }) => {
    const id = ctx.db.normalizeId('invitation', invitationId)

    if (!id) {
      return null
    }

    const invitation = await ctx.db.get(id)

    if (!invitation) {
      return null
    }

    const organization = await ctx.db.get(invitation.organizationId as Id<'organization'>)

    ensure(!!organization, 'Organization not found')

    const role = invitation.role

    ensureExistingRole(role)

    const inviter = await ctx.db.get(invitation.inviterId as Id<'user'>)

    ensure(!!inviter, 'Inviter not found')

    return {
      id: invitation._id,
      email: invitation.email,
      role,
      status: invitation.status,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      inviterEmail: inviter.email,
      inviterName: inviter.name,
      expiresAt: invitation.expiresAt,
    }
  },
})

export const isSlugAvailable = query({
  args: {
    slug: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, { slug }) => {
    const organization = await ctx.db.query('organization').withIndex('slug', q => q.eq('slug', slug)).first()
    return !organization
  },
})
