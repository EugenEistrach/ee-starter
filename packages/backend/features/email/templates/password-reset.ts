import type { EmailTemplate } from '../logic'
import { createCard, createContent, createEmailLayout, createFooter, createHeader, p, primaryButton, strong } from '../components'

interface PasswordResetEmailParams {
  name: string
  resetUrl: string
}

export function createPasswordResetEmail({ name, resetUrl }: PasswordResetEmailParams): EmailTemplate {
  const html = createEmailLayout(
    createCard(
      createHeader('Reset Your Password')
      + createContent(
        p(`Hi ${strong(name)},`)
        + p('We received a request to reset your password. Click the button below to choose a new password:')
        + primaryButton('Reset Password', resetUrl)
        + p('This link will expire in 1 hour for security reasons.', { muted: true })
        + p('If you didn\'t request a password reset, you can safely ignore this email. Your password will remain unchanged.', { muted: true }),
      )
      + createFooter('For security, never share this email with anyone.'),
    ),
  )

  const text = `
Reset Your Password

Hi ${name},

We received a request to reset your password. Click the link below to choose a new password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

For security, never share this email with anyone.
  `.trim()

  return {
    templateType: 'password-reset',
    subject: 'Reset Your Password',
    html,
    text,
  }
}
