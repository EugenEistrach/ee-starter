import { v } from 'convex/values'
import { ensureDebugActive } from '../shared/auth/validations'
import { sendEmail as sendEmailLogic } from '../shared/email/logic'
import { internalAction, internalMutation, query } from './_generated/server'

// Internal Actions (called by system triggers)

export const send = internalAction({
  args: {
    to: v.string(),
    template: v.object({
      templateType: v.string(),
      subject: v.string(),
      html: v.string(),
      text: v.string(),
    }),
    userId: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        triggeredBy: v.optional(v.string()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await sendEmailLogic(ctx, args)
  },
})

// Debug Queries (protected by ensureDebugActive)

export const getRecentEmails = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id('emails'),
      _creationTime: v.number(),
      to: v.string(),
      subject: v.string(),
      html: v.string(),
      text: v.string(),
      userId: v.optional(v.string()),
      templateType: v.string(),
      provider: v.union(v.literal('resend'), v.literal('local')),
      status: v.union(v.literal('sent'), v.literal('failed')),
      sentAt: v.optional(v.number()),
      error: v.optional(v.string()),
      providerResponse: v.optional(
        v.object({
          id: v.optional(v.string()),
          success: v.optional(v.boolean()),
          error: v.optional(v.string()),
        }),
      ),
      providerMessageId: v.optional(v.string()),
      metadata: v.optional(
        v.object({
          userAgent: v.optional(v.string()),
          ipAddress: v.optional(v.string()),
          triggeredBy: v.optional(v.string()),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    ensureDebugActive()
    const limit = args.limit ?? 50
    return ctx.db.query('emails').order('desc').take(limit)
  },
})

// Internal Mutations

export const trackEmailSend = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.string(),
    userId: v.optional(v.string()),
    templateType: v.string(),
    triggeredBy: v.optional(v.string()),
  },
  returns: v.id('emails'),
  handler: async (ctx, args) => {
    const hasApiKey = process.env.RESEND_API_KEY !== undefined && process.env.RESEND_API_KEY !== ''

    return ctx.db.insert('emails', {
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      userId: args.userId,
      templateType: args.templateType,
      provider: hasApiKey ? 'resend' : 'local',
      status: 'sent', // Will update if fails
      metadata: {
        triggeredBy: args.triggeredBy,
      },
    })
  },
})

export const markEmailSent = internalMutation({
  args: {
    emailId: v.id('emails'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.emailId, {
      status: 'sent',
      sentAt: Date.now(),
    })
  },
})

export const markEmailFailed = internalMutation({
  args: {
    emailId: v.id('emails'),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.emailId, {
      status: 'failed',
      error: args.error,
      sentAt: Date.now(),
    })
  },
})
