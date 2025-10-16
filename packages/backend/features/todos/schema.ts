import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const todosTable = defineTable({
  text: v.string(),
  completed: v.boolean(),
  organizationId: v.string(),
  createdBy: v.string(),
})
  .index('by_organization', ['organizationId'])
  .index('by_organization_completed', ['organizationId', 'completed'])
