import { Card, CardContent } from '@workspace/ui/components/card'
import {
  CenteredLayout,
  CenteredLayoutContent,
  CenteredLayoutDescription,
  CenteredLayoutFooter,
  CenteredLayoutHeader,
  CenteredLayoutTitle,
} from '@workspace/ui/components/centered-layout'
import { FieldGroup } from '@workspace/ui/components/field'
import { useAppForm } from '@workspace/ui/components/form'
import { z } from 'zod'

interface CreateOrganizationFormProps {
  onSubmit: (data: { name: string }) => Promise<void>
}

export function CreateOrganizationForm({ onSubmit }: CreateOrganizationFormProps) {
  const form = useAppForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, 'Organization name is required'),
      }),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name.trim(),
      })
    },
  })

  return (
    <CenteredLayout>
      <CenteredLayoutHeader>
        <CenteredLayoutTitle>Create a new organization</CenteredLayoutTitle>
        <CenteredLayoutDescription>
          Organizations are shared spaces where you can manage your team and projects.
        </CenteredLayoutDescription>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <form
          id="create-org-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <Card className="w-full">
            <CardContent>
              <FieldGroup>
                <form.AppField name="name">
                  {field => (
                    <field.TextField
                      label="Organization Name"
                      placeholder="Acme Inc."
                    />
                  )}
                </form.AppField>
              </FieldGroup>
            </CardContent>
          </Card>
        </form>
      </CenteredLayoutContent>

      <CenteredLayoutFooter>
        <form.AppForm>
          <form.SubmitButton form="create-org-form" size="lg" className="w-full max-w-sm" fieldClassName="flex items-center">
            Create Organization
          </form.SubmitButton>
        </form.AppForm>
      </CenteredLayoutFooter>
    </CenteredLayout>
  )
}
