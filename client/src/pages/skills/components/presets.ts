import {
  Code2, FileCode, Bug, TestTube, GitBranch, Rocket,
  Shield, Database, Layout, Paintbrush, Terminal, BookOpen,
  type LucideIcon,
} from 'lucide-react'

export interface SkillPreset {
  name: string
  label: string
  description: string
  icon: LucideIcon
  category: 'development' | 'testing' | 'devops' | 'documentation'
  content: string
}

export const SKILL_PRESETS: SkillPreset[] = [
  {
    name: 'code-review',
    label: 'Code Review',
    description: 'Review code for bugs, performance, and best practices',
    icon: Code2,
    category: 'development',
    content: `# Code Review

Review the provided code for:

1. **Bugs & Logic Errors** — off-by-one, null checks, race conditions
2. **Performance** — unnecessary re-renders, N+1 queries, memory leaks
3. **Security** — injection, XSS, exposed secrets
4. **Readability** — naming, structure, comments where needed
5. **Best Practices** — framework conventions, DRY, SOLID

Provide specific line references and suggested fixes.

$ARGUMENTS`,
  },
  {
    name: 'refactor',
    label: 'Refactor',
    description: 'Refactor code for better structure and maintainability',
    icon: FileCode,
    category: 'development',
    content: `# Refactor

Refactor the specified code to improve:

1. **Structure** — extract functions, split large files, modularize
2. **Naming** — clear, descriptive variable and function names
3. **Duplication** — identify and extract shared logic
4. **Complexity** — simplify nested conditionals, reduce cognitive load
5. **Types** — add or improve TypeScript types

Keep the same behavior — only improve the internal structure. Run tests after.

$ARGUMENTS`,
  },
  {
    name: 'fix-bug',
    label: 'Fix Bug',
    description: 'Investigate and fix a bug with root cause analysis',
    icon: Bug,
    category: 'development',
    content: `# Fix Bug

Investigate and fix the reported bug:

1. **Reproduce** — understand the expected vs actual behavior
2. **Root Cause** — trace the issue to its source, don't just patch symptoms
3. **Fix** — implement the minimal correct fix
4. **Verify** — ensure the fix doesn't break related functionality
5. **Prevent** — add a test or guard to prevent regression

$ARGUMENTS`,
  },
  {
    name: 'write-tests',
    label: 'Write Tests',
    description: 'Generate unit and integration tests for code',
    icon: TestTube,
    category: 'testing',
    content: `# Write Tests

Write tests for the specified code:

1. **Unit Tests** — test individual functions and components in isolation
2. **Edge Cases** — null, empty, boundary values, error paths
3. **Integration** — test how components work together
4. **Mocking** — mock external dependencies (APIs, databases)
5. **Assertions** — clear, specific assertions with good error messages

Follow the project's existing test patterns and frameworks.

$ARGUMENTS`,
  },
  {
    name: 'add-api-endpoint',
    label: 'Add API Endpoint',
    description: 'Create a new REST API endpoint with validation',
    icon: Database,
    category: 'development',
    content: `# Add API Endpoint

Create a new API endpoint:

1. **Route** — define the URL path and HTTP method
2. **Validation** — validate request body/params with proper error messages
3. **Handler** — implement the business logic
4. **Response** — return appropriate status codes and response format
5. **Auth** — apply authentication/authorization if needed
6. **Tests** — write tests for success and error cases

Follow the project's existing API patterns.

$ARGUMENTS`,
  },
  {
    name: 'create-component',
    label: 'Create Component',
    description: 'Build a new UI component following design system',
    icon: Layout,
    category: 'development',
    content: `# Create Component

Build a new UI component:

1. **Design** — follow the project's design system and Chakra UI patterns
2. **Props** — define a clear TypeScript interface
3. **Variants** — support different sizes/states via props
4. **Accessibility** — keyboard navigation, ARIA attributes, focus management
5. **Responsiveness** — works at different viewport sizes
6. **Reusability** — check shared components before building from scratch

$ARGUMENTS`,
  },
  {
    name: 'git-commit',
    label: 'Git Commit',
    description: 'Stage and commit changes with conventional message',
    icon: GitBranch,
    category: 'devops',
    content: `# Git Commit

Review staged changes and create a commit:

1. **Review** — check what's changed with git diff
2. **Stage** — stage relevant files (don't stage unrelated changes)
3. **Message** — write a conventional commit message:
   - \`feat:\` new feature
   - \`fix:\` bug fix
   - \`refactor:\` code restructuring
   - \`docs:\` documentation
   - \`test:\` adding tests
   - \`chore:\` maintenance
4. **Scope** — include scope if applicable: \`feat(runner): add restart button\`

$ARGUMENTS`,
  },
  {
    name: 'deploy',
    label: 'Deploy',
    description: 'Prepare and deploy the application',
    icon: Rocket,
    category: 'devops',
    content: `# Deploy

Prepare the application for deployment:

1. **Build** — run the production build and verify no errors
2. **Tests** — ensure all tests pass
3. **Version** — bump version number appropriately
4. **Changelog** — update changelog with notable changes
5. **Tag** — create a git tag for the release
6. **Deploy** — follow the deployment pipeline

$ARGUMENTS`,
  },
  {
    name: 'security-audit',
    label: 'Security Audit',
    description: 'Audit code for security vulnerabilities',
    icon: Shield,
    category: 'testing',
    content: `# Security Audit

Audit the codebase for security issues:

1. **Dependencies** — check for known vulnerabilities (npm audit)
2. **Injection** — SQL injection, command injection, XSS
3. **Authentication** — token handling, session management, password storage
4. **Authorization** — access control, privilege escalation
5. **Secrets** — hardcoded credentials, exposed API keys
6. **CORS/CSP** — cross-origin policies, content security

Report findings with severity levels and remediation steps.

$ARGUMENTS`,
  },
  {
    name: 'document',
    label: 'Document',
    description: 'Generate documentation for code and APIs',
    icon: BookOpen,
    category: 'documentation',
    content: `# Document

Generate documentation for the specified code:

1. **Overview** — what the code does and why it exists
2. **API Reference** — function signatures, params, return types
3. **Examples** — usage examples with expected output
4. **Architecture** — how components relate to each other
5. **Setup** — installation and configuration steps

Write for the target audience (developers, not end users).

$ARGUMENTS`,
  },
]

export const SKILL_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'development', label: 'Development' },
  { id: 'testing', label: 'Testing' },
  { id: 'devops', label: 'DevOps' },
  { id: 'documentation', label: 'Documentation' },
]
