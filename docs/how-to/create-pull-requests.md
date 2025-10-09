# How to Create Pull Requests

## Safety Rules

**NEVER run destructive git commands without explicit user approval:**
- `git restore` - Discards changes
- `git reset` - Moves HEAD/discards commits
- `git rebase` - Rewrites history
- `git clean` - Deletes untracked files

Always ask the user first. They may have made manual changes you're unaware of.

## Workflow

1. **Review all changes**
   ```bash
   git status
   git diff
   ```

   If unexpected changes appear, ask the user before proceeding.

2. **Stage changes**
   ```bash
   git add .
   ```

3. **Commit with conventional format**
   ```bash
   git commit -m "type: description"
   ```

4. **Push to remote**
   ```bash
   git push -u origin HEAD:$(git branch --show-current)
   ```

   The `-u` flag sets up tracking so future `git push` commands work without arguments.

5. **Create PR**
   ```bash
   gh pr create --title "type: description" --body "$(cat <<'EOF'
   ## Summary
   - Change 1
   - Change 2

   ## Closes
   Implements PRFX-XXX

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

## Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add user authentication`
- `fix: resolve connection timeout`
- `refactor: simplify error handling`
- `docs: update setup instructions`
- `chore: update dependencies`

## Auto-closing Issues

- **Linear:** `Implements PRFX-40`
- **GitHub:** `Closes #123` or `Fixes #123`
