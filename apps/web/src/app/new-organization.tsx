import { useConvexMutation } from '@convex-dev/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { api } from '@workspace/backend/convex/_generated/api'
import { toast } from 'sonner'
import { CreateOrganizationForm } from '@/features/organizations/components/create-organization-form'
import { LoggedInAs } from '@/shared/auth/components/logged-in-as'

export const Route = createFileRoute('/new-organization')({
  beforeLoad: async ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: '/login' })
    }
  },
  component: NewOrganizationPage,
})

function NewOrganizationPage() {
  const navigate = useNavigate()
  const createOrganization = useConvexMutation(api.organizations.create)

  const handleSubmit = async (data: { name: string }) => {
    try {
      const organization = await createOrganization(data)
      toast.success('Organization created successfully')
      navigate({ to: '/o/$organizationSlug', params: { organizationSlug: organization.slug } })
    }
    catch {
      toast.error('Failed to create organization')
    }
  }

  return (
    <>
      <LoggedInAs />
      <CreateOrganizationForm onSubmit={handleSubmit} />
    </>
  )
}
