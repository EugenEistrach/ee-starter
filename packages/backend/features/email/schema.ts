import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const emailSchema = {
  emails: defineTable({
    // Recipient info
    to: v.string(),

    // Email content
    subject: v.string(),
    html: v.string(),
    text: v.string(),

    // Tracking info
    userId: v.optional(v.string()), // Who triggered it (if available)
    templateType: v.string(), // 'welcome', 'password-reset', etc.
    provider: v.union(v.literal('resend'), v.literal('local')),

    // Status tracking
    status: v.union(v.literal('sent'), v.literal('failed')),
    sentAt: v.optional(v.number()), // Actual send timestamp
    error: v.optional(v.string()), // Error message if failed

    // Provider response (store everything for debugging)
    providerResponse: v.optional(
      v.object({
        id: v.optional(v.string()),
        success: v.optional(v.boolean()),
        error: v.optional(v.string()),
      }),
    ),
    providerMessageId: v.optional(v.string()), // External message ID

    // Metadata (flexible for future needs)
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
        triggeredBy: v.optional(v.string()), // 'signup', 'manual', etc.
      }),
    ),
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_template', ['templateType']),
}
