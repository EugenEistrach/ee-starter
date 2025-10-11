import { defineSchema } from 'convex/server'
import { emailSchema } from '../features/email/schema'
import { todosTable } from '../features/todos/schema'

export default defineSchema({
  todos: todosTable,
  ...emailSchema,
})
