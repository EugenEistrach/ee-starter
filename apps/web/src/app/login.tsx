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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignInForm />
    </div>
  )
}
