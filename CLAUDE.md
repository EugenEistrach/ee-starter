# Claude Code Project Guide

## Important: Check What Exists First

**BEFORE starting any new feature, read this to avoid recreating existing functionality:**
@docs/references/tech-stack.md

This document lists all pre-implemented features (auth, UI components, etc.) and technologies in use.

## Architecture

Detailed architecture patterns, structure, and decision framework (MANDATORY read before starting any work):
@docs/references/architecture.md

## Linear Workflow

When starting work on a Linear issue, use:
```bash
linear issue start PRFX-123
```

This creates a branch with the Linear ID and marks the issue "In Progress". If no issue exists, create and start it:
```bash
linear issue create -t "Title" -d "Description" --project ee-starter --assignee @me --start
```

## Dependency Management

**IMPORTANT:** Always install dependencies in the specific package where they will be used.

Example:
```bash
bun add --cwd apps/web some-package
bun add --cwd packages/backend some-package
```

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
- docs/how-to/build-forms.md
- docs/how-to/create-pull-requests.md
- docs/how-to/deploy-production.md
- docs/how-to/update-dependencies.md
- docs/how-to/use-linear-cli.md
- docs/how-to/write-documentation.md

**References** (general information and docs):
- docs/references/architecture.md
- docs/references/backend-guidelines.md
- docs/references/convex-guidelines.md
- docs/references/frontend-guidelines.md
- docs/references/tech-stack.md
<!-- [/auto-generated] -->
