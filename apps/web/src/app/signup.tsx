import { createFileRoute, redirect } from '@tanstack/react-router'
import SignUpForm from '@/shared/auth/views/sign-up-form'

export const Route = createFileRoute('/signup')({
  beforeLoad: async ({ context }) => {
    if (context.userId) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignUpForm />
    </div>
  )
}
