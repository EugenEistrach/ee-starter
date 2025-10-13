import { convexQuery } from '@convex-dev/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '@workspace/backend/convex/_generated/api'
import TodosList, { TodosListSkeleton } from '@/features/todos/views/todos-list'

export const Route = createFileRoute('/o/$organizationSlug/todos')({
  loader: async ({ context }) => {
    void context.queryClient.prefetchQuery(convexQuery(api.todos.getAll, { organizationId: context.organization.id }))
  },
  pendingComponent: () => <TodosListSkeleton />,
  component: TodosPage,
})

function TodosPage() {
  return (

    <TodosList />

  )
}
