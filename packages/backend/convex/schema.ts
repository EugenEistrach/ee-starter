import { defineSchema } from 'convex/server'
import { todosTable } from './features/todos/schema'

export default defineSchema({
  todos: todosTable,
})
