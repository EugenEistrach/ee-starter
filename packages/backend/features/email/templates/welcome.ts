import type { EmailTemplate } from '../logic'
import { createCard, createContent, createEmailLayout, createFooter, createHeader, p, primaryButton, strong } from '../components'

interface WelcomeEmailParams {
  name: string
  email: string
  dashboardUrl: string
}

export function createWelcomeEmail({ name, email, dashboardUrl }: WelcomeEmailParams): EmailTemplate {
  const html = createEmailLayout(
    createCard(
      createHeader('Welcome to EE Starter')
      + createContent(
        p(`Hi ${strong(name)},`)
        + p('Thanks for signing up! We\'re excited to have you on board.')
        + p(`Your account has been created with the email: ${strong(email)}`)
        + primaryButton('Go to Dashboard', dashboardUrl),
      )
      + createFooter('If you didn\'t create this account, you can safely ignore this email.'),
    ),
  )

  const text = `
Welcome to EE Starter

Hi ${name},

Thanks for signing up! We're excited to have you on board.

Your account has been created with the email: ${email}

Get started by visiting your dashboard:
${dashboardUrl}

If you didn't create this account, you can safely ignore this email.
  `.trim()

  return {
    templateType: 'welcome',
    subject: 'Welcome to EE Starter!',
    html,
    text,
  }
}
