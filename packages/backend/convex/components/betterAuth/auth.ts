import { getStaticAuth } from '@convex-dev/better-auth'
import { createAuth } from '../../../shared/auth/auth'

export const auth = getStaticAuth(createAuth)
