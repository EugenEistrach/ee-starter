import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'

interface TodoFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function TodoForm({ value, onChange, onSubmit }: TodoFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 flex items-center space-x-2"
    >
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Add a new task..."
      />
      <Button type="submit" disabled={!value.trim()}>
        Add
      </Button>
    </form>
  )
}
