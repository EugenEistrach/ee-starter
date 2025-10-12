import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty'
import { Settings } from 'lucide-react'

export const Route = createFileRoute('/o/$organizationSlug/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your application settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Settings className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle>Settings Coming Soon</EmptyTitle>
              <EmptyDescription>
                This section is under construction
              </EmptyDescription>
            </EmptyHeader>
          </Empty>

        </CardContent>
      </Card>
    </div>
  )
}
