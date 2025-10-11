---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git:*), Bash(ls:*), Bash(find:*)
argument-hint: [optional context: PRD, requirements, or file reference]
description: Investigate and plan features through discussion (no implementation)
---

# Plan - Investigation & Planning

## User's Context

$ARGUMENTS

## Your Task

Investigate requirements, understand the codebase, and create a detailed plan through discussion with the user. You can create plan documents to capture decisions.

### Step 1: Understand Project Architecture

Read and internalize the project structure:

**REQUIRED reading (in order):**
1. @docs/references/tech-stack.md - What's already implemented (auth, UI, etc.)
2. @docs/references/architecture.md - Layer structure and patterns
3. @docs/references/convex-guidelines.md - Backend best practices
4. All other files in @docs/references/

**Purpose:** Understand:
- What features already exist (avoid recreating!)
- Technologies in use
- Layer structure (app/features/shared)
- Dependency rules
- Where to place new code
- Existing patterns to follow

### Step 2: Analyze User's Input

**If user provided context above:**
- Read and analyze any referenced files
- Review attached files (PRD, plan, design doc, etc.)
- Understand the requirements

**If no context provided:**
- Ask user to describe what they want to build
- Ask about requirements, constraints, and goals

### Step 3: Check Existing Implementation (CRITICAL)

**Before planning, search the codebase for:**

1. **Similar features** - Does something like this already exist?
   ```
   Use Grep to search for related functionality
   Check features/ for backend
   Check apps/web/src/features/ for frontend
   ```

2. **Existing schemas** - Is there already a table/model for this domain?
   ```
   Search features/*/schema.ts
   Look for related table definitions
   ```

3. **Authentication/Authorization** - Does the project already have auth?
   ```
   Search for auth patterns
   Check if user management exists
   ```

4. **UI patterns** - Are there similar components already built?
   ```
   Check apps/web/src/features/
   Look in shared/ for reusable components
   Check @workspace/ui for primitives
   ```

**Report findings:** Tell user what already exists to avoid recreating functionality.

### Step 4: Ask Clarifying Questions

Based on requirements and existing code, ask about:

**Missing information:**
- What specific requirements are unclear or not specified?
- What are the edge cases to handle?
- What's the expected user experience?

**Integration with existing code:**
- The project already has [X], should we extend it or build new?
- How should this integrate with existing [Y] feature?
- Should we follow the pattern used in [Z]?

**Architecture decisions:**
- Which layer should each piece go in (app/features/shared)?
- Should this be a new feature or added to existing one?
- What dependencies/packages are needed?

**Technical details:**
- What data needs to be stored?
- What APIs need to be created?
- What UI components are needed?

### Step 5: Create Implementation Plan

Only after understanding everything, create a detailed plan:

**1. Architecture Overview**
- Feature name and location (features/X, apps/web/src/features/X)
- How it fits into existing structure
- Which layers are involved

**2. Changes to Existing Code** (if any)
- Files to modify
- Why modifications are needed
- What to change

**3. New Files to Create**
- Backend: schemas, queries, mutations, actions
- Frontend: components, views, hooks, utilities
- Organized by layer (app/features/shared)

**4. Dependencies**
- New packages needed
- Where to install them (backend vs web)

**5. Implementation Steps**
- Numbered step-by-step order
- Start with schema/data model
- Then backend logic
- Then frontend
- Dependencies between steps

**6. Testing Strategy**
- How to verify it works
- Edge cases to test

**7. Risks & Concerns**
- Potential issues
- Complexity areas
- Questions that remain

## IMPORTANT RULES

❌ **DO NOT implement features or write production code**
❌ **DO NOT modify existing implementation files**

✅ **Ask clarifying questions**
✅ **Create detailed plans**
✅ **Document decisions**
✅ **Highlight concerns and risks**
✅ **Wait for user approval before moving forward**
