#!/bin/bash

# Read the tool input from stdin
input=$(cat)

# Extract file_path for Write tool
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Exit if no file path
if [ -z "$file_path" ]; then
  exit 0
fi

# Check if the written file is in the docs folder
if [[ "$file_path" == */docs/* ]] || [[ "$file_path" == docs/* ]]; then
  echo "<system-reminder>Review @docs/how-to/write-documentation.md - keep docs concise, timeless, and low maintenance.</system-reminder>" >&2
  exit 2
fi

exit 0
