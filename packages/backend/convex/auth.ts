import type { GenericCtx } from '@convex-dev/better-auth'
import type { DataModel } from './_generated/dataModel'
import { createClient } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth'
import { components } from './_generated/api'
import { query } from './_generated/server'

export const authComponent = createClient<DataModel>(components.betterAuth)

export function createAuth(ctx: GenericCtx<DataModel>, { optionsOnly } = { optionsOnly: false }) {
  const urlToUse = process.env.SITE_URL!

  return betterAuth({
    logger: {
      disabled: optionsOnly,
    },
    baseUrl: urlToUse,
    baseURL: urlToUse,
    trustedOrigins: [urlToUse],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [convex()],
  })
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // @ts-expect-error this is a bug, will be resolved soon https://github.com/get-convex/better-auth/issues/95
    return authComponent.getAuthUser(ctx)
  },
})
