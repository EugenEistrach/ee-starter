import { Link, useNavigate } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import { FieldGroup } from '@workspace/ui/components/field'
import { useAppForm } from '@workspace/ui/components/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { cn } from '@workspace/ui/lib/utils'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { authClient } from '@/shared/auth/lib/auth-client'

export default function SignInForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'password' | 'magic-link'>('password')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const passwordForm = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: '/o',
            })
            toast.success('Sign in successful')
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText)
          },
        },
      )
    },
    validators: {
      onSubmit: z.object({
        email: z.email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      }),
    },
  })

  const magicLinkForm = useAppForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.magicLink(
        {
          email: value.email,
          callbackURL: '/dashboard',
        },
        {
          onSuccess: () => {
            setMagicLinkSent(true)
            toast.success('Check your email for a sign-in link')
          },
          onError: () => {
            // For security, always show success even if email doesn't exist
            setMagicLinkSent(true)
            toast.success('Check your email for a sign-in link')
          },
        },
      )
    },
    validators: {
      onSubmit: z.object({
        email: z.email('Invalid email address'),
      }),
    },
  })

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="mt-0">
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  passwordForm.handleSubmit()
                }}
              >
                <FieldGroup>
                  <passwordForm.AppField name="email">
                    {field => <field.TextField label="Email" placeholder="m@example.com" type="email" />}
                  </passwordForm.AppField>

                  <passwordForm.AppField name="password">
                    {field => (
                      <field.PasswordField
                        label="Password"
                        secondaryAction={(
                          <Link
                            to="/forgot-password"
                            className="hover:text-foreground"
                          >
                            Forgot password?
                          </Link>
                        )}
                      />
                    )}
                  </passwordForm.AppField>

                  <passwordForm.AppForm>
                    <passwordForm.SubmitButton description={(
                      <>
                        Don&apos;t have an account?
                        {' '}
                        <Link to="/signup">Sign up</Link>
                      </>
                    )}
                    >
                      Login
                    </passwordForm.SubmitButton>
                  </passwordForm.AppForm>
                </FieldGroup>
              </form>
            </TabsContent>

            <TabsContent value="magic-link" className="mt-0">
              {magicLinkSent
                ? (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <MailCheck className="h-10 w-10" />
                        </EmptyMedia>
                        <EmptyTitle>Check your email</EmptyTitle>
                        <EmptyDescription>
                          We&apos;ve sent a sign-in link to your email.
                          Click the link to sign in.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )
                : (
                    <form
                      noValidate
                      onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        magicLinkForm.handleSubmit()
                      }}
                    >
                      <FieldGroup>
                        <magicLinkForm.AppField name="email">
                          {field => <field.TextField label="Email" placeholder="m@example.com" type="email" />}
                        </magicLinkForm.AppField>

                        <magicLinkForm.AppForm>
                          <magicLinkForm.SubmitButton description={(
                            <>
                              Don&apos;t have an account?
                              {' '}
                              <Link to="/signup">Sign up</Link>
                            </>
                          )}
                          >
                            Send Magic Link
                          </magicLinkForm.SubmitButton>
                        </magicLinkForm.AppForm>
                      </FieldGroup>
                    </form>
                  )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
