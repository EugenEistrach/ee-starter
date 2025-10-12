import { v } from 'convex/values'
import { createTodo, getAllTodos, removeTodo, toggleTodo } from '../features/todos/logic'

import { ensureUserWithOrganization, ensureUserWithPermissions } from '../shared/auth/validations'
import { mutation, query } from './_generated/server'

const todoValidator = v.object({
  _id: v.id('todos'),
  _creationTime: v.number(),
  text: v.string(),
  completed: v.boolean(),
  organizationId: v.id('organization'),
  createdBy: v.id('user'),
})

export const getAll = query({
  args: {
    organizationId: v.id('organization'),
  },
  returns: v.array(todoValidator),
  handler: async (ctx, { organizationId }) => {
    await ensureUserWithOrganization(ctx, { organizationId })
    return getAllTodos(ctx, organizationId)
  },
})

export const create = mutation({
  args: {
    text: v.string(),
    organizationId: v.id('organization'),
  },
  returns: v.union(todoValidator, v.null()),
  handler: async (ctx, { text, organizationId }) => {
    const { user } = await ensureUserWithPermissions(ctx, { permissions: {
      todo: ['create'],
    }, organizationId })
    return createTodo(ctx, text, organizationId, user._id)
  },
})

export const toggle = mutation({
  args: {
    id: v.id('todos'),
    organizationId: v.id('organization'),
    completed: v.boolean(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { id, organizationId, completed }) => {
    await ensureUserWithPermissions(ctx, { permissions: {
      todo: ['update'],
    }, organizationId })
    return toggleTodo(ctx, id, completed)
  },
})

export const deleteTodo = mutation({
  args: {
    id: v.id('todos'),
    organizationId: v.id('organization'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { id, organizationId }) => {
    await ensureUserWithPermissions(ctx, { permissions: {
      todo: ['delete'],
    }, organizationId })
    return removeTodo(ctx, id)
  },
})
