#!/bin/bash

# Read JSON input from stdin
input=$(cat)

# Extract the bash command from the JSON input (PostToolUse uses tool_input.command)
command=$(echo "$input" | jq -r '.tool_input.command // ""')

# Check if the command contains --no-verify
if echo "$command" | grep -q -- '--no-verify'; then
  # Return JSON with block decision to show message to agent (retrospectively after command runs)
  jq -n --arg reason "⚠️  You used --no-verify to bypass pre-commit checks.
This should be RARE. You must now:
- Manually verify no issues were introduced
- If problems found, fix them properly and re-commit/re-push
- Don't leave technical debt behind

Was bypassing checks really necessary?" '{
    decision: "block",
    reason: $reason
  }'
  exit 0
fi

# No --no-verify detected, allow silently
exit 0
