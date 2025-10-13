import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { Button, type buttonVariants } from './button'
import { Field, FieldDescription, FieldError, FieldLabel } from './field'
import { Input } from './input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'


// Create form contexts
export const { fieldContext, formContext, useFieldContext, useFormContext }
  = createFormHookContexts()

// TextField Component
export function TextField({
  label,
  placeholder,
  type = 'text',
  optional = false,
}: {
  label?: string
  placeholder?: string
  type?: 'text' | 'email'
  optional?: boolean
}) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}{optional && <span className="text-muted-foreground text-sm"> (optional)</span>}</FieldLabel>}
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
export function PasswordField({
  label,
  secondaryAction,
  optional = false,
}: {
  label?: string | React.ReactNode
  secondaryAction?: React.ReactNode
  optional?: boolean
}) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name} className="flex items-center justify-between">
        <span>{label}{optional && <span className="text-muted-foreground text-sm"> (optional)</span>}</span>
        {secondaryAction && (
          <span className="text-sm font-normal text-muted-foreground">
            {secondaryAction}
          </span>
        )}
      </FieldLabel>}
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

// SelectField Component
export function SelectField({
  label,
  options,
  optional = false,
}: {
  label?: string
  options: Array<{ value: string, label: string }>
  optional?: boolean
}) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}{optional && <span className="text-muted-foreground text-sm"> (optional)</span>}</FieldLabel>}
      <Select value={field.state.value} onValueChange={field.handleChange}>
        <SelectTrigger id={field.name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

// SubmitButton Component
export function SubmitButton({
  children,
  description,
  fieldClassName,
  ...props
}: {
  children: React.ReactNode
  description?: React.ReactNode
  fieldClassName?: string
} &  VariantProps<typeof buttonVariants> & React.ComponentProps<typeof Button>) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={state => {  return ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting,   })} }>
      {({ canSubmit, isSubmitting, }) => (
        <Field className={cn("w-auto",fieldClassName)}>
          <Button {...props} type="submit" disabled={!canSubmit || isSubmitting || props.disabled} >
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
    SelectField,
  },
  formComponents: {
    SubmitButton,
  },
})
