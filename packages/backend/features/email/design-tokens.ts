/**
 * Email Design Tokens
 *
 * IMPORTANT: Keep these tokens in sync with globals.css design tokens.
 * When updating globals.css colors, update the corresponding hex values here.
 *
 * These tokens are converted to email-safe inline styles (hex colors, px units)
 * since email clients don't support CSS variables or OKLCH colors.
 */

/**
 * Color mapping from globals.css :root (light mode)
 *
 * Source OKLCH → Email Hex:
 * --background: oklch(1 0 0) → #FFFFFF
 * --foreground: oklch(0.145 0 0) → #252525
 * --card: oklch(1 0 0) → #FFFFFF
 * --card-foreground: oklch(0.145 0 0) → #252525
 * --primary: oklch(0.205 0 0) → #353535
 * --primary-foreground: oklch(0.985 0 0) → #FAFAFA
 * --secondary: oklch(0.97 0 0) → #F7F7F7
 * --muted: oklch(0.97 0 0) → #F7F7F7
 * --muted-foreground: oklch(0.556 0 0) → #8E8E8E
 * --border: oklch(0.922 0 0) → #EBEBEB
 * --destructive: oklch(0.577 0.245 27.325) → #DC5A45
 */
export const emailTheme = {
  colors: {
    background: '#FFFFFF',
    foreground: '#252525',
    card: '#FFFFFF',
    cardForeground: '#252525',
    primary: '#353535',
    primaryForeground: '#FAFAFA',
    secondary: '#F7F7F7',
    muted: '#F7F7F7',
    mutedForeground: '#8E8E8E',
    border: '#EBEBEB',
    destructive: '#DC5A45',
  },
  spacing: {
    'xs': '8px',
    'sm': '16px',
    'md': '24px',
    'lg': '32px',
    'xl': '40px',
    '2xl': '48px',
  },
  radius: {
    default: '10px',
    sm: '6px',
    md: '8px',
    lg: '10px',
    xl: '14px',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      'xs': '12px',
      'sm': '14px',
      'base': '16px',
      'lg': '18px',
      'xl': '20px',
      '2xl': '24px',
      '3xl': '28px',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
} as const

/**
 * Common email layout styles
 */
export const emailLayout = {
  container: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: emailTheme.colors.card,
    borderRadius: emailTheme.radius.lg,
    border: `1px solid ${emailTheme.colors.border}`,
  },
  padding: {
    xs: emailTheme.spacing.xs,
    sm: emailTheme.spacing.sm,
    md: emailTheme.spacing.md,
    lg: emailTheme.spacing.lg,
    xl: emailTheme.spacing.xl,
  },
} as const

/**
 * Button styles
 */
export const emailButton = {
  primary: {
    display: 'inline-block',
    padding: `12px 32px`,
    backgroundColor: emailTheme.colors.primary,
    color: emailTheme.colors.primaryForeground,
    textDecoration: 'none',
    borderRadius: emailTheme.radius.sm,
    fontSize: emailTheme.typography.fontSize.base,
    fontWeight: emailTheme.typography.fontWeight.medium,
    fontFamily: emailTheme.typography.fontFamily,
  },
  secondary: {
    display: 'inline-block',
    padding: `12px 32px`,
    backgroundColor: emailTheme.colors.secondary,
    color: emailTheme.colors.foreground,
    textDecoration: 'none',
    borderRadius: emailTheme.radius.sm,
    fontSize: emailTheme.typography.fontSize.base,
    fontWeight: emailTheme.typography.fontWeight.medium,
    fontFamily: emailTheme.typography.fontFamily,
  },
} as const

/**
 * Text styles
 */
export const emailText = {
  body: {
    margin: 0,
    fontSize: emailTheme.typography.fontSize.base,
    lineHeight: emailTheme.typography.lineHeight.normal,
    color: emailTheme.colors.foreground,
    fontFamily: emailTheme.typography.fontFamily,
  },
  muted: {
    margin: 0,
    fontSize: emailTheme.typography.fontSize.sm,
    lineHeight: emailTheme.typography.lineHeight.normal,
    color: emailTheme.colors.mutedForeground,
    fontFamily: emailTheme.typography.fontFamily,
  },
  heading: {
    margin: 0,
    fontSize: emailTheme.typography.fontSize['3xl'],
    fontWeight: emailTheme.typography.fontWeight.semibold,
    color: emailTheme.colors.foreground,
    fontFamily: emailTheme.typography.fontFamily,
  },
} as const

/**
 * Helper to convert style object to inline style string
 *
 * IMPORTANT: Encodes double quotes as HTML entities (&quot;) to prevent
 * breaking HTML style attributes (which use double quotes)
 */
export function styleToString(style: Record<string, string | number>): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
      // Encode double quotes as HTML entities to avoid breaking style attribute
      const cssValue = String(value).replace(/"/g, '&quot;')
      return `${cssKey}: ${cssValue}`
    })
    .join('; ')
}
