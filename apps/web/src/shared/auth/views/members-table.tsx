import type { Role } from '@workspace/backend/shared/auth/permissions'
import { Button } from '@workspace/ui/components/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { InviteMemberDialog } from '../components/invite-member-dialog'
import { MemberListItem } from '../components/member-list-item'

interface Member {
  id: string
  name: string
  email: string
  role: Role
}

interface Invitation {
  id: string
  email: string
  role: Role
  status: string
  expiresAt?: number | null
}

interface MembersTableProps {
  members: Member[]
  invitations: Invitation[]
  canManageMembers: boolean
  onInvite: (data: { email: string, role: Role }) => Promise<void>
  onChangeRole: (memberId: string, role: Role) => Promise<void>
  onRemoveMember: (memberId: string) => Promise<void>
  onCancelInvitation: (invitationId: string) => Promise<void>
}

export function MembersTable({
  members,
  invitations,
  canManageMembers,
  onInvite,
  onChangeRole,
  onRemoveMember,
  onCancelInvitation,
}: MembersTableProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Members & Invitations</h3>
          <p className="text-sm text-muted-foreground">
            Manage organization members and pending invitations
          </p>
        </div>
        {canManageMembers && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium text-muted-foreground">
            Active Members (
            {members.length}
            )
          </h4>
          <div className="divide-y">
            {members.map(member => (
              <MemberListItem
                key={member.id}
                type="member"
                name={member.name}
                email={member.email}
                role={member.role}
                canManage={canManageMembers}
                onChangeRole={(role) => {
                  onChangeRole(member.id, role)
                }}
                onRemove={() => onRemoveMember(member.id)}
              />
            ))}
          </div>
        </div>

        {invitations.length > 0 && (
          <>
            <div className="border-t" />
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium text-muted-foreground">
                Pending Invitations (
                {invitations.length}
                )
              </h4>
              <div className="divide-y">
                {invitations.map(invitation => (
                  <MemberListItem
                    key={invitation.id}
                    type="invite"
                    email={invitation.email}
                    role={invitation.role}
                    canManage={canManageMembers}
                    onRemove={() => onCancelInvitation(invitation.id)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={onInvite}
      />
    </div>
  )
}
