import { createFileRoute } from '@tanstack/react-router'
import ForgotPasswordForm from '@/shared/auth/views/forgot-password-form'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
