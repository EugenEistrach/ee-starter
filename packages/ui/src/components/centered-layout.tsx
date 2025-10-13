import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const centeredLayoutVariants = cva(
  "flex w-full flex-col gap-8",
  {
    variants: {
      size: {
        default: "max-w-md",
        sm: "max-w-sm",
        lg: "max-w-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function CenteredLayout({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof centeredLayoutVariants>) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div
        data-slot="centered-layout"
        data-size={size}
        className={cn(centeredLayoutVariants({ size, className }))}
        {...props}
      />
    </div>
  )
}

function CenteredLayoutContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="centered-layout-content"
      className={cn("flex w-full flex-col gap-8", className)}
      {...props}
    />
  )
}

function CenteredLayoutHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="centered-layout-header"
      className={cn(
        "flex flex-col gap-4 items-center text-center",
        className
      )}
      {...props}
    />
  )
}

function CenteredLayoutTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="centered-layout-title"
      className={cn("text-2xl font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function CenteredLayoutDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="centered-layout-description"
      className={cn(
        "text-muted-foreground text-sm/relaxed",
        className
      )}
      {...props}
    />
  )
}

function CenteredLayoutFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="centered-layout-footer"
      className={cn(
        "flex items-center justify-center gap-4",
        className
      )}
      {...props}
    />
  )
}

export {
  CenteredLayout,
  CenteredLayoutContent,
  CenteredLayoutHeader,
  CenteredLayoutTitle,
  CenteredLayoutDescription,
  CenteredLayoutFooter,
}
