# Todos Feature

Manages todo items - create, read, update, and delete operations.

## Schema

- `text: string` - Todo item text
- `completed: boolean` - Completion status

## Logic

- `getAllTodos(ctx)` - Returns all todos
- `createTodo(ctx, text)` - Creates a new todo
- `toggleTodo(ctx, id, completed)` - Updates completion status
- `removeTodo(ctx, id)` - Deletes a todo
