import { createFileRoute } from '@tanstack/react-router'
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
} from 'convex/react'
import { useState } from 'react'
import SignInForm from '@/shared/auth/views/sign-in-form'
import SignUpForm from '@/shared/auth/views/sign-up-form'
import UserMenu from '@/shared/auth/views/user-menu'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false)

  return (
    <>
      <Authenticated>
        <div>
          <h1>Dashboard</h1>
          <UserMenu />
        </div>
      </Authenticated>
      <Unauthenticated>
        {showSignIn
          ? (
              <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
            )
          : (
              <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
            )}
      </Unauthenticated>
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading>
    </>
  )
}
