import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/new-organization')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/new-organization"!</div>
}
