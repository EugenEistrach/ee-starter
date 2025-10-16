import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useCurrentUserOrNull } from '../hooks/useCurrentUser'
import { useLogout } from '../hooks/useLogout'

export function LoggedInAs() {
  const user = useCurrentUserOrNull()
  const logout = useLogout()

  if (!user) {
    return null
  }

  return (
    <div className="absolute right-4 top-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex flex-col items-start gap-0 h-auto py-1">
            <span className="text-xs text-muted-foreground">Logged in as</span>
            <span className="text-sm">{user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={logout}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
