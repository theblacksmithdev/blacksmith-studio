import type { AgentExecuteOptions } from '../base/index.js'
import type { AgentRole, AgentExecution, AgentEvent } from '../types.js'
import type { ChangeSet } from '../utils/change-tracker.js'
import { extractBugReport, buildBugFixPrompt } from './bug-report.js'

/** Roles that produce code and should go through the quality gate */
const CODE_PRODUCING_ROLES = new Set<AgentRole>([
  'frontend-engineer',
  'backend-engineer',
  'fullstack-engineer',
  'database-engineer',
  'devops-engineer',
  'ui-designer',
  'security-engineer',
])

const MAX_REVIEW_CYCLES = 2
const MAX_TEST_CYCLES = 2

type ExecuteFn = (options: AgentExecuteOptions & { role?: AgentRole }) => Promise<AgentExecution>
type EmitFn = (event: AgentEvent) => void

/** Check if a role produces code that should be reviewed and tested */
export function needsQualityGate(role: AgentRole): boolean {
  return CODE_PRODUCING_ROLES.has(role)
}

/**
 * Run the quality gate: review → fix loop, then test → fix loop.
 *
 * Accepts an optional ChangeSet so the reviewer only looks at
 * files modified during this dispatch — not the entire codebase.
 */
export async function runQualityGate(
  originalTask: { role: AgentRole; prompt: string; title: string },
  baseOptions: AgentExecuteOptions,
  execute: ExecuteFn,
  emit: EmitFn,
  changes?: ChangeSet,
): Promise<QualityGateResult> {
  const executions: AgentExecution[] = []
  let passed = true

  // ── Review Loop ──
  emit(activityEvent('code-reviewer', `Reviewing ${originalTask.title}...`))

  let reviewIssues: string | null = null
  for (let cycle = 0; cycle < MAX_REVIEW_CYCLES; cycle++) {
    const reviewPrompt = cycle === 0
      ? buildReviewPrompt(originalTask, changes)
      : buildReReviewPrompt(originalTask, cycle)

    const reviewExec = await execute({
      ...baseOptions,
      prompt: reviewPrompt,
      role: 'code-reviewer',
    })
    executions.push(reviewExec)

    if (reviewExec.status !== 'done') {
      emit(activityEvent('code-reviewer', 'Review failed to complete'))
      passed = false
      break
    }

    const hasIssues = detectReviewIssues(reviewExec)

    if (!hasIssues) {
      emit(activityEvent('code-reviewer', `Review passed for ${originalTask.title}`))
      reviewIssues = null
      break
    }

    reviewIssues = `Code review found issues (cycle ${cycle + 1}/${MAX_REVIEW_CYCLES})`
    emit(activityEvent(originalTask.role, `Fixing review feedback (cycle ${cycle + 1})...`))

    const fixPrompt = buildFixPrompt(originalTask, 'review', reviewExec)
    const fixExec = await execute({
      ...baseOptions,
      prompt: fixPrompt,
      role: originalTask.role,
    })
    executions.push(fixExec)

    if (fixExec.status !== 'done') {
      emit(activityEvent(originalTask.role, 'Fix attempt failed'))
      passed = false
      break
    }

    emit(activityEvent('code-reviewer', `Re-reviewing after fixes (cycle ${cycle + 1})...`))
  }

  if (reviewIssues) {
    emit(activityEvent('code-reviewer', `Review issues remain after ${MAX_REVIEW_CYCLES} cycles — proceeding to tests`))
  }

  // ── Test Loop ──
  emit(activityEvent('qa-engineer', `Writing tests for ${originalTask.title}...`))

  let testFailures: string | null = null
  for (let cycle = 0; cycle < MAX_TEST_CYCLES; cycle++) {
    const testPrompt = cycle === 0
      ? buildTestPrompt(originalTask, changes)
      : buildReTestPrompt(originalTask, cycle)

    const testExec = await execute({
      ...baseOptions,
      prompt: testPrompt,
      role: 'qa-engineer',
    })
    executions.push(testExec)

    if (testExec.status !== 'done') {
      emit(activityEvent('qa-engineer', 'Test execution failed to complete'))
      passed = false
      break
    }

    const testsPass = detectTestsPassed(testExec)

    if (testsPass) {
      emit(activityEvent('qa-engineer', `All tests pass for ${originalTask.title}`))
      testFailures = null
      break
    }

    // Check if QA produced a bug report (major issue it can't fix)
    const bugReport = extractBugReport(testExec)

    if (bugReport) {
      // QA found a major bug — route to the appropriate developer via PM
      const targetRole = bugReport.suggestedRole
      emit(activityEvent('qa-engineer', `Major bug found in ${bugReport.file} — escalating to ${targetRole}`))
      emit(activityEvent('product-manager', `Re-assigning bug fix: "${bugReport.description}" → ${targetRole}`))

      const bugFixPrompt = buildBugFixPrompt(bugReport)
      const fixExec = await execute({
        ...baseOptions,
        prompt: bugFixPrompt,
        role: targetRole,
      })
      executions.push(fixExec)

      if (fixExec.status !== 'done') {
        emit(activityEvent(targetRole, 'Bug fix attempt failed'))
        passed = false
        break
      }

      emit(activityEvent('qa-engineer', `Re-running tests after ${targetRole} fixed the bug...`))
    } else {
      // No bug report — QA couldn't fix it, send to original task's role
      testFailures = `Tests failed (cycle ${cycle + 1}/${MAX_TEST_CYCLES})`
      emit(activityEvent(originalTask.role, `Fixing test failures (cycle ${cycle + 1})...`))

      const fixPrompt = buildFixPrompt(originalTask, 'test', testExec)
      const fixExec = await execute({
        ...baseOptions,
        prompt: fixPrompt,
        role: originalTask.role,
      })
      executions.push(fixExec)

      if (fixExec.status !== 'done') {
        emit(activityEvent(originalTask.role, 'Fix attempt failed'))
        passed = false
        break
      }

      emit(activityEvent('qa-engineer', `Re-running tests after fixes (cycle ${cycle + 1})...`))
    }
  }

  if (testFailures) {
    emit(activityEvent('qa-engineer', `Test failures remain after ${MAX_TEST_CYCLES} cycles`))
    passed = false
  }

  return {
    passed,
    executions,
    reviewCycles: Math.min(MAX_REVIEW_CYCLES, executions.filter((e) => e.agentId === 'code-reviewer').length),
    testCycles: Math.min(MAX_TEST_CYCLES, executions.filter((e) => e.agentId === 'qa-engineer').length),
  }
}

