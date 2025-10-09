# Architecture

## Monorepo Structure

```
ee-starter/
├── apps/
│   └── web/                    # Vite + React + TanStack Router
├── docs/
├── packages/
│   ├── backend/                # Convex backend (@workspace/backend)
│   ├── scripts/                # Setup/build scripts
│   ├── ui/                     # Shared UI components (@workspace/ui)
│   └── utils/                  # Pure utilities (@workspace/utils)
```

**Package manager:** bun
**Build system:** Turborepo

---

## Decision Framework

### Backend (Convex)

**Where do I put my code?**

| Scenario | Location | Rule |
|----------|----------|------|
| Creating API endpoint | `convex/app/` | Thin layer that composes features |
| New feature/domain logic | `convex/features/{feature}/` | Start here. Keep isolated. |
| Logic used by 3+ features | `convex/shared/` | Extract only when proven necessary (file or folder) |
| Pure utilities (date, string, etc.) | `@workspace/utils` package | Framework-agnostic, reusable everywhere |

**Import rules:**

```
app/        → Can import from features/, shared/, @workspace/utils
features/   → Can import from shared/, @workspace/utils (NEVER other features)
shared/     → Can import from @workspace/utils (files within same folder can import each other)
```

### Frontend (React/TanStack)

**Where do I put my code?**

| Scenario | Location | Rule |
|----------|----------|------|
| Creating a route | `app/{route}.tsx` | Composes features, handles routing |
| New feature UI/logic | `features/{feature}/` | Start here. Keep isolated. |
| Component used by 3+ features | `shared/{domain}/` | Extract only when proven necessary |
| Generic UI primitives | `@workspace/ui` package | Reusable across all apps |

**Import rules:**

```
app/        → Can import from features/, shared/, @workspace/*
features/   → Can import from shared/, @workspace/* (NEVER other features)
shared/     → Can import from @workspace/* (files in same folder can import each other)
```

### General Rules

**If slices are coupled → combine them into one.** This applies to both features.

**When features need to work together:**
1. Always coupled? → Combine into one feature
2. Just need to call both? → Compose in `app/` layer

**When to extract logic to `shared/`:**
- Used by 1-2 features? → Copy-paste the code (keep features isolated)
- Used by 3+ features? → Extract to `shared/`

Prefer duplication over premature abstraction. Code in 2 places can evolve independently.

---

## Backend Architecture

### Layer Structure

```
packages/backend/convex/
├── app/                        # API surface (queries, mutations, actions)
│   ├── posts.ts               # Thin, composes features
│   └── users.ts
├── features/                   # Feature slices (isolated domains)
│   ├── billing/
│   │   ├── README.md          # Feature summary
│   │   ├── invoices.ts        # Organize by subdomain if complex
│   │   ├── payments.ts
│   │   ├── schema.ts
│   │   └── subscriptions.ts
│   └── user-profile/
│       ├── README.md
│       ├── logic.ts           # Business logic (split if complex)
│       ├── schema.ts          # Table definitions
│       ├── types.ts           # (optional) Exported types
│       └── validators.ts      # (optional) Complex validators only
├── schema.ts                   # Composed from all slices
└── shared/                     # Extracted shared logic
    ├── auth.ts                # Flat files for simple shared code
    ├── email.ts
    └── notifications/          # Nested folders for grouped functionality
        ├── logic.ts
        └── schema.ts
```

### Key Principles

**Dependency Flow:** `app` → `features` → `shared` → `@workspace/utils` (one direction only)

**Slice Isolation:** Each feature slice is self-contained. No cross-imports between features. Shared files within the same folder can import from each other.

**Progressive Extraction:** Start in `features/`, extract to `shared/` only when proven necessary (3+ usages).

**Schema Colocation:** Schemas live in slices, composed in root `schema.ts`:
```typescript
// features/users/schema.ts
export const usersSchema = { users: defineTable({...}) }

// convex/schema.ts
import { usersSchema } from './features/users/schema';
export default defineSchema({ ...usersSchema, ... });
```

**File Organization:**
- Start minimal: `README.md` + `schema.ts` + `logic.ts`
- Split when complex: by subdomain (preferred) or operation type
- Add `types.ts`, `validators.ts` only when needed

**Documentation:** Each feature slice includes a README.md summarizing its purpose and functionality.

**When slices are coupled:** If two feature slices need each other → combine them into one slice. This prevents circular dependencies and maintains clear boundaries.

**Shared Layer Structure:** Flat files by default (`auth.ts`, `email.ts`). Use nested folders only when grouping multiple related files (`notifications/logic.ts`, `notifications/schema.ts`).

---

## Frontend Architecture

### Layer Structure

```
apps/web/src/
├── app/                        # Routes (TanStack Router file-based routing)
│   ├── __root.tsx             # Root layout, auth setup
│   ├── index.tsx              # Home route
│   ├── dashboard.tsx          # Dashboard route
│   └── todos.tsx              # Todos route
├── features/                   # Feature slices (isolated UI domains)
│   ├── todos/
│   │   ├── README.md          # Feature summary
│   │   ├── components/        # Dumb/presentational components
│   │   │   ├── todo-item.tsx
│   │   │   └── todo-form.tsx
│   │   ├── views/             # Smart components (compose + Convex integration)
│   │   │   └── todos-list.tsx
│   │   ├── hooks/             # Feature-specific hooks
│   │   │   └── use-todos.ts
│   │   └── lib/               # Feature-specific utilities
│   │       └── todo-helpers.ts
│   └── billing/
│       ├── README.md
│       ├── components/
│       ├── views/
│       ├── hooks/
│       └── lib/
└── shared/                     # Shared logic (domain-organized)
    ├── auth/                   # Auth domain
    │   ├── views/              # sign-in-form, sign-up-form, user-menu
    │   └── lib/                # auth-client, auth-server
    └── ui/                     # Generic UI domain
        ├── components/         # header, loader, etc.
        └── hooks/              # Generic hooks
```

### Key Principles

**Dependency Flow:** `app` → `features` → `shared` → `@workspace/*` (one direction only)

**Slice Isolation:** Each feature slice is self-contained. No cross-imports between features. Shared files within the same folder can import from each other.

**Progressive Extraction:** Start in `features/`, extract to `shared/` only when proven necessary (3+ usages).

**Component Organization:**
- `components/`: Dumb/presentational components (props in, JSX out)
- `views/`: Smart components that compose dumb components and integrate with Convex/state
- `hooks/`: Custom React hooks
- `lib/`: Utilities and helpers

**File Organization:**
- Start minimal: `README.md` + basic components
- Add `views/`, `hooks/`, `lib/` folders only when needed
- Keep components focused and single-purpose

**Documentation:** Each feature slice includes a README.md summarizing its purpose and functionality.

**When slices are coupled:** If two feature slices need each other → combine them into one slice. This prevents circular dependencies and maintains clear boundaries.

**Shared Layer Structure:** Organized by domain (auth/, ui/), not by type. Each domain follows the same folder structure as features (components/, views/, lib/, hooks/).

---

## Utilities Package

```
packages/utils/                 # @workspace/utils
└── src/
    ├── ensure.ts              # Type-safe assertions
    └── index.ts
```

**Purpose:** Pure, framework-agnostic utilities used across web/backend.
