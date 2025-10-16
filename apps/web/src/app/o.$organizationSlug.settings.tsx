import type { Role } from '@workspace/backend/shared/auth/permissions'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from '@workspace/backend/convex/_generated/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { FieldGroup } from '@workspace/ui/components/field'
import { useAppForm } from '@workspace/ui/components/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useOrganization } from '@/shared/auth/hooks/useOrganizationSlug'
import { authClient } from '@/shared/auth/lib/auth-client'
import { MembersTable } from '@/shared/auth/views/members-table'

export const Route = createFileRoute('/o/$organizationSlug/settings')({
  component: SettingsPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(convexQuery(api.users.getCurrentUser, {}))
  },
})

function SettingsPage() {
  const organization = useOrganization()
  const navigate = useNavigate()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)

  const { data: allOrganizations } = useSuspenseQuery(
    convexQuery(api.organizations.listAll, {}),
  )

  const form = useAppForm({
    defaultValues: {
      name: organization.name,
      logo: organization.logo ?? '',
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, 'Organization name is required'),
        logo: z.url('Invalid URL').or(z.literal('')),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.organization.update({
        data: {
          name: value.name.trim(),
          logo: value.logo.trim() || undefined,
        },
      })
      toast.success('Organization updated successfully')
    },
  })

  const handleInviteMember = async (data: { email: string, role: Role }) => {
    try {
      const result = await authClient.organization.inviteMember(data)

      if (result.error) {
        toast.error(result.error.message)
        return
      }

      toast.success('Invitation sent successfully')
    }
    catch (error) {
      console.error(error)
      toast.error('Failed to send invitation')
      throw error
    }
  }

  const handleChangeRole = async (memberId: string, role: Role) => {
    try {
      await authClient.organization.updateMemberRole({ memberId, role })
      toast.success('Member role updated successfully')
    }
    catch (error) {
      toast.error('Failed to update member role')
      throw error
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await authClient.organization.removeMember({ memberIdOrEmail: memberId })
      toast.success('Member removed successfully')
    }
    catch (error) {
      toast.error('Failed to remove member')
      throw error
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await authClient.organization.cancelInvitation({ invitationId })
      toast.success('Invitation cancelled successfully')
    }
    catch (error) {
      toast.error('Failed to cancel invitation')
      throw error
    }
  }

  const handleDeleteOrganization = async () => {
    try {
      await authClient.organization.delete({ organizationId: organization.id })
      toast.success('Organization deleted successfully')

      const remaining = allOrganizations.filter(org => org.id !== organization.id)
      if (remaining.length > 0) {
        navigate({ to: '/o/$organizationSlug', params: { organizationSlug: remaining[0].slug } })
      }
      else {
        navigate({ to: '/new-organization' })
      }
    }
    catch {
      toast.error('Failed to delete organization')
    }
  }

  const handleLeaveOrganization = async () => {
    try {
      const result = await authClient.organization.leave({ organizationId: organization.id })

      if (result.error) {
        toast.error(result.error.message)
        return
      }

      toast.success('Left organization successfully')

      const remaining = allOrganizations.filter(org => org.id !== organization.id)
      if (remaining.length > 0) {
        navigate({ to: '/o/$organizationSlug', params: { organizationSlug: remaining[0].slug } })
      }
      else {
        navigate({ to: '/new-organization' })
      }
    }
    catch {
      toast.error('Failed to leave organization')
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization settings and members
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Update your organization name and logo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  form.handleSubmit()
                }}
                className="space-y-4"
              >
                <FieldGroup>
                  <form.AppField name="name">
                    {field => (
                      <field.TextField
                        label="Organization Name"
                        placeholder="Acme Inc."
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="logo">
                    {field => (
                      <field.TextField
                        label="Logo URL"
                        placeholder="https://example.com/logo.png"
                        type="text"
                      />
                    )}
                  </form.AppField>

                  <form.AppForm>
                    <form.SubmitButton>Update Organization</form.SubmitButton>
                  </form.AppForm>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="pt-6">
              <MembersTable
                members={organization.members}
                invitations={organization.invites}
                canManageMembers={true}
                onInvite={handleInviteMember}
                onChangeRole={handleChangeRole}
                onRemoveMember={handleRemoveMember}
                onCancelInvitation={handleCancelInvitation}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Organization</CardTitle>
              <CardDescription>
                Remove yourself from this organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setLeaveDialogOpen(true)}>
                Leave Organization
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle>Delete Organization</CardTitle>
              <CardDescription>
                Permanently delete this organization and all its data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                Delete Organization
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organization
              and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrganization} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave organization?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer have access to this organization and its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveOrganization}>
              Leave Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
