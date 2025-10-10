# ee-starter

> **Work in Progress**
>
> I've built many starters and boilerplates over the years working with LLMs and doing projects at my company. This one consolidates everything I've learned. I'm using this approach in 3+ production projects and migrating the best parts here. It's usable now but still missing some pieces—proper dashboard, landing page, org/team management (easy to add with bettter-auth), production deployment docs, i18n, and more documentation.

Full-stack TypeScript starter with TanStack (Router, Query, Form) and Convex backend. Built with opinionated architecture patterns and comprehensive guardrails. Initially jumpstarted using https://www.better-t-stack.dev/

## Features

- **TanStack Suite**: Router (file-based), Query, Form with unified devtools
- **Convex Backend**: Real-time database with type-safe queries/mutations
- **Better Auth**: Authentication integrated with Convex
- **Layered Architecture**: Enforced separation of concerns (app/features/shared)
- **Lint Guardrails**: ESLint boundaries plugin + custom architectural rules
- **Monorepo**: Turborepo with Bun package manager
- **LLM Friendly**: Claude.md files and automated guardrails to make sure the LLM stays on track
- **Conductor friendly** https://conductor.build/ - provides setup and archive scripts so it can be used with conductor easilyo

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
- [docs/how-to/build-forms.md](docs/how-to/build-forms.md)
- [docs/how-to/create-pull-requests.md](docs/how-to/create-pull-requests.md)
- [docs/how-to/update-dependencies.md](docs/how-to/update-dependencies.md)
- [docs/how-to/use-linear-cli.md](docs/how-to/use-linear-cli.md)
- [docs/how-to/write-documentation.md](docs/how-to/write-documentation.md)

**References:**
- [docs/references/architecture.md](docs/references/architecture.md)
- [docs/references/convex-guidelines.md](docs/references/convex-guidelines.md)
<!-- [/auto-generated] -->

## Conductor Integration

This starter is fully compatible with [Conductor](https://conductor.build/) for parallel worktree development. The `conductor.json` configuration provides automated setup and cleanup:

**Scripts:**
- `setup`: Runs `packages/scripts/src/setup.ts` to install dependencies, create branch-specific Convex projects, and configure env vars
- `run`: Starts development servers via `packages/scripts/src/start.ts`
- `archive`: Cleans up Convex projects when archiving worktrees via `packages/scripts/src/cleanup.ts`

**Required for automatic cleanup:**
Set `CONVEX_TEAM_ACCESS_TOKEN` in `packages/backend/.env.local` to enable automatic Convex project deletion when you merge and archive worktrees in Conductor. Without this token, projects will need to be manually deleted from the Convex dashboard.

## Lint Commands

```bash
bun run check        # Check for errors (all packages)
bun run fix          # Auto-fix errors (all packages)
```
