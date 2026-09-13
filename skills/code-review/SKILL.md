---
name: code-review
description: Perform comprehensive code review using a three-track mechanism (automated checks, AI review against a predefined checklist, and human final review). Stage 6 is independently executed by each sub-requirement owner for their assigned tasks. Evaluates code robustness, security, and maintainability, produces a graded review-report.md with blocking and non-blocking issues, and tracks fixes. Use when the testing phase is complete, the user asks for a code review, or during the review phase of the AI Coding workflow.
---

# Code Review

## Purpose

Perform comprehensive code review using a three-track mechanism to ensure code quality, security, and maintainability before merge.

**Stage 6 is independently executed by each sub-requirement owner** for their assigned tasks.

## Trigger Scenarios

- User says "review code" or "code review for task-001"
- `testing` skill has completed and tests pass
- User asks to evaluate code quality or robustness
- Transitioning from testing to completion

## Input

- `change-summary.md` from `users/{your-user}/{req-id}/04-implementation/task-{id}/`
- `test-report.md` from `users/{your-user}/{req-id}/05-testing/task-{id}/`
- Actual code files that were modified
- Review checklist (from `.meta/templates/review-checklist-template.md` or project-defined)

## Workflow

### Track 1: Automated Checks

Run automated quality checks using commands from `.meta/toolchain.json`:

1. **Read `.meta/toolchain.json`** to get exact commands:
   - Lint command: `{lint-command}`
   - Type check command: `{type-check-command}`
   - Format check command: `{format-command}`

2. **Execute checks**:

| Check | Command | Pass Criteria |
|-------|---------|---------------|
| Lint | From toolchain.json | No errors |
| Type Check | From toolchain.json | No type errors |
| Format Check | From toolchain.json | No formatting issues |

If toolchain.json is missing, fall back to standard commands.

Record results in the review report.

### Track 2: AI Review

Evaluate the code against the review checklist:

1. **Read `.meta/config/skill-overrides/code-review.yaml`**
   - Load `custom-checks` and append to the default checklist
   - Apply any other overrides

2. **Evaluate against the complete checklist**:

**Checklist categories**:
1. **Robustness**
   - [ ] Error handling is complete (no bare catches, no ignored errors)
   - [ ] Input validation is thorough
   - [ ] No potential null/undefined access
   - [ ] Async operations have proper await/catch
   - [ ] Resources are released correctly

2. **Code Standards**
   - [ ] Naming follows project conventions
   - [ ] Comments are complete (complex logic, public APIs)
   - [ ] No debug code remnants
   - [ ] No dead code
   - [ ] Code formatting is correct

3. **Security**
   - [ ] No SQL injection risks
   - [ ] No XSS risks
   - [ ] No hardcoded sensitive information
   - [ ] Permission checks are complete

4. **Performance**
   - [ ] No obvious performance traps (e.g., queries in loops)
   - [ ] Large data scenarios are considered

5. **Maintainability**
   - [ ] Functions have single responsibilities
   - [ ] Code reuse is reasonable
   - [ ] Code is easy to understand and modify

6. **Architecture Baseline Compliance**
   - [ ] Code follows module boundaries defined in architecture baseline
   - [ ] Interface contracts are respected
   - [ ] No unauthorized cross-module dependencies

Classify each finding:
- **Blocking (B-xxx)**: Must fix before merge (affects correctness, security, or causes crashes)
- **Non-blocking (N-xxx)**: Should fix (affects quality but not functionality)

### Track 3: Human Final Review

After AI review, present findings to the user for final approval:

> Code review complete:
> - Automated checks: {lint/type/format status}
> - AI review: {N} blocking issues, {N} non-blocking suggestions
> - Architecture baseline compliance: {status}
> - Please review review-report.md and confirm business logic correctness

### Step 4: Prepare Personal Workspace Directory

Before generating review artifacts, ensure the personal workspace directory exists. The `ai-workspace-init` skill does **not** create personal spaces — they are created on-demand by each stage Skill.

1. Determine the current user's personal workspace path: `users/{git-username}/{yyyy}/{req-id}/`
2. Check if `06-review/` exists under this path
3. If not, create the directory structure:
   ```
   users/{git-username}/{yyyy}/{req-id}/
   └── 06-review/
       └── task-{id}/
   ```
4. Report: "Personal workspace prepared at `users/{user}/{req-id}/06-review/`."

