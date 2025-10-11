import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { FieldGroup } from '@workspace/ui/components/field'
import { useAppForm } from '@workspace/ui/components/form'
import { cn } from '@workspace/ui/lib/utils'
import { toast } from 'sonner'
import z from 'zod'
import { authClient } from '@/shared/auth/lib/auth-client'

export default function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
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
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password
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
          >
            <FieldGroup>
              <form.AppField name="email">
                {field => <field.TextField label="Email" placeholder="m@example.com" type="email" />}
              </form.AppField>

              <form.AppForm>
                <form.SubmitButton description={(
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
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
