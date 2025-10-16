import { createFileRoute } from '@tanstack/react-router'
import { redirectToFirstOrganization } from '@/shared/auth/lib/organization'
import SignInForm from '@/shared/auth/views/sign-in-form'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    if (context.userId) {
      await redirectToFirstOrganization(context.queryClient)
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <SignInForm />
  )
}
