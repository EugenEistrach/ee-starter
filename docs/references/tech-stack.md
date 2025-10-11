# Tech Stack & Existing Features

## Stack

**Backend:** Convex, TypeScript, Better Auth (`@convex-dev/better-auth`)
**Frontend:** React, TanStack (Router, Query, Form), Tailwind, shadcn/ui
**Tooling:** Bun, Turborepo, ESLint

## Already Implemented

### Authentication
- Email/password auth via Better Auth
- Magic link passwordless authentication
- Password reset flow (forgot/reset password)
- User sessions, protected routes
- Auth UI components in `apps/web/src/shared/auth/`
- Config: `packages/backend/convex/auth.config.ts`

### User Schema
- User table managed by Better Auth (cannot modify)
- To extend user data: create separate table linked via user ID
- See `packages/backend/CLAUDE.md` for examples

### UI Components
- Complete shadcn/ui library in `@workspace/ui`
- Layout components (Sidebar, Header)
- Form components with TanStack Form

### Email System
- Template-based emails with design components
- Automatic provider switching (Resend/local)
- See `packages/backend/features/email/README.md`

### Example Feature: Todos
- Full CRUD: `packages/backend/features/todos/` + `apps/web/src/features/todos/`
- Use as reference for new features
