import type { EmailTemplate } from '../../email/logic'
import { createCard, createContent, createEmailLayout, createFooter, createHeader, p, primaryButton, strong } from '../../email/components'

interface MagicLinkEmailParams {
  name?: string
  magicLink: string
}

export function createMagicLinkEmail({ name, magicLink }: MagicLinkEmailParams): EmailTemplate {
  const greeting = name !== undefined && name !== '' ? `Hi ${strong(name)},` : 'Hi there,'

  const html = createEmailLayout(
    createCard(
      createHeader('Sign In to Your Account')
      + createContent(
        p(greeting)
        + p('Click the button below to sign in to your account:')
        + primaryButton('Sign In', magicLink)
        + p('This link will expire in 5 minutes for security reasons.', { muted: true })
        + p('If you didn\'t request this sign-in link, you can safely ignore this email.', { muted: true }),
      )
      + createFooter('For security, never share this email with anyone.'),
    ),
  )

  const text = `
Sign In to Your Account

${name !== undefined && name !== '' ? `Hi ${name},` : 'Hi there,'}

Click the link below to sign in to your account:
${magicLink}

This link will expire in 5 minutes for security reasons.

If you didn't request this sign-in link, you can safely ignore this email.

For security, never share this email with anyone.
  `.trim()

  return {
    templateType: 'magic-link',
    subject: 'Sign In to Your Account',
    html,
    text,
  }
}
