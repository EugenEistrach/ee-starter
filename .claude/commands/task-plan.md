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
4. Read other docs in @docs/references/ ONLY if directly relevant to the task

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

### Step 3: Research External Documentation (if needed)

**For third-party libraries and frameworks:**
- Use Context7 MCP tools to fetch up-to-date documentation
- Call `mcp__context7__resolve-library-id` first to find the library
- Then use `mcp__context7__get-library-docs` with the library ID and `tokens: 3000` to limit context usage
- Examples: Better Auth plugins, TanStack libraries, UI frameworks

### Step 4: Check Existing Implementation (CRITICAL)

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

### Step 5: Ask Clarifying Questions (If Needed)

Ask ONE focused round of questions. Group into max 3 categories:

**Requirements & Integration:**
- What's unclear about requirements or user experience?
- How should this integrate with existing [X, Y] features?

**Architecture & Decisions:**
- Should we [A] or [B]? (only for non-trivial choices)
- New feature or extend existing?

**Technical Unknowns:**
- What data/schemas are needed?
- Any third-party packages required?

**Skip questions where:**
- Answer is obvious from context
- You can make reasonable default choice
- User already provided the answer

### Step 6: Create Implementation Plan

Present a **structured, detailed plan** with this format:

#### 1. Files to Create
List new files with brief purpose:
- `path/to/file.ts` - Purpose

**Show code examples** for non-obvious structure (schemas, key functions, etc.)

#### 2. Files to Modify
List existing files with specific changes:
- `path/to/file.ts` - What changes (be specific)

**Show code snippets** for complex modifications

#### 3. Key Decisions
- Architectural choices made
- What we're reusing vs building new
- Integration points

#### 4. Implementation Order (optional)
If dependencies exist between changes

#### 5. TLDR
**3-5 bullet summary at the end:**
- What we're building (1 line)
- Main files/components (1-2 lines)
- Key reuse/integration points (1-2 lines)

**Guidelines:**
- Show code for: schemas, key type definitions, complex logic patterns
- Be specific: "Add handleSubmit to useCreatePost hook" not "update hooks"
- Skip: obvious imports, trivial config, testing boilerplate
- Focus: architecture decisions, what goes where, why

---

## Example: Good Plan Structure

**Feature:** Add post comments system

#### 1. Files to Create

**Backend:**
- `packages/backend/features/comments/schema.ts` - Comment table linked to posts

```typescript
export const commentsTable = defineTable({
  content: v.string(),
  postId: v.id("posts"),
  organizationId: v.string(),
  createdBy: v.string(),
})
  .index("by_post", ["postId"])
  .index("by_organization", ["organizationId"])
```

- `packages/backend/features/comments/logic.ts` - CRUD operations

```typescript
export async function getCommentsByPost(ctx: QueryCtx, postId: Id<"posts">, organizationId: string) {
  return ctx.db
    .query('comments')
    .withIndex('by_post', q => q.eq('postId', postId))
    .filter(q => q.eq(q.field('organizationId'), organizationId))
    .collect()
}

export async function createComment(
  ctx: MutationCtx,
  postId: Id<"posts">,
  content: string,
  organizationId: string,
  createdBy: string,
) {
  const newCommentId = await ctx.db.insert('comments', {
    postId,
    content,
    organizationId,
    createdBy,
  })
  return ctx.db.get(newCommentId)
}
```

- `packages/backend/convex/comments.ts` - API endpoints with auth validation

```typescript
export const getByPost = query({
  args: { postId: v.id('posts'), organizationId: v.string() },
  returns: v.array(commentValidator),
  handler: async (ctx, { postId, organizationId }) => {
    await ensureUserWithOrganization(ctx, { organizationId })
    return getCommentsByPost(ctx, postId, organizationId)
  },
})

export const create = mutation({
  args: { postId: v.id('posts'), content: v.string(), organizationId: v.string() },
  returns: v.union(commentValidator, v.null()),
  handler: async (ctx, { postId, content, organizationId }) => {
    const { user } = await ensureUserWithPermissions(ctx, {
      permissions: { comment: ['create'] },
      organizationId
    })
    return createComment(ctx, postId, content, organizationId, user._id)
  },
})
```

**Frontend:**
- `apps/web/src/features/comments/components/comment-item.tsx` - Single comment display
- `apps/web/src/features/comments/components/comment-form.tsx` - Form to add comment
- `apps/web/src/features/comments/views/comment-list.tsx` - Full comment section

```typescript
// Key pattern: TanStack Query + Convex + optimistic updates
export function CommentList({ postId }: { postId: Id<"posts"> }) {
  const organization = useOrganization()

  const commentsQuery = useSuspenseQuery(
    convexQuery(api.comments.getByPost, { postId, organizationId: organization.id })
  )
  const comments = commentsQuery.data

  const createComment = useMutation(api.comments.create).withOptimisticUpdate(
    (localStore, args) => {
      const existing = localStore.getQuery(api.comments.getByPost,
        { postId, organizationId: organization.id })
      if (!existing) return

      localStore.setQuery(api.comments.getByPost,
        { postId, organizationId: organization.id },
        [...existing, { ...args, _id: crypto.randomUUID(), _creationTime: Date.now() }]
      )
    }
  )
  // ...
}
```

#### 2. Files to Modify

- `packages/backend/convex/schema.ts` - Import commentsTable and add to schema
- `apps/web/src/app/posts.$id.tsx` - Add `<CommentList postId={post._id} />` after post content

#### 3. Key Decisions

- Comments belong to posts (not standalone feature) → new `comments/` feature
- Using existing auth pattern from todos → `ensureUserWithPermissions` with comment permissions
- Reusing form components from `@workspace/ui` → `<Textarea>`, `<Button>`
- Organization-based with permission checks (following todos pattern)
- Optimistic updates for better UX
- No edit functionality (keep scope small) → only create/delete for now

#### 4. Implementation Order

1. Backend schema + logic (defines data structure)
2. Backend API endpoints (test in Convex dashboard)
3. Frontend components (build bottom-up: item → form → list)
4. Integrate into post page

#### 5. TLDR

- Adding comment system for posts with create/delete functionality
- Backend: `features/comments/` with schema, logic, API endpoints using organization permissions
- Frontend: `features/comments/` with TanStack Query + Convex + optimistic updates
- Reusing: auth/permissions from todos, `useOrganization()` hook, UI components from `@workspace/ui`

---

## IMPORTANT RULES

❌ **DO NOT implement features or write production code**
❌ **DO NOT modify existing implementation files**

✅ **Ask clarifying questions**
✅ **Create detailed plans**
✅ **Document decisions**
✅ **Highlight concerns and risks**
✅ **Wait for user approval before moving forward**
