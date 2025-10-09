# ee-starter

Full-stack TypeScript starter with TanStack (Router, Query, Form) and Convex backend. Built with opinionated architecture patterns and comprehensive guardrails.

## Features

- **TanStack Suite**: Router (file-based), Query, Form with unified devtools
- **Convex Backend**: Real-time database with type-safe queries/mutations
- **Better Auth**: Authentication integrated with Convex
- **Layered Architecture**: Enforced separation of concerns (app/features/shared)
- **Lint Guardrails**: ESLint boundaries plugin + custom architectural rules
- **Monorepo**: Turborepo with Bun package manager

## Quick Start

```bash
# Clone and setup
git clone <your-repo>
cd ee-starter

# Run setup script (installs deps, configures Convex, sets env vars)
bun run packages/scripts/src/setup.ts

# Start development
bun run dev
```

The setup script will:
- Install dependencies
- Create a branch-specific Convex project
- Configure environment variables
- Set up Better Auth secrets

## Development

```bash
bun run dev           # Start all services (web + backend)
bun run dev:web       # Start web app only
bun run dev:server    # Start Convex backend only
```

## Documentation

<!-- [auto-generated] packages/scripts/src/update-docs.ts -->
**How-To Guides:**
- [docs/how-to/create-pull-requests.md](docs/how-to/create-pull-requests.md)
- [docs/how-to/update-dependencies.md](docs/how-to/update-dependencies.md)
- [docs/how-to/write-documentation.md](docs/how-to/write-documentation.md)

**References:**
- [docs/references/architecture.md](docs/references/architecture.md)
<!-- [/auto-generated] -->

## Lint Commands

```bash
bun run check        # Check for errors (all packages)
bun run fix          # Auto-fix errors (all packages)
```
