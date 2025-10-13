import { Link } from '@tanstack/react-router'
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
import { toast } from 'sonner'
import z from 'zod'
import { authClient } from '@/shared/auth/lib/auth-client'

export default function ForgotPasswordForm() {
  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      await authClient.forgetPassword({
        email: value.email,
        redirectTo: `${window.location.origin}/reset-password`,
      }, {
        onSuccess: () => {
          toast.success('Check your email for a password reset link')
        },
        onError: () => {
          // For security, always show success message even if email doesn't exist
          toast.success('Check your email for a password reset link')
        },
      })
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email('Invalid email address'),
      }),
    },
  })

  return (
    <CenteredLayout size="sm">
      <CenteredLayoutHeader>
        <CenteredLayoutTitle>Forgot Password?</CenteredLayoutTitle>
        <CenteredLayoutDescription>
          Enter your email and we'll send you a link to reset your password
        </CenteredLayoutDescription>
      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <form
          id="forgot-password-form"
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
                <form.AppField name="email">
                  {field => <field.TextField label="Email" placeholder="m@example.com" type="email" />}
                </form.AppField>
              </FieldGroup>
            </CardContent>
          </Card>
        </form>
      </CenteredLayoutContent>

      <CenteredLayoutFooter className="px-8">
        <form.AppForm>
          <form.SubmitButton
            form="forgot-password-form"
            size="lg"
            fieldClassName="flex items-center"
            description={(
              <>
                Remember your password?
                {' '}
                <Link to="/login">Sign in</Link>
              </>
            )}
          >
            Send Reset Link
          </form.SubmitButton>
        </form.AppForm>
      </CenteredLayoutFooter>
    </CenteredLayout>
  )
}
