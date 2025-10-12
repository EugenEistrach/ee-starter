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
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignUpForm />
      </div>
    </div>
  )
}
