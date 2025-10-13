import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import ResetPasswordForm from '@/shared/auth/views/reset-password-form'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
  validateSearch: z.object({
    token: z.string().optional(),
  }),
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  )
}
