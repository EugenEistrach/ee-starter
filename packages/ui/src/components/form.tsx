import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { Button } from './button'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import { Input } from './input'

// Create form contexts
export const { fieldContext, formContext, useFieldContext, useFormContext }
  = createFormHookContexts()

// TextField Component
export function TextField({
  label,
  placeholder,
  type = 'text',
}: {
  label: string
  placeholder?: string
  type?: 'text' | 'email'
}) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

// PasswordField Component
export function PasswordField({ label }: { label: string }) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type="password"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

// SubmitButton Component
export function SubmitButton({
  children,
  description,
}: {
  children: React.ReactNode
  description?: React.ReactNode
}) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={state => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
      {({ canSubmit, isSubmitting }) => (
        <Field>
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Submitting...' : children}
          </Button>
          {description && (
            <FieldDescription className="text-center">
              {description}
            </FieldDescription>
          )}
        </Field>
      )}
    </form.Subscribe>
  )
}

// Create form hook with field and form components
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    PasswordField,
  },
  formComponents: {
    SubmitButton,
  },
})
