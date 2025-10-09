#!/bin/bash

# Read the tool input from stdin
input=$(cat)

# Extract file_path for Edit/Write tools
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# If no file_path (might be MultiEdit), extract edits array
if [ -z "$file_path" ]; then
  # For MultiEdit, get all file paths from edits array
  files=$(echo "$input" | jq -r '.tool_input.edits[]?.file_path // empty' 2>/dev/null)
else
  files="$file_path"
fi

# Exit if no files found
if [ -z "$files" ]; then
  exit 0
fi

# Track if we have any output
has_output=false
output_buffer=""
checked_files=false

# Process each file
while IFS= read -r file; do
  # Skip if file is empty or doesn't exist
  if [ -z "$file" ] || [ ! -f "$file" ]; then
    continue
  fi

  # Only check TypeScript/JavaScript files
  if [[ "$file" =~ \.(ts|tsx|js|jsx)$ ]]; then
    # Track that we checked a file
    checked_files=true

    # Find the closest eslint config by checking parent directories
    file_dir=$(dirname "$file")
    eslint_config_dir=""
    while [ "$file_dir" != "/" ] && [ "$file_dir" != "." ]; do
      if [ -f "$file_dir/eslint.config.mjs" ] || [ -f "$file_dir/eslint.config.js" ] || [ -f "$file_dir/.eslintrc.json" ]; then
        eslint_config_dir="$file_dir"
        break
      fi
      file_dir=$(dirname "$file_dir")
    done

    # Run ESLint and TypeScript in parallel using temp files
    # Start ESLint in background
    if [ -n "$eslint_config_dir" ] && command -v bunx &> /dev/null; then
      (cd "$eslint_config_dir" && bunx eslint --fix "$file" 2>&1) > /tmp/eslint_output_$$ &
      eslint_pid=$!
    fi

    # Start TypeScript in background - use bun run check for package isolation
    if [[ "$file" =~ \.(ts|tsx)$ ]] && command -v bun &> /dev/null; then
      # Find the package that owns this file (nearest package.json with name field)
      file_dir=$(dirname "$file")
      package_dir=""
      package_name=""
      while [ "$file_dir" != "/" ] && [ "$file_dir" != "." ]; do
        if [ -f "$file_dir/package.json" ]; then
          pkg_name=$(jq -r '.name // empty' "$file_dir/package.json" 2>/dev/null)
          if [ -n "$pkg_name" ]; then
            package_dir="$file_dir"
            package_name="$pkg_name"
            break
          fi
        fi
        file_dir=$(dirname "$file_dir")
      done

      # Find monorepo root (has turbo.json or workspaces in package.json)
      if [ -n "$package_dir" ]; then
        search_dir="$package_dir"
        monorepo_root=""
        while [ "$search_dir" != "/" ] && [ "$search_dir" != "." ]; do
          if [ -f "$search_dir/turbo.json" ]; then
            monorepo_root="$search_dir"
            break
          fi
          search_dir=$(dirname "$search_dir")
        done

        # Run bun run check for this package only
        if [ -n "$monorepo_root" ] && [ -n "$package_name" ]; then
          (cd "$monorepo_root" && bun run check --filter="$package_name" 2>&1) > /tmp/tsc_output_$$ &
          tsc_pid=$!
        fi
      fi
    fi

    # Wait for both to complete
    if [ -n "$eslint_pid" ]; then
      wait $eslint_pid
      eslint_output=$(cat /tmp/eslint_output_$$ 2>/dev/null)
      rm -f /tmp/eslint_output_$$
      if [ -n "$eslint_output" ]; then
        if [ "$has_output" = false ]; then
          output_buffer+="🔍 Checking $file\n"
          has_output=true
        fi
        output_buffer+="$eslint_output\n"
      fi
    fi

    if [ -n "$tsc_pid" ]; then
      wait $tsc_pid
      tsc_output=$(cat /tmp/tsc_output_$$ 2>/dev/null)
      rm -f /tmp/tsc_output_$$
      if [ -n "$tsc_output" ]; then
        if [ "$has_output" = false ]; then
          output_buffer+="🔍 Checking $file\n"
          has_output=true
        fi
        output_buffer+="$tsc_output\n"
      fi
    fi
  fi
done <<< "$files"

# If we have output, send to stderr and exit 2 so Claude sees it
if [ "$has_output" = true ]; then
  echo -e "$output_buffer" >&2
  exit 2
fi

# If we checked files but had no errors, print success
if [ "$checked_files" = true ]; then
  echo "✅ Checks OK" >&2
  exit 2
fi

exit 0
