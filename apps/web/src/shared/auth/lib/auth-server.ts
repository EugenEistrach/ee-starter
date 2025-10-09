import { setupFetchClient } from '@convex-dev/better-auth/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { createAuth } from '@workspace/backend/convex/shared/auth'

// eslint-disable-next-line antfu/no-top-level-await
export const { fetchQuery, fetchMutation, fetchAction } = await setupFetchClient(
  createAuth,
  getCookie,
)
