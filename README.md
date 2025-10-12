# ee-starter

> **Work in Progress**
>
> I've built many starters and boilerplates over the years working with LLMs and doing projects at my company. This one consolidates everything I've learned. I'm using this approach in 3+ production projects and migrating the best parts here. It's usable now but still missing some pieces e.g. org/team management (easy to add with bettter-auth), i18n, and more documentation.

Claude Code optimized full-stack TypeScript starter with exceptional developer experience. Built with TanStack (Router, Query, Form), Convex backend, and comprehensive guardrails for both humans and AI. Initially jumpstarted using https://www.better-t-stack.dev/


## Quick Start

```bash
# Create new project from starter (runs interactive setup automatically)
bunx giget@latest gh:eugeneistrach/ee-starter my-app-name --install
cd my-app-name

# Start development
bun run dev
```

Automated setup prompts for:
- App name and branding customization
- Convex backend configuration (free account at convex.dev)
- GitHub repository creation (optional)
- Production deployment to Vercel (optional)

## Features

- **TanStack Suite**: Router (file-based), Query, Form with unified devtools
- **Convex Backend**: Real-time database with type-safe queries/mutations
- **Better Auth**: Authentication integrated with Convex
- **Developer Experience**: Custom devtools panels & inspectors (e.g., email previews), comprehensive documentation, clean patterns
- **LLM Optimized**: Built for any LLM. Claude Code: custom agents, slash commands, hooks. CLAUDE.md files for auto-context injection. Automated guardrails: architecture + design system + code quality
- **Layered Architecture**: Enforced separation of concerns (app/features/shared)
- **Monorepo**: Turborepo with Bun package manager
- **Conductor friendly**: https://conductor.build/ - automated setup and archive scripts

## Production Features

**Included:**
- ✅ Email system: Template-based, local/Resend switching, devtools integration, full audit trail

**Coming Soon:**
- 🚧 User onboarding flows
- 🚧 Organization management
- 🚧 Admin UIs

## Development

```bash
bun run dev           # Start all services (web + backend)
bun run dev:web       # Start web app only
bun run dev:server    # Start Convex backend only
```

## Documentation

<!-- [auto-generated] packages/scripts/src/update-docs.ts -->
**How-To Guides:**
- [docs/how-to/abc.md](docs/how-to/abc.md)
- [docs/how-to/build-forms.md](docs/how-to/build-forms.md)
- [docs/how-to/create-pull-requests.md](docs/how-to/create-pull-requests.md)
- [docs/how-to/deploy-production.md](docs/how-to/deploy-production.md)
- [docs/how-to/temp.md](docs/how-to/temp.md)
- [docs/how-to/update-dependencies.md](docs/how-to/update-dependencies.md)
- [docs/how-to/use-linear-cli.md](docs/how-to/use-linear-cli.md)
- [docs/how-to/write-documentation.md](docs/how-to/write-documentation.md)

**References:**
- [docs/references/architecture.md](docs/references/architecture.md)
- [docs/references/backend-guidelines.md](docs/references/backend-guidelines.md)
- [docs/references/convex-guidelines.md](docs/references/convex-guidelines.md)
- [docs/references/frontend-guidelines.md](docs/references/frontend-guidelines.md)
- [docs/references/system-internals.md](docs/references/system-internals.md)
- [docs/references/tech-stack.md](docs/references/tech-stack.md)
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
