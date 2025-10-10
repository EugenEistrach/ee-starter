# How to Build Forms

## Creating a New Form

1. **Import the form hook:**

```tsx
import { useAppForm } from '@workspace/ui/components/form'
import { FieldGroup } from '@workspace/ui/components/field'
import z from 'zod'
```

2. **Initialize the form with validation:**

```tsx
const form = useAppForm({
  defaultValues: {
    email: '',
    password: '',
  },
  onSubmit: async ({ value }) => {
    // Handle form submission
  },
  validators: {
    onSubmit: z.object({
      email: z.email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  },
})
```

3. **Render the form:**

```tsx
<form
  noValidate
  onSubmit={(e) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }}
>
  <FieldGroup>
    <form.AppField name="email">
      {field => <field.TextField label="Email" placeholder="m@example.com" type="email" />}
    </form.AppField>

    <form.AppField name="password">
      {field => <field.PasswordField label="Password" />}
    </form.AppField>

    <form.AppForm>
      <form.SubmitButton>Submit</form.SubmitButton>
    </form.AppForm>
  </FieldGroup>
</form>
```

## Available Field Components

- `TextField` - Text/email input fields
- `PasswordField` - Password input fields

## Adding New Field Components

When you need a new field type (checkbox, select, textarea, etc.):

1. **Create the component in `packages/ui/src/components/form.tsx`:**

```tsx
export function CheckboxField({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          checked={field.state.value}
          onCheckedChange={field.handleChange}
        />
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
```

2. **Register it in the `createFormHook` call:**

```tsx
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    PasswordField,
    CheckboxField, // Add here
  },
  formComponents: {
    SubmitButton,
  },
})
```

3. **Use it in your forms:**

```tsx
<form.AppField name="terms">
  {field => <field.CheckboxField label="I agree to terms" />}
</form.AppField>
```

## Form Patterns

**With async submission:**
```tsx
onSubmit: async ({ value }) => {
  const result = await api.users.create(value)
  toast.success('User created')
  form.reset()
}
```

**With error handling:**
```tsx
onSubmit: async ({ value }) => {
  await authClient.signIn.email(value, {
    onSuccess: () => toast.success('Signed in'),
    onError: (error) => toast.error(error.message),
  })
}
```

**With description on submit button:**
```tsx
<form.SubmitButton description="Already have an account? Sign in">
  Sign up
</form.SubmitButton>
```
