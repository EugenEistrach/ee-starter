import type { Role } from '@workspace/backend/shared/auth/permissions'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { FieldGroup } from '@workspace/ui/components/field'
import { useAppForm } from '@workspace/ui/components/form'
import { z } from 'zod'

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (data: { email: string, role: Role }) => Promise<void>
}

export function InviteMemberDialog({ open, onOpenChange, onInvite }: InviteMemberDialogProps) {
  const form = useAppForm({
    defaultValues: {
      email: '',
      role: 'member' as Role,
    },
    validators: {
      onSubmit: z.object({
        email: z.email('Invalid email address'),
        role: z.enum(['owner', 'admin', 'member']),
      }),
    },
    onSubmit: async ({ value }) => {
      await onInvite(value)
      form.reset()
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this organization
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="py-4">
            <FieldGroup>
              <form.AppField name="email">
                {field => (
                  <field.TextField
                    label="Email *"
                    placeholder="colleague@example.com"
                    type="email"
                  />
                )}
              </form.AppField>

              <form.AppField name="role">
                {field => (
                  <field.SelectField
                    label="Role *"
                    options={[
                      { value: 'member', label: 'Member' },
                      { value: 'admin', label: 'Admin' },
                      { value: 'owner', label: 'Owner' },
                    ]}
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </div>

          <DialogFooter>
            <form.Subscribe selector={state => ({ isSubmitting: state.isSubmitting })}>
              {({ isSubmitting }) => (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <form.AppForm>
                    <form.SubmitButton>Send Invitation</form.SubmitButton>
                  </form.AppForm>
                </>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