/* ── Result Type ── */

export interface QualityGateResult {
  passed: boolean
  executions: AgentExecution[]
  reviewCycles: number
  testCycles: number
}

/* ── Prompt Builders ── */

function buildReviewPrompt(
  task: { role: AgentRole; prompt: string; title: string },
  changes?: ChangeSet,
): string {
  const lines = [
    `Review the code changes made by the ${task.role} for the task: "${task.title}".`,
    '',
  ]

  // Include the exact file list and diff if available
  if (changes && changes.files.length > 0) {
    lines.push('## Changed Files')
    for (const f of changes.files) {
      const icon = f.status === 'added' ? '+' : f.status === 'deleted' ? '-' : '~'
      lines.push(`  ${icon} ${f.path} (${f.status})`)
    }
    lines.push('')

    if (changes.stat) {
      lines.push(`Stats: ${changes.stat.split('\n').pop() ?? ''}`)
      lines.push('')
    }

    if (changes.diff) {
      const maxDiff = 12000
      const truncated = changes.diff.length > maxDiff
      lines.push('## Diff')
      lines.push('```diff')
      lines.push(truncated ? changes.diff.slice(0, maxDiff) + '\n... (truncated)' : changes.diff)
      lines.push('```')
      lines.push('')
    }

    lines.push('IMPORTANT: Review ONLY the files listed above. These are the changes from this dispatch.')
    lines.push('')
  }

  lines.push(
    'Original task description:',
    task.prompt,
    '',
    'Review instructions:',
    '- Read each changed file listed above. Focus on the new/modified code.',
    '- Check for: correctness, security vulnerabilities, major performance issues.',
    '- Do NOT modify any files. This is a read-only review.',
    '',
    'Response format — you MUST start your response with one of these three prefixes:',
    '',
    '  APPROVED: — Code is correct and ready. No blocking issues.',
    '',
    '  APPROVED WITH SUGGESTIONS: — Code works and is acceptable, but you have',
    '  optional suggestions (style, naming, minor improvements, alternative approaches).',
    '  These are non-blocking — the code ships as-is. List suggestions for the author.',
    '',
    '  CHANGES NEEDED: — There are bugs, security vulnerabilities, or logic errors',
    '  that MUST be fixed before shipping. Only use this for genuinely broken code.',
    '',
    'Guidelines:',
    '- Approve if the code works correctly, even if you\'d write it differently.',
    '- There are many valid ways to solve a problem — don\'t block on style preferences.',
    '- Reserve CHANGES NEEDED for actual defects: crashes, data loss, security holes, wrong behavior.',
    '- Be specific when requesting changes — include file paths and concrete fix descriptions.',
  )

  return lines.join('\n')
}

