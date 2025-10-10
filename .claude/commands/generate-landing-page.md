---
allowed-tools: Read, Write, Edit, Glob, Grep
description: Generate a professional landing page based on product information
---

# Generate Landing Page Command

You create a professional, conversion-focused landing page using the available UI components.

## Step 1: Gather Product Information

Ask the user the following questions:

1. **Product name and tagline**: What is your product called and what's the one-line description?
2. **Main value proposition**: What's the primary problem you solve or benefit you provide?
3. **Key features** (3-5): What are the most important features or capabilities?
4. **Target audience**: Who is this product for?
5. **Call-to-action**: What should users do? (e.g., "Sign Up", "Get Started", "Request Demo")
6. **Social proof** (optional): Any testimonials, user counts, or trust indicators?
7. **Visual style preference**: Modern & minimal, bold & colorful, professional & corporate, or other?

Wait for the user to provide this information before proceeding.

## Step 2: Analyze Available UI Components

Read the UI components available in `packages/ui/src/components/` to understand what building blocks are available:

**Key components to look for:**
- Button, badge, card for CTAs and feature cards
- Accordion, tabs for feature sections
- Avatar, testimonial-related components for social proof
- Navigation components for header
- Separator for visual breaks
- Typography components

Use Glob to find all components:
```
packages/ui/src/components/*.tsx
```

Then read the most relevant components to understand their APIs and usage patterns.

## Step 3: Design Landing Page Structure

Based on the product information and available components, design a landing page with these sections:

1. **Hero Section**
   - Product name and tagline
   - Main value proposition
   - Primary CTA button
   - Optional: Hero image placeholder or visual element

2. **Features Section**
   - Display 3-5 key features using cards or grid layout
   - Each feature with icon placeholder, title, and description

3. **Social Proof Section** (if provided)
   - Testimonials, user count, or trust badges
   - Use cards or quote styling

4. **Final CTA Section**
   - Compelling call-to-action
   - Secondary supporting text
   - CTA button

5. **Simple Footer**
   - Product name
   - Copyright notice

## Step 4: Generate Landing Page Code

Create clean, readable React code that:

1. **Uses available UI components** from `@workspace/ui`
2. **Follows project architecture**:
   - This is a route file in `apps/web/src/app/index.tsx`
   - Keep it focused and clean
   - Use Tailwind for layout and spacing
3. **Implements responsive design**:
   - Mobile-first approach
   - Proper spacing and typography
   - Grid/flex layouts that adapt
4. **Matches the visual style** requested by user
5. **Includes placeholder content** where needed
6. **Has semantic HTML** for accessibility

## Step 5: Replace Root Index Route

Read the current `apps/web/src/app/index.tsx` to understand the existing structure, then replace it with the new landing page.

**Important:**
- Preserve any necessary imports or route configuration
- Keep the file structure clean and organized
- Add comments for major sections
- Use TypeScript properly

## Step 6: Provide Implementation Summary

After creating the landing page, provide:

1. **What was built**: Brief description of the landing page structure
2. **Components used**: List of UI components utilized
3. **Next steps**: Suggestions for customization:
   - Add real images/icons
   - Customize colors using Tailwind theme
   - Add animations or transitions
   - Connect real data/APIs
   - Add more sections as needed

## Guidelines

**Code Quality:**
- Clean, readable code over clever abstractions
- Proper TypeScript types
- Semantic HTML elements
- Accessible components (alt text, ARIA labels where needed)

**Design Principles:**
- Clear visual hierarchy
- Sufficient white space
- Consistent spacing using Tailwind scale
- Mobile-responsive layouts
- Strong, clear CTAs

**Content Strategy:**
- Benefit-focused copy
- Scannable sections
- Clear, action-oriented CTAs
- Concise feature descriptions

## Example Flow

```
User: Generate a landing page for my product
Assistant: I'll help you create a professional landing page. First, let me gather some information about your product:

1. What is your product name and tagline?
2. What's the main value proposition?
[... rest of questions ...]

User: [provides answers]
Assistant: [reads UI components, designs structure, generates landing page code, replaces index.tsx]

Done! I've created a landing page with:
- Hero section with your value proposition
- Features showcase using Card components
- [etc...]

Next steps:
- Add your logo and images
- Customize colors in Tailwind config
- Add animations if desired
```

## Important
- ALWAYS gather product information FIRST
- Check available UI components BEFORE writing code
- Create clean, maintainable code
- Follow project architecture patterns
- Make it responsive and accessible
