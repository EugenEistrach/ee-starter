import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const todosTable = defineTable({
  text: v.string(),
  completed: v.boolean(),
})
