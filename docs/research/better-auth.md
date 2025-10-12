# Better Auth Client - Frontend Communication Guide

Based on the documentation, here's how to use the Better Auth client on the frontend to communicate with your backend (excluding teams functionality):


## Organization Management

### Create Organization
```typescript
const { data, error } = await authClient.organization.create({
  name: "My Organization",
  slug: "my-org",
  logo: "https://example.com/logo.png", // optional
  metadata: { customField: "value" } // optional
})
```

### List User's Organizations
```typescript
// Using reactive hook (React/Vue/Svelte)
const { data: organizations } = authClient.useListOrganizations()

// Or direct call
const { data, error } = await authClient.organization.list({})
```

### Set Active Organization
```typescript
const { data, error } = await authClient.organization.setActive({
  organizationId: "org-id"
  // OR
  organizationSlug: "org-slug"
})
```

### Get Active Organization
```typescript
// Using reactive hook
const { data: activeOrg } = authClient.useActiveOrganization()
```

### Get Full Organization Details
```typescript
const { data, error } = await authClient.organization.getFullOrganization({
  organizationId: "org-id", // optional, defaults to active org
  membersLimit: 100 // optional
})
```

### Update Organization
```typescript
const { data, error } = await authClient.organization.update({
  data: {
    name: "Updated Name",
    slug: "updated-slug",
    logo: "new-logo.url",
    metadata: { customerId: "test" }
  }
})
```

### Delete Organization
```typescript
const { data, error } = await authClient.organization.delete({
  organizationId: "org-id"
})
```

### Check Slug Availability
```typescript
const { data, error } = await authClient.organization.checkSlug({
  slug: "my-org"
})
```

## Invitations

### Send Invitation
```typescript
const { data, error } = await authClient.organization.inviteMember({
  email: "example@gmail.com",
  role: "member", // or ["admin", "member"] for multiple roles
  organizationId: "org-id", // optional, defaults to active org
  resend: true // optional, resend if already invited
})
```

### Accept Invitation
```typescript
const { data, error } = await authClient.organization.acceptInvitation({
  invitationId: "invitation-id"
})
```

### Reject Invitation
```typescript
const { data, error } = await authClient.organization.rejectInvitation({
  invitationId: "invitation-id"
})
```

### Cancel Invitation
```typescript
const { data, error } = await authClient.organization.cancelInvitation({
  invitationId: "invitation-id"
})
```

### Get Invitation
```typescript
const { data, error } = await authClient.organization.getInvitation({
  id: "invitation-id"
})
```

### List Organization Invitations
```typescript
const { data, error } = await authClient.organization.listInvitations({
  organizationId: "organization-id" // optional
})
```

### List User's Invitations
```typescript
const invitations = await authClient.organization.listUserInvitations()
```

## Members

### List Members
```typescript
const { data, error } = await authClient.organization.listMembers({
  organizationId: "organization-id", // optional
  limit: 100, // optional
  offset: 0, // optional
  sortBy: "createdAt", // optional
  sortDirection: "desc", // optional
  filterField: "createdAt", // optional
  filterOperator: "eq", // optional
  filterValue: "value" // optional
})
```

### Remove Member
```typescript
const { data, error } = await authClient.organization.removeMember({
  memberIdOrEmail: "user@example.com",
  organizationId: "org-id" // optional
})
```

### Update Member Role
```typescript
const { data, error } = await authClient.organization.updateMemberRole({
  memberId: "member-id",
  role: "admin", // or ["admin", "member"]
  organizationId: "organization-id" // optional
})
```

### Get Active Member
```typescript
const { data, error } = await authClient.organization.getActiveMember({})
```

### Get Active Member Role
```typescript
const { data, error } = await authClient.organization.getActiveMemberRole({})
```

### Leave Organization
```typescript
const { data, error } = await authClient.organization.leave({
  organizationId: "organization-id"
})
```

## Access Control / Permissions

### Check Permission (Server Call)
```typescript
const canCreateProject = await authClient.organization.hasPermission({
  permissions: {
    project: ["create"]
  }
})

// Multiple resources
const canDo = await authClient.organization.hasPermission({
  permissions: {
    project: ["create"],
    organization: ["update"]
  }
})
```

### Check Role Permission (Client-side)
```typescript
const canDelete = authClient.organization.checkRolePermission({
  permissions: {
    organization: ["delete"]
  },
  role: "admin"
})
```

## Dynamic Roles (if enabled)

### Create Role
```typescript
const { data, error } = await authClient.organization.createRole({
  role: "my-unique-role",
  permission: {
    project: ["create", "update"]
  },
  organizationId: "organization-id" // optional
})
```

### List Roles
```typescript
const { data, error } = await authClient.organization.listRoles({
  organizationId: "organization-id" // optional
})
```

### Get Role
```typescript
const { data, error } = await authClient.organization.getRole({
  roleName: "my-role",
  // OR
  roleId: "role-id",
  organizationId: "organization-id" // optional
})
```

### Update Role
```typescript
const { data, error } = await authClient.organization.updateRole({
  roleName: "my-role",
  data: {
    permission: {
      project: ["create", "update", "delete"]
    }
  },
  organizationId: "organization-id" // optional
})
```

### Delete Role
```typescript
const { data, error } = await authClient.organization.deleteRole({
  roleName: "my-role",
  // OR
  roleId: "role-id",
  organizationId: "organization-id" // optional
})
```

## Key Points

- All methods return `{ data, error }` structure
- Most organization-specific operations default to the **active organization** if not specified
- Use reactive hooks (`useListOrganizations`, `useActiveOrganization`) for real-time updates in UI frameworks
- All operations require the user to be authenticated (session cookies are sent automatically)


Quick Permission Checks for UI
For simple role-based UI rendering without server calls:
// Get user's current role
const { data: memberRole } = await authClient.organization.getActiveMemberRole()

// Check locally what that role can do
const canCreateProject = authClient.organization.checkRolePermission({
  permissions: { project: ["create"] },
  role: memberRole?.role
})

// Render UI accordingly
{canCreateProject && <CreateProjectButton />}
