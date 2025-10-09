import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { createTodo, getAllTodos, removeTodo, toggleTodo } from '../features/todos/logic'

export const getAll = query({
  handler: async (ctx) => {
    return getAllTodos(ctx)
  },
})

export const create = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return createTodo(ctx, args.text)
  },
})

export const toggle = mutation({
  args: {
    id: v.id('todos'),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    return toggleTodo(ctx, args.id, args.completed)
  },
})

export const deleteTodo = mutation({
  args: {
    id: v.id('todos'),
  },
  handler: async (ctx, args) => {
    return removeTodo(ctx, args.id)
  },
})
