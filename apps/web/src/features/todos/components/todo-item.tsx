import type { Id } from '@workspace/backend/convex/_generated/dataModel'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Trash2 } from 'lucide-react'

interface TodoItemProps {
  id: Id<'todos'>
  text: string
  completed: boolean
  onToggle: (id: Id<'todos'>, completed: boolean) => void
  onDelete: (id: Id<'todos'>) => void
}

export default function TodoItem({
  id,
  text,
  completed,
  onToggle,
  onDelete,
}: TodoItemProps) {
  return (
    <li className="flex items-center justify-between rounded-md border p-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggle(id, completed)}
          id={`todo-${id}`}
        />
        <label
          htmlFor={`todo-${id}`}
          className={`${
            completed
              ? 'text-muted-foreground line-through'
              : ''
          }`}
        >
          {text}
        </label>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(id)}
        aria-label="Delete todo"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  )
}
