import { defineSchema } from 'convex/server'
import { todosTable } from '../features/todos/schema'
import { emailSchema } from '../shared/email/schema'

export default defineSchema({
  todos: todosTable,
  ...emailSchema,
})
