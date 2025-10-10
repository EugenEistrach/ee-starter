import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'

export const Route = createFileRoute('/dashboard/settings')({
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
          <p className="text-muted-foreground">Settings page coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
