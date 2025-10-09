import { createFileRoute } from '@tanstack/react-router'
import TodosList from '@/features/todos/views/todos-list'

export const Route = createFileRoute('/todos')({
  component: TodosRoute,
})

function TodosRoute() {
  return <TodosList />
}
