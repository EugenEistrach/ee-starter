# Organizations Feature

Organization management UI with multi-tenancy support.

## Components

**Presentational (`components/`):**
- `organization-card.tsx` - Organization card for switcher dropdown
- `member-list-item.tsx` - Member/invitation row with actions
- `member-role-badge.tsx` - Visual role indicator
- `create-organization-form.tsx` - Form for creating organizations
- `invite-member-dialog.tsx` - Modal for inviting members

**Smart (`views/`):**
- `organization-switcher.tsx` - Dropdown showing all user's organizations
- `members-table.tsx` - Combined members + pending invitations table

## Data Flow

- Organization context from URL slug via `useOrganization()` hook
- Mutations via `authClient.organization.*` methods
- Permissions checked client-side for UI, enforced server-side
