import type { LinkProps } from '@tanstack/react-router'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
  CenteredLayout,
  CenteredLayoutContent,
  CenteredLayoutFooter,
  CenteredLayoutHeader,
  CenteredLayoutTitle,
} from '@workspace/ui/components/centered-layout'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import { FieldGroup } from '@workspace/ui/components/field'
import { useAppForm } from '@workspace/ui/components/form'
import { Separator } from '@workspace/ui/components/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { authClient } from '@/shared/auth/lib/auth-client'

export default function SignInForm() {
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
          callbackURL: '/o' satisfies LinkProps['to'],
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
    <CenteredLayout size="sm">
      <CenteredLayoutHeader>
        <CenteredLayoutTitle>Welcome back</CenteredLayoutTitle>

      </CenteredLayoutHeader>

      <CenteredLayoutContent>
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="mt-0">
            <form
              id="signin-password-form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                passwordForm.handleSubmit()
              }}
            >
              <Card className="w-full">
                <CardContent>
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
                  </FieldGroup>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="magic-link" className="mt-0">
            {magicLinkSent
              ? (
                  <Card className="w-full">
                    <CardContent>
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
                    </CardContent>
                  </Card>
                )
              : (
                  <form
                    id="signin-magiclink-form"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      magicLinkForm.handleSubmit()
                    }}
                  >
                    <Card className="w-full">
                      <CardContent>
                        <FieldGroup>
                          <magicLinkForm.AppField name="email">
                            {field => <field.TextField label="Email" placeholder="m@example.com" type="email" />}
                          </magicLinkForm.AppField>
                        </FieldGroup>
                      </CardContent>
                    </Card>
                  </form>
                )}
          </TabsContent>
        </Tabs>
      </CenteredLayoutContent>

      <CenteredLayoutFooter className="px-8 flex flex-col gap-4">
        {activeTab === 'password'
          ? (
              <passwordForm.AppForm>
                <passwordForm.SubmitButton
                  form="signin-password-form"
                  size="lg"
                  fieldClassName="flex items-center"
                  description={(
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
            )
          : magicLinkSent
            ? null
            : (
                <magicLinkForm.AppForm>
                  <magicLinkForm.SubmitButton
                    form="signin-magiclink-form"
                    size="lg"
                    fieldClassName="flex items-center"
                    description={(
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
              )}

        {!magicLinkSent && (
          <>
            <div className="flex w-full items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={async () => {
                await authClient.signIn.anonymous(
                  {},
                  {
                    onSuccess: () => {
                      navigate({ to: '/o' })
                      toast.success('Signed in as guest')
                    },
                    onError: (error) => {
                      toast.error(error.error.message || 'Failed to sign in as guest')
                    },
                  },
                )
              }}
            >
              Continue as Guest
            </Button>
          </>
        )}
      </CenteredLayoutFooter>
    </CenteredLayout>
  )
}
