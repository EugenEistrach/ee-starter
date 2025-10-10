import { createFileRoute, redirect } from '@tanstack/react-router'
import SignInForm from '@/shared/auth/views/sign-in-form'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    if (context.userId) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignInForm />
      </div>
    </div>
  )
}
