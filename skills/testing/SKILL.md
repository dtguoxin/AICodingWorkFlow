---
name: testing
description: Generate and execute test cases based on acceptance criteria and actual code changes. Stage 5 is independently executed by each sub-requirement owner for their assigned tasks. Produces test-cases.md and test-report.md, runs tests to verify implementation correctness, and triggers code fixes for failing tests. Use when the implementation phase is complete, the user asks to write or run tests, or during the testing phase of the AI Coding workflow.
---

# Testing

## Purpose

Generate concrete test cases from acceptance criteria, execute them against the implemented code, and produce a test report. Failing tests trigger a return to the implementation phase for fixes.

**Stage 5 is independently executed by each sub-requirement owner** for their assigned tasks.

## Trigger Scenarios

- User says "write tests" or "run tests for task-001"
- `implementation` skill has completed and code changes are written
- User asks to verify that implementation meets requirements
- Transitioning from implementation to code review

## Input

- `acceptance-criteria.md` from `users/{your-user}/{req-id}/02-technical-design/`
- `change-summary.md` from `users/{your-user}/{req-id}/04-implementation/task-{id}/`
- Actual code files that were modified
- `task-spec.md` from `users/{your-user}/{req-id}/03-task-plan/task-{id}/`

## Workflow

### Step 1: Load Project Configuration

Before generating tests, load the project-level configuration:

1. **Read `.meta/config/skill-overrides/testing.yaml`** (project overrides)
   - Check `min-coverage-percentage` — ensure tests meet this threshold
   - Check `require-edge-cases` — if true, edge case tests are mandatory
   - Check `require-error-cases` — if true, error scenario tests are mandatory
   - Check `test-naming-style` — follow descriptive or given_when_then style
   - Check `test-file-patterns` — place tests in correct locations

2. **Read `.meta/toolchain.json`** (available commands)
   - Get the exact test command (e.g., `vitest run`, `jest`, `pytest`)
   - Get coverage command if available

3. **Read `.meta/tech-stack.json`** (project tech stack)
   - Note test framework from `testing.framework`
   - Note frontend framework for UI test patterns

4. **Fallback**: If no project config exists, use defaults from this SKILL.md

### Step 2: Prepare Personal Workspace Directory

Before generating test artifacts, ensure the personal workspace directory exists. The `ai-workspace-init` skill does **not** create personal spaces — they are created on-demand by each stage Skill.

1. Determine the current user's personal workspace path: `users/{git-username}/{yyyy}/{req-id}/`
2. Check if `05-testing/` exists under this path
3. If not, create the directory structure:
   ```
   users/{git-username}/{yyyy}/{req-id}/
   └── 05-testing/
       └── task-{id}/
   ```
4. Report: "Personal workspace prepared at `users/{user}/{req-id}/05-testing/`."

### Step 3: Generate Test Cases

Based on `acceptance-criteria.md` and actual code, create `users/{your-user}/{req-id}/05-testing/task-{id}/test-cases.md`:

```markdown
# Test Cases

## Task Info
- Task ID: task-{id}
- Associated Criteria: AC-001, AC-002, ...

## Test Case List

### TC-001: {title}
- **Associated Criterion**: AC-001
- **Test Type**: [Unit/Integration/E2E]
- **Priority**: [High/Medium/Low]
- **Preconditions**: {preconditions}
- **Steps**:
  1. {step}
  2. {step}
- **Expected Result**: {expected}
- **Actual Result**: {filled after execution}
- **Status**: [Pass/Fail/Blocked]

## Boundary and Exception Scenarios

### TC-00X: {title}
- **Scenario**: {description}
- **Expected Behavior**: {expected behavior}
- **Status**: {status}
```

**Coverage rules**:
- Each acceptance criterion must have at least one test case
- Cover normal scenarios, edge cases, and error scenarios
- Frontend tasks: cover UI interactions and responsive behavior
- Backend tasks: cover parameter validation and error handling

### Step 4: Write Test Code

Generate test code files in `users/{your-user}/{req-id}/05-testing/task-{id}/test-code/`:

- Use the project's standard test framework (Jest, Vitest, pytest, etc.)
- Follow existing test conventions in the codebase
- Name files to match the convention: `{target-file}.test.{ext}` or in `__tests__/` directories

### Step 5: Execute Tests

Run the generated tests:

1. Execute test commands (e.g., `npm test`, `pytest`)
2. Capture output (pass/fail, error messages, stack traces)
3. Record execution time for each test

### Step 6: Generate Test Report

Create `users/{your-user}/{req-id}/05-testing/task-{id}/test-report.md`:

```markdown
# Test Report

## Executive Summary
- Task ID: task-{id}
- Execution Time: {timestamp}
- Total Cases: {total}
- Passed: {passed}
- Failed: {failed}
- Blocked: {blocked}
- Pass Rate: {percentage}

## Detailed Results

### Passed
| Case ID | Title | Execution Time |
|---------|-------|---------------|
| TC-001 | {title} | {time} |

### Failed
| Case ID | Title | Failure Reason | Suggested Fix |
|---------|-------|---------------|---------------|
| TC-00X | {title} | {reason} | {suggestion} |

## Coverage Statistics (if applicable)
- Line coverage: {percentage}
- Branch coverage: {percentage}
- Function coverage: {percentage}

## Conclusion and Recommendations
- Meets acceptance criteria: [Yes/No]
- Suggested fixes: {items}
- Can proceed to Stage 6 (Code Review): [Yes/No]
```

### Step 7: Handle Failures

If any tests fail:

1. **Analyze root cause**:
   - Requirement understanding deviation → return to requirement-analysis
   - Implementation omission → return to implementation phase
   - Test case error → fix test case and re-run

2. **Report to user**:
   > Tests failed:
   > - TC-00X: {failure reason}
   > - Root cause: {root cause category}
   > - Suggestion: {return to phase X / fix and re-run}

3. After fixes, re-run tests and update the test report

### Step 8: Report Completion

Inform the user:
- Test pass rate
- Any failures and their resolution status
- Recommended next step: proceed to `code-review` phase

## Quality Gates

- [ ] Each acceptance criterion has at least one corresponding test case
- [ ] Test cases cover normal, edge, and error scenarios
- [ ] `test-report.md` generated with pass rate and failure analysis
- [ ] All tests pass, or failing tests have clear fix plans
- [ ] Test code follows project test framework conventions

## Example

**User input:**
> Write and run tests for task-001

**Skill execution:**
1. Read acceptance-criteria.md from my workspace (3 criteria defined)
2. Generate 5 test cases (3 normal + 2 edge cases)
3. Write test code in `users/alice/REQ-2026-001/05-testing/task-001/test-code/`
4. Run tests: 4 pass, 1 fail
5. Generate test-report.md in my workspace
6. Report failure to user with fix suggestion
7. After fix, re-run: all 5 pass
8. Report: "All tests passed (5/5). Proceed to code review."
