# How to Create Pull Requests

## Workflow

1. **Review and stage all changes**
   ```bash
   git status
   git add .
   ```

2. **Commit with conventional format**
   ```bash
   git commit -m "type: description"
   ```

3. **Push to remote**
   ```bash
   git push origin HEAD:$(git branch --show-current)
   ```

4. **Create PR**
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
