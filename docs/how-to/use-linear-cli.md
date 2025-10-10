# How to Use Linear CLI

## Setup

Linear CLI is configured in this project.

## Core Workflow

### Creating and Starting an Issue

Create a new issue and start working on it:
```bash
linear issue create -t "Title" -d "Description" --assignee @me --start
```

This will:
- Create the issue assigned to you
- Mark it as "In Progress"
- Create/switch to a branch with the Linear ID

### Starting Work on an Existing Issue

When assigned a Linear issue, start it with:
```bash
linear issue start PRFX-123
```

This will:
- Create/switch to a branch named `username/prfx-123-issue-title`
- Mark the issue as "In Progress" in Linear
- Link your git branch to the Linear issue

### Viewing Current Issue

```bash
linear issue view           # View in terminal
linear issue view -w        # Open in web browser
linear issue view -a        # Open in Linear.app
```

### Creating Pull Requests

```bash
linear issue pr
```

Creates a GitHub PR with the issue title and description pre-filled.

## All Commands

### Issue Management

```bash
linear issue list           # List your unstarted issues
linear issue list -A        # List all unstarted issues
linear issue list -s done   # List issues by state
linear issue start          # Interactive issue selector
linear issue start PRFX-123 # Start specific issue
linear issue view           # View current issue
linear issue create         # Create new issue
linear issue update         # Update issue
linear issue delete         # Delete issue
```

### Issue Information

```bash
linear issue id             # Print issue ID (e.g., "PRFX-123")
linear issue title          # Print issue title
linear issue url            # Print Linear.app URL
```

### Team Commands

```bash
linear team list            # List teams
linear team id              # Print team ID
linear team members         # List team members
```

### Project Commands

```bash
linear project list         # List projects
linear project view         # View project details
```

## Tips

- The CLI is git-aware and determines the current issue from your branch name
- Linear's GitHub integration suggests branch names in the format `username/prfx-123-issue-title`
- Always use `linear issue start` to ensure proper issue tracking
