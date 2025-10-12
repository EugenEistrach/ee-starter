import { emailButton, emailLayout, emailText, emailTheme, styleToString } from './design-tokens'

/**
 * Email layout wrapper with proper table structure for email clients
 */
export function createEmailLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
      </head>
      <body style="${styleToString({
        margin: '0',
        padding: '0',
        fontFamily: emailTheme.typography.fontFamily,
        backgroundColor: emailTheme.colors.secondary,
      })}">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${emailTheme.colors.secondary}; padding: ${emailTheme.spacing['2xl']} ${emailTheme.spacing.md};">
          <tr>
            <td align="center">
              ${content}
            </td>
          </tr>
        </table>
      </body>
    </html>
  `.trim()
}

/**
 * Email card container
 */
export function createCard(content: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="${styleToString({
      maxWidth: emailLayout.container.maxWidth,
      backgroundColor: emailLayout.card.backgroundColor,
      borderRadius: emailLayout.card.borderRadius,
      border: emailLayout.card.border,
      overflow: 'hidden',
    })}">
      ${content}
    </table>
  `.trim()
}

/**
 * Email header section
 */
export function createHeader(title: string): string {
  return `
    <tr>
      <td style="padding: ${emailTheme.spacing['2xl']} ${emailTheme.spacing.lg} ${emailTheme.spacing.lg}; text-align: center; border-bottom: 1px solid ${emailTheme.colors.border};">
        <h1 style="${styleToString(emailText.heading)}">
          ${title}
        </h1>
      </td>
    </tr>
  `.trim()
}

/**
 * Email content section
 */
export function createContent(content: string): string {
  return `
    <tr>
      <td style="padding: ${emailTheme.spacing.lg};">
        ${content}
      </td>
    </tr>
  `.trim()
}

/**
 * Email footer section
 */
export function createFooter(text: string): string {
  return `
    <tr>
      <td style="padding: ${emailTheme.spacing.lg}; background-color: ${emailTheme.colors.secondary}; border-top: 1px solid ${emailTheme.colors.border};">
        <p style="${styleToString({
          ...emailText.muted,
          textAlign: 'center',
        })}">
          ${text}
        </p>
      </td>
    </tr>
  `.trim()
}

/**
 * Paragraph with proper spacing
 */
export function p(text: string, options?: { muted?: boolean }): string {
  const style = options?.muted ? emailText.muted : emailText.body
  return `
    <p style="${styleToString({
      ...style,
      marginBottom: emailTheme.spacing.md,
    })}">
      ${text}
    </p>
  `.trim()
}

/**
 * Primary button with link
 */
export function primaryButton(text: string, href: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: ${emailTheme.spacing.md} 0;">
          <a href="${href}" style="${styleToString(emailButton.primary)}">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `.trim()
}

/**
 * Bold text
 */
export function strong(text: string): string {
  return `<strong style="font-weight: ${emailTheme.typography.fontWeight.semibold};">${text}</strong>`
}