function buildReReviewPrompt(task: { title: string }, cycle: number): string {
  return [
    `Re-review the code for "${task.title}" after the author applied fixes (attempt ${cycle + 1}).`,
    '',
    '- Check if the previous blocking issues were addressed.',
    '- Look for any new bugs or security issues introduced by the fixes.',
    '- Do NOT modify any files.',
    '',
    'You MUST start your response with one of:',
    '  APPROVED: — Issues are resolved, code is ready.',
    '  APPROVED WITH SUGGESTIONS: — Issues are resolved, with optional non-blocking suggestions.',
    '  CHANGES NEEDED: — There are still bugs, security holes, or logic errors that must be fixed.',
    '',
    'Only use CHANGES NEEDED for genuinely broken code — not style preferences.',
  ].join('\n')
}

function buildTestPrompt(
  task: { role: AgentRole; prompt: string; title: string },
  changes?: ChangeSet,
): string {
  const lines = [
    `Write tests for "${task.title}" and run the FULL test suite to catch regressions.`,
    '',
  ]

  if (changes && changes.files.length > 0) {
    const codeFiles = changes.files.filter((f) =>
      f.status !== 'deleted' &&
      (f.path.endsWith('.py') || f.path.endsWith('.ts') || f.path.endsWith('.tsx') || f.path.endsWith('.js') || f.path.endsWith('.jsx'))
    )
    const testFiles = codeFiles.filter((f) => f.path.includes('test') || f.path.includes('spec'))
    const srcFiles = codeFiles.filter((f) => !f.path.includes('test') && !f.path.includes('spec'))

    if (srcFiles.length > 0) {
      lines.push('## New/Modified Source Files (write tests for these)')
      for (const f of srcFiles) lines.push(`  - ${f.path} (${f.status})`)
      lines.push('')
    }
    if (testFiles.length > 0) {
      lines.push('## Test Files Already Modified')
      for (const f of testFiles) lines.push(`  - ${f.path}`)
      lines.push('')
    }
  }

  lines.push(
    'Original task description:',
    task.prompt,
    '',
    'You MUST do TWO things:',
    '',
    '## Step 1: Write new tests',
    '- Write tests for the new/modified source files listed above.',
    '- Use the project\'s existing test framework and patterns.',
    '- Cover: happy path, edge cases, error conditions.',
    '',
    '## Step 2: Run the FULL test suite',
    '- After writing your tests, run the ENTIRE existing test suite — not just your new tests.',
    '- For Python: `python -m pytest` (or the project\'s test command).',
    '- For TypeScript/JS: `npx vitest run` or `npx jest` (or the project\'s test command).',
    '- This catches regressions where new code breaks existing functionality.',
    '',
    '## Reporting',
    '- If ALL tests pass (new + existing), start with "TESTS PASSED:" and show the total count.',
    '- If ANY test fails, start with "TESTS FAILED:" and include the failure output.',
    '- Distinguish between failures in NEW tests vs failures in EXISTING tests (regressions).',
  )

  return lines.join('\n')
}

function buildReTestPrompt(task: { title: string }, cycle: number): string {
  return [
    `Re-run ALL tests for "${task.title}" after the author applied fixes (attempt ${cycle + 1}).`,
    '',
    '- Run the FULL test suite — both your new tests and all existing tests.',
    '- For Python: `python -m pytest`',
    '- For TypeScript/JS: `npx vitest run` or `npx jest`',
    '- If all tests pass, start your response with "TESTS PASSED:".',
    '- If any tests fail, start your response with "TESTS FAILED:" with failure details.',
    '- Distinguish between failures in new tests vs regressions in existing tests.',
  ].join('\n')
}

function buildFixPrompt(
  task: { role: AgentRole; title: string },
  feedbackType: 'review' | 'test',
  feedbackExec: AgentExecution,
): string {
  const source = feedbackType === 'review' ? 'code reviewer' : 'QA engineer'
  return [
    `The ${source} found issues with your work on "${task.title}".`,
    '',
    `You need to fix these issues. Read the ${source}'s feedback carefully and make the necessary changes.`,
    '',
    `The ${source}'s session ID is ${feedbackExec.sessionId} — their feedback is in that conversation.`,
    '',
    'Fix instructions:',
    '- Address every issue raised.',
    '- Do not introduce new issues while fixing.',
    '- After fixing, briefly summarize what you changed.',
  ].join('\n')
}

