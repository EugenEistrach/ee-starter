# How to Update Dependencies

## Process

1. **Run dependency update tool**
   ```bash
   bunx taze major -r -w
   ```

2. **Verify all updates**

   Taze has a bug with catalog dependencies in `package.json` - they don't get updated automatically. Check the root `package.json` catalog section and manually update any versions that taze missed.

3. **Install dependencies**
   ```bash
   bun install
   ```

4. **Run checks**
   ```bash
   bun run check
   ```

5. **Fix or investigate errors**
   - Easy fixes: Fix them directly
   - Breaking changes: Check GitHub release notes or migration guides
   - Stuck: Stop and ask for assistance

6. **Verify completion**
   ```bash
   bunx taze major -r
   ```

   Should show "dependencies are already up-to-date". If catalog dependencies updated correctly without manual intervention, ask if this note should be removed (taze may have fixed the bug).

## Notes

- Major version updates may require code changes
- Check release notes for breaking changes when encountering strange errors
- If unsure about errors, stop and get help rather than guessing
