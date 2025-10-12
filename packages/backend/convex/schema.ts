import { defineSchema } from 'convex/server'
import { todosTable } from '../features/todos/schema'
import { emailSchema } from '../shared/email/schema'
import { tables as betterAuthTables } from './components/betterAuth/schema'

export default defineSchema({
  todos: todosTable,
  ...emailSchema,
  ...betterAuthTables,
})
