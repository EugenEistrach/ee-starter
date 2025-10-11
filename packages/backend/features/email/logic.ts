import type { ActionCtx } from '../../convex/_generated/server'
import { Resend } from '@convex-dev/resend'
import { components, internal } from '../../convex/_generated/api'

// Initialize Resend component
const resend = new Resend(components.resend, {
  testMode: process.env.RESEND_API_KEY === undefined || process.env.RESEND_API_KEY === '',
})

export interface EmailTemplate {
  templateType: string
  subject: string
  html: string
  text: string
}

interface SendEmailParams {
  to: string
  template: EmailTemplate
  userId?: string
  metadata?: {
    triggeredBy?: string
    [key: string]: any
  }
}

/**
 * Generic email sending function
 * Handles both production (Resend) and local (console) sending
 * Tracks all emails in the database for audit trail
 */
export async function sendEmail(
  ctx: ActionCtx,
  params: SendEmailParams,
): Promise<void> {
  const { to, template, userId, metadata } = params

  // Track email send attempt in database
  const emailId = await ctx.runMutation(internal.emails.trackEmailSend, {
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    userId,
    templateType: template.templateType,
    triggeredBy: metadata?.triggeredBy,
  })

  // Check if we have a Resend API key
  const hasApiKey = process.env.RESEND_API_KEY !== undefined && process.env.RESEND_API_KEY !== ''

  try {
    if (hasApiKey) {
      // Production: Send via Resend
      await resend.sendEmail(ctx, {
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })
    }

    // Mark as sent
    await ctx.runMutation(internal.emails.markEmailSent, {
      emailId,
    })
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Mark as failed and store error
    await ctx.runMutation(internal.emails.markEmailFailed, {
      emailId,
      error: errorMessage,
    })

    // Log error but don't throw - we don't want to block the calling function
    console.error(`Failed to send ${template.templateType} email:`, error)
  }
}
