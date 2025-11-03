#!/bin/bash

# Run linting check and capture output
output=$(bun run check 2>&1)
exit_code=$?

# If check failed, use JSON to block with detailed reason
if [ $exit_code -ne 0 ]; then
  # Properly escape output for JSON using jq
  escaped_output=$(echo "$output" | jq -Rs .)

  # Create JSON with properly escaped content
  jq -n --arg reason "⚠️  Code quality checks failed. You must:
- Remove unused imports/variables/code
- Make unused exports private or remove them
- Fix all linting errors properly
- DO NOT use --no-verify to bypass these checks

If stuck on an issue, STOP and ask the user for guidance.
Re-run checks until clean.

$output" '{
    decision: "block",
    reason: $reason
  }'
  exit 0
fi

# Success - allow agent to finish (no output needed)
exit 0
