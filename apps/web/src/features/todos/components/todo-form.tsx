import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { useState } from 'react'

interface TodoFormProps {
  onSubmit: (value: string) => void | Promise<void>
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [value, setValue] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSubmit(value)
        setValue('')
      }}
      className="mb-6 flex items-center space-x-2"
    >
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Add a new task..."
      />
      <Button type="submit" disabled={!value.trim()}>
        Add
      </Button>
    </form>
  )
}
