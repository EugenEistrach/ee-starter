import { v } from 'convex/values'
import { createTodo, getAllTodos, removeTodo, toggleTodo } from '../features/todos/logic'
import { mutation, query } from './_generated/server'

const todoValidator = v.object({
  _id: v.id('todos'),
  _creationTime: v.number(),
  text: v.string(),
  completed: v.boolean(),
})

export const getAll = query({
  returns: v.array(todoValidator),
  handler: async (ctx) => {
    return getAllTodos(ctx)
  },
})

export const create = mutation({
  args: {
    text: v.string(),
  },
  returns: v.union(todoValidator, v.null()),
  handler: async (ctx, args) => {
    return createTodo(ctx, args.text)
  },
})

export const toggle = mutation({
  args: {
    id: v.id('todos'),
    completed: v.boolean(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    return toggleTodo(ctx, args.id, args.completed)
  },
})

export const deleteTodo = mutation({
  args: {
    id: v.id('todos'),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    return removeTodo(ctx, args.id)
  },
})
