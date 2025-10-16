# How to Update Dependencies

## Process

1. **Check for available updates**
   ```bash
   bun run check-dependencies
   ```

2. **Review what will be updated**, then apply:
   ```bash
   bun run update-dependencies
   ```

3. **Verify catalog dependencies**

   Taze has a bug with catalog dependencies in root `package.json` - they don't get updated automatically. Check the catalog section and manually update any versions missed.

4. **Install dependencies**
   ```bash
   bun install
   ```

5. **Run checks**
   ```bash
   bun run check
   ```

6. **Fix or investigate errors**
   - Easy fixes: Fix them directly
   - Breaking changes: Check GitHub release notes or migration guides
   - Stuck: Stop and ask for assistance

7. **Verify completion**
   ```bash
   bun run check-dependencies
   ```

   Should show "dependencies are already up-to-date". If catalog dependencies updated correctly without manual intervention, the taze bug may be fixed.

## Notes

- Major version updates may require code changes
- Check release notes for breaking changes when encountering strange errors
- If unsure about errors, stop and get help rather than guessing
