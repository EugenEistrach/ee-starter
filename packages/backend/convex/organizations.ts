import { ensure } from '@workspace/utils/ensure'
import { v } from 'convex/values'
import { getAuth } from '../shared/auth/auth'
import { Role } from '../shared/auth/permissions'
import { generateSlug } from '../shared/auth/slug'
import { ensureUser } from '../shared/auth/validations'
import { components } from './_generated/api'
import { mutation, query } from './_generated/server'

const OrganizationSchema = v.object({
  id: v.string(),
  name: v.string(),
  slug: v.string(),
  logo: v.optional(v.union(v.null(), v.string())),
})

export const create = mutation({
  args: {
    name: v.string(),
  },
  returns: v.object({
    id: v.string(),
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.union(v.null(), v.string())),
  }),
  handler: async (ctx, { name }) => {
    await ensureUser(ctx)

    const { auth, headers } = await getAuth(ctx)

    const slug = await generateSlug(ctx, name)

    const organization = await auth.api.createOrganization({
      body: {
        name,
        slug,
      },
      headers,
    })

    ensure(!!organization, 'Failed to create organization')

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    }
  },
})

export const listAll = query({
  args: {},
  returns: v.array(OrganizationSchema),
  handler: async (ctx) => {
    await ensureUser(ctx)

    const { auth, headers } = await getAuth(ctx)

    const organizations = await auth.api.listOrganizations({
      headers,
    })

    return organizations.map(organization => ({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    }))
  },
})

export const get = query({
  args: {
    slug: v.string(),
  },
  returns: v.object({
    id: v.string(),
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.union(v.null(), v.string())),
    currentRole: Role,
    members: v.array(v.object({
      id: v.string(),
      name: v.string(),
      email: v.string(),
      role: v.string(),
      userId: v.string(),
    })),
    invites: v.array(v.object({
      id: v.string(),
      email: v.string(),
      role: Role,
      status: v.string(),
      expiresAt: v.optional(v.union(v.null(), v.number())),
    })),

  }),
  handler: async (ctx, { slug }) => {
    const { user } = await ensureUser(ctx)

    const { auth, headers } = await getAuth(ctx)

    const organization = await auth.api.getFullOrganization({
      query: { organizationSlug: slug },
      headers,
    })

    ensure(!!organization, `Organization not found`)

    const invites = await auth.api.listInvitations({
      query: { organizationId: organization.id },
      headers,
    })

    const currentRole = await ctx.runQuery(components.betterAuth.organization.getRole, { organizationId: organization.id, userId: user._id })

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      currentRole,
      members: organization.members.map(member => ({
        id: member.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        userId: member.userId,
      })),
      invites: invites.map((invite) => {
        return ({
          id: invite.id,
          email: invite.email,
          role: invite.role,
          status: invite.status,
          expiresAt: invite.expiresAt as unknown as number,
        })
      }).filter(invite => invite.status === 'pending'),
    }
  },
})

export const getInvitation = query({
  args: {
    invitationId: v.string(),
  },
  returns: v.union(v.null(), v.object({
    id: v.string(),
    email: v.string(),
    role: v.string(),
    status: v.string(),
    organizationName: v.string(),
    organizationSlug: v.string(),
    inviterEmail: v.string(),
    inviterName: v.string(),
    expiresAt: v.number(),
  })),
  handler: async (ctx, { invitationId }) => {
    return ctx.runQuery(components.betterAuth.organization.getInvitation, { invitationId })
  },
})
