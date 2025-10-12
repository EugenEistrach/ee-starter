import { createFileRoute } from '@tanstack/react-router'
import TodosList from '@/features/todos/views/todos-list'

export const Route = createFileRoute('/o/$organizationSlug/todos')({
  component: TodosPage,
})

function TodosPage() {
  return <TodosList />
}
