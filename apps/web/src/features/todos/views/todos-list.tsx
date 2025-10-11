import type { Id } from '@workspace/backend/convex/_generated/dataModel'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '@workspace/backend/convex/_generated/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty'
import { useMutation } from 'convex/react'
import { CheckSquare } from 'lucide-react'
import { useState } from 'react'
import TodoForm from '../components/todo-form'
import TodoItem from '../components/todo-item'

export default function TodosList() {
  const [newTodoText, setNewTodoText] = useState('')

  const todosQuery = useSuspenseQuery(convexQuery(api.todos.getAll, {}))
  const todos = todosQuery.data

  const createTodo = useMutation(api.todos.create)
  const toggleTodo = useMutation(api.todos.toggle)
  const removeTodo = useMutation(api.todos.deleteTodo)

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = newTodoText.trim()
    if (text) {
      setNewTodoText('')
      try {
        await createTodo({ text })
      }
      catch (error) {
        console.error('Failed to add todo:', error)
        setNewTodoText(text)
      }
    }
  }

  const handleToggleTodo = async (id: Id<'todos'>, completed: boolean) => {
    try {
      await toggleTodo({ id, completed: !completed })
    }
    catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const handleDeleteTodo = async (id: Id<'todos'>) => {
    try {
      await removeTodo({ id })
    }
    catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Todo List (Convex)</CardTitle>
          <CardDescription>Manage your tasks efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <TodoForm
            value={newTodoText}
            onChange={setNewTodoText}
            onSubmit={handleAddTodo}
          />

          {todos?.length === 0
            ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CheckSquare />
                    </EmptyMedia>
                    <EmptyTitle>No todos yet</EmptyTitle>
                    <EmptyDescription>
                      Add your first task above to get started
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )
            : (
                <ul className="space-y-2">
                  {todos?.map(todo => (
                    <TodoItem
                      key={todo._id}
                      id={todo._id}
                      text={todo.text}
                      completed={todo.completed}
                      onToggle={handleToggleTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                </ul>
              )}
        </CardContent>
      </Card>
    </div>
  )
}
