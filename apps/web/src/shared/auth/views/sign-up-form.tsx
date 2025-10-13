import { Link, useNavigate } from '@tanstack/react-router'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
  CenteredLayout,
  CenteredLayoutContent,
  CenteredLayoutFooter,
  CenteredLayoutHeader,
  CenteredLayoutTitle,
} from '@workspace/ui/components/centered-layout'
import { FieldGroup } from '@workspace/ui/components/field'
import { useAppForm } from '@workspace/ui/components/form'
import { toast } from 'sonner'
import z from 'zod'
import { authClient } from '@/shared/auth/lib/auth-client'

export default function SignUpForm() {
  const navigate = useNavigate()

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: '/o',
            })
            toast.success('Sign up successful')
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText)
          },
        },
      )
    },

    validators: {
      onSubmit: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      }),
    },
  })

  return (
    <CenteredLayout size="sm">
      <CenteredLayoutHeader>
        <CenteredLayoutTitle>Create your account</CenteredLayoutTitle>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <form
          id="signup-form"
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
                  {field => <field.TextField label="Name" placeholder="John Doe" />}
                </form.AppField>

                <form.AppField name="email">
                  {field => <field.TextField label="Email" placeholder="m@example.com" type="email" />}
                </form.AppField>

                <form.AppField name="password">
                  {field => <field.PasswordField label="Password" />}
                </form.AppField>
              </FieldGroup>
            </CardContent>
          </Card>
        </form>
      </CenteredLayoutContent>

      <CenteredLayoutFooter className="px-8">
        <form.AppForm>
          <form.SubmitButton
            form="signup-form"
            size="lg"
            fieldClassName="flex items-center"
            description={(
              <>
                Already have an account?
                {' '}
                <Link to="/login">Sign in</Link>
              </>
            )}
          >
            Sign up
          </form.SubmitButton>
        </form.AppForm>
      </CenteredLayoutFooter>
    </CenteredLayout>
  )
}
