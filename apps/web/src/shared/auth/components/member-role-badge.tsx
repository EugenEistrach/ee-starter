import type { Role } from '@workspace/backend/shared/auth/permissions'
import { Badge } from '@workspace/ui/components/badge'

interface MemberRoleBadgeProps {
  role: Role
}

const roleConfig = {
  owner: { label: 'Owner', variant: 'default' as const },
  admin: { label: 'Admin', variant: 'secondary' as const },
  member: { label: 'Member', variant: 'outline' as const },
}

export function MemberRoleBadge({ role }: MemberRoleBadgeProps) {
  const config = roleConfig[role]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
