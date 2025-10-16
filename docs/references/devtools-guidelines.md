# Devtools Guidelines

Custom panels for TanStack Devtools integration. These panels extend the built-in devtools with app-specific debugging capabilities.

## Panels

### Email Panel
Displays all emails sent by the application with full audit trail and content preview.

## Design Tokens

**IMPORTANT:** Dev tools panels should use TanStack devtools design tokens, NOT the application's design system. This ensures visual consistency within the devtools interface.

### Color Palette (Dark Theme)

These colors are from `@tanstack/devtools-ui` tokens and should be used for all dev-tools panels:

#### Backgrounds
- **Panel Background:** `#191c24` (darkGray[700])
- **Hover Background:** `#0b0d10` (darkGray[900])
- **Card/Section Background:** `#0b0d10` (darkGray[900])

#### Text
- **Primary Text:** `#f2f4f7` (gray[100])
- **Muted Text:** `#98a2b3` (gray[400])

#### Borders
- **Border:** `#1d2939` (gray[800])
- **Divider:** `#1d2939` (gray[800])

#### Semantic Colors
- **Success/Green:** `#12B76A` (green[500])
- **Error/Red:** `#ef4444` (red[500])
- **Warning/Yellow:** `#F79009` (yellow[500])
- **Info/Blue:** `#2E90FA` (blue[500])

### Usage Example

```tsx
// ✅ Correct: Use devtools colors
<div className="bg-[#191c24] text-[#f2f4f7]">
  <span className="text-[#98a2b3]">Muted text</span>
  <button className="hover:bg-[#0b0d10]">Button</button>
</div>

// ❌ Wrong: Don't use app design tokens
<div className="bg-background text-foreground">
  <span className="text-muted-foreground">Muted text</span>
</div>
```

## ESLint Configuration

The dev-tools folder is **excluded** from Tailwind design system rules:
- `no-tailwind-raw-colors`: Allows raw Tailwind colors (e.g., `gray-900`)
- `no-arbitrary-values`: Allows arbitrary hex values (e.g., `bg-[#191c24]`)

This exclusion allows dev-tools to use TanStack's color palette without ESLint warnings.

## Adding New Panels

1. Create your panel component in `views/`
2. Use devtools design tokens (see above)
3. Register in `apps/web/src/app/__root.tsx`:

```tsx
import { YourPanel } from '@/features/dev-tools/views/your-panel'

<TanStackDevtools
  plugins={[
    // ... other plugins
    ...(import.meta.env.DEV
      ? [{
          name: 'Your Panel',
          render: <YourPanel />,
        }]
      : []),
  ]}
/>
```

## Reference

Full token reference: `node_modules/@tanstack/devtools-ui/src/styles/tokens.ts`
