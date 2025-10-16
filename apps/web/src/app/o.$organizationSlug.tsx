import { convexQuery } from '@convex-dev/react-query'
import { createFileRoute, Link, notFound, Outlet, redirect } from '@tanstack/react-router'
import { api } from '@workspace/backend/convex/_generated/api'

import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Separator } from '@workspace/ui/components/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@workspace/ui/components/sidebar'
import { ThemeToggle } from '@workspace/ui/components/theme-toggle'
import { TooltipProvider } from '@workspace/ui/components/tooltip'
import { CheckSquare, ChevronsUpDown, LogOut, Settings } from 'lucide-react'
import { Suspense } from 'react'
import { useCurrentUser } from '@/shared/auth/hooks/useCurrentUser'
import { useLogout } from '@/shared/auth/hooks/useLogout'
import { useOrganization } from '@/shared/auth/hooks/useOrganizationSlug'
import { OrganizationSwitcher } from '@/shared/auth/views/organization-switcher'

export const Route = createFileRoute('/o/$organizationSlug')({
  beforeLoad: async ({ context, params }) => {
    if (!context.userId) {
      throw redirect({ to: '/login' })
    }

    const [

      organizations,

    ] = await Promise.all([
      context.queryClient.ensureQueryData(convexQuery(api.organizations.listAll, {})),
      context.queryClient.ensureQueryData(convexQuery(api.users.getCurrentUser, {})),

    ])

    const organization = organizations.find(organization => organization.slug === params.organizationSlug)

    if (!organization && organizations.length > 0) {
      throw notFound()
    }

    if (!organization) {
      throw redirect({ to: '/new-organization' })
    }

    context.queryClient.ensureQueryData(convexQuery(api.organizations.get, { slug: params.organizationSlug }))

    return { organization }
  },

  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet />
            </Suspense>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function AppSidebar() {
  const user = useCurrentUser()
  const organization = useOrganization()
  const logout = useLogout()

  if (!user) {
    return null
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrganizationSwitcher
              currentSlug={organization.slug}
              currentName={organization.name}
              currentLogo={organization.logo ?? null}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Todos">
                  <Link to="/o/$organizationSlug/todos" params={{ organizationSlug: organization.slug }}>
                    <CheckSquare />
                    <span>Todos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link to="/o/$organizationSlug/settings" params={{ organizationSlug: organization.slug }}>
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton

                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {user.name?.slice(0, 2).toUpperCase() || 'CN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || 'User'}</span>
                    <span className="truncate text-xs">{user?.email || ''}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {user?.name?.slice(0, 2).toUpperCase() || 'CN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name || 'User'}</span>
                      <span className="truncate text-xs">{user?.email || ''}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                  }}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
