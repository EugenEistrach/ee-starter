import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'

export function useLogout(redirectTo?: string) {
  const { queryClient, convexClient } = useRouteContext({ from: '__root__' })
  const navigate = useNavigate()

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await navigate({
            to: '/login',
            search: redirectTo ? { redirectTo } : undefined,
          })
          queryClient.clear()
          convexClient.clearAuth()
          window.location.reload()
        },
      },

    })
  }

  return logout
}
