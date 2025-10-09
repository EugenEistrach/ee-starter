# Claude Code Project Guide

This is a full-stack TypeScript monorepo using TanStack (Router, Query, Form) and Convex backend with enforced layered architecture.

## Architecture

Detailed architecture patterns, structure, and decision framework (MANDATORY read before starting any work):
@docs/references/architecture.md

## Lint Commands

```bash
bun run check        # Check for errors (all packages)
bun run fix          # Auto-fix errors (all packages)
```

**Architectural enforcement:**
- ESLint boundaries plugin enforces layer dependencies
- Custom ESLint rules prevent cross-feature imports
- Pre-commit hooks run checks automatically

## Documentation

<!-- [auto-generated] packages/scripts/src/update-docs.ts -->
**How-To Guides** (processes and workflows):
- docs/how-to/create-pull-requests.md
- docs/how-to/update-dependencies.md
- docs/how-to/write-documentation.md

**References** (general information and docs):
- docs/references/architecture.md
<!-- [/auto-generated] -->
