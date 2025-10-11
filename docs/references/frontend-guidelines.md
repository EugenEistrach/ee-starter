# Frontend Guidelines

## Design System

**Colors:** Semantic tokens (primary, secondary, muted, destructive, etc.)
**Radius:** `--radius: 0.625rem` (10px) with variants (sm, md, lg, xl)
**Theme:** Automatic dark mode support via `.dark` class
**Location:** `packages/ui/src/styles/globals.css`

## Available Components

From `@workspace/ui/components/*`:

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, empty, field, form, hover-card, input, input-group, input-otp, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toggle, toggle-group, tooltip

## Component Examples

### Item
Versatile component for displaying any content with media, text, and actions:

```tsx
<Item>
  <ItemMedia variant="icon">
    <FileIcon />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Document.pdf</ItemTitle>
    <ItemDescription>Last edited 2 hours ago</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button variant="ghost" size="icon">
      <MoreIcon />
    </Button>
  </ItemActions>
</Item>
```

### Button Group
Group related buttons with shared borders:

```tsx
<ButtonGroup>
  <Button variant="outline">Copy</Button>
  <ButtonGroupSeparator />
  <Button variant="outline">Paste</Button>
  <Button variant="outline">Delete</Button>
</ButtonGroup>
```

### Empty
Empty states with icon, title, and description:

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <InboxIcon />
    </EmptyMedia>
    <EmptyTitle>No messages</EmptyTitle>
    <EmptyDescription>
      You don't have any messages yet
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Compose</Button>
  </EmptyContent>
</Empty>
```
