# How to Send Emails

Template-based email system with automatic provider switching (Resend/local) and full audit trail.

## Creating a Template

Templates return an `EmailTemplate` object with subject, HTML, and text content:

```typescript
// features/email/templates/password-reset.ts
import type { EmailTemplate } from '../logic'

interface PasswordResetEmailParams {
  name: string
  resetUrl: string
}

export function createPasswordResetEmail({ name, resetUrl }: PasswordResetEmailParams): EmailTemplate {
  return {
    templateType: 'password-reset',
    subject: 'Reset your password',
    html: `
      <h1>Hi ${name}</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `,
    text: `Hi ${name}\n\nClick here to reset your password: ${resetUrl}`,
  }
}
```

## Sending an Email

Use the generic `send` internal action from `convex/emails.ts`:

```typescript
import { internal } from '../_generated/api'
import { createPasswordResetEmail } from '../features/email/templates/password-reset'

// In a mutation or action
const template = createPasswordResetEmail({
  name: user.name,
  resetUrl: `${process.env.SITE_URL}/reset-password?token=${token}`,
})

await ctx.scheduler.runAfter(0, internal.app.emails.send, {
  to: user.email,
  template,
  userId: user._id,
  metadata: { triggeredBy: 'password-reset-request' },
})
```

## Configuration

### Environment Variables

- `RESEND_API_KEY` - Resend API key (optional)
  - **With key:** Emails sent via Resend
  - **Without key:** Emails logged to console (local dev mode)
- `RESEND_FROM_EMAIL` - From email address (defaults to `onboarding@resend.dev`)

### Database Schema

Emails are tracked in the `emails` table with:
- `to`, `subject`, `html`, `text` - Email content
- `status` - `sent` or `failed`
- `provider` - `resend` or `local`
- `templateType` - Template identifier
- `userId` - Optional link to user
- `metadata` - Custom metadata (e.g., `triggeredBy`)
- `error` - Error message if failed
- `sentAt` - Timestamp when successfully sent

## Devtools Integration

The Email panel in TanStack Devtools shows:
- All sent emails with status (✓ sent / ✗ failed)
- Provider badge (Local / Resend)
- Email subject and recipient
- Error messages for failed emails
- Full HTML preview and plain text content
- Metadata (e.g., triggered by signup)

Access via: TanStack Devtools → Emails tab (dev mode only)

## Architecture

```
features/email/
├── logic.ts              # Core sendEmail function
├── schema.ts             # Email tracking table schema
└── templates/
    └── welcome.ts        # Welcome email template
```

## Features

- **Template-based emails** - Create reusable email templates
- **Automatic provider switching** - Uses Resend in production, console logging in local dev
- **Full audit trail** - All emails stored in database with metadata and status tracking
- **Devtools integration** - View sent emails in TanStack Devtools Email panel (dev only)
- **Error handling** - Failed emails are tracked with error messages
- **Better Auth integration** - Automatically sends welcome email on user signup
