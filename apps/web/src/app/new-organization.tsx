import { useConvexMutation } from '@convex-dev/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from '@workspace/backend/convex/_generated/api'
import { toast } from 'sonner'
import { CreateOrganizationForm } from '@/features/organizations/components/create-organization-form'

export const Route = createFileRoute('/new-organization')({
  component: NewOrganizationPage,
})

function NewOrganizationPage() {
  const navigate = useNavigate()
  const createOrganization = useConvexMutation(api.organizations.create)

  const handleSubmit = async (data: { name: string, logo?: string }) => {
    try {
      const organization = await createOrganization(data)
      toast.success('Organization created successfully')
      navigate({ to: '/o/$organizationSlug', params: { organizationSlug: organization.slug } })
    }
    catch {
      toast.error('Failed to create organization')
    }
  }

  return <CreateOrganizationForm onSubmit={handleSubmit} />
}
