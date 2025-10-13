import type { Role } from '@workspace/backend/shared/auth/permissions'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Mail, MoreHorizontal } from 'lucide-react'
import { MemberRoleBadge } from './member-role-badge'

interface MemberListItemProps {
  type: 'member' | 'invite'
  name?: string
  email: string
  role: Role
  canManage: boolean
  onChangeRole?: (role: Role) => void
  onRemove?: () => void
  onResend?: () => void
}

export function MemberListItem({
  type,
  name,
  email,
  role,
  canManage,
  onChangeRole,
  onRemove,
  onResend,
}: MemberListItemProps) {
  const displayName = name || email

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {type === 'member'
          ? (
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )
          : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
        <div>
          <div className="font-medium">{displayName}</div>
          {name && <div className="text-sm text-muted-foreground">{email}</div>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <MemberRoleBadge role={role} />
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {type === 'member' && onChangeRole && (
                <>
                  <DropdownMenuItem onClick={() => onChangeRole('owner')}>
                    Change to Owner
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeRole('admin')}>
                    Change to Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeRole('member')}>
                    Change to Member
                  </DropdownMenuItem>
                </>
              )}
              {type === 'invite' && onResend && (
                <DropdownMenuItem onClick={onResend}>
                  Resend Invitation
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  {type === 'member' ? 'Remove Member' : 'Cancel Invitation'}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
