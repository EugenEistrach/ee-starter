---
allowed-tools: Bash(git:*), Bash(gh:*), Bash(linear:*), Bash(which:*), Bash(echo:*), Read, SlashCommand
argument-hint: [optional context or notes]
description: Finalize task and create pull request following project guidelines
---

# Finish Task

## Context

- Current branch: !`git branch --show-current`
- Linear CLI path: !`which linear || echo "not-installed"`
- Branch name: !`git branch --show-current`

## User's Additional Context

$ARGUMENTS

## Your Task

Follow the PR creation workflow from @docs/how-to/create-pull-requests.md

**Important steps:**

1. **Update documentation:**
   - Use SlashCommand tool to execute `/update-docs`
   - This will analyze changes and propose doc updates
   - Review and apply doc updates with user approval
   - Once docs are updated, continue to PR creation

2. **Linear ticket tracking:**
   - Check if Linear CLI is installed (path shown above is not "not-installed")
   - Check if branch name contains Linear ticket pattern (e.g., PREFIX-123)
   - If Linear CLI is installed AND branch has no ticket number:
     - Get issues: `linear issue list --assignee @me`
     - Analyze the changes in this PR
     - Match changes to relevant issue(s) based on descriptions
     - If needed, use `linear issue view PRFX-XX` to get more details about unclear issues
     - Present your analysis: "Based on the changes, this PR addresses: PRFX-XX, PRFX-YY"
     - Ask user to confirm or correct which issue(s) this relates to
   - If branch already has a Linear ticket in the name, use that ticket number

3. **Follow PR guide:**
   - Review changes with `git status` and `git diff`
   - If unexpected files/changes appear:
     * List them clearly
     * Ask if they are intended changes
     * Ask what to do (stage, ignore, or user will handle)
     * Never delete or modify without explicit approval
     * Wait for confirmation before proceeding
   - Use conventional commit format
   - Include Linear ticket reference (if applicable) using "Implements PRFX-XXX" format
   - Add Claude Code attribution footer
   - If user provided additional context above, incorporate it into the PR description

4. **Safety first:**
   - Never run destructive git commands without explicit approval
   - Never delete files without user confirmation
   - Always ask before modifying unexpected files
