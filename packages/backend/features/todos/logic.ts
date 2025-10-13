import type { Id } from '../../convex/_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server'

export async function getAllTodos(ctx: QueryCtx, organizationId: string) {
  return ctx.db
    .query('todos')
    .withIndex('by_organization', q => q.eq('organizationId', organizationId))
    .collect()
}

export async function createTodo(
  ctx: MutationCtx,
  text: string,
  organizationId: string,
  createdBy: string,
) {
  const newTodoId = await ctx.db.insert('todos', {
    text,
    completed: false,
    organizationId,
    createdBy,
  })
  return ctx.db.get(newTodoId)
}

export async function toggleTodo(ctx: MutationCtx, id: Id<'todos'>, completed: boolean) {
  await ctx.db.patch(id, { completed })
  return { success: true }
}

export async function removeTodo(ctx: MutationCtx, id: Id<'todos'>) {
  await ctx.db.delete(id)
  return { success: true }
}
