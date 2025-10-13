import type { QueryCtx } from '../../convex/_generated/server'
import { getAuth } from './auth'

/**
 * Generates a random alphanumeric suffix for slug collision resolution.
 */
function generateRandomSuffix(length: number): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789' // Exclude ambiguous chars
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Helper to check if slug exists in database
 */
async function slugExists(ctx: QueryCtx, slug: string): Promise<boolean> {
  const { auth } = await getAuth(ctx)
  const { status } = await auth.api.checkOrganizationSlug({
    body: { slug },

  })
  return status
}

/**
 * Generates a unique slug from an organization name.
 * - Sanitizes name to URL-safe format
 * - Checks against reserved route names
 * - Appends random suffix on collision
 */
export async function generateSlug(
  ctx: QueryCtx,
  name: string,
): Promise<string> {
  // 1. Sanitize name to base slug
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\da-z\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-|-$/g, '') // Trim hyphens from edges

  // 2. Ensure minimum length
  if (baseSlug.length < 2) {
    baseSlug = 'org' // Fallback for very short names
  }

  // 3. Truncate to max length (leave room for suffix)
  if (baseSlug.length > 45) {
    baseSlug = baseSlug.slice(0, 45).replace(/-$/, '')
  }

  // 4. Try base slug first (if not reserved/taken)

  const baseExists = await slugExists(ctx, baseSlug)
  if (!baseExists) {
    return baseSlug // Base slug is available!
  }

  // 5. Append random suffix until unique
  const maxAttempts = 10
  for (let i = 0; i < maxAttempts; i++) {
    const suffix = generateRandomSuffix(4) // e.g., 'x7k2'
    const slug = `${baseSlug}-${suffix}`

    const slugAlreadyExists = await slugExists(ctx, slug)
    if (!slugAlreadyExists) {
      return slug
    }
  }

  // 6. Fallback: Use UUID fragment (should never reach here)
  const uuid = crypto.randomUUID().split('-')[0]
  return `${baseSlug}-${uuid}`
}
