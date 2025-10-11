import type { Id } from '@workspace/backend/convex/_generated/dataModel'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@workspace/ui/components/item'
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
    <Item asChild variant="outline" size="sm">
      <li>
        <ItemMedia>
          <Checkbox
            checked={completed}
            onCheckedChange={() => onToggle(id, completed)}
            id={`todo-${id}`}
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className={completed ? 'line-through text-muted-foreground' : ''}>
            <label htmlFor={`todo-${id}`}>{text}</label>
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(id)}
            aria-label="Delete todo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </ItemActions>
      </li>
    </Item>
  )
}
