import { ensure } from '@workspace/utils/ensure'
import { v } from 'convex/values'
import { getAuth } from '../shared/auth/auth'
import { generateSlug } from '../shared/auth/slug'
import { ensureUser } from '../shared/auth/validations'
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
    logo: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { name, logo }) => {
    await ensureUser(ctx)

    const { auth, headers } = await getAuth(ctx)

    const slug = await generateSlug(ctx, name)

    await auth.api.createOrganization({
      body: {
        name,
        slug,
        logo,
      },
      headers,
    })
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
    members: v.array(v.object({
      id: v.string(),
      name: v.string(),
      email: v.string(),
      role: v.string(),
    })),
    invites: v.array(v.object({
      id: v.string(),
      email: v.string(),
      role: v.union(v.literal('member'), v.literal('owner'), v.literal('admin')),
      status: v.string(),
      expiresAt: v.optional(v.union(v.null(), v.number())),
    })),

  }),
  handler: async (ctx, { slug }) => {
    await ensureUser(ctx)

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
      invites: invites.map(invite => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt.getTime(),
      })),
    }
  },
})