### Step 5: Generate Review Report

Create `users/{your-user}/{req-id}/06-review/task-{id}/review-report.md`:

```markdown
# Review Report

## Review Basic Info
- Task ID: task-{id}
- Review Time: {timestamp}
- Reviewer: AI / {human reviewer}
- Sub-requirement Owner: {your-user}

## Automated Check Results

| Check | Status | Details |
|-------|--------|---------|
| Lint | [Pass/Fail] | {details} |
| Type Check | [Pass/Fail] | {details} |
| Format Check | [Pass/Fail] | {details} |

## AI Review Results

### Must Fix (Blocking)
| ID | Issue | Location | Suggested Fix |
|----|-------|----------|---------------|
| B-001 | {description} | {file:line} | {suggestion} |

### Suggested Fix (Non-blocking)
| ID | Issue | Location | Suggested Fix | Priority |
|----|-------|----------|---------------|----------|
| N-001 | {description} | {file:line} | {suggestion} | [High/Medium/Low] |

### Passed Items
- [ ] Code robustness
- [ ] Code standards
- [ ] Security
- [ ] Readability
- [ ] Architecture baseline compliance

## Human Final Review Conclusion
- [ ] AI review results reviewed
- [ ] Business logic correctness confirmed
- [ ] Final conclusion: [Pass / Conditional Pass / Reject]

## Fix Tracking

| Issue ID | Fix Status | Fix By | Verification |
|---------|-----------|--------|-------------|
| B-001 | [Fixed/Pending] | {who} | [Pass/Pending] |
```

### Step 6: Generate Review Checklist Execution

Create `users/{your-user}/{req-id}/06-review/task-{id}/review-checklist.md`:

```markdown
# Review Checklist Execution

## Code Robustness
- [ ] Error handling complete (no bare catches, no ignored errors)
- [ ] Input validation thorough
- [ ] No potential null/undefined access
- [ ] Async operations have proper await/catch
- [ ] Resources released correctly (connections, timers, etc.)

## Code Standards
- [ ] Naming follows project conventions
- [ ] Comments complete (complex logic, public APIs)
- [ ] No debug code remnants
- [ ] No dead code
- [ ] Code formatting correct

## Security
- [ ] No SQL injection risks
- [ ] No XSS risks
- [ ] No hardcoded sensitive information
- [ ] Permission checks complete

## Performance
- [ ] No obvious performance traps (e.g., queries in loops)
- [ ] Large data scenarios considered

## Maintainability
- [ ] Functions have single responsibilities
- [ ] Code reuse reasonable
- [ ] Easy to understand and modify

## Architecture Baseline Compliance
- [ ] Module boundaries respected
- [ ] Interface contracts followed
- [ ] No unauthorized cross-module dependencies
```

### Step 7: Handle Fixes

If code is sent back for fixes:

1. Update `review-report.md` fix tracking table
2. After fixes, re-run automated checks and AI review
3. Update the report with verification results

### Step 8: Update Requirement Status

When review passes:

1. Update `.meta/index.json`:
   - `status`: `in-progress` → `completed`
   - `completed-at`: `{timestamp}`
   - `updated-at`: `{timestamp}`
2. Optionally move workspace to `archive/` if retention policy requires

### Step 9: Report Completion

Inform the user:
- Review conclusion (pass / conditional pass / reject)
- Number of blocking vs non-blocking issues
- Architecture baseline compliance status
- Final status of the requirement

## Quality Gates

- [ ] Automated checks all pass (or failures are fixed)
- [ ] AI review evaluated all checklist items
- [ ] Architecture baseline compliance verified
- [ ] Review report contains graded issue list
- [ ] No unresolved blocking issues
- [ ] Human has performed final review and given clear conclusion

## Example

**User input:**
> Review code for task-001

**Skill execution:**
1. Run lint, type-check, format-check
2. Evaluate code against checklist (robustness, standards, security, performance, maintainability, baseline compliance)
3. Identify 1 blocking issue (missing input validation), 2 non-blocking issues (naming inconsistency, missing comment)
4. Generate review-report.md and review-checklist.md in my workspace
5. Report: "Review complete. 1 blocking issue found (B-001: missing input validation in src/api/login.ts:45). 2 non-blocking suggestions. Architecture baseline compliance: pass. Please fix B-001 before merge."
