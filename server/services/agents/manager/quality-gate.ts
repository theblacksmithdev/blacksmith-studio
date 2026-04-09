import type { AgentExecuteOptions } from '../base-agent.js'
import type { AgentRole, AgentExecution, AgentEvent } from '../types.js'

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

const MAX_REVIEW_CYCLES = 3
const MAX_TEST_CYCLES = 3

type ExecuteFn = (options: AgentExecuteOptions & { role?: AgentRole }) => Promise<AgentExecution>
type EmitFn = (event: AgentEvent) => void

/** Check if a role produces code that should be reviewed and tested */
export function needsQualityGate(role: AgentRole): boolean {
  return CODE_PRODUCING_ROLES.has(role)
}

/**
 * Run the quality gate: review → fix loop, then test → fix loop.
 *
 * Flow:
 *   1. Code reviewer reviews the changes
 *   2. If issues found → original agent fixes → reviewer re-reviews (max 3 cycles)
 *   3. QA engineer writes/runs tests
 *   4. If tests fail → original agent fixes → QA re-runs (max 3 cycles)
 *
 * Returns the final state: all executions that happened during the gate.
 */
export async function runQualityGate(
  originalTask: { role: AgentRole; prompt: string; title: string },
  baseOptions: AgentExecuteOptions,
  execute: ExecuteFn,
  emit: EmitFn,
): Promise<QualityGateResult> {
  const executions: AgentExecution[] = []
  let passed = true

  // ── Review Loop ──
  emit(activityEvent('code-reviewer', `Reviewing ${originalTask.title}...`))

  let reviewIssues: string | null = null
  for (let cycle = 0; cycle < MAX_REVIEW_CYCLES; cycle++) {
    const reviewPrompt = cycle === 0
      ? buildReviewPrompt(originalTask)
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

    // Check if the review found issues by looking for "request changes" patterns
    const hasIssues = detectReviewIssues(reviewExec)

    if (!hasIssues) {
      emit(activityEvent('code-reviewer', `Review passed for ${originalTask.title}`))
      reviewIssues = null
      break
    }

    // Issues found — send back to original agent for fixes
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
      ? buildTestPrompt(originalTask)
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

    // Check if tests passed
    const testsPass = detectTestsPassed(testExec)

    if (testsPass) {
      emit(activityEvent('qa-engineer', `All tests pass for ${originalTask.title}`))
      testFailures = null
      break
    }

    // Tests failed — send back to original agent
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

function buildReviewPrompt(task: { role: AgentRole; prompt: string; title: string }): string {
  return [
    `Review the code changes made by the ${task.role} for the task: "${task.title}".`,
    '',
    'Original task description:',
    task.prompt,
    '',
    'Review instructions:',
    '- Read the files that were created or modified.',
    '- Check for correctness, security issues, performance problems, and adherence to project conventions.',
    '- If everything looks good, start your response with "APPROVED:" followed by a brief summary.',
    '- If there are issues, start your response with "CHANGES NEEDED:" followed by specific issues and how to fix them.',
    '- Be specific — include file paths and line references.',
    '- Do NOT modify any files. This is a read-only review.',
  ].join('\n')
}

function buildReReviewPrompt(task: { title: string }, cycle: number): string {
  return [
    `Re-review the code for "${task.title}" after the author applied fixes (attempt ${cycle + 1}).`,
    '',
    '- Check if the previous review issues were addressed.',
    '- Look for any new issues introduced by the fixes.',
    '- If everything looks good, start your response with "APPROVED:".',
    '- If there are still issues, start your response with "CHANGES NEEDED:" with specifics.',
    '- Do NOT modify any files.',
  ].join('\n')
}

function buildTestPrompt(task: { role: AgentRole; prompt: string; title: string }): string {
  return [
    `Write and run tests for the feature: "${task.title}" implemented by the ${task.role}.`,
    '',
    'Original task description:',
    task.prompt,
    '',
    'Testing instructions:',
    '- Use the project\'s existing test framework and patterns.',
    '- Write tests that cover the happy path, edge cases, and error conditions.',
    '- Run the tests after writing them.',
    '- If all tests pass, start your response with "TESTS PASSED:" followed by a summary.',
    '- If any tests fail, start your response with "TESTS FAILED:" followed by the failure details.',
  ].join('\n')
}

function buildReTestPrompt(task: { title: string }, cycle: number): string {
  return [
    `Re-run the tests for "${task.title}" after the author applied fixes (attempt ${cycle + 1}).`,
    '',
    '- Run the existing tests.',
    '- If all tests pass, start your response with "TESTS PASSED:".',
    '- If any tests fail, start your response with "TESTS FAILED:" with failure details.',
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

/* ── Detection (protocol-based, uses actual response text) ── */

/**
 * Detect whether a review execution found issues.
 * The reviewer is instructed to start with "APPROVED:" or "CHANGES NEEDED:".
 */
function detectReviewIssues(execution: AgentExecution): boolean {
  if (execution.status !== 'done') return true

  const text = execution.responseText.trim().toLowerCase()

  // Explicit protocol check
  if (text.startsWith('approved:') || text.startsWith('approved.') || text.includes('\napproved:')) {
    return false
  }
  if (text.startsWith('changes needed:') || text.startsWith('changes needed.') || text.includes('\nchanges needed:')) {
    return true
  }

  // Fallback: scan for approval/issue signals in the full text
  const approvalSignals = ['looks good', 'no issues', 'all good', 'lgtm', 'well done', 'clean code', 'no concerns', 'approve']
  const issueSignals = ['issue', 'problem', 'bug', 'vulnerability', 'missing', 'incorrect', 'should be', 'needs to', 'fix', 'change needed']

  const approvalCount = approvalSignals.filter((s) => text.includes(s)).length
  const issueCount = issueSignals.filter((s) => text.includes(s)).length

  // More approval signals than issue signals = approved
  return issueCount > approvalCount
}

/**
 * Detect whether test execution passed.
 * The QA agent is instructed to start with "TESTS PASSED:" or "TESTS FAILED:".
 */
function detectTestsPassed(execution: AgentExecution): boolean {
  if (execution.status !== 'done') return false

  const text = execution.responseText.trim().toLowerCase()

  // Explicit protocol check
  if (text.startsWith('tests passed:') || text.startsWith('tests passed.') || text.includes('\ntests passed:')) {
    return true
  }
  if (text.startsWith('tests failed:') || text.startsWith('tests failed.') || text.includes('\ntests failed:')) {
    return false
  }

  // Fallback: scan for pass/fail signals
  const passSignals = ['all tests pass', 'tests pass', 'all passing', '0 failed', 'no failures', 'passed successfully']
  const failSignals = ['test failed', 'tests failed', 'failure', 'assert', 'error', 'not passing', 'failing']

  const passCount = passSignals.filter((s) => text.includes(s)).length
  const failCount = failSignals.filter((s) => text.includes(s)).length

  // Default to passed if no clear signal (agent completed without reporting failures)
  return passCount >= failCount
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
