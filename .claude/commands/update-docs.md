---
allowed-tools: Task, Read, Write, Edit
description: Update project documentation based on code changes
---

# Update Documentation

## Your Task

Update project documentation in `docs/references/` to reflect recent code changes.

## Process

### Step 1: Summarize Changes

Launch the change-summarizer agent to analyze all changes:

```
Use Task tool to launch change-summarizer agent:
- Subagent type: change-summarizer
- Task: Analyze all staged and unstaged changes. Provide a comprehensive summary of what changed.
```

### Step 2: Review Existing Documentation

Check what docs exist:

```bash
ls docs/references/
```

### Step 3: Identify Documentation Updates

Launch docs-updater agent to propose updates:

```
Use Task tool to launch docs-updater agent:
- Subagent type: docs-updater
- Task: Review the change summary and propose specific updates to documentation files in docs/references/.
```

**For large doc sets:** Can launch multiple docs-updater agents in parallel (single message with multiple Task calls), each focusing on different doc files.

### Step 4: Present Proposals

Show the user:
- What documentation updates are proposed
- Why each update is needed
- Which sections will be modified

### Step 5: Apply Updates

Ask user for approval:
- "Should I apply these documentation updates?"
- If yes: Apply each proposed change using Write/Edit tools
- If no: Skip updates
- If partial: Ask which specific updates to apply

### Step 6: Confirm Completion

Report what was updated:
```
✅ Documentation updated:
- docs/references/file1.md - [what changed]
- docs/references/file2.md - [what changed]
```

## Important Notes

- Only update files in `docs/references/`
- Always get user approval before applying changes
- Be specific about what will change
- If agents propose conflicting updates, clarify with user
