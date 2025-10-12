import { v } from 'convex/values'
import { getAuthApi } from '../shared/auth/auth'
import { generateSlug } from '../shared/auth/slug'
import { ensureUser } from '../shared/auth/validations'
import { mutation } from './_generated/server'

export const createOrganization = mutation({
  args: {
    name: v.string(),
    logo: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { name, logo }) => {
    await ensureUser(ctx)

    const api = await getAuthApi(ctx)

    const slug = await generateSlug(ctx, name)

    await api.createOrganization({
      body: {
        name,
        slug,
        logo,
      },
    })
  },
})
