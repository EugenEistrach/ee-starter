# System Internals

Internal infrastructure systems, build plugins, and auto-generated code.

## Route Sync System

Vite plugin that syncs frontend route names to the backend for validation.

**Plugin:** `packages/scripts/src/vite-plugin-sync-routes.ts`
- Watches `routeTree.gen.ts`
- Extracts root-level route names (first path segment only)
- Generates `packages/backend/convex/reserved-routes.ts`

**Generated file exports:**
- `RESERVED_ROUTE_NAMES` - Array of reserved names
- `isReservedRouteName(name)` - Validation helper

**Extraction logic:**
- `/dashboard/todos` → `dashboard`
- `/api/auth/$` → `api`
- Skips dynamic segments (`$`)

**Runs automatically:**
- Dev server start
- File changes (watch mode)
- Production builds
