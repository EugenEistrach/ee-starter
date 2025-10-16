import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useLocation, useNavigate } from '@tanstack/react-router'
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
import { AlertCircle, CheckCircle2, Mail, UserX, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { LoggedInAs } from '@/shared/auth/components/logged-in-as'
import { useCurrentUser } from '@/shared/auth/hooks/useCurrentUser'
import { useLogout } from '@/shared/auth/hooks/useLogout'
import { authClient } from '@/shared/auth/lib/auth-client'

export const Route = createFileRoute('/accept-invite/$invitationId')({
  component: AcceptInvitePage,
  loader: async ({ params, context }) => {
    const invitation = await context.queryClient.ensureQueryData(convexQuery(api.organizations.getInvitation, { invitationId: params.invitationId }))

    return {
      invitation,
      userId: context.userId,
    }
  },

})

function AcceptInvitePage() {
  const { invitation, userId } = Route.useLoaderData()

  return (
    <>
      <LoggedInAs />
      {!invitation
        ? (
            <InvitationNotFound userId={userId} />
          )
        : invitation.status === 'accepted'
          ? (
              <InvitationAlreadyAccepted invitation={invitation} />
            )
          : invitation.status === 'rejected'
            ? (
                <InvitationAlreadyRejected invitation={invitation} />
              )
            : !userId
                ? (
                    <LoginRequired invitation={invitation} />
                  )
                : (
                    <PendingInvitation invitation={invitation} />
                  )}
    </>
  )
}

type Invitation = NonNullable<Awaited<ReturnType<typeof Route.useLoaderData>>['invitation']>

function PendingInvitation({ invitation }: { invitation: Invitation }) {
  const currentUser = useCurrentUser()
  const navigate = useNavigate()

  const acceptMutation = useMutation({
    mutationFn: async () => {
      await authClient.organization.acceptInvitation({
        invitationId: invitation.id,
      })
    },
    onSuccess: () => {
      toast.success('Welcome to the team!')
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
      toast.success('Invitation declined')
      navigate({ to: '/new-organization' })
    },
    onError: () => {
      toast.error('Failed to decline invitation')
    },
  })

  const isProcessing = acceptMutation.isPending || rejectMutation.isPending
  const roleText = invitation.role === 'admin' ? 'an admin' : invitation.role === 'member' ? 'a member' : `a ${invitation.role}`

  // Check if logged in with wrong account (after all hooks)
  if (currentUser.email !== invitation.email) {
    return <WrongAccountLoggedIn currentEmail={currentUser.email} invitedEmail={invitation.email} invitation={invitation} />
  }

  return (
    <CenteredLayout size="default">
      <CenteredLayoutHeader>
        <Mail className="mb-2 h-8 w-8 text-muted-foreground" />
        <CenteredLayoutTitle>Join the team</CenteredLayoutTitle>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <Card className="w-full">
          <CardContent>
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{invitation.inviterName}</span>
                {' '}
                has invited you to join the
              </p>
              <p className="break-words text-4xl font-bold">{invitation.organizationName}</p>
              <p className="text-muted-foreground">
                organization as
                {' '}
                <span className="font-semibold text-foreground">{roleText}</span>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </CenteredLayoutContent>

      <CenteredLayoutFooter>
        <div className="flex w-full max-w-sm gap-3">
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

function WrongAccountLoggedIn({ invitedEmail, invitation }: { currentEmail: string, invitedEmail: string, invitation: Invitation }) {
  const location = useLocation()
  const logout = useLogout(location.pathname)

  return (
    <CenteredLayout size="default">
      <CenteredLayoutHeader>
        <UserX className="mb-2 h-8 w-8 text-muted-foreground" />
        <CenteredLayoutTitle>Almost there</CenteredLayoutTitle>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <Card className="w-full">
          <CardContent>
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground">
                This invitation was sent to
              </p>
              <p className="break-words text-2xl font-bold">{invitedEmail}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Please sign out and sign in with this account to join
                {' '}
                <span className="font-medium text-foreground">{invitation.organizationName}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </CenteredLayoutContent>

      <CenteredLayoutFooter>
        <Button onClick={logout} size="lg" className="w-full max-w-sm">
          Sign out & switch accounts
        </Button>
      </CenteredLayoutFooter>
    </CenteredLayout>
  )
}

function InvitationAlreadyAccepted({ invitation }: { invitation: Invitation }) {
  return (
    <CenteredLayout size="default">
      <CenteredLayoutHeader>
        <CheckCircle2 className="mb-2 h-8 w-8 text-success" />
        <CenteredLayoutTitle>You're all set</CenteredLayoutTitle>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <Card className="w-full">
          <CardContent>
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground">
                You've already accepted the invitation to
              </p>
              <p className="break-words text-3xl font-bold">{invitation.organizationName}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                If you're having trouble accessing the organization, contact
                {' '}
                <span className="font-medium text-foreground">{invitation.inviterName}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </CenteredLayoutContent>
    </CenteredLayout>
  )
}

function InvitationAlreadyRejected({ invitation }: { invitation: Invitation }) {
  return (
    <CenteredLayout size="default">
      <CenteredLayoutHeader>
        <XCircle className="mb-2 h-8 w-8 text-muted-foreground" />
        <CenteredLayoutTitle>Changed your mind?</CenteredLayoutTitle>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <Card className="w-full">
          <CardContent>
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground">
                You previously declined the invitation to
              </p>
              <p className="break-words text-3xl font-bold">{invitation.organizationName}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                If you've changed your mind, contact
                {' '}
                <span className="font-medium text-foreground">{invitation.inviterName}</span>
                {' '}
                for a new invitation
              </p>
            </div>
          </CardContent>
        </Card>
      </CenteredLayoutContent>
    </CenteredLayout>
  )
}

function LoginRequired({ invitation }: { invitation: Invitation }) {
  return (
    <CenteredLayout size="default">
      <CenteredLayoutHeader>
        <Mail className="mb-2 h-8 w-8 text-primary" />
        <CenteredLayoutTitle>One more step</CenteredLayoutTitle>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <Card className="w-full">
          <CardContent>
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{invitation.inviterName}</span>
                {' '}
                invited you to join
              </p>
              <p className="break-words text-3xl font-bold">{invitation.organizationName}</p>
              <p className="mt-4 text-muted-foreground">
                Please sign in as
                {' '}
                <span className="font-medium text-foreground">{invitation.email}</span>
                {' '}
                to accept this invitation
              </p>
            </div>
          </CardContent>
        </Card>
      </CenteredLayoutContent>

      <CenteredLayoutFooter>
        <Button asChild size="lg" className="w-full max-w-sm">
          <Link to="/login">
            Sign in
          </Link>
        </Button>
      </CenteredLayoutFooter>
    </CenteredLayout>
  )
}

function InvitationNotFound({ userId }: { userId: string | undefined }) {
  const logout = useLogout()

  return (
    <CenteredLayout size="default">
      <CenteredLayoutHeader>
        <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
        <CenteredLayoutTitle>Hmm, something's not right</CenteredLayoutTitle>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <Card className="w-full">
          <CardContent>
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                We couldn't find this invitation. It may have expired, been revoked, or already been used.
              </p>
              <p className="text-sm text-muted-foreground">
                {userId
                  ? 'Try signing in with the account that received the invitation, or ask for a new invitation link.'
                  : 'If you have an account, try signing in first and then opening the invitation link again.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </CenteredLayoutContent>

      {userId && (
        <CenteredLayoutFooter>
          <Button onClick={logout} variant="outline" size="lg" className="w-full max-w-sm">
            Sign out & try another account
          </Button>
        </CenteredLayoutFooter>
      )}
    </CenteredLayout>
  )
}
