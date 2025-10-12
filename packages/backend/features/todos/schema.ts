import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const todosTable = defineTable({
  text: v.string(),
  completed: v.boolean(),
  organizationId: v.id('organization'),
  createdBy: v.id('user'),
})
  .index('by_organization', ['organizationId'])
  .index('by_organization_completed', ['organizationId', 'completed'])
