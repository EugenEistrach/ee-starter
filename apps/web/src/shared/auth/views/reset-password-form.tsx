import { Link, useNavigate } from '@tanstack/react-router'
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

interface ResetPasswordFormProps extends React.ComponentProps<'div'> {
  token?: string
}

export default function ResetPasswordForm({
  className,
  token,
  ...props
}: ResetPasswordFormProps) {
  const navigate = useNavigate()

  const form = useAppForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error('Invalid or missing reset token')
        return
      }

      await authClient.resetPassword({
        newPassword: value.password,
        token,
      }, {
        onSuccess: () => {
          toast.success('Password reset successfully!')
          navigate({ to: '/login' })
        },
        onError: (error) => {
          toast.error(error.error.message || 'Failed to reset password')
        },
      })
    },
    validators: {
      onSubmit: z.object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
      }).refine(data => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      }),
    },
  })

  if (!token) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Request a new reset link
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>
            Choose a new password for your account
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
              <form.AppField name="password">
                {field => <field.PasswordField label="New Password" />}
              </form.AppField>

              <form.AppField name="confirmPassword">
                {field => <field.PasswordField label="Confirm Password" />}
              </form.AppField>

              <form.AppForm>
                <form.SubmitButton size="lg" fieldClassName="flex items-center w-full px-8">
                  Reset Password
                </form.SubmitButton>
              </form.AppForm>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
