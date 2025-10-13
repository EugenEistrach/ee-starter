import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'

export function useLogout() {
  const { queryClient, convexClient } = useRouteContext({ from: '__root__' })
  const navigate = useNavigate()

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await navigate({ to: '/login' })
          queryClient.clear()
          convexClient.clearAuth()
          window.location.reload()
        },
      },

    })
  }

  return logout
}
