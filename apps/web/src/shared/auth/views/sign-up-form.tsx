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

export default function SignUpForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
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
              to: '/dashboard',
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
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create account</CardTitle>
          <CardDescription>
            Sign up with your email and password
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
              <form.AppField name="name">
                {field => <field.TextField label="Name" placeholder="John Doe" />}
              </form.AppField>

              <form.AppField name="email">
                {field => <field.TextField label="Email" placeholder="m@example.com" type="email" />}
              </form.AppField>

              <form.AppField name="password">
                {field => <field.PasswordField label="Password" />}
              </form.AppField>

              <form.AppForm>
                <form.SubmitButton description={(
                  <>
                    Already have an account?
                    <Link to="/login">Sign in</Link>
                  </>
                )}
                >
                  Sign up
                </form.SubmitButton>
              </form.AppForm>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