/* ── Detection ── */

/**
 * Determines if the reviewer found blocking issues.
 *
 * Protocol-first: trusts APPROVED / APPROVED WITH SUGGESTIONS / CHANGES NEEDED
 * prefixes. Falls back to negation-aware phrase matching — "no issues" counts
 * as approval, not an issue signal.
 */
function detectReviewIssues(execution: AgentExecution): boolean {
  if (execution.status !== 'done') return true

  const text = execution.responseText.trim()
  const lower = text.toLowerCase()

  // ── Protocol detection (reliable) ──
  // "APPROVED WITH SUGGESTIONS:" counts as passing — suggestions are non-blocking
  const prefixes = lower.slice(0, 200) // only check the beginning
  if (prefixes.startsWith('approved with suggestions:') || prefixes.startsWith('approved with suggestions.')) return false
  if (prefixes.startsWith('approved:') || prefixes.startsWith('approved.')) return false
  if (prefixes.startsWith('changes needed:') || prefixes.startsWith('changes needed.')) return true

  // Also check after a newline (some models prepend a preamble)
  if (/\napproved(\s+with\s+suggestions)?:/i.test(lower)) return false
  if (/\nchanges needed:/i.test(lower)) return true

  // ── Fallback heuristic (negation-aware) ──
  // Phrases that clearly indicate approval — including negated issue words
  const approvalPhrases = [
    'looks good', 'no issues', 'no concerns', 'no problems', 'no bugs',
    'no vulnerabilities', 'all good', 'lgtm', 'well done', 'clean code',
    'code is correct', 'ready to ship', 'ready to merge', 'approve',
    'no blocking', 'no critical', 'nothing to fix',
  ]
  // Phrases that clearly indicate blocking problems — must NOT be negated
  const blockingPhrases = [
    'must be fixed', 'will crash', 'will fail', 'data loss', 'security vulnerability',
    'sql injection', 'xss', 'race condition', 'null pointer', 'undefined reference',
    'breaks existing', 'regression', 'wrong behavior', 'logic error',
  ]

  const approvalHits = approvalPhrases.filter((p) => lower.includes(p)).length
  const blockingHits = blockingPhrases.filter((p) => lower.includes(p)).length

  // Default to passing — don't block on ambiguous output
  return blockingHits > approvalHits
}

/**
 * Determines if tests passed.
 *
 * Protocol-first: trusts TESTS PASSED / TESTS FAILED prefixes.
 * Falls back to negation-aware matching — "0 failures" = pass.
 */
function detectTestsPassed(execution: AgentExecution): boolean {
  if (execution.status !== 'done') return false

  const text = execution.responseText.trim()
  const lower = text.toLowerCase()

  // ── Protocol detection (reliable) ──
  const prefixes = lower.slice(0, 200)
  if (prefixes.startsWith('tests passed:') || prefixes.startsWith('tests passed.')) return true
  if (prefixes.startsWith('tests failed:') || prefixes.startsWith('tests failed.')) return false

  if (/\ntests passed:/i.test(lower)) return true
  if (/\ntests failed:/i.test(lower)) return false

  // ── Fallback heuristic (negation-aware) ──
  const passPatterns = [
    'all tests pass', 'all tests passed', 'tests pass', 'tests passed',
    'all passing', '0 failed', '0 failures', 'no failures', 'no errors',
    'passed successfully', 'suite passed', 'all green',
  ]
  const failPatterns = [
    /\d+ (tests? )?failed/,          // "3 tests failed"
    /\d+ (tests? )?failing/,         // "2 tests failing"
    /failure(s)? in/,                // "failures in test_auth"
    /assertion(s)? (failed|error)/,  // "assertion failed"
    /exit code [1-9]/,               // "exit code 1"
    /tests? failed/,                 // "test failed"
    /build failed/,
  ]

  const passHits = passPatterns.filter((p) => lower.includes(p)).length
  const failHits = failPatterns.filter((p) =>
    typeof p === 'string' ? lower.includes(p) : p.test(lower)
  ).length

  // Default to passing — don't re-trigger on ambiguous output
  return failHits <= passHits
}

/* ── Helpers ── */

function activityEvent(agentId: string, description: string): AgentEvent {
  return {
    type: 'activity',
    agentId,
    executionId: '',
    timestamp: new Date().toISOString(),
    data: { type: 'activity', description },
  }
}
