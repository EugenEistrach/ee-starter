import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@workspace/backend/convex/_generated/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { SidebarMenuButton } from '@workspace/ui/components/sidebar'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { OrganizationCard } from '../components/organization-card'

interface OrganizationSwitcherProps {
  currentSlug: string
  currentName: string
  currentLogo: string | null
}

export function OrganizationSwitcher({
  currentSlug,
  currentName,
  currentLogo,
}: OrganizationSwitcherProps) {
  const navigate = useNavigate()
  const { data: organizations } = useSuspenseQuery(
    convexQuery(api.organizations.listAll, {}),
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <OrganizationCard
            name={currentName}
            logo={currentLogo}
            isActive
          />
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="right"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Organizations
        </DropdownMenuLabel>
        {organizations.map(org => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => {
              navigate({ to: '/o/$organizationSlug', params: { organizationSlug: org.slug } })
            }}
            className="cursor-pointer"
          >
            <OrganizationCard
              name={org.name}
              logo={org.logo ?? null}
              isActive={org.slug === currentSlug}
            />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            navigate({ to: '/new-organization' })
          }}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
