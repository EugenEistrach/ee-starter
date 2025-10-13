import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { api } from '@workspace/backend/convex/_generated/api'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
  CenteredLayout,
  CenteredLayoutContent,
  CenteredLayoutFooter,
  CenteredLayoutHeader,
  CenteredLayoutTitle,
} from '@workspace/ui/components/centered-layout'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import z from 'zod'
import { MemberRoleBadge } from '@/features/organizations/components/member-role-badge'
import { useCurrentUser } from '@/shared/auth/hooks/useCurrentUser'
import { useLogout } from '@/shared/auth/hooks/useLogout'
import { authClient } from '@/shared/auth/lib/auth-client'
import { fetchQuery } from '@/shared/auth/lib/auth-server'

const fetchInvitation = createServerFn().inputValidator(z.object({ invitationId: z.string() })).handler(async ({ data }) => {
  return await fetchQuery(api.organizations.getInvitation, { invitationId: data.invitationId })
})

export const Route = createFileRoute('/accept-invite/$invitationId')({
  component: AcceptInvitePage,
  errorComponent: AcceptInviteError,
  notFoundComponent: AcceptInviteError,
  loader: async ({ params, context, location }) => {
    if (!context.userId) {
      throw redirect({ to: '/login', search: { redirectTo: encodeURIComponent(location.href) } })
    }

    return await fetchInvitation({ data: { invitationId: params.invitationId } })
  },

})

function AcceptInvitePage() {
  const navigate = useNavigate()

  const invitation = Route.useLoaderData()

  const acceptMutation = useMutation({
    mutationFn: async () => {
      await authClient.organization.acceptInvitation({
        invitationId: invitation.id,
      })
    },
    onSuccess: () => {
      toast.success('Invitation accepted successfully')
      navigate({
        to: '/o/$organizationSlug',
        params: { organizationSlug: invitation.organizationSlug },
      })
    },
    onError: () => {
      toast.error('Failed to accept invitation')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async () => {
      await authClient.organization.rejectInvitation({
        invitationId: invitation.id,
      })
    },
    onSuccess: () => {
      toast.success('Invitation rejected')
      navigate({ to: '/new-organization' })
    },
    onError: () => {
      toast.error('Failed to reject invitation')
    },
  })

  const isProcessing = acceptMutation.isPending || rejectMutation.isPending

  return (
    <CenteredLayout size="default">
      <CenteredLayoutHeader>
        <CenteredLayoutTitle>You've been invited!</CenteredLayoutTitle>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <Card className="w-full">
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="text-lg font-semibold">{invitation.organizationName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <div className="mt-1">
                  <MemberRoleBadge role={invitation.role} />
                </div>
              </div>

              {invitation.inviterEmail && (
                <div>
                  <p className="text-sm text-muted-foreground">Invited by</p>
                  <p className="text-sm">{invitation.inviterEmail}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </CenteredLayoutContent>

      <CenteredLayoutFooter className="px-8">
        <div className="flex w-full gap-3">
          <Button
            onClick={() => acceptMutation.mutate()}
            disabled={isProcessing}
            size="lg"
            className="flex-1"
          >
            {acceptMutation.isPending ? 'Joining...' : 'Accept & Join'}
          </Button>
          <Button
            variant="outline"
            onClick={() => rejectMutation.mutate()}
            disabled={isProcessing}
            size="lg"
            className="flex-1"
          >
            {rejectMutation.isPending ? 'Declining...' : 'Decline'}
          </Button>
        </div>
      </CenteredLayoutFooter>
    </CenteredLayout>
  )
}

function AcceptInviteError() {
  const user = useCurrentUser()
  const logout = useLogout()

  return (
    <CenteredLayout size="default">
      <CenteredLayoutHeader>
        <CenteredLayoutTitle>Unable to access invitation</CenteredLayoutTitle>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <Card className="w-full">
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertCircle className="h-10 w-10" />
                </EmptyMedia>
                <EmptyTitle>We couldn't access this invitation</EmptyTitle>
                <EmptyDescription>
                  This invitation link may have expired, already been used, or is meant for a different account. Try logging in with the account that received the invitation, or contact the person who invited you.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </CenteredLayoutContent>

      <CenteredLayoutFooter className="px-8">
        <div className="flex w-full flex-col gap-3">
          {user && (
            <Button onClick={logout} size="lg" className="w-full">
              Log out & try another account
            </Button>
          )}
          <Button asChild variant="link" size="lg" className="w-full">
            <Link to={user ? '/o' : '/login'}>
              {user ? 'Back to your organizations' : 'Go to login'}
            </Link>
          </Button>
        </div>
      </CenteredLayoutFooter>
    </CenteredLayout>
  )
}
