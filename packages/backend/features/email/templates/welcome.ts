import type { EmailTemplate } from '../logic'

interface WelcomeEmailParams {
  name: string
  email: string
  dashboardUrl: string
}

export function createWelcomeEmail({ name, email, dashboardUrl }: WelcomeEmailParams): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td style="padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #111827;">
                      Welcome to EE Starter
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #374151;">
                      Hi <strong>${name}</strong>,
                    </p>

                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #374151;">
                      Thanks for signing up! We're excited to have you on board.
                    </p>

                    <p style="margin: 0 0 32px; font-size: 16px; line-height: 24px; color: #374151;">
                      Your account has been created with the email: <strong>${email}</strong>
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                            Go to Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
                      If you didn't create this account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `.trim()

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
