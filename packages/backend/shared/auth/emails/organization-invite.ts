import type { EmailTemplate } from '../../email/logic'
import { createCard, createContent, createEmailLayout, createFooter, createHeader, p, primaryButton, strong } from '../../email/components'

interface OrganizationInviteEmailParams {
  inviterName: string
  organizationName: string
  inviteUrl: string
  role: string
}

export function createOrganizationInviteEmail({
  inviterName,
  organizationName,
  inviteUrl,
  role,
}: OrganizationInviteEmailParams): EmailTemplate {
  const html = createEmailLayout(
    createCard(
      createHeader(`You've been invited to ${organizationName}`)
      + createContent(
        p(`${strong(inviterName)} has invited you to join ${strong(organizationName)} as a ${strong(role)}.`)
        + p(`Click the button below to accept the invitation and get started.`)
        + primaryButton('Accept Invitation', inviteUrl),
      )
      + createFooter('If you didn\'t expect this invitation, you can safely ignore this email.'),
    ),
  )

  const text = `
You've been invited to ${organizationName}

${inviterName} has invited you to join ${organizationName} as a ${role}.

Accept the invitation by visiting:
${inviteUrl}

If you didn't expect this invitation, you can safely ignore this email.
  `.trim()

  return {
    templateType: 'organization-invite',
    subject: `You've been invited to ${organizationName}`,
    html,
    text,
  }
}
