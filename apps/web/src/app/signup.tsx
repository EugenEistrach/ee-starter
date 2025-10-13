import { createFileRoute } from '@tanstack/react-router'
import { redirectToFirstOrganization } from '@/shared/auth/lib/organization'
import SignUpForm from '@/shared/auth/views/sign-up-form'

export const Route = createFileRoute('/signup')({
  beforeLoad: async ({ context }) => {
    if (context.userId) {
      await redirectToFirstOrganization(context.queryClient)
    }
  },
  component: SignUpPage,
})

function SignUpPage() {
  return <SignUpForm />
}
